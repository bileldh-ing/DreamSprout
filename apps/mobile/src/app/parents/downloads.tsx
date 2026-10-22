import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Chip, PillButton, PrimaryButton } from '@/components/Buttons';
import { Body, ParentScreen, Section } from '@/components/ParentUI';
import { downloadStory, estimateBytes, removeStoryDownload } from '@/features/downloads/downloads';
import { format, useStrings } from '@/i18n';
import { useCatalog } from '@/lib/catalog';
import { useAppStore } from '@/store/app-store';
import { colors, HIT } from '@/theme/tokens';

const mb = (b: number) => (b / 1_048_576).toFixed(1);

export default function Downloads() {
  const t = useStrings();
  const stories = useCatalog();
  const downloads = useAppStore((s) => s.downloads);
  const mark = useAppStore((s) => s.markDownloaded);
  const unmark = useAppStore((s) => s.removeDownload);
  const clear = useAppStore((s) => s.clearDownloads);
  const [busy, setBusy] = useState<string | null>(null);
  const total = Object.values(downloads).reduce((n, d) => n + d.bytes, 0);

  const download = async (id: string) => {
    const story = stories.find((s) => s.id === id);
    if (!story) return;
    setBusy(id);
    try {
      mark(id, await downloadStory(story));
    } catch {
      /* keep the bundled copy; nothing to mark */
    } finally {
      setBusy(null);
    }
  };

  return (
    <ParentScreen title={t.parents.downloads}>
      <Body>{format(t.parents.storage, { mb: mb(total) })}</Body>
      <View style={styles.actions}>
        <PrimaryButton
          label={t.parents.downloadAll}
          icon="cloud-download"
          testID="download-all"
          onPress={async () => {
            for (const s of stories) if (!downloads[s.id]) await download(s.id);
          }}
        />
        <PillButton
          label={t.parents.removeAll}
          icon="trash"
          testID="remove-all"
          onPress={async () => {
            for (const id of Object.keys(downloads)) await removeStoryDownload(id);
            clear();
          }}
        />
      </View>
      <Section>
        {stories.map((s) => {
          const d = downloads[s.id];
          return (
            <View key={s.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.meta}>{mb(d?.bytes ?? estimateBytes(s))} MB</Text>
              </View>
              {busy === s.id ? (
                <ActivityIndicator color={colors.violetLight} />
              ) : d ? (
                <Chip
                  label={`✓ ${t.parents.remove}`}
                  selected
                  testID={`dl-remove-${s.id}`}
                  onPress={async () => {
                    await removeStoryDownload(s.id);
                    unmark(s.id);
                  }}
                />
              ) : (
                <Chip label={t.parents.download} testID={`dl-${s.id}`} onPress={() => void download(s.id)} />
              )}
            </View>
          );
        })}
      </Section>
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, height: 54 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: HIT + 10, gap: 10 },
  title: { color: '#fff', fontSize: 15, fontWeight: '600' },
  meta: { color: colors.textFaint, fontSize: 12 },
});
