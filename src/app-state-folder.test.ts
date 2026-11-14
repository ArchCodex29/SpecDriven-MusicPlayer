import { describe, expect, it } from 'vitest';
import { resolveFolderSelection, switchBrowseView, type BrowseScreen } from './app-state';

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
  it('changes the view while retaining its music folder', () => {
    const screen: BrowseScreen = {
      kind: 'browse',
      serverUrl: 'https://music.example/',
      folder,
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
