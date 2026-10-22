import { describe, expect, it } from 'vitest';
import {
  ageBandsOverlap,
  filterStories,
  getPageTimings,
  getStory,
  seedStories,
  seedTimings,
  tonightsPick,
  totalNarrationSeconds,
  validateLibrary,
  wordCount,
} from '../src';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

describe('seed library', () => {
  it('validates cleanly', () => {
    const res = validateLibrary(seedStories, seedTimings);
    expect(res.issues).toEqual([]);
    expect(res.ok).toBe(true);
    expect(res.stories).toHaveLength(20);
  });

  it('has one unique image and audio file per page', () => {
    const imgs = seedStories.flatMap((s) => s.pages.map((p) => p.image));
    const audio = seedStories.flatMap((s) => s.pages.map((p) => p.audio));
    expect(new Set(imgs).size).toBe(imgs.length);
    expect(new Set(audio).size).toBe(audio.length);
  });

  it('looks up stories and timings', () => {
    const s = getStory('lion-mouse');
    expect(s?.title).toBe('The Lion and the Mouse');
    expect(getPageTimings('lion-mouse-1').length).toBeGreaterThan(10);
    expect(getPageTimings('nope')).toEqual([]);
    expect(totalNarrationSeconds(s!)).toBeGreaterThan(20);
    expect(wordCount(s!)).toBeGreaterThan(50);
  });
});

describe('validateLibrary failures', () => {
  it('fails when a story lacks a source', () => {
    const bad = clone(seedStories);
    bad[0]!.source = '';
    const res = validateLibrary(bad, seedTimings);
    expect(res.ok).toBe(false);
    expect(res.issues[0]?.storyId).toBe(bad[0]!.id);
  });

  it('fails when a story lacks a licence', () => {
    const bad = clone(seedStories) as unknown as Array<Record<string, unknown>>;
    delete bad[1]!.license;
    expect(validateLibrary(bad, seedTimings).ok).toBe(false);
  });

  it('fails when a page lacks image or audio', () => {
    const bad = clone(seedStories);
    (bad[2]!.pages[0] as { image: string }).image = '';
    expect(validateLibrary(bad, seedTimings).ok).toBe(false);
    const bad2 = clone(seedStories);
    (bad2[2]!.pages[1] as { audio: string }).audio = '';
    expect(validateLibrary(bad2, seedTimings).ok).toBe(false);
  });

  it('fails when timings are missing', () => {
    const t = clone(seedTimings);
    delete t['tortoise-hare-2'];
    const res = validateLibrary(seedStories, t);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => i.message.includes('tortoise-hare-2'))).toBe(true);
  });

  it('fails when an asset file is missing on disk', () => {
    const res = validateLibrary(seedStories, seedTimings, { assetExists: (p) => !p.endsWith('goldilocks-3.webp') });
    expect(res.ok).toBe(false);
    expect(res.issues).toHaveLength(1);
  });

  it('fails on non-monotonic timings', () => {
    const t = clone(seedTimings);
    t['pip-star-1'] = [
      [2, 0.3, 'b'],
      [1, 0.3, 'a'],
    ];
    expect(validateLibrary(seedStories, t).ok).toBe(false);
  });
});

describe('discovery helpers', () => {
  it('filters by age, world and query (accent-insensitive)', () => {
    expect(filterStories(seedStories, { ageBand: '6-8' }).every((s) => s.ageBand === '6-8')).toBe(true);
    expect(filterStories(seedStories, { world: 'Calm' }).every((s) => s.tags.includes('Calm'))).toBe(true);
    expect(filterStories(seedStories, { query: 'TORTOISE' }).map((s) => s.id)).toContain('tortoise-hare');
    expect(filterStories(seedStories, { query: 'zzzz' })).toHaveLength(0);
  });

  it('age bands overlap sensibly', () => {
    expect(ageBandsOverlap('3-5', '4-6')).toBe(true);
    expect(ageBandsOverlap('3-5', '6-8')).toBe(false);
  });

  it("tonight's pick is deterministic per day and calm", () => {
    const d = new Date(2026, 9, 22);
    const a = tonightsPick(seedStories, d, '3-5');
    expect(a).toBe(tonightsPick(seedStories, d, '3-5'));
    expect(a!.tags.some((t) => ['Calm', 'Bedtime', 'Kindness'].includes(t))).toBe(true);
    expect(tonightsPick([], d)).toBeUndefined();
  });
});
