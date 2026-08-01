import Phaser from 'phaser';
import { Ads } from '../systems/ads/AdsManager';
import { Audio } from '../systems/AudioManager';
import { SaveSystem } from '../systems/SaveSystem';

interface GOData { level: number; coins: number; }

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GOData) {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    const panel = this.add.rectangle(width / 2, height / 2, width * 0.8, 400, 0xffffff)
      .setStrokeStyle(6, 0x1b1b1f);
    (panel as any).setRadius?.(20);

    this.add.text(width / 2, height / 2 - 130, 'GAME OVER', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '34px', fontStyle: 'bold',
      color: '#e0466f', stroke: '#1b1b1f', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 70,
      `Gourmet Level ${data.level}\n+${data.coins} coins`, {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#1b1b1f', align: 'center',
    }).setOrigin(0.5);

    // Revive with rewarded ad
    this.button(width / 2, height / 2 + 0, 'REVIVE  ▶ (Ad)', 0xffd23f, () => {
      Audio.duck();
      Ads.rewarded(
        () => {
          Audio.unduck();
          this.scene.get('Game').events.emit('revive');
          this.scene.stop();
        },
        () => {
          Audio.unduck();
          // ad failed/skipped — stay on the game over screen
        },
      );
    });

    // Double coins with rewarded ad
    this.button(width / 2, height / 2 + 62, 'DOUBLE COINS  ▶', 0x6fcf3f, () => {
      Audio.duck();
      Ads.rewarded(() => {
        Audio.unduck();
        SaveSystem.addCoins(data.coins); // grant the same amount again
        this.goHome(false);
      }, () => Audio.unduck());
    });

    // Home
    this.button(width / 2, height / 2 + 124, 'VIEW BEST RUNS', 0x2f6bd6, () => {
      this.scene.stop('HUD');
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Leaderboard');
    });

    this.button(width / 2, height / 2 + 186, 'HOME', 0x9aa0a6, () => this.goHome(true));
  }

  private goHome(withInterstitial: boolean) {
    const finish = () => {
      this.scene.stop('HUD');
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Home');
    };
    // Interstitial every 3rd death (frequency-capped inside AdsManager)
    if (withInterstitial && SaveSystem.get().deaths % 3 === 0) {
      Ads.interstitial(finish);
    } else {
      finish();
    }
  }

  private button(x: number, y: number, label: string, color: number, onClick: () => void) {
    const w = 240, h = 48;
    const bg = this.add.rectangle(x, y, w, h, color).setStrokeStyle(4, 0x1b1b1f).setInteractive({ useHandCursor: true });
    (bg as any).setRadius?.(12);
    const t = this.add.text(x, y, label, {
      fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#1b1b1f',
    }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setScale(1.04));
    bg.on('pointerout', () => bg.setScale(1));
    bg.on('pointerup', () => { Audio.play('click'); onClick(); });
    return { bg, t };
  }
}
