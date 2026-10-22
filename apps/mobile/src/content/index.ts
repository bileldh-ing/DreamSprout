import { getPageTimings, type Story, type StoryPage, type WordTiming } from '@dreamsprout/content';
import type { ImageSource } from 'expo-image';
import { storyAudio, storyImages } from './assets.generated';
import { supabaseUrl } from '@/lib/supabase';

/** Timings fetched from the optional backend override bundled ones (keyed by timingKey). */
const remoteTimings = new Map<string, WordTiming[]>();

export function setRemoteTimings(key: string, words: WordTiming[]) {
  remoteTimings.set(key, words);
}

export function timingsFor(page: StoryPage): WordTiming[] {
  return remoteTimings.get(page.timingKey) ?? getPageTimings(page.timingKey);
}

function remoteUrl(bucket: 'illustrations' | 'narration', story: Story, page: StoryPage) {
  if (!supabaseUrl) return null;
  const ext = bucket === 'illustrations' ? page.image.split('.').pop() : page.audio.split('.').pop();
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${story.id}/${page.index}.${ext}`;
}

export function imageFor(story: Story, page: StoryPage): ImageSource | number | null {
  const local = storyImages[page.image];
  if (local !== undefined) return local;
  const uri = remoteUrl('illustrations', story, page);
  return uri ? { uri } : null;
}

export function audioFor(story: Story, page: StoryPage): number | { uri: string } | null {
  const local = storyAudio[page.audio];
  if (local !== undefined) return local;
  const uri = remoteUrl('narration', story, page);
  return uri ? { uri } : null;
}

export function coverFor(story: Story) {
  return imageFor(story, story.pages[0]!);
}

/** True when every page's media ships inside the app bundle (offline-ready without downloading). */
export function isBundled(story: Story): boolean {
  return story.pages.every((p) => storyImages[p.image] !== undefined && storyAudio[p.audio] !== undefined);
}
