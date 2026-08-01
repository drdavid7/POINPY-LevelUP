import { Capacitor } from '@capacitor/core';

type ImpactStyle = 'LIGHT' | 'MEDIUM' | 'HEAVY';

/**
 * Haptic feedback on native Android/iOS. No-op on web.
 */
export const Haptics = {
  async impact(style: ImpactStyle = 'LIGHT') {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const mod = await import('@capacitor/haptics');
      const capStyle =
        style === 'HEAVY' ? mod.ImpactStyle.Heavy
        : style === 'MEDIUM' ? mod.ImpactStyle.Medium
        : mod.ImpactStyle.Light;
      await mod.Haptics.impact({ style: capStyle });
    } catch {
      /* plugin unavailable */
    }
  },
};
