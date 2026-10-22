import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, gradients } from '@/theme/tokens';

/** Midnight navy gradient with a sprinkle of static stars (no motion → safe for reduced motion). */
export function GradientBackground({ children, style, stars = true }: { children?: ReactNode; style?: ViewStyle; stars?: boolean }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%` as const,
        top: `${(i * 53) % 60}%` as const,
        size: (i % 3) + 1,
        opacity: 0.15 + ((i * 7) % 10) / 30,
      })),
    [],
  );
  return (
    <View style={[styles.fill, style]}>
      <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} />
      {stars &&
        dots.map((d, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={[styles.star, { left: d.left, top: d.top, width: d.size, height: d.size, opacity: d.opacity }]}
          />
        ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bgBottom },
  star: { position: 'absolute', borderRadius: 2, backgroundColor: '#fff' },
});
