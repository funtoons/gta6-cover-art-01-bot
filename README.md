# Vice Sunset Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/funtoons/gta6-cover-art-01-bot/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/funtoons/gta6-cover-art-01-bot/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your photos into GTA-style multi-panel poster cover art, exported as a PNG to share.

Vice Sunset Cover Studio is a static, fully offline web app. Upload 1–4 of your own photos (they are read locally and never leave your machine), or try one of the two built-in sample photos, pick a layout — Hero, Split 2, Trio 3, or Grid 4 — then crop and position each photo per panel (drag to pan, slider or mouse wheel to zoom, fit/fill, flip). Write your own bold title, subtitle, and footer line, choose a title colour and position, pick a colour grade (Sunset, Neon Night, Golden Hour, Mono Noir), and add sunburst, palm, and skyline decorations drawn in canvas. Everything previews live.

Export the finished cover as a PNG in 1080 × 1080, 1080 × 1350, or 1920 × 1080 with one click — the file downloads straight from your browser, no upload anywhere.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network requests — every file the app loads lives under `app/`.

## How it works

- `app/index.html` — the editor shell, controls, and preview canvas.
- `app/style.css` — dark editor styling with a sunset accent.
- `app/src/cover.js` — cover rendering: panels, colour grades, lettering, decorations.
- `app/src/editor.js` — photo state, panel assignment, crop / pan / zoom, layouts.
- `app/src/main.js` — boot, control wiring, drag-pan, and PNG export.
- `app/src/shots.js` — `?shot=` staging for screenshots (genuine app states).
- `app/samples/` — two free-to-use sample photos from the competition kit.
- `main.ts` — Node 22 entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.

Everything in the cover art is original — no Rockstar Games logo, artwork, character, or font. Lettering uses the generic system sans-serif stack, bold and heavy, with outlines, shadows, and gradients drawn in canvas.

Built by an AI agent for [make.fun](https://make.fun/bounty/gta6-cover-art-01)'s "Make GTA 6 Cover Art" bounty.
