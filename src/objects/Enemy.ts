import Phaser from 'phaser';

export type EnemyKind = 'ghost' | 'spiker' | 'bat';

/**
 * Three enemy archetypes so climbing stops being a single repeated dodge:
 *  - ghost:  gentle side-to-side drift (original baddie, low threat)
 *  - spiker: stationary hazard that pulses in place, larger hit radius,
 *            forces the player to route around it rather than just dodge
 *  - bat:    fast, wide, erratic sweeps - the real threat at higher levels
 */
export class Enemy extends Phaser.Physics.Arcade.Image {
  public kind: EnemyKind;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: EnemyKind = 'ghost') {
    super(scene, x, y, `enemy_${kind}`);
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setDepth(32);

    switch (kind) {
      case 'ghost':
        body.setCircle(18, 6, 8);
        scene.tweens.add({
          targets: this,
          x: x + Phaser.Math.Between(40, 90),
          duration: Phaser.Math.Between(1200, 2000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;

      case 'spiker':
        body.setCircle(20, 4, 4);
        scene.tweens.add({
          targets: this,
          scale: 1.12,
          duration: 420,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        scene.tweens.add({
          targets: this,
          angle: 360,
          duration: 6000,
          repeat: -1,
        });
        break;

      case 'bat': {
        body.setCircle(16, 10, 4);
        const range = Phaser.Math.Between(90, 160);
        const dir = Phaser.Math.Between(0, 1) ? 1 : -1;
        scene.tweens.add({
          targets: this,
          x: x + range * dir,
          duration: Phaser.Math.Between(500, 800),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        scene.tweens.add({
          targets: this,
          y: y + Phaser.Math.Between(20, 40),
          duration: Phaser.Math.Between(260, 400),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;
      }
    }
  }
}
