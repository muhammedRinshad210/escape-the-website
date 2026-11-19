# ESCAPE THE WEBSITE — v3 (FIVE SUB-LEVELS)

An interactive, immersive web-based escape adventure. You are locked inside the
website — and the real exit is **five sub-levels down**. Every room hides a
different kind of puzzle, its own collectibles, and its own way of opening.

## Live Site

The official production URL (canonical) is the Render deployment:

**https://escape-the-website.onrender.com/**

`index.html`, `sitemap.xml` and `robots.txt` reference this URL. Any legacy
mirror deployment is non-canonical and is not part of the production SEO
configuration.

## Technologies Used

- **HTML5** (Semantic structure)
- **CSS3 / Vanilla CSS** (Custom theme variables and layout)
- **Vanilla JavaScript** (Modular ES6 architecture, no heavy frameworks)
- **Bootstrap 5** (Layout and base utility classes via CDN)
- **GSAP (GreenSock Animation Platform)** (Cinematic animations via CDN)
- **Google Fonts** (Orbitron, Inter, JetBrains Mono)

## The Five Sub-Levels (v3)

| Room | Name | Find this | Door opens by |
|------|------|-----------|---------------|
| ROOM 01 | THE LOBBY | 3 cipher keys (resonator sequence, mainframe terminal, defense arcade) | Blast-door lock-release cinematic — and the twist: it leads **deeper** |
| ROOM 02 | THE ORB ATRIUM | 3 drifting plasma orbs (tap to catch) | Gravity lift — orbs socket in, iris hatch opens, lift descends |
| ROOM 03 | THE SIGNAL VAULT | 3 relay memory songs → **GOLD DATACHIP** | Cipher keypad (7-3-9, digits revealed per round) → vault wheel spins open |
| ROOM 04 | THE COOLING TUNNELS | 3 coolant fuses (rotate valve tiles) → **PRESSURE BOOSTER** | Hydraulic BOOST pump — hold to pump pressure to 100% while it leaks, gates blast with steam |
| ROOM 05 | THE CORE | 3 hidden core fragments | Core ignition — rapid-tap CHANNEL ENERGY to 100% → overload launch cinematic → escape |

Plus the hidden **SECTOR 02 — Observation Chamber** secret (inverted resonator
sequence, or `TRACE`/`SECTOR 02` in the mainframe terminal) — unchanged.

## Replayability & Progression

- **S–C RANK** on the victory screen (S < 8:00, A < 14:00, B < 22:00, C beyond)
- **5 hidden GOLD TOKENS** (one per room, +100 pts each, shimmering spots)
- **Per-room best times** + total best time + best rank persist in `localStorage`
- Score economy: keys 300, orbs 150, signals 250 + chip 200, fuses 200 + booster 200, fragments 200, gold 100, launch 500
- Personal best line + `★ NEW RECORD` badge on the results screen
- **Session restore** — reload mid-run and you resume in the exact sub-level you reached

## Gameplay & Onboarding

- **Mission Briefing (How To Play)** — cinematic overlay on first entry,
  explains inspect / find-3-items / doors / gold in four steps; reopen via `?` or ESC
- **Room intro banners** — every sub-level announces itself with a one-line "how this room works" hint
- **Dynamic objectives panel** (☰ OBJECTIVES) — re-renders per room with
  PENDING / SECURED / READY / LOCKED / DISCOVERED states
- **HUD collectible tracker** — relabels per room (KEYS → ORBS → SIGNALS → FUSES → FRAGMENTS)
- **Idle nudge** — room-aware hint toast after ~75 s without progress
- **Locked-door guidance** — tapping a locked door always explains exactly what is missing
- **Layered ESC handling** — closes only the top-most layer
- **Mobile ergonomics** — one-line HUD on phones, ≥44 px tap targets,
  scrollable room stages, touch wording (`TAP` vs `CLICK`), larger arcade targets,
  `env(safe-area-inset-bottom)` aware toasts
- **Audio toggle**, restart-with-confirm, key claim toasts — all preserved from v2

## Project Structure

```text
escape-the-website/
├── index.html          # Main HTML entry point (5 room stages + 8 overlays)
├── css/
│   ├── style.css       # Core styles + v3 multi-room styles
│   └── animations.css  # Keyframe animations and transitions
├── js/
│   ├── main.js         # Controller: HUD, onboarding, room engine, cinematics
│   ├── game.js         # v2 state: rooms, progress, gold, ranks, storage
│   ├── puzzles.js      # Puzzle engines: keys, orbs, relay memory, valves, core
│   ├── audio.js        # Sound effects controller (WebAudio synth)
│   └── analytics.js    # GA4 tracking helpers
├── tests/              # Plain Node.js regression suites (see Tests)
├── assets/
│   ├── images/         # Game visual assets
│   ├── icons/          # UI and puzzle icons
│   └── sounds/         # Audio clips & ambient sound tracks
└── README.md           # This file
```

## How to Run

100% static web application — no build steps, backend or database required.

### Method 1: Local HTTP Server (Recommended)

```bash
# Using Python 3:
python -m http.server 8000

# Or using npx serve:
npx serve .
```

Then open http://localhost:8000 in any modern browser.

### Method 2: Direct File Opening

Double-click `index.html` or open it directly inside your browser.

## Tests

Plain Node.js, no dependencies. Run from the repository root:

```bash
node tests/test-multiroom-engine.js  # v3 five-room engine, ranks, storage migration
node tests/test-gsap-guards.js       # GSAP guards and degraded animation paths
node tests/test-arcade-countdown.js  # Arcade countdown lifecycle (close / retry / reopen)
node tests/test-step-e.js            # Share text and analytics contract
node tests/test-seo-urls.js          # Canonical / Open Graph / sitemap production URL audit
```

Each suite prints `TOTAL TESTS: n | PASSED: n | FAILED: n` and exits non-zero on
failure. The `tests/` directory is not referenced by the game; only `index.html`,
`css/`, `js/` and `assets/` are needed to run it.

## Storage Schema

`escape_the_website_save_v2` (v1 saves are discarded safely):

```json
{
  "version": 2,
  "keysCollected": [], "orbsCollected": [], "signalRoundsWon": 0,
  "goldChip": false, "fusesLit": [], "boosterClaimed": false,
  "fragmentsCollected": [], "goldTokens": [],
  "currentRoom": "lobby", "currentRoomIndex": 0,
  "score": 0, "gameStarted": false, "gameCompleted": false,
  "arcadeBestScore": 0, "secretDiscovered": false,
  "roomBestTimes": {}, "bestRank": null, "bestGoldCount": 0
}
```

Meta-progression (arcade best, secret discovery, room best times, best rank,
best gold count) survives restarts and Play Again.
