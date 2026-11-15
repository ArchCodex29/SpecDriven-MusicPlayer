# Tasks

## 1. Home and Library Browsing

- [x] 1.1 Add the Home hub and authenticated music-folder switching; verify Home navigation and folder-selection behavior with focused app-state tests.
- [x] 1.2 Build authenticated cover-art URLs and render compact album rows with artwork, title, artist, and an unavailable-art placeholder; verify URL generation and fallback behavior with focused Subsonic/UI tests.
- [x] 1.3 Update the README with the Home, library-switching, and album-row behavior; verify the documented flow matches the implemented screens.

## 2. Persistent Player and Responsive Layout

- [x] 2.1 Decouple playback queue state from the active view and add a persistent mini-player with expand/minimize controls; verify browsing does not stop playback and transport controls remain available with focused playback tests.
- [x] 2.2 Add portrait and landscape player layouts with a stable control area and usable touch targets; verify the layout at a narrow phone width and in both viewport orientations.
- [x] 2.3 Define semantic CSS custom properties for the distinct app color roles and replace scattered color literals with those tokens; verify color declarations use the shared palette and focus, disabled, and error states remain distinguishable.
- [x] 2.4 Update the README with the persistent-player and responsive-control behavior; verify the documentation matches the implemented interactions.

## 3. Integration Verification

- [x] 3.1 Run `npm test` and `npm run build`; verify the Home-to-library, artwork fallback, mini-player, and orientation-adaptive expanded-player flows work together.
