import {
  getInitialScreen,
  resolveFolderSelection,
  switchBrowseView,
  type AppScreen,
  type BrowseScreen,
  type BrowseView
} from './app-state';
import {
  advanceAfterTrackEnd,
  createPlaybackQueue,
  nextTrack,
  previousTrack,
  setPlaybackStatus,
  setPlaybackVolume,
  type PlaybackState
} from './playback-state';
import { loadServerUrl, normalizeServerUrl, saveServerUrl } from './storage';
import {
  SubsonicClient,
  type Album,
  type MusicFolder,
  type Playlist,
  type Track
} from './subsonic';
import './style.css';

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('Application root element was not found.');
}

let screen: AppScreen = getInitialScreen(loadServerUrl());
let client: SubsonicClient | undefined;
let libraryRequestId = 0;
let collectionRequestId = 0;
let playbackAttemptId = 0;
const audio = new Audio();
audio.preload = 'none';
audio.crossOrigin = 'anonymous';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character];
  });
}

function render(): void {
  if (!app) {
    return;
  }

  if (screen.kind === 'server-setup') {
    const serverUrl = escapeHtml(screen.serverUrl ?? '');
    app.innerHTML = `
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">Connect your server</h1>
        <p class="description">Enter the HTTPS address of your Subsonic-compatible server.</p>
        ${screen.error ? `<p class="error" role="alert">${escapeHtml(screen.error)}</p>` : ''}
        <form id="server-form">
          <label for="server-url">Server URL</label>
          <input id="server-url" name="serverUrl" type="url" value="${serverUrl}" placeholder="https://music.example.com" autocomplete="url" required />
          <button type="submit">Continue to login</button>
        </form>
      </section>
    `;
    return;
  }

  if (screen.kind === 'login') {
    app.innerHTML = `
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">Sign in</h1>
        <p class="description">Connect to <span class="server-address">${escapeHtml(screen.serverUrl)}</span></p>
        ${screen.error ? `<p class="error" role="alert">${escapeHtml(screen.error)}</p>` : ''}
        <form id="login-form">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" autocomplete="username" required ${screen.busy ? 'disabled' : ''} />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required ${screen.busy ? 'disabled' : ''} />
          <button type="submit" ${screen.busy ? 'disabled' : ''}>${screen.busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <button class="secondary-button" type="button" data-action="back-to-server" ${screen.busy ? 'disabled' : ''}>Back to server setup</button>
      </section>
    `;
    return;
  }

  if (screen.kind === 'folder-selection') {
    app.innerHTML = `
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">Choose a music folder</h1>
        <p class="description">Select the library you want to browse.</p>
        <ul class="folder-list">
          ${screen.folders.map((folder) => `
            <li><button type="button" class="folder-button" data-action="select-folder" data-folder-id="${escapeHtml(folder.id)}">${escapeHtml(folder.name)}</button></li>
          `).join('')}
        </ul>
        <button class="secondary-button" type="button" data-action="back-to-login">Back to login</button>
      </section>
    `;
    return;
  }

  if (screen.kind === 'no-folders') {
    app.innerHTML = `
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">No music folders found</h1>
        <p class="description">This account has no music folders available on the server.</p>
        <button type="button" data-action="back-to-login">Back to login</button>
      </section>
    `;
    return;
  }

  if (screen.kind === 'loading-collection') {
    app.innerHTML = `
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">Loading ${escapeHtml(screen.title)}</h1>
        <p class="description" role="status">Loading tracks…</p>
        <button class="secondary-button" type="button" data-action="cancel-collection">Back to library</button>
      </section>
    `;
    return;
  }

  if (screen.kind === 'playing') {
    renderPlayingScreen();
    return;
  }

  renderBrowseScreen(screen);
}

