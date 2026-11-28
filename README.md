# ESCAPE THE WEBSITE — Storybook Edition (v4)

An illustrated, full-screen 2D storybook escape game. You opened the wrong page and were pulled into a house hidden inside an old website. Explore five rooms, collect four diary pages left by the person trapped before you, and unlock the Final Door back out.

## Live Site

The official production URL (canonical) is:

**https://escape-the-website.onrender.com/**

`index.html`, `sitemap.xml`, and `robots.txt` reference this URL.

## Stack

- **HTML5 & Semantic Shell** (`index.html`, `100dvh` full-screen app layout, safe-area inset support)
- **Vanilla CSS** (`css/base.css`, `css/hud.css`, `css/rooms.css`)
- **Vanilla JavaScript** (`js/engine.js`, `js/ui.js`, per-room modules in `js/rooms/`, Web Audio synthesis in `js/audio.js`, GA4 + Clarity wrapper in `js/analytics.js`)
- **GSAP** via CDN with reduced-motion and missing-GSAP fallbacks
- **Zero frameworks, zero build step, zero backend** — deploys directly as a static site

## The Five Rooms

| Room | Title | Mission |
|------|-------|---------|
| Room 1 | The Bedroom | Find the key to the door |
| Room 2 | The Library | Open the secret passage |
| Room 3 | The Dark Room | Find the lock code |
| Room 4 | The Workshop | Get the key out of the drain |
| Room 5 | The Final Door | Open the last door |

## Features

- **Mobile-First Design:** Sized for `360x640`, `390x844`, and desktop `1366x768` with no page scroll during play and 48 px+ touch targets
- **Tactile Interactions:** Tap to inspect, tap or drag inventory items onto targets, swipe/tap overlays, combine workshop items
- **3-Level Firefly Hints:** Gentle clue -> clearer clue -> glowing target spot
- **Star Rating & Auto-Save:** 1–3 stars per room based on hints and mistakes; resumes mid-run via `localStorage` (`escape_the_website_save_v4`)
- **Privacy-Safe Analytics:** Tracks `game_start`, `room_start`, `room_complete`, `wrong_choice`, `hint_used`, `game_completed`, `share_clicked`, and `replay_clicked` in GA4 and Microsoft Clarity (no personal data)

## Project Structure

```text
escape-the-website/
├── index.html                   # Cover, About/How-to-play, game stage, modals & SEO metadata
├── robots.txt                   # Search engine crawl directives
├── sitemap.xml                  # Canonical sitemap
├── assets/
│   ├── icons/                   # App & browser favicons
│   └── images/                  # Storybook cover, OG preview (1200x630), room1–room5 SVGs & WebP
├── css/
│   ├── base.css                 # Palette, fonts (Fraunces + Nunito), reset
│   ├── hud.css                  # Cover, top/bottom HUD bars, modals, page-turn transitions
│   └── rooms.css                # Room layers, lighting mask, animations
├── js/
│   ├── analytics.js             # Safe GA4 + Microsoft Clarity event wrapper
│   ├── audio.js                 # Original Web Audio synthesizer & mute controls
│   ├── engine.js                # State, inventory, hints, stars, save/load, GSAP guard
│   ├── ui.js                    # DOM rendering, pointer/drag/swipe, transitions, modals
│   └── rooms/
│       ├── room1-bedroom.js     # Room 1: Bedroom
│       ├── room2-library.js     # Room 2: Library
│       ├── room3-darkroom.js    # Room 3: Dark Room
│       ├── room4-workshop.js    # Room 4: Workshop
│       └── room5-door.js        # Room 5: Final Door & Finale
└── tests/
    ├── test-v4-engine.js        # Engine, stars, hints, save/load & analytics unit tests
    ├── test-v4-rooms.js         # All 5 rooms & end-to-end playthrough unit tests
    └── test-seo-urls.js         # SEO, canonical, OG/Twitter, JSON-LD, sitemap & robots audit
```

## How to Run Locally

```bash
# Python 3
python -m http.server 8000

# Or Node
npx serve .
```

Then open `http://localhost:8000`.

## Running Tests

Plain Node.js (no npm dependencies required):

```bash
node tests/test-v4-engine.js
node tests/test-v4-rooms.js
node tests/test-seo-urls.js
```
