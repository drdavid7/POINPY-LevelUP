import Phaser from 'phaser';

export type PowerUpKind = 'magnet' | 'slow' | 'shield';

export class PowerUp extends Phaser.Physics.Arcade.Image {
  public kind: PowerUpKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: PowerUpKind) {
    super(scene, x, y, 'powerup');
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(14, 6, 6);
    this.setDepth(31);
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 3000,
      repeat: -1,
    });
  }
}
