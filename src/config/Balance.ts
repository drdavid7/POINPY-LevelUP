import Phaser from 'phaser';
import type { BiomeDef, FruitType, UpgradeState } from '../types';

export const BIOMES: BiomeDef[] = [
  {
    key: 'grass',
    name: 'Grassland',
    bg: 0x8fe34a,
    bgAccent: 0xc7f36b,
    wall: 0x1b1b1f,
    fruits: ['apple', 'blueberry', 'lemon'],
    minLevel: 1,
  },
  {
    key: 'sky',
    name: 'Sky',
    bg: 0x5aa0f2,
    bgAccent: 0x8fc0ff,
    wall: 0x1b1b1f,
    fruits: ['watermelon', 'grapes', 'cherry', 'banana'],
    minLevel: 6,
  },
  {
    key: 'cave',
    name: 'Cave',
    bg: 0xe0466f,
    bgAccent: 0x7d5aa0,
    wall: 0x1b1b1f,
    fruits: ['apple', 'cherry', 'grapes', 'watermelon'],
    minLevel: 12,
  },
];

export function biomeForLevel(level: number): BiomeDef {
  let chosen = BIOMES[0];
  for (const b of BIOMES) if (level >= b.minLevel) chosen = b;
  return chosen;
}

/** Death-line rise speed grows with level. */
export function beastSpeed(level: number, base: number, perLevel: number): number {
  return base + (level - 1) * perLevel;
}

/** Recipe size grows slowly with level. */
export function recipeForLevel(level: number): { fruit: FruitType; count: number }[] {
  const biome = biomeForLevel(level);
  const kinds = Phaser.Math.Clamp(1 + Math.floor(level / 3), 1, 3);
  const pool = Phaser.Utils.Array.Shuffle([...biome.fruits]).slice(0, kinds);
  return pool.map((fruit) => ({
    fruit,
    count: Phaser.Math.Between(2, 2 + Math.floor(level / 2)),
  }));
}

/** Points/coins awarded per fruit. */
export const FRUIT_POINTS = 1;

/** Coin multiplier for fruit-pickup streaks. */
export function comboMultiplier(streak: number, max = 4): number {
  if (streak >= 8) return Math.min(4, max);
  if (streak >= 5) return Math.min(3, max);
  if (streak >= 2) return Math.min(2, max);
  return 1;
}

/** Every 10th Gourmet Level is a checkpoint beat. */
export function isCheckpointLevel(level: number): boolean {
  return level > 0 && level % 10 === 0;
}

export interface UpgradeDef {
  id: keyof UpgradeState;
  label: string;
  description: string;
  costs: number[];
  maxLevel: number;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'extraHeart',
    label: 'Extra Heart',
    description: '+1 starting heart per level',
    costs: [80, 200, 450],
    maxLevel: 2,
  },
  {
    id: 'recipeTolerance',
    label: 'Recipe Tolerance',
    description: 'More fruits count toward the recipe',
    costs: [100, 250, 500],
    maxLevel: 2,
  },
  {
    id: 'headStart',
    label: 'Head Start',
    description: 'Beast starts further below you',
    costs: [90, 220, 480],
    maxLevel: 2,
  },
];

/** Enemy density scales with level. */
export function enemyChance(level: number): number {
  return Phaser.Math.Clamp(0.08 + level * 0.02, 0.08, 0.45);
}

/**
 * Which enemy archetype spawns next, weighted by level so the run keeps
 * introducing new threats instead of repeating the same dodge:
 *  - ghosts throughout (gentle, teaches the dodge)
 *  - spikers unlock at level 4 (stationary route-around hazard)
 *  - bats unlock at level 8 (fast erratic threat)
 */
export function enemyKindForLevel(level: number): 'ghost' | 'spiker' | 'bat' {
  const weights: { kind: 'ghost' | 'spiker' | 'bat'; w: number }[] = [
    { kind: 'ghost', w: 1 },
  ];
  if (level >= 4) weights.push({ kind: 'spiker', w: 0.3 + Math.min(0.5, level * 0.03) });
  if (level >= 8) weights.push({ kind: 'bat', w: 0.2 + Math.min(0.6, (level - 8) * 0.04) });

  const total = weights.reduce((s, e) => s + e.w, 0);
  let r = Phaser.Math.FloatBetween(0, total);
  for (const e of weights) {
    if (r < e.w) return e.kind;
    r -= e.w;
  }
  return 'ghost';
}
