# Phase 6 — Mission & Encounter System

## Goal

Move Pampanaa from a wave-oriented runtime toward a mission-oriented game model without replacing the existing gameplay simulation.

## Domain flow

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
Outcome
```

## Mission lifecycle

```text
available → active → completed
                    ↘ failed
```

A mission owns objectives and encounter references. It does not own the canvas simulation.

## Encounter lifecycle

The existing encounter domain remains canonical:

```text
pending → active → resolved
                 ↘ failed
```

The encounter owns runtime encounter metadata such as mission ownership, threat faction and current wave. It does not own the campaign.

## Application responsibilities

`createMissionService()` coordinates mission transitions and emits domain-facing application events. It is responsible for starting missions, updating objectives and resolving/failing missions.

## Runtime responsibilities

The game runtime remains responsible for simulation. It can notify the application layer about encounter and wave outcomes, but it must not decide campaign progression directly.

## Frontend contract

The frontend should consume mission state as:

```text
Mission title
Mission description
Objectives
Current objective progress
Encounter context
Mission outcome
```

It should not infer campaign state from the current wave number.

## Migration rule

Existing wave gameplay is preserved. The mission system is introduced around it first. Later phases can migrate individual enemy, boss, reward and progression responsibilities out of the legacy runtime safely.
