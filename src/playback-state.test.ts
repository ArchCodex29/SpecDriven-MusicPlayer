import { describe, expect, it } from 'vitest';
import {
  advanceAfterTrackEnd,
  createPlaybackQueue,
  nextTrack,
  previousTrack,
  setPlaybackStatus,
  setPlaybackVolume
} from './playback-state';
import type { Track } from './subsonic';

const tracks: Track[] = [
  { id: 'track-1', title: 'First' },
  { id: 'track-2', title: 'Second' },
  { id: 'track-3', title: 'Third' }
];

describe('playback queue', () => {
  it('preserves server order and initializes paused at the first track', () => {
    expect(createPlaybackQueue(tracks)).toMatchObject({
      tracks,
      currentIndex: 0,
      status: 'paused'
    });
  });

  it('does not create a queue for an empty collection', () => {
    expect(createPlaybackQueue([])).toBeNull();
  });

  it('moves through the queue and advances when a track ends', () => {
    const queue = createPlaybackQueue(tracks);
    if (!queue) {
      throw new Error('Expected a non-empty queue.');
    }

    const second = nextTrack(queue);
    expect(second.currentIndex).toBe(1);
    expect(previousTrack(second).currentIndex).toBe(0);
    expect(advanceAfterTrackEnd(second).currentIndex).toBe(2);
    expect(advanceAfterTrackEnd(advanceAfterTrackEnd(second)).status).toBe('ended');
  });

  it('can start explicitly from a paused queue and report media failures', () => {
    const queue = createPlaybackQueue(tracks);
    if (!queue) {
      throw new Error('Expected a non-empty queue.');
    }

    expect(queue.status).toBe('paused');
    expect(setPlaybackStatus(queue, 'playing').status).toBe('playing');
    expect(setPlaybackStatus(queue, 'paused').status).toBe('paused');
    const failed = setPlaybackStatus(queue, 'error', 'Stream failed');
    expect(failed).toMatchObject({
      status: 'error',
      error: 'Stream failed'
    });
    expect(failed.status).not.toBe('playing');
    expect(nextTrack(failed)).toMatchObject({
      currentIndex: 1,
      status: 'loading'
    });
  });

  it('accepts only browser volume values', () => {
    const queue = createPlaybackQueue(tracks);
    if (!queue) {
      throw new Error('Expected a non-empty queue.');
    }

    expect(setPlaybackVolume(queue, 0.35).volume).toBe(0.35);
    expect(() => setPlaybackVolume(queue, 1.1)).toThrow(RangeError);
  });
});
