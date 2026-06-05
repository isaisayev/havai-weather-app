import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, StatusBar, ActivityIndicator, Platform,
  ImageBackground, Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { fetchGeocode, saveCity, deleteCity, fetchCityPhoto } from "../lib/api";
import { Colors } from "../theme/colors";
import { useFocusEffect } from "@react-navigation/native";
import WeatherBackground from "../components/WeatherBackground";
import WeatherMapCard from "../components/WeatherMapCard";
import NowcastCard from "../components/NowcastCard";
import HealthCard from "../components/HealthCard";
import { t, forecastDayLabel } from "../lib/i18n";
import {
  NotifItem, loadNotifHistory, markAllNotifsRead, getUnreadCount,
  deleteNotif, clearNotifHistory,
} from "../lib/notifications";

const COND_ICON: Record<string, string> = {
  sunny: "sunny", clear: "sunny", partly_cloudy: "partly-sunny",
  cloudy: "cloudy", rainy: "rainy", drizzle: "rainy",
  stormy: "thunderstorm", snowy: "snow", foggy: "cloud", windy: "flag",
};

const COND_COLOR: Record<string, string> = {
  sunny: "#fbbf24", clear: "#fbbf24", partly_cloudy: "#93c5fd",
  cloudy: "#94a3b8", rainy: "#60a5fa", stormy: "#a78bfa",
  snowy: "#e0f2fe", foggy: "#cbd5e1", windy: "#67e8f9", drizzle: "#7dd3fc",
};

