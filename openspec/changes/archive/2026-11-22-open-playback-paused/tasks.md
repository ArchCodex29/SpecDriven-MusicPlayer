# Tasks

## 1. Initialize paused queues

- [x] 1.1 Set newly created non-empty playback queues to the paused state and update playback-state tests; verify with `npx vitest run src/playback-state.test.ts`.

## 2. Defer audio start until Play

- [x] 2.1 Update collection startup to open the expanded player without starting audio, and ensure the explicit Play action starts the selected first track; add focused tests covering the paused initial state and explicit transition to playing.
- [x] 2.2 Run `npm test` and `npm run build` to verify the complete test suite and production type-check/build pass.