function renderBrowseScreen(browse: BrowseScreen): void {
  if (!app) {
    return;
  }
  const isAlbums = browse.view === 'albums';
  const items = isAlbums ? browse.albums : browse.playlists;
  const collectionItems = items ?? [];
  const collectionMarkup =
    browse.status === 'loading'
      ? `<p role="status">Loading ${browse.view}…</p>`
      : browse.status === 'error'
        ? `<p class="error" role="alert">Could not load ${browse.view}: ${escapeHtml(browse.error ?? 'Unknown error')}</p><button type="button" data-action="retry-library">Retry</button>`
        : collectionItems.length === 0
          ? `<p class="empty-state">No ${browse.view} available.</p>`
          : `<ul class="collection-list">${collectionItems.map((item) => renderCollectionItem(item, browse.view)).join('')}</ul>`;

  app.innerHTML = `
    <section class="app-shell library-shell" aria-labelledby="app-title">
      <p class="eyebrow">Small Music Player</p>
      <div class="library-heading">
        <div>
          <h1 id="app-title">Music library</h1>
          <p class="description">Folder: <strong>${escapeHtml(browse.folder.name)}</strong></p>
        </div>
        <button class="secondary-button back-button" type="button" data-action="back-to-login">Sign out</button>
      </div>
      <nav class="library-tabs" aria-label="Library views">
        <button type="button" data-action="show-albums" aria-pressed="${isAlbums}">Albums</button>
        <button type="button" data-action="show-playlists" aria-pressed="${!isAlbums}">Playlists</button>
      </nav>
      <h2>${isAlbums ? 'Albums' : 'Playlists'}</h2>
      ${browse.notice ? `<p class="error" role="alert">${escapeHtml(browse.notice)}</p>` : ''}
      ${collectionMarkup}
    </section>
  `;
}

function renderCollectionItem(item: Album | Playlist, view: BrowseView): string {
  const subtitle = 'artist' in item && item.artist ? `<span>${escapeHtml(item.artist)}</span>` : '';
  const action = view === 'albums' ? 'play-album' : 'play-playlist';
  return `<li><button type="button" class="collection-item" data-action="${action}" data-id="${escapeHtml(item.id)}" data-title="${escapeHtml(item.name)}"><strong>${escapeHtml(item.name)}</strong>${subtitle}</button></li>`;
}

