# POINPY-Style 2D Game — Complete Build Plan (HTML5 + Ads SDK)

> A step-by-step, production-grade blueprint to build a polished vertical bounce-climber like **POINPY** (by Ojiro Fumoto / Devolver Digital) using **HTML5 + JavaScript + Canvas/WebGL**, with integrated **ads SDK**, juicy animation, sound, and professional UI/UX.
>
> Source references analyzed:
> - Google Play: https://play.google.com/store/apps/details?id=com.devolverdigital.poinpy
> - App Store: https://apps.apple.com/us/app/poinpy/id1529163722
> - 11 in-game screenshots analyzed from the project root.

---

## 0. Deep Analysis of POINPY (from screenshots + store data)

### 0.1 What the game is
A **vertical bounce-climber**. You control a small green creature that **slingshot-jumps** upward while a **giant blue beast** rises from the bottom of the screen chasing you. You bounce off walls, collect fruit to fill a "Gourmet Level" meter, dodge enemies, and keep climbing higher through progressively themed biomes.

### 0.2 Core mechanic (the heart of the game)
- **Drag-and-release slingshot control** (one-handed). Touch/hold anywhere, drag in the opposite direction to aim, release to launch the character.
- A **dashed trajectory arc** previews the jump path (visible in screenshots 4, 5, 7, 10 as white dashed lines/dots).
- The character **bounces off the left/right walls** — you chain wall-bounces to gain height and reach fruit.
- **Gravity** constantly pulls the character down toward the beast.
- If the beast (bottom) **catches** the character, you lose a life/heart.

### 0.3 Objectives & progression
- **Gourmet Level meter** (bottom progress bar): fill it by collecting the fruit **recipe** shown in the beast's **thought bubble** at the top.
  - The thought bubble shows a required fruit combo + a number (e.g., "6", "EXTRA BONUS 4/1"). Feed the beast the shown fruits to level up.
- **Gourmet Level** counter increases (seen: 1, 3, 6, 9, 12, 14). Higher = harder.
- **"Discover new area at Gourmet Level X (progress/total)"** — biome unlocks tied to level milestones.
- **RANK** system on the home screen (RANK 2) with an XP-style progress bar.
- **Coins** (yellow smiley coins, top-right counter: 41, 136, 303, 585, 829) — soft currency.

### 0.4 Biomes / themed areas (each has distinct palette + hazards)
1. **Home / Title screen** — grey rocky quarry, sleeping beast, POINPY logo (screens 1, 15).
2. **Grassland / Gourmet** — bright green, bushes, vines/ropes, apples & blueberries (screens 2, 3, 10).
3. **Sky / Ice** — blue, clouds, ice platforms, watermelon/grapes/cherries (screens 4, 7).
4. **Cave / Volcanic** — pink/magenta + purple rock, hazard-striped platforms, gems, lava creatures (screens 5, 14).

### 0.5 Collectibles (fruit)
Apple (red), Blueberry (blue cluster), Grapes (green/blue), Lemon, Watermelon (striped), Cherries, Banana. Each fruit = juice/points; correct fruit fills the recipe.

### 0.6 Enemies / hazards
- Ghost-type baddies (red/green/blue "pac" shapes), floating creatures, spiked box enemies (cyclops box in screens 4, 7), snail creatures, rolling rock piles, spikes, hazard-striped platform edges, lava.
- **Angry-face icon** (top-right in cave screens) likely a rage/boss indicator.

### 0.7 Power-ups / abilities (gacha collection)
- **Octobub** — sucks in nearby fruit.
- **Snail clock** — stops/slows time while aiming.
- Screens 6 & 12 show a **collection/gacha grid** (unlockable creatures & abilities) and a **capsule/gachapon machine** (bottom-left of home) with a small mascot inside.
- Many collectible ability tiles (stars, hearts, ghosts, clocks, gems, mushrooms, etc.).

### 0.8 Lives / fail states
- **Hearts** top-left (1–2 shown) = lives. Lose one when hit or caught. Zero = game over.
- **"READY"** intro banner, **"EXTRA BONUS"** combo banner.

### 0.9 Extra modes (from store text)
- Main mode (climb endlessly higher through areas).
- **Puzzle mode** — unlocked via a "not-so-well-hidden area."
- **Endless mode** — unlocked after completing the main game.

