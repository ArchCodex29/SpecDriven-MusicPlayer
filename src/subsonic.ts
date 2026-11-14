import md5 from 'blueimp-md5';

const API_VERSION = '1.16.1';
const CLIENT_NAME = 'SmallMusicPlayer';

export interface Credentials {
  username: string;
  password: string;
}

export interface MusicFolder {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  name: string;
  artist?: string;
  coverArt?: string;
  songCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songCount?: number;
}

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  coverArt?: string;
}

interface ApiErrorBody {
  code?: number;
  message?: string;
}

interface ClientOptions {
  fetcher?: typeof fetch;
  createSalt?: () => string;
}

export class SubsonicError extends Error {
  constructor(
    message: string,
    public readonly code?: number
  ) {
    super(message);
    this.name = 'SubsonicError';
  }
}

export function createAuthParams(
  username: string,
  password: string,
  salt: string
): { u: string; t: string; s: string } {
  return { u: username, t: md5(`${password}${salt}`), s: salt };
}

export function createRandomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readList<T>(value: unknown, parseItem: (item: unknown) => T): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return (Array.isArray(value) ? value : [value]).map(parseItem);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new SubsonicError(`The server returned an invalid ${key} value.`);
  }
  return String(value);
}

function readOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}

function readOptionalNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function parseMusicFolder(value: unknown): MusicFolder {
  if (!isRecord(value)) {
    throw new SubsonicError('The server returned an invalid music folder.');
  }
  return { id: readString(value, 'id'), name: readString(value, 'name') };
}

function parseAlbum(value: unknown): Album {
  if (!isRecord(value)) {
    throw new SubsonicError('The server returned an invalid album.');
  }
  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    artist: readOptionalString(value, 'artist'),
    coverArt: readOptionalString(value, 'coverArt'),
    songCount: readOptionalNumber(value, 'songCount')
  };
}

function parsePlaylist(value: unknown): Playlist {
  if (!isRecord(value)) {
    throw new SubsonicError('The server returned an invalid playlist.');
  }
  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    songCount: readOptionalNumber(value, 'songCount')
  };
}

function parseTrack(value: unknown): Track {
  if (!isRecord(value)) {
    throw new SubsonicError('The server returned an invalid track.');
  }
  return {
    id: readString(value, 'id'),
    title: readString(value, 'title'),
    artist: readOptionalString(value, 'artist'),
    album: readOptionalString(value, 'album'),
    duration: readOptionalNumber(value, 'duration'),
    coverArt: readOptionalString(value, 'coverArt')
  };
}

function readApiError(value: unknown): ApiErrorBody | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return {
    code: readOptionalNumber(value, 'code'),
    message: readOptionalString(value, 'message')
  };
}

export class SubsonicClient {
  private readonly baseUrl: URL;
  private readonly fetcher: typeof fetch;
  private readonly createSalt: () => string;

  constructor(
    serverUrl: string,
    private readonly credentials: Credentials,
    options: ClientOptions = {}
  ) {
    const normalizedUrl = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;
    this.baseUrl = new URL(normalizedUrl);
    if (
      this.baseUrl.protocol !== 'https:' ||
      this.baseUrl.username ||
      this.baseUrl.password ||
      this.baseUrl.search ||
      this.baseUrl.hash
    ) {
      throw new Error('Subsonic servers must use HTTPS.');
    }
    this.fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
    this.createSalt = options.createSalt ?? createRandomSalt;
  }

  async ping(): Promise<void> {
    await this.request('ping');
  }

  async getMusicFolders(): Promise<MusicFolder[]> {
    const response = await this.request('getMusicFolders');
    const folders = response.musicFolders;
    if (!isRecord(folders)) {
      throw new SubsonicError('The server did not return music folders.');
    }
    return readList(folders.musicFolder, parseMusicFolder);
  }

  async getAlbums(musicFolderId: string): Promise<Album[]> {
    const pageSize = 500;
    const albums: Album[] = [];
    let offset = 0;
    while (true) {
      const response = await this.request('getAlbumList2', {
        type: 'alphabeticalByName',
        size: String(pageSize),
        offset: String(offset),
        musicFolderId
      });
      const albumList = response.albumList2;
      if (!isRecord(albumList)) {
        throw new SubsonicError('The server did not return an album list.');
      }
      const page = readList(albumList.album, parseAlbum);
      albums.push(...page);
      if (page.length < pageSize) {
        return albums;
      }
      offset += page.length;
    }
  }

  async getPlaylists(): Promise<Playlist[]> {
    const response = await this.request('getPlaylists');
    const playlists = response.playlists;
    if (!isRecord(playlists)) {
      throw new SubsonicError('The server did not return playlists.');
    }
    return readList(playlists.playlist, parsePlaylist);
  }

  async getAlbumTracks(albumId: string): Promise<Track[]> {
    const response = await this.request('getAlbum', { id: albumId });
    const album = response.album;
    if (!isRecord(album)) {
      throw new SubsonicError('The server did not return album tracks.');
    }
    return readList(album.song, parseTrack);
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    const response = await this.request('getPlaylist', { id: playlistId });
    const playlist = response.playlist;
    if (!isRecord(playlist)) {
      throw new SubsonicError('The server did not return playlist tracks.');
    }
    return readList(playlist.entry, parseTrack);
  }

  createStreamUrl(trackId: string): string {
    return this.createRequestUrl('stream', { id: trackId }).href;
  }

  private async request(
    method: string,
    parameters: Record<string, string> = {}
  ): Promise<Record<string, unknown>> {
    const response = await this.fetcher(this.createRequestUrl(method, parameters), {
      headers: { Accept: 'application/json' }
    });
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new SubsonicError('The server returned an invalid JSON response.');
    }

    if (!isRecord(payload) || !isRecord(payload['subsonic-response'])) {
      throw new SubsonicError('The server returned an invalid Subsonic response.');
    }

    const root = payload['subsonic-response'];
    if (!response.ok) {
      throw new SubsonicError(`The server request failed (HTTP ${response.status}).`);
    }
    if (root.status !== 'ok') {
      const error = readApiError(root.error);
      throw new SubsonicError(error?.message ?? 'The Subsonic request failed.', error?.code);
    }
    return root;
  }

  private createRequestUrl(method: string, parameters: Record<string, string>): URL {
    const url = new URL(`rest/${method}.view`, this.baseUrl);
    const auth = createAuthParams(
      this.credentials.username,
      this.credentials.password,
      this.createSalt()
    );
    url.search = new URLSearchParams({
      ...auth,
      v: API_VERSION,
      c: CLIENT_NAME,
      f: 'json',
      ...parameters
    }).toString();
    return url;
  }
}
