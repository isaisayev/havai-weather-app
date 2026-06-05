import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  Linking, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { fetchAIAdvice } from "../lib/api";
import { Colors } from "../theme/colors";
import { t } from "../lib/i18n";
import { Cache } from "../lib/cache";

interface ClothingItem {
  category: string;  // ust | alt | ayaqqabi | aksesuar  (or top | bottom | footwear | accessory)
  item:     string;
  why:      string;
}

interface AdviceData {
  clothing?:      ClothingItem[] | string[];
  morningPlan?:   string;
  afternoonPlan?: string;
  eveningPlan?:   string;
  warnings?:      string[];
  walkingRoute?: {
    suitable: boolean;
    reason:   string;
    places:   { name: string; description: string }[];
  };
}

const CLOTHING_META: Record<string, { icon: string; color: string; labels: Record<string, string> }> = {
  ust:       { icon: "shirt-outline",     color: "#60a5fa", labels: { en: "Top",       az: "Üst geyim", tr: "Üst Giyim", ru: "Верх"     } },
  top:       { icon: "shirt-outline",     color: "#60a5fa", labels: { en: "Top",       az: "Üst geyim", tr: "Üst Giyim", ru: "Верх"     } },
  alt:       { icon: "layers-outline",    color: "#818cf8", labels: { en: "Bottom",    az: "Alt geyim", tr: "Alt Giyim", ru: "Низ"      } },
  bottom:    { icon: "layers-outline",    color: "#818cf8", labels: { en: "Bottom",    az: "Alt geyim", tr: "Alt Giyim", ru: "Низ"      } },
  ayaqqabi:  { icon: "footsteps-outline", color: "#34d399", labels: { en: "Footwear",  az: "Ayaqqabı",  tr: "Ayakkabı",  ru: "Обувь"    } },
  footwear:  { icon: "footsteps-outline", color: "#34d399", labels: { en: "Footwear",  az: "Ayaqqabı",  tr: "Ayakkabı",  ru: "Обувь"    } },
  aksesuar:  { icon: "glasses-outline",   color: "#f59e0b", labels: { en: "Accessory", az: "Aksesuar",  tr: "Aksesuar",  ru: "Аксессуар"} },
  accessory: { icon: "glasses-outline",   color: "#f59e0b", labels: { en: "Accessory", az: "Aksesuar",  tr: "Aksesuar",  ru: "Аксессуар"} },
};

