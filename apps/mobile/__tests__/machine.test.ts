import { initialPlayerState, playerReducer, type PlayerEvent, type PlayerState } from '@/features/player/machine';

const run = (s: PlayerState, ...events: PlayerEvent[]) => events.reduce(playerReducer, s);

describe('player state machine', () => {
  it('loads into playing when autoplay, ready otherwise', () => {
    expect(run(initialPlayerState(3), { type: 'LOADED' }).phase).toBe('playing');
    expect(run(initialPlayerState(3, 1, false), { type: 'LOADED' }).phase).toBe('ready');
  });

  it('clamps the start page', () => {
    expect(initialPlayerState(3, 9).page).toBe(3);
    expect(initialPlayerState(3, -2).page).toBe(1);
  });

  it('auto-turns pages and completes the story on the last page', () => {
    let s = run(initialPlayerState(2), { type: 'LOADED' }, { type: 'ENDED', autoTurn: true });
    expect(s).toMatchObject({ phase: 'page_transition', page: 2, autoplay: true });
    s = run(s, { type: 'LOADED' }, { type: 'ENDED', autoTurn: true });
    expect(s.phase).toBe('story_completed');
  });

  it('waits on audio_ended when auto-turn is off', () => {
    const s = run(initialPlayerState(3), { type: 'LOADED' }, { type: 'ENDED', autoTurn: false });
    expect(s).toMatchObject({ phase: 'audio_ended', page: 1 });
    expect(run(s, { type: 'GOTO', page: 2 }).page).toBe(2);
  });

  it('handles pause/play, seeking and errors', () => {
    let s = run(initialPlayerState(3), { type: 'LOADED' }, { type: 'PAUSE' });
    expect(s).toMatchObject({ phase: 'paused', autoplay: false });
    s = run(s, { type: 'SEEK' }, { type: 'SEEKED' });
    expect(s.phase).toBe('paused');
    s = run(s, { type: 'PLAY' }, { type: 'BUFFERING' });
    expect(s.phase).toBe('buffering');
    s = run(s, { type: 'ERROR' }, { type: 'PLAY' });
    expect(s.phase).toBe('media_error');
  });

  it('ignores events after dispose and no-op GOTO', () => {
    expect(run(initialPlayerState(3), { type: 'DISPOSE' }, { type: 'PLAY' }).phase).toBe('disposed');
    const t = run(initialPlayerState(3), { type: 'LOADED' });
    expect(playerReducer(t, { type: 'GOTO', page: 1 })).toBe(t);
  });
});
