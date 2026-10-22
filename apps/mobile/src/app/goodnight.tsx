import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PillButton } from '@/components/Buttons';
import { GradientBackground } from '@/components/GradientBackground';
import { format, useStrings } from '@/i18n';
import { useMotionAllowed } from '@/lib/motion';
import { isOverLimit, selectActiveProfile, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

export default function Goodnight() {
  const t = useStrings();
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const profile = useAppStore(selectActiveProfile);
  const over = useAppStore((s) => isOverLimit(s));
  const motion = useMotionAllowed();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (motion) glow.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [motion, glow]);
  const moonStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + glow.value * 0.05 }], opacity: 0.85 + glow.value * 0.15 }));

  const locked = reason === 'limit' && over;
  return (
    <GradientBackground>
      <View style={styles.darken} />
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.moon, moonStyle]}>
          <Text style={{ fontSize: 96 }} accessible={false}>
            🌙
          </Text>
        </Animated.View>
        <Text style={styles.title} accessibilityRole="header">
          {format(t.goodnight.title, { name: profile?.name ?? '' }).replace(/,\s*$/, '')}
        </Text>
        <Text style={styles.body}>{t.goodnight.body}</Text>
        <View style={{ height: 56, width: '100%', marginTop: 36 }}>
          {locked ? (
            <PillButton label={t.parents.open} icon="lock-closed" testID="goodnight-parents" onPress={() => router.push({ pathname: '/parent-gate', params: { next: '/parents/screen-time' } })} />
          ) : (
            <PillButton label={t.goodnight.back} icon="home" testID="goodnight-back" onPress={() => router.replace('/')} />
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  darken: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,10,0.45)' },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, maxWidth: 520, width: '100%', alignSelf: 'center' },
  moon: { shadowColor: colors.moon, shadowOpacity: 0.7, shadowRadius: 40, marginBottom: 20 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center' },
  body: { color: colors.textMuted, fontSize: 17, lineHeight: 25, textAlign: 'center', marginTop: 12 },
});
