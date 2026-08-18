
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

## Player progression

Pampanaa now treats Warden progression as an explicit domain concern rather than a side effect of the canvas runtime.

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

Progression is driven by game events through an application service. Supported progression events include mission completion, encounter resolution, enemy defeats, boss defeats, discoveries and achievement unlocks.

Score remains a run-performance metric and is not used as the authoritative campaign progression source.

Progression rules and baseline XP rewards are centralized in the domain so balancing can evolve without scattering values throughout the runtime.

See `docs/game/PHASE-7-PROGRESSION.md` for the progression contract.

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
