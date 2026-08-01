import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Audio } from '../systems/AudioManager';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#cfd3d6');

    // Unlock audio on first interaction (mobile requirement).
    this.input.once('pointerdown', () => Audio.unlock());

    // Side walls (dark) to echo the quarry look
    this.add.rectangle(0, height / 2, 24, height, 0x1b1b1f).setOrigin(0, 0.5);
    this.add.rectangle(width, height / 2, 24, height, 0x1b1b1f).setOrigin(1, 0.5);

    // Title logo (bubbly multi-color)
    this.drawLogo(width / 2, height * 0.28);

    // Sleeping beast
    const beast = this.add.image(width / 2, height * 0.7, 'beast').setScale(0.9);
    this.tweens.add({ targets: beast, y: beast.y - 8, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // RANK badge
    const save = SaveSystem.get();
    this.add
      .text(width / 2, height * 0.88, `RANK ${save.rank}`, {
        fontFamily: 'sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Coin counter (top-right)
    this.add.image(width - 70, 40, 'coin');
    this.add
      .text(width - 52, 40, `${save.coins}`, {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#1b1b1f',
      })
      .setOrigin(0, 0.5);

    // Tap to start
    const hint = this.add
      .text(width / 2, height * 0.5, 'TAP TO PLAY', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#1b1b1f',
        backgroundColor: '#ffd23f',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: hint, scale: 1.08, duration: 700, yoyo: true, repeat: -1 });

    // Collection button (bottom-left)
    const gachaX = 50, gachaY = height - 50;
    const gacha = this.add
      .text(gachaX, gachaY, '🎁', { fontSize: '34px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    gacha.on('pointerup', () => {
      Audio.play('click');
      this.scene.start('Collection');
    });

    // Shop
    const shopX = 110, shopY = height - 50;
    this.add.text(shopX, shopY, '🛒', { fontSize: '34px' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => { Audio.play('click'); this.scene.start('Shop'); });

    // Leaderboard
    const lbX = 170, lbY = height - 50;
    this.add.text(lbX, lbY, '🏆', { fontSize: '34px' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => { Audio.play('click'); this.scene.start('Leaderboard'); });

    // Settings
    const setX = width - 34, setY = 34;
    this.add.circle(setX, setY, 18, 0x1b1b1f, 0.85).setInteractive({ useHandCursor: true })
      .on('pointerup', () => { Audio.play('click'); this.scene.start('Settings'); });
    this.add.text(setX, setY, '⚙', { fontSize: '18px' }).setOrigin(0.5);

    // Help / how-to-play button (top-left)
    const helpX = 34, helpY = 34;
    const helpBg = this.add.circle(helpX, helpY, 18, 0x1b1b1f, 0.85).setInteractive({ useHandCursor: true });
    this.add
      .text(helpX, helpY, '?', { fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5);
    helpBg.on('pointerup', () => {
      Audio.play('click');
      this.openTutorial();
    });

    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const buttons = [
        [gachaX, gachaY], [shopX, shopY], [lbX, lbY],
        [helpX, helpY], [setX, setY],
      ];
      for (const [bx, by] of buttons) {
        if (Phaser.Math.Distance.Between(p.x, p.y, bx, by) < 40) return;
      }
      Audio.unlock();
      Audio.play('click');
      this.scene.start('Game');
    });

    // First-ever launch: show the guide automatically before anything else.
    if (!SaveSystem.get().seenTutorial) {
      this.openTutorial();
    }
  }

  private openTutorial() {
    this.scene.pause();
    this.scene.launch('HowToPlay', { returnTo: 'Home' });
  }

  private drawLogo(cx: number, cy: number) {
    const letters = 'POINPY'.split('');
    const colors = ['#6fcf3f', '#2f6bd6', '#ffd23f', '#e0466f', '#8e5bff', '#6fcf3f'];
    const spacing = 46;
    const startX = cx - ((letters.length - 1) * spacing) / 2;
    letters.forEach((ch, i) => {
      const t = this.add
        .text(startX + i * spacing, cy, ch, {
          fontFamily: 'Arial Black, sans-serif',
          fontSize: '52px',
          fontStyle: 'bold',
          color: colors[i],
          stroke: '#1b1b1f',
          strokeThickness: 8,
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: t,
        y: cy - 6,
        duration: 600 + i * 80,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }
}
