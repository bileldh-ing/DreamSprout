import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AgeBand } from '@dreamsprout/content';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SleepTimerSetting } from '@/features/player/sleep-timer';

export type SubtitleMode = 'word' | 'sentence' | 'off';
export type PlaybackSpeed = 0.75 | 1 | 1.25;
export const SPEEDS: PlaybackSpeed[] = [0.75, 1, 1.25];

export interface ChildProfile {
  id: string;
  /** Nickname only — never a full name. */
  name: string;
  ageBand: AgeBand;
  avatar: string;
  createdAt: number;
}

export interface ReadingProgress {
  storyId: string;
  page: number;
  /** Seconds into the page narration. */
  positionSec: number;
  completed: boolean;
  updatedAt: number;
}

export interface Settings {
  language: 'system' | 'en' | 'fr';
  speed: PlaybackSpeed;
  subtitles: SubtitleMode;
  autoTurn: boolean;
  readMyself: boolean;
  reduceMotion: boolean;
  bedtimeDim: boolean;
  sleepTimer: SleepTimerSetting;
  /** Daily screen-time limit in minutes; 0 = no limit. */
  dailyLimitMin: number;
}

export interface ScreenTime {
  /** Local date key YYYY-MM-DD. */
  day: string;
  seconds: number;
}

export interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  /** profileId -> storyIds */
  favorites: Record<string, string[]>;
  /** profileId -> storyId -> progress */
  progress: Record<string, Record<string, ReadingProgress>>;
  settings: Settings;
  downloads: Record<string, { downloadedAt: number; bytes: number }>;
  screenTime: ScreenTime;

  setHydrated: () => void;
  completeOnboarding: (name: string, ageBand: AgeBand) => void;
  addProfile: (name: string, ageBand: AgeBand) => ChildProfile;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  toggleFavorite: (storyId: string) => void;
  isFavorite: (storyId: string) => boolean;
  saveProgress: (p: Omit<ReadingProgress, 'updatedAt'>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markDownloaded: (storyId: string, bytes: number) => void;
  removeDownload: (storyId: string) => void;
  clearDownloads: () => void;
  addScreenTime: (seconds: number, now?: Date) => void;
  resetAll: () => void;
}

export const AVATARS = ['🦊', '🐻', '🦉', '🐰', '🐢', '🦁', '🐭', '🐧'];

export const defaultSettings: Settings = {
  language: 'system',
  speed: 1,
  subtitles: 'word',
  autoTurn: true,
  readMyself: false,
  reduceMotion: false,
  bedtimeDim: false,
  sleepTimer: 'off',
  dailyLimitMin: 0,
};

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let idCounter = 0;
const newId = () => `p_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, 20) || 'Dreamer';

const initialData = () => ({
  onboarded: false,
  profiles: [] as ChildProfile[],
  activeProfileId: null as string | null,
  favorites: {} as Record<string, string[]>,
  progress: {} as Record<string, Record<string, ReadingProgress>>,
  settings: { ...defaultSettings },
  downloads: {} as AppState['downloads'],
  screenTime: { day: dayKey(new Date()), seconds: 0 },
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initialData(),

      setHydrated: () => set({ hydrated: true }),

      completeOnboarding: (name, ageBand) => {
        const profile = get().addProfile(name, ageBand);
        set({ onboarded: true, activeProfileId: profile.id });
      },

      addProfile: (name, ageBand) => {
        const profiles = get().profiles;
        const profile: ChildProfile = {
          id: newId(),
          name: cleanName(name),
          ageBand,
          avatar: AVATARS[profiles.length % AVATARS.length]!,
          createdAt: Date.now(),
        };
        set({ profiles: [...profiles, profile], activeProfileId: get().activeProfileId ?? profile.id });
        return profile;
      },

      removeProfile: (id) => {
        const { profiles, activeProfileId, favorites, progress } = get();
        const rest = profiles.filter((p) => p.id !== id);
        const { [id]: _f, ...favRest } = favorites;
        const { [id]: _p, ...progRest } = progress;
        set({
          profiles: rest,
          favorites: favRest,
          progress: progRest,
          activeProfileId: activeProfileId === id ? (rest[0]?.id ?? null) : activeProfileId,
          onboarded: rest.length > 0,
        });
      },

      setActiveProfile: (id) => {
        if (get().profiles.some((p) => p.id === id)) set({ activeProfileId: id });
      },

      toggleFavorite: (storyId) => {
        const pid = get().activeProfileId ?? 'default';
        const list = get().favorites[pid] ?? [];
        const next = list.includes(storyId) ? list.filter((s) => s !== storyId) : [storyId, ...list];
        set({ favorites: { ...get().favorites, [pid]: next } });
      },

      isFavorite: (storyId) => {
        const pid = get().activeProfileId ?? 'default';
        return (get().favorites[pid] ?? []).includes(storyId);
      },

      saveProgress: (p) => {
        const pid = get().activeProfileId ?? 'default';
        const forProfile = get().progress[pid] ?? {};
        set({
          progress: { ...get().progress, [pid]: { ...forProfile, [p.storyId]: { ...p, updatedAt: Date.now() } } },
        });
      },

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      markDownloaded: (storyId, bytes) => set({ downloads: { ...get().downloads, [storyId]: { downloadedAt: Date.now(), bytes } } }),
      removeDownload: (storyId) => {
        const { [storyId]: _d, ...rest } = get().downloads;
        set({ downloads: rest });
      },
      clearDownloads: () => set({ downloads: {} }),

      addScreenTime: (seconds, now = new Date()) => {
        const key = dayKey(now);
        const st = get().screenTime;
        set({ screenTime: st.day === key ? { day: key, seconds: st.seconds + seconds } : { day: key, seconds } });
      },

      resetAll: () => set({ ...initialData() }),
    }),
    {
      name: 'dreamsprout-app',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as Partial<AppState>,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Selectors */
export const selectActiveProfile = (s: AppState) => s.profiles.find((p) => p.id === s.activeProfileId) ?? null;
export const selectFavorites = (s: AppState) => s.favorites[s.activeProfileId ?? 'default'] ?? EMPTY;
export const selectProgressMap = (s: AppState) => s.progress[s.activeProfileId ?? 'default'] ?? EMPTY_PROGRESS;
const EMPTY: string[] = [];
const EMPTY_PROGRESS: Record<string, ReadingProgress> = {};

/** True when today's screen time has reached the parent limit. */
export function isOverLimit(s: Pick<AppState, 'settings' | 'screenTime'>, now = new Date()): boolean {
  if (!s.settings.dailyLimitMin) return false;
  if (s.screenTime.day !== dayKey(now)) return false;
  return s.screenTime.seconds >= s.settings.dailyLimitMin * 60;
}
