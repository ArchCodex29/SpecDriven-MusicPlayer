import {
  createBrowseScreen,
  createHomeScreen,
  getInitialScreen,
  resolveFolderSelection,
  selectMusicFolder,
  switchBrowseView,
  type AppScreen,
  type BrowseScreen,
  type BrowseView,
  type HomeScreen
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
import { renderAlbumArtwork as renderAlbumArtworkMarkup } from './library-ui';
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
let playback: { collectionTitle: string; queue: PlaybackState } | undefined;
let playerExpanded = false;
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

  if (playback && playerExpanded) {
    document.body.classList.remove('has-mini-player');
    app.innerHTML = renderExpandedPlayer();
    return;
  }

  if (screen.kind === 'server-setup') {
    const serverUrl = escapeHtml(screen.serverUrl ?? '');
    setAppMarkup(`
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
    `);
    return;
  }

  if (screen.kind === 'login') {
    setAppMarkup(`
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
    `);
    return;
  }

  if (screen.kind === 'folder-selection') {
    setAppMarkup(`
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">Choose a music folder</h1>
        <p class="description">Select the library you want to browse.</p>
        <ul class="folder-list">
          ${screen.folders.map((folder) => `
            <li><button type="button" class="folder-button" data-action="select-folder" data-folder-id="${escapeHtml(folder.id)}">${escapeHtml(folder.name)}</button></li>
          `).join('')}
        </ul>
        <button class="secondary-button" type="button" data-action="${screen.returnTo ? 'back-to-home' : 'back-to-login'}">${screen.returnTo ? 'Back to Home' : 'Back to login'}</button>
      </section>
    `);
    return;
  }

  if (screen.kind === 'no-folders') {
    setAppMarkup(`
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">No music folders found</h1>
        <p class="description">This account has no music folders available on the server.</p>
        <button type="button" data-action="back-to-login">Back to login</button>
      </section>
    `);
    return;
  }

  if (screen.kind === 'loading-collection') {
    setAppMarkup(`
      <section class="app-shell" aria-labelledby="app-title">
        <p class="eyebrow">Small Music Player</p>
        <h1 id="app-title">Loading ${escapeHtml(screen.title)}</h1>
        <p class="description" role="status">Loading tracks…</p>
        <button class="secondary-button" type="button" data-action="cancel-collection">Back to library</button>
      </section>
    `);
    return;
  }

  if (screen.kind === 'home') {
    renderHomeScreen(screen);
  } else {
    renderBrowseScreen(screen);
  }
}

function setAppMarkup(markup: string): void {
  if (app) {
    document.body.classList.toggle('has-mini-player', Boolean(playback));
    app.innerHTML = `${markup}${playback ? renderMiniPlayer() : ''}`;
  }
}

function renderHomeScreen(home: HomeScreen): void {
  const canChangeLibrary = home.folders.length > 1;
  setAppMarkup(`
    <section class="app-shell home-shell" aria-labelledby="app-title">
      <p class="eyebrow">Small Music Player</p>
      <h1 id="app-title">Home</h1>
      <p class="description">Library: <strong>${escapeHtml(home.folder.name)}</strong></p>
      <nav class="home-actions" aria-label="Music library">
        <button type="button" data-action="open-albums">Albums</button>
        <button type="button" data-action="open-playlists">Playlists</button>
        ${canChangeLibrary ? '<button class="secondary-button" type="button" data-action="change-library">Change library</button>' : ''}
      </nav>
      <button class="secondary-button" type="button" data-action="sign-out">Sign out</button>
    </section>
  `);
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

  setAppMarkup(`
    <section class="app-shell library-shell" aria-labelledby="app-title">
      <p class="eyebrow">Small Music Player</p>
      <div class="library-heading">
        <div>
          <h1 id="app-title">${isAlbums ? 'Albums' : 'Playlists'}</h1>
        </div>
        <button class="secondary-button back-button" type="button" data-action="go-home">Home</button>
      </div>
      ${browse.notice ? `<p class="error" role="alert">${escapeHtml(browse.notice)}</p>` : ''}
      ${collectionMarkup}
    </section>
  `);
}

