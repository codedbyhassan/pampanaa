# Warden Player Redesign

The Warden is Pampanaa's primary visual anchor. The redesign moves the player away from generic geometric ship silhouettes toward a compact, readable, faction-neutral sci-fi craft with a consistent visual language.

## Design principles

- silhouette first
- restrained glow
- compact dark cockpit
- visible armor spine
- symmetrical status lights
- readable engine thrust
- short-lived damage feedback
- shield and auto-lock feedback around the silhouette rather than permanent HUD clutter

## Designs

```text
INTERCEPTOR — balanced default
VANGUARD    — broader, heavier silhouette
RANGER      — longer, more aggressive silhouette
```

Design identity lives in `src/domain/player/playerVisual.js` and rendering lives in `src/components/player/wardenRenderer.js`.

## Player state

The Player model now owns presentation-relevant state for:

- design
- active weapon
- health
- damage flash
- shield state
- auto-lock state
- movement/thrust state
- per-weapon amplifiers
- timed buffs

Gameplay systems remain authoritative. The renderer only visualizes this state.

## Visual hierarchy

```text
Warden silhouette
    ↓
movement / thrust
    ↓
state feedback
    ↓
weapon context
    ↓
HUD
```

The player should remain identifiable when the battlefield becomes crowded. Effects are deliberately subordinate to the silhouette.
