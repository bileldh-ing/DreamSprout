import { seedStories } from '@dreamsprout/content';
import { timingsFor } from '@/content';
import { fetchCatalog, mapRemoteStory, mergeCatalog } from '@/lib/catalog';

const remoteRow = {
  id: 'new-story',
  title: 'A New Story',
  origin: 'DreamSprout',
  source: 'DreamSprout Original',
  age_band: '3-5' as const,
  minutes: 2,
  tags: ['Calm'],
  moral: 'Rest well.',
  synopsis: 'A gentle new tale for testing.',
  characters: 'a sleepy cat',
  language: 'en',
  illustration_credit: 'Illustrated for DreamSprout',
  illustration_kind: 'static' as const,
  narration_credit: 'Narrated for DreamSprout',
  narration_voice: 'en-US-AnaNeural',
  narration_kind: 'tts' as const,
  content_licenses: { kind: 'original' as const, name: 'DreamSprout Original', holder: 'DreamSprout', notes: 'Original story.', url: null },
  story_pages: [
    {
      page_index: 1,
      text: 'The sleepy cat curled up.',
      scene_description: 'cat',
      audio_duration_sec: 2.5,
      word_timings: [[0.1, 0.2, 'The'] as [number, number, string]],
    },
  ],
};

describe('catalog sync', () => {
  it('falls back to the bundled seed when Supabase is not configured', async () => {
    expect(await fetchCatalog()).toBe(seedStories);
  });

  it('maps valid remote rows and registers remote timings', () => {
    const s = mapRemoteStory(remoteRow)!;
    expect(s.id).toBe('new-story');
    expect(s.pages[0]!.image).toBe('img/new-story-1.webp');
    expect(timingsFor(s.pages[0]!)).toEqual([[0.1, 0.2, 'The']]);
  });

  it('drops rows without a licence', () => {
    expect(mapRemoteStory({ ...remoteRow, content_licenses: null })).toBeNull();
  });

  it('merges remote over seed', () => {
    const remote = mapRemoteStory(remoteRow)!;
    const changed = { ...seedStories[0]!, title: 'Changed' };
    const merged = mergeCatalog(seedStories, [remote, changed]);
    expect(merged).toHaveLength(seedStories.length + 1);
    expect(merged.find((s) => s.id === seedStories[0]!.id)!.title).toBe('Changed');
  });
});
