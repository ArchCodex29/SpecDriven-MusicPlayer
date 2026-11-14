# Proposal

## Why

The project has a product goal but no application yet. A first usable web client should prove the core journey: connect to a Subsonic server, browse its music, and play an album or playlist with familiar controls, while keeping the implementation lightweight.

## What Changes

- Establish a browser-based single-page app using Vite and plain TypeScript, with no application backend.
- Guide users through server URL setup and login. Remember the server URL for later visits, but keep credentials only in memory and require login again after reload or tab close.
- Discover the server's music folders, select the only folder automatically, or let the user choose when multiple folders are available.
- Provide album and playlist browsing. Scope albums to the selected folder; show all playlists the user is permitted to play.
- Selecting an album or playlist enters a playing state with play/pause, next/previous, stop, and volume controls.
- Handle connection, loading, empty, and playback-error states so the flow can recover visibly.

## Capabilities

### New Capabilities

- `server-connection`: Configure a Subsonic server, authenticate for the current app session, and discover its music folders.
- `library-browsing`: Browse folder-scoped albums and permitted playlists.
- `audio-playback`: Play an album or playlist and control playback.

### Modified Capabilities

None.

## Impact

- Adds a Vite + plain TypeScript frontend and its browser application structure.
- Integrates directly with a Subsonic-compatible server's REST API for authentication, music folders, albums, playlists, and streaming.
- Stores the server URL in browser storage; does not persist usernames, passwords, or reusable authentication material.
- Assumes the target server can be reached from the browser over HTTPS and permits the required cross-origin requests. Confirm this against the intended server during implementation; a backend proxy is outside this change.
- Adds no server-side service or account-management features.