function renderPlayingScreen(): void {
  if (!app || screen.kind !== 'playing') {
    return;
  }

  const { queue } = screen;
  const currentTrack = queue.tracks[queue.currentIndex];
  if (!currentTrack) {
    throw new Error('The playback queue has no active track.');
  }

  const statusText: Record<typeof queue.status, string> = {
    loading: 'Loading track…',
    playing: 'Playing',
    paused: 'Paused',
    error: 'Playback failed',
    ended: 'Queue complete'
  };
  const controls =
    queue.status === 'loading'
      ? `<button type="button" data-action="play-toggle" disabled>Loading…</button>`
      : queue.status === 'error'
        ? `<button type="button" data-action="retry-playback">Retry</button>`
        : `<button type="button" data-action="play-toggle">${queue.status === 'playing' ? 'Pause' : 'Play'}</button>`;

  app.innerHTML = `
    <section class="app-shell player-shell" aria-labelledby="app-title">
      <p class="eyebrow">Now playing</p>
      <h1 id="app-title">${escapeHtml(currentTrack.title)}</h1>
      <p class="description">${escapeHtml(currentTrack.artist ?? screen.collectionTitle)} · ${escapeHtml(screen.collectionTitle)}</p>
      <p class="playback-status ${queue.status === 'error' ? 'error' : ''}" role="${queue.status === 'error' ? 'alert' : 'status'}">${queue.status === 'error' ? escapeHtml(queue.error ?? 'The track could not be played.') : statusText[queue.status]}</p>
      <div class="transport-controls" aria-label="Playback controls">
        <button type="button" data-action="previous-track" ${queue.currentIndex === 0 ? 'disabled' : ''}>Previous</button>
        ${controls}
        <button type="button" data-action="next-track" ${queue.currentIndex + 1 >= queue.tracks.length ? 'disabled' : ''}>Next</button>
        <button class="secondary-button" type="button" data-action="stop-playback">Stop</button>
      </div>
      <label class="volume-control" for="volume">Volume
        <input id="volume" data-action="volume" type="range" min="0" max="1" step="0.01" value="${queue.volume}" />
      </label>
      <h2>Queue</h2>
      <ol class="queue-list">
        ${queue.tracks.map((track, index) => `<li ${index === queue.currentIndex ? 'aria-current="true"' : ''}><span>${escapeHtml(track.title)}</span>${track.artist ? `<small>${escapeHtml(track.artist)}</small>` : ''}</li>`).join('')}
      </ol>
    </section>
  `;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

async function submitServerForm(form: HTMLFormElement): Promise<void> {
  const formData = new FormData(form);
  const input = String(formData.get('serverUrl') ?? '');
  try {
    const serverUrl = normalizeServerUrl(input);
    saveServerUrl(serverUrl);
    client = undefined;
    screen = { kind: 'login', serverUrl };
  } catch (error) {
    screen = {
      kind: 'server-setup',
      serverUrl: input,
      error: getErrorMessage(error)
    };
  }
  render();
}

async function submitLoginForm(form: HTMLFormElement): Promise<void> {
  if (screen.kind !== 'login') {
    return;
  }

  const serverUrl = screen.serverUrl;
  const formData = new FormData(form);
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');
  screen = { kind: 'login', serverUrl, busy: true };
  render();

  try {
    const candidate = new SubsonicClient(serverUrl, { username, password });
    await candidate.ping();
    client = candidate;
    const folders = await candidate.getMusicFolders();
    const selection = resolveFolderSelection(folders);
    if (selection.kind === 'empty') {
      screen = { kind: 'no-folders', serverUrl };
    } else if (selection.kind === 'choose') {
      screen = { kind: 'folder-selection', serverUrl, folders: selection.folders };
    } else {
      await openFolder(selection.folder, serverUrl);
    }
  } catch (error) {
    client = undefined;
    screen = { kind: 'login', serverUrl, error: getErrorMessage(error) };
  }
  render();
}

async function openFolder(folder: MusicFolder, serverUrl: string): Promise<void> {
  const browse: BrowseScreen = {
    kind: 'browse',
    serverUrl,
    folder,
    view: 'albums',
    status: 'loading',
    albums: null,
    playlists: null
  };
  await loadLibraryView(browse, 'albums');
}

async function loadLibraryView(
  current: BrowseScreen,
  view: BrowseView,
  forceReload = false
): Promise<void> {
  if (!client) {
    throw new Error('Authenticated server client was not initialized.');
  }

  const requestId = ++libraryRequestId;
  const next = switchBrowseView(current, view);
  if (!forceReload && next.status === 'ready') {
    screen = next;
    render();
    return;
  }

  screen = { ...next, status: 'loading', error: undefined };
  render();
  try {
    if (view === 'albums') {
      const albums = await client.getAlbums(current.folder.id);
      if (requestId === libraryRequestId) {
        screen = { ...next, albums, status: 'ready', error: undefined };
      }
    } else {
      const playlists = await client.getPlaylists();
      if (requestId === libraryRequestId) {
        screen = { ...next, playlists, status: 'ready', error: undefined };
      }
    }
  } catch (error) {
    if (requestId === libraryRequestId) {
      screen = { ...next, status: 'error', error: getErrorMessage(error) };
    }
  }
  render();
}

async function loadCollection(
  current: BrowseScreen,
  kind: 'album' | 'playlist',
  id: string,
  title: string
): Promise<void> {
  if (!client) {
    throw new Error('Authenticated server client was not initialized.');
  }

  const requestId = ++collectionRequestId;
  screen = {
    kind: 'loading-collection',
    serverUrl: current.serverUrl,
    folder: current.folder,
    title,
    returnTo: current
  };
  render();

  try {
    const tracks = kind === 'album'
      ? await client.getAlbumTracks(id)
      : await client.getPlaylistTracks(id);
    if (requestId !== collectionRequestId) {
      return;
    }
    beginPlayback(current, title, tracks);
  } catch (error) {
    if (requestId === collectionRequestId) {
      screen = {
        ...current,
        notice: `Could not load tracks: ${getErrorMessage(error)}`
      };
      render();
    }
  }
}

function beginPlayback(returnTo: BrowseScreen, title: string, tracks: Track[]): void {
  const queue = createPlaybackQueue(tracks);
  if (!queue) {
    screen = { ...returnTo, notice: 'This collection has no playable tracks.' };
    render();
    return;
  }
  screen = { kind: 'playing', collectionTitle: title, queue, returnTo };
  render();
  void loadCurrentTrack();
}

function updatePlayback(
  update: (queue: PlaybackState) => PlaybackState
): void {
  if (screen.kind !== 'playing') {
    return;
  }
  screen = { ...screen, queue: update(screen.queue) };
  render();
}

async function loadCurrentTrack(): Promise<void> {
  if (screen.kind !== 'playing') {
    return;
  }
  if (!client) {
    reportPlaybackFailure('The server connection is no longer available.');
    return;
  }

  const currentScreen = screen;
  const track = currentScreen.queue.tracks[currentScreen.queue.currentIndex];
  if (!track) {
    reportPlaybackFailure('The current track is unavailable.');
    return;
  }
  const attemptId = ++playbackAttemptId;
  const queue = setPlaybackStatus(currentScreen.queue, 'loading');
  screen = { ...currentScreen, queue };
  render();
  audio.pause();
  audio.src = client.createStreamUrl(track.id);
  audio.volume = queue.volume;

  try {
    await audio.play();
    if (
      attemptId === playbackAttemptId &&
      screen.kind === 'playing' &&
      screen.queue.currentIndex === queue.currentIndex
    ) {
      updatePlayback((current) => setPlaybackStatus(current, 'playing'));
    }
  } catch (error) {
    if (attemptId === playbackAttemptId) {
      reportPlaybackFailure(`Could not play "${track.title}": ${getErrorMessage(error)}`);
    }
  }
}

async function resumePlayback(): Promise<void> {
  if (screen.kind !== 'playing') {
    return;
  }

  if (screen.queue.status === 'ended') {
    audio.currentTime = 0;
    await loadCurrentTrack();
    return;
  }

  const attemptId = ++playbackAttemptId;
  updatePlayback((queue) => setPlaybackStatus(queue, 'loading'));
  try {
    await audio.play();
    if (attemptId === playbackAttemptId && screen.kind === 'playing') {
      updatePlayback((queue) => setPlaybackStatus(queue, 'playing'));
    }
  } catch (error) {
    if (attemptId === playbackAttemptId) {
      reportPlaybackFailure(`Could not resume playback: ${getErrorMessage(error)}`);
    }
  }
}

function pausePlayback(): void {
  if (screen.kind !== 'playing') {
    return;
  }
  playbackAttemptId += 1;
  screen = {
    ...screen,
    queue: setPlaybackStatus(screen.queue, 'paused')
  };
  audio.pause();
  render();
}

function reportPlaybackFailure(message: string): void {
  if (screen.kind !== 'playing') {
    return;
  }
  playbackAttemptId += 1;
  screen = {
    ...screen,
    queue: setPlaybackStatus(screen.queue, 'error', message)
  };
  render();
}

function navigatePlayback(direction: 'next' | 'previous'): void {
  if (screen.kind !== 'playing') {
    return;
  }
  const queue =
    direction === 'next' ? nextTrack(screen.queue) : previousTrack(screen.queue);
  if (queue.currentIndex !== screen.queue.currentIndex) {
    screen = { ...screen, queue };
    void loadCurrentTrack();
  }
}

function stopPlayback(): void {
  if (screen.kind !== 'playing') {
    return;
  }
  playbackAttemptId += 1;
  collectionRequestId += 1;
  const returnTo = screen.returnTo;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  screen = returnTo;
  render();
}

audio.addEventListener('playing', () => {
  if (screen.kind === 'playing' && screen.queue.status === 'loading') {
    updatePlayback((queue) => setPlaybackStatus(queue, 'playing'));
  }
});

audio.addEventListener('pause', () => {
  if (screen.kind === 'playing' && screen.queue.status === 'playing') {
    updatePlayback((queue) => setPlaybackStatus(queue, 'paused'));
  }
});

audio.addEventListener('ended', () => {
  if (screen.kind !== 'playing') {
    return;
  }
  const oldIndex = screen.queue.currentIndex;
  const queue = advanceAfterTrackEnd(screen.queue);
  screen = { ...screen, queue };
  render();
  if (queue.currentIndex !== oldIndex) {
    void loadCurrentTrack();
  }
});

audio.addEventListener('error', () => {
  reportPlaybackFailure('The media stream could not be loaded or played.');
});

app.addEventListener('submit', (event) => {
  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  event.preventDefault();
  if (event.target.id === 'server-form') {
    void submitServerForm(event.target);
  } else if (event.target.id === 'login-form') {
    void submitLoginForm(event.target);
  }
});

app.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }
  const button = event.target.closest<HTMLButtonElement>('[data-action]');
  if (!button || button.disabled) {
    return;
  }

  if (button.dataset.action === 'back-to-server' && screen.kind === 'login') {
    client = undefined;
    libraryRequestId += 1;
    screen = { kind: 'server-setup', serverUrl: screen.serverUrl };
    render();
  } else if (
    button.dataset.action === 'back-to-login' &&
    (screen.kind === 'folder-selection' || screen.kind === 'no-folders' || screen.kind === 'browse')
  ) {
    client = undefined;
    libraryRequestId += 1;
    screen = { kind: 'login', serverUrl: screen.serverUrl };
    render();
  } else if (button.dataset.action === 'select-folder' && screen.kind === 'folder-selection') {
    const folder = screen.folders.find((item) => item.id === button.dataset.folderId);
    if (folder) {
      void openFolder(folder, screen.serverUrl);
    }
  } else if (
    (button.dataset.action === 'show-albums' || button.dataset.action === 'show-playlists') &&
    screen.kind === 'browse'
  ) {
    const view = button.dataset.action === 'show-albums' ? 'albums' : 'playlists';
    void loadLibraryView(screen, view);
  } else if (button.dataset.action === 'retry-library' && screen.kind === 'browse') {
    void loadLibraryView(screen, screen.view, true);
  } else if (
    (button.dataset.action === 'play-album' || button.dataset.action === 'play-playlist') &&
    screen.kind === 'browse'
  ) {
    const itemId = button.dataset.id;
    const title = button.dataset.title;
    if (itemId && title) {
      void loadCollection(
        screen,
        button.dataset.action === 'play-album' ? 'album' : 'playlist',
        itemId,
        title
      );
    }
  } else if (button.dataset.action === 'cancel-collection' && screen.kind === 'loading-collection') {
    collectionRequestId += 1;
    screen = screen.returnTo;
    render();
  } else if (button.dataset.action === 'play-toggle' && screen.kind === 'playing') {
    if (screen.queue.status === 'playing') {
      pausePlayback();
    } else if (screen.queue.status === 'paused' || screen.queue.status === 'ended') {
      void resumePlayback();
    }
  } else if (button.dataset.action === 'retry-playback' && screen.kind === 'playing') {
    void loadCurrentTrack();
  } else if (button.dataset.action === 'next-track' && screen.kind === 'playing') {
    navigatePlayback('next');
  } else if (button.dataset.action === 'previous-track' && screen.kind === 'playing') {
    navigatePlayback('previous');
  } else if (button.dataset.action === 'stop-playback' && screen.kind === 'playing') {
    stopPlayback();
  }
});

app.addEventListener('input', (event) => {
  if (
    !(event.target instanceof HTMLInputElement) ||
    event.target.dataset.action !== 'volume' ||
    screen.kind !== 'playing'
  ) {
    return;
  }
  const queue = setPlaybackVolume(screen.queue, Number(event.target.value));
  screen = { ...screen, queue };
  audio.volume = queue.volume;
});

render();
