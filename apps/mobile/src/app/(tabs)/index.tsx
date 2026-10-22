import { filterStories, STORY_WORLDS, tonightsPick, type StoryWorld } from '@dreamsprout/content';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, tap } from '@/components/Buttons';
import { Glass } from '@/components/Glass';
import { GradientBackground } from '@/components/GradientBackground';
import { StoryCard } from '@/components/StoryCard';
import { SectionTitle } from '@/components/SectionTitle';
import { StoryGrid } from '@/components/StoryGrid';
import { coverFor } from '@/content';
import { format, useStrings } from '@/i18n';
import { useCatalog } from '@/lib/catalog';
import { selectActiveProfile, selectProgressMap, useAppStore } from '@/store/app-store';
import { colors, gradients, radii } from '@/theme/tokens';

export default function HomeScreen() {
  const t = useStrings();
  const router = useRouter();
  const stories = useCatalog();
  const profile = useAppStore(selectActiveProfile);
  const progress = useAppStore(selectProgressMap);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [world, setWorld] = useState<StoryWorld | 'all'>('all');

  const pick = useMemo(() => tonightsPick(stories, new Date(), profile?.ageBand), [stories, profile?.ageBand]);
  const filtered = useMemo(() => filterStories(stories, { query, world }), [stories, query, world]);
  const continueList = useMemo(
    () =>
      Object.values(progress)
        .filter((p) => !p.completed)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((p) => ({ p, s: stories.find((s) => s.id === p.storyId) }))
        .filter((x): x is { p: (typeof x)['p']; s: NonNullable<(typeof x)['s']> } => !!x.s)
        .slice(0, 6),
    [progress, stories],
  );

  const open = (id: string) => router.push({ pathname: '/story/[id]', params: { id } });

  return (
    <GradientBackground>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              {profile && <Text style={styles.hello}>{format(t.home.hello, { name: profile.name })}</Text>}
              <Text style={styles.hero} accessibilityRole="header">
                {t.home.title}
              </Text>
            </View>
            <IconButton icon="search" label={t.home.searchPlaceholder} onPress={() => setSearching((v) => !v)} active={searching} testID="home-search" />
            <Pressable
              testID="home-avatar"
              accessibilityRole="button"
              accessibilityLabel={t.parents.open}
              onPress={() => {
                tap();
                router.push({ pathname: '/parent-gate', params: { next: '/parents' } });
              }}
              style={styles.avatar}
            >
              <LinearGradient colors={gradients.primary} style={styles.avatarInner}>
                <Text style={{ fontSize: 24 }}>{profile?.avatar ?? '🌙'}</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {searching && (
            <Glass style={styles.search} radius={radii.md}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                testID="search-input"
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder={t.home.searchPlaceholder}
                placeholderTextColor={colors.textFaint}
                style={styles.searchInput}
                accessibilityLabel={t.home.searchPlaceholder}
                returnKeyType="search"
              />
              {!!query && <IconButton icon="close" label="Clear" onPress={() => setQuery('')} size={32} />}
            </Glass>
          )}

          {!query && pick && (
            <>
              <SectionTitle title={t.home.tonightsPick} />
              <Pressable
                testID="tonights-pick"
                accessibilityRole="button"
                accessibilityLabel={`${t.home.tonightsPick}: ${pick.title}`}
                onPress={() => open(pick.id)}
                style={styles.pick}
              >
                <Image source={coverFor(pick)} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient colors={gradients.cardScrim} locations={[0.2, 0.55, 1]} style={StyleSheet.absoluteFill} />
                <View style={styles.pickMeta}>
                  <View style={styles.pickBadge}>
                    <Ionicons name="moon" size={12} color={colors.moon} />
                    <Text style={styles.pickBadgeText}>
                      {pick.minutes} min · {pick.ageBand}
                    </Text>
                  </View>
                  <Text style={styles.pickTitle}>{pick.title}</Text>
                  <Text style={styles.pickSyn} numberOfLines={2}>
                    {pick.synopsis}
                  </Text>
                </View>
                <View pointerEvents="none" style={styles.pickBorder} />
              </Pressable>
            </>
          )}

          <SectionTitle title={t.home.worlds} action={t.home.viewAll} onAction={() => router.push('/library')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.worlds}>
            {(['all', ...STORY_WORLDS] as const).map((w) => {
              const sample = w === 'all' ? stories[0] : stories.find((s) => s.tags.includes(w));
              const selected = world === w;
              return (
                <Pressable
                  key={w}
                  testID={`world-${w}`}
                  accessibilityRole="button"
                  accessibilityLabel={t.worlds[w] ?? w}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    tap();
                    setWorld(w);
                  }}
                  style={styles.world}
                >
                  <View style={[styles.worldRing, selected && styles.worldRingOn]}>
                    {sample && <Image source={coverFor(sample)} style={styles.worldImg} contentFit="cover" />}
                  </View>
                  <Text style={[styles.worldLabel, selected && { color: '#fff' }]}>{t.worlds[w] ?? w}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {!query && continueList.length > 0 && (
            <>
              <SectionTitle title={t.home.continue} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 20 }}>
                {continueList.map(({ p, s }) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                    width={150}
                    height={190}
                    progress={(p.page - 1) / s.pages.length + 0.05}
                    subtitle={format(t.details.resume, { page: p.page })}
                    onPress={() => router.push({ pathname: '/reader/[id]', params: { id: s.id, page: String(p.page) } })}
                  />
                ))}
              </ScrollView>
            </>
          )}

          <SectionTitle title={world === 'all' ? t.home.all : (t.worlds[world] ?? world)} />
          <StoryGrid stories={filtered} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 140, maxWidth: 900, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  hello: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  hero: { color: colors.text, fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 52, height: 52, borderRadius: 26, padding: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  avatarInner: { flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginTop: 16, minHeight: 50, gap: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 12 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sectionAction: { color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
  pick: { height: 220, borderRadius: radii.xl, overflow: 'hidden', backgroundColor: '#20265a' },
  pickMeta: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  pickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  pickBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pickTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  pickSyn: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  pickBorder: { ...StyleSheet.absoluteFill, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.glassBorder },
  worlds: { gap: 14, paddingRight: 20 },
  world: { alignItems: 'center', width: 76 },
  worldRing: { width: 72, height: 72, borderRadius: 36, padding: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  worldRingOn: { backgroundColor: colors.violetLight },
  worldImg: { flex: 1, borderRadius: 33 },
  worldLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 6 },
});
