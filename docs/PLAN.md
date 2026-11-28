# Escape the Website v4 — Storybook Rebuild Plan

## 1. Concept & Story

- **Title:** Escape the Website
- **Premise:** The player is pulled into an old house hidden inside an abandoned website. Someone else was trapped here before them. Each of the 5 rooms holds one page of that person's diary, and together the pages lead to the way out.
- **Visual Direction:** Full-screen, illustrated 2D storybook escape game — warm lantern-lit interiors, original SVG/Canvas scene art, tactile props, interactive inventory bar, and a collectible 5-page diary. No sci-fi terminal walls, no cluttered text panels, no multi-paragraph briefings.

### The Five Rooms

| # | Room | Goal | Diary Page |
|---|------|------|------------|
| 1 | **Bedroom** | Find the hidden brass key and unlock the bedroom door | Page 1 — How they woke up inside the house |
| 2 | **Library** | Find the clue and open the secret passage behind the bookcase | Page 2 — Clues about the house shifting around them |
| 3 | **Dark Room** | Use light to reveal the hidden lock code and open the padlock | Page 3 — What waits in the dark and the numbers left behind |
| 4 | **Workshop** | Craft/combine a tool to retrieve a fallen key out of reach | Page 4 — Building a way to reach what slipped away |
| 5 | **Final Door** | Use the 5 diary pages and final mechanism to unlock the way out | Page 5 — Stepping back out of the website |

---

## 2. Project Rules (Non-Negotiable)

1. **Stack:** Plain HTML, CSS, vanilla JavaScript, and GSAP (via CDN). No frameworks (no React/Vue/Bootstrap), no build step, no backend. Deploys directly as a static site.
2. **Modular Architecture:** Do **not** keep patching the old `js/main.js` (6,351 lines) or `css/style.css` (7,387 lines). Build clean, small modules: one shared engine, one UI/diary/inventory layer, and one self-contained file per room. Reuse `js/audio.js` and `js/analytics.js` where useful.
3. **Mobile-First & Zero Scroll:** Must work cleanly in portrait at `360x640` and `390x844`, and on desktop at `1366x768`. Zero horizontal overflow (`scrollWidth <= innerWidth`), and the main game stage never requires page scrolling (`100dvh` full-viewport layout).
4. **Simple Copy:** All in-game text must be simple English. At most **2 short lines** of story or instruction visible on screen at any time.
5. **100% Original Assets:** All scene art, props, characters, diary illustrations, and sounds must be original (custom SVG/Canvas art + Web Audio synthesis). Do not copy any existing game.
6. **Exact Tag & SEO Preservation:** Preserve verbatim in `index.html`, `robots.txt`, and `sitemap.xml`:
   - Google Analytics tag: `G-F5SSDGO5CT`
   - Both Google site verification meta tags:
     - `alS53WyJL5cutf1e5GspnrTOfVawwZ30KAM_B7IjAcA`
     - `IHLIzwNtl0F5s1oQw2sBVoUtSdA8Ous8xC7bWpfHl-s`
   - Microsoft Clarity snippet: `z78i0p5iw7`
   - Page `<title>`: `ESCAPE THE WEBSITE — An Interactive Web Escape Game`
   - Canonical URL: `https://escape-the-website.onrender.com/`
   - Open Graph (`og:*`) and Twitter (`twitter:*`) meta tags
   - `robots.txt` and `sitemap.xml`
7. **Step-by-Step Browser Verification:** After each build step:
   - Run the game in a real browser at `360x640`, `390x844`, and `1366x768`.
   - Capture and inspect screenshots at all three sizes.
   - Report what was tested and what is still broken or incomplete.
   - **Stop and wait for user approval** before moving to the next step.

---

## 3. Target File Structure

