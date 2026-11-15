# Spec Delta

## ADDED Requirements

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
