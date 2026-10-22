import { seedStories, storySchema, type Story, type WordTiming } from '@dreamsprout/content';
import { useQuery } from '@tanstack/react-query';
import { setRemoteTimings } from '@/content';
import { getSupabase } from './supabase';

interface RemotePage {
  page_index: number;
  text: string;
  scene_description: string;
  audio_duration_sec: number;
  word_timings: WordTiming[];
}
interface RemoteStory {
  id: string;
  title: string;
  origin: string;
  source: string;
  age_band: Story['ageBand'];
  minutes: number;
  tags: string[];
  moral: string;
  synopsis: string;
  characters: string;
  language: string;
  illustration_credit: string;
  illustration_kind: Story['illustration']['kind'];
  narration_credit: string;
  narration_voice: string;
  narration_kind: Story['narration']['kind'];
  content_licenses: { kind: Story['license']['kind']; name: string; holder: string; notes: string; url: string | null } | null;
  story_pages: RemotePage[];
}

/** Map a Supabase row into the shared Story shape; invalid rows are dropped, never shown half-broken. */
export function mapRemoteStory(r: RemoteStory): Story | null {
  if (!r.content_licenses) return null;
  const pages = [...r.story_pages].sort((a, b) => a.page_index - b.page_index);
  const candidate = {
    id: r.id,
    title: r.title,
    origin: r.origin,
    source: r.source,
    license: { ...r.content_licenses, url: r.content_licenses.url ?? undefined },
    ageBand: r.age_band,
    minutes: r.minutes,
    tags: r.tags,
    moral: r.moral,
    synopsis: r.synopsis,
    characters: r.characters,
    language: r.language,
    status: 'published' as const,
    illustration: { credit: r.illustration_credit, kind: r.illustration_kind },
    narration: { credit: r.narration_credit, voice: r.narration_voice, kind: r.narration_kind },
    pages: pages.map((p) => ({
      index: p.page_index,
      text: p.text,
      sceneDescription: p.scene_description || 'scene',
      image: `img/${r.id}-${p.page_index}.webp`,
      audio: `audio/${r.id}-${p.page_index}.mp3`,
      audioDurationSec: Number(p.audio_duration_sec),
      timingKey: `${r.id}-${p.page_index}`,
    })),
  };
  const parsed = storySchema.safeParse(candidate);
  if (!parsed.success) return null;
  for (const p of pages) if (p.word_timings?.length) setRemoteTimings(`${r.id}-${p.page_index}`, p.word_timings);
  return parsed.data;
}

/** Merge remote stories over the seed: same id → remote wins; new published stories are appended. */
export function mergeCatalog(seed: Story[], remote: Story[]): Story[] {
  const byId = new Map(seed.map((s) => [s.id, s]));
  for (const r of remote) byId.set(r.id, r);
  return [...byId.values()];
}

export async function fetchCatalog(): Promise<Story[]> {
  const sb = getSupabase();
  if (!sb) return seedStories;
  try {
    const { data, error } = await sb
      .from('stories')
      .select(
        'id,title,origin,source,age_band,minutes,tags,moral,synopsis,characters,language,illustration_credit,illustration_kind,narration_credit,narration_voice,narration_kind,content_licenses(kind,name,holder,notes,url),story_pages(page_index,text,scene_description,audio_duration_sec,word_timings)',
      )
      .eq('status', 'published');
    if (error || !data) return seedStories;
    const remote = (data as unknown as RemoteStory[]).map(mapRemoteStory).filter((s): s is Story => s !== null);
    return mergeCatalog(seedStories, remote);
  } catch {
    return seedStories;
  }
}

export function useCatalog() {
  const q = useQuery({ queryKey: ['catalog'], queryFn: fetchCatalog, initialData: seedStories, staleTime: 60 * 60 * 1000 });
  return q.data;
}

export function useStory(id: string | undefined): Story | undefined {
  const stories = useCatalog();
  return stories.find((s) => s.id === id);
}
