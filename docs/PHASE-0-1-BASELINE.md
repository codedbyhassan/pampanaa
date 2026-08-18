# Pampanaa Phase 0–1 Baseline

## Purpose

This document records the engineering baseline before domain and game-engine refactoring begins. Phase 0 establishes what must remain stable. Phase 1 establishes the repository/tooling conventions that later phases will build on.

## Phase 0 — Baseline

### Current product boundary

Pampanaa is a React/Vite renderer packaged as an Electron desktop application. Browser execution remains supported. Persistent player data currently lives in IndexedDB and is exposed to the UI through application/database modules.

### Critical behavior to preserve

- Application boot and splash/onboarding flow
- Profile creation, selection, rename and deletion
- Profile-scoped settings and progression
- Automatic latest-session save
- Named save presets
- Progress and achievement persistence
- High-score persistence
- Game engine lifecycle and canvas rendering
- Browser execution
- Electron execution and native dialogs

### Current architectural boundaries

- `src/components`, `src/pages`: presentation/UI
- `src/contexts`: application state orchestration
- `src/canvas`: game runtime and rendering
- `src/database`: persistence implementation
- `src/hooks`: reusable React behavior
- `src/utils`: shared pure utilities
- `public/electron.cjs`, `public/preload.cjs`: desktop runtime boundary

### Known technical debt carried into Phase 2

1. Domain models are mostly plain JavaScript objects.
2. Profile identity is still name-based and needs stable IDs.
3. `GameContext` owns several unrelated application concerns.
4. Persistence modules directly know IndexedDB details.
5. Save/progress/achievement schemas need explicit migrations and validation.
6. The game runtime and application layer need a formal event/command boundary.
7. Automated tests are not yet established.
8. Electron dependency modernization requires a dedicated compatibility/build pass.

These items are intentionally not hidden by Phase 1 cleanup. They are inputs to later phases.

## Phase 1 — Repository conventions

### Runtime/tooling

- Bun is the canonical package manager.
- Node 22 is the pinned development runtime through `.nvmrc`.
- The package manifest declares the expected package manager and runtime engines.
- npm-only command examples are removed from project scripts where Bun is the canonical runner.

### Repository hygiene

- Build artifacts, Electron packages, local environment files, caches and editor files are ignored.
- Generated release output is not committed.
- Repository configuration is kept separate from application source.

### Dependency policy

Do not perform major dependency upgrades as part of unrelated refactors. Dependency upgrades must be isolated, lockfile-backed and followed by web + Electron build verification.

### Refactoring policy

- Preserve behavior unless the phase explicitly changes it.
- Prefer small, reversible commits.
- Do not move persistence logic into UI components.
- Do not introduce a state-management library without an identified architectural need.
- Do not couple the game engine to React.
- Do not expose Electron APIs directly to renderer components.

## Phase completion criteria

Phase 0–1 is complete when:

- The repository has a documented baseline.
- Tooling conventions are explicit.
- Generated artifacts are excluded.
- Runtime versions are explicit.
- Package scripts use the canonical package manager.
- No feature work has been introduced as part of the foundation pass.

## Next phase

**Phase 2 — Core Application Architecture**

The next pass will establish strict UI → application → domain → infrastructure boundaries before deeper data-model and game-engine refactoring begins.
