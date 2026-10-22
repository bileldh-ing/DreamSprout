import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, IconButton, PillButton, PrimaryButton } from '@/components/Buttons';
import { coverFor } from '@/content';
import { format, useStrings } from '@/i18n';
import { useStory } from '@/lib/catalog';
import { selectFavorites, selectProgressMap, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

export default function StoryDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = useStory(id);
  const t = useStrings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const favs = useAppStore(selectFavorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const progress = useAppStore(selectProgressMap);

  if (!story) return <Redirect href="/" />;
  const fav = favs.includes(story.id);
  const prog = progress[story.id];
  const resumePage = prog && !prog.completed ? prog.page : 1;
  const heroH = Math.min(height * 0.52, 520);

  return (
    <View style={styles.root}>
      <Image source={coverFor(story)} style={[styles.hero, { height: heroH }]} contentFit="cover" accessibilityLabel={story.pages[0]!.sceneDescription} />
      <LinearGradient colors={['rgba(11,15,36,0.5)', 'rgba(11,15,36,0)']} style={[styles.topScrim]} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <IconButton icon="chevron-back" label={t.common.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} testID="details-back" />
        <Text style={styles.headerTitle}>{t.details.title}</Text>
        <IconButton
          icon={fav ? 'heart' : 'heart-outline'}
          label={fav ? t.common.unfavorite : t.common.favorite}
          active={fav}
          onPress={() => toggleFavorite(story.id)}
          testID="details-favorite"
        />
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingTop: heroH - 48, paddingBottom: 130 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(26,31,75,0.0)', 'rgba(20,24,58,0.94)', '#0b0f24']} locations={[0, 0.12, 0.4]} style={styles.sheet}>
          <View style={styles.sheetInner}>
            <Text style={styles.title} accessibilityRole="header">
              {story.title}
            </Text>
            <Text style={styles.by}>
              {story.origin} • {format(t.details.ages, { band: story.ageBand })}
            </Text>
            <View style={styles.chips}>
              {story.tags.map((tag) => (
                <Chip key={tag} label={t.worlds[tag] ?? tag} />
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.stats}>
              <Stat icon="time-outline" label={format(t.details.mins, { n: story.minutes })} />
              <Text style={styles.dot}>•</Text>
              <Stat icon="book-outline" label={format(t.details.pages, { n: story.pages.length })} />
              <Text style={styles.dot}>•</Text>
              <Stat icon="cloud-done-outline" label={t.details.downloaded} />
            </View>
            <View style={styles.divider} />
            <Text style={styles.h2}>{format(t.details.about, { title: story.title })}</Text>
            <Text style={styles.body}>{story.synopsis}</Text>
            <Text style={[styles.h2, { marginTop: 20 }]}>{t.details.moral}</Text>
            <Text style={[styles.body, styles.moral]}>“{story.moral}”</Text>
            <Text style={[styles.h2, { marginTop: 20 }]}>{t.details.source}</Text>
            <Text style={styles.small}>{story.source}</Text>
            <Text style={styles.small}>{story.license.notes}</Text>
            <Text style={styles.small}>{story.illustration.credit}</Text>
            <Text style={styles.small}>{story.narration.credit}</Text>
          </View>
        </LinearGradient>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PillButton
          label={t.details.preview}
          icon="play-circle-outline"
          testID="details-preview"
          onPress={() => router.push({ pathname: '/reader/[id]', params: { id: story.id, preview: '1' } })}
        />
        <PrimaryButton
          label={resumePage > 1 ? format(t.details.resume, { page: resumePage }) : t.details.read}
          icon="book"
          testID="details-read"
          onPress={() => router.push({ pathname: '/reader/[id]', params: { id: story.id, page: String(resumePage) } })}
        />
      </View>
    </View>
  );
}

function Stat({ icon, label }: { icon: 'time-outline' | 'book-outline' | 'cloud-done-outline'; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <Text style={styles.statText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBottom },
  hero: { position: 'absolute', top: 0, left: 0, right: 0 },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  sheet: { borderTopLeftRadius: 36, borderTopRightRadius: 36, minHeight: 600 },
  sheetInner: { padding: 24, maxWidth: 760, width: '100%', alignSelf: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 12 },
  by: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.22)', marginVertical: 16 },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: colors.textMuted, fontSize: 14 },
  dot: { color: colors.textMuted },
  h2: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 23 },
  moral: { color: colors.moon, fontStyle: 'italic', fontSize: 17 },
  small: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginTop: 2 },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
});
