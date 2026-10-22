import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, gradients, HIT, radii } from '@/theme/tokens';
import { Glass } from './Glass';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function tap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => undefined);
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, icon, style, accessibilityHint, testID, disabled }: ButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.btnWrap, style, { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }]}
    >
      <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, styles.glow]}>
        {icon && <Ionicons name={icon} size={20} color="#fff" />}
        <Text style={styles.primaryText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function PillButton({ label, onPress, icon, style, accessibilityHint, testID }: ButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.btnWrap, style, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.btn, { backgroundColor: colors.pill }]}>
        {icon && <Ionicons name={icon} size={20} color={colors.pillText} />}
        <Text style={styles.pillText}>{label}</Text>
      </View>
    </Pressable>
  );
}

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children?: ReactNode;
}

/** Circular glass icon button with a 44pt minimum target. */
export function IconButton({ icon, label, onPress, size = HIT, active, style, testID }: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active !== undefined ? { selected: active } : undefined}
      hitSlop={8}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [{ width: Math.max(size, HIT), height: Math.max(size, HIT), opacity: pressed ? 0.75 : 1 }, style]}
    >
      <Glass radius={radii.pill} strong={active} style={styles.iconInner}>
        <Ionicons name={icon} size={Math.round(Math.max(size, HIT) * 0.46)} color={active ? colors.highlight : '#fff'} />
      </Glass>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, testID }: { label: string; selected?: boolean; onPress?: () => void; testID?: string }) {
  const content = (
    <View style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={{ minHeight: HIT, justifyContent: 'center' }}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btnWrap: { minHeight: 54, flex: 1 },
  btn: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  glow: { shadowColor: colors.violet, shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  pillText: { color: colors.pillText, fontSize: 17, fontWeight: '700' },
  iconInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFill,
    alignSelf: 'flex-start',
  },
  chipSelected: { backgroundColor: colors.violet, borderColor: colors.violetLight },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
});
