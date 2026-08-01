import Phaser from 'phaser';
import { Ads } from '../systems/ads/AdsManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  async create() {
    // Kick off ads init early (safe: falls back to mock in browser).
    Ads.init().catch(() => {});
    this.scene.start('Preload');
  }
}
