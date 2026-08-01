import type { AdsProvider } from '../../types';
import { MockAds } from './MockAds';
import { AdMobAds } from './AdMobAds';

/**
 * Chooses the right ad provider automatically:
 *  - Native Android (Capacitor) -> AdMob mediation (AdMob + FAN + Unity + ironSource)
 *  - Browser / web             -> MockAds overlay for testing
 *
 * The rest of the game only talks to AdsManager, so switching providers or
 * adding a web-portal SDK later never touches gameplay code.
 */
function isNative(): boolean {
  const cap = (window as any).Capacitor;
  return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
}

class AdsManagerImpl {
  private provider: AdsProvider;
  private initialized = false;
  private lastInterstitial = 0;
  private interstitialMinGapMs = 90_000;

  constructor() {
    this.provider = isNative() ? new AdMobAds() : new MockAds();
  }

  async init() {
    if (this.initialized) return;
    await this.provider.init();
    this.initialized = true;
  }

  /** Opt-in rewarded ad (revive, double coins, free capsule). */
  rewarded(onReward: () => void, onFail?: () => void) {
    this.provider.showRewarded(onReward, onFail);
  }

  /** Interstitial with a frequency cap so it never annoys the player. */
  interstitial(onDone?: () => void) {
    const now = Date.now();
    if (now - this.lastInterstitial < this.interstitialMinGapMs) {
      onDone?.();
      return;
    }
    this.lastInterstitial = now;
    this.provider.showInterstitial(onDone);
  }

  banner(show: boolean) {
    if (show) this.provider.showBanner?.();
    else this.provider.hideBanner?.();
  }
}

export const Ads = new AdsManagerImpl();
