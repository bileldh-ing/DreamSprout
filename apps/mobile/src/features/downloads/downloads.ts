import type { Story } from '@dreamsprout/content';
import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { storyAudio, storyBytes, storyImages } from '@/content/assets.generated';

/**
 * Offline downloads. Seed stories already ship inside the app bundle; "downloading"
 * copies every page's illustration and narration into the app's document directory
 * so it survives cache eviction and works fully offline. Remote (Supabase) stories
 * are fetched over the network the same way. On web, assets are prefetched into the
 * browser cache.
 */
export function estimateBytes(story: Story): number {
  return storyBytes[story.id] ?? story.pages.length * 110_000;
}

function storyDir(storyId: string) {
  return new Directory(Paths.document, 'stories', storyId);
}

export async function downloadStory(story: Story): Promise<number> {
  const modules = story.pages.flatMap((p) => [storyImages[p.image], storyAudio[p.audio]]).filter((m): m is number => m !== undefined);
  const assets = await Promise.all(modules.map((m) => Asset.fromModule(m).downloadAsync()));
  if (Platform.OS === 'web') return estimateBytes(story);
  const dir = storyDir(story.id);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  let bytes = 0;
  for (const a of assets) {
    if (!a.localUri) continue;
    const src = new File(a.localUri);
    const dest = new File(dir, `${a.name}.${a.type}`);
    if (!dest.exists) src.copy(dest);
    bytes += dest.size ?? 0;
  }
  return bytes || estimateBytes(story);
}

export async function removeStoryDownload(storyId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const dir = storyDir(storyId);
    if (dir.exists) dir.delete();
  } catch {
    /* already gone */
  }
}
