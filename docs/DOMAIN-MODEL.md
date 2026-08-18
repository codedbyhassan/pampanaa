# Pampanaa Domain Model

## Profile identity

A player profile has two separate concepts:

- `profileId` — immutable machine identity. This is the ownership key for application data and must never change during a profile rename.
- `name` — mutable display identity used by the player and legacy storage keys.

New profiles receive an opaque `pmp_...` identifier. Existing profiles are assigned one lazily when they are read after the schema upgrade.

## Ownership

Profile-owned records may temporarily retain legacy name-based storage keys for backward compatibility, but new writes carry `profileId`:

- settings
- player progress
- saves
- achievements
- scores

This lets the application migrate away from names without invalidating existing local data.

## Migration rule

Never use a display name as a permanent foreign key. A rename changes `name` only. `profileId` remains unchanged.

## Compatibility

The current IndexedDB schema remains compatible with existing installations. Version 6 adds profile identity indexes and the application lazily backfills missing profile IDs. A future schema can change object-store key paths only after explicit migration tooling and backup/recovery behavior are in place.

## Domain boundary

The domain defines identity and contracts. Infrastructure decides how identity and records are stored. Application services coordinate use-cases. React only consumes application state and commands.
