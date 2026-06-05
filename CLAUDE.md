# WeatherMind RN — CLAUDE.md

> Claude Code üçün layihə qaydaları.

---

## Obsidian Wiki

**Vault:** `C:\Users\user\Downloads\HAVA ASİSTANTI beyin\WeatherMind-RN-Docs\`

Sessiya başında oxu: `AGENTS.md` → `arxitektura.md` → `gozleyen.md`

---

## Layihə Yolu

```
C:\Users\user\Desktop\WeatherMind-RN\
```

**Veb layihəsi:** `C:\Users\user\Desktop\hava asistanı\weathermind\`
**Eyni Supabase DB** — istifadəçi bazası paylaşılır

---

## Stack

```
Expo SDK 56 (managed workflow)
React Native 0.85 + TypeScript
React Navigation v7 (bottom tabs + native stack)
Supabase Auth (SecureStore adapter)
AsyncStorage (offline cache)
EAS Build (APK + IPA)
```

---

## Qovluq Strukturu

```
src/
├── screens/         — Auth, Home, Forecast, AIAdvice, AIChat, Profile, Premium, Splash
├── navigation/      — RootNavigator (Splash → Auth | MainStack → MainTabs + Premium modal)
├── context/         — AppContext (auth, weather, lang, unit, savedCities, offline)
├── lib/
│   ├── supabase.ts  — Supabase client (SecureStore/localStorage adapter)
│   ├── api.ts       — Backend API helpers
│   ├── config.ts    — URL-lər, keys (Constants.expoConfig işləmədiyindən hardcoded)
│   ├── cache.ts     — AsyncStorage offline cache (30 dəq TTL)
│   └── notifications.ts — Expo Notifications
└── theme/
    └── colors.ts    — Rəng palitrasını
```

---

## Kritik Qaydalar

1. **Config** — `src/lib/config.ts`-dədir; `app.json extra` vebdə undefined qaytarır
2. **SecureStore** — yalnız native; vebdə `localStorage` fallback
3. **Offline cache** — `Cache.saveWeather` / `Cache.loadWeather` — 30 dəq TTL
4. **Google OAuth** — `expo-web-browser` + `makeRedirectUri(scheme:"havai")`
5. **Navigation** — `MainStack > MainTabs + Premium (modal slide_from_bottom)`

---

## Build

```bash
npx expo start                                    # dev server
npx eas build -p android --profile preview        # Android APK
npx eas build -p ios     --profile preview        # iOS IPA
npx eas build            --profile production     # Production
```