### 0.10 Art & UX signature
- Thick black outlines, flat bold colors, bubbly rounded shapes, expressive faces, squash-&-stretch animation, particle sparkles, screen-shake, chunky readable HUD, big playful title font. **Portrait orientation, one-handed.**

---

## 1. Product & Scope Definition

### 1.1 Target
- **Platform:** HTML5 (mobile web + wrapped for Android/iOS via Capacitor/Cordova; also playable on web-game portals).
- **Orientation:** Portrait, one-handed.
- **Monetization:** Rewarded video ads (continue/revive, double coins), interstitials (between runs), optional banner on menus. Optional IAP tip jar (like the original).

### 1.2 MVP feature list (build in this order)
1. Slingshot launch + gravity + wall bounce.
2. Rising beast "death line" + camera follow.
3. Fruit collection + Gourmet meter + recipe bubble.
4. Hearts/lives + game over.
5. One biome + procedural platform/fruit spawning.
6. HUD (hearts, coins, level, pause).
7. Sound + juice (particles, screen shake, squash/stretch).
8. Ads SDK (rewarded revive + interstitial).
9. Home screen, RANK, coins persistence.
10. Then: more biomes, enemies, power-ups, gacha, puzzle/endless modes.

---

## 2. Tech Stack Choice

**Recommended: Phaser 3** (mature 2D HTML5 game framework — Arcade Physics, tweens, particles, audio, scenes, spritesheet/atlas support, WebGL + Canvas fallback).

Alternatives: PixiJS + custom physics (more control, more work), or plain Canvas 2D (smallest, but you rebuild everything).

```
Framework:      Phaser 3 (WebGL/Canvas)
Language:       TypeScript
Bundler:        Vite
Physics:        Phaser Arcade Physics (custom slingshot + manual wall bounce)
Audio:          Phaser Sound (WebAudio) + Howler.js optional
State/Save:     localStorage (+ optional cloud later)
Ads:            Web: game-portal SDK (e.g., GameDistribution/CrazyGames/Poki) 
                Wrapped app: AdMob via Capacitor plugin
Packaging:      Capacitor (Android/iOS), or ship as pure web
Art:            Aseprite / Figma / Illustrator → texture atlas (TexturePacker/free-tex-packer)
Audio tools:    sfxr/jsfxr, Audacity, royalty-free music
```

---

## 3. Project Setup (Step by Step)

```bash
# 1. Create project
npm create vite@latest poinpy-clone -- --template vanilla-ts
cd poinpy-clone

# 2. Install Phaser
npm install phaser

# 3. (Optional) Howler for advanced audio
npm install howler

# 4. Dev server
npm run dev
```

### 3.1 Folder structure
```
poinpy-clone/
├─ index.html
├─ vite.config.ts
├─ src/
│  ├─ main.ts                # Phaser game config + boot
│  ├─ config/
│  │  ├─ GameConfig.ts       # tunables: gravity, bounce, speeds
│  │  └─ Balance.ts          # level curves, recipes, spawn rates
│  ├─ scenes/
│  │  ├─ BootScene.ts
│  │  ├─ PreloadScene.ts
│  │  ├─ HomeScene.ts        # title, RANK, gachapon
│  │  ├─ GameScene.ts        # main gameplay
│  │  ├─ HUDScene.ts         # overlay UI
│  │  ├─ GameOverScene.ts    # revive-with-ad
│  │  └─ CollectionScene.ts  # gacha grid
│  ├─ objects/
│  │  ├─ Player.ts           # the green jumper
│  │  ├─ Beast.ts            # rising blue beast / death line
│  │  ├─ Fruit.ts
│  │  ├─ Enemy.ts
│  │  ├─ Platform.ts
│  │  ├─ TrajectoryLine.ts   # dashed aim preview
│  │  └─ PowerUp.ts
│  ├─ systems/
│  │  ├─ InputController.ts   # drag/aim/release
│  │  ├─ Spawner.ts           # procedural generation
│  │  ├─ RecipeSystem.ts      # gourmet recipes/meter
│  │  ├─ SaveSystem.ts        # localStorage
│  │  ├─ AudioManager.ts
│  │  └─ AdsManager.ts        # ads SDK abstraction
│  ├─ ui/
│  │  ├─ Hearts.ts
│  │  ├─ ProgressBar.ts
│  │  └─ Button.ts
│  └─ types/index.ts
├─ public/
│  └─ assets/
│     ├─ images/  (atlases, backgrounds, logo)
│     ├─ audio/   (sfx, music)
│     └─ fonts/
```

