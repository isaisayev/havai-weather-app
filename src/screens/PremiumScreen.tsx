import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Linking, ActivityIndicator, Animated, Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useApp } from "../context/AppContext";
import { Colors } from "../theme/colors";
import { t } from "../lib/i18n";
import { createCheckout } from "../lib/api";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const FEATURES = [
  "feat7day", "featAdvice", "featChat", "featHealth",
  "featWarnings", "featRoute", "featCities", "featAdFree", "featSupport",
] as const;

export default function PremiumScreen() {
  const { lang, isPremium, colors, refreshPremium } = useApp();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  // Tac ikonu animasiyası
  const crown = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(crown, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(crown, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const rotate = crown.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-8deg", "8deg", "-8deg"] });

  async function openCheckout() {
    setLoading(true);
    try {
      const returnUrl = makeRedirectUri({ path: "premium" }).replace("//--//", "/--/");
      const url = await createCheckout(billing, returnUrl);
      if (!url) {
        Linking.openURL("https://weathermind-nu.vercel.app/premium");
        return;
      }
      // Ödəniş sessiyası — ödənişdən sonra körpü səhifə app-ə qaytarır,
      // openAuthSessionAsync həmin qayıdışı tutub brauzeri bağlayır
      await WebBrowser.openAuthSessionAsync(url, returnUrl);
      // Premium statusunu yoxla (webhook gecikə bilər)
      for (let i = 0; i < 4; i++) {
        const prem = await refreshPremium();
        if (prem) break;
        if (i < 3) await delay(1500);
      }
    } catch {
      Linking.openURL("https://weathermind-nu.vercel.app/premium");
    } finally {
      setLoading(false);
    }
  }

  // Premium aktiv ekranı
  if (isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={["rgba(251,191,36,0.14)", "transparent"]} style={StyleSheet.absoluteFill} />
        <View style={styles.activeBox}>
          <View style={styles.goldIcon}>
            <Ionicons name="star" size={40} color={Colors.gold} />
          </View>
          <Text style={styles.activeTitle}>{t("premiumActive", lang)}</Text>
          <Text style={styles.activeSub}>{t("premiumActiveSub", lang)}</Text>
        </View>
      </View>
    );
  }

  const price   = billing === "yearly" ? "$19.99" : "$2.99";
  const per     = billing === "yearly" ? t("perYear", lang) : t("perMonth", lang);
  const effMo   = billing === "yearly" ? `$1.67${t("perMonthShort", lang)} · ${t("save44", lang)}` : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["rgba(251,191,36,0.08)", "transparent"]} style={[StyleSheet.absoluteFill, { bottom: "55%" }]} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.crownBox, { transform: [{ rotate }] }]}>
            <LinearGradient
              colors={["rgba(251,191,36,0.22)", "rgba(249,115,22,0.12)"]}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="star" size={34} color={Colors.gold} />
          </Animated.View>
          <Text style={styles.title}>HAVAİ Premium</Text>
          <Text style={styles.sub}>{t("premiumTagline", lang)}</Text>
        </View>

        {/* Aylıq / İllik toggle */}
        <View style={styles.toggle}>
          {(["monthly", "yearly"] as const).map(b => (
            <TouchableOpacity
              key={b}
              style={[styles.toggleBtn, billing === b && styles.toggleBtnActive]}
              onPress={() => setBilling(b)}
              activeOpacity={0.85}
            >
              {billing === b && (
                <LinearGradient
                  colors={["#f59e0b", "#f97316"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.toggleText, billing === b && styles.toggleTextActive]}>
                {b === "monthly" ? t("monthly", lang) : t("yearly", lang)}
              </Text>
              {b === "yearly" && (
                <View style={[styles.discBadge, billing === b && styles.discBadgeActive]}>
                  <Text style={[styles.discText, billing === b && { color: "#000" }]}>-44%</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium kart */}
        <View style={styles.planCard}>
          <LinearGradient
            colors={["rgba(14,9,0,0.5)", "rgba(8,13,34,0.5)"]}
            style={StyleSheet.absoluteFill}
          />
          {/* Tövsiyə badge */}
          <View style={styles.recBadge}>
            <Ionicons name="flash" size={11} color="#000" />
            <Text style={styles.recBadgeText}>{t("recommended", lang)}</Text>
          </View>

          <View style={styles.planHead}>
            <View style={styles.planIcon}>
              <Ionicons name="star" size={18} color={Colors.gold} />
            </View>
            <Text style={styles.planName}>Premium</Text>
          </View>

          {/* Qiymət */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.pricePer}>{per}</Text>
          </View>
          {effMo && <Text style={styles.effMo}>{effMo}</Text>}

          {/* Funksiyalar */}
          <View style={styles.features}>
            {FEATURES.map(f => (
              <View key={f} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={12} color={Colors.gold} />
                </View>
                <Text style={styles.featureText}>{t(f as any, lang)}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity onPress={openCheckout} disabled={loading} activeOpacity={0.85} style={styles.btnWrap}>
            <LinearGradient
              colors={["#f59e0b", "#f97316"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="star" size={16} color="#000" />
                  <Text style={styles.btnText}>{t("getPremium", lang)}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <Ionicons name="lock-closed" size={11} color={Colors.dimmed} />
            <Text style={styles.secureText}>{t("securePayment", lang)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  scroll:       { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 120 },
  header:       { alignItems: "center", marginBottom: 24 },
  crownBox:     { width: 80, height: 80, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: Colors.goldBorder, overflow: "hidden" },
  title:        { color: Colors.text, fontSize: 26, fontWeight: "800", marginBottom: 8 },
  sub:          { color: Colors.muted, fontSize: 14, textAlign: "center", maxWidth: 280 },

  toggle:       { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 4, marginBottom: 18 },
  toggleBtn:    { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 11, borderRadius: 12, overflow: "hidden" },
  toggleBtnActive:{ },
  toggleText:   { color: Colors.muted, fontSize: 14, fontWeight: "700" },
  toggleTextActive:{ color: "#000" },
  discBadge:    { backgroundColor: "rgba(52,211,153,0.20)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  discBadgeActive:{ backgroundColor: "rgba(0,0,0,0.25)" },
  discText:     { color: "#34d399", fontSize: 10, fontWeight: "800" },

  planCard:     { backgroundColor: "rgba(13,21,53,0.6)", borderWidth: 1.5, borderColor: "rgba(251,191,36,0.50)", borderRadius: 24, padding: 22, paddingTop: 28, overflow: "hidden", shadowColor: Colors.gold, shadowOpacity: 0.18, shadowRadius: 30, elevation: 14 },
  recBadge:     { position: "absolute", top: 0, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.gold, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 14, paddingVertical: 5 },
  recBadgeText: { color: "#000", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  planHead:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  planIcon:     { width: 36, height: 36, borderRadius: 11, backgroundColor: "rgba(251,191,36,0.18)", borderWidth: 1, borderColor: "rgba(251,191,36,0.30)", justifyContent: "center", alignItems: "center" },
  planName:     { color: Colors.gold, fontSize: 17, fontWeight: "800" },
  priceRow:     { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  price:        { color: "#fff", fontSize: 46, fontWeight: "200", letterSpacing: -1 },
  pricePer:     { color: Colors.muted, fontSize: 16, marginBottom: 10 },
  effMo:        { color: "#34d399", fontSize: 13, fontWeight: "600", marginTop: 2, marginBottom: 4 },
  features:     { marginTop: 18, marginBottom: 20, gap: 12 },
  featureRow:   { flexDirection: "row", alignItems: "center", gap: 11 },
  checkCircle:  { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(251,191,36,0.15)", justifyContent: "center", alignItems: "center" },
  featureText:  { color: "rgba(255,255,255,0.80)", fontSize: 14, flex: 1 },
  btnWrap:      { borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  btn:          { height: 54, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  btnText:      { color: "#000", fontSize: 17, fontWeight: "800" },
  secureRow:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  secureText:   { color: Colors.dimmed, fontSize: 12 },

  activeBox:    { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 32 },
  goldIcon:     { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.goldBg, borderWidth: 1, borderColor: Colors.goldBorder, justifyContent: "center", alignItems: "center" },
  activeTitle:  { color: Colors.gold, fontSize: 26, fontWeight: "800" },
  activeSub:    { color: Colors.muted, fontSize: 15, textAlign: "center" },
});
