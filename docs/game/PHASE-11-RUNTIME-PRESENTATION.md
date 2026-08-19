# Phase 11 — Runtime Presentation & Feedback

Phase 11 establishes the final application boundary between game simulation and player-facing runtime presentation.

## Runtime session

A runtime session identifies the active profile, mission and encounter and owns the lifecycle of one gameplay attempt:

```text
start → active → completed
              ↘ failed
```

The session does not simulate enemies. The existing game runtime remains responsible for simulation.

## Presentation channels

Audio is represented through explicit channels:

- music
- sfx
- ui
- ambience

Gameplay and UI events use stable event identifiers rather than component-specific strings.

## Feedback

Player-facing feedback is represented as structured data with a type, title, message and duration. This gives HUD/toast/dialog components a common contract.

## Boundary

```text
Game Runtime
    ↓ events
Application Runtime Session
    ↓
Feedback / Audio / Progression / Campaign
    ↓
React presentation
```

The renderer remains responsible for visualizing runtime state. It must not become the source of mission, progression or narrative truth.