### 3.2 Base game config (`src/main.ts`)
```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { HomeScene } from './scenes/HomeScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 854,               // portrait ~9:16
  backgroundColor: '#cfd3d6',
  scale: {
    mode: Phaser.Scale.FIT,  // fit to device, keep aspect
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 900 }, debug: false },
  },
  scene: [BootScene, PreloadScene, HomeScene, GameScene, HUDScene, GameOverScene],
};

new Phaser.Game(config);
```

---

## 4. Core Gameplay — Step by Step

### Step 4.1 — Slingshot input (the signature control)
Goal: hold → drag opposite the launch direction → release to fire; show dashed trajectory.

`src/systems/InputController.ts`:
```typescript
export class InputController {
  private start?: Phaser.Math.Vector2;
  private aiming = false;
  private maxPull = 180;

  constructor(private scene: Phaser.Scene, private onLaunch: (vx: number, vy: number) => void) {
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.start = new Phaser.Math.Vector2(p.x, p.y);
      this.aiming = true;
    });
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.aiming && this.start) this.updateAim(p);
    });
    scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.aiming && this.start) this.release(p);
      this.aiming = false;
    });
  }

  private getVector(p: Phaser.Input.Pointer) {
    // Launch direction = opposite of drag (pull back like a slingshot)
    const dx = this.start!.x - p.x;
    const dy = this.start!.y - p.y;
    const v = new Phaser.Math.Vector2(dx, dy);
    if (v.length() > this.maxPull) v.setLength(this.maxPull);
    return v;
  }

  private updateAim(p: Phaser.Input.Pointer) {
    const v = this.getVector(p);
    this.scene.events.emit('aim', v);   // TrajectoryLine listens
  }

  private release(p: Phaser.Input.Pointer) {
    const v = this.getVector(p);
    const power = 6; // tune
    this.onLaunch(v.x * power, v.y * power);
    this.scene.events.emit('aimEnd');
  }
}
```

### Step 4.2 — Dashed trajectory preview
Simulate the arc with the same gravity and draw dashed dots (matches the white dashed line in screenshots).
```typescript
// Given launch velocity v0 and gravity g, sample positions:
// x(t) = x0 + v0x * t
// y(t) = y0 + v0y * t + 0.5 * g * t^2
// Draw ~15 dots at t = 0, dt, 2dt, ... Stop early on wall/platform hit.
```
`TrajectoryLine.ts` listens to `'aim'` / `'aimEnd'` events and renders dots via a `Graphics` object. Add a **snail-clock power-up** that pauses game time while aiming (as in POINPY).

### Step 4.3 — Player physics + wall bounce
- Player is an Arcade body with gravity ON.
- On launch, set velocity from InputController.
- **Wall bounce:** set `body.setBounce(0.9, 0)` for horizontal, or manually flip `velocity.x` when hitting left/right world bounds. Add squash/stretch tween on each bounce.
```typescript
this.player.body.setCollideWorldBounds(true);
this.player.body.onWorldBounds = true;
this.scene.physics.world.on('worldbounds', (body, up, down, left, right) => {
  if (left || right) {
    this.squashStretch();       // juice
    this.audio.play('bounce');
    this.spawnBounceParticles();
  }
});
```

### Step 4.4 — Camera + the rising beast (death line)
- Camera follows the player upward only (never scrolls back down).
- The **beast** is a big sprite pinned to the bottom of the current view; a `deathY` value **creeps upward over time** (accelerating with level). If `player.y > deathY` → the beast "eats" the player → lose a heart, brief invulnerability + relaunch, or game over if no hearts.
```typescript
// Camera: follow player Y, clamp so it only goes up
this.cameras.main.startFollow(this.player, false, 0, 0.08);
this.cameras.main.setDeadzone(9999, 200);

// Beast rises
this.deathY -= this.beastSpeed * dt;   // world moves up; tune per level
```

