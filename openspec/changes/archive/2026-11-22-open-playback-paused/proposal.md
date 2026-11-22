# Proposal

## Why

Choosing an album or playlist currently starts audio immediately, which can startle users. Opening the player paused gives users a chance to see the selected collection and start playback when they are ready.

## What Changes

- Keep the selected collection's ordered queue and open its first track in the expanded player without starting audio.
- Require an explicit Play action to begin playback.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audio-playback`: Selecting an album or playlist opens its first track paused instead of automatically playing it.

## Impact

- Playback queue initialization and player startup behavior in `src/playback-state.ts` and `src/main.ts`.
- Focused playback-state and startup behavior tests.
