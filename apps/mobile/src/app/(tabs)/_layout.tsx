import { seedStories, tonightsPick } from '@dreamsprout/content';
import { Redirect, useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassTabBar, type TabItem } from '@/components/GlassTabBar';
import { useStrings } from '@/i18n';
import { useCatalog } from '@/lib/catalog';
import { selectActiveProfile, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export default function TabsLayout() {
  const t = useStrings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onboarded = useAppStore((s) => s.onboarded);
  const profile = useAppStore(selectActiveProfile);
  const stories = useCatalog();

  if (!onboarded) return <Redirect href="/onboarding" />;

  const items: TabItem[] = [
    { key: 'index', label: t.tabs.home, icon: 'home-outline', iconActive: 'home' },
    { key: 'library', label: t.tabs.library, icon: 'library-outline', iconActive: 'library' },
    { key: 'favorites', label: t.tabs.favorites, icon: 'heart-outline', iconActive: 'heart' },
  ];

  const renderBar = (props: TabBarProps) => {
    const active = props.state.routes[props.state.index]?.name ?? 'index';
    return (
      <GlassTabBar
        tabs={items}
        activeKey={active}
        bottomInset={insets.bottom}
        centerLabel={t.tabs.tonight}
        onSelect={(name) => {
          const route = props.state.routes.find((r) => r.name === name);
          if (route) props.navigateToTab(route.key);
        }}
        onCenter={() => {
          const pick = tonightsPick(stories.length ? stories : seedStories, new Date(), profile?.ageBand);
          if (pick) router.push({ pathname: '/reader/[id]', params: { id: pick.id } });
        }}
      />
    );
  };

  return (
    <Tabs tabBar={renderBar} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bgBottom } }}>
      <Tabs.Screen name="index" options={{ title: t.tabs.home }} />
      <Tabs.Screen name="library" options={{ title: t.tabs.library }} />
      <Tabs.Screen name="favorites" options={{ title: t.tabs.favorites }} />
    </Tabs>
  );
}
