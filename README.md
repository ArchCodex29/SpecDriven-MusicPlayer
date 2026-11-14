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

## MVP scope

The client connects directly from the browser to one Subsonic-compatible server over HTTPS. It remembers only the server URL; login credentials are kept in memory and must be entered again after a reload. Users can select a music folder, browse its albums and their permitted playlists, and play a collection with standard transport and volume controls. Playlist editing, metadata management, server administration, and a backend proxy are out of scope.

## Using the responsive player

After signing in, Home provides direct choices for Albums and Playlists. When the account has multiple music folders, choose **Change library** from Home to switch folders without signing out. Album rows show the album title, artist, and available cover art; a placeholder is shown when art is missing or cannot be loaded.

Starting an album or playlist opens the expanded player. Use **Minimize** to keep playback controls in a compact dock while returning to Home or browsing a library. Playback and its queue continue when the selected music folder changes. The expanded player keeps its controls at the bottom in portrait layouts and arranges them across a vertically centered control area in landscape layouts.

## Browser compatibility validation

The configured Navidrome server reports version 0.64.0 and Subsonic API version 1.16.1. Browser requests from the local development app reached the REST and stream endpoints cross-origin. An authenticated smoke test confirmed first-visit setup, returning login, automatic selection of the server's only music folder, album browsing, and account-wide playlist loading. A playable album started successfully; pause/resume, next, previous, volume, and stop all worked. The test playlist contained no playable tracks, and playback correctly did not start for it. After login, browser storage contained only the server URL. No credentials were recorded.