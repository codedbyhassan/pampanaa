# Phase 4 — Persistence Engineering

## Status

Complete at the source-architecture level on `main`.

## Delivered

- IndexedDB schema version advanced to v7.
- Store creation and index creation are idempotent during upgrades.
- Database opening resets its cached promise after failure or connection termination.
- Transaction helper commits only after the callback completes and aborts on failure.
- Profile-owned persistence remains compatible with legacy name-keyed records.
- Stable `profileId` ownership is retained across profile-related stores.
- Persistence health checks are available through the application service boundary.
- Full database export/import exists as a versioned backup format.
- Database-wide and profile-scoped recovery operations exist behind the persistence service.
- IndexedDB infrastructure is exposed through a single adapter boundary.

## Backup format

```text
format: pampanaa-backup
version: 1
exportedAt: ISO timestamp
databaseVersion: IndexedDB version
stores: complete store snapshots
```

Imports reject unsupported formats/versions before touching the database. The restore itself uses a single IndexedDB read/write transaction across all stores so a failure aborts the restore rather than leaving a partially imported database.

## Recovery rules

Profile cleanup is ownership-aware and checks stable `profileId` first while retaining compatibility with older profile/name fields. Full database reset is exposed as an explicit infrastructure operation and is not automatically invoked by application startup.

## Remaining runtime gate

The GitHub editing environment cannot execute Bun/Node locally. Runtime verification must still execute `bun install`, `bun run lint`, `bun run test`, `bun run build`, and an Electron package smoke test in a real development/CI environment.

## Next phase

Phase 5 — Game Engine Architecture.

The game runtime will be isolated from React/application concerns and organized around lifecycle, simulation, systems, rendering, input, audio and events without changing gameplay behavior.
