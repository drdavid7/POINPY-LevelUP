import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Audio } from '../systems/AudioManager';

export class SettingsScene extends Phaser.Scene {
  private confirmReset = false;

  constructor() {
    super('Settings');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#2f3640');

    this.add.text(width / 2, 50, 'SETTINGS', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '30px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#1b1b1f', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(20, 50, '← Back', { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => { Audio.play('click'); this.scene.start('Home'); });

    const save = SaveSystem.get();
    this.toggleRow(width / 2, 130, 'SFX', save.settings.sfx, (v) => {
      SaveSystem.save({ settings: { ...save.settings, sfx: v } });
    });
    this.toggleRow(width / 2, 200, 'Music', save.settings.music, (v) => {
      SaveSystem.save({ settings: { ...save.settings, music: v } });
    });

    const resetBtn = this.add
      .rectangle(width / 2, height - 160, 260, 48, 0xe0466f)
      .setStrokeStyle(4, 0x1b1b1f)
      .setInteractive({ useHandCursor: true });
    const resetTxt = this.add.text(width / 2, height - 160, 'RESET PROGRESS', {
      fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    resetBtn.on('pointerup', () => {
      Audio.play('click');
      if (!this.confirmReset) {
        this.confirmReset = true;
        resetTxt.setText('TAP AGAIN TO CONFIRM');
        resetBtn.setFillStyle(0x8b0000);
        return;
      }
      SaveSystem.reset();
      this.scene.start('Home');
    });

    this.add.text(width / 2, height - 80, 'Juicy Climber v0.2\nPOINPY-LevelUP', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#aaa', align: 'center',
    }).setOrigin(0.5);
  }

  private toggleRow(x: number, y: number, label: string, on: boolean, set: (v: boolean) => void) {
    this.add.rectangle(x, y, 300, 54, 0xffffff).setStrokeStyle(3, 0x1b1b1f);
    this.add.text(x - 120, y, label, { fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#1b1b1f' }).setOrigin(0, 0.5);
    const sw = this.add.rectangle(x + 100, y, 56, 30, on ? 0x6fcf3f : 0x9aa0a6).setStrokeStyle(2, 0x1b1b1f).setInteractive({ useHandCursor: true });
    this.add.text(x + 100, y, on ? 'ON' : 'OFF', { fontFamily: 'sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#1b1b1f' }).setOrigin(0.5);
    sw.on('pointerup', () => {
      Audio.play('click');
      const next = !on;
      set(next);
      this.scene.restart();
    });
  }
}
