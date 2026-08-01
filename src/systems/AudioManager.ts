import { SaveSystem } from './SaveSystem';

/**
 * Lightweight synthesized SFX using the WebAudio API — no audio files needed.
 * Swap this out for real music/sfx assets later (Phaser sound or Howler).
 */
type SfxName =
  | 'launch'
  | 'bounce'
  | 'collect'
  | 'levelup'
  | 'hurt'
  | 'coin'
  | 'click'
  | 'powerup';

export class AudioManager {
  private ctx?: AudioContext;
  private master?: GainNode;
  private unlocked = false;

  private ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
  }

  /** Must be called from a user gesture on mobile browsers. */
  unlock() {
    this.ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    this.unlocked = true;
  }

  private beep(freq: number, dur: number, type: OscillatorType, vol = 1, slideTo?: number) {
    if (!SaveSystem.get().settings.sfx) return;
    this.ensure();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  play(name: SfxName, pitch = 1) {
    if (!this.unlocked) return;
    switch (name) {
      case 'launch':  this.beep(220 * pitch, 0.18, 'sawtooth', 0.6, 520 * pitch); break;
      case 'bounce':  this.beep(420 * pitch, 0.09, 'square', 0.5, 300 * pitch); break;
      case 'collect': this.beep(600 * pitch, 0.10, 'triangle', 0.7, 900 * pitch); break;
      case 'coin':    this.beep(880 * pitch, 0.08, 'square', 0.5, 1200 * pitch); break;
      case 'levelup': this.beep(523, 0.15, 'triangle', 0.7, 1046); break;
      case 'powerup': this.beep(700, 0.2, 'sine', 0.7, 1400); break;
      case 'hurt':    this.beep(200, 0.25, 'sawtooth', 0.6, 80); break;
      case 'click':   this.beep(500, 0.05, 'square', 0.4); break;
    }
  }

  duck() { if (this.master) this.master.gain.value = 0.05; }
  unduck() { if (this.master) this.master.gain.value = 0.35; }
}

export const Audio = new AudioManager();
