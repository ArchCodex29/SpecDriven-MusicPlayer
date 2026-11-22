# Design

## Context

Collection selection creates a queue whose initial status is `loading`, opens the expanded player, and immediately calls the routine that assigns the stream URL and invokes `audio.play()`. The player already has explicit paused and playing states and a Play action.

## Goals / Non-Goals

**Goals:**
- Show the first queued track in the expanded player with paused controls after a collection is selected.
- Start that track only when the user explicitly chooses Play, preserving the existing playback and error-reporting behavior thereafter.

**Non-Goals:**
- Change queue ordering, track navigation, autoplay when a track ends, or behavior for empty collections.

## Decisions

- Treat a newly created non-empty queue as paused and do not invoke the audio-start path during collection selection. This keeps the visible queue and playback status aligned; keeping the current loading/autoplay sequence and pausing immediately afterward would still risk starting audio.
- Ensure the selected track's stream is available to the existing Play/resume path when the user activates Play. Deferring stream setup until that action avoids unnecessary stream work while paused. Keep failures reported through the existing playback error UI.
- Retain the expanded player on collection selection so the user can inspect the chosen track before starting it.

## Risks / Trade-offs

- [The initial stream setup moves to the explicit Play path] → Verify the first Play action starts the selected track and playback failures remain visible and recoverable.
- [Queue-state changes could affect Play/Pause labels or button availability] → Cover the initial paused state and the transition to playing with focused tests.
