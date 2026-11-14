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

### Requirement: Navigate library views from Home
The client SHALL provide a Home view with direct choices for Albums and Playlists, and SHALL provide a Change library action when multiple music folders are available. Users SHALL be able to return to Home without using a navigation drawer, and the selected folder SHALL NOT need to remain persistently displayed while browsing.

#### Scenario: Open Home
- **WHEN** a user returns to Home from a library view
- **THEN** the client presents direct choices for Albums and Playlists

#### Scenario: Change music folder from Home
- **WHEN** multiple music folders are available and a user chooses Change library
- **THEN** the client lets the user select another folder without signing out

#### Scenario: Navigate without a drawer
- **WHEN** a user navigates between Home, Albums, and Playlists
- **THEN** the client provides a direct, labeled navigation action without requiring a navigation drawer

### Requirement: Identify albums with artwork and text
The album list SHALL show each album's title and artist, and SHALL display its server-provided cover art when available.

#### Scenario: Album has cover art
- **WHEN** an album has a cover-art identifier and its image can be retrieved
- **THEN** the album row shows the artwork alongside the album title and artist

#### Scenario: Album artwork is unavailable
- **WHEN** an album has no cover-art identifier or its image cannot be retrieved
- **THEN** the album row shows a placeholder while keeping the album title and artist visible
