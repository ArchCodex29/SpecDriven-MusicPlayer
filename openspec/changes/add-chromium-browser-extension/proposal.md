# Proposal

## Why

The downloadable static release currently needs to be served over HTTP(S), which makes trying the player locally less convenient than opening an installed app. A Chromium browser extension can bundle the client and launch it directly in a tab while keeping the existing GitHub Pages demo and static ZIP available.

## What Changes

- Add an installable Chromium-based browser extension that opens the bundled player in a browser tab when the user clicks its toolbar action.
- Attach a second, separately named extension ZIP to GitHub Releases alongside the existing static-client ZIP; document extracting it and loading the unpacked extension manually.
- Request access only to the configured HTTPS Subsonic server, and only after the user initiates a connection.
- Do not inject scripts into websites or request access to unrelated pages.
- Retain the GitHub Pages deployment and downloadable static ZIP as separate ways to use the player.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `release-delivery`: Add a Chromium extension distribution option alongside the existing Pages and static ZIP releases, with click-to-open behavior and narrowly scoped server access.

## Impact

The extension will need a browser manifest, an extension-compatible build/package path, permission handling for user-configured server origins, and a distinct GitHub Release ZIP. The existing browser client makes direct API and audio-stream requests, so extension access to playback, cover art, and streaming behavior must be validated. Manual installation requires extracting the ZIP and loading its folder through the browser's extension management page; the existing Pages and static ZIP releases are not replaced.
