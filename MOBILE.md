# TutorHQ Mobile App (iOS + Android)

TutorHQ is now wrapped with **Capacitor** — it can ship as a real native app on the App Store and Google Play.

The app is configured to **load your live site** (`tutordesk-eight.vercel.app`), so every web change you deploy shows up in the mobile app instantly — no rebuilding the app for normal updates. 🎉

---

## The free, instant option (no accounts, no build tools)

Before going through app stores, remember: **TutorHQ is already installable as an app right now.**

- **iPhone:** open the site in Safari → Share → **Add to Home Screen**
- **Android:** open in Chrome → menu → **Install app**
- **Desktop:** Chrome address bar → install icon

This gives a real app icon, full-screen, offline-friendly — for $0, today. Most small businesses never need more than this.

---

## Going to the actual App Stores

This requires developer accounts (one-time/annual fees set by Apple/Google, not by TutorHQ) and build tools on your Mac.

### Android (cheaper, easier) — Google Play

**Costs:** $25 one-time Google Play Developer account.
**Needs:** [Android Studio](https://developer.android.com/studio) (free).

```bash
cd /Users/shreymahida/claudecode/tutor-app
npx cap open android      # opens Android Studio
```
In Android Studio: Build → Generate Signed Bundle/APK → follow the wizard → upload the `.aab` to [Play Console](https://play.google.com/console).

### iOS — Apple App Store

**Costs:** $99/year Apple Developer Program.
**Needs:** a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) (free) + CocoaPods (`sudo gem install cocoapods`).

```bash
cd /Users/shreymahida/claudecode/tutor-app
npx cap open ios          # opens Xcode
```
In Xcode: set your Team (Apple Developer account) under Signing & Capabilities → Product → Archive → distribute to App Store Connect.

---

## Useful commands

```bash
npx cap sync         # after changing capacitor.config.json or adding plugins
npx cap open ios     # open the iOS project in Xcode
npx cap open android # open the Android project in Android Studio
```

You normally **don't** need to rebuild the apps when you change the website — they load the live URL. Only re-sync/rebuild when you change native config, the app icon, or plugins.

---

## App icon & splash

To set a custom icon, drop a 1024×1024 PNG and run:
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```
This generates all icon/splash sizes for both platforms from one image.
