import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, HIT } from '@/theme/tokens';
import { tap, type IconName } from './Buttons';
import { Glass } from './Glass';
import { GradientBackground } from './GradientBackground';
import { ScreenHeader } from './ScreenHeader';

export function ParentScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GradientBackground stars={false}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title={title} />
        <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 18 }}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <Glass style={styles.card}>{children}</Glass>
    </View>
  );
}

export function NavRow({ icon, label, onPress, testID, value }: { icon: IconName; label: string; onPress: () => void; testID?: string; value?: string }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={22} color={colors.violetLight} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

export function ToggleRow({ label, value, onChange, testID }: { label: string; value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        testID={testID}
        accessibilityLabel={label}
        value={value}
        onValueChange={(v) => {
          tap();
          onChange(v);
        }}
        trackColor={{ true: colors.violet, false: 'rgba(255,255,255,0.2)' }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 60, maxWidth: 760, width: '100%', alignSelf: 'center' },
  sectionTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { paddingHorizontal: 16, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: HIT + 8, paddingVertical: 6 },
  rowLabel: { color: '#fff', fontSize: 16, flex: 1 },
  rowValue: { color: colors.textMuted, fontSize: 14 },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 22, paddingVertical: 10 },
});
