# audio-playback Specification

## Purpose

Lets users play the tracks in a selected album or playlist and control playback from the browser.

## Requirements

### Requirement: Start playback from a selected collection
The client SHALL create an ordered playback queue from a selected album or playlist and start playback with its first track.

#### Scenario: Play album
- **WHEN** a user selects an album to play
- **THEN** the client loads its tracks in server-provided order and starts the first track

#### Scenario: Play playlist
- **WHEN** a user selects a playlist to play
- **THEN** the client loads its tracks in playlist order and starts the first track

#### Scenario: Selected collection is empty
- **WHEN** a user selects an album or playlist with no playable tracks
- **THEN** the client explains that playback cannot start and does not enter the playing state

### Requirement: Control playback
The playing state SHALL provide play/pause, next, previous, stop, and volume controls for the active queue.

#### Scenario: Pause and resume
- **WHEN** a user activates Play or Pause
- **THEN** the active track pauses or resumes accordingly

#### Scenario: Skip tracks
- **WHEN** a user activates Next or Previous
- **THEN** playback moves to the corresponding track in the queue when one exists

#### Scenario: Stop playback
- **WHEN** a user activates Stop
- **THEN** playback stops and the client leaves the playing state

#### Scenario: Adjust volume
- **WHEN** a user changes the volume control
- **THEN** the active playback volume changes to the chosen level

#### Scenario: Track ends
- **WHEN** the active track finishes and another track follows in the queue
- **THEN** the client starts the next track

### Requirement: Report playback failures
The client SHALL report a playback or stream failure and allow the user to recover without silently presenting failed playback as successful.

#### Scenario: Stream fails
- **WHEN** the active track cannot be streamed or played
- **THEN** the client reports the failure and offers a way to retry or move to another track
