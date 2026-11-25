# Small Music Player

> A small, focused, web-based, subsonic-compatible music player. 

This project's purpose is two-fold :
* Serve as an experiment/learning place for a spec-driven (and AI-assisted) project
* As an artifact of this experiment, create a small but useful music player that I can use on a daily basis

## What are we building here ?

A web application that acts as a music player. A Subsonic-compatible thin client that allows the user to:
1) Connect to one given Subsonic server (example : Navidrome) by providing the needed endpoint and credentials
2) Choose one of the available libraries within the connected server
3) Navigate through the available albums and playlists within the chosen library
4) Pick one album/playlist and reproduce its contents.
5) Display the common media controls (Play/Pause, Next/Previous, Stop, Volume)

Features such as managing song metadata, create playlists or others are out of scope by design. This app is not intended to replace the server's provided web page by any means. It is a simple music player one can use *after* having configured everything properly on the server side.

Once the core functionality described above is achieved, new features that improve the client functionality / user experience may be evaluated, as long as it does not conflict with the premise above. For example : keyboard shortcuts, theme colors

## How are we building it ?

In the spirit of this experiment, all features and bug fixes should be handled by the agent of choice by writing the associated specification, instead of me "intervening" and implementing the end result.

For the spec-driven toolkit, I've chosen [OpenSpec](https://github.com/Fission-AI/OpenSpec) for it's promise of being a ligther toolkit (when compared with GitHub's SpecKit, for example) and on it's iterative philosophy.

## Running locally

Requires Node.js and npm.

```sh
npm install
npm run dev
npm run build
npm test
```

`npm run dev` starts the Vite development server. `npm run build` type-checks and builds the static app, and `npm test` runs the Vitest suite.

## GitHub Pages demo

After the first successful deployment, the demo will be available at [https://archcodex29.github.io/SpecDriven-MusicPlayer/](https://archcodex29.github.io/SpecDriven-MusicPlayer/). It serves only the browser client; it does not provide a music library or Subsonic server. To use it, enter your own reachable Subsonic-compatible server over HTTPS. That server must allow browser requests from the Pages origin `https://archcodex29.github.io` through its CORS configuration, and must have a valid HTTPS certificate.

The GitHub Actions workflow validates pull requests and pushes to `master`, and deploys Pages only after a successful push to `master`. To enable deployment in this repository, open **Settings > Pages > Build and deployment** and set **Source** to **GitHub Actions**.

## Download a static release

Download the `small-music-player-vX.Y.Z.zip` asset from the [GitHub Releases](https://github.com/ArchCodex29/SpecDriven-MusicPlayer/releases) page and extract it. The ZIP contains the deployable web files at its root; it is not a desktop installer. Serve the extracted directory over HTTP(S) with any static web server. For a quick local check with Python:

```sh
mkdir small-music-player
unzip small-music-player-vX.Y.Z.zip -d small-music-player
python3 -m http.server 8000 --directory small-music-player
```

Then open `http://localhost:8000/`. Opening `index.html` directly as a `file://` URL is not supported. When connecting to a Subsonic-compatible server, the browser still connects directly to that server; it must be reachable over HTTPS and allow the origin serving this client through CORS.

## Using the VS Code Dev Container

The Dev Container provides Node.js 26.1.0, npm 12.2.2, OpenSpec CLI 2.0.0, and installs the project dependencies from `package-lock.json`. On the host, install VS Code, Docker, and the Dev Containers extension. Open this repository in VS Code and run **Dev Containers: Reopen in Container**; the first build installs the pinned tools and runs `npm ci`.

The container also installs the GitHub Copilot and Copilot Chat extensions. Sign in to GitHub through VS Code to use Copilot Chat and the OpenSpec skills already checked into `.agents/skills`; do not add credentials to the container or repository.

Run the app inside the container with:

```sh
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Port 5173 is forwarded to the host. Use the forwarded-port notification in VS Code to open the app in a host browser. Build and test from the integrated terminal with `npm run build` and `npm test`.

## MVP scope

The client connects directly from the browser to one Subsonic-compatible server over HTTPS. It remembers only the server URL; login credentials are kept in memory and must be entered again after a reload. Users can select a music folder, browse its albums and their permitted playlists, and play a collection with standard transport and volume controls. Playlist editing, metadata management, server administration, and a backend proxy are out of scope.

## Using the responsive player

After signing in, Home provides direct choices for Albums and Playlists. When the account has multiple music folders, choose **Change library** from Home to switch folders without signing out. Album rows show the album title, artist, and available cover art; a placeholder is shown when art is missing or cannot be loaded.

Starting an album or playlist opens the expanded player. Use **Minimize** to keep playback controls in a compact dock while returning to Home or browsing a library. Playback and its queue continue when the selected music folder changes. The expanded player keeps its controls at the bottom in portrait layouts and arranges them across a vertically centered control area in landscape layouts.

## Browser compatibility validation

The configured Navidrome server reports version 0.64.0 and Subsonic API version 1.16.1. Browser requests from the local development app reached the REST and stream endpoints cross-origin. An authenticated smoke test confirmed first-visit setup, returning login, automatic selection of the server's only music folder, album browsing, and account-wide playlist loading. A playable album started successfully; pause/resume, next, previous, volume, and stop all worked. The test playlist contained no playable tracks, and playback correctly did not start for it. After login, browser storage contained only the server URL. No credentials were recorded.