import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Audio } from '../systems/AudioManager';
import { UPGRADES } from '../config/Balance';
import type { UpgradeState } from '../types';

export class ShopScene extends Phaser.Scene {
  private coinText!: Phaser.GameObjects.Text;
  private rows: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Shop');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#2f3640');

    this.add.text(width / 2, 50, 'SHOP', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '30px', fontStyle: 'bold',
      color: '#ffd23f', stroke: '#1b1b1f', strokeThickness: 6,
    }).setOrigin(0.5);

    this.coinText = this.add.text(width - 20, 50, `🪙 ${SaveSystem.get().coins}`, {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#ffffff',
    }).setOrigin(1, 0.5);

    this.add.text(20, 50, '← Back', { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => { Audio.play('click'); this.scene.start('Home'); });

    this.renderRows();
  }

  private renderRows() {
    this.rows.forEach((r) => r.destroy());
    this.rows = [];
    const { width } = this.scale;
    const save = SaveSystem.get();
    this.coinText.setText(`🪙 ${save.coins}`);

    UPGRADES.forEach((def, i) => {
      const y = 120 + i * 110;
      this.add.rectangle(width / 2, y, width * 0.88, 96, 0xffffff).setStrokeStyle(3, 0x1b1b1f);
      const level = save.upgrades[def.id as keyof UpgradeState];
      const maxed = level >= def.maxLevel;
      const cost = maxed ? 0 : def.costs[level];
      const canBuy = !maxed && save.coins >= cost;

      const title = this.add.text(width / 2 - 150, y - 22, def.label, {
        fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#1b1b1f',
      });
      const desc = this.add.text(width / 2 - 150, y + 4, def.description, {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#444',
      });
      const lvl = this.add.text(width / 2 - 150, y + 26, `Level ${level}/${def.maxLevel}`, {
        fontFamily: 'sans-serif', fontSize: '14px', color: '#2f6bd6',
      });
      this.rows.push(title, desc, lvl);

      const label = maxed ? 'MAX' : `+ (${cost} 🪙)`;
      const btn = this.add
        .rectangle(width / 2 + 120, y, 100, 44, canBuy ? 0x6fcf3f : 0x9aa0a6)
        .setStrokeStyle(3, 0x1b1b1f)
        .setInteractive({ useHandCursor: canBuy });
      const bt = this.add.text(width / 2 + 120, y, label, {
        fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#1b1b1f',
      }).setOrigin(0.5);
      this.rows.push(bt);

      if (canBuy) {
        btn.on('pointerup', () => {
          Audio.play('click');
          if (SaveSystem.buyUpgrade(def.id)) {
            Audio.play('coin');
            this.renderRows();
          }
        });
      }
    });
  }
}
