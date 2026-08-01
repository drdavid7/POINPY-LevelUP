/**
 * Central tunables. Change these to re-feel the whole game.
 * Values are tuned so wall-bounce jumps feel snappy and platforms stay reachable.
 */

// Fixed design width keeps the slingshot feel identical on every device.
// Height adapts to the device's own aspect ratio (phone vs tablet vs foldable)
// so tall phones get more playable vertical space and tablets don't get
// an oversized/awkward canvas. Phaser's Scale.FIT then letterboxes any
// remaining mismatch so nothing is ever stretched.
const DESIGN_WIDTH = 480;
const MIN_DESIGN_HEIGHT = 720;
const MAX_DESIGN_HEIGHT = 1100;

function computeDesignHeight(): number {
  if (typeof window === 'undefined') return 854;
  const w = window.innerWidth || DESIGN_WIDTH;
  const h = window.innerHeight || 854;
  const aspect = h / w;
  const target = Math.round(DESIGN_WIDTH * aspect);
  return Math.max(MIN_DESIGN_HEIGHT, Math.min(MAX_DESIGN_HEIGHT, target));
}

export const GAME = {
  width: DESIGN_WIDTH,
  height: computeDesignHeight(),

  // Physics
  gravityY: 1500,
  launchPower: 9.5,     // multiplies the drag vector -> launch velocity
  maxPull: 150,         // max drag distance (px) for the slingshot
  minPull: 12,          // ignore tiny taps
  wallBounce: 0.86,     // horizontal restitution on wall hit
  maxLaunchSpeed: 1400, // clamp so one flick can't fling you off-screen

  // Player
  playerRadius: 22,

  // Beast / death line
  beastStartOffset: 260, // how far below the player the beast starts
  beastBaseSpeed: 34,    // px/sec the death line rises at level 1
  beastSpeedPerLevel: 6, // added px/sec per gourmet level
  beastCatchLift: 320,   // how far player is relaunched up when caught

  // Lives
  startHearts: 3,
  maxHearts: 5,
  invulnMs: 1200,

  // Camera
  cameraLerp: 0.12,

  // Combo / streak
  combo: {
    windowMs: 1400,
    breakOnWallBounce: false,
    maxMultiplier: 4,
  },

  // Colors (shared UI)
  colors: {
    outline: 0x1b1b1f,
    coin: 0xffd23f,
    heart: 0xff4d6d,
    text: 0xffffff,
    barBack: 0x2a2f36,
    barFill: 0x6fcf3f,
    barFillHi: 0xffd23f,
  },
} as const;
