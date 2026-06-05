import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { fetchWeather, deleteCity } from "../lib/api";
import { Colors } from "../theme/colors";
import { t } from "../lib/i18n";

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

interface CityWeather {
  temp: number;
  condition: string;
  description: string;
}

export default function SavedScreen({ navigation }: any) {
  const { savedCities, setSavedCities, setCity, unit, lang, authState, colors } = useApp();

  const [weatherMap, setWeatherMap] = useState<Record<string, CityWeather>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  function displayTemp(c: number) {
    return unit === "F" ? `${Math.round(c * 9 / 5 + 32)}°` : `${c}°`;
  }

  // Hər saxlanılan şəhər üçün cari havanı yüklə
  useEffect(() => {
    let cancelled = false;
    savedCities.forEach(c => {
      if (weatherMap[c.city_name]) return;
      setLoadingMap(prev => ({ ...prev, [c.city_name]: true }));
      fetchWeather({ city: c.city_name }, lang)
        .then(data => {
          if (cancelled || !data?.current) return;
          setWeatherMap(prev => ({
            ...prev,
            [c.city_name]: {
              temp:        data.current.temp,
              condition:   data.current.condition,
              description: data.current.description,
            },
          }));
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoadingMap(prev => ({ ...prev, [c.city_name]: false }));
        });
    });
    return () => { cancelled = true; };
  }, [savedCities, lang]);

  function selectCity(name: string) {
    setCity(name);
    navigation?.navigate?.("Home");
  }

  async function handleRemove(name: string) {
    await deleteCity(name);
    setSavedCities(prev => prev.filter(c => c.city_name !== name));
  }

  // Guest
  if (authState === "guest") {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={52} color={colors.dimmed} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("loginToSave", lang)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <LinearGradient colors={["#4b8eef", "#818cf8"]} style={styles.headerIcon}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="bookmark" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t("savedTitle", lang)}</Text>
            <Text style={[styles.subtitle, { color: colors.dimmed }]}>
              {savedCities.length} {savedCities.length === 1 ? "place" : "places"}
            </Text>
          </View>
        </View>

        {savedCities.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="map-outline" size={48} color={colors.dimmed} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("noSaved", lang)}</Text>
            <Text style={[styles.emptySub, { color: colors.dimmed }]}>{t("noSavedSub", lang)}</Text>
          </View>
        ) : (
          savedCities.map(c => {
            const w = weatherMap[c.city_name];
            const loading = loadingMap[c.city_name];
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.cityCard, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}
                onPress={() => selectCity(c.city_name)}
                activeOpacity={0.8}
              >
                <View style={styles.cityLeft}>
                  <Ionicons
                    name={(COND_ICON[w?.condition ?? ""] ?? "location") as any}
                    size={28}
                    color={COND_COLOR[w?.condition ?? ""] ?? Colors.accent}
                  />
                  <View>
                    <Text style={[styles.cityName, { color: colors.text }]}>{c.city_name}</Text>
                    {c.country ? (
                      <Text style={[styles.cityCountry, { color: colors.dimmed }]}>{c.country}</Text>
                    ) : null}
                    {w?.description ? (
                      <Text style={[styles.cityDesc, { color: colors.muted }]} numberOfLines={1}>
                        {w.description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.cityRight}>
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.accent} />
                  ) : w ? (
                    <Text style={[styles.cityTemp, { color: colors.text }]}>{displayTemp(w.temp)}</Text>
                  ) : null}
                  <TouchableOpacity onPress={() => handleRemove(c.city_name)} hitSlop={10} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={16} color="rgba(252,165,165,0.7)" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  scroll:      { paddingTop: Platform.OS === "ios" ? 56 : 40, paddingHorizontal: 16, paddingBottom: 180 },
  center:      { alignItems: "center", gap: 12, paddingVertical: 80, paddingHorizontal: 32 },
  emptyTitle:  { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptySub:    { fontSize: 13, textAlign: "center", lineHeight: 19 },
  headerRow:   { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  headerIcon:  { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  title:       { fontSize: 20, fontWeight: "800" },
  subtitle:    { fontSize: 12, marginTop: 2 },
  cityCard:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 10 },
  cityLeft:    { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  cityName:    { fontSize: 16, fontWeight: "700" },
  cityCountry: { fontSize: 12, marginTop: 1 },
  cityDesc:    { fontSize: 12, marginTop: 2, textTransform: "capitalize" },
  cityRight:   { flexDirection: "row", alignItems: "center", gap: 14 },
  cityTemp:    { fontSize: 24, fontWeight: "300" },
  removeBtn:   { padding: 2 },
});
