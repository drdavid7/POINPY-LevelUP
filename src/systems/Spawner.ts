import Phaser from 'phaser';
import { GAME } from '../config/GameConfig';
import { biomeForLevel, enemyChance, enemyKindForLevel } from '../config/Balance';
import type { FruitType, RecipeItem } from '../types';
import { Fruit } from '../objects/Fruit';
import { Enemy } from '../objects/Enemy';
import { PowerUp, PowerUpKind } from '../objects/PowerUp';

/**
 * Procedurally spawns fruit / platforms / enemies / power-ups ABOVE the camera
 * as the player climbs. Row spacing is derived from the max reachable jump so
 * layouts stay fair. Fruit selection is weighted toward the current recipe.
 */
export class Spawner {
  private nextSpawnY: number;
  private rowGap = 150;
  private wallPad = 44;

  constructor(
    private scene: Phaser.Scene,
    private fruits: Phaser.Physics.Arcade.Group,
    private platforms: Phaser.Physics.Arcade.StaticGroup,
    private enemies: Phaser.Physics.Arcade.Group,
    private powerups: Phaser.Physics.Arcade.Group,
    startY: number,
  ) {
    this.nextSpawnY = startY;
  }

  /** Call each frame with the current camera top world-Y. */
  update(cameraTopY: number, level: number, recipe: RecipeItem[]) {
    // spawn until we've filled a screen above the camera
    while (this.nextSpawnY > cameraTopY - GAME.height) {
      this.spawnRow(this.nextSpawnY, level, recipe);
      this.nextSpawnY -= this.rowGap;
    }
  }

  private spawnRow(y: number, level: number, recipe: RecipeItem[]) {
    const w = this.scene.scale.width;
    const left = this.wallPad;
    const right = w - this.wallPad;

    // 1) Fruit (1–2 per row)
    const n = Phaser.Math.Between(1, 2);
    for (let i = 0; i < n; i++) {
      const x = Phaser.Math.Between(left, right);
      const type = this.pickFruit(level, recipe);
      this.fruits.add(new Fruit(this.scene, x, y + Phaser.Math.Between(-30, 30), type));
    }

    // 2) Occasional platform
    if (Phaser.Math.FloatBetween(0, 1) < 0.5) {
      const px = Phaser.Math.Between(left + 40, right - 40);
      const plat = this.platforms.create(px, y + 40, 'platform') as Phaser.Physics.Arcade.Image;
      plat.refreshBody();
    }

    // 3) Enemy
    if (Phaser.Math.FloatBetween(0, 1) < enemyChance(level)) {
      const ex = Phaser.Math.Between(left, right - 60);
      const kind = enemyKindForLevel(level);
      this.enemies.add(new Enemy(this.scene, ex, y - Phaser.Math.Between(20, 60), kind));
    }

    // 4) Rare power-up
    if (Phaser.Math.FloatBetween(0, 1) < 0.06) {
      const kinds: PowerUpKind[] = ['magnet', 'slow', 'shield'];
      const kind = Phaser.Utils.Array.GetRandom(kinds);
      this.powerups.add(new PowerUp(this.scene, Phaser.Math.Between(left, right), y, kind));
    }
  }

  private pickFruit(level: number, recipe: RecipeItem[]): FruitType {
    // 60% chance to spawn a fruit the recipe still needs
    const needed = recipe.filter((r) => r.got < r.count).map((r) => r.fruit);
    if (needed.length && Phaser.Math.FloatBetween(0, 1) < 0.6) {
      return Phaser.Utils.Array.GetRandom(needed);
    }
    return Phaser.Utils.Array.GetRandom(biomeForLevel(level).fruits);
  }
}
