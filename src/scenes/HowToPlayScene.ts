import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Audio } from '../systems/AudioManager';

interface HowToPlayData {
  /** Which scene key to resume once the player dismisses the guide. */
  returnTo: string;
}

/**
 * First-run (and reopenable via the "?" button) how-to-play guide.
 * Launched on top of another scene; that scene is paused for the duration
 * so its own input handlers can't fire underneath this overlay.
 */
export class HowToPlayScene extends Phaser.Scene {
  private returnTo = 'Home';
  private page = 0;
  private pageContainer!: Phaser.GameObjects.Container;
  private dots: Phaser.GameObjects.Arc[] = [];

  private readonly pages = [
    {
      title: 'SLINGSHOT TO CLIMB',
      body: 'Press & drag anywhere, then release.\nYou launch OPPOSITE the drag — like\na catapult. Bounce off the side walls\nto climb higher and higher.',
      icon: 'player',
    },
    {
      title: 'COOK THE RECIPE',
      body: 'Collect the fruit shown in the bubble\nat the top to fill your Gourmet Level\nbar. Complete it to level up and push\nthe danger back down.',
      icon: 'fruit_apple',
    },
    {
      title: 'WATCH YOUR HEARTS',
      body: 'Enemies and the rising beast below\ncost you a heart on contact. Ghosts\ndrift, spikers guard tight spots, bats\nmove fast — lose all hearts and it\'s\ngame over.',
      icon: 'heart',
    },
    {
      title: 'DON\'T GET CAUGHT',
      body: 'The blue beast below is the death\nline — it rises as you play. Fall\nbehind it and it\'s over... but you can\nrevive by watching a quick ad.',
      icon: 'beast',
    },
  ];

  constructor() {
    super('HowToPlay');
  }

  create(data: HowToPlayData) {
    this.returnTo = data?.returnTo ?? 'Home';
    this.page = 0;

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setDepth(0);

    const panel = this.add
      .rectangle(width / 2, height / 2, width * 0.86, height * 0.62, 0xffffff)
      .setStrokeStyle(6, 0x1b1b1f)
      .setDepth(1);
    (panel as any).setRadius?.(24);

    this.add
      .text(width / 2, height / 2 - height * 0.31 + 30, 'HOW TO PLAY', {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#e0466f',
        stroke: '#1b1b1f',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(1);

    this.pageContainer = this.add.container(width / 2, height / 2 - 10).setDepth(1);

    // Page dots
    const dotY = height / 2 + height * 0.24;
    const dotStartX = width / 2 - ((this.pages.length - 1) * 20) / 2;
    this.dots = this.pages.map((_, i) =>
      this.add.circle(dotStartX + i * 20, dotY, 5, 0xcccccc).setDepth(1),
    );

    // Nav buttons
    this.arrowButton(width / 2 - width * 0.34, height / 2, '‹', () => this.go(-1));
    this.arrowButton(width / 2 + width * 0.34, height / 2, '›', () => this.go(1));

    // Skip / Got it button
    this.ctaButton(width / 2, height / 2 + height * 0.24 + 42);

    this.renderPage();
  }

  private go(dir: number) {
    const next = this.page + dir;
    if (next < 0 || next >= this.pages.length) return;
    Audio.play('click');
    this.page = next;
    this.renderPage();
  }

  private renderPage() {
    this.pageContainer.removeAll(true);
    const p = this.pages[this.page];

    const icon = this.add.image(0, -60, p.icon).setScale(p.icon === 'beast' ? 0.35 : 1.3);
    this.pageContainer.add(icon);

    this.pageContainer.add(
      this.add
        .text(0, -8, p.title, {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#1b1b1f',
        })
        .setOrigin(0.5),
    );

    this.pageContainer.add(
      this.add
        .text(0, 60, p.body, {
          fontFamily: 'sans-serif',
          fontSize: '14px',
          color: '#3a3f47',
          align: 'center',
          lineSpacing: 6,
        })
        .setOrigin(0.5),
    );

    this.dots.forEach((d, i) =>
      d.setFillStyle(i === this.page ? 0xe0466f : 0xcccccc),
    );
  }

  private arrowButton(x: number, y: number, label: string, onClick: () => void) {
    const t = this.add
      .text(x, y, label, {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#9aa0a6',
      })
      .setOrigin(0.5)
      .setDepth(1)
      .setInteractive({ useHandCursor: true });
    t.on('pointerup', onClick);
    return t;
  }

  private ctaButton(x: number, y: number) {
    const w = 220;
    const h = 46;
    const bg = this.add
      .rectangle(x, y, w, h, 0xffd23f)
      .setStrokeStyle(4, 0x1b1b1f)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);
    (bg as any).setRadius?.(12);
    this.add
      .text(x, y, "GOT IT — LET'S GO", {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#1b1b1f',
      })
      .setOrigin(0.5)
      .setDepth(1);
    bg.on('pointerover', () => bg.setScale(1.04));
    bg.on('pointerout', () => bg.setScale(1));
    bg.on('pointerup', () => {
      Audio.play('click');
      this.close();
    });
  }

  private close() {
    SaveSystem.save({ seenTutorial: true });
    this.scene.stop();
    this.scene.resume(this.returnTo);
  }
}
