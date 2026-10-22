import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, HIT } from '@/theme/tokens';

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction && (
        <Pressable accessibilityRole="link" onPress={onAction} style={{ minHeight: HIT, justifyContent: 'center' }}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sectionAction: { color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
});
