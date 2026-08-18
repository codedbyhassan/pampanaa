# PAMPANAA — Game Bible

## Status
Canonical pre-engine alignment document. This document defines the intended product direction for the existing Pampanaa game and is the source of truth for subsequent game-engine architecture.

## 1. Core identity

Pampanaa is a story-driven sci-fi arcade defense game built around one central fantasy:

> **You are the last line of defense for a surviving human settlement while uncovering why the world outside has become hostile.**

The game must remain approachable and mechanically immediate. Story should give meaning to gameplay without turning the game into a cutscene-heavy experience.

## 2. Working premise

Human civilization once depended on a vast communications and infrastructure network. The network failed, leaving isolated settlements disconnected from one another. Pampanaa became one of the last surviving human settlements.

Years later, signals begin returning from beyond the settlement's dead zones. Unknown hostile activity follows. The incursions initially appear chaotic, but evidence suggests that the threat is organized and adapting.

The player is Pampanaa's Warden, responsible for defending the settlement and investigating the source of the returning signal.

The central mystery is:

> **Why was Pampanaa spared, and what is answering its signal?**

This premise is intentionally a foundation rather than immutable canon. Specific lore names, chronology and revelations can be refined without changing the core architecture.

## 3. Player fantasy

The player should feel like:

- a defender under pressure
- an investigator uncovering a larger truth
- a protector whose decisions affect the settlement
- a person gradually gaining authority and understanding

The game should not reduce the player to a nameless weapon controller.

## 4. World structure

The initial world model consists of:

- **Pampanaa / The Haven** — the surviving settlement and primary home base.
- **The Deadlands** — abandoned territory surrounding known safe areas.
- **The Frontier** — increasingly unknown territory beyond established defenses.
- **The Ruins** — remains of the old civilization and evidence about the network.
- **The Signal Zone** — the region associated with the mysterious returning transmission.

These are domain concepts. The engine should not hard-code them as rendering concepts.

## 5. Factions

The initial faction model contains:

### The Haven
Survivors rebuilding civilization inside Pampanaa.

### The Wanderers
People who survived outside the settlement. They can provide information, conflict and alternative perspectives rather than being automatically hostile.

### The Veiled
The mysterious hostile force associated with the incursions. Their origins and motives are intentionally revealed gradually.

### The Architects
An ancient civilization or technological force connected to the original network. Their exact nature is a narrative mystery until the campaign establishes it.

## 6. Campaign structure

The campaign is organized as chapters containing missions, encounters and narrative outcomes.

### Chapter I — The Silence
The perimeter begins failing. The player learns that the returning threat is unlike anything the settlement has encountered before.

### Chapter II — The Frontier
The player pushes beyond the settlement and discovers evidence contradicting the official history.

### Chapter III — The Signal
The mysterious transmission becomes the central investigation. It becomes clear that the signal is not simply a distress call.

### Chapter IV — The Truth
The player uncovers the purpose of the original network and why it was shut down.

### Chapter V — Pampanaa
The player returns to the settlement with knowledge that changes the meaning of the entire conflict. The campaign culminates in a consequential resolution rather than an arbitrary final wave.

## 7. Gameplay-to-story alignment

The core gameplay loop must map cleanly to the narrative loop:

```text
Campaign
  ↓
Mission
  ↓
Objective
  ↓
Encounter
  ↓
Wave / Threat
  ↓
Outcome
  ↓
Mission Progress
  ↓
Narrative Consequence
```

A wave is therefore an encounter mechanism, not the definition of the story.

A mission should answer:

1. Where is the player?
2. What are they protecting, investigating or accomplishing?
3. Why is the threat present?
4. What changes when the mission ends?

## 8. Progression

Progression should eventually represent both gameplay mastery and the player's journey.

Core progression concepts:

- campaign progress
- player rank or standing
- discoveries
- achievements
- mission completion
- world knowledge
- unlocked content

Technical profile identity must remain separate from narrative/player identity.

## 9. Game states

The domain must distinguish at least:

- profile state
- campaign state
- mission state
- encounter state
- run/session state
- progression state
- persistence state

`Game Over` is a runtime outcome. It must not automatically mean campaign failure.

## 10. Canonical architecture consequences

The game engine must not contain story-specific UI or React state. It should emit meaningful domain events such as:

- mission started
- objective updated
- encounter started
- wave resolved
- mission completed
- mission failed
- discovery made
- chapter unlocked
- campaign advanced

Application/domain systems interpret those events and decide what persistent state changes.

## 11. Existing-system alignment rules

Existing gameplay is preserved where it supports the core fantasy. Existing mechanics that are purely technical remain implementation details. Existing systems that conflict with the campaign model should be adapted rather than allowed to define the narrative.

No new feature should be added merely because it sounds good. It must fit the Pampanaa world, gameplay loop and progression model.

## 12. Tone

The tone should be:

- mysterious
- tense
- adventurous
- hopeful without being childish
- grounded in survival and discovery

Violence should remain stylized and gameplay-focused rather than graphic.

## 13. Design north star

Every major feature should pass this test:

> **Does this make the player feel more like the Warden protecting Pampanaa and discovering what happened to the world?**

If not, the feature requires a strong product justification before implementation.
