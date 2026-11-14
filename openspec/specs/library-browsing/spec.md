# library-browsing Specification

## Purpose

Lets users find albums and playlists available from their connected Subsonic server before choosing music to play.

## Requirements

### Requirement: Browse albums in the selected music folder
The client SHALL display albums from the currently selected music folder.

#### Scenario: Open albums view
- **WHEN** a user opens the Albums view with a music folder selected
- **THEN** the client displays albums belonging to that folder

#### Scenario: Album listing fails
- **WHEN** the server cannot provide the album listing
- **THEN** the client reports the failure and lets the user retry

### Requirement: Browse permitted playlists
The client SHALL display the playlists the authenticated user is permitted to play, regardless of the currently selected music folder.

#### Scenario: Open playlists view
- **WHEN** a user opens the Playlists view
- **THEN** the client displays all playlists the server makes available to that user

#### Scenario: No permitted playlists
- **WHEN** the server returns no playlists available to the user
- **THEN** the client shows an empty state without presenting playlist-management actions

### Requirement: Switch between albums and playlists
The client SHALL let the user switch between the Albums and Playlists views while retaining the selected music folder.

#### Scenario: Change browse view
- **WHEN** a user switches from Albums to Playlists or back
- **THEN** the corresponding list is shown and the current music-folder selection remains unchanged
