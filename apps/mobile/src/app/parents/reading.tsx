import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/Buttons';
import { ParentScreen, Section, ToggleRow } from '@/components/ParentUI';
import { SLEEP_TIMER_OPTIONS } from '@/features/player/sleep-timer';
import { format, useStrings } from '@/i18n';
import { SPEEDS, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

export default function ReadingSettings() {
  const t = useStrings();
  const s = useAppStore((st) => st.settings);
  const update = useAppStore((st) => st.updateSettings);
  return (
    <ParentScreen title={t.parents.reading}>
      <Section title={t.parents.defaultSpeed}>
        <View style={styles.chips}>
          {SPEEDS.map((v) => (
            <Chip key={v} label={`${v}×`} selected={s.speed === v} onPress={() => update({ speed: v })} />
          ))}
        </View>
      </Section>
      <Section title={t.parents.defaultSubtitles}>
        <View style={styles.chips}>
          {(['word', 'sentence', 'off'] as const).map((m) => (
            <Chip
              key={m}
              label={m === 'word' ? t.reader.subWord : m === 'sentence' ? t.reader.subSentence : t.reader.subOff}
              selected={s.subtitles === m}
              onPress={() => update({ subtitles: m })}
            />
          ))}
        </View>
      </Section>
      <Section title={t.parents.defaultTimer}>
        <View style={styles.chips}>
          {SLEEP_TIMER_OPTIONS.map((o) => (
            <Chip
              key={String(o)}
              label={o === 'off' ? t.reader.timerOff : o === 'end-of-page' ? t.reader.timerEndPage : format(t.reader.timerMinutes, { n: o })}
              selected={s.sleepTimer === o}
              onPress={() => update({ sleepTimer: o })}
            />
          ))}
        </View>
      </Section>
      <Section>
        <ToggleRow label={t.parents.autoTurn} value={s.autoTurn} onChange={(v) => update({ autoTurn: v })} testID="setting-autoturn" />
        <ToggleRow label={t.reader.readMyself} value={s.readMyself} onChange={(v) => update({ readMyself: v })} testID="setting-readmyself" />
        <ToggleRow label={t.parents.reduceMotion} value={s.reduceMotion} onChange={(v) => update({ reduceMotion: v })} testID="setting-reduce-motion" />
        <ToggleRow label={t.parents.bedtimeDim} value={s.bedtimeDim} onChange={(v) => update({ bedtimeDim: v })} testID="setting-dim" />
      </Section>
      <Section title={t.parents.language}>
        <View style={styles.chips}>
          {(['system', 'en', 'fr'] as const).map((l) => (
            <Chip key={l} label={l === 'system' ? 'Auto' : l === 'en' ? 'English' : 'Français'} selected={s.language === l} onPress={() => update({ language: l })} testID={`lang-${l}`} />
          ))}
        </View>
        <Text style={styles.note}>{t.parents.languageNote}</Text>
      </Section>
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 8 },
  note: { color: colors.textFaint, fontSize: 12, paddingBottom: 8 },
});