function WeatherIcon({ condition, size = 80 }: { condition: string; size?: number }) {
  return (
    <Ionicons
      name={(COND_ICON[condition] ?? "sunny") as any}
      size={size}
      color={COND_COLOR[condition] ?? "#fbbf24"}
    />
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={18} color={Colors.accent} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { weather, isLoading, weatherError, isOffline, city, setCity, unit,
    lang, refreshWeather, locate, authState, isPremium, savedCities, setSavedCities,
    colors } = useApp();
  const az = lang === "az";

  const [query,      setQuery]      = useState("");
  const [results,    setResults]    = useState<any[]>([]);
  const [searching,  setSearching]  = useState(false);
  const [locating,   setLocating]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [cityPhoto,    setCityPhoto]    = useState<string | null>(null);
  const [coords,       setCoords]       = useState<{ lat: number; lon: number } | null>(null);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifList,    setNotifList]    = useState<NotifItem[]>([]);
  const [unreadCount,  setUnreadCount]  = useState(0);

  // Şəhər koordinatları (Open-Meteo nowcast + health üçün)
  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    fetchGeocode(city).then((r: any[]) => {
      if (cancelled || !r?.length) return;
      setCoords({ lat: r[0].lat, lon: r[0].lon });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [city]);

  const refreshNotifs = useCallback(async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  }, []);

  // Ekrana hər dəfə fokus gəldikdə yenilə
  useFocusEffect(useCallback(() => {
    refreshNotifs();
    // Hər 5 saniyədə bir yoxla (app açıq olduqda)
    const interval = setInterval(refreshNotifs, 5000);
    return () => clearInterval(interval);
  }, [refreshNotifs]));

  async function openNotifPanel() {
    const list = await loadNotifHistory();
    setNotifList(list);
    setNotifOpen(true);
    await markAllNotifsRead();
    setUnreadCount(0);
  }

  async function handleDeleteNotif(id: string) {
    await deleteNotif(id);
    setNotifList(prev => prev.filter(n => n.id !== id));
  }

  async function handleClearNotifs() {
    await clearNotifHistory();
    setNotifList([]);
    setUnreadCount(0);
  }

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setCityPhoto(null);
    fetchCityPhoto(city, cur?.country ?? "").then(url => {
      if (!cancelled) setCityPhoto(url);
    });
    return () => { cancelled = true; };
  }, [city]);

  const cur = weather?.current;

  function displayTemp(c: number) {
    return unit === "F" ? `${Math.round(c * 9 / 5 + 32)}°` : `${c}°`;
  }

  const isSaved = savedCities.some(c => c.city_name === cur?.city);

  async function handleSearch(text: string) {
    setQuery(text);
    if (text.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const data = await fetchGeocode(text);
      setResults(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch {}
    finally { setSearching(false); }
  }

  function selectCity(name: string) {
    setCity(name);
    setResults([]);
    setQuery("");
  }

  async function handleLocate() {
    setLocating(true);
    try {
      // Konumu context-də yenilə — hava koordinata görə avtomatik çəkiləcək (round-trip yoxdur)
      await locate();
    } catch {}
    finally { setLocating(false); }
  }

  async function handleBookmark() {
    if (!cur || authState === "guest") return;
    setSaving(true);
    try {
      if (isSaved) {
        await deleteCity(cur.city);
        setSavedCities(prev => prev.filter(c => c.city_name !== cur.city));
      } else {
        await saveCity({ city_name: cur.city, country: cur.country });
        setSavedCities(prev => [...prev, { id: Date.now().toString(), city_name: cur.city, country: cur.country, lat: null, lon: null }]);
      }
    } catch {}
    finally { setSaving(false); }
  }

  const isNight = cur?.isDay === false;

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  }

  return (
    <WeatherBackground condition={cur?.condition} isNight={isNight}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Bildiriş paneli */}
      <Modal
        visible={notifOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifOpen(false)}
      >
        <TouchableOpacity style={styles.notifOverlay} activeOpacity={1} onPress={() => setNotifOpen(false)}>
          <View style={styles.notifPanel}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>{t("notifications", lang)}</Text>
              <View style={styles.notifHeaderBtns}>
                {notifList.length > 0 && (
                  <TouchableOpacity onPress={handleClearNotifs} hitSlop={8}>
                    <Ionicons name="trash-outline" size={16} color="rgba(252,165,165,0.75)" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setNotifOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={18} color={Colors.dimmed} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.notifScroll} showsVerticalScrollIndicator={false}>
              {notifList.length === 0 ? (
                <View style={styles.notifEmpty}>
                  <Ionicons name="notifications-off-outline" size={32} color={Colors.dimmed} />
                  <Text style={styles.notifEmptyText}>{t("noNotifications", lang)}</Text>
                </View>
              ) : (
                notifList.map(n => (
                  <View key={n.id} style={styles.notifItem}>
                    <View style={styles.notifItemLeft}>
                      <Text style={styles.notifItemTitle}>{n.title}</Text>
                      <Text style={styles.notifItemBody}>{n.body}</Text>
                      <Text style={styles.notifItemTime}>{formatTime(n.time)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteNotif(n.id)} hitSlop={8} style={styles.notifDelete}>
                      <Ionicons name="close-circle" size={18} color={Colors.dimmed} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshWeather} tintColor={Colors.accent} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Axtarış */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            {searching
              ? <ActivityIndicator size="small" color={Colors.accent} />
              : <Ionicons name="search-outline" size={16} color={Colors.dimmed} />}
            <TextInput
              style={styles.searchInput}
              placeholder={t("searchCity", lang)}
              placeholderTextColor={Colors.dimmed}
              value={query}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(""); setResults([]); }}>
                <Ionicons name="close-circle" size={16} color={Colors.dimmed} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleLocate} style={styles.iconBtn}>
            {locating
              ? <ActivityIndicator size="small" color={Colors.accent} />
              : <Ionicons name="locate-outline" size={18} color={Colors.accent} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={openNotifPanel} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={18} color={Colors.accent} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Axtarış nəticələri */}
        {results.length > 0 && (
          <View style={styles.resultsBox}>
            {results.map((r, i) => (
              <TouchableOpacity key={i} style={[styles.resultItem, i > 0 && styles.resultBorder]}
                onPress={() => selectCity(r.name)}>
                <Ionicons name="location-outline" size={13} color={Colors.dimmed} />
                <Text style={styles.resultText}>{r.name}{r.country ? `, ${r.country}` : ""}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Offline banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fbbf24" />
            <Text style={styles.offlineText}>
              {t("offline", lang)}
            </Text>
          </View>
        )}

        {/* Saxlanılmış şəhərlər */}
        {savedCities.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedRow}>
            {savedCities.map(c => (
              <TouchableOpacity key={c.id} onPress={() => setCity(c.city_name)}
                style={[styles.savedChip, city === c.city_name && styles.savedChipActive]}>
                <Text style={[styles.savedChipText, city === c.city_name && { color: "#fff" }]}>
                  {c.city_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Loading */}
        {isLoading && !cur ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : weatherError ? (
          <View style={styles.centerBox}>
            <Ionicons name="cloud-offline-outline" size={52} color={Colors.dimmed} />
            <Text style={styles.errorText}>{weatherError}</Text>
            <TouchableOpacity onPress={refreshWeather} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t("retry", lang)}</Text>
            </TouchableOpacity>
          </View>
        ) : cur ? (
          <>
            {/* Hero kart */}
            <View style={styles.hero}>
              <LinearGradient
                colors={["rgba(75,142,239,0.18)", "rgba(129,140,248,0.10)", "transparent"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              />
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroCity}>{cur.city}, {cur.country}</Text>
                  <Text style={styles.heroTime}>
                    {cur.localTime} · {cur.isDay ? t("day", lang) : t("night", lang)}
                  </Text>
                </View>
                {authState !== "guest" && (
                  <TouchableOpacity onPress={handleBookmark} disabled={saving}>
                    {saving
                      ? <ActivityIndicator size="small" color={Colors.accent} />
                      : <Ionicons
                          name={isSaved ? "bookmark" : "bookmark-outline"}
                          size={22}
                          color={isSaved ? Colors.accent : Colors.dimmed}
                        />}
                  </TouchableOpacity>
                )}
              </View>

              <WeatherIcon condition={cur.condition} size={88} />
              <Text style={styles.heroTemp}>{displayTemp(cur.temp)}</Text>
              <Text style={styles.heroFeels}>
                {`${t("feelsLike", lang)} ${displayTemp(cur.feelsLike)}`}
              </Text>
              <Text style={styles.heroDesc}>{cur.description}</Text>
            </View>

            {/* Statistika */}
            <View style={styles.statsGrid}>
              <StatCard icon="water-outline"      label={t("humidity", lang)}   value={`${cur.humidity}%`} />
              <StatCard icon="speedometer-outline" label={t("wind", lang)}       value={`${cur.windSpeed} km/h`} />
              <StatCard icon="eye-outline"         label={t("visibility", lang)} value={`${cur.visibility} km`} />
              <StatCard icon="analytics-outline"   label={t("pressure", lang)}   value={`${cur.pressure} hPa`} />
              <StatCard icon="sunny-outline"       label={t("sunrise", lang)}    value={cur.sunrise} />
              <StatCard icon="moon-outline"        label={t("sunset", lang)}     value={cur.sunset} />
            </View>

            {/* Dəqiqəlik yağış nowcast (pulsuz) */}
            {coords && <NowcastCard lat={coords.lat} lon={coords.lon} lang={lang} />}

            {/* Sağlamlıq paneli — AQI/UV/Polen (premium) */}
            {coords && (
              <HealthCard
                lat={coords.lat} lon={coords.lon} lang={lang}
                isPremium={isPremium}
                onUnlock={() => navigation?.navigate?.("Premium")}
              />
            )}

            {/* Şəhər şəkli + Saatlıq proqnoz */}
            {weather?.hourly && weather.hourly.length > 0 && (
              <View style={styles.section}>
                <ImageBackground
                  source={cityPhoto ? { uri: cityPhoto } : undefined}
                  style={styles.cityPhotoCard}
                  imageStyle={{ borderRadius: 20 }}
                  resizeMode="cover"
                >
                  {cityPhoto && (
                    <LinearGradient
                      colors={["rgba(0,0,0,0.60)", "rgba(0,0,0,0.20)", "rgba(0,0,0,0.60)"]}
                      locations={[0, 0.5, 1]}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  {!cityPhoto && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 20 }]} />
                  )}
                  <Text style={styles.sectionTitle}>{t("hourlyForecast", lang)}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {weather.hourly.map((h: any, i: number) => (
                      <View key={i} style={styles.hourItem}>
                        <Text style={styles.hourTime}>{h.time}</Text>
                        <Ionicons name={(COND_ICON[h.condition] ?? "sunny") as any} size={22}
                          color={COND_COLOR[h.condition] ?? "#fbbf24"} />
                        <Text style={styles.hourTemp}>{displayTemp(h.temp)}</Text>
                        {h.precipChance > 0 && (
                          <Text style={styles.hourPrecip}>💧{h.precipChance}%</Text>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </ImageBackground>
              </View>
            )}
            {/* 7 Günlük Proqnoz */}
            {weather?.daily && weather.daily.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sevenDay", lang)}</Text>
                <View style={styles.dailyCard}>
                  {weather.daily.map((day: any, i: number) => {
                    const dl = forecastDayLabel(i, lang);
                    return (
                    <View key={i} style={[styles.dayRow, i > 0 && styles.dayRowBorder]}>
                      <View style={styles.dayLeft}>
                        <Text style={styles.dayName}>{dl.day}</Text>
                        <Text style={styles.dayDate}>{dl.date}</Text>
                      </View>
                      <Ionicons
                        name={(COND_ICON[day.condition] ?? "sunny") as any}
                        size={20} color={COND_COLOR[day.condition] ?? "#fbbf24"}
                      />
                      {day.precipChance > 0 && (
                        <Text style={styles.dayPrecip}>💧{day.precipChance}%</Text>
                      )}
                      <View style={styles.dayTemps}>
                        <Text style={styles.dayHigh}>{displayTemp(day.high)}</Text>
                        <Text style={styles.dayLow}>{displayTemp(day.low)}</Text>
                      </View>
                    </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Yağış Radari Xəritəsi */}
            <WeatherMapCard city={cur.city} country={cur.country ?? ""} lang={lang} />
          </>
        ) : null}
      </ScrollView>
    </WeatherBackground>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  scroll:         { paddingTop: Platform.OS === "ios" ? 56 : 40, paddingHorizontal: 16, paddingBottom: 180 },
  searchRow:      { flexDirection: "row", gap: 10, marginBottom: 10 },
  searchBox:      { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingHorizontal: 14, height: 46 },
  searchInput:    { flex: 1, color: Colors.text, fontSize: 14 },
  iconBtn:        { width: 46, height: 46, backgroundColor: "rgba(75,142,239,0.12)", borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  resultsBox:     { backgroundColor: "rgba(8,13,34,0.97)", borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 16, marginBottom: 10, overflow: "hidden" },
  resultItem:     { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 13 },
  resultBorder:   { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  resultText:     { color: Colors.text, fontSize: 14 },
  savedRow:       { marginBottom: 12 },
  savedChip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  savedChipActive:{ backgroundColor: Colors.accent, borderColor: Colors.accent },
  savedChipText:  { color: Colors.muted, fontSize: 13, fontWeight: "600" },
  centerBox:      { alignItems: "center", gap: 14, paddingVertical: 80 },
  errorText:      { color: Colors.muted, fontSize: 14, textAlign: "center", maxWidth: 260 },
  retryBtn:       { backgroundColor: "rgba(75,142,239,0.12)", borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryText:      { color: Colors.accent, fontSize: 14, fontWeight: "600" },
  hero:           { backgroundColor: "rgba(0,0,0,0.35)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 24, padding: 22, alignItems: "center", marginBottom: 14, overflow: "hidden" },
  heroTop:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", width: "100%", marginBottom: 18 },
  heroCity:       { color: Colors.text, fontSize: 19, fontWeight: "700" },
  heroTime:       { color: Colors.dimmed, fontSize: 12, marginTop: 2 },
  heroTemp:       { color: Colors.text, fontSize: 68, fontWeight: "200", letterSpacing: -2, marginTop: 6 },
  heroFeels:      { color: Colors.muted, fontSize: 14, marginTop: 2 },
  heroDesc:       { color: Colors.muted, fontSize: 14, textTransform: "capitalize", marginTop: 4 },
  statsGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard:       { flex: 1, minWidth: "29%", backgroundColor: "rgba(0,0,0,0.30)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 14, alignItems: "center", gap: 5 },
  statLabel:      { color: Colors.dimmed, fontSize: 11, textAlign: "center" },
  statValue:      { color: Colors.text, fontSize: 14, fontWeight: "600" },
  section:        { marginBottom: 14 },
  sectionTitle:   { color: "rgba(255,255,255,0.70)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, paddingHorizontal: 4 },
  cityPhotoCard:  { borderRadius: 20, overflow: "hidden", padding: 16, minHeight: 130 },
  hourItem:       { alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.30)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14, marginRight: 10, minWidth: 70 },
  hourTime:       { color: "#fff", fontSize: 12, fontWeight: "600" },
  hourTemp:       { color: "#fff", fontSize: 14, fontWeight: "700" },
  hourPrecip:     { color: "#93c5fd", fontSize: 11, fontWeight: "600" },
  dailyCard:      { backgroundColor: "rgba(0,0,0,0.35)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 20, overflow: "hidden" },
  dayRow:         { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  dayRowBorder:   { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  dayLeft:        { flex: 1 },
  dayName:        { color: "#fff", fontSize: 14, fontWeight: "600" },
  dayDate:        { color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 1 },
  dayPrecip:      { color: "#93c5fd", fontSize: 12, minWidth: 40 },
  dayTemps:       { flexDirection: "row", gap: 8, alignItems: "center" },
  dayHigh:        { color: "#fff", fontSize: 15, fontWeight: "700", minWidth: 38, textAlign: "right" },
  dayLow:         { color: "rgba(255,255,255,0.45)", fontSize: 15, minWidth: 38, textAlign: "right" },
  offlineBanner:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(251,191,36,0.10)", borderWidth: 1, borderColor: "rgba(251,191,36,0.25)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  offlineText:      { color: "#fbbf24", fontSize: 12, fontWeight: "500" },
  notifBadge:       { position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444", borderRadius: 8, minWidth: 16, height: 16, justifyContent: "center", alignItems: "center", paddingHorizontal: 3 },
  notifBadgeText:   { color: "#fff", fontSize: 9, fontWeight: "700" },
  notifOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-start", alignItems: "flex-end" },
  notifPanel:       { marginTop: Platform.OS === "ios" ? 100 : 70, marginRight: 16, width: 300, maxHeight: 380, backgroundColor: "rgba(8,13,34,0.97)", borderWidth: 1, borderColor: "rgba(75,142,239,0.25)", borderRadius: 20, overflow: "hidden" },
  notifHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  notifTitle:       { color: Colors.text, fontSize: 14, fontWeight: "700" },
  notifScroll:      { maxHeight: 320 },
  notifEmpty:       { alignItems: "center", gap: 10, paddingVertical: 32 },
  notifEmptyText:   { color: Colors.dimmed, fontSize: 13 },
  notifItem:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)", gap: 8 },
  notifItemLeft:    { flex: 1, gap: 3 },
  notifItemTitle:   { color: Colors.text, fontSize: 13, fontWeight: "600" },
  notifItemBody:    { color: Colors.muted, fontSize: 12, lineHeight: 17 },
  notifItemTime:    { color: Colors.dimmed, fontSize: 11, marginTop: 4 },
  notifHeaderBtns:  { flexDirection: "row", alignItems: "center", gap: 14 },
  notifDelete:      { paddingTop: 1 },
});
