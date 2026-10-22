import { formatRemaining, startSleepTimer, tickSleepTimer } from '@/features/player/sleep-timer';

describe('sleep timer', () => {
  const t0 = 1_000_000;

  it('is inert when off', () => {
    const s = startSleepTimer('off', t0);
    expect(tickSleepTimer(s, t0 + 999_999)).toEqual({ volume: 1, expired: false, remainingMs: null });
  });

  it('keeps full volume until the fade window, then fades linearly and expires', () => {
    const s = startSleepTimer(5, t0, 30_000);
    expect(tickSleepTimer(s, t0 + 60_000).volume).toBe(1);
    const mid = tickSleepTimer(s, t0 + 5 * 60_000 - 15_000);
    expect(mid.volume).toBeCloseTo(0.5);
    expect(mid.expired).toBe(false);
    expect(tickSleepTimer(s, t0 + 5 * 60_000)).toEqual({ volume: 0, expired: true, remainingMs: 0 });
  });

  it('end-of-page expires only when the page ends', () => {
    const s = startSleepTimer('end-of-page', t0);
    expect(tickSleepTimer(s, t0 + 1).expired).toBe(false);
    expect(tickSleepTimer(s, t0 + 1, true).expired).toBe(true);
  });

  it('formats remaining time', () => {
    expect(formatRemaining(65_000)).toBe('1:05');
    expect(formatRemaining(null)).toBe('');
  });
});
