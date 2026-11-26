import { describe, expect, it } from 'vitest';
import { getServerOrigin } from './extension';

describe('getServerOrigin', () => {
  it('returns the exact HTTPS origin pattern for a server', () => {
    expect(getServerOrigin('https://music.example.com/subsonic')).toBe('https://music.example.com/*');
  });

  it('rejects non-HTTPS and credential-bearing URLs', () => {
    expect(() => getServerOrigin('http://music.example.com')).toThrow();
    expect(() => getServerOrigin('https://user:password@music.example.com')).toThrow();
  });
});
