import { useReducedMotion } from 'react-native-reanimated';
import { useAppStore } from '@/store/app-store';

/** Motion is allowed unless the OS or a parent asked to reduce it. */
export function useMotionAllowed(): boolean {
  const system = useReducedMotion();
  const parent = useAppStore((s) => s.settings.reduceMotion);
  return !system && !parent;
}
