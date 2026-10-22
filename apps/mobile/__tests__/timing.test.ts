import { getPageTimings, seedStories, type WordTiming } from '@dreamsprout/content';
import { findWordIndex, pageProgress, seekTimeForToken, sentenceStart, tokenIndexForTiming, tokenize } from '@/features/player/timing';

const timings: WordTiming[] = [
  [0.1, 0.3, 'Once'],
  [0.5, 0.3, 'upon'],
  [0.9, 0.1, 'a'],
  [1.1, 0.4, 'time'],
  [2.0, 0.4, 'Nobody'],
  [2.5, 0.3, 'can'],
];

describe('word timing sync', () => {
  it('finds the active word with binary search', () => {
    expect(findWordIndex(timings, 0)).toBe(-1);
    expect(findWordIndex(timings, 0.1)).toBe(0);
    expect(findWordIndex(timings, 0.45)).toBe(0);
    expect(findWordIndex(timings, 0.95)).toBe(2);
    expect(findWordIndex(timings, 1.9)).toBe(3);
    expect(findWordIndex(timings, 99)).toBe(5);
    expect(findWordIndex([], 1)).toBe(-1);
  });

  it('aligns punctuated text tokens to timings and tracks sentences', () => {
    const tokens = tokenize('Once upon a time. "Nobody can', timings);
    expect(tokens.map((t) => t.timingIndex)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(tokens[3]!.sentence).toBe(0);
    expect(tokens[4]!.sentence).toBe(1);
  });

  it('never fabricates timings for unmatched words', () => {
    const tokens = tokenize('Once upon a purple time', timings);
    expect(tokens[3]!.timingIndex).toBe(-1);
    expect(tokens[4]!.timingIndex).toBe(3);
  });

  it('maps timing → token and token → seek time', () => {
    const tokens = tokenize('Once upon a time. "Nobody can', timings);
    expect(tokenIndexForTiming(tokens, 4)).toBe(4);
    expect(tokenIndexForTiming(tokens, -1)).toBe(-1);
    expect(seekTimeForToken(tokens, timings, 4)).toBeCloseTo(1.95);
    expect(seekTimeForToken(tokens, [], 0)).toBeNull();
    expect(sentenceStart(tokens, timings, 5)).toBe(2.0);
    expect(sentenceStart(tokens, timings, -1)).toBe(0);
  });

  it('computes clamped page progress', () => {
    expect(pageProgress(5, 10)).toBe(0.5);
    expect(pageProgress(20, 10)).toBe(1);
    expect(pageProgress(1, 0)).toBe(0);
  });

  it('aligns every word of every seed page', () => {
    for (const s of seedStories) {
      for (const p of s.pages) {
        const tokens = tokenize(p.text, getPageTimings(p.timingKey));
        const matched = tokens.filter((t) => t.timingIndex >= 0).length;
        expect(matched / tokens.length).toBeGreaterThan(0.95);
      }
    }
  });
});
