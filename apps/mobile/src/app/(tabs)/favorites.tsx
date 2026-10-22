import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Glass } from '@/components/Glass';
import { GradientBackground } from '@/components/GradientBackground';
import { StoryGrid } from '@/components/StoryGrid';
import { useStrings } from '@/i18n';
import { useCatalog } from '@/lib/catalog';
import { selectFavorites, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

export default function FavoritesScreen() {
  const t = useStrings();
  const stories = useCatalog();
  const favs = useAppStore(selectFavorites);
  const list = useMemo(() => favs.map((id) => stories.find((s) => s.id === id)).filter((s) => s !== undefined), [favs, stories]);

  return (
    <GradientBackground>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title} accessibilityRole="header">
            {t.favorites.title}
          </Text>
          {list.length === 0 ? (
            <Glass style={styles.empty}>
              <Ionicons name="heart-outline" size={40} color={colors.violetLight} />
              <Text style={styles.emptyText}>{t.favorites.empty}</Text>
            </Glass>
          ) : (
            <View style={{ marginTop: 16 }}>
              <StoryGrid stories={list} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 140, maxWidth: 900, width: '100%', alignSelf: 'center' },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 16 },
  empty: { marginTop: 24, padding: 28, alignItems: 'center', gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
});
