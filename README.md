# Juicy Climber — POINPY-style HTML5 bounce-climber

A playable prototype of a vertical slingshot bounce-climber (inspired by POINPY),
built with **Phaser 3 + TypeScript + Vite**, with an **AdMob-mediation** ad layer
(AdMob + Meta/FAN + Unity + ironSource) ready for Google Play.

> All art is generated procedurally in code (placeholders) and all SFX are
> synthesized — the prototype needs **zero asset files**. Swap in real art/audio
> later without touching gameplay code.

## Run it
```bash
npm install
npm run dev      # open http://localhost:5173
```

## Build
```bash
npm run build    # -> dist/ (type-checked)
npm run preview
```

## How to play
- **Press & drag** anywhere and **release** to slingshot the little green jumper
  (launch fires opposite the drag, like a catapult). A dashed arc previews the path.
- **Bounce off the side walls** to climb higher.
- **Collect the fruit** shown in the top recipe bubble to fill the **Gourmet Level**
  bar and level up.
- Don't let the **rising blue beast** at the bottom catch you, and dodge enemies.
  You have hearts (top-left). Out of hearts = game over → **revive by watching an ad**.
- Bottom-left 🎁 on the home screen opens the **gacha collection**.

## Project map
| Area | Path |
|------|------|
| Entry / Phaser config | `src/main.ts` |
| Tunables | `src/config/GameConfig.ts`, `src/config/Balance.ts` |
| Scenes | `src/scenes/*` |
| Game objects | `src/objects/*` |
| Systems (input, spawn, recipe, save, audio) | `src/systems/*` |
| Ads (mock + AdMob mediation) | `src/systems/ads/*` |
| Procedural art | `src/gfx/Textures.ts` |

## Docs & reference
| File | Description |
|------|-------------|
| [docs/POINPY_CLONE_BUILD_PLAN.md](./docs/POINPY_CLONE_BUILD_PLAN.md) | Full step-by-step build plan |
| [docs/reference-screenshots/](./docs/reference-screenshots/) | Original POINPY reference images |
| [ADS_SETUP.md](./ADS_SETUP.md) | AdMob + mediation setup for Google Play |

> **Note:** `node_modules/`, `dist/`, and Android build folders are **not** on GitHub
> (they are regenerated). After cloning run `npm install` then `npm run build`.

## Ads
- **Web** → mock ad overlay (for testing, no account needed).
- **Android** → AdMob mediation. See **[ADS_SETUP.md](./ADS_SETUP.md)**.

## Package for Google Play (later)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor-community/admob
npm run build && npx cap add android && npx cap copy && npx cap open android
```
Then follow `ADS_SETUP.md` for AdMob + mediation adapters.
