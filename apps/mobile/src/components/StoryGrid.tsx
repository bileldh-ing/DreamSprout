import type { Story } from '@dreamsprout/content';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useStrings } from '@/i18n';
import { colors } from '@/theme/tokens';
import { StoryCard } from './StoryCard';

/** Two-column (three on tablets) grid of tall story cards. */
export function StoryGrid({ stories, emptyText }: { stories: Story[]; emptyText?: string }) {
  const router = useRouter();
  const t = useStrings();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 900) - 40;
  const cols = contentWidth > 600 ? 3 : 2;
  const gap = 14;
  const cardW = Math.floor((contentWidth - gap * (cols - 1)) / cols);
  if (!stories.length) return <Text style={styles.empty}>{emptyText ?? t.home.noResults}</Text>;
  return (
    <View style={[styles.grid, { gap }]}>
      {stories.map((s) => (
        <StoryCard
          key={s.id}
          story={s}
          width={cardW}
          height={Math.round(cardW * 1.18)}
          subtitle={`${s.origin} · ${s.ageBand}`}
          onPress={() => router.push({ pathname: '/story/[id]', params: { id: s.id } })}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  empty: { color: colors.textMuted, fontSize: 15, textAlign: 'center', paddingVertical: 32 },
});
