import Phaser from 'phaser';
import { Audio } from '../systems/AudioManager';

/**
 * Overlay launched on top of Game+HUD when the pause button is tapped.
 * GameScene already halts physics + its own update loop; this scene just
 * gives the player somewhere to go (resume / restart / home) instead of
 * being stuck staring at a frozen screen.
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.62).setDepth(0);

    const panel = this.add
      .rectangle(width / 2, height / 2, width * 0.78, 320, 0xffffff)
      .setStrokeStyle(6, 0x1b1b1f)
      .setDepth(1);
    (panel as any).setRadius?.(20);

    this.add
      .text(width / 2, height / 2 - 110, 'PAUSED', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#2f6bd6',
        stroke: '#1b1b1f',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(1);

    this.button(width / 2, height / 2 - 30, '▶  RESUME', 0x6fcf3f, () => {
      this.game.events.emit('pauseToggle');
    });

    this.button(width / 2, height / 2 + 34, '↻  RESTART', 0xffd23f, () => {
      this.scene.stop('Pause');
      this.scene.stop('HUD');
      this.scene.stop('Game');
      this.scene.start('Game');
    });

    this.button(width / 2, height / 2 + 98, '⌂  HOME', 0x9aa0a6, () => {
      this.scene.stop('Pause');
      this.scene.stop('HUD');
      this.scene.stop('Game');
      this.scene.start('Home');
    });

    // ESC key also resumes on desktop testing.
    this.input.keyboard?.once('keydown-ESC', () => this.game.events.emit('pauseToggle'));
  }

  private button(x: number, y: number, label: string, color: number, onClick: () => void) {
    const w = 260;
    const h = 50;
    const bg = this.add
      .rectangle(x, y, w, h, color)
      .setStrokeStyle(4, 0x1b1b1f)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);
    (bg as any).setRadius?.(12);
    this.add
      .text(x, y, label, {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#1b1b1f',
      })
      .setOrigin(0.5)
      .setDepth(1);
    bg.on('pointerover', () => bg.setScale(1.04));
    bg.on('pointerout', () => bg.setScale(1));
    bg.on('pointerup', () => {
      Audio.play('click');
      onClick();
    });
    return bg;
  }
}
