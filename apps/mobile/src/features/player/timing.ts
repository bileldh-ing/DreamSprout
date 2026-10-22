import type { WordTiming } from '@dreamsprout/content';

export interface Token {
  /** Display text including punctuation, e.g. `"Nobody`. */
  text: string;
  /** Index into the timings array, or -1 when the token has no narration timing. */
  timingIndex: number;
  /** Sentence number (0-based) the token belongs to. */
  sentence: number;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9']/g, '')
    .replace(/'/g, '');

/**
 * Split page text into display tokens and align each to a narration word timing.
 * Greedy alignment with a small look-ahead tolerates punctuation and minor TTS
 * differences; tokens that cannot be matched keep timingIndex -1 (never fabricated).
 */
export function tokenize(text: string, timings: WordTiming[]): Token[] {
  const parts = text.split(/\s+/).filter(Boolean);
  const tokens: Token[] = [];
  let ti = 0;
  let sentence = 0;
  for (const part of parts) {
    const n = norm(part);
    let match = -1;
    if (n) {
      for (let look = ti; look < Math.min(timings.length, ti + 4); look++) {
        if (norm(timings[look]![2]) === n) {
          match = look;
          break;
        }
      }
    }
    if (match >= 0) ti = match + 1;
    tokens.push({ text: part, timingIndex: match, sentence });
    if (/[.!?]["”’)]*$/.test(part)) sentence += 1;
  }
  return tokens;
}

/**
 * Index of the word being spoken at `timeSec` (binary search over start times).
 * Returns -1 before the first word. After a word ends, it stays highlighted until the next one starts.
 */
export function findWordIndex(timings: WordTiming[], timeSec: number): number {
  let lo = 0;
  let hi = timings.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (timings[mid]![0] <= timeSec + 1e-6) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

/** Token index for the active timing index (or -1). */
export function tokenIndexForTiming(tokens: Token[], timingIndex: number): number {
  if (timingIndex < 0) return -1;
  for (let i = 0; i < tokens.length; i++) if (tokens[i]!.timingIndex === timingIndex) return i;
  return -1;
}

/** Seek position (seconds) for tapping token `tokenIndex`: its own start, or the next timed token's start. */
export function seekTimeForToken(tokens: Token[], timings: WordTiming[], tokenIndex: number): number | null {
  for (let i = tokenIndex; i < tokens.length; i++) {
    const word = timings[tokens[i]!.timingIndex];
    if (word) return Math.max(0, word[0] - 0.05);
  }
  return null;
}

/** Start time of the sentence containing the active word (for "replay sentence"). */
export function sentenceStart(tokens: Token[], timings: WordTiming[], activeToken: number): number {
  if (activeToken < 0) return 0;
  const s = tokens[activeToken]!.sentence;
  const first = tokens.findIndex((t) => t.sentence === s && t.timingIndex >= 0);
  return first >= 0 ? (timings[tokens[first]!.timingIndex]?.[0] ?? 0) : 0;
}

/** Fraction (0..1) of narration progress on this page. */
export function pageProgress(timeSec: number, durationSec: number): number {
  if (!durationSec || durationSec <= 0) return 0;
  return Math.min(1, Math.max(0, timeSec / durationSec));
}
