# Design

## Context

See `proposal.md` for motivation and `specs/release-delivery/spec.md` for the user-visible contract. The app is a Vite-built static client; the same UI currently uses browser `fetch` for Subsonic API calls and an `Audio` element for streams. The existing build is deployed to Pages and packaged as a static ZIP.

## Goals / Non-Goals

**Goals:**
- Add an extension build without changing the existing static build output or its publishing workflows.
- Use a user-invoked toolbar action to open the bundled UI in a normal extension tab.
- Avoid webpage injection, broad granted host access, or background activity unrelated to the player.
- Reuse the current client, URL persistence, and in-memory credential behavior where possible.

**Non-Goals:**
- Replace or deprecate the Pages demo or static ZIP release.
- Play audio after the user closes the player tab.
- Support non-Chromium browsers in the first version.
- Publish through a browser extension store or install by directly opening the ZIP.

## Decisions

1. **Build a separate extension target.** Keep the current Vite static build and its release jobs intact. Add a distinct extension output containing the manifest, bundled UI, and click handler. This avoids extension-specific metadata or paths leaking into the Pages and static ZIP artifacts.

2. **Open an extension page in a tab from an explicit toolbar click.** Use the browser's event-driven extension action to open the bundled app page. Do not register content scripts, observe navigation, or add permissions for general tab inspection. The player runs in the tab, so normal background-tab playback works while that tab remains open; closing it ends that page's playback.

3. **Request optional host access on connection.** Declare only the optional HTTPS host pattern needed to support user-configured servers, then request the specific configured server origin after the user submits the server URL and explicitly connects. Do not grant the permission at installation or request access to unrelated origins. Keep the existing HTTPS-only server constraint and do not persist login credentials.

4. **Validate media requests before choosing a workaround.** Test API calls, cover art, stream playback, and seeking from the extension page after granting the server-origin permission. The existing app uses a native audio element for streams, whose cross-origin behavior may differ from extension-initiated API fetches. If host permission alone does not support playback, evaluate a narrowly scoped extension-side stream path before changing the server's CORS expectations.

5. **Target Chromium's common extension APIs.** Use Manifest V3 and APIs supported by Chromium-based browsers rather than vendor-specific behavior. Validate against current stable Chrome, and another Chromium-based browser when available; do not promise an unverified minimum browser version.

6. **Attach a separate extension ZIP to GitHub Releases.** Package the built extension files as a second, clearly named ZIP alongside the existing static-client ZIP for matching version releases. Put `manifest.json` and the extension's loadable files at the archive root so that after extraction the user can select that folder with the browser's **Load unpacked** action. Do not treat the ZIP itself as directly installable; Chromium browsers generally require an extension-store install or a local unpacked directory.

## Risks / Trade-offs

- [The audio element cannot stream or seek to a server with restrictive CORS headers despite the extension host permission] -> Validate streaming and seeking early; treat a proxy/stream bridge as a design decision rather than silently weakening server requirements.
- [A broad optional-host declaration could be mistaken for broad active access] -> Request permission only for the configured HTTPS origin after explicit user action, and test the actual browser permission prompt and granted origins.
- [Extension-specific build settings break the static releases] -> Use an isolated output target and run the existing static build and path checks unchanged.
- [Manual installation requires developer mode and may show browser warnings] -> Document extraction and **Load unpacked** steps, and state that users must repeat the download and load steps to update.

## Migration Plan

1. Add and locally load the separate Chromium extension build.
2. Verify toolbar-click launch, configured-origin permission grants and denial, server setup/login, browsing, artwork, and audio playback/seeking.
3. Add the extension ZIP as a separate asset to the existing matching-version GitHub Releases, leaving the Pages and static-client ZIP assets unchanged.
4. Verify the documented manual installation and update process. If extension validation fails, omit the extension asset; the existing releases remain usable without rollback.
