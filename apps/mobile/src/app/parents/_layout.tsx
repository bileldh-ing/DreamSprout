import { Redirect, Stack, usePathname } from 'expo-router';
import { isParentUnlocked, useParentSession } from '@/features/parents/session';
import { colors } from '@/theme/tokens';

/** Every parents route requires a passed parental gate in this session. */
export default function ParentsLayout() {
  const unlockedAt = useParentSession((s) => s.unlockedAt);
  const pathname = usePathname();
  if (!isParentUnlocked(unlockedAt)) return <Redirect href={{ pathname: '/parent-gate', params: { next: pathname } }} />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBottom }, animation: 'slide_from_right' }} />;
}
