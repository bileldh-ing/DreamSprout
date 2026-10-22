import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { isOverLimit, useAppStore } from '@/store/app-store';

const TICK_SEC = 30;
const EXEMPT = ['/goodnight', '/parent-gate', '/parents', '/onboarding'];

/** Counts foreground time and sends the child to the Goodnight screen when the parent limit is reached. */
export function useScreenTime() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    let active = AppState.currentState === 'active' || AppState.currentState == null;
    const sub = AppState.addEventListener('change', (s) => (active = s === 'active'));
    const id = setInterval(() => {
      if (active) useAppStore.getState().addScreenTime(TICK_SEC);
    }, TICK_SEC * 1000);
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [hydrated]);

  const over = useAppStore((s) => isOverLimit(s));
  useEffect(() => {
    if (hydrated && over && !EXEMPT.some((p) => pathname.startsWith(p))) {
      router.replace({ pathname: '/goodnight', params: { reason: 'limit' } });
    }
  }, [over, pathname, hydrated, router]);
}