function renderCollectionItem(item: Album | Playlist, view: BrowseView): string {
  const isAlbum = 'artist' in item;
  const subtitle = isAlbum
    ? `<span class="collection-artist">${escapeHtml(item.artist || 'Unknown artist')}</span>`
    : '';
  const artwork = isAlbum ? renderAlbumArtwork(item) : '';
  const action = view === 'albums' ? 'play-album' : 'play-playlist';
  return `<li><button type="button" class="collection-item${isAlbum ? ' album-row' : ''}" data-action="${action}" data-id="${escapeHtml(item.id)}" data-title="${escapeHtml(item.name)}">${artwork}<span class="collection-copy"><strong>${escapeHtml(item.name)}</strong>${subtitle}</span></button></li>`;
}

function renderAlbumArtwork(album: Album): string {
  const coverArtUrl = album.coverArt && client
    ? client.createCoverArtUrl(album.coverArt)
    : undefined;
  return renderAlbumArtworkMarkup(coverArtUrl);
}

function renderMiniPlayer(): string {
  if (!playback) {
    return '';
  }
  const { queue } = playback;
  const currentTrack = queue.tracks[queue.currentIndex];
  if (!currentTrack) {
    throw new Error('The playback queue has no active track.');
  }
  const playLabel = queue.status === 'playing' ? 'Pause' : queue.status === 'loading' ? 'Loading' : 'Play';
  const playAction = queue.status === 'error' ? 'retry-playback' : 'play-toggle';
  return `
    <aside class="mini-player" aria-label="Mini player">
      <div class="mini-player-track">
        <strong>${escapeHtml(currentTrack.title)}</strong>
        <span>${escapeHtml(currentTrack.artist ?? playback.collectionTitle)}</span>
      </div>
      <div class="mini-player-controls" aria-label="Playback controls">
        <button type="button" data-action="previous-track" aria-label="Previous track" ${queue.currentIndex === 0 ? 'disabled' : ''}>Previous</button>
        <button type="button" data-action="${playAction}" ${queue.status === 'loading' ? 'disabled' : ''}>${queue.status === 'error' ? 'Retry' : playLabel}</button>
        <button type="button" data-action="next-track" aria-label="Next track" ${queue.currentIndex + 1 >= queue.tracks.length ? 'disabled' : ''}>Next</button>
        <button type="button" data-action="expand-player">Expand</button>
        <button class="secondary-button" type="button" data-action="stop-playback">Stop</button>
      </div>
    </aside>
  `;
}

