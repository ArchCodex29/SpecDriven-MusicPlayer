# Proposal

## Why

The current centered-card screens and in-flow playback controls do not make the best use of a small phone viewport or narrow browser side panel. A compact, familiar navigation model, scannable album rows, and stable playback controls would make the player easier to use without adding drawer menus or unnecessary persistent library chrome.

## What Changes

- Add a simple Home hub for Albums, Playlists, and changing the selected library, without a navigation drawer or a persistent selected-library banner.
- Show available album artwork alongside the album title and artist in the album list.
- Keep a compact mini-player available while browsing and let users expand or minimize the player while retaining a predictable transport-control position.
- Adapt the expanded player to viewport shape: a bottom control area in portrait and a wide, vertically centered control layout in landscape.
- Rework the responsive layout for comfortable use on small phones and in browser side panels.
- Centralize the app's color palette in semantic CSS custom properties so each color role can be changed in one place, without adding a user-facing theme selector.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `library-browsing`: Add Home-based navigation, album artwork and artist/title presentation, and access to library switching.
- `server-connection`: Allow changing the selected music folder while authenticated.
- `audio-playback`: Keep playback controls available across browsing and adapt the expanded player layout to the viewport.

## Impact

- Affects the rendered screens and responsive styles in `src/main.ts` and `src/style.css`.
- Replaces scattered stylesheet color literals with centrally defined color tokens in `src/style.css`.
- Uses album cover-art identifiers already returned by the Subsonic API; add authenticated cover-art URL support in `src/subsonic.ts`.
- Updates the library-browsing, server-connection, and audio-playback behavior specifications and their focused tests.
