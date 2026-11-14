# Design

## Context

The project is greenfield: it has a product README and OpenSpec configuration but no application source, tests, or dependency manifest. The user selected Vite with plain TypeScript and agreed to remember only the server URL, keep login material in memory, and show all permitted playlists independently of the selected music folder. See proposal.md and the capability specs for the product behavior.

## Goals / Non-Goals

**Goals:**
- Keep the app a small static browser client with minimal dependencies and no application server.
- Keep screen and playback state explicit and easy to test.
- Avoid persistent storage of credentials and reusable authentication material.

**Non-Goals:**
- Add a framework, client-side routing package, general-purpose state-management library, or backend proxy.
- Support playlist editing, server administration, or multi-server account management.
- Claim compatibility with every Subsonic-compatible server before browser access is validated.

## Decisions

### Use Vite with plain TypeScript and a small state-driven SPA

Use Vite for development and production bundling, with TypeScript and browser APIs for the app. Represent the main flow as explicit states (server setup, login, folder selection when needed, browsing, and playing) and render the corresponding view. Keep API calls, playback state, and view rendering separated into small modules without introducing a framework or routing/state dependency.

This fits the agreed lightweight starting point. A UI framework could add component conventions, but it is unnecessary for the initial flow and can be reconsidered if the UI grows. Use Vitest as a development-only test runner because it integrates with Vite and can cover API and state logic without adding a runtime dependency.

### Call the Subsonic REST API directly from the browser

Use browser `fetch` for REST calls and a native HTML audio element for track streaming and media controls. Send the selected music-folder ID for album queries. Retrieve playlists through the permitted-playlists endpoint without a folder filter, matching the API and agreed UI behavior. Build the playback queue from the selected album or playlist's returned track order.

A backend proxy would avoid browser cross-origin restrictions but adds a service and deployment burden. Keep it out of the first version and validate direct browser access against the intended server before implementing the full integration.

### Persist only the server URL

Store the server URL in browser local storage. Keep the username and password in runtime memory for the active page session only, and clear the in-memory authentication context on reload or logout. For Subsonic token authentication, generate request authentication values from the in-memory password and a fresh random salt per request; use a small browser-compatible MD5 implementation because Web Crypto does not provide MD5. Verify the implementation against the protocol's published example and do not persist or log derived values.

This preserves the agreed returning-visit flow without treating a password-derived API value as a server-issued session token. HTTPS is required for server communication.

### Keep playback state small and queue-oriented

Maintain the active collection, ordered track list, current track index, playback status, and volume as explicit state. Drive state changes from native media events and user controls; use the browser's audio element rather than Web Audio because this app needs straightforward streaming and transport controls, not audio processing.

## Risks / Trade-offs

- Direct REST or stream requests may be blocked by the target server's CORS policy or mixed-content restrictions. Verify login, browsing, and streaming from the browser early; if unsupported, pause and revisit the no-backend boundary rather than silently adding a proxy.
- Subsonic-compatible servers can differ in API versions and behavior. Validate authentication, album listing, playlist loading, and stream playback against the intended server before claiming compatibility.
- Authentication parameters are part of REST request URLs under the standard protocol. Use HTTPS, generate fresh salt/token values per request, and avoid logging or persisting authenticated URLs.
- Browser codec support varies. Report media errors and keep retry/skip recovery visible instead of assuming every server stream will play.

## Migration Plan

There is no existing application or persisted app data to migrate. Create the Vite app as a new frontend. Rollback consists of removing the new application and its dependencies; the saved server URL is local to the browser and can be cleared by the user.

