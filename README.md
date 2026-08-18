# Pampanaa — Lane Defense Command

A canvas-rendered arcade application built with React + Vite, packaged for the web and desktop with Electron.

## Highlights

- Canvas-based runtime separated from the React application shell.
- Persistent local profiles, saves, settings, achievements and career data.
- IndexedDB schema versioning with profile-isolated records.
- Desktop packaging through Electron with a narrow preload bridge.
- Renderer error boundary so unexpected UI failures do not wipe local progress.
- Responsive menu, missions, settings, career, achievements, leaderboard and codex surfaces.

## Getting started

Pampanaa uses Bun as the primary package manager.

```bash
bun install
bun run dev
```

Production web build:

```bash
bun run build
bun run preview
```

Desktop development:

```bash
bun run electron
```

Desktop packaging:

```bash
bun run electron-build
```

## Architecture

The project is intentionally divided into clear boundaries:

```text
src/
  canvas/       high-frequency runtime and rendering
  components/   reusable UI and domain components
  contexts/     React application state and runtime bridge
  database/     IndexedDB persistence and migrations
  hooks/        reusable React/browser behavior
  pages/        application screens
  styles/       global design system styles
  utils/        pure configuration and helpers
```

Desktop-only code lives under `public/`:

```text
public/
  electron.cjs  Electron main process
  preload.cjs   narrow renderer/native bridge
```

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before adding a new subsystem.

### Architectural rules

1. The canvas runtime must not depend on React rendering.
2. UI components must not access IndexedDB directly.
3. Profile-owned persistence must use the profile namespace helpers.
4. Related database changes should use one transaction.
5. Native capabilities must cross the preload boundary through a narrow API.
6. Stored data changes require an explicit IndexedDB migration.
7. Refactors should preserve existing public APIs where practical.

## Persistence

The application uses IndexedDB for local persistence. The existing database name is retained for compatibility with previously installed versions.

The database schema is centrally managed in `src/database/db.js` and is currently versioned independently from the application version.

Profile-owned records are namespaced so multiple local profiles remain isolated. Save/profile operations are written defensively to avoid leaking one profile's records into another profile's UI.

## Desktop security

The Electron renderer runs with:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- a narrow preload API
- a renderer Content Security Policy
- allowlisted native path access

Native functionality should be added to the preload/main-process boundary rather than exposing Node APIs to the renderer.

## Tech stack

- React 19
- Vite
- Canvas 2D
- IndexedDB via `idb`
- Electron
- Electron Builder
- Tailwind CSS
- Lucide React
- Sonner

## Repository hygiene

Use Bun consistently for local development. Avoid adding a second package-manager lockfile. Keep generated build output out of source control.

Before shipping a release, validate the web build, desktop packaging and persistence migrations against an existing local profile.

## License

See `LICENSE` and `Eula.txt`.
