export const SERVER_URL_STORAGE_KEY = 'small-music-player.serverUrl';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadServerUrl(storage: KeyValueStorage = window.localStorage): string | null {
  return storage.getItem(SERVER_URL_STORAGE_KEY);
}

export function saveServerUrl(
  serverUrl: string,
  storage: KeyValueStorage = window.localStorage
): void {
  storage.setItem(SERVER_URL_STORAGE_KEY, serverUrl);
}

export function normalizeServerUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error('Enter a valid HTTPS server URL.');
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('Use an HTTPS server URL without credentials, query parameters, or a fragment.');
  }

  return url.href.endsWith('/') ? url.href : `${url.href}/`;
}
