import { AGE_BANDS, filterStories, type AgeBand } from '@dreamsprout/content';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '@/components/Buttons';
import { GradientBackground } from '@/components/GradientBackground';
import { StoryGrid } from '@/components/StoryGrid';
import { useStrings } from '@/i18n';
import { useCatalog } from '@/lib/catalog';
import { selectActiveProfile, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

export default function LibraryScreen() {
  const t = useStrings();
  const stories = useCatalog();
  const profile = useAppStore(selectActiveProfile);
  const [age, setAge] = useState<AgeBand | 'all'>(profile?.ageBand ?? 'all');
  const list = useMemo(() => filterStories(stories, { ageBand: age }), [stories, age]);

  return (
    <GradientBackground>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title} accessibilityRole="header">
            {t.library.title}
          </Text>
          <Text style={styles.label}>{t.library.ages}</Text>
          <View style={styles.chips}>
            <Chip label={t.library.allAges} selected={age === 'all'} onPress={() => setAge('all')} testID="age-all" />
            {AGE_BANDS.map((b) => (
              <Chip key={b} label={b} selected={age === b} onPress={() => setAge(b)} testID={`age-${b}`} />
            ))}
          </View>
          <Text style={styles.count}>{list.length} ✦</Text>
          <StoryGrid stories={list} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 140, maxWidth: 900, width: '100%', alignSelf: 'center' },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 16 },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginTop: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  count: { color: colors.textFaint, fontSize: 13, marginVertical: 12 },
});
