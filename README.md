# Pampanaa

Pampanaa is a story-driven sci-fi defense game centered on the last surviving settlement, its Warden and the signal returning from beyond the dead zones.

## Gameplay hierarchy

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

A wave is a gameplay mechanism inside an encounter. It is no longer the authoritative representation of campaign progression.

## Campaign & narrative

The campaign is organized into five chapters: The Silence, The Frontier, The Signal, The Truth and Pampanaa.

Narrative events support intro, discovery, dialogue, revelation and outcome states. Campaign state tracks active chapters, completed missions, discoveries and story flags.

## World

The world domain defines regions, factions and threats independently of canvas entities.

```text
Regions: Haven → Deadlands → Frontier → Ruins → Signal Zone
Factions: Haven · Wanderers · Veiled · Architects
Threat roles: Swarm · Assault · Support · Control · Boss
```

## Warden progression

```text
Profile
  ↓
Warden Progression
  ├── Rank
  ├── Experience
  ├── Mission history
  ├── Encounter history
  ├── Combat statistics
  ├── Discoveries
  ├── Achievements
  └── Unlocks
```

Progression is driven by canonical game events. Score remains a run-performance metric rather than the source of campaign truth.

## Frontend architecture

The React frontend is a presentation layer over the application/domain model.

```text
React UI
   ↓
Frontend read model
   ↓
Application services
   ↓
Domain
   ↓
Runtime / Persistence
```

The command interface is organized around Campaign, Missions, Codex, Career, Achievements, Leaderboard, Settings and Credits. The game HUD presents mission/objective context while retaining score, encounter, hull, weapon and threat state.

Gameplay persistence is accessed through an application boundary rather than importing database modules directly into gameplay UI.

## Architecture phases

- Phase 5 — Runtime architecture: complete
- Phase 6 — Missions & encounters: complete
- Phase 7 — Player & progression: complete
- Phase 8 — World, factions & threats: complete
- Phase 9 — Campaign & narrative: complete
- Phase 10 — UI/UX architecture and frontend reconciliation: complete

See the phase documents under `docs/game/` for the individual contracts.

## Product direction

Pampanaa should feel like a coherent story-driven sci-fi game rather than a generic wave-defense dashboard. Campaign context, objectives, discoveries and Warden progression provide the meaning around the existing fast arcade combat.
