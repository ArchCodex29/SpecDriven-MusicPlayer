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