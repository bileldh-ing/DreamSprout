import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStrings } from '@/i18n';
import { colors } from '@/theme/tokens';
import { IconButton } from './Buttons';

export function ScreenHeader({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  const router = useRouter();
  const t = useStrings();
  return (
    <View style={styles.row}>
      <IconButton
        icon="chevron-back"
        label={t.common.back}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        testID="header-back"
      />
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  side: { minWidth: 44, alignItems: 'flex-end' },
});
