import { describe, expect, it } from 'vitest';
import { getInitialScreen } from './app-state';

describe('getInitialScreen', () => {
  it('starts at server setup when no server URL is saved', () => {
    expect(getInitialScreen(null)).toEqual({ kind: 'server-setup' });
  });

  it('starts at login for a saved server URL', () => {
    expect(getInitialScreen('https://music.example')).toEqual({
      kind: 'login',
      serverUrl: 'https://music.example'
    });
  });
});
