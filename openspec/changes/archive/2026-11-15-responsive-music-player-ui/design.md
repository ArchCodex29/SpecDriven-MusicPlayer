# Design

## Context

See `proposal.md` for motivation and the capability deltas for user-visible behavior. The app is a Vite/TypeScript client with state-driven rendering in `src/main.ts` and responsive styling in `src/style.css`. Playback is currently represented as its own screen, and album records already include optional `artist` and `coverArt` fields.

## Goals / Non-Goals

**Goals:**
- Keep the existing lightweight browser architecture and Subsonic authentication model.
- Separate the active playback queue from the currently displayed view so browsing does not replace playback state.
- Make the library and player usable in narrow, short, and touch-oriented viewports.
- Keep the visual palette maintainable through a single set of semantic color tokens.

**Non-Goals:**
- Add a navigation drawer, a new UI framework, or a backend service.
- Add playlist editing or metadata management.
- Add user-selectable themes or a visual theme-settings feature.
- Persist credentials or require a persistent selected-library indicator.

## Decisions

### Use a Home hub for top-level library navigation

Provide a Home view with direct, labeled entries for Albums and Playlists, plus Change library when the server has multiple folders. Library and player views return to Home through an explicit control; do not add a drawer or a second persistent navigation system. The selected folder does not need to be displayed outside the Home or folder-selection flow.

An always-visible tab row would save a tap between Albums and Playlists, but duplicates the Home navigation model. A drawer would hide the core choices and is explicitly out of scope.

### Render album art as a compact row thumbnail

Use the optional `coverArt` identifier on each album to build an authenticated Subsonic `getCoverArt` URL through the existing client URL/authentication path. Request a thumbnail-sized image, reserve a square slot, and lazy-load list images. Keep album title and artist as text in the same row, with the title primary. Use a neutral placeholder if art is missing or fails; the text remains the identifying content.

This avoids extra album-detail requests and keeps the list scannable. A large artwork grid would consume too much space on phones and browser side panels.

### Decouple playback state from navigation state

Keep the playback queue, current track, volume, and status in state that remains available while the active view is Home or a library list. Render a compact player dock while a queue exists; expanding it reveals the full player, and minimizing it returns to the dock without stopping playback. Keep primary transport controls in a predictable control area, with the play/pause control retaining the clearest spatial anchor.

The current dedicated playing screen is simpler, but it cannot support persistent controls while browsing without coupling the queue to view navigation. A separate playback state preserves the existing queue behavior while enabling the requested mini-player.

### Adapt the expanded player with CSS viewport queries

Use a mobile-first single-column layout. In portrait, place expanded transport controls in a bottom-anchored area. When the viewport is wider than it is tall, use a broad horizontal control arrangement centered vertically; keep track information visible and let secondary content such as the queue scroll or take less space. The minimized dock remains compact and bottom-anchored.

CSS orientation/aspect-ratio queries are preferable to JavaScript orientation listeners: the layout depends on the available page viewport, including a browser side panel, rather than the device sensor. Keep touch target dimensions usable when icons visually shrink, reserve space so fixed controls do not cover list content, and honor reduced-motion preferences for expand/minimize transitions.

### Centralize colors as semantic CSS custom properties

Define the distinct colors used by the app once as semantic CSS custom properties in `:root`, such as `--color-primary`, `--color-background`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-error`, and `--color-focus`. Reference these tokens throughout the stylesheet instead of repeating literal color values. This makes palette adjustments a one-place change while keeping the palette an implementation detail; it does not add a user-facing theme selector.

Semantic tokens are preferable to component-specific variables because the same color role should remain consistent across screens. Preserve existing contrast, focus, disabled, and error distinctions when mapping current colors to tokens.

## Risks / Trade-offs

- Cover-art requests may fail because an image is absent, unavailable, or blocked by server CORS policy → keep album text visible and show a placeholder; image failure must not fail the album list.
- A persistent dock reduces visible list height → reserve bottom content space and keep only essential controls in the minimized state.
- A viewport can change shape while the player is open → let CSS reflow the controls without resetting playback or queue state.
- Changing the selected library while a queue is active can otherwise disrupt playback → treat library selection as browsing context and leave the active playback queue unchanged.
- A poorly mapped color-token palette can weaken contrast or semantic cues → retain visible focus, disabled, and error treatments and verify them after replacing literal colors.
