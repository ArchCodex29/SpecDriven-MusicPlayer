# Tasks

## 1. Frontend Foundation

- [ ] 1.1 Scaffold a Vite + plain TypeScript single-page app with minimal screen-state structure and npm scripts; verify the app serves in development and `npm run build` succeeds.
- [ ] 1.2 Configure Vitest and add an initial focused state test; verify `npm test` and `npm run build` both pass.
- [ ] 1.3 Update README with install, development, build, and test instructions plus the agreed MVP scope; verify every documented command matches the package scripts.

## 2. Server Connection and Authentication

- [ ] 2.1 Identify an HTTPS Subsonic-compatible server for validation and verify browser access to its REST and stream endpoints, including CORS; record the server/API version and outcome, and pause for an architecture decision if direct browser access is blocked.
- [ ] 2.2 Implement server URL setup, URL-only persistence, and the login/back-to-server flow; add tests proving the URL persists while credentials do not enter persistent storage.
- [ ] 2.3 Implement typed Subsonic requests and token authentication with fresh salt values and a browser-compatible MD5 implementation; verify the published auth example, rejected-auth handling, and that derived values are neither persisted nor logged.
- [ ] 2.4 Implement music-folder discovery and selection; test automatic selection for one folder, explicit selection for multiple folders, and visible empty/error states for no folders or failed requests.

## 3. Library Browsing

- [ ] 3.1 Implement album retrieval scoped to the selected music folder and playlist retrieval for all playlists permitted to the user; test the request parameters and returned collection handling.
- [ ] 3.2 Implement Albums/Playlists navigation with loading, empty, and retryable error states; test view switching and verify the selected folder remains unchanged.

## 4. Audio Playback

- [ ] 4.1 Load an album's or playlist's tracks in server order and start the first track in an explicit queue; test queue construction and the empty-collection case.
- [ ] 4.2 Implement native browser audio playback with play/pause, next, previous, stop, and volume controls; test state changes and track-end advancement.
- [ ] 4.3 Implement visible stream/media failure recovery with retry or skip behavior; test failure handling and verify failed playback is not shown as successful.

## 5. End-to-End Validation

- [ ] 5.1 Run a browser smoke test against the identified HTTPS server covering first visit, returning login, folder selection, folder-scoped albums, account-wide playlists, and playback controls; record the tested server/API version and results without recording credentials.
