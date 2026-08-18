# Application layer

The application layer coordinates player-facing use-cases between the UI and infrastructure.

## Rules

- React components and contexts should call application services rather than individual database modules.
- Application services own orchestration, not rendering.
- Database modules remain infrastructure adapters for now. They are the next extraction target.
- Game engine code must not import React or application services.
- Electron APIs must remain behind the preload/main-process boundary.

## Current services

- `services/profileService.js` — profile lifecycle use-cases
- `services/gameStateService.js` — settings, progression, achievements and latest-save snapshot orchestration

## Target direction

```text
UI / React
    ↓
Application services
    ↓
Domain rules
    ↓
Repository interfaces
    ↓
Infrastructure adapters
```

Phase 2 introduces the application boundary first. Later phases will extract domain models and repository interfaces without forcing a large-bang rewrite.
