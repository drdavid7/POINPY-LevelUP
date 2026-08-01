import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Audio } from '../systems/AudioManager';
import { Ads } from '../systems/ads/AdsManager';

/**
 * Simple gacha/collection grid (like POINPY's capsule collection). Spend coins
 * (or watch a rewarded ad) to unlock a random tile.
 */
const TILES = ['⭐', '👻', '🐌', '🐙', '❤️', '💎', '🍄', '⏰', '🌟', '🎈', '🦄', '🔥'];

export class CollectionScene extends Phaser.Scene {
  private grid: Phaser.GameObjects.Text[] = [];
  private coinText!: Phaser.GameObjects.Text;

  constructor() {
    super('Collection');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#2f3640');

    this.add.text(width / 2, 50, 'COLLECTION', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '30px', fontStyle: 'bold',
      color: '#ffd23f', stroke: '#1b1b1f', strokeThickness: 6,
    }).setOrigin(0.5);

    this.coinText = this.add.text(width - 20, 50, `🪙 ${SaveSystem.get().coins}`, {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#ffffff',
    }).setOrigin(1, 0.5);

    // Grid 3 x 4
    const cols = 3, cell = 90, gx = (width - cols * cell) / 2 + cell / 2, gy = 130;
    TILES.forEach((emoji, i) => {
      const cx = gx + (i % cols) * cell;
      const cy = gy + Math.floor(i / cols) * cell;
      this.add.rectangle(cx, cy, cell - 12, cell - 12, 0xffffff).setStrokeStyle(3, 0x1b1b1f);
      const unlocked = SaveSystem.get().unlocked.includes(String(i));
      const t = this.add.text(cx, cy, unlocked ? emoji : '❓', { fontSize: '34px' }).setOrigin(0.5);
      if (!unlocked) t.setAlpha(0.5);
      this.grid[i] = t;
    });

    // Pull button (costs 50 coins) + watch-ad pull
    this.button(width / 2, height - 120, 'OPEN CAPSULE (50 🪙)', 0xffd23f, () => this.pull(false));
    this.button(width / 2, height - 62, 'FREE CAPSULE  ▶ (Ad)', 0x6fcf3f, () => {
      Ads.rewarded(() => this.pull(true));
    });

    // Back
    this.add.text(20, 50, '← Back', { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => { Audio.play('click'); this.scene.start('Home'); });
  }

  private pull(free: boolean) {
    const save = SaveSystem.get();
    if (!free) {
      if (save.coins < 50) { this.flash('Not enough coins'); return; }
      SaveSystem.addCoins(-50);
    }
    const locked = TILES.map((_, i) => String(i)).filter((id) => !save.unlocked.includes(id));
    if (locked.length === 0) { this.flash('All unlocked!'); this.refresh(); return; }
    const id = Phaser.Utils.Array.GetRandom(locked);
    SaveSystem.save({ unlocked: [...save.unlocked, id] });
    Audio.play('powerup');
    this.refresh();
    const idx = parseInt(id, 10);
    this.tweens.add({ targets: this.grid[idx], scale: { from: 0.2, to: 1 }, duration: 400, ease: 'Back.easeOut' });
  }

  private refresh() {
    const save = SaveSystem.get();
    this.coinText.setText(`🪙 ${save.coins}`);
    TILES.forEach((emoji, i) => {
      const unlocked = save.unlocked.includes(String(i));
      this.grid[i].setText(unlocked ? emoji : '❓').setAlpha(unlocked ? 1 : 0.5);
    });
  }

  private flash(msg: string) {
    const { width, height } = this.scale;
    const t = this.add.text(width / 2, height - 170, msg, {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#ff6b6b', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }

  private button(x: number, y: number, label: string, color: number, onClick: () => void) {
    const bg = this.add.rectangle(x, y, 260, 46, color).setStrokeStyle(4, 0x1b1b1f).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#1b1b1f' }).setOrigin(0.5);
    bg.on('pointerup', () => { Audio.play('click'); onClick(); });
  }
}
