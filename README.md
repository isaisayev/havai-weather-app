<div align="center">

# 🌤️ HAVAİ — AI Weather Assistant

**A cross-platform mobile app that turns weather data into smart, personalized advice — powered by AI.**

Built with React Native, Expo & Supabase.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-54-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?logo=supabase&logoColor=white)

</div>

---

## 📱 About

HAVAİ is a production-grade weather app that goes beyond showing the forecast. It uses **AI** to give users personalized advice — what to wear, health warnings, and answers to natural-language questions through an in-app chat assistant.

Designed and built from scratch as a complete iOS + Android application.

## ✨ Features

- 🤖 **AI Weather Assistant** — chat and get personalized advice in natural language
- 🌍 **Real-time Forecasts** — accurate weather data with hourly & daily views
- 🗺️ **Interactive Weather Maps** — visual radar and conditions
- 🔐 **Authentication** — secure login with Supabase (Google OAuth supported)
- 💾 **Offline Support** — cached data works without a connection
- 🔔 **Push Notifications** — weather alerts and updates
- 🌐 **Multi-language** — full internationalization
- ⭐ **Premium Subscription** — monetization flow built in
- 🎨 **Animated UI** — smooth, modern interface with Lottie & Reanimated

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Language | TypeScript |
| Navigation | React Navigation v7 (tabs + native stack) |
| Backend / Auth | Supabase (PostgreSQL, Auth, SecureStore) |
| Styling | NativeWind (Tailwind CSS) |
| Animation | Reanimated, Lottie |
| Storage | AsyncStorage (offline cache) |
| Maps | react-native-maps |
| Build | EAS Build (App Store + Play Store) |

## 📸 Screenshots

> _Screenshots coming soon._

| Home | AI Chat | Forecast | Maps |
|------|---------|----------|------|
| _img_ | _img_ | _img_ | _img_ |

## 🏗️ Architecture

```
src/
├── screens/      Auth, Home, Forecast, AI Advice, AI Chat, Profile, Premium, Splash
├── navigation/   Root navigator (Splash → Auth | Main tabs + Premium modal)
├── context/      Global state (auth, weather, language, units, saved cities)
├── components/   Reusable UI (weather cards, maps, language picker)
├── lib/          Supabase client, API, cache, notifications, i18n
└── theme/        Color palette
```

## 🚀 Getting Started

```bash
# install dependencies
npm install

# start the dev server
npx expo start
```

## 👤 Author

**Isa Isayev** — React Native & Mobile Developer
Building cross-platform apps with AI integration.

---

<div align="center">
<sub>Built with ❤️ using React Native & Expo</sub>
</div>
