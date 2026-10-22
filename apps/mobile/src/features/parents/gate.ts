export interface GateChallenge {
  a: number;
  b: number;
  answer: number;
  choices: number[];
}

export type Rng = () => number;

const int = (rng: Rng, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

/**
 * Multiplication challenge a young child is unlikely to solve (6–9 × 3–9) with
 * four shuffled choices. A parental gate is a friction step, not legal verifiable consent.
 */
export function createChallenge(rng: Rng = Math.random): GateChallenge {
  const a = int(rng, 6, 9);
  const b = int(rng, 3, 9);
  const answer = a * b;
  const set = new Set<number>([answer]);
  const offsets = [-10, -7, -6, -4, -3, 3, 4, 6, 7, 9, 10, 12];
  while (set.size < 4) {
    const candidate = answer + offsets[int(rng, 0, offsets.length - 1)]!;
    if (candidate > 0) set.add(candidate);
  }
  const choices = [...set];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = int(rng, 0, i);
    [choices[i], choices[j]] = [choices[j]!, choices[i]!];
  }
  return { a, b, answer, choices };
}

export interface GateState {
  failures: number;
  lockedUntil: number | null;
}

export const MAX_FAILURES = 3;
export const LOCK_MS = 30_000;

export function initialGateState(): GateState {
  return { failures: 0, lockedUntil: null };
}

export function isLocked(state: GateState, now: number): boolean {
  return state.lockedUntil !== null && now < state.lockedUntil;
}

/** Apply an answer. Three wrong answers lock the gate for 30 seconds. */
export function submitAnswer(
  state: GateState,
  challenge: GateChallenge,
  value: number,
  now: number,
): { state: GateState; passed: boolean } {
  if (isLocked(state, now)) return { state, passed: false };
  if (value === challenge.answer) return { state: initialGateState(), passed: true };
  const failures = state.failures + 1;
  if (failures >= MAX_FAILURES) return { state: { failures: 0, lockedUntil: now + LOCK_MS }, passed: false };
  return { state: { failures, lockedUntil: null }, passed: false };
}
