# Phase 2 — Core Application Architecture

Status: **Complete**

## Target

Establish strict boundaries between the renderer, application orchestration, domain contracts and persistence infrastructure without changing gameplay behavior.

## Completed

- Application service composition root established.
- Profile, save, achievement and score repository contracts established.
- IndexedDB adapters established for each persistence domain.
- Game-state persistence adapter established.
- Renderer-facing application use cases established.
- Domain-owned default settings and progress models established.
- Stable profile identity introduced independently from display names.
- Profile ownership propagated to persistent player records.
- IndexedDB migration/versioning added for the identity transition.
- Legacy name-based data kept compatible during migration.
- Database implementation remains isolated under infrastructure adapters.
- Electron remains outside the renderer application layer.
- Architecture rules documented.

## Dependency direction

```text
UI / React
    ↓
Application use cases
    ↓
Application services
    ↓
Domain models + repository contracts
    ↓
Infrastructure adapters
    ↓
IndexedDB
```

Dependencies must never point upward. Domain code must not import React, Electron or IndexedDB.

## Phase 2 exit criteria

- No new feature work was introduced for the purpose of this phase.
- Persistence is accessed through application/domain boundaries rather than being part of UI responsibilities.
- Persistent ownership has a stable identity foundation.
- The architecture can accept alternative persistence implementations without changing UI contracts.
- Phase 3 can focus on domain models rather than reorganizing application plumbing.

## Verification note

The GitHub-connected environment does not provide a local Bun/Node runtime for executing the repository's build/test commands. Runtime verification remains a required gate before release and before accepting behavior-changing refactors.

## Next phase

**Phase 3 — Domain Models & Invariants**

This phase will formalize the shapes, validation and invariants of profiles, game sessions, saves, progress, achievements, scores and settings.
