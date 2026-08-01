import Phaser from 'phaser';
import { GAME } from '../config/GameConfig';

/**
 * Slingshot control: press & drag anywhere, the launch fires OPPOSITE the drag
 * (pull back like a catapult). Emits 'aim' (Vector2 launch velocity) while
 * dragging and 'aimEnd' on release. Calls onLaunch(vx, vy) with final velocity.
 */
export class InputController {
  private start?: Phaser.Math.Vector2;
  private aiming = false;
  private enabled = true;

  constructor(
    private scene: Phaser.Scene,
    private onLaunch: (vx: number, vy: number) => void,
  ) {
    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) {
      this.aiming = false;
      this.scene.events.emit('aimEnd');
    }
  }

  private onDown(p: Phaser.Input.Pointer) {
    if (!this.enabled) return;
    this.start = new Phaser.Math.Vector2(p.x, p.y);
    this.aiming = true;
  }

  private onMove(p: Phaser.Input.Pointer) {
    if (!this.aiming || !this.start || !this.enabled) return;
    this.scene.events.emit('aim', this.velocityFrom(p));
  }

  private onUp(p: Phaser.Input.Pointer) {
    if (!this.aiming || !this.start || !this.enabled) {
      this.aiming = false;
      return;
    }
    const v = this.velocityFrom(p);
    const pull = Math.hypot(this.start.x - p.x, this.start.y - p.y);
    this.aiming = false;
    this.scene.events.emit('aimEnd');
    if (pull >= GAME.minPull) this.onLaunch(v.x, v.y);
  }

  /** Convert current drag into a launch velocity vector. */
  private velocityFrom(p: Phaser.Input.Pointer): Phaser.Math.Vector2 {
    const dx = this.start!.x - p.x;
    const dy = this.start!.y - p.y;
    const v = new Phaser.Math.Vector2(dx, dy);
    if (v.length() > GAME.maxPull) v.setLength(GAME.maxPull);
    return v.scale(GAME.launchPower);
  }

  destroy() {
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
  }
}
