# Phase 10 — UI / UX Architecture

Phase 10 establishes the frontend as a presentation system for Pampanaa's domain and application state.

## Frontend information architecture

```text
Home
├── Campaign
├── Missions
├── Codex
├── Career
├── Achievements
├── Leaderboard
├── Settings
└── Credits
```

The game screen is a separate runtime presentation surface.

## Navigation contract

Frontend route identifiers live in `src/application/ui/navigationModel.js`. UI components should consume these identifiers rather than duplicating route strings.

## Game presentation contract

The game HUD should expose mission context rather than treating the wave counter as the primary meaning:

```text
Mission
Objective
Encounter state
Player state
Score
Wave
Threat / boss state
```

## Domain-driven screens

Campaign screens consume campaign state.
Mission screens consume mission state.
Codex screens consume world definitions and discoveries.
Career screens consume player progression.
Achievements consume achievement state.

The frontend does not calculate progression, mission completion or narrative truth.

## Design direction

Pampanaa should read as a story-driven sci-fi defense game rather than a generic arcade dashboard. The visual hierarchy therefore prioritizes:

1. Current story / mission context
2. Clear next action
3. Gameplay state
4. Progression and discovery
5. Secondary statistics

The UI architecture is ready for the later presentation polish phase without coupling presentation decisions to the game simulation.
