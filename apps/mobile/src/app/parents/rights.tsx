import { StyleSheet, Text, View } from 'react-native';
import { Body, ParentScreen, Section } from '@/components/ParentUI';
import { useStrings } from '@/i18n';
import { useCatalog } from '@/lib/catalog';
import { colors } from '@/theme/tokens';

export default function Rights() {
  const t = useStrings();
  const stories = useCatalog();
  return (
    <ParentScreen title={t.parents.rights}>
      <Body>{t.parents.rightsBody}</Body>
      {stories.map((s) => (
        <Section key={s.id}>
          <View style={{ paddingVertical: 8 }}>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.line}>📖 {s.source}</Text>
            <Text style={styles.line}>⚖️ {s.license.name} — {s.license.notes}</Text>
            <Text style={styles.line}>🎨 {s.illustration.credit}</Text>
            <Text style={styles.line}>🎙️ {s.narration.credit}</Text>
          </View>
        </Section>
      ))}
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  line: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 2 },
});
