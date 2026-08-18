# Pampanaa — Lane Defense Command

> **A story-driven sci-fi arcade defense game about protecting the last surviving settlement while uncovering why the world went silent.**

Pampanaa is a React + Vite canvas game packaged for the web and desktop with Electron. The gameplay foundation is being deliberately evolved into a domain-driven architecture so the game's story, campaign, runtime, progression and persistence evolve as one coherent system.

## The game

Pampanaa centers on the **Warden**, the defender of a surviving human settlement known as **Pampanaa / The Haven**.

Years after civilization's communications network collapsed, signals begin returning from beyond the settlement's dead zones. Unknown threats follow. What begins as a fight to protect the perimeter becomes an investigation into what happened to the world — and why Pampanaa was spared.

### Core question

> **Why was Pampanaa spared, and what is answering its signal?**

The intended campaign is structured around five chapters:

1. **The Silence** — the settlement's perimeter begins failing.
2. **The Frontier** — expeditions reveal evidence that contradicts the official history.
3. **The Signal** — the returning transmission becomes the central mystery.
4. **The Truth** — the player uncovers the purpose of the old network and why it was shut down.
5. **Pampanaa** — the player returns home with knowledge that changes the meaning of the conflict.

The story is designed to support immediate arcade gameplay without turning the game into a cutscene-heavy experience.

## Current product foundation

The application already provides a substantial playable and persistence foundation:

- Canvas-based arcade runtime
- Player profiles
- Persistent settings and progress
- Save-game support
- Achievements
- Scores and leaderboards
- Wave-based gameplay
- Enemy and boss systems
- Pickups and gameplay feedback
- Difficulty configuration
- Responsive React application shell
- Missions, career, achievements, leaderboard and codex surfaces
- Electron desktop packaging

The current gameplay is being preserved during the architecture migration. The goal is **not** to throw away working gameplay and rebuild blindly. The goal is to give existing mechanics proper ownership and meaning.

## Architecture

The repository now has explicit domain, application, runtime and infrastructure boundaries.

```text
                         Pampanaa
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
        Domain         Application         Runtime
          │                 │                 │
      World/Campaign    Use Cases       Simulation
      Player/Progress   Services        Encounters
      Encounters/Events                 Input
                                        Rendering
                                             │
                                             ▼
                                      Infrastructure
                                             │
                                          IndexedDB
```

### Domain foundation

The domain contains explicit models and contracts for:

- profiles and stable profile identity
- settings
- progression
- saves
- achievements
- scores
- game sessions
- campaigns
- missions and objectives
- encounters
- world regions
- factions
- canonical game events

The important conceptual distinctions are:

```text
Campaign ≠ Wave
Mission ≠ Run
Player ≠ Profile
Score ≠ Progression
Enemy ≠ Faction
Game Over ≠ Campaign Failure
Save ≠ Runtime State
```

These distinctions prevent implementation details from becoming the game's permanent domain model.

## Game runtime

**Phase 5 — Runtime Architecture is implemented.**

The existing monolithic canvas engine remains the gameplay simulation adapter for compatibility, while the responsibilities around it have been extracted into explicit runtime boundaries.

```text
React / input adapters
        ↓
   GameRuntime
        │
        ├── GameClock
        ├── GameInput
        ├── EncounterRuntime
        ├── GameEventBus
        └── CanvasGameRenderer
        │
        ▼
    GameEngine
   (simulation)
```

The runtime now owns lifecycle, frame scheduling, bounded timing, input normalization, simulation/update ordering, rendering ordering, pause/resume/stop and session/encounter bridging.

The React `GameCanvas` no longer owns the high-frequency game loop. It supplies input and presentation context to `GameRuntime`.

## Mission & encounter architecture

**Phase 6 — Mission & Encounter System is implemented.**

Pampanaa now has an explicit gameplay hierarchy:

```text
Campaign
   ↓
Mission
   ↓
Objective
   ↓
Encounter
   ↓
Wave
   ↓
Simulation
   ↓
Outcome
```

Missions now own:

- chapter identity
- mission identity
- title and description
- objectives
- objective completion state
- encounter references
- lifecycle timestamps

Mission lifecycle:

```text
AVAILABLE
   ↓
 ACTIVE
   ↓
COMPLETED
   ↘
   FAILED
```

Encounter lifecycle remains canonical:

```text
PENDING
   ↓
 ACTIVE
   ↓
RESOLVED
   ↘
   FAILED
```

The runtime bridges simulation outcomes into mission/encounter events. Wave progression no longer has to be interpreted as campaign progression by the frontend.

