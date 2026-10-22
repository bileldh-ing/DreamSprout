import type { Story } from '@dreamsprout/content';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip, IconButton, tap } from '@/components/Buttons';
import { Glass } from '@/components/Glass';
import { HighlightedText } from '@/components/HighlightedText';
import { KenBurnsImage } from '@/components/KenBurnsImage';
import { audioFor, imageFor, timingsFor } from '@/content';
import { initialPlayerState, playerReducer } from '@/features/player/machine';
import { formatRemaining, SLEEP_TIMER_OPTIONS, startSleepTimer, tickSleepTimer, type SleepTimerSetting } from '@/features/player/sleep-timer';
import { findWordIndex, pageProgress, seekTimeForToken, sentenceStart, tokenIndexForTiming, tokenize } from '@/features/player/timing';
import { format, useStrings } from '@/i18n';
import { useStory } from '@/lib/catalog';
import { useMotionAllowed } from '@/lib/motion';
import { SPEEDS, useAppStore, type SubtitleMode } from '@/store/app-store';
import { colors, HIT, radii } from '@/theme/tokens';

export default function ReaderRoute() {
  const params = useLocalSearchParams<{ id: string; page?: string; preview?: string }>();
  const story = useStory(params.id);
  if (!story) return <Redirect href="/" />;
  const start = Math.min(Math.max(parseInt(params.page ?? '1', 10) || 1, 1), story.pages.length);
  return <Reader key={story.id} story={story} startPage={start} preview={params.preview === '1'} />;
}

