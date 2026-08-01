# Ads Setup — AdMob Mediation (AdMob + Meta/FAN + Unity + ironSource)

The game code talks to **one** ad interface (`src/systems/ads/AdsManager.ts`). It
auto-selects:

- **Browser / web** → `MockAds` (a simulated ad overlay for testing — no account needed)
- **Android app (Capacitor)** → `AdMobAds` → **AdMob Mediation**

You do **not** integrate Meta Audience Network, Unity Ads, and ironSource as
separate SDKs. You enable them as **mediation adapters** under AdMob. AdMob then
auto-picks the highest-paying network per ad request.

---

## 1. Accounts & IDs you need
1. **AdMob** account → create the app → get **App ID** + 3 ad unit IDs (rewarded, interstitial, banner).
2. **Meta Audience Network** → app + placements.
3. **Unity Ads (Unity Monetization)** → game IDs + placements.
4. **ironSource (LevelPlay)** → app key + instances.
5. In the **AdMob dashboard**, create **Mediation groups** for each ad format and add FAN, Unity, ironSource as networks (paste their placement IDs/keys). This is where mediation is actually configured.

## 2. Put your real IDs in the code
Edit `src/systems/ads/AdMobAds.ts` → `AD_UNITS` with your rewarded/interstitial/banner IDs.
Set `initializeForTesting: false` for production.

## 3. Add the native project
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor-community/admob
npm run build
npx cap add android
npx cap copy
```

## 4. AndroidManifest — AdMob App ID
In `android/app/src/main/AndroidManifest.xml`, inside `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

## 5. Gradle — mediation adapters
In `android/app/build.gradle` `dependencies { ... }`:
```gradle
// AdMob (via the plugin, usually auto)
implementation 'com.google.android.gms:play-services-ads:23.+'

// Meta Audience Network adapter
implementation 'com.google.ads.mediation:facebook:+'

// Unity Ads adapter
implementation 'com.google.ads.mediation:unity:+'

// ironSource adapter
implementation 'com.google.ads.mediation:ironsource:+'
```
Sync Gradle. Some adapters need extra repositories / manifest entries — follow each
adapter's current AdMob docs.

## 6. Consent & policy (required for Play)
- Integrate **Google UMP** (User Messaging Platform) for GDPR/consent.
- Handle **Android 13+ ad ID permission** (`com.google.android.gms.permission.AD_ID`).
- Add a **privacy policy** URL in the Play listing (mandatory when serving ads).

## 7. Test then publish
- Use **test ad unit IDs** (already in the code) + test devices first.
- Build a signed **AAB** in Android Studio (`npx cap open android`) and upload to Play Console.

> Prefer to also publish on a web game portal? Add a `CrazyGamesAds` / `PokiAds`
> class implementing the same `AdsProvider` interface and select it in
> `AdsManager` — gameplay code never changes.
