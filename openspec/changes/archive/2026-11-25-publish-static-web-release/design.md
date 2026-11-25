# Design

## Context

See `proposal.md` for motivation. The app is a browser-only Vite client with `npm run build` and `npm test` scripts, no backend, and no existing general CI or release workflow. The client calls the visitor's Subsonic-compatible server directly; its server URL must use HTTPS. GitHub Pages serves this repository beneath a project path, while a downloaded static build may be hosted at a different path.

## Goals / Non-Goals

**Goals:**
- Keep the Pages demo and downloadable release as deployments of the existing static client.
- Make one build artifact portable across the Pages project path and root or subpath hosting.
- Validate the app before publishing either distribution.

**Non-Goals:**
- Add a project-operated Subsonic server, proxy, or sample music library.
- Package or install a desktop application; retain that as a possible later change.
- Change client authentication, playback, or credential-storage behavior.

## Decisions

1. **Use a relative Vite asset base for a portable build.** Configure generated application asset references to be relative so the same `dist/` output can load under the GitHub Pages project path and when served at a root or subpath. This avoids separate Pages and release builds with different hard-coded base paths. Validate the built output at each required path because an incorrect base would make an otherwise successful deployment unusable.

2. **Publish Pages from the default branch and GitHub Releases from matching SemVer tags.** Default-branch updates keep the public demo current. A tag in `vMAJOR.MINOR.PATCH` form produces a ZIP only when its version exactly matches `package.json`; for the current package version `0.1.0`, the matching tag is `v0.1.0`. Run dependency installation, tests, and the production build before either publishing action. Pull requests should run validation without publishing.

3. **Use the static client as a bring-your-own-server demo.** Pages hosts only the app. A visitor enters their own reachable HTTPS Subsonic-compatible server, and the browser connects to it directly. This preserves the existing architecture and avoids operating a server or handling music. Document that the visitor's server must allow the Pages origin through CORS.

4. **Package the build output as a ZIP for self-hosting.** The asset contains the deployable static files from `dist/`, not a desktop executable. Documentation must state that users need to serve the extracted files over HTTP(S); opening the HTML file directly is not the supported launch path.

## Risks / Trade-offs

- [The user's server rejects browser requests from the Pages origin] -> Explain the CORS requirement and the exact Pages origin in usage documentation; do not introduce a proxy in this change.
- [Relative asset references behave differently at a host root and a nested path] -> Check the built app at the Pages project path and at root and nested static-host paths before publishing.
- [Pages deployment requires repository configuration and workflow permissions] -> Document the required Pages source/settings and use least-privilege workflow permissions.
- [A ZIP of static files may be mistaken for an installable desktop app] -> Clearly label it as a static web build and document the local-serving requirement.

## Migration Plan

1. Configure and validate a portable static build.
2. Add CI validation and a default-branch Pages deployment using GitHub Actions.
3. Add a version-tag release job that packages `dist/` as a ZIP and attaches it to the GitHub Release.
4. Enable GitHub Pages for Actions-based deployment and publish the first default-branch build.

Rollback by disabling or reverting the publishing workflow and, if needed, disabling Pages deployment. Previously published release assets remain downloadable unless maintainers remove them.
