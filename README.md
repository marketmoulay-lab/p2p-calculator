# Moulay Trading — P2P Calculator (Mobile)

React + Vite + Capacitor scaffold for the P2P profit calculator, packaged as an Android/iOS app.
Same stack pattern as the NEXA apps (Next.js/Capacitor), but using Vite since this is a single-page tool with no server-side routes.

## 1. Install dependencies

```bash
npm install
```

## 2. Run locally in the browser (fast iteration)

```bash
npm run dev
```

## 3. Build the web bundle

```bash
npm run build
```

This outputs to `dist/`, which Capacitor will wrap into the native app.

## 4. Add native platforms (first time only)

```bash
npx cap init   # if not already initialized — app name / id are already set in capacitor.config.ts
npx cap add android
npx cap add ios   # requires macOS + Xcode
```

## 5. Sync and open in native IDE

```bash
npm run android   # syncs dist/ into android/ and opens Android Studio
npm run ios        # syncs dist/ into ios/ and opens Xcode (macOS only)
```

From Android Studio / Xcode you can run on an emulator/device or build a signed release for the Play Store / App Store.

## Notes

- Data persistence uses `localStorage` inside the WebView — each user's inputs stay on their own device, nothing is sent to a server. This matches the Privacy Policy text in the app's "Legal" tab.
- The Google Fonts `@import` in `App.jsx` requires the device to have internet access on first load. If you want the app to work fully offline, download the three font files (IBM Plex Sans Arabic, IBM Plex Mono, Space Grotesk) and bundle them locally instead — happy to set that up if needed.
- App id is `com.moulaytrading.p2pcalculator` — change it in `capacitor.config.ts` before your first `cap add` if you'd prefer something else, since it's hard to change after publishing.
- Icons/splash screens aren't set up yet. Use `npx @capacitor/assets generate` once you have a logo, or I can help design one.

## Monetization: AdSense vs AdMob — important distinction

The `AdSlot` component in `App.jsx` is wired for **Google AdSense**, which only serves ads on a **verified website domain** — not inside a packaged native app.

- **If you deploy this as a web page** (e.g. embedded as a tool page on moulaytrading.fit, or its own subdomain), AdSense works as-is: uncomment the script tag in `index.html`, replace `ca-pub-XXXXXXXXXXXXXXXX` with your existing approved publisher ID, and swap the placeholder slot IDs in `App.jsx` (`1111111111`, `2222222222`) with real ad unit IDs from your AdSense dashboard.
- **If you package this as an Android/iOS app via Capacitor**, AdSense will not serve ads inside the WebView. For monetizing the packaged app, use **Google AdMob** instead (same Google Ads account infrastructure, but built for native/in-app placements — banner, interstitial, rewarded). This needs the `@capacitor-community/admob` plugin and a separate AdMob app ID; happy to wire that up if you go this route.

Practically: the web version is the faster path to AdSense revenue since your AdSense account is already approved. The native app is better suited to AdMob, or to driving traffic/brand toward your web properties instead of carrying ads itself.

