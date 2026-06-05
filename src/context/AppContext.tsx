import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";
import { fetchWeather, fetchSavedCities, fetchPremiumStatus, syncUser } from "../lib/api";
import { Cache } from "../lib/cache";
import { ThemeName, THEMES, ColorSet } from "../theme/colors";
import {
  requestNotificationPermission,
  loadNotifPrefs,
  checkWeatherAlerts,
  scheduleMorningForecast,
} from "../lib/notifications";

export type AuthState = "loading" | "guest" | "free" | "premium";
export type Lang = "en" | "az" | "tr" | "ru";
export type Unit = "C" | "F";
export type { ThemeName };

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface SavedCity {
  id: string;
  city_name: string;
  country: string | null;
  lat: number | null;
  lon: number | null;
}

// Cihazın koordinatını al — GPS peykini məcburi işə sal (High accuracy).
// Balanced rejimi Wi-Fi/mobil-şəbəkə mövqeyindən istifadə edir ki, bu da
// bəzən tamam yanlış şəhərə (məs. başqa ölkəyə) düşür. Uğursuz olsa son məlum mövqe.
async function getDeviceCoords(): Promise<{ lat: number; lon: number } | null> {
  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    if (pos) return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch {}
  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last) return { lat: last.coords.latitude, lon: last.coords.longitude };
  } catch {}
  return null;
}

// Koordinatdan şəhər/rayon adı — OWM "name" boş qaytaranda istifadə olunur
// (əks halda başlıqda yalnız ölkə görünür).
async function reverseCity(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const g = r?.[0];
    if (!g) return null;
    // Şəhər səviyyəsini üstün tut (məs. "İstanbul"), məhəllə/rayonu (Karaköy) yox
    return g.city || g.subregion || g.region || g.district || null;
  } catch { return null; }
}

interface AppContextType {
  authState: AuthState;
  user: AppUser | null;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  refreshPremium: () => Promise<boolean>;
  logout: () => Promise<void>;

  city: string;
  setCity: (c: string) => void;
  weather: any | null;
  isLoading: boolean;
  weatherError: string | null;
  isOffline: boolean;
  refreshWeather: () => void;
  locate: () => Promise<void>;
  coords: { lat: number; lon: number } | null;

  lang: Lang;
  setLang: (l: Lang) => void;
  unit: Unit;
  setUnit: (u: Unit) => void;

  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  colors: ColorSet;

  savedCities: SavedCity[];
  setSavedCities: React.Dispatch<React.SetStateAction<SavedCity[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user,      setUser]      = useState<AppUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const [city,        setCity_]    = useState("Bakı");
  const [coords,      setCoords]   = useState<{ lat: number; lon: number } | null>(null);
  const [weather,     setWeather]  = useState<any | null>(null);
  const [isLoading,   setLoading]  = useState(false);
  const [weatherError,setWErr]     = useState<string | null>(null);
  const [isOffline,   setOffline]  = useState(false);

  const [lang,        setLang_]    = useState<Lang>("en");
  const [unit,        setUnit_]    = useState<Unit>("C");
  const [theme,       setTheme_]   = useState<ThemeName>("dark");
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const colors = THEMES[theme];

  const [initialized, setInitialized] = useState(false);

  // İlk açılış: ayarları yüklə + konumu aşkarla
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [l, u, c, t] = await Promise.all([
        Cache.loadLang(), Cache.loadUnit(), Cache.loadCity(), Cache.loadTheme(),
      ]);
      if (t === "dark" || t === "light" || t === "midnight") setTheme_(t);
      const langv: Lang = l === "en" ? "en" : "az";
      if (l === "en" || l === "az" || l === "tr" || l === "ru") setLang_(l);
      if (u === "C"  || u === "F")  setUnit_(u);

      let resolvedCity = c || "Bakı";

