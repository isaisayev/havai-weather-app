import React from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { Colors } from "../theme/colors";

const condIcon: Record<string, string> = {
  sunny: "sunny", clear: "sunny", partly_cloudy: "partly-sunny",
  cloudy: "cloudy", rainy: "rainy", drizzle: "rainy",
  stormy: "thunderstorm", snowy: "snow", foggy: "cloud",
};

export default function ForecastScreen() {
  const { weather, isLoading, unit, lang } = useApp();
  const az = lang === "az";

  function displayTemp(c: number) {
    return unit === "F" ? `${Math.round(c * 9/5 + 32)}°` : `${c}°`;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={["#0a0f28", "#080d22"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{az ? "7 Günlük Proqnoz" : "7-Day Forecast"}</Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : (
          <>
            {/* Günlük siyahı */}
            <View style={styles.card}>
              {(weather?.daily ?? []).map((day: any, i: number) => (
                <View key={i} style={[styles.dayRow, i > 0 && styles.dayRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayName}>{day.day}</Text>
                    <Text style={styles.dayDate}>{day.date}</Text>
                  </View>
                  <Ionicons
                    name={(condIcon[day.condition] ?? "sunny") as any}
                    size={22} color={Colors.accent}
                  />
                  {day.precipChance > 0 && (
                    <Text style={styles.precip}>{day.precipChance}%</Text>
                  )}
                  <View style={styles.temps}>
                    <Text style={styles.tempHigh}>{displayTemp(day.high)}</Text>
                    <Text style={styles.tempLow}>{displayTemp(day.low)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Saatlıq proqnoz */}
            <Text style={styles.subtitle}>{az ? "Saatlıq (növbəti 24 saat)" : "Hourly (next 24h)"}</Text>
            <View style={styles.card}>
              {(weather?.hourly ?? []).map((h: any, i: number) => (
                <View key={i} style={[styles.hourRow, i > 0 && styles.dayRowBorder]}>
                  <Text style={styles.hourTime}>{h.time}</Text>
                  <Ionicons name={(condIcon[h.condition] ?? "sunny") as any} size={18} color={Colors.accent} />
                  <Text style={styles.hourTemp}>{displayTemp(h.temp)}</Text>
                  {h.precipChance > 0 && (
                    <Text style={styles.hourPrecip}>🌧 {h.precipChance}%</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  scroll:      { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 100 },
  center:      { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 80 },
  title:       { color: Colors.text, fontSize: 22, fontWeight: "700", marginBottom: 16 },
  subtitle:    { color: Colors.muted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, marginTop: 16 },
  card:        { backgroundColor: "rgba(13,21,53,0.80)", borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 20, overflow: "hidden", marginBottom: 8 },
  dayRow:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  dayRowBorder:{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  dayName:     { color: Colors.text, fontSize: 15, fontWeight: "600" },
  dayDate:     { color: Colors.dimmed, fontSize: 12, marginTop: 1 },
  precip:      { color: Colors.accent, fontSize: 12, minWidth: 32 },
  temps:       { flexDirection: "row", gap: 8 },
  tempHigh:    { color: Colors.text, fontSize: 15, fontWeight: "700", minWidth: 36, textAlign: "right" },
  tempLow:     { color: Colors.dimmed, fontSize: 15, minWidth: 36, textAlign: "right" },
  hourRow:     { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  hourTime:    { color: Colors.muted, fontSize: 14, minWidth: 48 },
  hourTemp:    { color: Colors.text, fontSize: 14, fontWeight: "600", flex: 1 },
  hourPrecip:  { color: Colors.accent, fontSize: 13 },
});
