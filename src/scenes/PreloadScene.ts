import Phaser from 'phaser';
import { generateTextures } from '../gfx/Textures';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create() {
    // Simple loading flash, then generate all procedural textures.
    const { width, height } = this.scale;
    const txt = this.add
      .text(width / 2, height / 2, 'Loading...', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    generateTextures(this);

    this.time.delayedCall(200, () => {
      txt.destroy();
      this.scene.start('Home');
    });
  }
}
