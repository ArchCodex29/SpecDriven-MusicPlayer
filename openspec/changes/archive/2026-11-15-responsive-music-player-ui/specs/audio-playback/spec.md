# Spec Delta

## ADDED Requirements

### Requirement: Keep playback controls available while browsing
The client SHALL keep a compact player with transport controls available while the user navigates Home, Albums, or Playlists during active playback.

#### Scenario: Browse while music is playing
- **WHEN** a user navigates between Home and library views during playback
- **THEN** playback continues and the compact player remains available with transport controls

#### Scenario: Expand or minimize the player
- **WHEN** a user expands or minimizes the player
- **THEN** the primary transport controls remain in a predictable control area and playback continues

### Requirement: Adapt the expanded player to viewport orientation
The expanded player SHALL use the available viewport shape to lay out its transport controls, keeping them prominent and easy to reach.

#### Scenario: Expanded player in portrait
- **WHEN** the viewport is taller than it is wide and the player is expanded
- **THEN** the transport controls appear in a bottom-anchored control area

#### Scenario: Expanded player in landscape
- **WHEN** the viewport is wider than it is tall and the player is expanded
- **THEN** the primary transport controls span the available width and are vertically centered
