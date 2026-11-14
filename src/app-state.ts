import type { Album, MusicFolder, Playlist } from './subsonic';
import type { PlaybackState } from './playback-state';

export type AppScreen =
  | { kind: 'server-setup'; serverUrl?: string; error?: string }
  | { kind: 'login'; serverUrl: string; error?: string; busy?: boolean }
  | { kind: 'folder-selection'; serverUrl: string; folders: MusicFolder[] }
  | { kind: 'no-folders'; serverUrl: string }
  | { kind: 'loading-collection'; serverUrl: string; folder: MusicFolder; title: string; returnTo: BrowseScreen }
  | { kind: 'playing'; collectionTitle: string; queue: PlaybackState; returnTo: BrowseScreen }
  | BrowseScreen;

export type BrowseView = 'albums' | 'playlists';
export type BrowseStatus = 'loading' | 'ready' | 'error';

export interface BrowseScreen {
  kind: 'browse';
  serverUrl: string;
  folder: MusicFolder;
  view: BrowseView;
  status: BrowseStatus;
  albums: Album[] | null;
  playlists: Playlist[] | null;
  notice?: string;
  error?: string;
}

export type FolderSelection =
  | { kind: 'empty' }
  | { kind: 'selected'; folder: MusicFolder }
  | { kind: 'choose'; folders: MusicFolder[] };

export function getInitialScreen(savedServerUrl: string | null): AppScreen {
  return savedServerUrl
    ? { kind: 'login', serverUrl: savedServerUrl }
    : { kind: 'server-setup' };
}

export function resolveFolderSelection(folders: MusicFolder[]): FolderSelection {
  if (folders.length === 0) {
    return { kind: 'empty' };
  }
  if (folders.length === 1) {
    const folder = folders[0];
    if (folder) {
      return { kind: 'selected', folder };
    }
    return { kind: 'empty' };
  }
  return { kind: 'choose', folders };
}

export function switchBrowseView(screen: BrowseScreen, view: BrowseView): BrowseScreen {
  const cachedItems = view === 'albums' ? screen.albums : screen.playlists;
  return {
    ...screen,
    view,
    status: cachedItems ? 'ready' : 'loading',
    notice: undefined,
    error: undefined
  };
}
