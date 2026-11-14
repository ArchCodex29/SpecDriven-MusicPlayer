# Spec Delta

## Purpose

Connects the browser client to a Subsonic-compatible server and establishes the authenticated, in-memory context needed to discover music folders.

## ADDED Requirements

### Requirement: Configure and remember the server URL
The client SHALL let the user enter a Subsonic server URL and SHALL remember that URL across visits without remembering login credentials.

#### Scenario: First visit
- **WHEN** a user opens the client without a saved server URL
- **THEN** the client presents the server URL setup page before login

#### Scenario: Returning visit
- **WHEN** a user opens the client with a saved server URL
- **THEN** the client presents the login page for that server

#### Scenario: Change server
- **WHEN** a user chooses to return to server setup from login
- **THEN** the client lets the user edit the server URL and continue to login

### Requirement: Authenticate without persisting credentials
The client SHALL use the username and password only in memory for the active app session and SHALL NOT persist credentials or reusable authentication material; a new app session SHALL require login again.

#### Scenario: Successful login
- **WHEN** the server accepts the user's credentials
- **THEN** the client proceeds to retrieve the server's music folders without writing credentials to persistent browser storage

#### Scenario: New app session
- **WHEN** the client is reloaded or reopened after its in-memory login state is gone
- **THEN** the user is asked to log in again while the saved server URL remains available

#### Scenario: Rejected credentials
- **WHEN** the server rejects the user's credentials
- **THEN** the client reports that login failed and allows the user to retry

### Requirement: Discover and select a music folder
After successful authentication, the client SHALL retrieve the available music folders and select one for browsing.

#### Scenario: Exactly one folder
- **WHEN** the server returns exactly one music folder
- **THEN** the client selects that folder automatically and continues to browsing

#### Scenario: Multiple folders
- **WHEN** the server returns more than one music folder
- **THEN** the client asks the user to choose one before browsing

#### Scenario: No folders
- **WHEN** the server returns no music folders
- **THEN** the client explains that there are no available folders and does not continue to browsing

#### Scenario: Folder retrieval fails
- **WHEN** the server cannot be reached or returns an error while folders are being retrieved
- **THEN** the client reports the connection failure and provides a way to retry or return to login
