import { describe, expect, it } from 'vitest';
import { SubsonicClient } from './subsonic';

function response(data: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ 'subsonic-response': { status: 'ok', ...data } }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('Subsonic library requests', () => {
  it('scopes album requests to the selected folder and reads permitted playlists account-wide', async () => {
    const responses = [
      response({
        albumList2: {
          album: [
            { id: 'album-1', name: 'First Album', artist: 'First Artist', songCount: 2 },
            { id: 'album-2', name: 'Second Album', songCount: 0 }
          ]
        }
      }),
      response({ playlists: { playlist: { id: 'playlist-1', name: 'Favorites', songCount: 3 } } })
    ];
    const requests: URL[] = [];
    const client = new SubsonicClient('https://music.example', {
      username: 'joe',
      password: 'secret'
    }, {
      createSalt: () => 'fresh-salt',
      fetcher: async (input) => {
        requests.push(new URL(String(input)));
        const next = responses.shift();
        if (!next) {
          throw new Error('No mocked response available.');
        }
        return next;
      }
    });

    const albums = await client.getAlbums('folder-42');
    const playlists = await client.getPlaylists();

    expect(albums).toEqual([
      { id: 'album-1', name: 'First Album', artist: 'First Artist', songCount: 2 },
      { id: 'album-2', name: 'Second Album', artist: undefined, coverArt: undefined, songCount: 0 }
    ]);
    expect(playlists).toEqual([
      { id: 'playlist-1', name: 'Favorites', songCount: 3 }
    ]);
    expect(requests[0]?.pathname).toBe('/rest/getAlbumList2.view');
    expect(requests[0]?.searchParams.get('musicFolderId')).toBe('folder-42');
    expect(requests[1]?.pathname).toBe('/rest/getPlaylists.view');
    expect(requests[1]?.searchParams.has('musicFolderId')).toBe(false);
  });

  it('reads multiple music folders', async () => {
    const folders = new SubsonicClient('https://music.example/', {
      username: 'joe',
      password: 'secret'
    }, {
      createSalt: () => 'salt',
      fetcher: async () =>
        response({
          musicFolders: {
            musicFolder: [
              { id: 'folder-1', name: 'Main Library' },
              { id: 'folder-2', name: 'Archive' }
            ]
          }
        })
    });
    await expect(folders.getMusicFolders()).resolves.toEqual([
      { id: 'folder-1', name: 'Main Library' },
      { id: 'folder-2', name: 'Archive' }
    ]);
  });

  it('surfaces music-folder request errors', async () => {
    const client = new SubsonicClient('https://music.example/', {
      username: 'joe',
      password: 'secret'
    }, {
      createSalt: () => 'salt',
      fetcher: async () =>
        response({
          status: 'failed',
          error: { code: 50, message: 'User is not authorized for the given operation' }
        })
    });

    await expect(client.getMusicFolders()).rejects.toMatchObject({
      code: 50,
      message: 'User is not authorized for the given operation'
    });
  });

  it('preserves track order returned for albums and playlists', async () => {
    const responses = [
      response({
        album: {
          song: [
            { id: 'song-1', title: 'First Track' },
            { id: 'song-2', title: 'Second Track' }
          ]
        }
      }),
      response({
        playlist: {
          entry: [
            { id: 'song-2', title: 'Second Track' },
            { id: 'song-1', title: 'First Track' }
          ]
        }
      })
    ];
    const client = new SubsonicClient('https://music.example/', {
      username: 'joe',
      password: 'secret'
    }, {
      createSalt: () => 'salt',
      fetcher: async () => {
        const next = responses.shift();
        if (!next) {
          throw new Error('No mocked response available.');
        }
        return next;
      }
    });

    await expect(client.getAlbumTracks('album-1')).resolves.toMatchObject([
      { id: 'song-1', title: 'First Track' },
      { id: 'song-2', title: 'Second Track' }
    ]);
    await expect(client.getPlaylistTracks('playlist-1')).resolves.toMatchObject([
      { id: 'song-2', title: 'Second Track' },
      { id: 'song-1', title: 'First Track' }
    ]);
  });
});