### Step 4.5 — Fruit, recipe & Gourmet meter
- **RecipeSystem** generates a target combo (e.g., 3× apple, 2× blueberry) shown in the top **thought bubble**.
- Colliding with correct fruit advances the recipe; wrong fruit = small points only.
- Completing a recipe fills the **Gourmet Level** progress bar → level up → new recipe, spawn rate up, beast faster, maybe new biome.
```typescript
interface Recipe { items: { fruit: FruitType; count: number }[]; }
// On fruit pickup: recipe.consume(fruit); if complete -> levelUp()
```

### Step 4.6 — Procedural generation (Spawner)
As the world scrolls up, spawn ahead of the camera:
- **Fruit** at varied x, weighted by current recipe.
- **Platforms** with hazard-striped edges (some breakable, some moving).
- **Ropes/vines** (climb/bounce surfaces).
- **Enemies** scaling with level.
- Guarantee **reachability**: spacing derived from max jump height (from `maxPull * power` and gravity). Never spawn an unavoidable wall.

### Step 4.7 — Enemies & hazards
- Ghost enemies drift in patterns; spiked box shoots/blocks; touching = lose heart (with i-frames + knockback).
- Angry/rage indicator escalates spawn density.

### Step 4.8 — Lives, combos, bonuses
- Hearts (start 2–3). Lose one on hit/caught; flash + invuln.
- **Combo counter** for chained fruit/no-miss bounces → "EXTRA BONUS" banner + coin multiplier.

---

## 5. UI / UX (match the polished look)

### 5.1 Screens
- **Boot** → **Preload** (loading bar) → **Home** → **Game + HUD** → **GameOver** → back to Home. Plus **Collection/Gacha**.

### 5.2 Home screen (screens 1 & 15)
- Big bubbly **POINPY-style logo** (multi-color letters, thick outline). Make your own name/logo — don't copy the trademark.
- Sleeping beast centered, floating coins, **RANK badge + XP bar**, **gachapon capsule machine** button (bottom-left), pause/settings, tap-to-start.

### 5.3 In-game HUD (`HUDScene`, always on top)
- Top-left: **pause** button + **hearts**.
- Top-center: **thought-bubble recipe**.
- Top-right: **coin counter** with smiley coin icon; rage indicator.
- Bottom: **Gourmet Level** label + big number + **progress bar**.
- Banners: **READY**, **EXTRA BONUS**, level-up flourish.

### 5.4 Art direction rules (to look professional)
- **Thick uniform black outlines** on everything.
- Flat, saturated palettes; **one palette per biome**.
- Rounded, bubbly shapes; expressive 2-frame faces.
- **9-slice** panels for buttons/dialogs; consistent corner radius.
- Big, legible bubble font for numbers/labels.
- Respect **safe areas** (notch/home indicator).

### 5.5 Juice checklist (this is what makes it feel "pro")
- Squash & stretch on jump, bounce, land.
- Screen shake on hits/big bounces.
- Particle bursts on fruit pickup + wall bounce (sparkles like screenshots).
- Tween pop/scale on collect; number pop-ups ("+1").
- Hit-stop (freeze a few ms) on damage.
- Anticipation stretch while aiming; trail while airborne.
- Smooth eased camera; parallax backgrounds per biome.

---

## 6. Audio

- **SFX:** launch, wall bounce, fruit collect (pitch up with combo), level-up, hurt, beast growl/rise, button click, coin, power-up. Generate with jsfxr; polish in Audacity.
- **Music:** upbeat loop per biome; muffle/duck during menus; intensify as beast nears.
- **AudioManager:** volume settings, mute toggle (persist to localStorage), unlock WebAudio on first user gesture (mobile requirement).
```typescript
// Mobile browsers require a user gesture to start audio:
this.input.once('pointerdown', () => this.sound.context.resume());
```

---

## 7. Save System

```typescript
// SaveSystem: localStorage JSON
interface Save {
  coins: number; rank: number; xp: number; bestLevel: number;
  unlocked: string[];      // gacha items
  settings: { sfx: boolean; music: boolean };
}
```
Persist: coins, rank/xp, best score, unlocked collection items, settings. Wrap in try/catch; version the schema for migrations.

