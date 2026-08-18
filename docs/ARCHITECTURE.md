# Pampanaa Architecture

## Goal

Pampanaa is a desktop-first React application with a high-frequency canvas runtime. The architecture keeps the runtime independent from React rendering and keeps persistence independent from UI components.

## Layers

```text
React application shell
        |
        v
Application state / contexts
        |
        +--------------------+
        |                    |
v       v                    v
Game runtime           Domain services        UI persistence
(canvas)               (progress, saves,      (settings, profiles,
achievements, scores)   achievements, scores)   preferences)
        |                    |
        +---------+----------+
                  v
            IndexedDB adapter
                  |
                  v
            Electron bridge
            (desktop only)
```

## Rules

### 1. Canvas runtime must not depend on React

The game loop, entity lifecycle, collision system, rendering and timing must remain framework-independent. React receives discrete events/state snapshots only when the UI actually needs an update.

Do not call React state setters from a per-frame loop.

### 2. UI components must not talk directly to IndexedDB

Components and pages use domain/context APIs. Database access belongs in `src/database`.

```text
Component -> context/service -> database adapter
```

Never:

```text
Component -> getDB() -> objectStore()
```

### 3. Profile-owned records must be namespaced

All profile-owned persistence uses `profileKey()`. This keeps multiple local profiles isolated inside one IndexedDB database.

### 4. Related persistence writes should be transactional

When a user operation changes several stores, use one IndexedDB read/write transaction so a failure cannot leave a partially migrated state.

### 5. Electron is a boundary, not a second application runtime

The renderer runs as a normal web application. Native capabilities are exposed through a narrow preload API. Node integration remains disabled and context isolation remains enabled.

### 6. Renderer failures must fail gracefully

Unexpected React renderer errors are contained by the application error boundary. The fallback must never mutate or clear player data.

### 7. New features need a domain home

Use this guide when adding code:

| Concern | Location |
|---|---|
| Canvas engine | `src/canvas` |
| Game-specific runtime entities | `src/components/game`, related domain folders |
| React pages | `src/pages` |
| Shared UI | `src/components` |
| React state/context | `src/contexts` |
| Persistent data | `src/database` |
| Reusable browser behavior | `src/hooks` |
| Pure configuration/helpers | `src/utils` |
| Global styling | `src/styles` |
| Electron main process | `public/electron.cjs` |
| Electron renderer bridge | `public/preload.cjs` |

## Persistence model

The current schema remains backward-compatible with the existing `shooting-game` IndexedDB database name. Schema versioning is centralized in `src/database/db.js`.

Profile-owned records use namespaced keys such as:

```text
<profile>::main
<profile>::latest
<profile>::preset-<timestamp>
<profile>::<achievement-id>
```

New profile-owned stores should prefer a dedicated `profile` field and index when practical, while keeping compatibility with existing key-based records during migrations.

## Refactoring policy

Prefer small, behavior-preserving refactors before feature work.

When a module becomes difficult to reason about:

1. Extract pure constants/helpers.
2. Extract persistence/domain operations.
3. Keep the existing public API stable.
4. Add migration compatibility before changing stored data.
5. Only then change consumers.

This lets the codebase improve without repeatedly breaking saved player data.
