export type FruitType =
  | 'apple'
  | 'blueberry'
  | 'grapes'
  | 'lemon'
  | 'watermelon'
  | 'cherry'
  | 'banana';

export interface BiomeDef {
  key: string;
  name: string;
  bg: number;        // background color
  bgAccent: number;  // decorative accent color
  wall: number;      // side wall color
  fruits: FruitType[];
  minLevel: number;  // gourmet level this biome starts at
}

export interface RecipeItem {
  fruit: FruitType;
  count: number;
  got: number;
}

export interface UpgradeState {
  extraHeart: number;
  recipeTolerance: number;
  headStart: number;
}

export interface RunRecord {
  level: number;
  coins: number;
  date: number;
}

export interface SaveData {
  coins: number;
  rank: number;
  xp: number;
  bestLevel: number;
  deaths: number;
  unlocked: string[];
  settings: { sfx: boolean; music: boolean };
  seenTutorial: boolean;
  upgrades: UpgradeState;
  runHistory: RunRecord[];
}

export interface AdsProvider {
  init(): Promise<void>;
  showRewarded(onReward: () => void, onFail?: () => void): void;
  showInterstitial(onDone?: () => void): void;
  showBanner?(): void;
  hideBanner?(): void;
}