---

## 8. Ads SDK Integration (core requirement)

### 8.1 Strategy (player-friendly, revenue-positive)
- **Rewarded video** — *Revive/Continue* after game over; *Double coins* at run end; *Free capsule* pull. (Best eCPM, opt-in.)
- **Interstitial** — occasionally between runs (respect frequency cap, e.g., every 3rd game over, min 90s gap).
- **Banner** — only on static menus (optional). Never during gameplay.
- Follow store/portal policies; no ads that block core play; keep a rewarded-only path.

### 8.2 Abstraction layer (`AdsManager.ts`)
Wrap whichever SDK behind one interface so you can swap providers.
```typescript
export interface AdsProvider {
  init(): Promise<void>;
  showRewarded(onReward: () => void, onFail?: () => void): void;
  showInterstitial(): void;
  showBanner?(): void;
  hideBanner?(): void;
}

export class AdsManager {
  constructor(private provider: AdsProvider) {}
  init() { return this.provider.init(); }
  rewardedRevive(cb: () => void) { this.provider.showRewarded(cb, () => {/* fallback */}); }
  interstitial() { this.provider.showInterstitial(); }
}
```

### 8.3 Web build — game-portal SDK
Choose the platform you'll publish on and implement `AdsProvider`:

**CrazyGames** (`window.CrazyGames.SDK`):
```typescript
// index.html: <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
class CrazyGamesAds implements AdsProvider {
  async init() { await window.CrazyGames.SDK.init(); }
  showRewarded(onReward, onFail) {
    window.CrazyGames.SDK.ad.requestAd('rewarded', {
      adFinished: onReward, adError: onFail, adStarted: () => {/* mute game */},
    });
  }
  showInterstitial() {
    window.CrazyGames.SDK.ad.requestAd('midgame', { adFinished(){}, adError(){} });
  }
}
```

**Poki** (`window.PokiSDK`):
```typescript
class PokiAds implements AdsProvider {
  async init() { await window.PokiSDK.init(); window.PokiSDK.gameLoadingFinished(); }
  showRewarded(onReward, onFail) {
    window.PokiSDK.rewardedBreak().then((ok: boolean) => ok ? onReward() : onFail?.());
  }
  showInterstitial() { window.PokiSDK.commercialBreak(); }
}
// Wrap gameplay start/stop with PokiSDK.gameplayStart()/gameplayStop() for best fill.
```

**GameDistribution** (`gdsdk`): implement `showAd('rewarded')` / `showAd('interstitial')` similarly.

