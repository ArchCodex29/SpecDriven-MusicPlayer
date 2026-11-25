# Tasks

## 1. Portable static build

- [x] 1.1 Configure Vite to emit path-relative static asset references and verify the production build loads at the GitHub Pages project path and at root and nested static-host paths.
- [x] 1.2 Add a repeatable static-output path smoke check and verify it passes alongside `npm test` and `npm run build`.

## 2. GitHub Pages publishing

- [x] 2.1 Add pull-request and default-branch validation that installs locked dependencies, runs tests, and builds without publishing from pull requests; verify the workflow's event and permission configuration.
- [ ] 2.2 Add default-branch GitHub Pages deployment with least-privilege workflow permissions and verify the deployed URL loads the app and assets.
- [x] 2.3 Document the Pages demo, repository Pages setup, bring-your-own HTTPS Subsonic server, and CORS requirement in the README; verify the setup steps match the workflow.

## 3. Versioned static releases

- [x] 3.1 Add a release job that validates and builds the app, packages `dist/` as a ZIP, and attaches it to the matching GitHub Release; verify it publishes only for `vMAJOR.MINOR.PATCH` tags that match `package.json`.
- [x] 3.2 Verify the release ZIP contains the deployable static files and that the packaged client loads from root and nested static-host paths.
- [x] 3.3 Document how to download and serve the static ZIP over HTTP(S), including that it is not a desktop installer; verify the instructions are usable without the Vite development server.

## 4. Publishing integration

- [ ] 4.1 Verify a default-branch update deploys Pages, a matching SemVer tag publishes the matching ZIP, a mismatched tag does not publish, and a pull request only runs validation.
