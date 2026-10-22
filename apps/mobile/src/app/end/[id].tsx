import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PillButton, PrimaryButton } from '@/components/Buttons';
import { GradientBackground } from '@/components/GradientBackground';
import { StoryCard } from '@/components/StoryCard';
import { imageFor } from '@/content';
import { useStrings } from '@/i18n';
import { useCatalog } from '@/lib/catalog';
import { useMotionAllowed } from '@/lib/motion';
import { colors, radii } from '@/theme/tokens';
import { ageBandsOverlap } from '@dreamsprout/content';

export default function EndScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stories = useCatalog();
  const story = stories.find((s) => s.id === id);
  const t = useStrings();
  const router = useRouter();
  const motion = useMotionAllowed();
  const next = useMemo(() => {
    if (!story) return undefined;
    const pool = stories.filter((s) => s.id !== story.id && ageBandsOverlap(s.ageBand, story.ageBand));
    return pool.find((s) => s.tags.some((tag) => story.tags.includes(tag))) ?? pool[0];
  }, [stories, story]);

  if (!story) return <Redirect href="/" />;
  const last = story.pages[story.pages.length - 1]!;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={motion ? ZoomIn.duration(600) : undefined} style={styles.art}>
          <Image source={imageFor(story, last)} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
          <LinearGradient colors={['rgba(11,15,36,0)', 'rgba(11,15,36,0.9)']} style={StyleSheet.absoluteFill} />
          <Text style={styles.theEnd} accessibilityRole="header">
            {t.end.title}
          </Text>
        </Animated.View>
        <Animated.View entering={motion ? FadeInDown.delay(300).duration(500) : undefined} style={styles.moralBox}>
          <Text style={styles.moralLabel}>{t.end.moral}</Text>
          <Text style={styles.moral}>“{story.moral}”</Text>
        </Animated.View>
        <View style={styles.row}>
          <PillButton
            label={t.end.again}
            icon="refresh"
            testID="end-again"
            onPress={() => router.replace({ pathname: '/reader/[id]', params: { id: story.id } })}
          />
          <PrimaryButton label={t.end.home} icon="home" testID="end-home" onPress={() => router.replace('/')} />
        </View>
        {next && (
          <View style={{ marginTop: 22 }}>
            <Text style={styles.nextLabel}>{t.end.next}</Text>
            <StoryCard story={next} height={120} onPress={() => router.replace({ pathname: '/story/[id]', params: { id: next.id } })} />
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20, maxWidth: 620, width: '100%', alignSelf: 'center', justifyContent: 'center' },
  art: { height: 280, borderRadius: radii.xl, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20 },
  theEnd: { color: '#fff', fontSize: 46, fontWeight: '800', letterSpacing: 1, textShadowColor: colors.violetGlow, textShadowRadius: 20 },
  moralBox: { marginTop: 20, alignItems: 'center' },
  moralLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  moral: { color: colors.moon, fontSize: 22, fontStyle: 'italic', textAlign: 'center', marginTop: 8, lineHeight: 30 },
  row: { flexDirection: 'row', gap: 12, marginTop: 26, height: 56 },
  nextLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '700', marginBottom: 8 },
});
