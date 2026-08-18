# Phase 9 — Campaign & Narrative

Phase 9 gives Pampanaa a persistent campaign model and a narrative event boundary.

## Campaign

```text
Campaign
├── Chapter 1 — The Silence
├── Chapter 2 — The Frontier
├── Chapter 3 — The Signal
├── Chapter 4 — The Truth
└── Chapter 5 — Pampanaa
```

Each chapter references missions and narrative events. The campaign state tracks completed missions, discovered narrative events and story flags.

## Narrative events

Narrative is represented as domain data rather than text embedded in React components. Events support:

- intro
- discovery
- dialogue
- revelation
- outcome

This makes story progression deterministic and persistable.

## Campaign state

The campaign state contains:

- active chapter
- completed chapters
- completed missions
- discovered narrative events
- story flags

## Application boundary

`createCampaignService()` exposes campaign definitions and coordinates narrative discovery and story state transitions.

```text
Mission Outcome
      ↓
Campaign Service
      ↓
Campaign State
      ↓
Narrative / Progression
      ↓
Persistence
```

React is a presentation layer and does not own story truth.

## Story direction

The campaign is built around the central question:

> Why was Pampanaa spared, and what is answering its signal?

The five chapters are intentionally broad enough to support the arcade gameplay while providing a coherent narrative escalation.
