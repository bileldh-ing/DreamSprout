import { act } from '@testing-library/react-native';
import { isOverLimit, selectActiveProfile, selectFavorites, useAppStore } from '@/store/app-store';

beforeEach(() => {
  act(() => useAppStore.getState().resetAll());
});

describe('app store', () => {
  it('onboards a child with nickname + age band only', () => {
    act(() => useAppStore.getState().completeOnboarding('  Mia   Rose  ', '3-5'));
    const s = useAppStore.getState();
    expect(s.onboarded).toBe(true);
    const p = selectActiveProfile(s)!;
    expect(p.name).toBe('Mia Rose');
    expect(Object.keys(p).sort()).toEqual(['ageBand', 'avatar', 'createdAt', 'id', 'name']);
  });

  it('toggles favorites per profile', () => {
    act(() => useAppStore.getState().completeOnboarding('Mia', '3-5'));
    act(() => useAppStore.getState().toggleFavorite('lion-mouse'));
    expect(selectFavorites(useAppStore.getState())).toEqual(['lion-mouse']);
    expect(useAppStore.getState().isFavorite('lion-mouse')).toBe(true);
    act(() => {
      const leo = useAppStore.getState().addProfile('Leo', '6-8').id;
      useAppStore.getState().setActiveProfile(leo);
    });
    expect(selectFavorites(useAppStore.getState())).toEqual([]);
    act(() => useAppStore.getState().toggleFavorite('lion-mouse'));
    act(() => useAppStore.getState().toggleFavorite('lion-mouse'));
    expect(selectFavorites(useAppStore.getState())).toEqual([]);
  });

  it('removing a profile removes its data and re-targets the active profile', () => {
    act(() => useAppStore.getState().completeOnboarding('Mia', '3-5'));
    const mia = useAppStore.getState().activeProfileId!;
    act(() => useAppStore.getState().toggleFavorite('pip-star'));
    act(() => {
      useAppStore.getState().addProfile('Leo', '6-8');
      useAppStore.getState().removeProfile(mia);
    });
    const s = useAppStore.getState();
    expect(s.favorites[mia]).toBeUndefined();
    expect(selectActiveProfile(s)?.name).toBe('Leo');
  });

  it('saves reading progress', () => {
    act(() => useAppStore.getState().completeOnboarding('Mia', '3-5'));
    act(() => useAppStore.getState().saveProgress({ storyId: 'goldilocks', page: 2, positionSec: 3.2, completed: false }));
    const pid = useAppStore.getState().activeProfileId!;
    expect(useAppStore.getState().progress[pid]!.goldilocks).toMatchObject({ page: 2, positionSec: 3.2 });
  });

  it('tracks screen time per day and enforces the limit', () => {
    const day = new Date(2026, 9, 22, 20);
    act(() => {
      useAppStore.getState().updateSettings({ dailyLimitMin: 1 });
      useAppStore.getState().addScreenTime(30, day);
    });
    expect(isOverLimit(useAppStore.getState(), day)).toBe(false);
    act(() => useAppStore.getState().addScreenTime(30, day));
    expect(isOverLimit(useAppStore.getState(), day)).toBe(true);
    const next = new Date(2026, 9, 23, 20);
    expect(isOverLimit(useAppStore.getState(), next)).toBe(false);
    act(() => useAppStore.getState().addScreenTime(10, next));
    expect(useAppStore.getState().screenTime).toEqual({ day: '2026-10-23', seconds: 10 });
  });

  it('manages downloads', () => {
    act(() => useAppStore.getState().markDownloaded('pip-star', 1000));
    expect(useAppStore.getState().downloads['pip-star']?.bytes).toBe(1000);
    act(() => useAppStore.getState().removeDownload('pip-star'));
    expect(useAppStore.getState().downloads).toEqual({});
  });
});
