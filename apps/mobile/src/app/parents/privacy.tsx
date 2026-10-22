import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { PillButton } from '@/components/Buttons';
import { Body, ParentScreen, Section } from '@/components/ParentUI';
import { useParentSession } from '@/features/parents/session';
import { useStrings } from '@/i18n';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

export default function Privacy() {
  const t = useStrings();
  const router = useRouter();
  const reset = useAppStore((s) => s.resetAll);
  const [done, setDone] = useState(false);
  const bullets = [
    '✓ No ads, no in-app purchases, no external links in the child experience',
    '✓ No microphone, camera, contacts, photos or location permissions',
    '✓ No analytics or third-party tracking SDKs',
    '✓ Child profiles: nickname + age band only, stored on this device',
    `✓ Cloud sync: ${isSupabaseConfigured() ? 'configured by a parent (published stories only)' : 'off'}`,
  ];
  return (
    <ParentScreen title={t.parents.privacy}>
      <Body>{t.parents.privacyBody}</Body>
      <Section>
        {bullets.map((b) => (
          <Text key={b} style={{ color: '#fff', fontSize: 15, paddingVertical: 8 }}>
            {b}
          </Text>
        ))}
      </Section>
      <View style={{ height: 54, marginTop: 24 }}>
        <PillButton
          label={t.parents.deleteData}
          icon="trash"
          testID="delete-data"
          onPress={() => {
            reset();
            useParentSession.getState().lock();
            setDone(true);
            setTimeout(() => router.replace('/onboarding'), 900);
          }}
        />
      </View>
      {done && <Text style={{ color: colors.success, marginTop: 12, textAlign: 'center' }}>{t.parents.deleteConfirm}</Text>}
    </ParentScreen>
  );
}