      // Konumu aşkarla — koordinatları birbaşa hava API-sinə ötür (ən dəqiq)
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const c2 = await getDeviceCoords();
          if (c2) {
            // Koordinatı saxla — bütün sonrakı yeniləmələr buna görə işləyəcək
            setCoords(c2);
            const data = await fetchWeather({ lat: c2.lat, lon: c2.lon }, langv);
            // GPS rejimində şəhər səviyyəsindəki adı üstün tut (OWM bəzən məhəllə
            // adı və ya boş qaytarır) — geri-geocode ilə düzgün şəhər adı al
            let apiCity = data?.current?.city;
            const rc = await reverseCity(c2.lat, c2.lon);
            if (rc) apiCity = rc;
            if (apiCity && data?.current) data.current.city = apiCity;
            setWeather(data);
            setOffline(false);
            if (apiCity) {
              resolvedCity = apiCity;
              Cache.saveCity(apiCity);
              await Cache.saveWeather(apiCity, data);
            }
          }
        }
      } catch {}

      setCity_(resolvedCity);
      setInitialized(true);
      setLoading(false);
    })();
  }, []);

  function setLang(l: Lang)        { setLang_(l);   Cache.saveLang(l);    }
  function setUnit(u: Unit)        { setUnit_(u);   Cache.saveUnit(u);    }
  // Əllə şəhər seçimi → GPS koordinatını ləğv et ki, seçilən şəhər göstərilsin
  function setCity(c: string)      { setCity_(c);   Cache.saveCity(c);  setCoords(null); }
  function setTheme(t: ThemeName)  { setTheme_(t);  Cache.saveTheme(t); }

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const appUser: AppUser = {
          id:    u.id,
          name:  u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "User",
          email: u.email ?? "",
        };
        setUser(appUser);
        loadUserData(session.access_token, appUser);
      } else {
        setAuthState("guest");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user;
        const appUser: AppUser = {
          id:    u.id,
          name:  u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "User",
          email: u.email ?? "",
        };
        setUser(appUser);
        loadUserData(session.access_token, appUser);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsPremium(false);
        setSavedCities([]);
        setAuthState("guest");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(token: string, appUser: AppUser) {
    try {
      syncUser(appUser.name, appUser.email).catch(() => {});
      const [premiumData, citiesData] = await Promise.all([
        fetchPremiumStatus(),
        fetchSavedCities(),
      ]);
      setIsPremium(!!premiumData.isPremium);
      setSavedCities(Array.isArray(citiesData) ? citiesData : []);
      setAuthState(premiumData.isPremium ? "premium" : "free");
    } catch {
      setAuthState("free");
    }
  }

  async function refreshPremium(): Promise<boolean> {
    try {
      const p = await fetchPremiumStatus();
      const prem = !!p.isPremium;
      setIsPremium(prem);
      setAuthState(prem ? "premium" : "free");
      return prem;
    } catch {
      return false;
    }
  }

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
  }

  const refreshWeather = useCallback(async () => {
    setLoading(true);
    setWErr(null);
    try {
      // Koordinat varsa (GPS) — dəqiq yerə görə çək; yoxsa əllə seçilmiş şəhər adına görə
      const data = coords
        ? await fetchWeather({ lat: coords.lat, lon: coords.lon }, lang)
        : await fetchWeather({ city }, lang);
      // GPS rejimində şəhər səviyyəsindəki adı üstün tut (OWM məhəllə/boş qaytara bilər)
      if (coords && data?.current) {
        const rc = await reverseCity(coords.lat, coords.lon);
        if (rc) data.current.city = rc;
      }
      setWeather(data);
      setOffline(false);
      const name = data?.current?.city ?? city;
      await Cache.saveWeather(name, data);
      // GPS rejimində backend-in qaytardığı şəhər adını göstərmək üçün yenilə
      // (koordinatı ləğv etməyən daxili setter — round-trip baş vermir)
      if (coords && name && name !== city) {
        setCity_(name);
        Cache.saveCity(name);
      }
      // Bildiriş yoxlaması
      const prefs = await loadNotifPrefs();
      if (prefs.enabled) {
        checkWeatherAlerts(data, prefs, lang === "az").catch(() => {});
        if (prefs.morning_forecast && data?.current) {
          scheduleMorningForecast(
            data.current.city, data.current.temp,
            data.current.description, prefs.morning_time, lang === "az"
          ).catch(() => {});
        }
      }
    } catch {
      // Offline — keşdən yüklə
      const cached = await Cache.loadWeather(city);
      if (cached) {
        setWeather(cached);
        setOffline(true);
        setWErr(null);
      } else {
        setOffline(true);
        setWErr(lang === "az" ? "İnternet bağlantısı yoxdur" : "No internet connection");
      }
    } finally {
      setLoading(false);
    }
  }, [city, lang, coords]);

  // Telefonun konumunu istə və koordinatı yenilə → effekt havanı koordinata görə çəkəcək
  const locate = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const c2 = await getDeviceCoords();
    if (c2) setCoords(c2);
  }, []);

  useEffect(() => { if (initialized) refreshWeather(); }, [city, lang, coords, initialized]);

  return (
    <AppContext.Provider value={{
      authState, user, isPremium, setIsPremium, refreshPremium, logout,
      city, setCity, weather, isLoading, weatherError, isOffline, refreshWeather, locate, coords,
      lang, setLang, unit, setUnit,
      theme, setTheme, colors,
      savedCities, setSavedCities,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
