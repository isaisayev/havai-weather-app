import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Platform, Alert, Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { deleteCity, cancelPremium } from "../lib/api";
import { Colors } from "../theme/colors";
import LanguagePicker from "../components/LanguagePicker";
import { t } from "../lib/i18n";
import {
  NotifPrefs, loadNotifPrefs, saveNotifPrefs,
  requestNotificationPermission, cancelMorningForecast,
} from "../lib/notifications";
import DateTimePicker from "@react-native-community/datetimepicker";


function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}
function Divider() { return <View style={styles.divider} />; }

export default function ProfileScreen({ navigation }: any) {
  const { user, authState, isPremium, setIsPremium, logout, lang, unit, setUnit,
    theme, setTheme, colors,
    savedCities, setSavedCities, setCity } = useApp();
  const az = lang === "az";

  const [editingName, setEditingName]   = useState(false);
  const [nameDraft,   setNameDraft]     = useState(user?.name ?? "");
  const [savingName,  setSavingName]    = useState(false);
  const [logoutStep,    setLogoutStep]    = useState(0);
  const [cancelStep,    setCancelStep]    = useState(0);
  const [cancelling,    setCancelling]    = useState(false);
  const [notifPrefs,    setNotifPrefs]    = useState<NotifPrefs | null>(null);
  const [showTimePicker,setShowTimePicker] = useState(false);

  useEffect(() => {
    loadNotifPrefs().then(setNotifPrefs);
  }, []);

  async function updatePref<K extends keyof NotifPrefs>(key: K, value: NotifPrefs[K]) {
    if (!notifPrefs) return;
    // Bildirişlər ilk dəfə açılırsa icazə istə
    if (key === "enabled" && value === true) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    // Bildirişlər söndürülərsə səhər bildirişini ləğv et
    if (key === "enabled" && value === false) {
      await cancelMorningForecast();
    }
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    await saveNotifPrefs(updated);
  }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  async function handleSaveName() {
    if (!nameDraft.trim()) return;
    setSavingName(true);
    await supabase.auth.updateUser({ data: { full_name: nameDraft.trim() } });
    await supabase.from("users").update({ name: nameDraft.trim() })
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
    setSavingName(false);
    setEditingName(false);
  }

  async function handleRemoveCity(city_name: string) {
    await deleteCity(city_name);
    setSavedCities(prev => prev.filter(c => c.city_name !== city_name));
  }

  async function handleCancelPremium() {
    if (cancelStep === 0) { setCancelStep(1); return; }
    setCancelling(true);
    try {
      await cancelPremium();
      setIsPremium(false);
      setCancelStep(0);
      Alert.alert(
        t("subCancelledTitle", lang),
        t("subCancelledMsg", lang)
      );
    } catch {
      Alert.alert(t("errorTitle", lang), t("cancelFailed", lang));
      setCancelStep(0);
    } finally {
      setCancelling(false);
    }
  }

  async function handleLogout() {
    if (logoutStep === 0) { setLogoutStep(1); return; }
    await logout();
  }

  function handleDeleteAccount() {
    Alert.alert(
      t("deleteConfirmTitle", lang),
      t("deleteConfirmMsg", lang),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: t("delete", lang), style: "destructive",
          onPress: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            await fetch("https://weathermind-nu.vercel.app/api/user/delete-account", {
              method: "DELETE",
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            await logout();
          },
        },
      ]
    );
  }

  if (authState === "guest") {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />
        <View style={styles.guestBox}>
          <Ionicons name="person-circle-outline" size={72} color={colors.dimmed} />
          <Text style={[styles.guestTitle, { color: colors.text }]}>{t("signInAccount", lang)}</Text>
          <Text style={[styles.guestSub, { color: colors.muted }]}>{t("syncDevices", lang)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={[styles.avatarCard, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }, isPremium && styles.avatarCardPremium]}>
          <View style={[styles.avatar, isPremium && styles.avatarPremium]}>
            <Text style={[styles.avatarText, isPremium && { color: Colors.gold }]}>{initials}</Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={9} color="#000" />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity onPress={handleSaveName} disabled={savingName}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditingName(false); setNameDraft(user?.name ?? ""); }}>
                  <Ionicons name="close-circle" size={22} color={colors.dimmed} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
                <TouchableOpacity onPress={() => setEditingName(true)}>
                  <Ionicons name="pencil-outline" size={14} color={colors.dimmed} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={[styles.userEmail, { color: colors.muted }]}>{user?.email}</Text>
            {isPremium && (
              <View style={styles.premiumTag}>
                <Ionicons name="flash" size={10} color={Colors.gold} />
                <Text style={styles.premiumTagText}>PREMIUM</Text>
              </View>
            )}
          </View>
        </View>

        {/* Abunəlik */}
        <SectionTitle>{t("subscription", lang)}</SectionTitle>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name={isPremium ? "star" : "star-outline"} size={17}
                color={isPremium ? Colors.gold : colors.dimmed} />
              <Text style={[styles.rowLabel, { color: colors.muted }]}>{isPremium ? "Premium" : t("freePlan", lang)}</Text>
            </View>
            {!isPremium && (
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation?.navigate?.("Premium")}>
                <Text style={styles.upgradeBtnText}>{t("upgrade", lang)}</Text>
              </TouchableOpacity>
            )}
          </View>

          {isPremium && (
            <>
              <View style={[styles.divider]} />
              <TouchableOpacity
                style={styles.row}
                onPress={handleCancelPremium}
                disabled={cancelling}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="close-circle-outline" size={17} color="rgba(252,165,165,0.70)" />
                  <Text style={[styles.rowLabel, { color: "rgba(252,165,165,0.80)" }]}>
                    {cancelling
                      ? t("cancelling", lang)
                      : cancelStep === 1
                        ? t("cancelConfirm", lang)
                        : t("cancelSubTitle", lang)}
                  </Text>
                </View>
                {cancelStep === 1 && !cancelling && (
                  <TouchableOpacity onPress={() => setCancelStep(0)}>
                    <Ionicons name="close" size={18} color={colors.dimmed} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </>
          )}

        </View>

        {/* Saxlanılmış şəhərlər */}
        {savedCities.length > 0 && (
          <>
            <SectionTitle>{t("savedCities", lang)}</SectionTitle>
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
              {savedCities.map((c, i) => (
                <React.Fragment key={c.id}>
                  {i > 0 && <Divider />}
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.rowLeft} onPress={() => setCity(c.city_name)}>
                      <Ionicons name="location-outline" size={15} color={Colors.accent} />
                      <Text style={[styles.rowLabel, { color: colors.text }]}>{c.city_name}</Text>
                      {c.country && <Text style={[styles.countryText, { color: colors.dimmed }]}>{c.country}</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveCity(c.city_name)}>
                      <Ionicons name="close-circle-outline" size={18} color={colors.dimmed} />
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* Bildirişlər */}
        {notifPrefs && (
          <>
            <SectionTitle>{t("notifications", lang)}</SectionTitle>
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
              {/* Əsas açar/bağla */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name="notifications-outline" size={17} color={colors.dimmed} />
                  <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("notifications", lang)}</Text>
                </View>
                <Switch
                  value={notifPrefs.enabled}
                  onValueChange={v => updatePref("enabled", v)}
                  trackColor={{ false: "rgba(255,255,255,0.10)", true: Colors.accent }}
                  thumbColor="#fff"
                />
              </View>

              {notifPrefs.enabled && (
                <>
                  <Divider />
                  {/* Səhər proqnozu */}
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Ionicons name="sunny-outline" size={17} color={colors.dimmed} />
                      <View>
                        <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("morningForecast", lang)}</Text>
                        {notifPrefs.morning_forecast && (
                          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.subLabel}>{notifPrefs.morning_time} ›</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <Switch
                      value={notifPrefs.morning_forecast}
                      onValueChange={v => updatePref("morning_forecast", v)}
                      trackColor={{ false: "rgba(255,255,255,0.10)", true: Colors.accent }}
                      thumbColor="#fff"
                    />
                  </View>

                  {/* Native vaxt seçici */}
                  {notifPrefs.morning_forecast && showTimePicker && (
                    <DateTimePicker
                      mode="time"
                      display="spinner"
                      value={(() => {
                        const [h, m] = notifPrefs.morning_time.split(":").map(Number);
                        const d = new Date(); d.setHours(h, m, 0, 0); return d;
                      })()}
                      onChange={(_, date) => {
                        setShowTimePicker(false);
                        if (date) {
                          const h = date.getHours().toString().padStart(2, "0");
                          const m = date.getMinutes().toString().padStart(2, "0");
                          updatePref("morning_time", `${h}:${m}`);
                        }
                      }}
                      textColor="#fff"
                      accentColor={Colors.accent}
                    />
                  )}

                  <Divider />
                  {/* Yağış xəbərdarlığı */}
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Ionicons name="rainy-outline" size={17} color={colors.dimmed} />
                      <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("rainAlert", lang)}</Text>
                    </View>
                    <Switch
                      value={notifPrefs.rain_alert}
                      onValueChange={v => updatePref("rain_alert", v)}
                      trackColor={{ false: "rgba(255,255,255,0.10)", true: Colors.accent }}
                      thumbColor="#fff"
                    />
                  </View>
                  <Divider />
                  {/* Fırtına xəbərdarlığı */}
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Ionicons name="thunderstorm-outline" size={17} color={colors.dimmed} />
                      <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("stormAlert", lang)}</Text>
                    </View>
                    <Switch
                      value={notifPrefs.storm_alert}
                      onValueChange={v => updatePref("storm_alert", v)}
                      trackColor={{ false: "rgba(255,255,255,0.10)", true: Colors.accent }}
                      thumbColor="#fff"
                    />
                  </View>
                  <Divider />
                  {/* Həddindən artıq istilik/soyuq */}
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Ionicons name="thermometer-outline" size={17} color={colors.dimmed} />
                      <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("tempExtremes", lang)}</Text>
                    </View>
                    <Switch
                      value={notifPrefs.extreme_temp}
                      onValueChange={v => updatePref("extreme_temp", v)}
                      trackColor={{ false: "rgba(255,255,255,0.10)", true: Colors.accent }}
                      thumbColor="#fff"
                    />
                  </View>
                </>
              )}
            </View>
          </>
        )}

        {/* Görünüş */}
        <SectionTitle>{t("display", lang)}</SectionTitle>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
          {/* Tema */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="color-palette-outline" size={17} color={colors.dimmed} />
              <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("theme", lang)}</Text>
            </View>
          </View>
          <View style={styles.themeRow}>
            {([
              { key: "dark",     icon: "moon",   tkey: "themeDark"     },
              { key: "midnight", icon: "planet", tkey: "themeMidnight" },
              { key: "light",    icon: "sunny",  tkey: "themeLight"    },
            ] as const).map(th => (
              <TouchableOpacity key={th.key}
                style={[styles.themeCard, { borderColor: colors.border }, theme === th.key && styles.themeCardActive]}
                onPress={() => setTheme(th.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={th.icon as any} size={20}
                  color={theme === th.key ? Colors.accent : colors.dimmed} />
                <Text style={[styles.themeLabel, { color: colors.dimmed }, theme === th.key && { color: Colors.accent }]}>
                  {t(th.tkey, lang)}
                </Text>
                {theme === th.key && (
                  <View style={styles.themeCheck}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Divider />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="thermometer-outline" size={17} color={colors.dimmed} />
              <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("temperature", lang)}</Text>
            </View>
            <View style={[styles.toggle, { borderColor: colors.border }]}>
              {(["C","F"] as const).map(u => (
                <TouchableOpacity key={u} onPress={() => setUnit(u)}
                  style={[styles.toggleBtn, unit === u && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleText, { color: colors.dimmed }, unit === u && styles.toggleTextActive]}>°{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Divider />
          <LanguagePicker variant="row" />
        </View>

        {/* Hesab */}
        <SectionTitle>{t("account", lang)}</SectionTitle>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
          <TouchableOpacity style={styles.row} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="log-out-outline" size={17}
                color={logoutStep === 1 ? "rgba(252,165,165,0.9)" : colors.dimmed} />
              <Text style={[styles.rowLabel, { color: colors.muted }, logoutStep === 1 && { color: "rgba(252,165,165,0.9)" }]}>
                {logoutStep === 1 ? t("confirmLogout", lang) : t("signOut", lang)}
              </Text>
            </View>
            {logoutStep === 1 && (
              <TouchableOpacity onPress={() => setLogoutStep(0)}>
                <Ionicons name="close" size={18} color={colors.dimmed} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={17} color="rgba(252,165,165,0.60)" />
              <Text style={[styles.rowLabel, { color: "rgba(252,165,165,0.75)" }]}>
                {t("deleteAccount", lang)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Haqqında */}
        <SectionTitle>{t("about", lang)}</SectionTitle>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("version", lang)}</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>1.0.0</Text>
          </View>
          <Divider />
          <TouchableOpacity style={styles.row} activeOpacity={0.7}
            onPress={() => Alert.alert(
              t("contactUs", lang),
              "isa03082001@gmail.com"
            )}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={17} color={colors.dimmed} />
              <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("contact", lang)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={colors.dimmed} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.row} activeOpacity={0.7}
            onPress={() => Alert.alert(
              t("rateTitle", lang),
              t("rateMsg", lang)
            )}>
            <View style={styles.rowLeft}>
              <Ionicons name="star-outline" size={17} color={colors.dimmed} />
              <Text style={[styles.rowLabel, { color: colors.muted }]}>{t("rateApp", lang)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={colors.dimmed} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.bg },
  scroll:           { paddingTop: Platform.OS === "ios" ? 56 : 40, paddingHorizontal: 16, paddingBottom: 180 },
  guestBox:         { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 32 },
  guestTitle:       { color: Colors.text, fontSize: 20, fontWeight: "700" },
  guestSub:         { color: Colors.muted, fontSize: 14, textAlign: "center" },
  sectionTitle:     { color: Colors.dimmed, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 18, marginLeft: 4 },
  card:             { backgroundColor: "rgba(13,21,53,0.80)", borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 20, overflow: "hidden", marginBottom: 4 },
  row:              { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft:          { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  rowLabel:         { color: Colors.muted, fontSize: 14 },
  rowValue:         { color: Colors.text, fontSize: 14, fontWeight: "600" },
  countryText:      { color: Colors.dimmed, fontSize: 12 },
  divider:          { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginHorizontal: 16 },
  avatarCard:       { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(13,21,53,0.80)", borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 20, padding: 16, marginBottom: 4 },
  avatarCardPremium:{ borderColor: Colors.goldBorder },
  avatar:           { width: 58, height: 58, borderRadius: 18, backgroundColor: "rgba(75,142,239,0.14)", borderWidth: 1, borderColor: Colors.borderAccent, justifyContent: "center", alignItems: "center" },
  avatarPremium:    { backgroundColor: Colors.goldBg, borderColor: Colors.goldBorder },
  avatarText:       { color: Colors.accent, fontSize: 22, fontWeight: "700" },
  premiumBadge:     { position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.gold, justifyContent: "center", alignItems: "center" },
  nameRow:          { flexDirection: "row", alignItems: "center", gap: 8 },
  nameEditRow:      { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  nameInput:        { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "700", backgroundColor: "rgba(75,142,239,0.10)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  userName:         { color: Colors.text, fontSize: 16, fontWeight: "700" },
  userEmail:        { color: Colors.muted, fontSize: 12, marginTop: 3 },
  premiumTag:       { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, backgroundColor: Colors.goldBg, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" },
  premiumTagText:   { color: Colors.gold, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  upgradeBtn:       { backgroundColor: Colors.goldBg, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  upgradeBtnText:   { color: Colors.gold, fontSize: 12, fontWeight: "700" },
  toggle:           { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
  toggleBtn:        { paddingHorizontal: 14, paddingVertical: 7 },
  toggleBtnActive:  { backgroundColor: "rgba(75,142,239,0.22)" },
  toggleText:       { color: Colors.dimmed, fontSize: 13, fontWeight: "600" },
  toggleTextActive: { color: Colors.accent },
  themeRow:         { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  themeCard:        { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: Colors.border },
  themeCardActive:  { backgroundColor: "rgba(75,142,239,0.12)", borderColor: Colors.accent },
  themeLabel:       { color: Colors.dimmed, fontSize: 11, fontWeight: "700" },
  themeCheck:       { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.accent, justifyContent: "center", alignItems: "center" },
  subLabel:         { color: Colors.accent, fontSize: 12, marginTop: 2 },
});