### 8.4 Wrapped mobile app — Google AdMob (via Capacitor)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor-community/admob
npx cap add android && npx cap add ios
```
```typescript
import { AdMob, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';

class AdMobAds implements AdsProvider {
  async init() { await AdMob.initialize(); }
  showRewarded(onReward: () => void) {
    AdMob.addListener(RewardAdPluginEvents.Rewarded, (_r: AdMobRewardItem) => onReward());
    AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-XXX/rewarded' })
      .then(() => AdMob.showRewardVideoAd());
  }
  showInterstitial() {
    AdMob.prepareInterstitial({ adId: 'ca-app-pub-XXX/interstitial' })
      .then(() => AdMob.showInterstitial());
  }
  async showBanner() { await AdMob.showBanner({ adId: 'ca-app-pub-XXX/banner', position: 'BOTTOM_CENTER' as any }); }
}
```
> Use **test ad unit IDs** during development. Add AdMob App ID to `AndroidManifest.xml` / `Info.plist`. Handle ATT (iOS tracking consent) + GDPR/UMP consent.

### 8.5 Wiring ads into flow (`GameOverScene`)
```typescript
// Show "Continue?" with a rewarded-ad button
reviveBtn.on('pointerup', () => {
  this.audio.duck();
  this.ads.rewardedRevive(() => {
    this.audio.unduck();
    this.scene.get('GameScene').events.emit('revive'); // reset death line, +1 heart
    this.scene.stop();
  });
});
// Interstitial cadence
if (SaveSystem.get().deaths % 3 === 0) this.ads.interstitial();
```
**Always pause game logic + mute audio while an ad plays; resume on close.**

---

## 9. Balancing (`Balance.ts`)

- **Beast rise speed** curve vs. Gourmet Level (gentle start, steepens).
- **Recipe size/complexity** grows with level.
- **Fruit spawn density** high early (teach), thins later.
- **Enemy density** ramps; guarantee fair, reachable layouts.
- **Coin economy:** run rewards vs. gachapon cost vs. rewarded-ad bonuses.
- Playtest the **max jump reach** so no gap is impossible.

---

## 10. Content Expansion (post-MVP)

- 4+ biomes (grass, sky/ice, cave/volcano, + your own) with unique palette, hazards, music, fruit set.
- **Power-ups:** octobub (fruit magnet), snail clock (time slow), shields, bomb.
- **Gacha/Collection** screen (screens 6 & 12): capsule machine spends coins → unlock creatures/abilities; grid with locked silhouettes.
- **Puzzle mode** (hand-crafted levels) + **Endless mode** (unlock after main).
- **Boss encounters** using the rage indicator.
- Daily reward, missions, cosmetics.

---

## 11. Performance & Mobile

- Use a **single texture atlas** per biome (fewer draw calls).
- **Object pooling** for fruit/particles/enemies (no per-frame allocation).
- Cap particle counts; reuse `Graphics`/`BitmapText`.
- Test on low-end Android; target 60fps, degrade gracefully to 30.
- Handle resize/orientation, safe areas, and tab-blur (pause).
- Preload audio; lazy-load later biomes.

---

## 12. Testing & QA

- Unit-test physics helpers (trajectory, reachability), RecipeSystem, SaveSystem.
- Manual: input feel, ad flows (reward grants correctly, no soft-locks), audio unlock on iOS, offline behavior.
- Verify ad frequency caps + rewarded reliability across providers.

---

## 13. Build, Package & Ship

```bash
# Web build
npm run build            # → dist/  (upload to portal: CrazyGames/Poki/GD or itch.io)

# Mobile (Capacitor)
npm run build && npx cap copy
npx cap open android     # build APK/AAB in Android Studio
npx cap open ios         # build in Xcode
```
- Store assets: icon, screenshots, trailer, description.
- Privacy policy (required for ads), age rating, consent (GDPR/ATT).

---

## 14. Legal / Originality Note
POINPY, its beast, logo, and name are **trademarked/copyrighted** (Ojiro Fumoto / Devolver Digital). Build an **original-branded** game *inspired by the mechanics* — your own name, logo, character, and art. Mechanics/genres aren't copyrightable, but **do not copy** the exact art, characters, name, or logo.

---

## 15. Suggested Milestone Timeline

| Phase | Deliverable | Est. |
|------|-------------|------|
| 1 | Project setup + slingshot + gravity + wall bounce + trajectory | 3–5 d |
| 2 | Camera + rising beast + fail state + one biome procedural spawn | 4–6 d |
| 3 | Fruit + recipe + Gourmet meter + HUD + hearts | 4–6 d |
| 4 | Juice pass (particles, shake, squash/stretch) + audio | 3–5 d |
| 5 | Home/RANK/save + Ads SDK (rewarded revive + interstitial) | 4–6 d |
| 6 | Enemies + power-ups + more biomes | 1–2 wk |
| 7 | Gacha/collection + puzzle/endless modes | 1–2 wk |
| 8 | Balance, QA, performance, packaging, store submission | 1 wk |

---

## 16. Quick-Start Checklist
- [ ] Vite + Phaser + TS scaffold running
- [ ] Slingshot drag → launch working
- [ ] Dashed trajectory preview
- [ ] Wall bounce + gravity + squash/stretch
- [ ] Camera up-follow + rising beast death line
- [ ] Fruit + recipe bubble + Gourmet meter
- [ ] Hearts + game over + revive
- [ ] One biome procedural spawn (reachable)
- [ ] HUD (hearts/coins/level/pause) + banners
- [ ] Particles + screen shake + SFX + music
- [ ] Home screen + RANK + save (localStorage)
- [ ] AdsManager + rewarded revive + interstitial
- [ ] Original art/logo (not POINPY's)
- [ ] Build + package + submit
```
```

*Generated from deep analysis of the 11 project screenshots + Google Play & App Store listings.*
