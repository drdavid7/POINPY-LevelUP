import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Audio } from '../systems/AudioManager';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('Leaderboard');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#2f3640');

    this.add.text(width / 2, 50, 'BEST RUNS', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '30px', fontStyle: 'bold',
      color: '#ffd23f', stroke: '#1b1b1f', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(20, 50, '← Back', { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        Audio.play('click');
        if (this.scene.isActive('GameOver')) this.scene.stop('GameOver');
        this.scene.start('Home');
      });

    const runs = SaveSystem.get().runHistory;
    if (runs.length === 0) {
      this.add.text(width / 2, height / 2, 'No runs yet.\nPlay a game!', {
        fontFamily: 'sans-serif', fontSize: '20px', color: '#ffffff', align: 'center',
      }).setOrigin(0.5);
      return;
    }

    runs.forEach((run, i) => {
      const y = 110 + i * 52;
      this.add.rectangle(width / 2, y, width * 0.88, 44, 0xffffff).setStrokeStyle(2, 0x1b1b1f);
      const ago = this.relativeDate(run.date);
      this.add.text(width / 2 - 170, y, `#${i + 1}`, {
        fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#2f6bd6',
      }).setOrigin(0, 0.5);
      this.add.text(width / 2 - 130, y, `Lvl ${run.level}  ·  ${run.coins}🪙`, {
        fontFamily: 'sans-serif', fontSize: '16px', color: '#1b1b1f',
      }).setOrigin(0, 0.5);
      this.add.text(width / 2 + 150, y, ago, {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#666',
      }).setOrigin(1, 0.5);
    });
  }

  private relativeDate(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}
