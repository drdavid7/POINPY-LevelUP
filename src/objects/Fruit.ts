import Phaser from 'phaser';
import type { FruitType } from '../types';

export class Fruit extends Phaser.Physics.Arcade.Image {
  public fruitType: FruitType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: FruitType) {
    super(scene, x, y, `fruit_${type}`);
    this.fruitType = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(15, 4, 4);
    this.setDepth(30);

    // gentle bob
    scene.tweens.add({
      targets: this,
      y: y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
