# Tasks

## 1. Extension Build and Launch

- [x] 1.1 Add a separate Manifest V3 extension build target and verify it emits a locally loadable extension directory without changing the existing static build output.
- [x] 1.2 Add the toolbar action that opens the bundled player in a tab; verify in current stable Chrome that it opens only on click and that the extension has no content scripts or unrelated-page activity.

## 2. Server Permissions and Playback

- [x] 2.1 Request optional access to only the configured HTTPS server after the user initiates connection; test permission grant and denial paths and verify no host access is granted at installation.
- [x] 2.2 Verify login, library browsing, cover art, stream playback, and seeking in Chromium after granting server access; if native audio requests are blocked, implement the smallest extension-compatible stream path and verify it without broadening granted origins or requiring server changes.
- [x] 2.3 Document downloading and extracting the extension ZIP, enabling developer mode, loading the extracted folder, updating the extension, the per-server permission prompt, and the HTTPS server requirement; verify the instructions from a clean browser profile.

## 3. Release Integration

- [x] 3.1 Update the matching-version GitHub Release workflow to attach a separately named extension ZIP alongside the static-client ZIP; verify both assets are present and the extension ZIP contains a loadable folder with its manifest.
- [x] 3.2 Run the extension build together with `npm run build`, `npm test`, and `npm run check:static`; verify the Pages and static ZIP artifacts remain unchanged and usable.
