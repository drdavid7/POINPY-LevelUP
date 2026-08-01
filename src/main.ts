import Phaser from 'phaser';
import { GAME } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { HomeScene } from './scenes/HomeScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { GameOverScene } from './scenes/GameOverScene';
import { CollectionScene } from './scenes/CollectionScene';
import { PauseScene } from './scenes/PauseScene';
import { HowToPlayScene } from './scenes/HowToPlayScene';
import { ShopScene } from './scenes/ShopScene';
import { SettingsScene } from './scenes/SettingsScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.width,
  height: GAME.height,
  backgroundColor: '#14171a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME.width,
    height: GAME.height,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GAME.gravityY },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    HomeScene,
    GameScene,
    HUDScene,
    GameOverScene,
    CollectionScene,
    PauseScene,
    HowToPlayScene,
    ShopScene,
    SettingsScene,
    LeaderboardScene,
  ],
};

new Phaser.Game(config);
