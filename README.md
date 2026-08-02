# Pampanaa

**Pampanaa** is an arcade space shooter with choreographed enemy formations, dynamic difficulty, and procedural environments. Clear waves of enemies, collect power-ups, unlock weapons, and chase your best score. Fully offline—no servers, no accounts, just pure arcade action.

![Pampanaa Menu](docs/screenshots/menu-main.png)

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [How to Play](#how-to-play)
- [Game Systems](#game-systems)
- [Gameplay Features](#gameplay-features)
- [Settings](#settings)
- [Data & Persistence](#data--persistence)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Features

### Core Gameplay
- **Formation-Based Enemies** — enemies arrive in choreographed squads with procedurally animated patterns (grid, vee, arc, diamond, columns, rings, spiral, lattice, wave, cross, hourglass, orbit)
- **Dynamic Choreography** — sway, pendulum, breathe, carousel, tide, figure-8, and drift movement routines layered on top of formations
- **21+ Enemy Species** — each drawn as a mathematical figure: polygons, star polygons, curves (lemniscate, astroid, rose), Sierpinski triangles, squircles, gears, and more
- **Layered Attack Patterns** — aimed, fan, radial, ring, spiral, cross, sweeping arcs, curtain walls, and lobbed shells
- **Boss Fights** — capital-class bosses appear every 5 waves with unique attack patterns

### Player Arsenal
- **5 Weapons** — Blaster (wave 1), Shotgun (wave 2), Laser (wave 4), Homing Missiles (wave 6), Flamethrower (wave 8)
- **Amplifier System** — collect permanent damage, fire-rate, pierce, and multishot stacks that compound across runs
- **Weapon Pickups** — best amplifiers only drop after defeating bosses, balanced by wave progression
- **Temporary Buffs** — shield, rapid fire, score multiplier, auto-lock, and multi-shot bonuses

### Environments
- **14 Procedural Backgrounds** — Deep Space, Nebula Drift, Open Ocean, Coral Reef, Midnight Abyss, Green Meadow, Night Forest, Desert Dunes, Red Canyon, Ice Field, Volcanic, Neon City, Storm Front, Sunset Coast
- **Dynamic Parallax Rendering** — multi-layer backgrounds with procedural waves, dunes, hills, skylines, weather effects
- **Auto-Rotation or Lock** — cycle environments every 3 waves or pick your favorite

### Player Experience
- **Named Profiles** — sign in with any name; all progress, settings, and achievements are locally stored per profile
- **Level Select & Replay** — replay any cleared wave with best scores tracked per level
- **Wave Mastery Badges** — earn "Perfect Wave" badges for no-damage clears and "Flawless" badges for no-hit runs
- **Combo System** — kill streak tracking with score multipliers (1.0x base, up to 2.0x at 10+ consecutive kills)
- **Accessibility** — colorblind palette, reduced motion toggle, rebindable controls, FPS counter, keyboard/mouse/gamepad/touch support

### UI & Polish
- **Redesigned Interface** — transparent sidebar blends seamlessly with background, clean menu navigation without sub-descriptions
- **Player Header** — account switcher in top-right corner with current player name and skin
- **Subtle Status Displays** — pickups fade in/out without cluttering the screen
- **Combo Counter** — positioned bottom-right for full gameplay visibility
- **Pampanaa Branding** — logo featured on splash, home menu, and throughout the app

## Getting Started

### Requirements
- Node.js 20+ (or [Bun](https://bun.sh) 1.1+)
- Chromium, Firefox, or Safari with Canvas 2D and IndexedDB support

### Install & Run

```bash
npm install        # or: bun install
npm run dev        # or: bun run dev
```

Dev server starts at [http://localhost:5173](http://localhost:5173)

### Production Build

```bash
npm run build
npm run preview
```

### Electron Desktop App

```bash
npm run electron-dev       # Build and launch with Electron
npm run electron-build     # Create installers (Windows, macOS, Linux)
```

## How to Play

### Controls

| Action | Input |
|--------|-------|
| Move | `W A S D` / arrow keys / left stick / touch stick |
| Aim & Fire | Mouse / `Space` / right trigger / touch fire button |
| Switch Weapon | Scroll wheel / `1`–`5` / `Q` / `E` |
| Pause | `Escape` |

### Gameplay Flow

1. **Clear Waves** — enemies arrive as a choreographed squad; clear them all to advance
2. **Collect Power-ups** — pickups drift downward; fly under them to collect
3. **Boss Every 5 Waves** — capital-class bosses drop special amplifiers on defeat
4. **Escalate Difficulty** — choose 1–10 difficulty to scale enemy stats and frequency
5. **Track Progress** — wave completion, achievements, and best scores are saved per profile

## Game Systems

### Wave Progression
- **Authored Waves** — waves 1–18 have hand-tuned formations, choreography, rosters, and difficulty curves
- **Procedural Waves** — waves 19+ are generated procedurally so endless mode never repeats
- **Difficulty Scaling** — wave progression compounds with your chosen difficulty level
- **Wave Mastery** — track perfect (no-damage) and flawless (no-hit) clears per wave/difficulty combo

### Difficulty System
Single 1–10 slider adjusts:
- Enemy health & damage multiplier
- Projectile frequency
- Formation speed and entry speed
- Squad size (fewer enemies at high difficulty for fairness)
- Pickup drop rate (still generous even on Nightmare)

**Difficulty Levels:**
1. Sightseeing — very easy, learning-friendly
2. Relaxed — casual gameplay
3. Casual — friendly challenge
4. Standard — balanced, recommended
5. Brisk — getting difficult
6. Spirited — sharp reflexes required
7. Tense — expert difficulty
8. Hostile — highly challenging
9. Brutal — extreme difficulty
10. Nightmare — mastery only

### Weapon & Amplifier System
- **Unlocking** — weapons unlock automatically as waves progress
- **Amplifiers** — drop from enemies (common) or bosses (rare)
- **Damage Amp** — +20% damage per stack
- **Fire Rate Amp** — +15% fire rate per stack (max 5)
- **Multishot Amp** — +1 barrel per stack (max 5, doubles with multishot buff)
- **Pierce Amp** — bullets ignore armor and slow enemies
- **Boss Pickups** — only available after defeating bosses, wave-gated (autolock at wave 30+, full pool at 50+)

### Combo System
- **Kill Streaks** — consecutive kills within 1.5 seconds
- **Score Multiplier** — +50 points per kill, x1.5-x2.0 multiplier based on combo count
- **Visual Feedback** — combo counter displays in bottom-right with pulsing animation

## Gameplay Features

### Pickups & Power-ups
- **Health Repair** — restore 25 hull points
- **Shield** — 5-second invulnerability
- **Rapid Fire** — 7-second doubled fire rate
- **Double Score** — 9-second score multiplier
- **Auto-Lock** — 12-second automatic targeting
- **Multishot Buff** — 10-second barrel doubler
- **Amplifiers** — permanent stacking bonuses (damage, fire rate, pierce, multishot)

### Achievement System
- Unlocked achievements stored per profile
- Centered toast notifications
- Some achievements unlock new ship skins
- Tracked stats: waves cleared, enemies defeated, kills, damage dealt

### Visual Effects
- **Particle Bursts** — pickup collection, explosions, impact feedback
- **Screen Shake** — intensity scales with damage (max on boss kills)
- **Damage Numbers** — floating text showing enemy damage taken
- **Combo Animation** — pulsing counter display on consecutive kills

## Settings

Every setting is persistent per profile:

| Category | Options |
|----------|---------|
| **Gameplay** | Difficulty (1–10), auto-save on wave clear, damage numbers, screen shake toggle |
| **Backgrounds** | Auto-rotation or any of 14 environments with preview |
| **Appearance** | 6 UI themes, 6 ship hull designs |
| **Audio** | Master volume, SFX volume, procedural music toggle, music volume |
| **Controls** | Control scheme (keyboard/gamepad), rebindable keys for movement and fire |
| **Accessibility** | Colorblind palette, reduced motion, FPS counter, fullscreen |
| **Data** | Reset all settings, clear saved run, erase all profile data |

## Data & Persistence

All data stored locally in IndexedDB (database: `pampanaa`, schema v4):

| Store | Purpose |
|-------|---------|
| `profiles` | Player names, creation time, last session |
| `settings` | Per-profile game settings (difficulty, audio, controls) |
| `playerProgress` | Wave completions, best scores, lifetime stats, unlocks |
| `saves` | Auto-save snapshots for resume functionality |
| `scores` | Local leaderboard (top runs per profile) |
| `achievements` | Unlocked achievement IDs per profile |

**Privacy:** All data remains on your device. No network calls at runtime.

## Tech Stack

- **Frontend Framework** — React 19
- **Build Tool** — Vite 8
- **Rendering** — Canvas 2D (vector art generated at runtime, no sprites)
- **State Management** — React Context + hooks
- **Audio** — Web Audio API (procedural music and effects)
- **Persistence** — IndexedDB (via `idb` library)
- **Desktop** — Electron 31 with electron-builder
- **Styling** — Plain CSS with design tokens
- **Fonts** — Plus Jakarta Sans (Google Fonts)

## Project Structure

```
src/
├── canvas/               # Game rendering engine
│   ├── GameEngine.js     # Main game loop, collision, wave logic
│   ├── spriteDrawer.js   # Vector art for enemies, player, effects
│   ├── parallaxRenderer.js  # Multi-layer background rendering
│   └── backgroundThemes.js  # 14 environment definitions
├── components/
│   ├── audio/            # SoundManager, procedural audio
│   ├── effects/          # Particles, screen shake, damage numbers
│   ├── enemy/            # Enemy class, 21+ species, bosses, formations
│   ├── game/             # Game canvas, HUD, pause menu, game over
│   ├── physics/          # Collision detection and resolution
│   ├── pickups/          # Pickup system and drop types
│   ├── player/           # Player ship, weapons, buffs
│   └── weapons/          # 5 weapon types and projectiles
├── contexts/             # Game provider, audio provider
├── database/             # IndexedDB schemas and queries
├── hooks/                # Game loop, input (keyboard/gamepad/touch)
├── pages/                # UI pages (menu, settings, leaderboard, etc.)
├── styles/               # Global CSS, design tokens, theme system
└── utils/                # Constants, wave config, achievements, object pooling

public/
└── logo.png              # Pampanaa brand logo
```

### Key Files

- **GameEngine.js** — Main game loop (60 FPS), enemy spawning, collision, wave progression, boss logic, combo tracking
- **Enemy.js / Boss.js** — Entity classes with AI, attack patterns, health/damage
- **Weapon.js** — Base weapon class; subclasses for blaster, shotgun, laser, homing, flamethrower
- **Pickup.js** — Pickup spawn, magnetism, collection, amplifier stacking
- **GameHUD.jsx** — Score, wave, health display, weapon selector, buff indicators, combo counter
- **MenuShell.jsx** — Sidebar navigation, home hero, player header with account switcher
- **constants.js** — Wave config, difficulty multipliers, achievement thresholds, weapon unlock waves

---

## Gameplay Balance

### Pickup Availability
- **Common Pickups** — health, shield, rapid fire, score multiplier, auto-lock drop from regular enemies
- **Boss Pickups** — damage/fire-rate/pierce/multishot amplifiers and advanced effects (e.g., auto-lock) only after boss defeats
- **Wave Gating** — early game (1–30): basic amplifiers only; mid-game (30–50): auto-lock available; late-game (50+): all pickups

### Difficulty Tuning
- **Generous Pickup Rate** — even on Nightmare difficulty, you get meaningful power-ups
- **Scaled Enemy Stats** — enemy health and damage increase linearly with difficulty, never exponentially
- **Squad Size** — actually decreases at high difficulty to maintain playability
- **Fire Rate** — increases more smoothly to avoid instant-death scenarios

---

## Contributing

Pull requests welcome! To add content:

1. **New Enemy** — one-line entry in `src/components/enemy/enemyDefs.js` + shape in `spriteDrawer.js`
2. **New Background** — one entry in `backgroundThemes.js`; settings picker picks it up automatically
3. **New Weapon** — subclass `Weapon`, define fireRate/damage/spread, add to weapon pool
4. **New Achievement** — entry in achievement table + definition in `constants.js`

---

## License

MIT
