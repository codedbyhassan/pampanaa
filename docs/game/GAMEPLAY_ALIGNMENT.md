# Pampanaa Gameplay Alignment

## Purpose

This document maps the existing game's mechanical concepts to the intended Pampanaa universe so the engine refactor preserves useful work while removing accidental architecture.

| Existing concept | Keep | Reframe as | Architectural owner |
|---|---|---|---|
| Player profile | Yes | Warden/player identity container | Domain/Application |
| Waves | Yes | Mission encounters | Game domain/runtime |
| Enemies | Yes | Threat entities belonging to factions | Game domain/runtime |
| Difficulty | Yes | Threat intensity/ruleset | Application/Game domain |
| Score | Yes | Run performance metric | Domain |
| High scores | Yes | Historical run performance | Persistence |
| Achievements | Yes | Player/campaign milestones | Domain/Application |
| Progress | Yes | Campaign + player progression | Domain |
| Saves | Yes | Campaign/session snapshots | Application/Persistence |
| Settings | Yes | Player preferences | Application/Infrastructure |
| Canvas renderer | Yes | Presentation of the simulation | Runtime |
| Input | Yes | Player commands | Runtime |
| Audio | Yes | Presentation feedback | Runtime |
| Game loop | Yes | Simulation clock | Runtime |

## Required changes before engine refactor

1. Do not let wave logic become the campaign model.
2. Do not let enemy rendering objects become persistent domain entities.
3. Do not use profile names as game ownership identifiers.
4. Do not let React components decide mission or campaign state transitions.
5. Do not persist transient render state as campaign progress unless explicitly modeled.
6. Keep score as run history, not the authoritative source of campaign progression.
7. Treat achievements as domain events/milestones, not arbitrary UI badges.
8. Keep settings separate from player progression.

## Target runtime relationship

```text
Campaign
  ↓
Mission
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
Application State
  ↓
Persistence
```

## Migration principle

The existing game should continue to feel like Pampanaa during the architecture refactor. We are reorganizing ownership and meaning, not replacing the game blindly.
