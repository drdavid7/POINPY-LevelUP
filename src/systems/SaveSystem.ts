import type { RunRecord, SaveData, UpgradeState } from '../types';
import { UPGRADES } from '../config/Balance';

const KEY = 'juicy-climber-save-v1';

const DEFAULT_UPGRADES: UpgradeState = {
  extraHeart: 0,
  recipeTolerance: 0,
  headStart: 0,
};

const DEFAULT: SaveData = {
  coins: 0,
  rank: 1,
  xp: 0,
  bestLevel: 1,
  deaths: 0,
  unlocked: [],
  settings: { sfx: true, music: true },
  seenTutorial: false,
  upgrades: { ...DEFAULT_UPGRADES },
  runHistory: [],
};

function mergeSave(raw: Partial<SaveData>): SaveData {
  return {
    ...DEFAULT,
    ...raw,
    settings: { ...DEFAULT.settings, ...raw.settings },
    upgrades: { ...DEFAULT_UPGRADES, ...raw.upgrades },
    runHistory: raw.runHistory ?? [],
    unlocked: raw.unlocked ?? [],
  };
}

let cache: SaveData | null = null;

export const SaveSystem = {
  get(): SaveData {
    if (cache) return cache;
    let data: SaveData;
    try {
      const raw = localStorage.getItem(KEY);
      data = raw ? mergeSave(JSON.parse(raw)) : { ...DEFAULT, upgrades: { ...DEFAULT_UPGRADES } };
    } catch {
      data = { ...DEFAULT, upgrades: { ...DEFAULT_UPGRADES } };
    }
    cache = data;
    return data;
  },

  save(patch: Partial<SaveData>): SaveData {
    const cur = this.get();
    const next = mergeSave({ ...cur, ...patch });
    cache = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable */
    }
    return next;
  },

  addCoins(n: number) {
    const s = this.get();
    return this.save({ coins: Math.max(0, s.coins + n) });
  },

  addXp(n: number) {
    const s = this.get();
    let { rank, xp } = s;
    xp += n;
    const need = () => 50 + rank * 25;
    while (xp >= need()) {
      xp -= need();
      rank += 1;
    }
    return this.save({ rank, xp });
  },

  addRun(entry: RunRecord) {
    const s = this.get();
    const runHistory = [...s.runHistory, entry]
      .sort((a, b) => b.level - a.level || b.coins - a.coins)
      .slice(0, 10);
    return this.save({ runHistory });
  },

  buyUpgrade(id: keyof UpgradeState): boolean {
    const s = this.get();
    const def = UPGRADES.find((u) => u.id === id);
    if (!def) return false;
    const level = s.upgrades[id];
    if (level >= def.maxLevel) return false;
    const cost = def.costs[level];
    if (s.coins < cost) return false;
    const upgrades = { ...s.upgrades, [id]: level + 1 };
    return !!this.save({ coins: s.coins - cost, upgrades });
  },

  reset() {
    cache = { ...DEFAULT, upgrades: { ...DEFAULT_UPGRADES } };
    this.save({});
  },
};
