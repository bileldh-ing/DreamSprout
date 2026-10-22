import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setAudioModeAsync } from 'expo-audio';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useScreenTime } from '@/features/screen-time/useScreenTime';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Shell() {
  useScreenTime();
  const dim = useAppStore((s) => s.settings.bedtimeDim);
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBottom }, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="story/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reader/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="end/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="goodnight" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="parent-gate" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
      {dim && <View pointerEvents="none" style={styles.dim} testID="bedtime-dim" />}
    </View>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, networkMode: 'offlineFirst' } } }));
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        {hydrated ? <Shell /> : <View style={styles.root} />}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBottom },
  dim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,4,20,0.42)' },
});
