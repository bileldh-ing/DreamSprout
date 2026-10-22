import { createChallenge, initialGateState, isLocked, LOCK_MS, submitAnswer } from '@/features/parents/gate';
import { isParentUnlocked, PARENT_SESSION_MS } from '@/features/parents/session';

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('parent gate', () => {
  it('creates a multiplication challenge with 4 unique choices including the answer', () => {
    for (let i = 1; i < 50; i++) {
      const c = createChallenge(seeded(i));
      expect(c.answer).toBe(c.a * c.b);
      expect(c.a).toBeGreaterThanOrEqual(6);
      expect(new Set(c.choices).size).toBe(4);
      expect(c.choices).toContain(c.answer);
      expect(c.choices.every((n) => n > 0)).toBe(true);
    }
  });

  it('passes on the right answer and resets failures', () => {
    const c = createChallenge(seeded(3));
    const r = submitAnswer({ failures: 2, lockedUntil: null }, c, c.answer, 0);
    expect(r.passed).toBe(true);
    expect(r.state).toEqual(initialGateState());
  });

  it('locks for 30s after three wrong answers', () => {
    const c = createChallenge(seeded(5));
    const wrong = c.answer + 1;
    let st = initialGateState();
    st = submitAnswer(st, c, wrong, 0).state;
    st = submitAnswer(st, c, wrong, 0).state;
    expect(isLocked(st, 0)).toBe(false);
    st = submitAnswer(st, c, wrong, 1000).state;
    expect(isLocked(st, 1000)).toBe(true);
    expect(submitAnswer(st, c, c.answer, 2000).passed).toBe(false);
    expect(isLocked(st, 1000 + LOCK_MS)).toBe(false);
    expect(submitAnswer(st, c, c.answer, 1000 + LOCK_MS).passed).toBe(true);
  });

  it('parent session expires', () => {
    expect(isParentUnlocked(null)).toBe(false);
    expect(isParentUnlocked(0, PARENT_SESSION_MS - 1)).toBe(true);
    expect(isParentUnlocked(0, PARENT_SESSION_MS)).toBe(false);
  });
});
