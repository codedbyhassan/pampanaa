# Warden Player Ecosystem

The Warden is treated as one coherent gameplay and visual system.

```text
Warden
├── Body / silhouette
├── Movement
├── Health / damage
├── Shield
├── Active weapon
│   ├── weapon definition
│   ├── weapon amplifiers
│   └── firing presentation
├── Temporary buffs
├── Pickups
│   ├── recovery
│   ├── defense
│   ├── weapon
│   ├── tactical
│   └── temporary
└── HUD / pause presentation
```

## Weapon catalog

The first catalog contains Blaster, Pulse and Arc. Weapon definitions are domain data and should be consumed by runtime and presentation layers rather than hard-coded into React.

## Pickup taxonomy

- Repair
- Shield
- Rapid Fire
- Score Multiplier
- Auto-Lock
- Magnet
- Damage Amp
- Fire Amp
- Pierce Amp
- Multishot Amp

## Architecture

```text
Player Domain
   ↓
Loadout / Pickup definitions
   ↓
Player application service
   ↓
Runtime Player
   ↓
Visual presentation
```

The visual layer communicates state but does not decide gameplay effects.
