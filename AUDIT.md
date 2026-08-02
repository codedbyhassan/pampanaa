# Pampanaa — Codebase & Product Audit

Date: 2026-08-02. Scope: full `src/` tree after the weapon + UI redesign.

## 1. What changed in this pass

**Weapons**
- `Weapon` now owns shot-multiplier maths (`shotCount`, `shotSpread`). Every weapon
  automatically supports multiplied fire — no per-weapon code.
- New pickups: `multishot` (timed ×2 barrels) and `multishotAmp` (permanent +1 barrel,
  capped at 5 stacks). `Player.shotMultiplier` combines both.
- Flamethrower reach 170 → 420 px with distance falloff, a per-enemy hit allowance based
  on enemy size, burn application, and long-lived jet particles so the visual matches the
  hitbox. Cone and jet count widen with the multiplier.

**UI/UX**
- Skippable intro slideshow (`pages/Splash.jsx`), auto-advancing, dot navigation,
  Esc/Enter/Space to skip, remembered per browser session.
- New AAA-style front end (`pages/MenuShell.jsx`): persistent left sidebar
  (Start New Game → Continue → Endless → Missions → Leaderboard → Achievements → Career →
  Settings), player footer, and a hero pane with lifetime stats. Continue is always shown
  and disabled with "No saved run yet" for new players, so layout never shifts.
- Removed developer-facing copy (IndexedDB/storage explanations) from the sign-in screen.
- `pages/MainMenu.jsx` deleted (superseded).

## 2. Dead / redundant code

| Item | Status | Recommendation |
| --- | --- | --- |
| `src/lib/utils.ts` | unreferenced | delete unless shadcn is added later |
| `SHOW_FPS`, `MIN_WORLD`, `PICKUP_KEYS` in `utils/constants.js` | exported, never imported | remove; FPS is already a setting |
| `settings.hasSeenOnboarding` panel in `GamePage` | overlaps the new intro | fold the control list into a pause-menu "Controls" tab |
| `settings.difficulty` (`'normal' \| 'hard'`) | legacy string next to `difficultyLevel` 1–10 | migrate the one achievement check to `difficultyLevel >= 8` and drop the field |
| `Quadtree` | used only by `collision.js` broadphase | fine, but verify it is actually faster than the naive loop at current entity counts |

## 3. Code quality

- **Engine/React split is good.** `GameEngine` pushes discrete syncs instead of per-frame
  state, which keeps React out of the hot loop. Keep that invariant.
- **`GameContainer.handleEvent` is doing too much** (achievements, persistence, stats,
  saves). Split into `useRunPersistence` and `useAchievementWatcher` hooks.
- **Mutating `progress.totalEnemiesDefeated` in place** (batched-write shortcut) bypasses
  React state and can desync the UI. Prefer a ref counter flushed on milestones.
- **Prettier config mismatch**: `.prettierrc` asks for double quotes while the entire
  codebase uses single quotes, so `eslint src` fails on ~everything. Either set
  `singleQuote: true` or run one formatting pass. Right now lint is effectively unusable.
- **No tests.** Highest-value first tests: `Weapon.shotCount/shotSpread`, `difficultyMods`,
  `getWaveConfig`, `resolveCollisions`.
- **Magic numbers** for balance live inside weapon/pickup classes. Move tuning values into
  `utils/constants.js` so balance passes are a one-file diff.

## 4. UI/UX recommendations (next)

1. Keyboard/gamepad navigation for the sidebar (arrow keys + Enter) — required for a真 AAA feel.
2. Add a confirmation step before "Start New Game" when a save exists.
3. Show active permanent amplifiers (damage / cadence / pierce / barrels) as HUD chips —
   right now only timed buffs are visible.
4. Pause menu should expose Settings and Controls without quitting the run.
5. Add a lightweight audio cue and transition when switching sidebar sections.
6. Mobile: the sidebar collapses to a stacked list under 820 px; a bottom tab bar would be
   better on phones.
7. Leaderboard/Career pages inherit the narrow `sg-panel` width — give them a wide variant
   to use the content pane.

## 5. Performance

- Projectile/particle/damage-number pools are in place; pool sizes (400/400/80) are fine.
- The flamethrower now emits 2–6 particles per tick at 20 ticks/s; if reduced-motion is on,
  gate jet count to 1 (already partially handled by `ParticleSystem.reducedMotion`).
- `engine.enemies` is filtered only when length > 60 — acceptable, but the filter allocates;
  reuse an array if profiling shows GC pressure.

## 6. Data & safety

- All state is local (IndexedDB) and per-profile; there is no auth boundary, so "profiles"
  are a convenience, not security. If leaderboards ever go online, move scoring
  server-side — client-submitted scores cannot be trusted.
