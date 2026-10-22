import { create } from 'zustand';

/** In-memory (never persisted) parent-gate session: unlocks the parents area for 10 minutes. */
export const PARENT_SESSION_MS = 10 * 60_000;

interface ParentSession {
  unlockedAt: number | null;
  unlock: (now?: number) => void;
  lock: () => void;
}

export const useParentSession = create<ParentSession>((set) => ({
  unlockedAt: null,
  unlock: (now = Date.now()) => set({ unlockedAt: now }),
  lock: () => set({ unlockedAt: null }),
}));

export function isParentUnlocked(unlockedAt: number | null, now = Date.now()): boolean {
  return unlockedAt !== null && now - unlockedAt < PARENT_SESSION_MS;
}
