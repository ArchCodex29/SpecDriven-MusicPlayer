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
