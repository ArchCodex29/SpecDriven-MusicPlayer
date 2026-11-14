import { describe, expect, it, vi } from 'vitest';
import { createAuthParams, SubsonicClient, SubsonicError } from './subsonic';

function response(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('Subsonic authentication', () => {
  it('matches the published Subsonic token example', () => {
    expect(createAuthParams('joe', 'sesame', 'c19b2d')).toEqual({
      u: 'joe',
      t: '26719a1196d2a940705a59634eb18eab',
      s: 'c19b2d'
    });
  });

  it('uses a fresh salt and derived token for each request without logging them', async () => {
    const salts = ['salt-0001', 'salt-0002'];
    const urls: URL[] = [];
    const fetcher: typeof fetch = async (input) => {
      urls.push(new URL(String(input)));
      return response({ 'subsonic-response': { status: 'ok' } });
    };
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const client = new SubsonicClient('https://music.example/', {
      username: 'joe',
      password: 'private-password'
    }, {
      fetcher,
      createSalt: () => {
        const salt = salts.shift();
        if (!salt) {
          throw new Error('No test salt available.');
        }
        return salt;
      }
    });

    try {
      await client.ping();
      await client.ping();

      const first = urls[0]?.searchParams;
      const second = urls[1]?.searchParams;
      expect(first?.get('s')).toBe('salt-0001');
      expect(second?.get('s')).toBe('salt-0002');
      expect(first?.get('t')).not.toBe(second?.get('t'));
      expect(first?.get('p')).toBeNull();
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it('surfaces rejected credentials as a typed Subsonic error', async () => {
    const client = new SubsonicClient('https://music.example/', {
      username: 'joe',
      password: 'wrong-password'
    }, {
      createSalt: () => 'salt-0001',
      fetcher: async () =>
        response({
          'subsonic-response': {
            status: 'failed',
            error: { code: 40, message: 'Wrong username or password' }
          }
        })
    });

    await expect(client.ping()).rejects.toMatchObject<Partial<SubsonicError>>({
      name: 'SubsonicError',
      code: 40,
      message: 'Wrong username or password'
    });
  });

  it('creates fresh authenticated stream URLs without cleartext passwords', () => {
    const salts = ['stream-salt-1', 'stream-salt-2'];
    const client = new SubsonicClient('https://music.example/', {
      username: 'joe',
      password: 'private-password'
    }, {
      createSalt: () => salts.shift() ?? 'unexpected-salt'
    });

    const first = new URL(client.createStreamUrl('track-1'));
    const second = new URL(client.createStreamUrl('track-2'));
    expect(first.pathname).toBe('/rest/stream.view');
    expect(first.searchParams.get('id')).toBe('track-1');
    expect(first.searchParams.get('s')).toBe('stream-salt-1');
    expect(second.searchParams.get('s')).toBe('stream-salt-2');
    expect(first.searchParams.has('p')).toBe(false);
    expect(first.href).not.toContain('private-password');
  });

  it('creates authenticated cover-art URLs with a bounded thumbnail size', () => {
    const client = new SubsonicClient('https://music.example/', {
      username: 'joe',
      password: 'private-password'
    }, {
      createSalt: () => 'cover-salt'
    });

    const coverArt = new URL(client.createCoverArtUrl('cover-1'));
    expect(coverArt.pathname).toBe('/rest/getCoverArt.view');
    expect(coverArt.searchParams.get('id')).toBe('cover-1');
    expect(coverArt.searchParams.get('size')).toBe('160');
    expect(coverArt.searchParams.get('s')).toBe('cover-salt');
    expect(coverArt.href).not.toContain('private-password');
    expect(() => client.createCoverArtUrl('cover-1', 0)).toThrow(RangeError);
  });
});