function Section({ icon, title, color, children, bgCard, borderAccent }: {
  icon: string; title: string; color: string; children: React.ReactNode;
  bgCard?: string; borderAccent?: string;
}) {
  return (
    <View style={[sectionStyles.card, bgCard ? { backgroundColor: bgCard } : undefined, borderAccent ? { borderColor: borderAccent } : undefined]}>
      <View style={sectionStyles.header}>
        <View style={[sectionStyles.iconBox, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon as any} size={16} color={color} />
        </View>
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card:    { backgroundColor: "rgba(13,21,53,0.85)", borderWidth: 1, borderColor: "rgba(75,142,239,0.15)", borderRadius: 20, padding: 16, marginBottom: 12 },
  header:  { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  iconBox: { width: 30, height: 30, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  title:   { color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
});

export default function AIAdviceScreen() {
  const { isPremium, weather, lang, authState, colors } = useApp();
  const az = lang === "az";

  const [advice,  setAdvice]  = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Saxlanmış məsləhəti yüklə (cari şəhərə uyğundursa)
  useEffect(() => {
    Cache.loadAdvice().then(saved => {
      if (saved?.advice && saved.city === weather?.current?.city) {
        setAdvice(saved.advice);
      }
    });
  }, [weather?.current?.city]);

  if (authState === "guest") {
    return (
      <View style={[styles.lockScreen, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />
        <Ionicons name="lock-closed" size={48} color={colors.dimmed} />
        <Text style={[styles.lockTitle, { color: colors.text }]}>{t("loginRequired", lang)}</Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={[styles.lockScreen, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={["rgba(251,191,36,0.12)", "transparent"]} style={StyleSheet.absoluteFill} />
        <Ionicons name="star" size={52} color={Colors.gold} />
        <Text style={[styles.lockTitle, { color: Colors.gold }]}>Premium</Text>
        <Text style={[styles.lockSub, { color: colors.muted }]}>
          {t("advicePremium", lang)}
        </Text>
      </View>
    );
  }

  function openInMaps(placeName: string) {
    const encoded = encodeURIComponent(placeName);
    Alert.alert(
      placeName,
      t("chooseMap", lang),
      [
        {
          text: "Apple Maps",
          onPress: () => Linking.openURL(`maps://maps.apple.com/?daddr=${encoded}&dirflg=w`),
        },
        {
          text: "Google Maps",
          onPress: async () => {
            const gmUrl = `comgooglemaps://?daddr=${encoded}&directionsmode=walking`;
            const can = await Linking.canOpenURL(gmUrl);
            Linking.openURL(
              can ? gmUrl : `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=walking`
            );
          },
        },
        { text: t("cancel", lang), style: "cancel" },
      ]
    );
  }

  async function getAdvice() {
    if (!weather?.current) return;
    setLoading(true); setError(null); setAdvice(null);
    try {
      const data = await fetchAIAdvice({ weather: weather.current, lang });
      setAdvice(data);
      Cache.saveAdvice(weather.current.city, data);
    } catch {
      setError(t("adviceFailed", lang));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Başlıq */}
        <View style={styles.headerRow}>
          <LinearGradient colors={["#4b8eef","#818cf8"]} style={styles.headerIcon}
            start={{x:0,y:0}} end={{x:1,y:1}}>
            <Ionicons name="flash" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t("aiAdvice", lang)}</Text>
            <Text style={[styles.subtitle, { color: colors.dimmed }]}>{t("aiAdviceSub", lang)}</Text>
          </View>
        </View>

        {/* Hava xülasəsi */}
        {weather?.current && (
          <View style={styles.weatherCard}>
            <Ionicons name="location-outline" size={14} color={Colors.accent} />
            <Text style={[styles.weatherText, { color: colors.muted }]}>
              {weather.current.city} • {weather.current.temp}°C • {weather.current.description}
            </Text>
          </View>
        )}

        {/* Düymə */}
        <TouchableOpacity onPress={getAdvice} disabled={loading} activeOpacity={0.85} style={{ marginBottom: 20 }}>
          <LinearGradient colors={["#4b8eef","#818cf8"]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.btn}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.btnText}>{t("getAdvice", lang)}</Text>
                </>}
          </LinearGradient>
        </TouchableOpacity>

        {/* Xəta */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {/* Nəticə */}
        {advice && (
          <>
            {/* Geyim */}
            {advice.clothing && advice.clothing.length > 0 && (
              <Section icon="shirt-outline" title={t("clothing", lang)} color="#60a5fa" bgCard={colors.bgCard} borderAccent={colors.borderAccent}>
                {advice.clothing.map((item, i) => {
                  // Köhnə format (string array) dəstəyi
                  if (typeof item === "string") {
                    return (
                      <View key={i} style={[styles.clothingRow, i > 0 && styles.clothingBorder]}>
                        <View style={[styles.clothingIconBox, { backgroundColor: "rgba(96,165,250,0.12)" }]}>
                          <Ionicons name="shirt-outline" size={18} color="#60a5fa" />
                        </View>
                        <Text style={styles.clothingItem}>{item}</Text>
                      </View>
                    );
                  }
                  const meta = CLOTHING_META[item.category] ?? CLOTHING_META["aksesuar"];
                  return (
                    <View key={i} style={[styles.clothingRow, i > 0 && styles.clothingBorder]}>
                      <View style={[styles.clothingIconBox, { backgroundColor: `${meta.color}15` }]}>
                        <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                      </View>
                      <View style={styles.clothingTexts}>
                        <View style={styles.clothingTopRow}>
                          <Text style={styles.clothingItem}>{item.item}</Text>
                          <View style={[styles.clothingBadge, { backgroundColor: `${meta.color}15` }]}>
                            <Text style={[styles.clothingBadgeText, { color: meta.color }]}>
                              {meta.labels[lang] ?? meta.labels.en}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.clothingWhy}>{item.why}</Text>
                      </View>
                    </View>
                  );
                })}
              </Section>
            )}

            {/* Xəbərdarlıqlar */}
            {advice.warnings && advice.warnings.length > 0 && (
              <Section icon="warning-outline" title={t("warnings", lang)} color="#f59e0b" bgCard={colors.bgCard} borderAccent={colors.borderAccent}>
                {advice.warnings.map((w, i) => (
                  <View key={i} style={styles.warningRow}>
                    <Ionicons name="alert-circle-outline" size={15} color="#f59e0b" />
                    <Text style={styles.warningText}>{w}</Text>
                  </View>
                ))}
              </Section>
            )}

            {/* Gəzinti marşrutu */}
            {advice.walkingRoute && (
              <Section icon="map-outline" title={t("walkingRoute", lang)} color="#a78bfa" bgCard={colors.bgCard} borderAccent={colors.borderAccent}>
                <View style={[styles.suitableBadge,
                  { backgroundColor: advice.walkingRoute.suitable ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.10)" }]}>
                  <Ionicons
                    name={advice.walkingRoute.suitable ? "checkmark-circle-outline" : "close-circle-outline"}
                    size={14}
                    color={advice.walkingRoute.suitable ? "#34d399" : "#f87171"}
                  />
                  <Text style={[styles.suitableText,
                    { color: advice.walkingRoute.suitable ? "#34d399" : "#f87171" }]}>
                    {advice.walkingRoute.reason}
                  </Text>
                </View>
                {advice.walkingRoute.places.map((place, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.placeRow}
                    onPress={() => openInMaps(place.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.placeNum}>
                      <Text style={styles.placeNumText}>{i + 1}</Text>
                    </View>
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>{place.name}</Text>
                      <Text style={[styles.placeDesc, { color: colors.muted }]}>{place.description}</Text>
                    </View>
                    <Ionicons name="navigate-outline" size={15} color="rgba(167,139,250,0.6)" />
                  </TouchableOpacity>
                ))}
              </Section>
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  scroll:      { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 180 },
  lockScreen:  { flex: 1, backgroundColor: Colors.bg, justifyContent: "center", alignItems: "center", gap: 16, padding: 32 },
  lockTitle:   { color: Colors.text, fontSize: 22, fontWeight: "700" },
  lockSub:     { color: Colors.muted, fontSize: 14, textAlign: "center" },
  headerRow:   { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  headerIcon:  { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  title:       { color: "#fff", fontSize: 20, fontWeight: "800" },
  subtitle:    { color: Colors.dimmed, fontSize: 12, marginTop: 2 },
  weatherCard: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(75,142,239,0.08)", borderWidth: 1, borderColor: "rgba(75,142,239,0.20)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  weatherText: { color: Colors.muted, fontSize: 13 },
  btn:         { height: 52, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  btnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },
  errorBox:    { backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)", borderRadius: 14, padding: 14, marginBottom: 12 },
  errorText:   { color: "rgba(252,165,165,0.90)", fontSize: 13 },
  clothingRow:      { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12 },
  clothingBorder:   { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  clothingIconBox:  { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 1 },
  clothingTexts:    { flex: 1, gap: 4 },
  clothingTopRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  clothingItem:     { color: "#fff", fontSize: 14, fontWeight: "700", flex: 1 },
  clothingBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  clothingBadgeText:{ fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  clothingWhy:      { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 18 },
  warningRow:  { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  warningText: { color: "#fcd34d", fontSize: 13, lineHeight: 20, flex: 1 },
  suitableBadge: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, padding: 10, marginBottom: 12 },
  suitableText:  { fontSize: 13, lineHeight: 19, flex: 1, fontWeight: "500" },
  placeRow:    { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  placeNum:    { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(167,139,250,0.18)", borderWidth: 1, borderColor: "rgba(167,139,250,0.30)", justifyContent: "center", alignItems: "center", marginTop: 1 },
  placeNumText:{ color: "#a78bfa", fontSize: 11, fontWeight: "700" },
  placeInfo:   { flex: 1 },
  placeName:   { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  placeDesc:   { color: Colors.muted, fontSize: 12, lineHeight: 18 },
});
