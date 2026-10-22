import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '@/theme/tokens';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  radius?: number;
  strong?: boolean;
  testID?: string;
}

/** Liquid-glass panel: background blur + translucent white fill + thin light border. */
export function Glass({ children, style, intensity = 40, radius = radii.lg, strong = false, testID }: Props) {
  return (
    <View testID={testID} style={[styles.wrap, { borderRadius: radius }, style]}>
      <BlurView intensity={intensity} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, backgroundColor: strong ? colors.glassFillStrong : colors.glassFill, borderColor: colors.glassBorder },
          styles.border,
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  border: { borderWidth: StyleSheet.hairlineWidth * 2 },
});
