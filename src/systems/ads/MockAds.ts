import type { AdsProvider } from '../../types';

/**
 * Browser-testing ad provider. Shows a simple overlay (see index.html),
 * waits a few seconds, then grants the reward. Lets you test the full
 * ad-driven flow (revive, double coins) without any real ad account.
 */
export class MockAds implements AdsProvider {
  private overlay = document.getElementById('ad-overlay') as HTMLDivElement | null;
  private timerEl = document.getElementById('ad-timer') as HTMLDivElement | null;
  private closeBtn = document.getElementById('ad-close') as HTMLButtonElement | null;

  async init(): Promise<void> {
    /* nothing to init for the mock */
  }

  private run(label: string, seconds: number, onDone: () => void, onFail?: () => void) {
    if (!this.overlay || !this.timerEl || !this.closeBtn) {
      // No overlay in DOM -> just grant instantly.
      onDone();
      return;
    }
    const box = this.overlay.querySelector('.ad-box') as HTMLDivElement;
    if (box) box.innerHTML = `${label}<br/>(sample ad)`;
    this.overlay.style.display = 'flex';
    this.closeBtn.disabled = true;
    let left = seconds;
    this.timerEl.textContent = `Reward in ${left}s...`;

    const tick = setInterval(() => {
      left -= 1;
      if (left > 0) {
        this.timerEl!.textContent = `Reward in ${left}s...`;
      } else {
        clearInterval(tick);
        this.timerEl!.textContent = 'Thanks for watching!';
        this.closeBtn!.disabled = false;
      }
    }, 1000);

    const close = () => {
      this.overlay!.style.display = 'none';
      this.closeBtn!.removeEventListener('click', close);
      if (left <= 0) onDone();
      else onFail?.();
    };
    this.closeBtn.addEventListener('click', close);
  }

  showRewarded(onReward: () => void, onFail?: () => void): void {
    this.run('REWARDED', 3, onReward, onFail);
  }

  showInterstitial(onDone?: () => void): void {
    this.run('INTERSTITIAL', 2, () => onDone?.(), () => onDone?.());
  }
}
