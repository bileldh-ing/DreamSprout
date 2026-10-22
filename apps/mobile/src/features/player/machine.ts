/**
 * Explicit reader/player state machine. The audio clock is authoritative for time;
 * this reducer only tracks *which* phase the reader is in so UI and side effects
 * never overlap (e.g. no double playback during a page transition).
 */
export type PlayerPhase =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'seeking'
  | 'page_transition'
  | 'buffering'
  | 'audio_ended'
  | 'media_error'
  | 'story_completed'
  | 'disposed';

export interface PlayerState {
  phase: PlayerPhase;
  page: number; // 1-based
  pageCount: number;
  /** Whether playback should resume automatically once the next page is loaded. */
  autoplay: boolean;
}

export type PlayerEvent =
  | { type: 'LOADED' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'BUFFERING' }
  | { type: 'SEEK' }
  | { type: 'SEEKED' }
  | { type: 'ENDED'; autoTurn: boolean }
  | { type: 'GOTO'; page: number; autoplay?: boolean }
  | { type: 'ERROR' }
  | { type: 'DISPOSE' };

export function initialPlayerState(pageCount: number, page = 1, autoplay = true): PlayerState {
  return { phase: 'loading', page: clamp(page, 1, Math.max(1, pageCount)), pageCount, autoplay };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function playerReducer(state: PlayerState, event: PlayerEvent): PlayerState {
  if (state.phase === 'disposed') return state;
  switch (event.type) {
    case 'LOADED':
      if (state.phase === 'loading' || state.phase === 'page_transition' || state.phase === 'buffering')
        return { ...state, phase: state.autoplay ? 'playing' : 'ready' };
      return state;
    case 'PLAY':
      if (state.phase === 'story_completed' || state.phase === 'media_error') return state;
      return { ...state, phase: 'playing', autoplay: true };
    case 'PAUSE':
      if (state.phase === 'playing' || state.phase === 'buffering' || state.phase === 'seeking')
        return { ...state, phase: 'paused', autoplay: false };
      return { ...state, autoplay: false };
    case 'BUFFERING':
      return state.phase === 'playing' ? { ...state, phase: 'buffering' } : state;
    case 'SEEK':
      return { ...state, phase: 'seeking' };
    case 'SEEKED':
      return state.phase === 'seeking' ? { ...state, phase: state.autoplay ? 'playing' : 'paused' } : state;
    case 'ENDED': {
      if (state.page >= state.pageCount) return { ...state, phase: 'story_completed' };
      if (event.autoTurn) return { ...state, phase: 'page_transition', page: state.page + 1, autoplay: true };
      return { ...state, phase: 'audio_ended', autoplay: false };
    }
    case 'GOTO': {
      const page = clamp(event.page, 1, state.pageCount);
      if (page === state.page && state.phase !== 'audio_ended') return state;
      return { ...state, phase: 'page_transition', page, autoplay: event.autoplay ?? state.autoplay };
    }
    case 'ERROR':
      return { ...state, phase: 'media_error', autoplay: false };
    case 'DISPOSE':
      return { ...state, phase: 'disposed', autoplay: false };
    default:
      return state;
  }
}
