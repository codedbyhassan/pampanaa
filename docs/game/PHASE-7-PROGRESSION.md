# Phase 7 — Player & Progression

Phase 7 establishes progression as a domain concern rather than a side effect of the canvas runtime.

## Model

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

## Rules

- Display names are not progression identity.
- Score is run performance, not campaign progression.
- Runtime entities do not directly mutate persistent progression.
- Progression changes are driven by domain/application events.
- Experience thresholds are owned by the progression domain.
- Duplicate unlock identifiers are removed at the domain boundary.

## Event rewards

The initial domain reward table establishes baseline values for:

- mission completion
- encounter resolution
- enemy defeat
- boss defeat
- discovery
- achievement unlock

These values are intentionally centralized so balancing can evolve without scattering progression rules across the runtime.

## Lifecycle

```text
Game Event
   ↓
Progression Service
   ↓
Domain validation / reward rule
   ↓
Rank + XP + statistics
   ↓
Application event
   ↓
Persistence adapter
```

The service can initialize a profile progression and apply supported events without coupling the domain to React, Canvas or IndexedDB.
