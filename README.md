# Pampanaa — Lane Defense Command

> **A story-driven sci-fi arcade defense game about protecting the last surviving settlement while uncovering why the world went silent.**

Pampanaa is a React + Vite canvas game packaged for the web and desktop with Electron. The current gameplay foundation is being deliberately refactored into a domain-driven architecture so the game's story, campaign, runtime, progression and persistence evolve as one coherent system.

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

The existing application already provides a substantial playable and persistence foundation:

- Canvas-based arcade runtime
- Player profiles
- Persistent settings and progress
- Save-game support
- Achievements
- Scores and leaderboards
- Wave-based encounters
- Enemy and boss systems
- Pickups and gameplay feedback
- Difficulty configuration
- Responsive React application shell
- Missions, career, achievements, leaderboard and codex surfaces
- Electron desktop packaging

The current runtime is being preserved during the architecture migration. The goal is **not** to throw away working gameplay and rebuild blindly. The goal is to give existing mechanics proper ownership and meaning.

## Current architecture work

The repository has been through a foundational architecture refactor covering the application, domain and persistence boundaries.

```text
                         Pampanaa
                            │
              ┌─────────────┴─────────────┐
              │                           │
            Domain                   Application
              │                           │
      ┌───────┼────────┐                  │
      │       │        │                  │
    World  Campaign  Game          Services / Use Cases
      │       │        │                  │
      └───────┼────────┘                  │
              │                           │
              └─────────────┬─────────────┘
                            │
                       Infrastructure
                            │
                         IndexedDB
```

### Domain foundation

The domain now contains explicit models and contracts for concepts including:

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

## Game architecture direction

The game is being aligned around this runtime flow:

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

A wave is therefore a runtime encounter mechanism, not the definition of the campaign.

The long-term runtime boundary is:

```text
Game Runtime
├── Simulation
├── Encounters
├── Input
├── Rendering
├── Audio
└── Game Loop
```

The runtime should communicate meaningful events outward rather than directly controlling React state or persistence.

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

The project is organized around clear responsibilities:

```text
src/
├── application/       use cases and application services
├── domain/            game concepts, models, contracts and invariants
├── infrastructure/   persistence adapters and external boundaries
├── canvas/            existing high-frequency canvas runtime
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
└── EXISTING_RUNTIME_MAP.md
```

These documents define the intended Pampanaa universe and map existing mechanics to their future architectural ownership.

Desktop-only code lives under `public/`:

```text
public/
├── electron.cjs
└── preload.cjs
```

## Architectural rules

1. The domain owns game meaning and invariants.
2. Application services coordinate use cases and state transitions.
3. Infrastructure owns persistence and external integrations.
4. The canvas runtime must not depend on React rendering.
5. UI components must not access IndexedDB directly.
6. Profile-owned persistence must use stable profile identity rather than display names.
7. Related persistence changes should use one transaction.
8. Native capabilities must cross the Electron preload boundary through a narrow API.
9. Stored-data changes require an explicit migration.
10. Runtime state must not automatically become persistent campaign state.
11. Story concepts must not be hard-coded into rendering code.
12. Existing gameplay should be preserved while responsibilities are extracted.

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

Install dependencies:

```bash
bun install
```

Start the web development environment:

```bash
bun run dev
```

Build the web application:

```bash
bun run build
```

Preview the production web build:

```bash
bun run preview
```

Run the Electron development environment:

```bash
bun run electron
```

Build the desktop application:

```bash
bun run electron-build
```

## Current development status

The project is in an **architecture-first refactor phase**.

### Completed foundation

- Repository/application boundaries established
- Domain models and invariants established
- Stable profile identity introduced
- Persistence adapters established
- IndexedDB schema hardened
- Backup and recovery foundation added
- Pampanaa story/game bible established
- Existing gameplay mapped to the new domain model
- Game session and encounter application boundary introduced

### In progress

The next major refactor is the extraction of the high-frequency game runtime from the monolithic canvas engine into explicit simulation, encounter, lifecycle and event boundaries while preserving the current gameplay experience.

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
