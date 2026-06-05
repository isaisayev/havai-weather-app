import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchNowcast, NowcastResult } from "../lib/openMeteo";
import { t, Lang } from "../lib/i18n";
import { Colors } from "../theme/colors";

interface Props {
  lat: number;
  lon: number;
  lang: Lang;
}

export default function NowcastCard({ lat, lon, lang }: Props) {
  const [data, setData] = useState<NowcastResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNowcast(lat, lon).then(r => {
      if (!cancelled) { setData(r); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [lat, lon]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }
  if (!data) return null;

  // Heç yağış yoxdursa və proqnozda da yoxdursa kartı göstərmə (yer tutmasın)
  const maxPrecip = Math.max(...data.steps.map(s => s.precip), 0);
  if (data.status === "none" && maxPrecip <= 0.05) {
    return null;
  }

  // Başlıq mesajı
  let icon = "rainy";
  let iconColor = Colors.accent;
  let message = "";
  let highlight = "";

  if (data.status === "starts") {
    icon = "rainy-outline"; iconColor = "#60a5fa";
    message = t("rainStartsIn", lang);
    highlight = `${data.minutes} ${t("minutesShort", lang)}`;
  } else if (data.status === "stops") {
    icon = "partly-sunny-outline"; iconColor = "#fbbf24";
    message = t("rainStopsIn", lang);
    highlight = `${data.minutes} ${t("minutesShort", lang)}`;
  } else if (data.status === "ongoing") {
    icon = "rainy"; iconColor = "#60a5fa";
    message = t("rainOngoing", lang);
  }

  const barMax = Math.max(maxPrecip, 0.5);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("nowcastTitle", lang)}</Text>
          <Text style={styles.message}>
            {message}{highlight ? <Text style={[styles.highlight, { color: iconColor }]}>  {highlight}</Text> : null}
          </Text>
        </View>
      </View>

      {/* Yağış qrafiki — növbəti 2 saat (15 dəq addım) */}
      <View style={styles.chart}>
        {data.steps.map((s, i) => {
          const h = Math.max(4, (s.precip / barMax) * 44);
          const active = s.precip > 0.05;
          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: h, backgroundColor: active ? iconColor : "rgba(255,255,255,0.10)" }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{t("now", lang)}</Text>
        <Text style={styles.axisLabel}>+1h</Text>
        <Text style={styles.axisLabel}>+2h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:     { backgroundColor: "rgba(0,0,0,0.40)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 16, marginBottom: 14 },
  header:   { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  iconBox:  { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  title:    { color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  message:  { color: "#fff", fontSize: 14, fontWeight: "600", marginTop: 2 },
  highlight:{ fontSize: 15, fontWeight: "800" },
  chart:    { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 48, gap: 4 },
  barCol:   { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar:      { width: "100%", borderRadius: 4, minHeight: 4 },
  axisRow:  { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  axisLabel:{ color: "rgba(255,255,255,0.40)", fontSize: 10 },
});
