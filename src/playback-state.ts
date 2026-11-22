import type { Track } from './subsonic';

export type PlaybackStatus = 'loading' | 'playing' | 'paused' | 'error' | 'ended';

export interface PlaybackState {
  tracks: Track[];
  currentIndex: number;
  status: PlaybackStatus;
  volume: number;
  error?: string;
}

export function createPlaybackQueue(tracks: Track[]): PlaybackState | null {
  if (tracks.length === 0) {
    return null;
  }
  return {
    tracks: [...tracks],
    currentIndex: 0,
    status: 'paused',
    volume: 0.8
  };
}

export function nextTrack(state: PlaybackState): PlaybackState {
  return state.currentIndex + 1 < state.tracks.length
    ? { ...state, currentIndex: state.currentIndex + 1, status: 'loading', error: undefined }
    : state;
}

export function previousTrack(state: PlaybackState): PlaybackState {
  return state.currentIndex > 0
    ? { ...state, currentIndex: state.currentIndex - 1, status: 'loading', error: undefined }
    : state;
}

export function advanceAfterTrackEnd(state: PlaybackState): PlaybackState {
  const next = nextTrack(state);
  return next === state ? { ...state, status: 'ended', error: undefined } : next;
}

export function setPlaybackStatus(
  state: PlaybackState,
  status: PlaybackStatus,
  error?: string
): PlaybackState {
  return { ...state, status, error };
}

export function setPlaybackVolume(state: PlaybackState, volume: number): PlaybackState {
  if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
    throw new RangeError('Volume must be between 0 and 1.');
  }
  return { ...state, volume };
}