```text
escape-the-website/
├── index.html                  # Rebuilt clean semantic shell + preserved <head> SEO/GA/Clarity tags
├── robots.txt                  # Preserved unchanged
├── sitemap.xml                 # Preserved unchanged
├── docs/
│   └── PLAN.md                 # This architectural & build plan
├── assets/
│   ├── icons/                  # Preserved favicons (favicon.svg, favicon-32x32.png, apple-touch-icon.png)
│   ├── images/
│   │   └── og-preview.png      # Preserved social preview image
│   └── sounds/                 # Optional original audio assets (Web Audio synth remains primary)
├── css/
│   ├── base.css                # Reset, palette variables, typography, 100dvh full-screen stage layout
│   ├── hud.css                 # Top bar (room title, diary button, sound, reset), bottom inventory, caption box (<= 2 lines)
│   └── rooms.css               # Room-specific visual layers, storybook overlays, diary & ending screens
├── js/
│   ├── analytics.js            # REUSED from v3 (GA4 safe wrapper & deduplication)
│   ├── audio.js                # REUSED from v3 (+ optional original storybook SFX helpers)
│   ├── engine.js               # Core v4 state, room registry, inventory, diary pages, transitions, save/load, GSAP guards
│   ├── ui.js                   # HUD, inventory bar, 2-line story caption, diary reader modal, intro & ending screens
│   └── rooms/
│       ├── room1-bedroom.js    # Room 1: Bedroom (interactive scene, props, key, diary page 1, door)
│       ├── room2-library.js    # Room 2: Library (bookcase puzzle, secret passage, diary page 2)
│       ├── room3-darkroom.js   # Room 3: Dark Room (light reveal, lock code, padlock, diary page 3)
│       ├── room4-workshop.js   # Room 4: Workshop (tool crafting/retrieval, fallen key, diary page 4)
│       └── room5-door.js       # Room 5: Final Door (5 diary pages + final lock/escape sequence)
└── tests/
    ├── test-seo-urls.js        # KEPT & updated for v4 module path (SEO, canonical, OG, sitemap, robots)
    ├── test-v4-engine.js       # NEW: v4 state, inventory, diary pages, 5-room progression, save/reset
    ├── test-v4-gsap-guards.js  # NEW: GSAP missing/partial fallback tests so game never soft-locks
    └── test-v4-rooms.js        # NEW: Unit tests for each of the 5 room puzzle modules
```

---

## 4. Old Files: Reused vs. Removed

### Reused
- `js/analytics.js` — Reused as-is for safe GA4 event tracking (`window.trackEvent`, `window.analyticsManager`).
- `js/audio.js` — Reused for `AudioManager`, Web Audio API context lifecycle, mute persistence, and core chimes/door sounds (extended cleanly if new storybook SFX are needed).
- `robots.txt` & `sitemap.xml` — Reused unchanged.
- `assets/icons/*` (`favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`) & `assets/images/og-preview.png` — Reused unchanged.
- `index.html` `<head>` analytics/verification/SEO block — Preserved verbatim inside the new clean `index.html`.

### Replaced / Removed
- `js/main.js` (6,351 lines) — **Removed** once v4 `engine.js`, `ui.js`, and `js/rooms/*` are wired up.
- `js/game.js` (818 lines) — **Removed** (replaced by `js/engine.js` with clean v4 save key `escape_the_website_save_v4`).
- `js/puzzles.js` (965 lines) — **Removed** (replaced by per-room modules under `js/rooms/`).
- `css/style.css` (7,387 lines) — **Removed** (replaced by `css/base.css`, `css/hud.css`, `css/rooms.css`).
- `css/animations.css` (172 lines) — **Removed** (replaced by GSAP animations and lightweight CSS transitions in `css/rooms.css`).
- Bootstrap 5 CDN (`bootstrap.min.css` and `bootstrap.bundle.min.js` in `index.html`) — **Removed** to honor the framework-free static stack and avoid layout bloat.

---

## 5. Old Tests: Obsolete vs. Kept

