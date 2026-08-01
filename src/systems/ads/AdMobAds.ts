import type { AdsProvider } from '../../types';

/**
 * Real Android ads via Google AdMob with MEDIATION.
 *
 * This single provider serves AdMob PLUS Meta Audience Network (FAN),
 * Unity Ads, and ironSource — you do NOT wire those SDKs separately.
 * Instead you enable them as *mediation adapters* in the AdMob dashboard
 * and add their Gradle dependencies (see ADS_SETUP.md). AdMob then picks
 * the best-paying network automatically for every ad request.
 *
 * This file is only used inside the Capacitor Android build. In the browser
 * the @capacitor-community/admob import is unavailable, so we lazy-import it
 * and fall back gracefully.
 *
 * To activate: `npm install @capacitor-community/admob` and replace the
 * placeholder ad unit IDs below with your real ones.
 */

// Replace with your real AdMob ad unit IDs before publishing.
const AD_UNITS = {
  // Google test IDs — safe during development, swap for production.
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  banner: 'ca-app-pub-3940256099942544/6300978111',
};

export class AdMobAds implements AdsProvider {
  private admob: any;
  private mod: any;
  private ready = false;

  /**
   * Loads the native plugin using a NON-literal specifier so the web bundler
   * (Vite/Rollup) never tries to resolve it. The package only exists inside
   * the Capacitor Android build.
   */
  private async loadModule(): Promise<any> {
    if (this.mod) return this.mod;
    const pkg = '@capacitor-community' + '/' + 'admob';
    this.mod = await import(/* @vite-ignore */ pkg);
    return this.mod;
  }

  async init(): Promise<void> {
    try {
      const mod = await this.loadModule();
      this.admob = mod.AdMob;
      await this.admob.initialize({
        initializeForTesting: true, // set false for production
      });
      this.ready = true;
    } catch (e) {
      console.warn('[AdMobAds] Native AdMob unavailable (browser?). Ads disabled.', e);
      this.ready = false;
    }
  }

  showRewarded(onReward: () => void, onFail?: () => void): void {
    if (!this.ready) { onFail?.(); return; }
    (async () => {
      try {
        const { RewardAdPluginEvents } = await this.loadModule();
        const handle = await this.admob.addListener(
          RewardAdPluginEvents.Rewarded,
          () => onReward(),
        );
        await this.admob.prepareRewardVideoAd({ adId: AD_UNITS.rewarded });
        await this.admob.showRewardVideoAd();
        handle.remove?.();
      } catch (e) {
        console.warn('[AdMobAds] rewarded failed', e);
        onFail?.();
      }
    })();
  }

  showInterstitial(onDone?: () => void): void {
    if (!this.ready) { onDone?.(); return; }
    (async () => {
      try {
        await this.admob.prepareInterstitial({ adId: AD_UNITS.interstitial });
        await this.admob.showInterstitial();
      } catch (e) {
        console.warn('[AdMobAds] interstitial failed', e);
      } finally {
        onDone?.();
      }
    })();
  }

  async showBanner(): Promise<void> {
    if (!this.ready) return;
    try {
      await this.admob.showBanner({
        adId: AD_UNITS.banner,
        position: 'BOTTOM_CENTER',
        margin: 0,
      });
    } catch (e) {
      console.warn('[AdMobAds] banner failed', e);
    }
  }

  async hideBanner(): Promise<void> {
    if (this.ready) try { await this.admob.hideBanner(); } catch { /* ignore */ }
  }
}
