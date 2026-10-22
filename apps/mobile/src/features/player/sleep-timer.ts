export type SleepTimerSetting = 'off' | 'end-of-page' | 5 | 10 | 15 | 20;
export const SLEEP_TIMER_OPTIONS: SleepTimerSetting[] = ['off', 'end-of-page', 5, 10, 15, 20];

export interface SleepTimerState {
  setting: SleepTimerSetting;
  startedAt: number | null;
  /** Fade duration before pause, ms. */
  fadeMs: number;
}

export interface SleepTimerTick {
  /** Volume multiplier 0..1 to apply to narration. */
  volume: number;
  /** True when the timer elapsed: pause and show the Goodnight screen. */
  expired: boolean;
  /** Remaining ms, or null for 'off' / 'end-of-page'. */
  remainingMs: number | null;
}

export function startSleepTimer(setting: SleepTimerSetting, now: number, fadeMs = 30_000): SleepTimerState {
  return { setting, startedAt: setting === 'off' ? null : now, fadeMs };
}

/**
 * Pure sleep-timer clock: returns the volume ramp and expiry for `now`.
 * Minute timers fade linearly over the last `fadeMs` and then expire.
 * 'end-of-page' expires when `pageEnded` is true (with a short fade handled by the caller).
 */
export function tickSleepTimer(state: SleepTimerState, now: number, pageEnded = false): SleepTimerTick {
  if (state.setting === 'off' || state.startedAt === null) return { volume: 1, expired: false, remainingMs: null };
  if (state.setting === 'end-of-page') return { volume: 1, expired: pageEnded, remainingMs: null };
  const total = state.setting * 60_000;
  const remaining = Math.max(0, total - (now - state.startedAt));
  if (remaining <= 0) return { volume: 0, expired: true, remainingMs: 0 };
  const fade = Math.min(state.fadeMs, total);
  const volume = remaining < fade ? remaining / fade : 1;
  return { volume: Math.max(0, Math.min(1, volume)), expired: false, remainingMs: remaining };
}

export function formatRemaining(ms: number | null): string {
  if (ms === null) return '';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