The canvas runtime can receive a mission definition and exposes mission, encounter and session state alongside existing gameplay state.

See `docs/game/PHASE-6-MISSIONS.md` for the mission contract.

## Game architecture direction

The complete product flow is now:

```text
Campaign
   ↓
Mission
   ↓
Objective
   ↓
Encounter
   ↓
Wave
   ↓
Simulation
   ↓
Outcome
   ↓
Domain Event
   ↓
Progress / Narrative
   ↓
Persistence
```

A wave is a runtime encounter mechanism, not the definition of the campaign.

## Persistence architecture

Pampanaa uses IndexedDB through `idb` for local persistence.

Persistence has been hardened with:

- explicit schema versioning
- idempotent store/index creation
- profile ownership indexes
- transactional operations
- database health checking
- versioned backup/export format
- transactional restore
- profile-data recovery operations
- complete database reset support
- domain normalization at persistence boundaries

The database schema is centrally managed in `src/database/db.js` and is currently versioned independently from the application version.

Existing local data is treated as a migration concern. Refactors should preserve player data wherever practical rather than requiring destructive resets.

## Repository structure

```text
src/
├── application/       use cases and application services
├── domain/            game concepts, models, contracts and invariants
├── runtime/           lifecycle, clock, input, events, encounters, rendering
├── infrastructure/   persistence adapters and external boundaries
├── canvas/            gameplay simulation and canvas-specific implementation
├── components/        reusable UI components
├── contexts/          React application/runtime bridge
├── database/          IndexedDB implementation and migrations
├── hooks/             reusable React/browser behavior
├── pages/             application screens
├── styles/            global design system styles
└── utils/             pure helpers and configuration
```

Game design documentation lives under:

```text
docs/game/
├── GAME_BIBLE.md
├── GAMEPLAY_ALIGNMENT.md
├── EXISTING_RUNTIME_MAP.md
├── PHASE-5-RUNTIME.md
└── PHASE-6-MISSIONS.md
```

## Architectural rules

1. The domain owns game meaning and invariants.
2. Application services coordinate use cases and state transitions.
3. Runtime owns the high-frequency game lifecycle.
4. The simulation does not depend on React rendering.
5. Rendering is a presentation boundary.
6. Input is normalized before entering simulation.
7. UI components must not access IndexedDB directly.
8. Profile-owned persistence must use stable profile identity rather than display names.
9. Related persistence changes should use one transaction.
10. Native capabilities must cross the Electron preload boundary through a narrow API.
11. Stored-data changes require an explicit migration.
12. Runtime state must not automatically become persistent campaign state.
13. Story concepts must not be hard-coded into rendering code.
14. Existing gameplay should be preserved while responsibilities are extracted.
15. Long-running browser frame gaps must be clamped before reaching simulation.
16. Missions own objectives and outcomes, not the canvas renderer.
17. Encounters bridge mission intent to runtime waves.

## Electron security

The Electron renderer is designed around:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- a narrow preload API
- renderer Content Security Policy
- allowlisted native path access

Native functionality should be implemented across the main-process/preload boundary rather than exposing Node APIs to the renderer.

## Development

Pampanaa uses Bun as the primary package manager.

```bash
bun install
bun run dev
bun run build
bun run preview
bun run electron
bun run electron-build
```

## Development status

### Completed

- Repository/application boundaries
- Domain models and invariants
- Stable profile identity
- Persistence adapters
- IndexedDB schema hardening
- Backup and recovery foundation
- Pampanaa story/game bible
- Existing gameplay/domain mapping
- Game session and encounter application boundary
- **Phase 5 runtime architecture**
- **Phase 6 mission and encounter architecture**
- Mission → encounter → wave runtime bridge
- Mission state exposed through the game runtime

### Current development phase

**Phase 7 — Player & Progression System** is the next implementation stage.

Runtime verification remains a release gate: web builds, Electron packaging and persistence migrations must be executed in a real development environment before a release is considered verified.

## Design principle

Pampanaa is not being rebuilt merely to have cleaner folders.

The architecture is being rebuilt so that:

```text
Story
  ↓
World
  ↓
Campaign
  ↓
Mission
  ↓
Encounter
  ↓
Gameplay
  ↓
Progression
  ↓
Persistence
```

all describe the **same game**.

Every major future feature should pass one question:

> **Does this make the player feel more like the Warden protecting Pampanaa and discovering what happened to the world?**

If it does not, it needs a strong product reason before it becomes part of the game.

## License

See `LICENSE` and `Eula.txt`.