| Test File | Status | Reason |
|-----------|--------|--------|
| `tests/test-multiroom-engine.js` | **Obsolete (Remove)** | Tests v3 `GameManager`/`PuzzleManager` (`entry`, `orbatrium`, `vault`, `tunnels`, `lobby`, `core`, `sector02`), v2→v3 save migration, and v3 DOM/function names in `js/main.js`. Replaced by `tests/test-v4-engine.js` and `tests/test-v4-rooms.js`. |
| `tests/test-arcade-countdown.js` | **Obsolete (Remove)** | Extracts and tests v3 Pixel Maze / Defense Arcade functions from `js/main.js` and `id="maze-dpad"` in `index.html`. No arcade/maze exists in v4. |
| `tests/test-gsap-guards.js` | **Obsolete (Replace)** | Extracts v3 functions (`triggerSecretReveal`, `triggerFinalEscapeSequence`, etc.) and v3 DOM IDs from `js/main.js`. Replaced by `tests/test-v4-gsap-guards.js` testing v4's `engine.js`/`ui.js` GSAP fallbacks. |
| `tests/test-step-e.js` | **Obsolete (Replace)** | Hardcoded to check `js/main.js` for v3 share text (`KEYS: ${keysCount}/3`) and 1080×1350 canvas. Analytics checks (`share_clicked`, `share_completed` via `js/analytics.js`) will move to a v4 share/analytics test if sharing is included in the ending screen. |
| `tests/test-seo-urls.js` | **Keep (Minor Update)** | All production URL, canonical, OG/Twitter, JSON-LD, `robots.txt`, `sitemap.xml`, and asset checks remain valid and required. Only its `js/main.js` string check will be updated to check the v4 module containing the production share/canonical URL (or removed if share lives in `ui.js`). |

---

## 6. Build Order

Each step ends with browser verification + screenshots at **`360x640`**, **`390x844`**, and **`1366x768`**, a summary of what was tested and what remains unfinished, and an explicit **STOP for approval**:

1. **Step 1 — Clean Shell, Intro & Core Engine (`index.html`, `css/base.css`, `css/hud.css`, `js/engine.js`, `js/ui.js`)**
   - Preserve exact `<head>` tags (GA, verifications, Clarity, title, canonical, OG/Twitter, JSON-LD).
   - Remove v3 HTML/CSS/JS monoliths or isolate v4 shell cleanly; build full-viewport (`100dvh`, zero-scroll) layout, top HUD, 2-line story caption bar, bottom inventory bar, diary drawer, and the original storybook intro ("pulled into the house inside the website").
   - Verify intro + HUD + empty stage + diary UI at `360x640`, `390x844`, `1366x768`.
2. **Step 2 — Room 1: Bedroom (`js/rooms/room1-bedroom.js` + `css/rooms.css`)**
   - Original illustrated Bedroom scene: interactive furniture/props, find Diary Page 1 and the brass key, unlock the door to Room 2.
   - Verify full Room 1 playthrough and layout at all 3 sizes.
3. **Step 3 — Room 2: Library (`js/rooms/room2-library.js`)**
   - Original illustrated Library scene: inspect shelves/notes, find Diary Page 2, solve the book/clue puzzle to slide open the secret passage to Room 3.
   - Verify Room 2 playthrough and transitions at all 3 sizes.
4. **Step 4 — Room 3: Dark Room (`js/rooms/room3-darkroom.js`)**
   - Original illustrated Dark Room scene: use a light source (lantern/beam following pointer/touch) to search the room, reveal Diary Page 3 and the hidden lock code, unlock the padlock to Room 4.
   - Verify Room 3 touch + mouse + layout at all 3 sizes.
5. **Step 5 — Room 4: Workshop (`js/rooms/room4-workshop.js`)**
   - Original illustrated Workshop scene: spot the fallen key out of reach (e.g., behind/under a grate), find/combine workshop items to retrieve it, collect Diary Page 4, and unlock the door to Room 5.
   - Verify Room 4 playthrough at all 3 sizes.
6. **Step 6 — Room 5: Final Door & Escape Ending (`js/rooms/room5-door.js`)**
   - Original illustrated Final Door scene: review/place clues from the 5 diary pages (including Diary Page 5), unlock the final door, play the original GSAP escape sequence, and show the clean ending screen (replay, audio, analytics).
   - Verify end-to-end Run (Rooms 1 → 5 → Ending) at all 3 sizes.
7. **Step 7 — Cleanup, Old File Removal & Automated Tests**
   - Delete obsolete v3 files (`js/main.js`, `js/game.js`, `js/puzzles.js`, `css/style.css`, `css/animations.css`) and obsolete v3 tests (`test-multiroom-engine.js`, `test-arcade-countdown.js`, `test-gsap-guards.js`, `test-step-e.js`).
   - Update `tests/test-seo-urls.js` and add `tests/test-v4-engine.js`, `tests/test-v4-gsap-guards.js`, `tests/test-v4-rooms.js`; update `README.md`.
   - Run all Node tests + final full-run browser verification and screenshots at `360x640`, `390x844`, `1366x768`.