function Reader({ story, startPage, preview }: { story: Story; startPage: number; preview: boolean }) {
  const t = useStrings();
  const router = useRouter();
  const motion = useMotionAllowed();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const saveProgress = useAppStore((s) => s.saveProgress);
  const readMyself = settings.readMyself;

  const [state, dispatch] = useReducer(playerReducer, undefined, () => initialPlayerState(story.pages.length, startPage, !readMyself));
  const page = story.pages[state.page - 1]!;
  const timings = useMemo(() => timingsFor(page), [page]);
  const tokens = useMemo(() => tokenize(page.text, timings), [page.text, timings]);

  const player = useAudioPlayer(audioFor(story, story.pages[startPage - 1]!), { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [showSettings, setShowSettings] = useState(false);
  const [timer, setTimer] = useState(() => startSleepTimer(settings.sleepTimer, Date.now()));
  const [remaining, setRemaining] = useState<number | null>(null);
  const firstPage = useRef(true);
  const endedHandled = useRef<number | null>(null);
  const timeRef = useRef(0);
  timeRef.current = status.currentTime;

  // ---- load audio for the current page (authoritative clock = audio player) ----
  useEffect(() => {
    endedHandled.current = null;
    if (!audioFor(story, page)) dispatch({ type: 'ERROR' });
    if (firstPage.current) {
      firstPage.current = false;
    } else {
      const src = audioFor(story, page);
      if (src) player.replace(src);
    }
    try {
      player.setPlaybackRate(settings.speed, 'high');
    } catch {
      /* rate unsupported on this platform */
    }
    if (state.autoplay && !readMyself) player.play();
    saveProgress({ storyId: story.id, page: state.page, positionSec: 0, completed: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on page change
  }, [state.page]);

  useEffect(() => {
    if (status.isLoaded) dispatch({ type: 'LOADED' });
  }, [status.isLoaded, state.page]);

  useEffect(() => {
    try {
      player.setPlaybackRate(settings.speed, 'high');
    } catch {
      /* ignore */
    }
  }, [settings.speed, player]);

  useEffect(() => {
    if (readMyself && status.playing) player.pause();
  }, [readMyself, status.playing, player]);

  // ---- throttled progress write ----
  useEffect(() => {
    const id = setInterval(() => {
      saveProgress({ storyId: story.id, page: state.page, positionSec: timeRef.current, completed: false });
    }, 5000);
    return () => clearInterval(id);
  }, [saveProgress, story.id, state.page]);

  // ---- stop audio when leaving the screen ----
  useFocusEffect(
    useCallback(
      () => () => {
        try {
          player.pause();
        } catch {
          /* already released */
        }
      },
      [player],
    ),
  );

  const finishStory = useCallback(() => {
    player.pause();
    if (preview) {
      router.back();
      return;
    }
    saveProgress({ storyId: story.id, page: story.pages.length, positionSec: 0, completed: true });
    router.replace({ pathname: '/end/[id]', params: { id: story.id } });
  }, [player, preview, router, saveProgress, story.id, story.pages.length]);

  const goodnight = useCallback(() => {
    player.pause();
    router.replace('/goodnight');
  }, [player, router]);

  // ---- narration finished ----
  useEffect(() => {
    if (!status.didJustFinish || endedHandled.current === state.page) return;
    endedHandled.current = state.page;
    if (tickSleepTimer(timer, Date.now(), true).expired && timer.setting === 'end-of-page') return goodnight();
    if (preview || state.page >= story.pages.length) {
      const id = setTimeout(finishStory, 1200);
      return () => clearTimeout(id);
    }
    if (settings.autoTurn) {
      const id = setTimeout(() => dispatch({ type: 'ENDED', autoTurn: true }), 1200);
      return () => clearTimeout(id);
    }
    dispatch({ type: 'ENDED', autoTurn: false });
    return undefined;
  }, [status.didJustFinish, state.page, story.pages.length, settings.autoTurn, preview, timer, finishStory, goodnight]);

  // ---- sleep timer with gentle fade ----
  useEffect(() => {
    if (timer.setting === 'off' || timer.setting === 'end-of-page') {
      player.volume = 1;
      setRemaining(null);
      return;
    }
    const id = setInterval(() => {
      const tick = tickSleepTimer(timer, Date.now());
      player.volume = tick.volume;
      setRemaining(tick.remainingMs);
      if (tick.expired) goodnight();
    }, 500);
    return () => clearInterval(id);
  }, [timer, player, goodnight]);

  // ---- derived highlight ----
  const activeTiming = readMyself ? -1 : findWordIndex(timings, status.currentTime);
  const activeToken = tokenIndexForTiming(tokens, activeTiming);
  const duration = status.duration || page.audioDurationSec;
  const progress = pageProgress(status.currentTime, duration);

  const goTo = useCallback(
    (n: number) => {
      tap();
      if (n > story.pages.length) return finishStory();
      if (n < 1) return;
      dispatch({ type: 'GOTO', page: n, autoplay: !readMyself && (status.playing || state.autoplay) });
    },
    [finishStory, readMyself, state.autoplay, status.playing, story.pages.length],
  );

  const togglePlay = () => {
    tap();
    if (status.playing) {
      player.pause();
      dispatch({ type: 'PAUSE' });
    } else {
      if (readMyself) updateSettings({ readMyself: false });
      if (duration && status.currentTime >= duration - 0.15) void player.seekTo(0);
      player.play();
      dispatch({ type: 'PLAY' });
    }
  };

  const seekTo = (sec: number) => {
    dispatch({ type: 'SEEK' });
    void player.seekTo(Math.max(0, sec)).then(() => dispatch({ type: 'SEEKED' }));
    if (!status.playing && !readMyself) player.play();
  };

  const onWordPress = readMyself
    ? undefined
    : (i: number) => {
        const s = seekTimeForToken(tokens, timings, i);
        if (s !== null) seekTo(s);
      };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -60) goTo(state.page + 1);
          else if (g.dx > 60) goTo(state.page - 1);
        },
      }),
    [goTo, state.page],
  );

  const [barW, setBarW] = useState(1);
  const subtitles: SubtitleMode = settings.subtitles;

  return (
    <View style={styles.root} {...pan.panHandlers}>
      <KenBurnsImage source={imageFor(story, page)} animKey={`${story.id}-${state.page}`} motion={motion} accessibilityLabel={page.sceneDescription} />
      <LinearGradient colors={['rgba(7,10,26,0.65)', 'rgba(7,10,26,0)']} style={styles.topScrim} pointerEvents="none" />
      <LinearGradient colors={['rgba(7,10,26,0)', 'rgba(7,10,26,0.75)', 'rgba(7,10,26,0.95)']} style={styles.bottomScrim} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <IconButton icon="close" label={t.reader.close} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} testID="reader-close" />
          <View style={styles.dots} accessibilityLabel={format(t.reader.page, { n: state.page, total: story.pages.length })}>
            {story.pages.map((p) => (
              <View key={p.index} style={[styles.dot, p.index === state.page && styles.dotOn]} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {remaining !== null && (
              <Glass radius={radii.pill} style={styles.timerPill}>
                <Ionicons name="moon" size={14} color={colors.moon} />
                <Text style={styles.timerText}>{formatRemaining(remaining)}</Text>
              </Glass>
            )}
            <IconButton icon="options" label={t.reader.subtitles} onPress={() => setShowSettings((v) => !v)} active={showSettings} testID="reader-settings" />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {showSettings && (
          <Glass style={styles.settings} strong testID="reader-settings-panel">
            <SettingRow label={t.reader.speed}>
              {SPEEDS.map((s) => (
                <Chip key={s} label={`${s}×`} selected={settings.speed === s} onPress={() => updateSettings({ speed: s })} testID={`speed-${s}`} />
              ))}
            </SettingRow>
            <SettingRow label={t.reader.subtitles}>
              {(['word', 'sentence', 'off'] as const).map((m) => (
                <Chip
                  key={m}
                  label={m === 'word' ? t.reader.subWord : m === 'sentence' ? t.reader.subSentence : t.reader.subOff}
                  selected={subtitles === m}
                  onPress={() => updateSettings({ subtitles: m })}
                  testID={`subs-${m}`}
                />
              ))}
            </SettingRow>
            <SettingRow label={t.reader.sleepTimer}>
              {SLEEP_TIMER_OPTIONS.map((o: SleepTimerSetting) => (
                <Chip
                  key={String(o)}
                  label={o === 'off' ? t.reader.timerOff : o === 'end-of-page' ? t.reader.timerEndPage : format(t.reader.timerMinutes, { n: o })}
                  selected={timer.setting === o}
                  onPress={() => setTimer(startSleepTimer(o, Date.now()))}
                  testID={`timer-${o}`}
                />
              ))}
            </SettingRow>
            <SettingRow label="">
              <Chip label={readMyself ? t.reader.readMyself : t.reader.narrated} selected={readMyself} onPress={() => updateSettings({ readMyself: !readMyself })} testID="toggle-read-myself" />
              <Chip label={t.reader.autoTurn} selected={settings.autoTurn} onPress={() => updateSettings({ autoTurn: !settings.autoTurn })} testID="toggle-autoturn" />
              <Chip label="🌙" selected={settings.bedtimeDim} onPress={() => updateSettings({ bedtimeDim: !settings.bedtimeDim })} testID="toggle-dim" />
            </SettingRow>
          </Glass>
        )}

        {subtitles !== 'off' || readMyself ? (
          <Glass style={styles.textPanel} intensity={30}>
            <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={{ padding: 18 }}>
              <HighlightedText tokens={tokens} activeToken={activeToken} mode={readMyself ? 'off' : subtitles} onWordPress={onWordPress} />
            </ScrollView>
          </Glass>
        ) : null}

        {state.phase === 'media_error' && <Text style={styles.error}>{t.reader.mediaError}</Text>}

        <View style={styles.controls}>
          {!readMyself && (
            <Pressable
              accessibilityRole="adjustable"
              accessibilityLabel={`${Math.round(progress * 100)}%`}
              onLayout={(e) => setBarW(e.nativeEvent.layout.width || 1)}
              onPress={(e) => seekTo((e.nativeEvent.locationX / barW) * duration)}
              style={styles.barHit}
              testID="reader-progress"
            >
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
              </View>
            </Pressable>
          )}
          <View style={styles.buttons}>
            <IconButton icon="play-skip-back" label={t.reader.prev} onPress={() => goTo(state.page - 1)} testID="reader-prev" />
            {!readMyself && (
              <IconButton icon="refresh" label="Replay sentence" onPress={() => seekTo(sentenceStart(tokens, timings, activeToken))} testID="reader-replay" />
            )}
            <Pressable accessibilityRole="button" accessibilityLabel={status.playing ? t.reader.pause : t.reader.play} onPress={togglePlay} testID="reader-play" style={styles.playWrap}>
              <LinearGradient colors={[colors.violet, colors.violetLight]} style={styles.play}>
                <Ionicons name={status.playing ? 'pause' : 'play'} size={34} color="#fff" style={!status.playing ? { marginLeft: 4 } : undefined} />
              </LinearGradient>
            </Pressable>
            {!readMyself && (
              <IconButton
                icon={settings.speed === 1 ? 'speedometer-outline' : 'speedometer'}
                label={`${t.reader.speed} ${settings.speed}×`}
                onPress={() => updateSettings({ speed: SPEEDS[(SPEEDS.indexOf(settings.speed) + 1) % SPEEDS.length]! })}
                testID="reader-speed"
              />
            )}
            <IconButton icon="play-skip-forward" label={t.reader.next} onPress={() => goTo(state.page + 1)} testID="reader-next" />
          </View>
          <Text style={styles.pageText}>
            {format(t.reader.page, { n: state.page, total: story.pages.length })}
            {!readMyself && settings.speed !== 1 ? ` · ${settings.speed}×` : ''}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      {!!label && <Text style={styles.settingLabel}>{label}</Text>}
      <View style={styles.settingChips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep, overflow: 'hidden' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  safe: { flex: 1, paddingHorizontal: 16, maxWidth: 820, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotOn: { width: 22, backgroundColor: '#fff' },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: HIT },
  timerText: { color: '#fff', fontWeight: '700', fontVariant: ['tabular-nums'] },
  settings: { padding: 14, marginBottom: 10, gap: 6 },
  settingRow: { gap: 4 },
  settingLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  settingChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  textPanel: { marginBottom: 10 },
  error: { color: colors.danger, textAlign: 'center', marginBottom: 8 },
  controls: { paddingBottom: 8 },
  barHit: { height: 24, justifyContent: 'center' },
  bar: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  barFill: { height: 5, backgroundColor: colors.highlight },
  buttons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 8 },
  playWrap: { width: 76, height: 76 },
  play: {
    flex: 1,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.violet,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  pageText: { color: colors.textMuted, textAlign: 'center', fontSize: 13, marginTop: 6 },
});
