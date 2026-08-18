# Phase 8 — World, Factions & Threats

Phase 8 establishes Pampanaa's world as a domain instead of encoding world meaning inside enemy or rendering code.

## World model

```text
World
├── Regions
│   ├── Haven
│   ├── Deadlands
│   ├── Frontier
│   ├── Ruins
│   └── Signal Zone
│
├── Factions
│   ├── Haven
│   ├── Wanderers
│   ├── Veiled
│   └── Architects
│
└── Threats
    ├── Swarm
    ├── Assault
    ├── Support / Control
    └── Boss
```

Threat definitions reference factions. Regions reference connected regions and discovery state. The world catalog is deterministic and does not depend on React or persistence.

## Architectural rule

Enemy sprites, physics objects and canvas entities are runtime representations. They are not the authoritative definition of a faction or world threat.

```text
World Domain
   ↓
Threat Definition
   ↓
Encounter Composition
   ↓
Runtime Entity
   ↓
Renderer
```

## Current catalog

The initial catalog establishes The Haven, The Wanderers, The Veiled and The Architects, plus the five campaign regions. Initial Veiled threat roles cover swarm, assault, control and boss behavior.

## Application boundary

`createWorldService()` provides read access to world definitions and emits discovery events. Future campaign systems can use these definitions without importing canvas implementation details.
