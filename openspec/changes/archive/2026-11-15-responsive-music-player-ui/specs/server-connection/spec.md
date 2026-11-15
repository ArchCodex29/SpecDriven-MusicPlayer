# Spec Delta

## ADDED Requirements

### Requirement: Change music folder while connected
The client SHALL let an authenticated user select another available music folder without signing out, and SHALL use the newly selected folder for subsequent album browsing.

#### Scenario: Choose another music folder
- **WHEN** an authenticated user chooses Change library and selects another available folder
- **THEN** the client returns to browsing with the new folder selected and keeps the user authenticated
