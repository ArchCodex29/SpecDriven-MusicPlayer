import { describe, expect, it } from 'vitest';
import { normalizeServerUrl, saveServerUrl, SERVER_URL_STORAGE_KEY } from './storage';
import { createAuthParams, SubsonicClient } from './subsonic';

function createStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value)
  };
}

describe('server URL storage', () => {
  it('normalizes and persists only the HTTPS server URL', async () => {
    const storage = createStorage();
    const serverUrl = normalizeServerUrl(' https://music.example ');
    const username = 'private-user';
    const password = 'private-password';
    const token = createAuthParams(username, password, 'c19b2d').t;

    saveServerUrl(serverUrl, storage);
    const client = new SubsonicClient(serverUrl, { username, password }, {
      createSalt: () => 'c19b2d',
      fetcher: async () =>
        new Response(JSON.stringify({ 'subsonic-response': { status: 'ok' } }), {
          headers: { 'Content-Type': 'application/json' }
        })
    });
    await client.ping();

    expect([...storage.values.entries()]).toEqual([[SERVER_URL_STORAGE_KEY, serverUrl]]);
    expect([...storage.values.values()].join(' ')).not.toContain(username);
    expect([...storage.values.values()].join(' ')).not.toContain(password);
    expect([...storage.values.values()].join(' ')).not.toContain(token);
  });

  it('rejects insecure or credential-bearing server URLs', () => {
    expect(() => normalizeServerUrl('http://music.example')).toThrow('HTTPS');
    expect(() => normalizeServerUrl('https://user:pass@music.example')).toThrow('HTTPS');
    expect(() => normalizeServerUrl('not a URL')).toThrow('valid HTTPS');
  });
});
