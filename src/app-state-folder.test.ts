import { describe, expect, it } from 'vitest';
import {
  createBrowseScreen,
  createHomeScreen,
  resolveFolderSelection,
  selectMusicFolder,
  switchBrowseView,
  type BrowseScreen
} from './app-state';

const folder = { id: 'music-1', name: 'Main Library' };

describe('music folder selection', () => {
  it('selects the only available folder automatically', () => {
    expect(resolveFolderSelection([folder])).toEqual({ kind: 'selected', folder });
  });

  it('asks the user to choose when there are multiple folders', () => {
    const folders = [folder, { id: 'music-2', name: 'Archive' }];
    expect(resolveFolderSelection(folders)).toEqual({ kind: 'choose', folders });
  });

  it('reports an empty folder list', () => {
    expect(resolveFolderSelection([])).toEqual({ kind: 'empty' });
  });
});

describe('browse view state', () => {
  const home = createHomeScreen('https://music.example/', folder, [
    folder,
    { id: 'music-2', name: 'Archive' }
  ]);

  it('opens albums or playlists from Home without losing the authenticated folder choices', () => {
    expect(createBrowseScreen(home, 'albums')).toMatchObject({
      kind: 'browse',
      folder,
      folders: home.folders,
      view: 'albums',
      status: 'loading'
    });
    expect(createBrowseScreen(home, 'playlists').view).toBe('playlists');
  });

  it('changes the selected folder while retaining the authenticated Home state', () => {
    const selected = selectMusicFolder(home, home.folders[1]!);
    expect(selected).toMatchObject({
      kind: 'home',
      serverUrl: home.serverUrl,
      folder: home.folders[1],
      folders: home.folders
    });
  });

  it('rejects a folder that was not returned by the authenticated server', () => {
    expect(() => selectMusicFolder(home, { id: 'other', name: 'Other' })).toThrow(
      'The selected music folder is not available.'
    );
  });

  it('changes the view while retaining its music folder', () => {
    const screen: BrowseScreen = {
      kind: 'browse',
      serverUrl: 'https://music.example/',
      folder,
      folders: [folder],
      view: 'albums',
      status: 'ready',
      albums: [],
      playlists: null
    };

    expect(switchBrowseView(screen, 'playlists')).toEqual({
      ...screen,
      view: 'playlists',
      status: 'loading',
      error: undefined
    });
  });
});
