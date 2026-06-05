import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   false,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

export interface NotifPrefs {
  enabled:          boolean;
  morning_forecast: boolean;
  morning_time:     string;   // "HH:MM"
  rain_alert:       boolean;
  storm_alert:      boolean;
  extreme_temp:     boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  enabled:          false,
  morning_forecast: true,
  morning_time:     "08:00",
  rain_alert:       true,
  storm_alert:      true,
  extreme_temp:     true,
};

const PREFS_KEY     = "havai_notif_prefs";
const ALERT_KEY     = "havai_notif_last_alert";
const MORNING_ID    = "havai_morning_forecast";
const HISTORY_KEY   = "havai_notif_history";
const MAX_HISTORY   = 20;

export interface NotifItem {
  id:    string;
  title: string;
  body:  string;
  time:  number;  // timestamp
  read:  boolean;
}

export async function loadNotifHistory(): Promise<NotifItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addNotifToHistory(title: string, body: string): Promise<void> {
  try {
    const list = await loadNotifHistory();
    const item: NotifItem = { id: Date.now().toString(), title, body, time: Date.now(), read: false };
    const updated = [item, ...list].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function deleteNotif(id: string): Promise<void> {
  try {
    const list = await loadNotifHistory();
    const updated = list.filter(n => n.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearNotifHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export async function markAllNotifsRead(): Promise<void> {
  try {
    const list = await loadNotifHistory();
    const updated = list.map(n => ({ ...n, read: true }));
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function getUnreadCount(): Promise<number> {
  const list = await loadNotifHistory();
  return list.filter(n => !n.read).length;
}

export async function loadNotifPrefs(): Promise<NotifPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}

export async function saveNotifPrefs(prefs: NotifPrefs): Promise<void> {
  try { await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Səhər proqnozunu planlaşdır (gündəlik)
export async function scheduleMorningForecast(
  city: string,
  temp: number,
  desc: string,
  timeStr: string,  // "HH:MM"
  az: boolean
) {
  // Əvvəlki səhər bildirişini ləğv et
  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(() => {});

  const [h, m] = timeStr.split(":").map(Number);
  const title = az ? "☀️ Günün hava proqnozu" : "☀️ Today's weather";
  const body  = az
    ? `${city}: ${Math.round(temp)}°C, ${desc}. İyi günlər!`
    : `${city}: ${Math.round(temp)}°C, ${desc}. Have a great day!`;

  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_ID,
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: h,
      minute: m,
    },
  });
}

export async function cancelMorningForecast() {
  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(() => {});
}

// Hava şərtlərini yoxla və lazım olsa anlıq bildiriş göndər
// Eyni növ bildiriş bir saatda bir dəfədən çox gönderilmir
export async function checkWeatherAlerts(
  weather: any,
  prefs: NotifPrefs,
  az: boolean
) {
  if (!prefs.enabled) return;
  const cur = weather?.current;
  if (!cur) return;

  const now      = Date.now();
  const cooldown = 60 * 60 * 1000; // 1 saat

  // Son göndərilən vaxtları yoxla
  let lastAlerts: Record<string, number> = {};
  try {
    const raw = await AsyncStorage.getItem(ALERT_KEY);
    if (raw) lastAlerts = JSON.parse(raw);
  } catch {}

  const alerts: { tag: string; title: string; body: string }[] = [];

  // Yağış xəbərdarlığı
  if (prefs.rain_alert && (cur.condition === "rainy" || cur.condition === "drizzle")) {
    if (!lastAlerts["rain"] || now - lastAlerts["rain"] > cooldown) {
      alerts.push({
        tag:   "rain",
        title: az ? "🌧️ Yağış xəbərdarlığı" : "🌧️ Rain alert",
        body:  az ? `${cur.city}: ${cur.description}. Çətir götürün!`
                  : `${cur.city}: ${cur.description}. Take an umbrella!`,
      });
    }
  }

  // Fırtına xəbərdarlığı
  if (prefs.storm_alert && cur.condition === "stormy") {
    if (!lastAlerts["storm"] || now - lastAlerts["storm"] > cooldown) {
      alerts.push({
        tag:   "storm",
        title: az ? "⛈️ Fırtına xəbərdarlığı" : "⛈️ Storm warning",
        body:  az ? `${cur.city}: Güclü fırtına gözlənilir. Ehtiyatlı olun!`
                  : `${cur.city}: Severe storm expected. Stay safe!`,
      });
    }
  }

  // Şiddətli soyuq
  if (prefs.extreme_temp && cur.temp < -5) {
    if (!lastAlerts["cold"] || now - lastAlerts["cold"] > cooldown) {
      alerts.push({
        tag:   "cold",
        title: az ? "🥶 Şaxtavari hava" : "🥶 Freezing weather",
        body:  az ? `${cur.city}: ${Math.round(cur.temp)}°C — İsti geyinin!`
                  : `${cur.city}: ${Math.round(cur.temp)}°C — Dress warmly!`,
      });
    }
  }

  // Şiddətli isti
  if (prefs.extreme_temp && cur.temp > 38) {
    if (!lastAlerts["heat"] || now - lastAlerts["heat"] > cooldown) {
      alerts.push({
        tag:   "heat",
        title: az ? "🌡️ İsti xəbərdarlığı" : "🌡️ Heat warning",
        body:  az ? `${cur.city}: ${Math.round(cur.temp)}°C — Çox su için!`
                  : `${cur.city}: ${Math.round(cur.temp)}°C — Stay hydrated!`,
      });
    }
  }

  // Bildirişləri göndər, tarixçəyə əlavə et və vaxtı qeyd et
  for (const a of alerts) {
    await Notifications.scheduleNotificationAsync({
      content: { title: a.title, body: a.body, sound: true },
      trigger: null,
    });
    await addNotifToHistory(a.title, a.body);
    lastAlerts[a.tag] = now;
  }

  if (alerts.length > 0) {
    await AsyncStorage.setItem(ALERT_KEY, JSON.stringify(lastAlerts)).catch(() => {});
  }
}
