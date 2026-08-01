import Phaser from 'phaser';

/**
 * The rising blue beast pinned to the bottom of the view. Its top edge is the
 * "death line": if the player falls below it, the player is caught.
 */
export class Beast extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene) {
    super(scene, scene.scale.width / 2, 0, 'beast');
    scene.add.existing(this);
    this.setDepth(45);
    this.setScrollFactor(0); // drawn in screen space via HUD-like positioning
  }

  /** deathLineWorldY = world Y of the beast's mouth. */
  positionAt(cam: Phaser.Cameras.Scene2D.Camera, deathLineWorldY: number) {
    // convert world Y to screen Y
    const screenY = deathLineWorldY - cam.scrollY;
    this.setPosition(this.scene.scale.width / 2, screenY + this.height / 2 - 30);
  }

  chomp() {
    this.scene.tweens.add({
      targets: this,
      scaleY: 1.12,
      duration: 90,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
}
