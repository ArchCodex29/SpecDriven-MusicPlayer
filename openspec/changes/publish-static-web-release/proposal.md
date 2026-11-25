# Proposal

## Why

The app is currently usable only from a local development environment, with no repeatable way to publish it for everyday use or let others try it. Publishing the static client to GitHub Pages and attaching versioned build files to GitHub Releases provides both a public bring-your-own-server demo and a downloadable release without introducing a backend.

## What Changes

- Publish the latest static app to GitHub Pages from the default branch.
- Build and attach a ZIP of the static app to GitHub Releases for `vMAJOR.MINOR.PATCH` tags matching the version in `package.json`.
- Make the static build usable both under the GitHub Pages project path and when served from a different path, and document the expected HTTPS, CORS, and local-serving requirements.
- Defer a desktop launcher or installer; this change distributes the existing browser app only.

## Capabilities

### New Capabilities

- `release-delivery`: Publish the browser app as a Pages demo and provide versioned static build downloads.

### Modified Capabilities

None.

## Impact

- GitHub Actions workflows and repository Pages configuration.
- Vite build configuration and static output path handling.
- README release and usage documentation.
- No application backend or runtime dependency is introduced. Users continue connecting directly from their browser to their own HTTPS Subsonic-compatible server.
