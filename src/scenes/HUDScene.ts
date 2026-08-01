import Phaser from 'phaser';
import { GAME } from '../config/GameConfig';
import type { RecipeItem } from '../types';
import { Audio } from '../systems/AudioManager';

interface HudData {
  hearts: number;
  maxHearts: number;
  coins: number;
  level: number;
  recipe: RecipeItem[];
  progress: number;
}

export class HUDScene extends Phaser.Scene {
  private hearts: Phaser.GameObjects.Image[] = [];
  private coinText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private barFill!: Phaser.GameObjects.Rectangle;
  private barW = 300;
  private recipeContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('HUD');
  }

  create() {
    const { width, height } = this.scale;

    // Hearts (top-left) — up to maxHearts + 2 upgrade slots
    for (let i = 0; i < GAME.maxHearts + 2; i++) {
      const h = this.add.image(40 + i * 34, 40, 'heart').setScrollFactor(0);
      this.hearts.push(h);
    }

    // Pause button (top-left corner, above hearts)
    const pause = this.add
      .text(20, 78, '❚❚', { fontSize: '22px', color: '#ffffff' })
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    pause.on('pointerup', () => {
      Audio.play('click');
      this.game.events.emit('pauseToggle');
    });

    // Coins (top-right)
    this.add.image(width - 74, 40, 'coin').setScrollFactor(0);
    this.coinText = this.add
      .text(width - 56, 40, '0', { fontFamily: 'sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#ffffff', stroke: '#1b1b1f', strokeThickness: 4 })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    this.comboText = this.add
      .text(width - 56, 68, '', { fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#ffd23f', stroke: '#1b1b1f', strokeThickness: 3 })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    // Recipe "thought bubble" (top center)
    this.recipeContainer = this.add.container(width / 2, 96).setScrollFactor(0);

    // Bottom: Gourmet Level + progress bar
    this.add
      .text(width / 2, height - 70, 'GOURMET LEVEL', { fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffffff', stroke: '#1b1b1f', strokeThickness: 3 })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.levelText = this.add
      .text(width / 2, height - 48, '1', { fontFamily: 'sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#ffffff', stroke: '#1b1b1f', strokeThickness: 4 })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.add.rectangle(width / 2, height - 22, this.barW + 6, 20, 0x1b1b1f).setScrollFactor(0);
    this.add.rectangle(width / 2, height - 22, this.barW, 14, GAME.colors.barBack).setScrollFactor(0);
    this.barFill = this.add
      .rectangle(width / 2 - this.barW / 2, height - 22, 0, 14, GAME.colors.barFill)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    // Listen for updates
    this.game.events.on('hud:update', this.onUpdate, this);
    this.game.events.on('hud:combo', this.onCombo, this);
    this.game.events.on('banner', this.showBanner, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('hud:update', this.onUpdate, this);
      this.game.events.off('hud:combo', this.onCombo, this);
      this.game.events.off('banner', this.showBanner, this);
    });
  }

  private onCombo(d: { count: number; mult: number }) {
    if (d.count < 2) {
      this.tweens.add({ targets: this.comboText, alpha: 0, duration: 200 });
      return;
    }
    this.comboText.setText(`x${d.mult} COMBO (${d.count})`).setAlpha(1);
    this.tweens.add({ targets: this.comboText, scale: 1.2, duration: 100, yoyo: true });
  }

  private onUpdate(d: HudData) {
    this.hearts.forEach((h, i) => h.setVisible(i < d.maxHearts && i < d.hearts));
    this.coinText.setText(`${d.coins}`);
    this.levelText.setText(`${d.level}`);
    this.barFill.width = this.barW * Phaser.Math.Clamp(d.progress, 0, 1);
    this.barFill.fillColor = d.progress >= 1 ? GAME.colors.barFillHi : GAME.colors.barFill;
    this.renderRecipe(d.recipe);
  }

  private renderRecipe(items: RecipeItem[]) {
    this.recipeContainer.removeAll(true);
    // bubble background
    const bw = items.length * 62 + 20;
    const bg = this.add.rectangle(0, 0, bw, 54, 0xffffff, 0.92).setStrokeStyle(4, 0x1b1b1f);
    (bg as any).setRadius?.(16);
    this.recipeContainer.add(bg);
    const startX = -((items.length - 1) * 62) / 2;
    items.forEach((it, i) => {
      const icon = this.add.image(startX + i * 62 - 12, 0, `fruit_${it.fruit}`).setScale(0.8);
      const txt = this.add.text(startX + i * 62 + 12, 0, `${it.got}/${it.count}`, {
        fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold',
        color: it.got >= it.count ? '#2e7d32' : '#1b1b1f',
      }).setOrigin(0, 0.5);
      this.recipeContainer.add(icon);
      this.recipeContainer.add(txt);
    });
  }

  private showBanner(text: string) {
    const { width, height } = this.scale;
    const t = this.add
      .text(width / 2, height * 0.4, text, {
        fontFamily: 'Arial Black, sans-serif', fontSize: '34px', fontStyle: 'bold',
        color: '#ffd23f', stroke: '#1b1b1f', strokeThickness: 8, align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setScale(0.5);
    this.tweens.add({ targets: t, scale: 1, duration: 250, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 400, onComplete: () => t.destroy() });
  }
}
