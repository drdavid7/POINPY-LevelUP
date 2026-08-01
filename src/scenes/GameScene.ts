import Phaser from 'phaser';
import { GAME } from '../config/GameConfig';
import { biomeForLevel, beastSpeed, FRUIT_POINTS, comboMultiplier, isCheckpointLevel } from '../config/Balance';
import { Player } from '../objects/Player';
import { Beast } from '../objects/Beast';
import { Fruit } from '../objects/Fruit';
import { Enemy } from '../objects/Enemy';
import { PowerUp } from '../objects/PowerUp';
import { TrajectoryLine } from '../objects/TrajectoryLine';
import { InputController } from '../systems/InputController';
import { RecipeSystem } from '../systems/RecipeSystem';
import { Spawner } from '../systems/Spawner';
import { SaveSystem } from '../systems/SaveSystem';
import { Audio } from '../systems/AudioManager';
import { Haptics } from '../systems/Haptics';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private beast!: Beast;
  private input2!: InputController;
  private traj!: TrajectoryLine;
  private recipe!: RecipeSystem;
  private spawner!: Spawner;

  private fruits!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private powerups!: Phaser.Physics.Arcade.Group;

  private hearts: number = GAME.startHearts;
  private maxHearts: number = GAME.maxHearts;
  private coins = 0;
  private deathY = 0;
  private beastStartOffset: number = GAME.beastStartOffset;
  private aimVec = new Phaser.Math.Vector2();
  private aiming = false;
  private started = false;
  private gameover = false;
  private paused = false;

  private comboCount = 0;
  private comboExpiresAt = 0;

  private bg!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('Game');
  }

  create() {
    const { width, height } = this.scale;
    const upgrades = SaveSystem.get().upgrades;

    this.gameover = false;
    this.paused = false;
    this.started = false;
    this.comboCount = 0;
    this.comboExpiresAt = 0;

    this.maxHearts = GAME.maxHearts + upgrades.extraHeart;
    this.hearts = GAME.startHearts + upgrades.extraHeart;
    this.coins = 0;
    this.beastStartOffset = GAME.beastStartOffset + upgrades.headStart * 80;

    const biome = biomeForLevel(1);
    this.bg = this.add.rectangle(width / 2, height / 2, width, height, biome.bg).setScrollFactor(0).setDepth(-10);

    const wallPad = 24;
    this.add.rectangle(0, height / 2, wallPad, height, biome.wall).setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);
    this.add.rectangle(width, height / 2, wallPad, height, biome.wall).setOrigin(1, 0.5).setScrollFactor(0).setDepth(20);

    this.physics.world.setBounds(wallPad + GAME.playerRadius, -1_000_000, width - 2 * (wallPad + GAME.playerRadius), 2_000_000);

    this.fruits = this.physics.add.group();
    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.powerups = this.physics.add.group();

    const startY = 0;
    this.player = new Player(this, width / 2, startY);

    const p0 = this.platforms.create(width / 2, startY + 50, 'platform') as Phaser.Physics.Arcade.Image;
    p0.setScale(1.4, 1).refreshBody();

    this.beast = new Beast(this);
    this.deathY = startY + this.beastStartOffset;

    this.cameras.main.setScroll(0, startY - height * 0.6);
    this.cameras.main.setBackgroundColor(biome.bg);

    this.traj = new TrajectoryLine(this);
    this.recipe = new RecipeSystem(upgrades.recipeTolerance);
    this.spawner = new Spawner(this, this.fruits, this.platforms, this.enemies, this.powerups, startY - 100);

    this.input2 = new InputController(this, (vx, vy) => this.doLaunch(vx, vy));
    this.events.on('aim', (v: Phaser.Math.Vector2) => { this.aiming = true; this.aimVec.copy(v); });
    this.events.on('aimEnd', () => { this.aiming = false; this.traj.hide(); });

    this.physics.add.overlap(this.player, this.fruits, this.onFruit, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.powerups, this.onPowerUp, undefined, this);
    this.physics.add.collider(this.player, this.platforms);

    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body, _up: boolean, _down: boolean, left: boolean, right: boolean) => {
      if (body.gameObject === this.player && (left || right)) {
        this.player.squash();
        Audio.play('bounce');
        Haptics.impact('LIGHT');
        this.burst(this.player.x, this.player.y, 6);
        if (GAME.combo.breakOnWallBounce && this.comboCount > 0) {
          this.comboCount = 0;
          this.game.events.emit('hud:combo', { count: 0, mult: 1 });
        }
      }
    });

    this.scene.launch('HUD');
    this.emitHud();
    this.game.events.emit('hud:combo', { count: 0, mult: 1 });
    this.game.events.emit('banner', 'READY');
    this.game.events.on('pauseToggle', this.togglePause, this);
    this.events.on('revive', this.revive, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('pauseToggle', this.togglePause, this);
    });
  }

  private doLaunch(vx: number, vy: number) {
    if (this.gameover || this.paused) return;
    this.started = true;
    this.player.launch(vx, vy);
    Audio.play('launch');
    this.burst(this.player.x, this.player.y, 4);
  }

  private onFruit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_p, obj) => {
    const fruit = obj as Fruit;
    if (!fruit.active) return;

    const now = this.time.now;
    if (now < this.comboExpiresAt) this.comboCount += 1;
    else this.comboCount = 1;
    this.comboExpiresAt = now + GAME.combo.windowMs;

    const mult = comboMultiplier(this.comboCount, GAME.combo.maxMultiplier);
    const res = this.recipe.feed(fruit.fruitType);
    const earned = FRUIT_POINTS * mult;
    this.coins += earned;

    Audio.play(res === 'wrong' ? 'coin' : 'collect', 1 + this.recipe.progress());
    this.popText(fruit.x, fruit.y, mult > 1 ? `+${earned} x${mult}` : `+${earned}`);
    this.burst(fruit.x, fruit.y, 8, 0xffffff);
    fruit.destroy();

    this.game.events.emit('hud:combo', { count: this.comboCount, mult });

    if (res === 'complete') this.levelUp();
    this.emitHud();
  };

  private onEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_p, obj) => {
    const enemy = obj as Enemy;
    if (this.player.isInvulnerable() || !enemy.active) return;
    this.hurt();
  };

  private onPowerUp: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_p, obj) => {
    const pu = obj as PowerUp;
    if (!pu.active) return;
    Audio.play('powerup');
    this.game.events.emit('banner', 'POWER UP!');
    if (pu.kind === 'shield') this.player.setInvulnerable(4000);
    if (pu.kind === 'magnet') this.magnetPull();
    if (pu.kind === 'slow') {
      this.time.timeScale = 0.5;
      this.physics.world.timeScale = 2;
      this.time.delayedCall(3000, () => { this.time.timeScale = 1; this.physics.world.timeScale = 1; });
    }
    pu.destroy();
  };

  private magnetPull() {
    this.fruits.getChildren().forEach((c) => {
      const f = c as Fruit;
      if (Phaser.Math.Distance.Between(f.x, f.y, this.player.x, this.player.y) < 240) {
        this.tweens.add({ targets: f, x: this.player.x, y: this.player.y, duration: 300 });
      }
    });
  }

  private levelUp() {
    this.recipe.levelUp();
    Audio.play('levelup');
    Haptics.impact('HEAVY');

    const checkpoint = isCheckpointLevel(this.recipe.level);
    if (checkpoint) {
      this.game.events.emit('banner', `CHECKPOINT!\nLEVEL ${this.recipe.level}`);
      this.coins += 25;
      this.deathY += 200;
      this.beast.setTint(0xffd23f);
      this.time.delayedCall(1500, () => this.beast.clearTint());
    } else {
      this.game.events.emit('banner', `GOURMET LEVEL ${this.recipe.level}!`);
      this.deathY += 120;
    }

    this.cameras.main.flash(200, 255, 255, 255);
    const biome = biomeForLevel(this.recipe.level);
    this.bg.fillColor = biome.bg;
    this.cameras.main.setBackgroundColor(biome.bg);
    this.emitHud();
  }

  private hurt() {
    if (this.player.isInvulnerable()) return;
    this.hearts -= 1;
    Audio.play('hurt');
    Haptics.impact('MEDIUM');
    this.cameras.main.shake(180, 0.012);
    this.player.setInvulnerable(GAME.invulnMs);
    this.emitHud();
    if (this.hearts <= 0) this.doGameOver();
  }

  private caught() {
    if (this.player.isInvulnerable()) return;
    this.beast.chomp();
    this.hearts -= 1;
    Audio.play('hurt');
    Haptics.impact('HEAVY');
    this.cameras.main.shake(220, 0.016);
    this.emitHud();
    if (this.hearts <= 0) {
      this.doGameOver();
      return;
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.player.setPosition(this.scale.width / 2, this.deathY - GAME.beastCatchLift);
    body.setVelocity(0, -300);
    this.deathY = this.player.y + this.beastStartOffset;
    this.player.setInvulnerable(GAME.invulnMs);
  }

  private doGameOver() {
    if (this.gameover) return;
    this.gameover = true;
    this.input2.setEnabled(false);
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const save = SaveSystem.get();
    SaveSystem.addCoins(this.coins);
    SaveSystem.addXp(this.recipe.level * 10);
    SaveSystem.addRun({ level: this.recipe.level, coins: this.coins, date: Date.now() });
    SaveSystem.save({
      deaths: save.deaths + 1,
      bestLevel: Math.max(save.bestLevel, this.recipe.level),
    });

    this.physics.world.pause();
    this.scene.launch('GameOver', {
      level: this.recipe.level,
      coins: this.coins,
    });
  }

  private revive() {
    this.gameover = false;
    this.hearts = Math.min(this.maxHearts, 2);
    this.physics.world.resume();
    this.input2.setEnabled(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.player.setPosition(this.scale.width / 2, this.cameras.main.scrollY + this.scale.height * 0.4);
    body.setVelocity(0, -200);
    this.deathY = this.player.y + this.beastStartOffset + 120;
    this.player.setInvulnerable(2000);
    this.emitHud();
    this.game.events.emit('banner', 'GO!');
  }

  private togglePause() {
    if (this.gameover) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.world.pause();
      this.input2.setEnabled(false);
      Audio.play('click');
      this.scene.launch('Pause');
    } else {
      this.physics.world.resume();
      this.input2.setEnabled(true);
      this.scene.stop('Pause');
    }
  }

  update(_time: number, delta: number) {
    if (this.gameover || this.paused) return;
    const dt = delta / 1000;
    const { width, height } = this.scale;

    if (this.comboCount > 0 && this.time.now > this.comboExpiresAt) {
      this.comboCount = 0;
      this.game.events.emit('hud:combo', { count: 0, mult: 1 });
    }

    if (this.aiming) {
      const leftWall = 24 + GAME.playerRadius;
      const rightWall = width - 24 - GAME.playerRadius;
      this.traj.draw(this.player.x, this.player.y, this.aimVec.x, this.aimVec.y, leftWall, rightWall);
    }

    const targetScroll = this.player.y - height * 0.6;
    const cam = this.cameras.main;
    if (targetScroll < cam.scrollY) {
      cam.scrollY = Phaser.Math.Linear(cam.scrollY, targetScroll, GAME.cameraLerp);
    }

    if (this.started) {
      this.deathY -= beastSpeed(this.recipe.level, GAME.beastBaseSpeed, GAME.beastSpeedPerLevel) * dt;
      const maxGap = height * 0.95;
      if (this.deathY > this.player.y + maxGap) this.deathY = this.player.y + maxGap;
    }
    this.beast.positionAt(cam, this.deathY);

    if (this.started && this.player.y > this.deathY) this.caught();

    this.spawner.update(cam.scrollY, this.recipe.level, this.recipe.items);
    this.cull(cam.scrollY + height + 200);
  }

  private cull(belowY: number) {
    const kill = (group: Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup) => {
      group.getChildren().slice().forEach((c) => {
        const go = c as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject;
        if ((go as any).y > belowY) go.destroy();
      });
    };
    kill(this.fruits);
    kill(this.enemies);
    kill(this.powerups);
    kill(this.platforms);
  }

  private emitHud() {
    this.game.events.emit('hud:update', {
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      coins: this.coins,
      level: this.recipe.level,
      recipe: this.recipe.items,
      progress: this.recipe.progress(),
    });
  }

  private burst(x: number, y: number, count: number, tint = 0xffe14d) {
    const p = this.add.particles(x, y, 'spark', {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: count,
      tint,
      emitting: false,
    });
    p.setDepth(60);
    p.explode(count);
    this.time.delayedCall(500, () => p.destroy());
  }

  private popText(x: number, y: number, str: string) {
    const t = this.add.text(x, y, str, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#1b1b1f',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(61);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() });
  }
}