function renderExpandedPlayer(): string {
  if (!playback) {
    return '';
  }
  const { queue } = playback;
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

  return `
    <section class="app-shell player-shell expanded-player" aria-labelledby="app-title">
      <div class="player-layout">
        <div class="player-information">
          <p class="eyebrow">Now playing</p>
          <h1 id="app-title">${escapeHtml(currentTrack.title)}</h1>
          <p class="description">${escapeHtml(currentTrack.artist ?? playback.collectionTitle)} · ${escapeHtml(playback.collectionTitle)}</p>
          <p class="playback-status ${queue.status === 'error' ? 'error' : ''}" role="${queue.status === 'error' ? 'alert' : 'status'}">${queue.status === 'error' ? escapeHtml(queue.error ?? 'The track could not be played.') : statusText[queue.status]}</p>
          <h2>Queue</h2>
          <ol class="queue-list">
            ${queue.tracks.map((track, index) => `<li ${index === queue.currentIndex ? 'aria-current="true"' : ''}><span>${escapeHtml(track.title)}</span>${track.artist ? `<small>${escapeHtml(track.artist)}</small>` : ''}</li>`).join('')}
          </ol>
        </div>
        <div class="player-control-area">
          <div class="transport-controls" aria-label="Playback controls">
            <button type="button" data-action="previous-track" aria-label="Previous track" ${queue.currentIndex === 0 ? 'disabled' : ''}>Previous</button>
            ${controls}
            <button type="button" data-action="next-track" aria-label="Next track" ${queue.currentIndex + 1 >= queue.tracks.length ? 'disabled' : ''}>Next</button>
            <button class="secondary-button" type="button" data-action="stop-playback">Stop</button>
            <button class="secondary-button" type="button" data-action="minimize-player">Minimize</button>
          </div>
          <label class="volume-control" for="volume">Volume
            <input id="volume" data-action="volume" type="range" min="0" max="1" step="0.01" value="${queue.volume}" />
          </label>
        </div>
      </div>
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
      openHome(serverUrl, selection.folder, folders);
    }
  } catch (error) {
    client = undefined;
    screen = { kind: 'login', serverUrl, error: getErrorMessage(error) };
  }
  render();
}

function openHome(serverUrl: string, folder: MusicFolder, folders: MusicFolder[]): void {
  screen = createHomeScreen(serverUrl, folder, folders);
  render();
}

function openLibrary(home: HomeScreen, view: BrowseView): void {
  const browse = createBrowseScreen(home, view);
  void loadLibraryView(browse, view);
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
  screen = returnTo;
  playback = { collectionTitle: title, queue };
  playerExpanded = true;
  render();
  void loadCurrentTrack();
}

function updatePlayback(
  update: (queue: PlaybackState) => PlaybackState
): void {
  if (!playback) {
    return;
  }
  playback = { ...playback, queue: update(playback.queue) };
  render();
}

async function loadCurrentTrack(): Promise<void> {
  if (!playback) {
    return;
  }
  if (!client) {
    reportPlaybackFailure('The server connection is no longer available.');
    return;
  }

  const currentPlayback = playback;
  const track = currentPlayback.queue.tracks[currentPlayback.queue.currentIndex];
  if (!track) {
    reportPlaybackFailure('The current track is unavailable.');
    return;
  }
  const attemptId = ++playbackAttemptId;
  const queue = setPlaybackStatus(currentPlayback.queue, 'loading');
  playback = { ...currentPlayback, queue };
  render();
  audio.pause();
  audio.src = client.createStreamUrl(track.id);
  audio.volume = queue.volume;

  try {
    await audio.play();
    if (
      attemptId === playbackAttemptId &&
      playback &&
      playback.queue.currentIndex === queue.currentIndex
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
  if (!playback) {
    return;
  }

  if (playback.queue.status === 'ended') {
    audio.currentTime = 0;
    await loadCurrentTrack();
    return;
  }

  const attemptId = ++playbackAttemptId;
  updatePlayback((queue) => setPlaybackStatus(queue, 'loading'));
  try {
    await audio.play();
    if (attemptId === playbackAttemptId && playback) {
      updatePlayback((queue) => setPlaybackStatus(queue, 'playing'));
    }
  } catch (error) {
    if (attemptId === playbackAttemptId) {
      reportPlaybackFailure(`Could not resume playback: ${getErrorMessage(error)}`);
    }
  }
}

function pausePlayback(): void {
  if (!playback) {
    return;
  }
  playbackAttemptId += 1;
  playback = { ...playback, queue: setPlaybackStatus(playback.queue, 'paused') };
  audio.pause();
  render();
}

function reportPlaybackFailure(message: string): void {
  if (!playback) {
    return;
  }
  playbackAttemptId += 1;
  playback = { ...playback, queue: setPlaybackStatus(playback.queue, 'error', message) };
  render();
}

function navigatePlayback(direction: 'next' | 'previous'): void {
  if (!playback) {
    return;
  }
  const queue =
    direction === 'next' ? nextTrack(playback.queue) : previousTrack(playback.queue);
  if (queue.currentIndex !== playback.queue.currentIndex) {
    playback = { ...playback, queue };
    void loadCurrentTrack();
  }
}

function stopPlayback(): void {
  if (!playback) {
    return;
  }
  playbackAttemptId += 1;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  playback = undefined;
  playerExpanded = false;
  render();
}

function signOut(serverUrl: string): void {
  playbackAttemptId += 1;
  libraryRequestId += 1;
  collectionRequestId += 1;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  playback = undefined;
  playerExpanded = false;
  client = undefined;
  screen = { kind: 'login', serverUrl };
  render();
}

audio.addEventListener('playing', () => {
  if (playback?.queue.status === 'loading') {
    updatePlayback((queue) => setPlaybackStatus(queue, 'playing'));
  }
});

audio.addEventListener('pause', () => {
  if (playback?.queue.status === 'playing') {
    updatePlayback((queue) => setPlaybackStatus(queue, 'paused'));
  }
});

audio.addEventListener('ended', () => {
  if (!playback) {
    return;
  }
  const oldIndex = playback.queue.currentIndex;
  const queue = advanceAfterTrackEnd(playback.queue);
  playback = { ...playback, queue };
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
    (screen.kind === 'folder-selection' || screen.kind === 'no-folders')
  ) {
    client = undefined;
    libraryRequestId += 1;
    screen = { kind: 'login', serverUrl: screen.serverUrl };
    render();
  } else if (button.dataset.action === 'back-to-home' && screen.kind === 'folder-selection' && screen.returnTo) {
    screen = screen.returnTo;
    render();
  } else if (button.dataset.action === 'select-folder' && screen.kind === 'folder-selection') {
    const folder = screen.folders.find((item) => item.id === button.dataset.folderId);
    if (folder) {
      const home = screen.returnTo
        ? selectMusicFolder(screen.returnTo, folder)
        : createHomeScreen(screen.serverUrl, folder, screen.folders);
      libraryRequestId += 1;
      screen = home;
      render();
    }
  } else if (
    (button.dataset.action === 'open-albums' || button.dataset.action === 'open-playlists') &&
    screen.kind === 'home'
  ) {
    openLibrary(screen, button.dataset.action === 'open-albums' ? 'albums' : 'playlists');
  } else if (button.dataset.action === 'change-library' && screen.kind === 'home') {
    screen = { kind: 'folder-selection', serverUrl: screen.serverUrl, folders: screen.folders, returnTo: screen };
    render();
  } else if (button.dataset.action === 'go-home' && screen.kind === 'browse') {
    libraryRequestId += 1;
    screen = createHomeScreen(screen.serverUrl, screen.folder, screen.folders);
    render();
  } else if (button.dataset.action === 'sign-out' && screen.kind === 'home') {
    signOut(screen.serverUrl);
  } else if (
    button.dataset.action === 'retry-library' &&
    screen.kind === 'browse'
  ) {
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
  } else if (button.dataset.action === 'play-toggle' && playback) {
    if (playback.queue.status === 'playing') {
      pausePlayback();
    } else if (playback.queue.status === 'paused' || playback.queue.status === 'ended') {
      void resumePlayback();
    }
  } else if (button.dataset.action === 'retry-playback' && playback) {
    void loadCurrentTrack();
  } else if (button.dataset.action === 'next-track' && playback) {
    navigatePlayback('next');
  } else if (button.dataset.action === 'previous-track' && playback) {
    navigatePlayback('previous');
  } else if (button.dataset.action === 'stop-playback' && playback) {
    stopPlayback();
  } else if (button.dataset.action === 'expand-player' && playback) {
    playerExpanded = true;
    render();
  } else if (button.dataset.action === 'minimize-player' && playback) {
    playerExpanded = false;
    render();
  }
});

app.addEventListener('error', (event) => {
  if (!(event.target instanceof HTMLImageElement) || !event.target.matches('.album-art-image')) {
    return;
  }
  event.target.hidden = true;
  const placeholder = event.target.parentElement?.querySelector<HTMLElement>('.album-art-placeholder');
  if (placeholder) {
    placeholder.hidden = false;
  }
}, true);

app.addEventListener('input', (event) => {
  if (
    !(event.target instanceof HTMLInputElement) ||
    event.target.dataset.action !== 'volume' ||
    !playback
  ) {
    return;
  }
  const queue = setPlaybackVolume(playback.queue, Number(event.target.value));
  playback = { ...playback, queue };
  audio.volume = queue.volume;
});

render();
