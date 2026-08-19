# Enemy & Boss Ecosystem

Enemies are not generic obstacles. They are manifestations of the world and the returning signal.

## Veiled taxonomy

```text
The Veiled
├── Veilspawn
│   └── swarm / density threat
├── Veilbreaker
│   └── assault / perimeter pressure
├── Signal Warden
│   └── controller / field distortion
└── The Colossus
    └── boss / scale threat
```

## Boss campaign relationship

### The Colossus
Chapter 2 / Deadlands. The first giant and first undeniable evidence that the returning signal is changing the Veiled.

### The Signal Warden
Chapter 3 / Signal Zone. An ancient network guardian responding to the transmission.

### The Architect Core
Chapter 4 / Ruins. The intelligence connected to the lost network and the engineered Silence.

## Boss lifecycle

```text
Entry → Pressure → Critical → Defeated
```

Each phase is represented in state and can drive changes in movement, attacks, arena effects and UI presentation.

## UI rule

Normal enemies should communicate their identity primarily through silhouette and behaviour. The HUD should not label every threat.

Bosses may receive a dedicated compact presentation because they are narrative events:

```text
BOSS NAME
story title
health
phase
```

The boss presentation should enter, update and leave with the encounter. Persistent combat notifications belong in the pause log.

## Story rule

Every major threat must answer at least one world question:

- What survived the Silence?
- What is answering the signal?
- Why does the Veiled presence change near the transmission?
- What did the Architects leave behind?

This prevents enemy design from becoming disconnected arcade filler.
