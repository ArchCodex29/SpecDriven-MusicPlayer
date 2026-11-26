# release-delivery Specification

## Purpose

Provides repeatable public and downloadable distribution of the static music player so users can try or deploy it without running the development environment.

## Requirements

### Requirement: Publish the latest client to GitHub Pages
The project SHALL publish a usable static client to GitHub Pages when changes are integrated into the repository's default branch.

#### Scenario: Open the Pages client
- **WHEN** a user opens the published Pages URL after a successful deployment
- **THEN** the client loads and its static assets resolve from the repository's Pages project path

#### Scenario: Connect from the Pages client
- **WHEN** a visitor configures their own reachable HTTPS Subsonic-compatible server that permits the Pages origin
- **THEN** the client can be used to connect to that server without a project-operated music backend

### Requirement: Attach a static build to versioned GitHub Releases
The project SHALL produce a ZIP containing the deployable static client and attach it to a GitHub Release for each `vMAJOR.MINOR.PATCH` tag that matches the version in `package.json`.

#### Scenario: Publish a versioned build
- **WHEN** a matching version tag is pushed and validation and build succeed
- **THEN** the corresponding GitHub Release includes a downloadable ZIP of the static build

#### Scenario: Ignore a mismatched version tag
- **WHEN** a `vMAJOR.MINOR.PATCH` tag is pushed but its version does not match `package.json`
- **THEN** the workflow does not publish a GitHub Release

#### Scenario: Serve a downloaded build
- **WHEN** a user extracts the release ZIP and serves its static files from a supported web server
- **THEN** the client loads its assets without requiring the Vite development server

### Requirement: Support static hosting paths
The static build SHALL resolve its application assets when hosted at the GitHub Pages project path or at the root or a subpath of another static host.

#### Scenario: Load from a project path
- **WHEN** the static build is hosted beneath a path prefix
- **THEN** the browser loads the application assets from that prefix

#### Scenario: Load from a host root
- **WHEN** the static build is hosted at a web server's root path
- **THEN** the browser loads the application assets from that root

### Requirement: Document browser-to-server deployment constraints
The project SHALL document that the published client connects directly from the user's browser to their Subsonic-compatible server and describe the HTTPS, CORS, and static-serving requirements.

#### Scenario: Prepare a server for the Pages client
- **WHEN** a user follows the published usage instructions
- **THEN** the instructions explain that their server must be reachable over HTTPS and allow the Pages origin through CORS

#### Scenario: Use a downloaded static build
- **WHEN** a user follows the release instructions
- **THEN** the instructions explain that the extracted files must be served over HTTP(S) rather than opened directly as a file

### Requirement: Offer a Chromium browser extension in addition to the static releases
The project SHALL provide a Chromium-compatible browser extension containing the player, without replacing the GitHub Pages client or downloadable static build.

#### Scenario: Use the extension release
- **WHEN** a user installs and opens the extension in a supported Chromium-based browser
- **THEN** the extension provides the music player while the existing Pages and static ZIP releases remain available

### Requirement: Open the player only when the user invokes the extension
The extension SHALL open the player in a browser tab only in response to the user's toolbar action and SHALL NOT inject scripts into or automatically activate on ordinary webpages.

#### Scenario: Open the player from the toolbar
- **WHEN** the user clicks the extension's toolbar action
- **THEN** the extension opens the bundled player in a browser tab

#### Scenario: Browse unrelated webpages
- **WHEN** the user visits or switches between ordinary webpages without invoking the extension
- **THEN** the extension does not inject player code into those pages or request access to them

### Requirement: Limit server access to the configured Subsonic origin
The extension SHALL request access only to the user's configured HTTPS Subsonic server, and only after the user initiates a connection.

#### Scenario: Connect to a configured server
- **WHEN** the user submits a server URL and explicitly starts connecting
- **THEN** the extension requests permission for that server origin before making requests to it

#### Scenario: Deny server access
- **WHEN** the user denies permission for the configured server
- **THEN** the player explains that permission is required and does not connect to that server

#### Scenario: Do not grant unrelated host access
- **WHEN** the extension requests permission for a configured server
- **THEN** it does not request access to all websites or to unrelated server origins

### Requirement: Attach a separate extension ZIP to GitHub Releases
For each matching versioned GitHub Release that includes the static-client ZIP, the project SHALL attach a distinct ZIP containing the Chromium extension files.

#### Scenario: Download the extension release
- **WHEN** a user opens a matching versioned GitHub Release
- **THEN** the release includes a separately named extension ZIP alongside the existing static-client ZIP

### Requirement: Support manual installation from the extension ZIP
The project SHALL document how to extract the extension ZIP and load its contents as an unpacked extension in a supported Chromium-based browser.

#### Scenario: Load the downloaded extension
- **WHEN** a user downloads and extracts the extension ZIP and follows the installation instructions
- **THEN** the user can select the extracted extension folder using the browser's unpacked-extension installation flow

#### Scenario: Update a manually installed extension
- **WHEN** a new extension ZIP is published
- **THEN** the instructions explain that the user must download and extract the new ZIP and load or reload the updated extension folder
