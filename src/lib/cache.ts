import AsyncStorage from "@react-native-async-storage/async-storage";

const WEATHER_KEY = "havai_weather_cache";
const LANG_KEY    = "havai_lang";
const UNIT_KEY    = "havai_unit";
const CITY_KEY    = "havai_city";
const THEME_KEY   = "havai_theme";
const VIDEOBG_KEY = "havai_videobg";

export const Cache = {
  async saveWeather(city: string, data: object) {
    try {
      await AsyncStorage.setItem(`${WEATHER_KEY}_${city}`, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  },

  async loadWeather(city: string): Promise<object | null> {
    try {
      const raw = await AsyncStorage.getItem(`${WEATHER_KEY}_${city}`);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      // 30 dəqiqədən köhnədirsə istifadə etmə
      if (Date.now() - ts > 30 * 60 * 1000) return null;
      return data;
    } catch { return null; }
  },

  async saveLang(lang: string) {
    try { await AsyncStorage.setItem(LANG_KEY, lang); } catch {}
  },
  async loadLang(): Promise<string | null> {
    try { return AsyncStorage.getItem(LANG_KEY); } catch { return null; }
  },

  async saveUnit(unit: string) {
    try { await AsyncStorage.setItem(UNIT_KEY, unit); } catch {}
  },
  async loadUnit(): Promise<string | null> {
    try { return AsyncStorage.getItem(UNIT_KEY); } catch { return null; }
  },

  async saveCity(city: string) {
    try { await AsyncStorage.setItem(CITY_KEY, city); } catch {}
  },
  async loadCity(): Promise<string | null> {
    try { return AsyncStorage.getItem(CITY_KEY); } catch { return null; }
  },

  async saveTheme(theme: string) {
    try { await AsyncStorage.setItem(THEME_KEY, theme); } catch {}
  },
  async loadTheme(): Promise<string | null> {
    try { return AsyncStorage.getItem(THEME_KEY); } catch { return null; }
  },

  async saveVideoBg(enabled: boolean) {
    try { await AsyncStorage.setItem(VIDEOBG_KEY, enabled ? "1" : "0"); } catch {}
  },
  async loadVideoBg(): Promise<boolean> {
    try { const v = await AsyncStorage.getItem(VIDEOBG_KEY); return v !== "0"; } catch { return true; }
  },

  // AI söhbət tarixçəsi — rol başına son 100 mesaj
  async saveChat(role: string, messages: unknown[]) {
    try {
      const trimmed = messages.slice(-100);
      await AsyncStorage.setItem(`havai_chat_${role}`, JSON.stringify(trimmed));
    } catch {}
  },
  async loadChat(role: string): Promise<any[]> {
    try {
      const raw = await AsyncStorage.getItem(`havai_chat_${role}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  async clearChat(role: string) {
    try { await AsyncStorage.removeItem(`havai_chat_${role}`); } catch {}
  },

  // AI məsləhət nəticəsi (şəhərlə birlikdə)
  async saveAdvice(city: string, advice: unknown) {
    try { await AsyncStorage.setItem("havai_advice", JSON.stringify({ city, advice })); } catch {}
  },
  async loadAdvice(): Promise<{ city: string; advice: any } | null> {
    try {
      const raw = await AsyncStorage.getItem("havai_advice");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async clearAdvice() {
    try { await AsyncStorage.removeItem("havai_advice"); } catch {}
  },
};
