# Phase 3 — Domain Models & Invariants

## Status

Complete on `main`.

## Models

Pampanaa now has explicit domain constructors for:

- Profile
- Settings
- Progress
- Save
- Achievement
- Score
- Game Session
- Campaign Stage / Campaign Progress

Each persisted model carries a domain schema version and is normalized before crossing the persistence boundary.

## Invariants

### Identity

- Profile IDs are immutable and use the `pmp_` namespace.
- Display names are mutable and are never intended to be permanent ownership identifiers.
- Profile-owned records require `profileId`.

### Settings

- Volume values are clamped to `0..1`.
- Difficulty is clamped to `1..10`.
- Keymaps are merged with the canonical defaults.

### Progress

- Waves are positive integers.
- Cleared waves are unique and sorted.
- Scores and play time cannot be negative.
- Nested statistic maps are normalized against their defaults.

### Saves

- Saves require profile ownership.
- Preset names are bounded and normalized.
- Latest-session saves are always marked as autosaves.
- Legacy records are hydrated with the active profile ID during migration-compatible reads.

### Achievements

- Achievement IDs are required.
- Ownership is explicit through `profileId`.
- Unlock timestamps are generated when absent.

### Scores

- Ownership is explicit through `profileId` for new records.
- Scores cannot be negative.
- Wave numbers are positive.
- Unknown modes normalize to campaign.

### Game sessions

- Session status is constrained to the defined lifecycle states.
- Pause/resume/finish operations produce new validated models rather than mutating the previous state.

## Architecture rule

Domain models do not import React, IndexedDB, Electron or browser APIs.

Infrastructure adapters are responsible for translating between storage records and domain models.

## Verification

A Node-native domain test suite has been added under `tests/` and is exposed as `bun run test` / `node --test tests`.

The repository connector cannot execute the local runtime, so CI/local execution remains the final runtime verification gate.

## Exit condition

Phase 3 is complete when the application can safely consume these models without introducing feature-specific persistence shapes outside the domain boundary.
