import { StyleSheet, View } from 'react-native';
import { Chip } from '@/components/Buttons';
import { Body, ParentScreen, Section } from '@/components/ParentUI';
import { format, useStrings } from '@/i18n';
import { dayKey, useAppStore } from '@/store/app-store';

const OPTIONS = [0, 15, 30, 45, 60, 90];

export default function ScreenTimeSettings() {
  const t = useStrings();
  const limit = useAppStore((s) => s.settings.dailyLimitMin);
  const update = useAppStore((s) => s.updateSettings);
  const st = useAppStore((s) => s.screenTime);
  const used = st.day === dayKey(new Date()) ? Math.floor(st.seconds / 60) : 0;
  return (
    <ParentScreen title={t.parents.screenTime}>
      <Body>{t.parents.screenTimeBody}</Body>
      <Section>
        <View style={styles.chips}>
          {OPTIONS.map((o) => (
            <Chip
              key={o}
              label={o ? format(t.parents.minutesPerDay, { n: o }) : t.parents.noLimit}
              selected={limit === o}
              onPress={() => update({ dailyLimitMin: o })}
              testID={`limit-${o}`}
            />
          ))}
        </View>
      </Section>
      <Body>{format(t.parents.usedToday, { n: used })}</Body>
    </ParentScreen>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 10 } });
