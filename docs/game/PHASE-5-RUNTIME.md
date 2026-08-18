# Phase 5 — Runtime Architecture

## Status
Implemented on `main` as the first production runtime boundary. The existing `GameEngine` remains the simulation implementation for compatibility, while lifecycle, timing, input, rendering and encounter orchestration now live outside it.

## What changed

### Runtime lifecycle
`src/runtime/GameRuntime.js` owns:

- runtime creation
- start
- pause
- resume
- stop
- animation-frame scheduling
- input handoff
- simulation/update ordering
- rendering ordering
- runtime-facing commands and state

### Game clock
`src/runtime/clock/GameClock.js` provides a bounded frame delta. A long browser pause or tab suspension cannot inject an uncontrolled delta into the simulation.

### Input boundary
`src/runtime/input/GameInput.js` normalizes movement, firing and aim input before it reaches the simulation.

### Event boundary
`src/runtime/events/GameEventBus.js` provides a small subscription-based runtime event channel.

### Rendering boundary
`src/runtime/rendering/CanvasGameRenderer.js` owns the canvas presentation call. The runtime no longer requires the React component to manually execute simulation and draw on every frame.

### Encounter boundary
`src/runtime/encounters/EncounterRuntime.js` maps legacy runtime callbacks into domain-level encounter events and owns the session/encounter lifecycle bridge.

## Target execution flow

```text
React / input adapters
        ↓
   GameRuntime
        │
        ├── GameClock
        ├── GameInput
        ├── EncounterRuntime
        └── CanvasGameRenderer
        │
        ▼
    GameEngine
   (simulation)
        │
        ├── entities
        ├── collisions
        ├── waves
        ├── player
        └── effects
```

## Frame order

Every frame follows one deterministic sequence:

```text
Read input
   ↓
Normalize input
   ↓
Update simulation
   ↓
Resolve simulation events
   ↓
Render current simulation state
```

## Compatibility strategy

The 16KB legacy `GameEngine` is intentionally not rewritten in one destructive pass. It currently contains gameplay behavior that must remain stable while ownership is extracted.

The runtime therefore treats it as the simulation adapter. Future phases can extract individual systems from it without changing the public runtime contract.

## Phase 5 checklist

- [x] Runtime lifecycle boundary
- [x] Game clock
- [x] Runtime state
- [x] Input boundary
- [x] Event boundary
- [x] Renderer boundary
- [x] Encounter/session bridge
- [x] Existing `GameCanvas` routed through `GameRuntime`
- [x] Pause/resume moved to runtime lifecycle
- [x] Animation-frame scheduling moved out of React
- [x] Runtime facade preserves existing GameContainer expectations
- [x] Legacy simulation retained for behavior compatibility

## Verification gate

A local production build and desktop build should be run before release. The current tool environment cannot execute the repository's browser/Electron build pipeline, so build verification remains an explicit CI/developer gate rather than being claimed as completed here.
