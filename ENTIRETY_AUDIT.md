# PAMPANAA - Complete Application Audit & Architecture Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Project Structure](#project-structure)
3. [Core Architecture](#core-architecture)
4. [UI/Menu System](#uimenu-system)
5. [Game Logic & Engine](#game-logic--engine)
6. [Entity Systems](#entity-systems)
7. [Physics & Collision](#physics--collision)
8. [Data Persistence](#data-persistence)
9. [Input & Controls](#input--controls)
10. [Audio System](#audio-system)
11. [Visual Effects](#visual-effects)
12. [File Directory Reference](#file-directory-reference)

---

## Application Overview

**Pampanaa** is a browser-based space shooter arcade game built with React, Vite, and Canvas. It features wave-based enemy formations, weapon progression, achievement tracking, and persistent player profiles stored in IndexedDB.

### Key Features
- **Wave-based Gameplay**: 18+ procedurally configured enemy waves with boss encounters every 5th wave
- **Weapon Progression**: 5 weapons unlocked progressively (Blaster → Shotgun → Laser → Homing Missile → Flamethrower)
- **Amplifier System**: Stacking permanent power-ups (damage, fire rate, pierce, multishot) that persist until death
- **Buff System**: Timed power-ups (shield, rapid fire, score multiplier, auto-lock, multishot)
- **Achievement Tracking**: 15+ achievements unlocked by gameplay milestones
- **Difficulty Scaling**: 10 difficulty levels that modify enemy stats, formations, and fire rates
- **Combo System**: Kill streak multiplier that resets after 1.5 seconds of no kills
- **Wave Mastery**: Perfect wave badges for damage-free clears
- **Multiple Game Modes**: Campaign, Endless, and Mission replay modes
- **Persistent Profiles**: Multiple player profiles with saved progress, stats, and unlocked achievements

### Technology Stack
- **Frontend**: React 19 with Hooks
- **Rendering**: Canvas 2D API with sprite rendering
- **State Management**: React Context API
- **Build Tool**: Vite 8
- **Database**: IndexedDB (via idb library)
- **Package Manager**: npm
- **Desktop**: Electron ready (configuration included)

---

## Project Structure

```
src/
├── App.jsx                          # Root component with routing logic
├── main.jsx                         # React entry point
├── canvas/                          # Game rendering engine
│   ├── GameEngine.js               # Main game loop, entity management, wave system
│   ├── backgroundThemes.js         # Parallax background themes by wave
│   ├── parallaxRenderer.js         # Background rendering with depth layers
│   ├── spriteDrawer.js             # Shape/sprite drawing utilities
│   └── setupCanvas.js              # Canvas initialization and resize handling
├── components/
│   ├── game/                       # Game UI components
│   │   ├── GameContainer.jsx       # Game state wrapper, achievement tracking
│   │   ├── GameCanvas.jsx          # Canvas integration and input handling
│   │   ├── GameHUD.jsx             # Score, health, wave, combo display
│   │   ├── GameOverScreen.jsx      # Death/wave complete screen
│   │   ├── PauseMenu.jsx           # Pause functionality
│   │   ├── WeaponSelector.jsx      # Weapon switching UI
│   │   ├── TouchControls.jsx       # Mobile on-screen joystick
│   │   └── AchievementToast.jsx    # Achievement unlock notification
│   ├── player/
│   │   ├── Player.js               # Player entity, health, buffs, amplifiers
│   │   └── PlayerHealthBar.jsx     # Health bar UI component
│   ├── enemy/
│   │   ├── Enemy.js                # Base enemy class with damage, buffs, burn/slow effects
│   │   ├── FormationManager.js     # Wave spawning, choreography system
│   │   ├── enemyDefs.js            # Enemy type definitions (Chaser, Shooter, Tank, etc.)
│   │   └── enemyTypes/
│   │       └── Boss.js             # Boss enemy (wave 5, 10, 15, 20...)
│   ├── weapons/
│   │   ├── Weapon.js               # Base weapon class
│   │   ├── Projectile.js           # Projectile entity with collision, piercing, homing
│   │   ├── weaponTypes/            # Weapon subclasses
│   │   │   ├── Blaster.js          # Single-shot basic weapon
│   │   │   ├── Shotgun.js          # Spread shot weapon
│   │   │   ├── Laser.js            # Continuous beam weapon
│   │   │   ├── HomingMissile.js    # Seeking projectile weapon
│   │   │   ├── Flamethrower.js     # AOE fire spray weapon
│   │   │   └── index.js            # Weapon factory
│   ├── pickups/
│   │   ├── Pickup.js               # Pickup entity, drift behavior, pickup system
│   │   └── pickupTypes.js          # Pickup type definitions
│   ├── effects/
│   │   ├── ParticleSystem.js       # Particle emission, pooling, rendering
│   │   ├── ScreenShake.js          # Camera shake on hits and kills
│   │   └── DamageNumbers.js        # Floating damage text
│   ├── audio/
│   │   └── SoundManager.js         # Sound playback, volume control
│   └── physics/
│       ├── collision.js            # Collision detection and resolution
│       ├── Quadtree.js             # Spatial partitioning for collision optimization
│       └── Vector2D.js             # Vector math utilities
├── contexts/
│   ├── GameContext.jsx             # Global game state (profiles, settings, progress)
│   └── AudioContext.jsx            # Audio state and utilities
├── pages/
│   ├── Splash.jsx                  # Intro/splash screen
│   ├── MenuShell.jsx               # Main menu navigation hub
│   ├── GamePage.jsx                # Game page wrapper
│   ├── Profile.jsx                 # Player profile creation/selection
│   ├── Settings.jsx                # Difficulty, audio, visual settings
│   ├── Achievements.jsx            # Achievement list with unlock status
│   ├── Leaderboard.jsx             # High scores from local profiles
│   ├── Stats.jsx                   # Career statistics
│   └── LevelSelect.jsx             # Replay specific waves
├── database/
│   ├── db.js                       # IndexedDB initialization
│   ├── profiles.js                 # Profile sign-in/out, active profile
│   ├── settings.js                 # Settings persistence
│   ├── progress.js                 # Wave progress, unlocked weapons
│   ├── saves.js                    # Game saves (resume points)
│   ├── scores.js                   # High score tracking
│   └── achievements.js             # Achievement unlock tracking
├── hooks/
│   ├── useGameLoop.js              # Canvas animation frame loop
│   ├── useGamepad.js               # Gamepad/controller input
│   ├── useKeyboard.js              # Keyboard input
│   └── useTouchControls.js         # Touch input for mobile
├── utils/
│   ├── constants.js                # Game configuration (world size, difficulty mods, waves)
│   ├── achievementDefs.js          # Achievement definitions
│   ├── objectPool.js               # Object pooling utility
│   └── objectPool.js               # Reusable entity pooling
├── styles/
│   └── global.css                  # All UI styling, animations, themes
└── contexts/
    └── AudioContext.jsx            # Audio management

public/
├── electron.js                     # Electron main process
└── preload.js                      # Electron IPC preload script

Configuration Files:
├── vite.config.ts                  # Vite build configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── .prettierrc                      # Code formatting rules
├── eslint.config.js                # Linting rules
└── index.html                      # HTML entry point
```

---

## Core Architecture

### App.jsx - Root Component & Routing

**Purpose**: Top-level React component managing page navigation and global UI theming.

**Flow**:
1. Wraps entire app in `GameProvider` (context) and `AudioProvider`
2. Manages intro/splash screen (shown once per session)
3. Routes between pages: Splash → Profile → Menu → Game
4. Applies UI theme (nebula, dark, light) to root DOM element

**Key Props**:
- `intro`: Session storage state for showing splash only once
- `page`: Current page ('menu', 'game')
- `mode`: Game mode ('campaign', 'endless')
- `startWave`: Starting wave number for level select
- `resumeSnapshot`: Save state for resuming games

**Children**:
- `Shell()`: Main navigation controller
- `ThemedRoot()`: Theme wrapper
- `AchievementToast()`: Global achievement notification

### GameContext.jsx - Global State Management

**Purpose**: Central React Context providing all game state and callbacks.

**State Variables**:
```javascript
profile              // Currently active player name
settings             // Audio volume, difficulty, ship design, UI theme
progress             // Unlocked weapons, highest wave, career stats
unlockedAchievements // Array of achievement IDs unlocked
hasSave              // Boolean: has at least one saved game
loaded               // Boolean: initial data fetch complete
status               // Current game status: 'idle', 'playing', 'paused', 'dead'
hud                  // Real-time HUD display state (score, health, combo, etc.)
toasts               // Achievement notifications queue
```

**HUD State Fields**:
- `score`: Current run score
- `health`: Player health (0-100)
- `wave`: Current wave number
- `weapon`: Currently selected weapon key
- `combo`: Kill streak count
- `comboMultiplier`: Score multiplier (1 + combo/5 * 0.5)
- `buffs`: Active timed buffs and durations
- `amps`: Permanent amplifier counts
- `boss`: Current boss entity data or null
- `waveBanner`: Show "Wave X" banner for 2 seconds
- `waveMastery`: 'PERFECT' or 'NO_HIT' or null for achievement display
- `unlockedWeapons`: Array of weapon keys unlocked

**Key Methods**:
- `signIn(name)`: Authenticate player profile
- `signOut()`: Clear profile and reset all state
- `saveSettings(patch)`: Update and persist settings
- `saveProgress(patch)`: Update and persist progress
- `syncFromEngine(partial)`: Called by GameEngine to update HUD state
- `tryUnlockAchievement(def)`: Attempt to unlock achievement, show toast
- `resetHud(initial)`: Clear HUD for new game

**Usage**: All components and pages access context via `useGame()` hook.

---

## UI/Menu System

### Pages Overview

#### Splash.jsx - Intro Screen
- Shows on first load per session
- Displays controls (WASD/arrows, mouse, space)
- Skippable after 2 seconds
- Session stored so it only shows once

#### Profile.jsx - Player Selection
- Create new profile with custom name
- Select from existing profiles
- Sign out current profile
- Persisted in IndexedDB

#### MenuShell.jsx - Main Menu Hub
**Navigation Items**:
- New Game (Campaign mode)
- Continue Game (Resume from save)
- Endless Mode (Infinite waves)
- Missions (Replay specific waves)
- Leaderboard (Local high scores)
- Achievements (Unlock progress)
- Career Stats (Lifetime statistics)
- Settings (Options)

**Two-column layout**:
- Left: Navigation sidebar (always visible)
- Right: Content pane (switches based on selection)

#### Settings.jsx - Configuration Page
**Options**:
- Difficulty Level (1-10 scale with detailed tooltips)
- Volume Control (master volume 0-100%)
- Music/SFX Toggles
- Visual Options (screen shake, reduced motion, colorblind mode)
- Ship Design (interceptor, drifter, sentinel, vanguard)
- UI Theme (nebula, dark, light)

**Data Persistence**: All settings saved to `DEFAULT_SETTINGS` in IndexedDB

#### Achievements.jsx - Achievement Gallery
- Grid or list of all 15+ achievements
- Shows locked/unlocked status
- Display unlock requirements
- Shows unlock date and time
- Sortable by rarity or unlock date

#### Leaderboard.jsx - Local High Scores
- Top 20 scores from all profiles
- Shows profile name, score, wave reached, time
- Filters by game mode (campaign/endless)
- Sorted by score descending

#### Stats.jsx - Career Statistics
**Displays**:
- Total games played
- Total kills
- Total score
- Highest wave
- Average run length
- Favorite weapon
- Most defeated enemy type
- Play time (hours)
- Accuracy (shots vs kills)

#### LevelSelect.jsx - Mission Replay
- Shows all unlocked waves (cleared on campaign)
- Displays best score on each wave
- Option to replay with current settings
- Shows enemy composition preview

#### GamePage.jsx - Game Wrapper
- Mounts GameContainer during gameplay
- Handles mode and save snapshot passing
- Unmounts on quit to menu
- Triggers audio resume on start

### GameHUD.jsx - In-Game UI Display

**HUD Elements**:
- **Top-left**: Score and wave number
- **Top-right**: Health bar with shield indicator
- **Center-top**: Wave banner ("Wave 5" + mastery badge)
- **Center-bottom**: Combo display with multiplier (animated pulse)
- **Right side**: Active buffs with countdown timers
- **Right side**: Amplifier badges (color-coded by type)
- **Bottom-left**: Current weapon name
- **Bottom-center**: Wave progress (enemies killed / total)

**Visual Features**:
- Smooth health bar animations
- Color-coded amplifier badges (DMG: gold, FIRE: cyan, PIERCE: orange, MULTI: magenta)
- Floating damage numbers on hits
- Achievement toasts slide in from top-right
- Combo counter grows and pulses as streak increases
- Wave banner fades in/out with bouncy animation

### GameOverScreen.jsx - Death/Wave Complete

**Shows**:
- Final score
- Waves survived
- Enemies killed
- Personal best comparison
- "Retry Wave" or "Continue" button
- Stats summary (accuracy, avg damage per shot, etc.)

---

## Game Logic & Engine

### GameEngine.js - Main Game Loop

**Purpose**: Core game simulation running at 60 FPS, managing all entities and game state.

**Constructor Parameters**:
```javascript
{
  settings,              // Difficulty, visual options
  progress,              // Unlocked weapons, saved progress
  mode,                  // 'campaign' or 'endless'
  startWave,             // Starting wave (1 for new, any for level select)
  callbacks: {
    onSync,              // Called with HUD updates for React
    onEvent,             // Called with game events (kill, wave advance, boss defeat)
  }
}
```

**Key Properties**:
- `player`: Player entity instance
- `enemies`: Array of active enemies
- `projectiles`: Object pool of 400 projectiles
- `formations`: FormationManager instance (wave choreography)
- `wave`: Current wave number (1-based)
- `score`: Current score (0+)
- `status`: 'playing', 'paused', or 'dead'
- `combo`: Kill streak counter (increments on each kill, resets after 1.5s with no kills)
- `waveStartHealth`: Player health at wave start (used for perfect wave detection)
- `difficultyMods`: Difficulty modifiers for current difficulty level

**Update Loop** (`update(dt, input)`):
1. Update player position from input
2. Update and fire weapons
3. Update all enemies (movement, rotation, choreography, firing)
4. Handle collisions (projectile-enemy, enemy-player, pickup-player)
5. Spawn pickups from enemy deaths
6. Check wave completion
7. Advance wave if completed
8. Sync HUD changes to React
9. Emit events (kills, bosses, etc.)

**Key Methods**:
- `startWave()`: Spawn new enemy formation
- `advanceWave()`: Increment wave, award mastery badges
- `damageEnemy(enemy, amount, weaponKey)`: Deal damage, apply amplifier effects, trigger screen shake
- `killEnemy(enemy, weaponKey)`: Handle enemy death, spawn pickups, increment combo
- `getWaveConfig(wave)`: Retrieve enemy formation for wave
- `spawnProjectile(config)`: Create projectile from pool
- `sync(partial)`: Update HUD via onSync callback
- `emit(eventName, payload)`: Fire game events

**Difficulty Modifiers** (via `difficultyMods(level)`):
- `statMul`: Enemy health/damage multiplier (1.0 at difficulty 4, scales up/down)
- `fireMul`: Enemy fire rate multiplier
- `ampDropRate`: Frequency of amplifier pickups (1.0 at difficulty 4, lower at higher difficulties)
- `scoreDiv`: Score divider for difficulty penalty

**Wave Configuration** (from WAVES array):
- `formation`: Enemy layout (grid, vee, arc, diamond, etc.)
- `choreography`: Squad movement pattern (sway, pendulum, carousel, etc.)
- `roster`: Array of enemy types to spawn
- `rows`/`cols`: Formation grid dimensions
- `fireRateMul`: Fire rate multiplier for this wave
- `statScale`: Enemy stat scaling for this wave

### Combo System

**Implementation**:
- On each kill: `combo += 1; comboTimer = 1.5`
- Every frame: `comboTimer -= dt; if (comboTimer <= 0) combo = 0`
- Combo multiplier: `1 + (Math.floor(combo/5) * 0.5)` (x2 at 5 kills, x3 at 10, etc.)
- Score bonus: `+50 * (combo - 1)` points per kill in combo
- Visual feedback: Combo display pulses and grows each kill

### Wave Mastery System

**Perfect Wave Badge**:
- Awarded if player doesn't take damage during wave
- Checked: `player.health >= waveStartHealth` on wave advance
- Visual: "⭐ PERFECT WAVE!" text with gold text shadow

**Flawless Badge**:
- Awarded if player takes no damage at all (health == 100)
- Visual: "⭐⭐ FLAWLESS!" text with green text shadow

---

## Entity Systems

### Player.js - Player Entity

**Position & Movement**:
- `x, y`: Center position
- `vx, vy`: Velocity
- `speed`: Movement speed (PLAYER.speed = 320 pixels/sec)
- `angle`: Facing angle (used for sprite rotation)

**Health & Buffs**:
- `health`: Current HP (0-100)
- `maxHealth`: Maximum HP (100)
- `activeBuffs`: Object with buff types as keys, durations as values
  - `shield`: Blocks one hit
  - `rapidFire`: Halves weapon cooldown
  - `scoreMultiplier`: Doubles score gained
  - `autoLock`: Auto-aims at nearest enemy
  - `multishot`: Doubles projectile count

**Amplifiers** (Permanent until death):
- `amps`: Object with amplifier types, count as value
  - `damage`: +20% damage per stack (multiplied in weapon fire)
  - `fire`: +15% fire rate per stack
  - `pierce`: Projectiles pierce through enemies
  - `multishot`: +1 barrel per stack

**Methods**:
- `addAmp(kind)`: Increment amplifier count
- `hasBuff(name)`: Check if buff is active
- `applyBuff(name, duration)`: Apply or extend buff
- `takeDamage(amount)`: Reduce health, check death, return true if damage dealt
- `heal(amount)`: Increase health (used by shield buff on hit)
- `update(dt, input)`: Update buffs, apply movement

### Enemy.js - Enemy Entity

**Position & Movement**:
- `x, y`: Center position
- `vx, vy`: Velocity (computed from slot choreography)
- `speed`: Maximum speed (varies by type)
- `angle`: Facing angle

**Health & Defense**:
- `health`: Current HP
- `maxHealth`: HP based on type, difficulty, wave scaling
- `armor`: Damage reduction (0-1)
- Contact damage: `contactDamage` dealt on collision with player

**Enemy Types** (from `ENEMY_DEFS`):
- **Chaser**: Fast, low health, melee contact damage
- **Shooter**: Medium speed, fires projectiles
- **Swarmer**: Small, numerous, pack behavior
- **Tank**: Slow, high armor, high health
- **Splitter**: Dies into smaller enemies
- **Orbiter**: Circles around formation center
- **Pentagram/Torus/Lemniscate/etc.**: Exotic patterns for late waves

**Formation State**:
- `slot`: Formation slot coordinates [row, col]
- `mode`: 'free' (not in formation), 'entering' (flying to slot), 'holding' (in formation)
- `entryDelay`: Time before starting entry animation
- `bob`: Bobbing animation offset (sine wave)

**Status Effects** (from amplified weapons):
- `burn`: Damage over time duration
- `burnDps`: Damage per second from fire
- `slow`: Slow effect duration (reduces speed and fire rate)

**Methods**:
- `assignSlot(slot, delay)`: Join formation
- `takeDamage(amount)`: Apply armor, reduce health, return true if killed
- `applyBurn(dps, duration)`: Apply or extend burn effect
- `applySlow(duration)`: Apply or extend slow effect
- `update(dt, engine)`: Update effects, movement, firing
- `draw(ctx, drawer)`: Render enemy shape

### Enemy Formations - FormationManager.js

**System**:
1. Each wave has a base formation (grid, vee, arc, etc.)
2. Formation slots arranged in rows/cols
3. Enemies fly from off-screen to slots on entry
4. Whole squad moves together (choreography pattern)
5. Squad sways/pendulums/breathes based on choreography

**Choreography Types**:
- `sway`: Side-to-side oscillation
- `pendulum`: Back and forth swinging
- `breathe`: Breathing expansion/contraction
- `carousel`: Rotating formation center
- `tide`: Rolling wave motion
- `figure8`: Figure-8 pattern
- `drift`: Slow random drift

**Entry Animation**:
- Enemies staggered by `entryDelay`
- Ease in curve: quadratic, from entry point to slot
- Duration: ~1 second per enemy

**Methods**:
- `spawnWave(config, scale)`: Create enemy squad for wave
- `update(dt)`: Update choreography positions
- `getSlotPosition(row, col)`: Compute slot world position

### Boss.js - Boss Enemy

**Special Properties**:
- Spawned on waves 5, 10, 15, 20, etc. (`wave % 5 === 0`)
- No formation (solo enemy)
- 5x enemy health scaling
- 2x contact damage
- Unique visual (larger, different color)
- Emits "bossDefeated" event on death

**Behavior**:
- Circles player in orbit pattern
- Fires more frequently than regular enemies
- Visible health bar in HUD when active
- Screen shake on death (18 magnitude)

---

## Physics & Collision

### Collision.js - Collision Detection & Resolution

**Collision Types**:
1. **Projectile-Enemy**: Damage enemy, destroy projectile (or pierce)
2. **Projectile-Pickup**: Ignore (pickups solid to ground only)
3. **Enemy-Enemy**: Separate overlapping enemies (formation keeps them apart)
4. **Enemy-Player**: Deal contact damage, push player away
5. **Pickup-Player**: Pickup collected, apply buff/amplifier

**Broad Phase** (via Quadtree):
- Spatial hash to reduce O(n²) collision checks
- Update every frame as entities move

**Narrow Phase**:
- Circle-circle distance check for close entities
- AABB (axis-aligned bounding box) fallback for fast rejection

**Methods**:
- `resolveCollisions(engine)`: Main collision loop
- `circlesOverlap(a, b)`: Check circle collision
- `pushApart(a, b)`: Separate overlapping circles

### Quadtree.js - Spatial Partitioning

**Purpose**: Optimize O(n²) collision checks to O(n log n)

**Structure**:
- Recursively divide space into 4 quadrants
- Entities stored in leaf nodes
- Query returns potential collisions (pruned by distance)

**Methods**:
- `insert(entity)`: Add entity to tree
- `query(bounds)`: Get entities in rectangular region
- `clear()`: Reset tree for next frame

### Vector2D.js - Vector Math

**Utilities**:
- `distance(a, b)`: Euclidean distance
- `magnitude(v)`: Vector length
- `normalize(v)`: Unit vector
- `dot(a, b)`: Dot product
- `rotate(v, angle)`: Rotate vector by angle

---

## Entity Systems - Weapons

### Weapon.js - Base Weapon Class

**Properties**:
- `fireRate`: Shots per second (determines cooldown)
- `damage`: Damage per projectile
- `projectileCount`: Number of projectiles per shot (base, before multipliers)
- `spread`: Cone angle in radians for spread shots
- `projectileSpeed`: Pixel/sec velocity
- `projectileSize`: Radius in pixels
- `color`: Projectile color
- `continuous`: True for beam weapons (Laser, Flamethrower)
- `homing`: True for seeking projectiles (Homing Missile)
- `range`: Max distance before despawn (0 = infinite)
- `cooldown`: Current cooldown timer (decrements each frame)

**Methods**:
- `tryFire(engine, owner, angle)`: Check cooldown, fire if ready
- `shotCount(owner)`: Calculate actual projectiles considering multipliers
- `shotSpread(count)`: Calculate cone angle considering shot count
- `fire(engine, owner, angle)`: Spawn projectiles, play sound

**Weapon Subclasses**:
1. **Blaster** (unlock wave 0):
   - Single projectile, tight spread
   - Fire rate: 4 shots/sec
   - Damage: 10

2. **Shotgun** (unlock wave 2):
   - 6 projectiles in wide spread
   - Fire rate: 2 shots/sec
   - Damage: 8 (per pellet)

3. **Laser** (unlock wave 4):
   - Continuous beam
   - Fire rate: 1 sec on/off
   - Damage: 5 per frame
   - Range: 600 pixels

4. **Homing Missile** (unlock wave 6):
   - Homing projectile seeking nearest enemy
   - Fire rate: 1 shot/sec
   - Damage: 25
   - Auto-targets

5. **Flamethrower** (unlock wave 8):
   - Continuous spray, wide spread
   - Fire rate: Continuous
   - Damage: 3 per frame
   - Applies burn effect

**Amplifier Effects on Weapons**:
- `damage` amplifier: 20% bonus damage per stack
- `fire` amplifier: 15% fire rate bonus per stack
- `pierce` amplifier: Projectiles pass through enemies
- `multishot` amplifier: +1 barrel per stack (max 5)

### Projectile.js - Projectile Entity

**Properties**:
- Position, velocity, dimensions
- `damage`: Damage dealt on hit
- `source`: 'player' or 'enemy'
- `weaponKey`: Which weapon fired it
- `homing`: True to track target
- `piercing`: True to pass through enemies
- `life`: TTL in seconds

**Methods**:
- `update(dt, engine)`: Move, apply homing, check bounds
- `collidesWith(entity)`: Check if hit entity
- `resolveHit(engine, entity)`: Deal damage, despawn

---

## Pickups & Amplifiers

### Pickup.js - Pickup Entity System

**Pickup Types**:
- **Amplifiers**: Permanent (damage, fire, pierce, multishot)
- **Buffs**: Timed (shield 5s, rapid fire 8s, score multiplier 8s, etc.)

**Behavior**:
- Spawn at enemy death location
- Drift toward player (magnet effect within 170 pixels)
- Fall gravity effect (130 pixels/sec)
- Collected on collision with player

**Drop Logic**:
- Random chance based on difficulty
- Different pickup type for each amplifier
- Buff pickups more common early waves

### pickupTypes.js - Pickup Definitions

**Amplifier Pickups**:
- Each has unique icon, color, sound
- Associated with amplifier type
- Permanent until player dies

**Buff Pickups**:
- Shield: White circle, 5 second duration, blocks 1 hit
- Rapid Fire: Blue square, 8 seconds, 2x fire rate
- Score Multiplier: Gold star, 8 seconds, 2x score
- Auto-Lock: Cyan diamond, 6 seconds, aims at nearest
- Multishot: Magenta cross, 8 seconds, 2x projectiles

---

## Visual Effects

### ParticleSystem.js - Particle Effects

**Usage**:
- Enemy death burst (10-46 particles based on size)
- Projectile impact sparks
- Shield activation glow
- Buff pickup effects

**Pooling**:
- 400 pre-allocated particles
- Reused each frame
- Allocate/free overhead minimized

**Rendering**:
- Particle sprites with color tinting
- Velocity-based trail effects
- Alpha fade over lifetime
- Additive blending for glow

### ScreenShake.js - Camera Shake Effect

**Triggers**:
- Weapon hit: 2-8 magnitude (scales with damage)
- Enemy death: 4 magnitude (18 for boss)
- Player damage: 6 magnitude
- Boss appears: 10 magnitude

**Implementation**:
- Perlin noise-based shake
- Decays over ~0.2 seconds
- Applies camera offset to all rendering

### DamageNumbers.js - Floating Text

**Display**:
- Damage value at hit location
- Color based on damage (red normal, yellow critical, green heal)
- Floats upward, fades over 1 second
- Pooled for efficiency

---

## Data Persistence

### Database System (IndexedDB)

**Structure**:
```
Database: "pampanaa"
Stores:
  - profiles: { key: name, data: { name, highestWave, unlockedAchievements } }
  - settings: { key: 'main', data: DEFAULT_SETTINGS }
  - progress: { key: 'main', data: DEFAULT_PROGRESS }
  - saves: { key: 'auto', data: { wave, score, gameState... } }
  - scores: { key: unique-id, data: { score, wave, timestamp } }
  - achievements: { key: achievement-id, data: { id, unlockedAt } }
```

### profiles.js - Profile Management

**Functions**:
- `signInProfile(name)`: Create or load profile
- `getActiveProfileName()`: Get current profile
- `signOutProfile()`: Clear active profile
- `touchProfile(updates)`: Update profile (high wave, etc.)

**Profile Data**:
- `name`: Player name (unique)
- `highestWaveReached`: Best wave in campaign
- `unlockedAchievements`: Array of achievement IDs
- `createdAt`: Profile creation timestamp
- `totalPlayTime`: Hours played

### settings.js - Settings Persistence

**DEFAULT_SETTINGS**:
```javascript
{
  difficultyLevel: 4,        // 1-10 scale
  volume: 0.5,               // 0-1
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.35,
  screenShake: true,
  reducedMotion: false,
  colorblind: false,
  shipDesign: 'interceptor', // interceptor, drifter, sentinel, vanguard
  uiTheme: 'nebula',         // nebula, dark, light
}
```

**Functions**:
- `getSettings()`: Load settings
- `updateSettings(patch)`: Merge and save settings

### progress.js - Wave Progress

**DEFAULT_PROGRESS**:
```javascript
{
  highestWaveReached: 1,
  unlockedWeapons: ['blaster'],
  selectedSkin: 'default',
  totalEnemiesDefeated: 0,
}
```

**Functions**:
- `getProgress()`: Load progress
- `updateProgress(patch)`: Merge and save progress
- `recordWaveCleared(wave)`: Mark wave as completed

### saves.js - Game Save Points

**Save Data**:
```javascript
{
  timestamp: Date.now(),
  wave: 7,
  score: 45000,
  mode: 'campaign',
  health: 67,
  amps: { damage: 2, fire: 1, pierce: 0, multishot: 1 },
  buffs: { shield: 3.2, rapidFire: 0 },
  weapon: 'laser',
  playTime: 320, // seconds
}
```

**Functions**:
- `saveGame(data)`: Create auto-save
- `loadLatestSave()`: Resume game
- `clearSaves()`: Wipe all saves on profile change

### achievements.js - Achievement Tracking

**Achievement Definition Structure**:
```javascript
{
  id: 'first_blood',
  name: 'First Blood',
  desc: 'Defeat 1 enemy',
  icon: '🩸',
  rarity: 'common',
}
```

**Functions**:
- `unlockAchievement(id)`: Mark as unlocked with timestamp
- `getUnlockedAchievements()`: Get array of unlocked IDs
- `isUnlocked(id)`: Check unlock status

### scores.js - Score Tracking

**Score Record**:
```javascript
{
  profile: 'PlayerName',
  score: 150000,
  wave: 18,
  mode: 'campaign',
  timestamp: Date.now(),
  playTime: 1200, // seconds
}
```

**Functions**:
- `addScore(data)`: Record game score
- `getTopScores(limit)`: Get leaderboard
- `getProfileScores(name)`: Get player's scores

---

## Input & Controls

### useKeyboard.js - Keyboard Input Hook

**Tracked Keys**:
- WASD or Arrow Keys: Movement
- Space or Ctrl: Fire weapon
- Q/E: Weapon switch
- P: Pause
- Escape: Menu/quit

**Implementation**:
- Event listeners on keydown/keyup
- State updated every frame in game loop

### useGamepad.js - Gamepad/Controller Input

**Mapped Controls**:
- Left stick: Movement
- Right trigger: Fire
- Buttons: Weapon switch, pause

**Features**:
- Analog stick sensitivity
- Vibration feedback on hits/kills
- Connected/disconnected detection

### useTouchControls.js - Mobile Touch Input

**Touch UI**:
- On-screen left joystick (movement)
- On-screen fire button (right side)
- Weapon switcher UI below

**Implementation**:
- Touch event listeners
- Virtual stick with deadzone
- Gesture detection for pause

### GameCanvas.jsx - Input Integration

**Flow**:
1. Collect input from keyboard, gamepad, touch
2. Normalize to `{ x, y, firing, aim }`
3. Pass to GameEngine each frame
4. Engine updates player movement/firing

---

## Audio System

### SoundManager.js - Audio Playback

**Sounds**:
- `shoot`: Weapon fire feedback
- `hit`: Projectile hit enemy
- `explosion`: Enemy death
- `bossExplosion`: Boss death (louder)
- `pickup`: Amplifier/buff pickup
- `unlock`: Achievement/weapon unlock
- `waveComplete`: Wave cleared
- `gameOver`: Player death
- `music`: Background loop (varies by wave)

**Features**:
- Volume control (0-1)
- Music/SFX toggle
- Mute on focus loss
- Intensity scaling (music tempo increases with waves)

**Methods**:
- `play(soundKey)`: Trigger sound effect
- `setVolume(v)`: Set master volume
- `setMusicEnabled(on)`: Toggle music
- `setIntensity(val)`: Scale music speed

### AudioContext.jsx - Audio State

**Purpose**: Global audio state, resume/pause logic

**State**:
- `enabled`: Audio enabled flag
- `musicVolume`: Music-specific volume
- `sfxVolume`: Sound effects volume

**Methods**:
- `resumeAudio()`: Unpause music on game start
- `pauseAudio()`: Pause music on game pause/quit

---

## Rendering System

### setupCanvas.js - Canvas Initialization

**Setup Process**:
1. Query canvas element
2. Get 2D context
3. Set DPI scaling for sharp rendering
4. Attach resize listener
5. Initialize world size

**Methods**:
- `setupCanvas()`: Initial setup
- `resizeCanvas()`: Update on window resize
- `getContext()`: Get rendering context

### spriteDrawer.js - Entity Rendering

**Functions**:
- `drawShip(ctx, player)`: Render player ship
- `drawEnemyShape(ctx, enemy)`: Render enemy based on shape type
- `drawProjectile(ctx, projectile)`: Render projectile
- `drawPickup(ctx, pickup)`: Render pickup icon

**Shapes**:
- Ships: Triangular vectors
- Enemies: Various mathematical shapes (pentagons, circles, spirals, etc.)
- Projectiles: Circles with color tint
- Pickups: Icons based on type

### parallaxRenderer.js - Background Rendering

**Layers**:
- Far stars (scroll slowly)
- Mid nebula (scroll medium)
- Near asteroids (scroll fast)
- Grid overlay (varies by theme)

**Themes** (from backgroundThemes.js):
- Waves 1-4: Nebula theme (purple/blue)
- Waves 6-9: Storm theme (orange/red)
- Waves 11+: Void theme (dark/white stars)

---

## Difficulty System

### Difficulty Levels (1-10)

**Level 4 (Standard)** - Baseline:
- Health multiplier: 1.0x
- Fire rate: 1.0x
- Amplifier drop: 1.0x
- Score division: 1.0x

**Level 1 (Sightseeing)**:
- Health: 0.3x
- Fire: 0.3x
- Amps: 1.5x (generous)
- Score: 1.0x (no penalty)

**Level 7 (Tense)** - Expert:
- Health: 1.5x
- Fire: 1.5x
- Amps: 0.7x (scarce)
- Score: 0.85x (penalty)

**Level 10 (Nightmare)**:
- Health: 3.0x
- Fire: 2.5x
- Amps: 0.3x (very scarce)
- Score: 0.5x (major penalty)

### Difficulty Scaling Formula

```javascript
difficultyMods(level) {
  const deviation = level - 4; // 0 at standard
  return {
    statMul: 1 + deviation * 0.2,
    fireMul: 1 + deviation * 0.15,
    ampDropRate: Math.max(0.2, 1 - deviation * 0.08),
    scoreDiv: Math.max(0.5, 1 - deviation * 0.04),
  };
}
```

---

## Achievement System

### Achievement Categories

**Wave Milestones**:
- Wave 5: Unlocked by reaching wave 5
- Wave 10: Unlocked by reaching wave 10 on hard difficulty
- Wave 20: Unlocked by reaching wave 20

**Combat Achievements**:
- First Blood: Defeat 1 enemy
- Century: Defeat 100 enemies in single run
- Untouchable: Complete wave without taking damage

**Weapon Mastery**:
- Laser Master: Defeat 50 enemies with laser
- Multishot Master: Activate multishot 20 times
- Flamethrower Arsonist: Apply burn to 100 enemies

**Rarity Tiers**:
- Common: Easy to unlock (~20% of players)
- Uncommon: Moderate difficulty (~10%)
- Rare: Challenging (~3%)
- Epic: Very difficult (<1%)

---

## Weapon Progression

### Unlock Path

| Wave | Weapon | Fire Rate | Damage | Special |
|------|--------|-----------|--------|---------|
| 0 | Blaster | 4/sec | 10 | Balanced |
| 2 | Shotgun | 2/sec | 8×6 | Wide spread |
| 4 | Laser | Continuous | 5/frame | Beam |
| 6 | Homing Missile | 1/sec | 25 | Seeks target |
| 8 | Flamethrower | Continuous | 3/frame | Burn effect |

### Weapon Selection Screen

**Switch Mechanics**:
- Q/E or D-Pad to cycle
- Mouse/touch select
- Weapon indicator in HUD
- Prevents switching during wave 1 setup

---

## Game Modes

### Campaign Mode
- Wave 1 starts
- Death returns to menu
- Can resume from save
- Score multiplier: 1.0x

### Endless Mode
- Wave 1 starts
- Waves continue indefinitely
- No level cap
- Score multiplier: 1.0x
- Leaderboard rank separate

### Mission/Level Select
- Choose specific wave (1-18+)
- Practice/replay cleared waves
- Personal best tracking per wave
- No progress counted toward career

---

## Performance Optimizations

### Object Pooling
- Projectiles: Pool of 400
- Particles: Pool of 400
- Damage Numbers: Pool of 80
- Pickups: Pool of 32
- Reuse reduces GC pressure

### Spatial Partitioning
- Quadtree for collision broad phase
- Reduced O(n²) to O(n log n)
- Updated every frame

### Rendering Optimization
- Batch rendering where possible
- Canvas clipping to viewport
- Off-screen entity culling
- Reduced motion option disables effects

### State Management
- HUD only updates on value change
- Engine only syncs changes to React
- Debounced rapid updates
- Ref-based status for quick access

---

## Configuration Files

### constants.js - Game Configuration

**World Settings**:
- `WORLD`: Viewport dimensions (responsive)
- `PLAYER`: Ship size, speed, max health
- `PICKUP_*`: Drift speed, magnet radius
- `FORMATIONS`: 12 choreography patterns
- `WAVES`: 18+ wave configurations

**Enemy Definitions**:
- Type: name, size, speed, health, armor
- Firing: fireInterval, fireRate, projectiles
- Scoring: points per defeat

### achievementDefs.js - Achievement Catalog

```javascript
{
  id: 'achievement_name',
  name: 'Display Name',
  desc: 'Unlock requirement description',
  icon: '🎮',
  rarity: 'common|uncommon|rare|epic',
}
```

15+ achievements total covering all major gameplay milestones.

### global.css - UI Styling

**Component Styles**:
- `.sg-root`: Main container
- `.sg-panel`: Modal/panel base
- `.sg-button`: Interactive button
- `.sg-hud`: Game HUD overlay
- `.sg-combo`: Combo counter display
- `.sg-amplifier-badge`: Amplifier indicator
- `.sg-banner`: Wave/mastery banner
- `.sg-health-bar`: Player health display

**Animations**:
- `@keyframes sg-rise`: Panel entrance
- `@keyframes sg-pop`: Pickup collection
- `@keyframes sg-pulse`: Buff blink
- `@keyframes sg-combo-pulse`: Combo pop
- `@keyframes sg-mastery-pulse`: Achievement badge

**Themes**:
- `[data-ui-theme="nebula"]`: Default purple/blue
- `[data-ui-theme="dark"]`: Dark mode
- `[data-ui-theme="light"]`: Light mode

---

## Deployment & Electron

### Production Build

**Build Process**:
```bash
npm run build  # Vite builds to /dist
```

**Vercel Deployment**:
- Auto-deploys on push to main
- Live at https://pampanaa.vercel.app
- Electron builds available for desktop

### Electron Configuration

**Main Process** (public/electron.js):
- Creates main window
- Handles IPC for file operations
- Manages native menus
- Auto-update (optional)

**Preload Script** (public/preload.js):
- Secure IPC bridge
- Window management API
- File dialog access

**Build Targets**:
- Windows: NSIS installer + portable
- macOS: DMG + zip
- Linux: AppImage + deb

---

## Summary

Pampanaa is a well-architected arcade shooter with:

1. **Clean Separation**: Game logic in Canvas/Engine, UI in React
2. **State Management**: Centralized via GameContext
3. **Performance**: Object pooling, quadtree collision, efficient rendering
4. **Persistence**: IndexedDB for profiles, saves, achievements
5. **Accessibility**: Colorblind mode, reduced motion, multiple input methods
6. **Scalability**: Easy to add weapons, enemies, achievements, waves

The app demonstrates professional game development patterns including entity pooling, formation choreography, amplifier stacking mechanics, and efficient spatial partitioning, all integrated seamlessly with a React frontend.
