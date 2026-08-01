import Phaser from 'phaser';
import type { FruitType } from '../types';

/**
 * Generates ALL game textures procedurally so the prototype needs zero image
 * files. Replace these with a real texture atlas later — object code references
 * textures by key (e.g. 'player', 'fruit_apple'), so art swaps are painless.
 */

const OUTLINE = 0x1b1b1f;

function drawCircle(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number, outline = 4) {
  g.fillStyle(OUTLINE, 1);
  g.fillCircle(x, y, r + outline);
  g.fillStyle(color, 1);
  g.fillCircle(x, y, r);
}

const FRUIT_COLORS: Record<FruitType, number> = {
  apple: 0xff4d4d,
  blueberry: 0x3a6bd6,
  grapes: 0x6fcf3f,
  lemon: 0xffe14d,
  watermelon: 0x53c05a,
  cherry: 0xd12b4a,
  banana: 0xffd23f,
};

export function generateTextures(scene: Phaser.Scene) {
  const make = (key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
    const g = scene.add.graphics();
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  // ---- Player: little green jumper with eyes ----
  make('player', 60, 60, (g) => {
    drawCircle(g, 30, 32, 20, 0x6fcf3f);
    // ears/spikes
    g.fillStyle(0x6fcf3f, 1);
    g.fillTriangle(16, 16, 26, 6, 28, 20);
    g.fillStyle(0x111111, 1);
    g.fillCircle(24, 30, 3.5);
    g.fillCircle(37, 30, 3.5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(25, 29, 1.2);
    g.fillCircle(38, 29, 1.2);
  });

  // ---- Beast: big blue face (death line) ----
  make('beast', 460, 240, (g) => {
    g.fillStyle(OUTLINE, 1);
    g.fillRoundedRect(6, 40, 448, 260, 120);
    g.fillStyle(0x2f6bd6, 1);
    g.fillRoundedRect(12, 46, 436, 260, 116);
    // ears
    g.fillStyle(0xffd23f, 1);
    g.fillTriangle(90, 60, 140, 20, 150, 80);
    g.fillTriangle(370, 60, 320, 20, 310, 80);
    // eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(180, 120, 26);
    g.fillCircle(280, 120, 26);
    g.fillStyle(0x111111, 1);
    g.fillCircle(184, 126, 10);
    g.fillCircle(276, 126, 10);
    // mouth
    g.fillStyle(0xff4d6d, 1);
    g.fillCircle(230, 170, 10);
  });

  // ---- Fruits ----
  (Object.keys(FRUIT_COLORS) as FruitType[]).forEach((f) => {
    make(`fruit_${f}`, 44, 44, (g) => {
      drawCircle(g, 22, 24, 15, FRUIT_COLORS[f], 3);
      // little stem/leaf
      g.fillStyle(0x2e7d32, 1);
      g.fillRoundedRect(20, 4, 4, 8, 2);
      if (f === 'watermelon') {
        g.lineStyle(2, 0x1b5e20, 1);
        g.beginPath(); g.arc(22, 24, 9, 0, Math.PI * 2); g.strokePath();
      }
    });
  });

  // ---- Coin (smiley) ----
  make('coin', 34, 34, (g) => {
    drawCircle(g, 17, 17, 12, 0xffd23f, 3);
    g.fillStyle(0x111111, 1);
    g.fillCircle(13, 15, 1.8);
    g.fillCircle(21, 15, 1.8);
    g.lineStyle(2, 0x111111, 1);
    g.beginPath(); g.arc(17, 19, 5, 0.15 * Math.PI, 0.85 * Math.PI); g.strokePath();
  });

  // ---- Heart ----
  make('heart', 34, 34, (g) => {
    g.fillStyle(OUTLINE, 1);
    g.fillCircle(11, 12, 8); g.fillCircle(23, 12, 8);
    g.fillTriangle(3, 14, 31, 14, 17, 31);
    g.fillStyle(0xff4d6d, 1);
    g.fillCircle(11, 12, 6); g.fillCircle(23, 12, 6);
    g.fillTriangle(6, 14, 28, 14, 17, 28);
  });

  // ---- Platform (rounded bar) ----
  make('platform', 120, 24, (g) => {
    g.fillStyle(OUTLINE, 1);
    g.fillRoundedRect(0, 0, 120, 24, 12);
    g.fillStyle(0x3a3f47, 1);
    g.fillRoundedRect(3, 3, 114, 18, 9);
  });

  // ---- Enemy: ghost baddie (drifts side to side) ----
  make('enemy_ghost', 48, 48, (g) => {
    g.fillStyle(OUTLINE, 1);
    g.fillRoundedRect(6, 8, 36, 34, 16);
    g.fillStyle(0xe0466f, 1);
    g.fillRoundedRect(10, 12, 28, 30, 13);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 24, 5);
    g.fillStyle(0x111111, 1);
    g.fillCircle(21, 25, 2.4);
  });

  // ---- Enemy: spiker (stationary hazard, pulses in place) ----
  make('enemy_spiker', 48, 48, (g) => {
    const cx = 24, cy = 26, r = 14;
    g.fillStyle(OUTLINE, 1);
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      const x1 = cx + Math.cos(a) * (r + 2);
      const y1 = cy + Math.sin(a) * (r + 2);
      const x2 = cx + Math.cos(a) * (r + 12);
      const y2 = cy + Math.sin(a) * (r + 12);
      const perp = a + Math.PI / 2;
      g.fillTriangle(
        x1 + Math.cos(perp) * 4, y1 + Math.sin(perp) * 4,
        x1 - Math.cos(perp) * 4, y1 - Math.sin(perp) * 4,
        x2, y2,
      );
    }
    g.fillStyle(OUTLINE, 1);
    g.fillCircle(cx, cy, r + 2);
    g.fillStyle(0xff8a3d, 1);
    g.fillCircle(cx, cy, r);
    g.fillStyle(0x111111, 1);
    g.fillCircle(cx - 4, cy - 2, 3);
    g.fillCircle(cx + 4, cy - 2, 3);
    g.fillStyle(0xffffff, 1);
    g.lineStyle(2.5, 0x111111, 1);
    g.beginPath(); g.arc(cx, cy + 5, 4, 0.15 * Math.PI, 0.85 * Math.PI); g.strokePath();
  });

  // ---- Enemy: bat (fast erratic flutterer) ----
  make('enemy_bat', 52, 40, (g) => {
    g.fillStyle(OUTLINE, 1);
    g.fillTriangle(2, 20, 20, 8, 20, 30);
    g.fillTriangle(50, 20, 32, 8, 32, 30);
    g.fillCircle(26, 20, 16);
    g.fillStyle(0x5a3fa0, 1);
    g.fillTriangle(5, 20, 19, 12, 19, 27);
    g.fillTriangle(47, 20, 33, 12, 33, 27);
    g.fillCircle(26, 20, 13);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(21, 18, 4);
    g.fillCircle(31, 18, 4);
    g.fillStyle(0xff4d6d, 1);
    g.fillCircle(21, 18, 2);
    g.fillCircle(31, 18, 2);
    g.fillStyle(OUTLINE, 1);
    g.fillTriangle(22, 26, 26, 22, 30, 26);
  });

  // ---- Power-up capsule ----
  make('powerup', 40, 40, (g) => {
    drawCircle(g, 20, 20, 14, 0x8e5bff, 3);
    // simple 4-point star
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(20, 9, 16, 20, 24, 20);
    g.fillTriangle(20, 31, 16, 20, 24, 20);
    g.fillTriangle(9, 20, 20, 16, 20, 24);
    g.fillTriangle(31, 20, 20, 16, 20, 24);
  });

  // ---- Particle (spark) ----
  make('spark', 12, 12, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(6, 6, 5);
  });
}
