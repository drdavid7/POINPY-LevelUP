import type { FruitType, RecipeItem } from '../types';
import { biomeForLevel, recipeForLevel } from '../config/Balance';

/**
 * Manages the "gourmet recipe" the beast wants and the level-up flow.
 * Feed the correct fruit to advance; complete the recipe to level up.
 */
export class RecipeSystem {
  public level = 1;
  public items: RecipeItem[] = [];
  private tolerance = 0;

  constructor(tolerance = 0) {
    this.tolerance = tolerance;
    this.newRecipe();
  }

  newRecipe() {
    this.items = recipeForLevel(this.level).map((r) => ({ ...r, got: 0 }));
  }

  /** Returns 'match' | 'wrong' | 'complete'. */
  feed(fruit: FruitType): 'match' | 'wrong' | 'complete' {
    const exact = this.items.find((i) => i.fruit === fruit && i.got < i.count);
    if (exact) {
      exact.got += 1;
      return this.isComplete() ? 'complete' : 'match';
    }

    if (this.tolerance > 0) {
      const biomeFruits = biomeForLevel(this.level).fruits;
      const inBiome = biomeFruits.includes(fruit);
      const loose = this.items.find((i) => i.got < i.count);
      if (loose && (this.tolerance >= 2 || (this.tolerance >= 1 && inBiome))) {
        loose.got += 1;
        return this.isComplete() ? 'complete' : 'match';
      }
    }

    return 'wrong';
  }

  isComplete() {
    return this.items.every((i) => i.got >= i.count);
  }

  levelUp() {
    this.level += 1;
    this.newRecipe();
  }

  /** 0..1 completion for the progress bar. */
  progress(): number {
    const total = this.items.reduce((s, i) => s + i.count, 0);
    const got = this.items.reduce((s, i) => s + i.got, 0);
    return total === 0 ? 0 : got / total;
  }
}
