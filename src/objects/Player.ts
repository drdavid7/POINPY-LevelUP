import Phaser from 'phaser';
import { GAME } from '../config/GameConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public invulnUntil = 0;
  private trail?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(GAME.playerRadius, 8, 8);
    body.setBounce(GAME.wallBounce, 0);
    body.setCollideWorldBounds(true);
    body.onWorldBounds = true;
    this.setDepth(40);
  }

  launch(vx: number, vy: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = Math.hypot(vx, vy);
    if (speed > GAME.maxLaunchSpeed) {
      const k = GAME.maxLaunchSpeed / speed;
      vx *= k; vy *= k;
    }
    body.setVelocity(vx, vy);
    this.stretchInDirection(vx, vy);
  }

  /** Squash & stretch juice on bounce. */
  squash() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.35,
      scaleY: 0.65,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  private stretchInDirection(vx: number, vy: number) {
    const angle = Math.atan2(vy, vx);
    this.setRotation(0);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 0.75,
      duration: 90,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  isInvulnerable() {
    return this.scene.time.now < this.invulnUntil;
  }

  setInvulnerable(ms: number) {
    this.invulnUntil = this.scene.time.now + ms;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: Math.floor(ms / 240),
      onComplete: () => this.setAlpha(1),
    });
  }
}
