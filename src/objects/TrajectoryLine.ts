import Phaser from 'phaser';
import { GAME } from '../config/GameConfig';

/**
 * Dashed arc preview of where the player will fly, matching POINPY's white
 * dotted trajectory. Simulates the same gravity as the physics world and
 * reflects off the side walls.
 */
export class TrajectoryLine {
  private gfx: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene) {
    this.gfx = scene.add.graphics();
    this.gfx.setDepth(50);
  }

  hide() {
    this.gfx.clear();
  }

  /** Draw from (x0,y0) with launch velocity (vx,vy). */
  draw(x0: number, y0: number, vx: number, vy: number, leftWall: number, rightWall: number) {
    this.gfx.clear();
    const g = GAME.gravityY;
    const dt = 0.05;
    let x = x0;
    let y = y0;
    let dx = vx;
    let dy = vy;
    const dots = 24;

    this.gfx.fillStyle(0xffffff, 0.9);
    for (let i = 0; i < dots; i++) {
      // integrate
      dy += g * dt;
      x += dx * dt;
      y += dy * dt;
      // reflect on walls
      if (x < leftWall) { x = leftWall; dx = -dx * GAME.wallBounce; }
      if (x > rightWall) { x = rightWall; dx = -dx * GAME.wallBounce; }
      const r = 4 - (i / dots) * 2.2;
      if (i % 1 === 0) this.gfx.fillCircle(x, y, Math.max(1.5, r));
    }
  }

  destroy() {
    this.gfx.destroy();
  }
}
