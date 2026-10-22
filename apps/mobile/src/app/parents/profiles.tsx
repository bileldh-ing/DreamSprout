import { AGE_BANDS, type AgeBand } from '@dreamsprout/content';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip, PrimaryButton } from '@/components/Buttons';
import { ParentScreen, Section } from '@/components/ParentUI';
import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/app-store';
import { colors, HIT, radii } from '@/theme/tokens';

export default function Profiles() {
  const t = useStrings();
  const profiles = useAppStore((s) => s.profiles);
  const activeId = useAppStore((s) => s.activeProfileId);
  const setActive = useAppStore((s) => s.setActiveProfile);
  const remove = useAppStore((s) => s.removeProfile);
  const add = useAppStore((s) => s.addProfile);
  const [name, setName] = useState('');
  const [age, setAge] = useState<AgeBand>('4-6');

  return (
    <ParentScreen title={t.parents.profiles}>
      <Section>
        {profiles.map((p) => (
          <View key={p.id} style={styles.row}>
            <Pressable accessibilityRole="button" accessibilityLabel={p.name} onPress={() => setActive(p.id)} style={styles.who} testID={`profile-${p.name}`}>
              <Text style={{ fontSize: 28 }}>{p.avatar}</Text>
              <View>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>
                  {p.ageBand}
                  {p.id === activeId ? ` · ${t.parents.active}` : ''}
                </Text>
              </View>
            </Pressable>
            {profiles.length > 1 && <Chip label={t.parents.remove} onPress={() => remove(p.id)} testID={`remove-${p.name}`} />}
          </View>
        ))}
      </Section>
      <Section title={t.parents.addProfile}>
        <TextInput
          testID="new-profile-name"
          value={name}
          onChangeText={setName}
          maxLength={20}
          placeholder={t.onboarding.namePlaceholder}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          accessibilityLabel={t.onboarding.nameLabel}
        />
        <View style={styles.chips}>
          {AGE_BANDS.map((b) => (
            <Chip key={b} label={b} selected={age === b} onPress={() => setAge(b)} />
          ))}
        </View>
        <View style={{ height: 54, marginVertical: 10 }}>
          <PrimaryButton
            label={t.parents.addProfile}
            icon="add"
            disabled={!name.trim()}
            testID="add-profile"
            onPress={() => {
              add(name, age);
              setName('');
            }}
          />
        </View>
      </Section>
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: HIT + 12 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minHeight: HIT },
  name: { color: '#fff', fontSize: 17, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 13 },
  input: {
    color: '#fff',
    fontSize: 17,
    padding: 12,
    minHeight: 48,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginTop: 10,
  },
  chips: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
