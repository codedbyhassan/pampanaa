# Pampanaa Existing Runtime → Target Domain Map

## Current runtime observed

`src/canvas/GameEngine.js` currently owns player construction, weapons, enemies, formations, projectiles, particles, pickups, collision resolution, score, wave progression, boss state, combo state, input, timing, rendering coordination and callbacks. It also directly imports gameplay components and utility constants.

This makes `GameEngine` a runtime coordinator, simulation container and presentation coordinator at the same time.

## Target ownership

| Current responsibility | Target owner |
|---|---|
| `Player` runtime object | Game runtime / player simulation |
| weapon runtime objects | Game runtime / equipment simulation |
| `Enemy` and `Boss` objects | Game runtime / threat simulation |
| `FormationManager` | Encounter system |
| wave number/configuration | Encounter + mission domain |
| boss encounter | Encounter system |
| score/combo | Run/session domain |
| campaign progression | Campaign domain/application |
| mission objective | Campaign domain |
| pickups | Runtime gameplay system |
| collision | Physics/collision system |
| particles/damage numbers/shake | Presentation effects |
| background theme | Renderer/presentation |
| sound manager | Audio adapter/system |
| input | Input adapter |
| `onSync` | Runtime state projection boundary |
| `onEvent` | Domain-event boundary |

## Current-to-target terminology

- `wave` remains a runtime unit but becomes part of an `Encounter`.
- `startWave()` becomes an encounter-start operation.
- `advanceWave()` produces an encounter/wave completion event instead of being the campaign model.
- `gameOver` remains a session outcome and does not directly imply campaign failure.
- `bossDefeated` becomes a domain event that a mission can interpret.
- `waveAdvance` becomes `WAVE_COMPLETED` followed by the next encounter transition.
- `kill` becomes `ENEMY_DEFEATED`.
- `mode: campaign` becomes an application-selected campaign/run context rather than an arbitrary engine string.

## Migration rule

The current `GameEngine` remains the compatibility runtime while boundaries are extracted. Do not rewrite all gameplay in one risky replacement. First introduce stable domain events and runtime interfaces, then move responsibilities behind those interfaces while preserving behavior.

## Desired dependency direction

```text
React UI
  ↓
Application / Session orchestration
  ↓
Game domain
  ↓
Game runtime
  ├── simulation
  ├── encounters
  ├── collision
  └── effects
  ↓
Canvas / Audio / Input adapters
```

The runtime must not import React, application persistence or IndexedDB.
