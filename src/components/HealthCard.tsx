import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchHealth, HealthData, aqiCategory, uvCategory, pollenCategory,
} from "../lib/openMeteo";
import { t, Lang } from "../lib/i18n";
import { Colors } from "../theme/colors";

interface Props {
  lat: number;
  lon: number;
  lang: Lang;
  isPremium: boolean;
  onUnlock: () => void;
}

function Metric({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string; color: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricSub} numberOfLines={1}>{sub}</Text>
    </View>
  );
}

export default function HealthCard({ lat, lon, lang, isPremium, onUnlock }: Props) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPremium) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchHealth(lat, lon).then(r => {
      if (!cancelled) { setData(r); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [lat, lon, isPremium]);

  // Premium deyilsə — blur/kilid kartı
  if (!isPremium) {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onUnlock}>
        <View style={styles.header}>
          <View style={[styles.hIconBox, { backgroundColor: "rgba(251,191,36,0.15)" }]}>
            <Ionicons name="leaf" size={16} color={Colors.gold} />
          </View>
          <Text style={styles.title}>{t("healthTitle", lang)}</Text>
          <Ionicons name="lock-closed" size={14} color={Colors.gold} style={{ marginLeft: "auto" }} />
        </View>
        {/* Bulanıq önizləmə */}
        <View style={styles.lockedRow}>
          {[t("airQuality", lang), t("uvIndex", lang), t("pollen", lang)].map((l, i) => (
            <View key={i} style={styles.lockedMetric}>
              <Text style={styles.lockedLabel}>{l}</Text>
              <Text style={styles.lockedDots}>• • •</Text>
            </View>
          ))}
        </View>
        <View style={styles.unlockBtn}>
          <Ionicons name="star" size={13} color="#000" />
          <Text style={styles.unlockText}>{t("unlockPremium", lang)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }
  if (!data) return null;

  const aqi    = data.aqi    != null ? aqiCategory(data.aqi)        : null;
  const uv     = data.uv     != null ? uvCategory(data.uv)          : null;
  const pollen = data.pollen != null ? pollenCategory(data.pollen)  : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.hIconBox, { backgroundColor: "rgba(52,211,153,0.15)" }]}>
          <Ionicons name="leaf" size={16} color="#34d399" />
        </View>
        <Text style={styles.title}>{t("healthTitle", lang)}</Text>
      </View>

      <View style={styles.metricsRow}>
        {data.aqi != null && aqi && (
          <Metric
            icon="cloud-outline"
            label={t("airQuality", lang)}
            value={`${Math.round(data.aqi)}`}
            sub={t(aqi.key as any, lang)}
            color={aqi.color}
          />
        )}
        {data.uv != null && uv && (
          <Metric
            icon="sunny-outline"
            label={t("uvIndex", lang)}
            value={`${Math.round(data.uv)}`}
            sub={t(uv.key as any, lang)}
            color={uv.color}
          />
        )}
        {data.pollen != null && pollen && (
          <Metric
            icon="flower-outline"
            label={t("pollen", lang)}
            value={`${Math.round(data.pollen)}`}
            sub={t(pollen.key as any, lang)}
            color={pollen.color}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:        { backgroundColor: "rgba(0,0,0,0.40)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 16, marginBottom: 14 },
  header:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  hIconBox:    { width: 30, height: 30, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  title:       { color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  metricsRow:  { flexDirection: "row", gap: 10 },
  metric:      { flex: 1, alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 6 },
  metricIcon:  { width: 34, height: 34, borderRadius: 11, justifyContent: "center", alignItems: "center", marginBottom: 2 },
  metricLabel: { color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: "600", textAlign: "center" },
  metricValue: { fontSize: 22, fontWeight: "800" },
  metricSub:   { color: "rgba(255,255,255,0.50)", fontSize: 10, fontWeight: "600" },
  // Locked
  lockedRow:   { flexDirection: "row", gap: 10, marginBottom: 14 },
  lockedMetric:{ flex: 1, alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingVertical: 18 },
  lockedLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: "600" },
  lockedDots:  { color: "rgba(255,255,255,0.30)", fontSize: 16, fontWeight: "800", letterSpacing: 2 },
  unlockBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 11 },
  unlockText:  { color: "#000", fontSize: 13, fontWeight: "800" },
});
