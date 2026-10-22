import type { AgeBand, Story } from './schema';

export const STORY_WORLDS = ['Bedtime', 'Calm', 'Animals', 'Fables', 'Kindness', 'Adventure', 'Magic'] as const;
export type StoryWorld = (typeof STORY_WORLDS)[number];

const AGE_RANGES: Record<AgeBand, [number, number]> = { '3-5': [3, 5], '4-6': [4, 6], '6-8': [6, 8] };

/** True when two age bands overlap (a 4-6 child can enjoy 3-5 and 6-8 overlap years). */
export function ageBandsOverlap(a: AgeBand, b: AgeBand): boolean {
  const [a0, a1] = AGE_RANGES[a];
  const [b0, b1] = AGE_RANGES[b];
  return a0 <= b1 && b0 <= a1;
}

export interface StoryFilter {
  query?: string;
  ageBand?: AgeBand | 'all';
  world?: StoryWorld | 'all';
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function filterStories(stories: Story[], f: StoryFilter): Story[] {
  const q = f.query ? normalize(f.query.trim()) : '';
  return stories.filter((s) => {
    if (s.status !== 'published') return false;
    if (f.ageBand && f.ageBand !== 'all' && s.ageBand !== f.ageBand) return false;
    if (f.world && f.world !== 'all' && !s.tags.includes(f.world)) return false;
    if (q) {
      const hay = normalize([s.title, s.synopsis, s.origin, s.moral, ...s.tags].join(' '));
      return q.split(/\s+/).every((t) => hay.includes(t));
    }
    return true;
  });
}

/** Deterministic "Tonight's Pick": a calm story suited to the child's age, rotating daily. */
export function tonightsPick(stories: Story[], date: Date, ageBand?: AgeBand): Story | undefined {
  const pool = stories.filter(
    (s) =>
      s.status === 'published' &&
      (s.tags.includes('Calm') || s.tags.includes('Bedtime') || s.tags.includes('Kindness')) &&
      (!ageBand || ageBandsOverlap(ageBand, s.ageBand)),
  );
  const list = pool.length ? pool : stories;
  if (!list.length) return undefined;
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return list[day % list.length];
}

export function totalNarrationSeconds(story: Story): number {
  return story.pages.reduce((sum, p) => sum + p.audioDurationSec, 0);
}

export function wordCount(story: Story): number {
  return story.pages.reduce((sum, p) => sum + p.text.split(/\s+/).filter(Boolean).length, 0);
}
