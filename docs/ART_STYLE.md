# Escape the Website v4 — Art Style Guide

## 1. Visual Tone
- **Look:** Warm, hand-drawn 2D storybook illustration. Think cozy picture-book interiors with soft gouache/ink warmth—never sterile vector, never neon sci-fi, never photorealistic.
- **Mood:** Mysterious but friendly and inviting. Dim evening shadows balanced by warm amber lantern light, soft moonlight through windows, and rich wood tones.
- **Line & Shape Language:** Rounded corners, gentle organic silhouettes, subtle hand-inked dark umber outlines (`#2a1e17`), and soft layered shading rather than harsh black shadows.
- **No In-Image UI:** Never bake text, numbers, labels, speech bubbles, or UI buttons into background images or object art.

---

## 2. Fixed Colour Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Deep Umber Ink** | `#2a1e17` | Outlines, deep crevices, dark silhouettes |
| **Shadow Plum-Brown** | `#3b2b23` | Recessed corners, wall shadows, frame borders |
| **Warm Wall Dusk** | `#523f35` | Main bedroom/interior walls in soft shadow |
| **Cedar Wood** | `#7a5239` | Doors, wardrobe bodies, beams, furniture |
| **Honey Oak** | `#a5744e` | Lit wood highlights, floorboards, shelves |
| **Moonlight Mist** | `#9bbbd0` | Window glass, cool night-sky rim light |
| **Warm Cream Parchment** | `#f5ebd6` | Diary pages, modal cards, clock faces, light accents |
| **Lantern Amber** | `#f4b942` | Torch glow, brass keys, door handles, firefly light |
| **Terracotta Rose** | `#b85a4a` | Rugs, curtains, cozy fabrics, books |
| **Sage Moss** | `#6f9e78` | Cloth accents, botanicals, subtle cool-warm contrast |
| **Ginger Cat** | `#d9823b` | Original cartoon cat fur (with `#f5ebd6` belly/paws) |

---

## 3. Lighting & Perspective
- **Perspective:** Flat 2D storybook stage (front-facing wall occupying ~68% height, gently angled wooden floor occupying ~32% height). All interactive props sit cleanly on the same front-facing plane so movable layers align naturally.
- **Lighting:** Soft warm key light from upper-left/lanterns (`#f4b942` at low opacity) and cool moonlight (`#9bbbd0`) near windows. Contact shadows sit softly underneath furniture (`rgba(42, 30, 23, 0.35)`).

---

## 4. Typography (2 Fonts Only)
1. **Storybook Heading Font:** `Fraunces` (serif, warm editorial/storybook character) — used for titles, room headings, and diary page titles.
2. **Body & UI Font:** `Nunito` (clean, rounded, highly legible sans-serif) — used for 1–2 line captions, missions, inventory labels, diary body text, and buttons.

---

## 5. Asset Pipeline & Budget
- **Backgrounds:** Generated 2D storybook illustration converted to **WebP** (`720x800` or `900x1000`, `9:10` aspect ratio), stripped of interactive props that have separate states.
- **Interactive / Movable Objects:** Hand-crafted **SVG** with transparent backgrounds (no white boxes, no fake checkerboards) for razor-sharp scaling and tiny file sizes.
- **Size Target:** Under **600 KB total** per room (background WebP + all SVG layers).
