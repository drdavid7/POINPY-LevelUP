import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config for wrapping the HTML5 game as an Android app (Google Play).
 * Real ads (AdMob + mediation: Meta Audience Network, Unity Ads, ironSource)
 * only run inside this native build.
 *
 * Setup (later, when publishing):
 *   npm install @capacitor/core @capacitor/cli @capacitor/android
 *   npm install @capacitor-community/admob
 *   npm run build && npx cap add android && npx cap copy
 *   -> configure AdMob App ID + mediation adapters in android/ (see ADS_SETUP.md)
 */
const config: CapacitorConfig = {
  appId: 'com.example.juicyclimber',
  appName: 'Juicy Climber',
  webDir: 'dist',
  backgroundColor: '#14171a',
  android: {
    allowMixedContent: false,
  },
};

export default config;
