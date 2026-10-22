import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Body, NavRow, ParentScreen, Section } from '@/components/ParentUI';
import { useParentSession } from '@/features/parents/session';
import { format, useStrings } from '@/i18n';
import { selectActiveProfile, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/tokens';

export default function ParentsHome() {
  const t = useStrings();
  const router = useRouter();
  const profile = useAppStore(selectActiveProfile);
  const profiles = useAppStore((s) => s.profiles.length);
  const limit = useAppStore((s) => s.settings.dailyLimitMin);
  const downloads = useAppStore((s) => Object.keys(s.downloads).length);
  const lock = useParentSession((s) => s.lock);

  return (
    <ParentScreen title={t.parents.title}>
      <Section>
        <NavRow icon="people" label={t.parents.profiles} value={`${profile?.avatar ?? ''} ${profiles}`} onPress={() => router.push('/parents/profiles')} testID="parents-profiles" />
        <NavRow icon="book" label={t.parents.reading} onPress={() => router.push('/parents/reading')} testID="parents-reading" />
        <NavRow icon="cloud-download" label={t.parents.downloads} value={String(downloads)} onPress={() => router.push('/parents/downloads')} testID="parents-downloads" />
        <NavRow
          icon="hourglass"
          label={t.parents.screenTime}
          value={limit ? format(t.parents.minutesPerDay, { n: limit }) : t.parents.noLimit}
          onPress={() => router.push('/parents/screen-time')}
          testID="parents-screen-time"
        />
        <NavRow icon="shield-checkmark" label={t.parents.privacy} onPress={() => router.push('/parents/privacy')} testID="parents-privacy" />
        <NavRow icon="document-text" label={t.parents.rights} onPress={() => router.push('/parents/rights')} testID="parents-rights" />
      </Section>
      <Section>
        <NavRow
          icon="lock-closed"
          label={t.common.done}
          onPress={() => {
            lock();
            router.replace('/');
          }}
          testID="parents-done"
        />
      </Section>
      <Body>
        <Text style={{ color: colors.textFaint }}>{format(t.parents.version, { v: Constants.expoConfig?.version ?? '1.0.0' })}</Text>
      </Body>
    </ParentScreen>
  );
}
