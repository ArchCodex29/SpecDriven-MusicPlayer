# Spec Delta

## MODIFIED Requirements

### Requirement: Start playback from a selected collection
The client SHALL create an ordered playback queue from a selected album or playlist and open the player with its first track paused. Playback SHALL begin only after the user explicitly activates Play.

#### Scenario: Play album
- **WHEN** a user selects an album to play
- **THEN** the client loads its tracks in server-provided order and opens the first track in the paused state without starting audio

#### Scenario: Play playlist
- **WHEN** a user selects a playlist to play
- **THEN** the client loads its tracks in playlist order and opens the first track in the paused state without starting audio

#### Scenario: Start selected collection
- **WHEN** a user activates Play from the paused player
- **THEN** the client starts playback of the selected track

#### Scenario: Selected collection is empty
- **WHEN** a user selects an album or playlist with no playable tracks
- **THEN** the client explains that playback cannot start and does not enter the playing state
