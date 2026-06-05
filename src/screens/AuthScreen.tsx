import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, StatusBar, StyleSheet, Linking, Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";
import { Colors } from "../theme/colors";
import { t } from "../lib/i18n";
import LanguagePicker from "../components/LanguagePicker";

WebBrowser.maybeCompleteAuthSession();

type Tab = "login" | "register";

export default function AuthScreen() {
  const { colors, lang } = useApp();
  const [tab,      setTab]      = useState<Tab>("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [googleLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");

  function switchTab(tab: Tab) { setTab(tab); setError(""); setInfo(""); }

  // OAuth callback URL-dən sessiya yarat (PKCE: ?code=...)
  async function createSessionFromUrl(url: string) {
    const codeMatch = url.match(/[?#&]code=([^&#]+)/);
    if (codeMatch) {
      const code = decodeURIComponent(codeMatch[1]);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      return;
    }
    // Köhnə implicit flow fallback
    const at = url.match(/[?#&]access_token=([^&#]+)/);
    const rt = url.match(/[?#&]refresh_token=([^&#]+)/);
    if (at && rt) {
      await supabase.auth.setSession({
        access_token:  decodeURIComponent(at[1]),
        refresh_token: decodeURIComponent(rt[1]),
      });
    }
  }

  // Deep link handler — Expo Go cancel qaytarsa belə gələn URL-i tutur
  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("code=") || url.includes("access_token=")) {
        createSessionFromUrl(url).catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  async function handleSubmit() {
    setError(""); setInfo("");
    if (!email.trim()) { setError(t("emailRequired", lang)); return; }
    if (password.length < 6) { setError(t("passwordMin", lang)); return; }
    if (tab === "register" && !agreed) { setError(t("acceptTermsError", lang)); return; }

    Keyboard.dismiss();
    setLoading(true);
    try {
      if (tab === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { data: signUpData, error: err } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: name || email.split("@")[0] },
            emailRedirectTo: "https://weathermind-nu.vercel.app/sso-callback",
          },
        });
        if (err) throw err;
        if (!signUpData.session) {
          setInfo(t("confirmEmail", lang));
          switchTab("login");
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("Invalid login"))  setError(t("loginError", lang));
      else if (msg.includes("already"))   setError(t("alreadyExists", lang));
      else if (msg.includes("Password"))  setError(t("passwordMin", lang));
      else setError(msg || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGLoading(true);
    setError("");
    try {
      const redirectTo = makeRedirectUri({ path: "auth" }).replace("//--//", "/--/");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error("No URL");
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === "success" && result.url) {
        await createSessionFromUrl(result.url);
      }
    } catch {
      setError(t("googleFail", lang));
    } finally {
      setGLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={[colors.bgGrad[0], colors.bgGrad[1], colors.bgGrad[0]] as any} style={StyleSheet.absoluteFill} />
      <View style={styles.orb} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Dil seçici */}
          <View style={styles.langRow}>
            <LanguagePicker variant="chip" />
          </View>

          {/* Logo */}
          <View style={styles.logoRow}>
            <LinearGradient
              colors={["#4b8eef", "#818cf8"]}
              style={styles.logoBox}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Ionicons name="partly-sunny" size={26} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.logoText, { color: colors.text }]}>HAVAİ</Text>
              <Text style={[styles.logoSub, { color: colors.dimmed }]}>{t("appSubtitle", lang)}</Text>
            </View>
          </View>

          {/* Başlıq */}
          <View style={styles.titleBlock}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              {tab === "login" ? t("welcomeBack", lang) : t("createAccountTitle", lang)}
            </Text>
            <Text style={[styles.welcomeSub, { color: colors.dimmed }]}>
              {tab === "login" ? t("loginSubtitle", lang) : t("registerSubtitle", lang)}
            </Text>
          </View>

          {/* Kart */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
            {/* Tab */}
            <View style={styles.tabRow}>
              {(["login", "register"] as Tab[]).map((tabKey) => (
                <TouchableOpacity key={tabKey} onPress={() => switchTab(tabKey)}
                  style={[styles.tabBtn, tab === tabKey && styles.tabBtnActive]}>
                  <Text style={[styles.tabText, { color: colors.dimmed }, tab === tabKey && styles.tabTextActive]}>
                    {tabKey === "login" ? t("login", lang) : t("register", lang)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.form}>
              {tab === "register" && (
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.muted }]}>{t("nameLabel", lang)}</Text>
                  <View style={[styles.field, { borderColor: colors.border }]}>
                    <Ionicons name="person-outline" size={15} color={colors.dimmed} style={styles.fieldIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={t("namePlaceholder", lang)}
                      placeholderTextColor={colors.dimmed}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>{t("emailLabel", lang)}</Text>
                <View style={[styles.field, { borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={15} color={colors.dimmed} style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.dimmed}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setError(""); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>{t("passwordLabel", lang)}</Text>
                <View style={[styles.field, { borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={15} color={colors.dimmed} style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 44, color: colors.text }]}
                    placeholder={t("passwordEnterHint", lang)}
                    placeholderTextColor={colors.dimmed}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                    <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={16} color={colors.dimmed} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Şərtlər checkbox — yalnız qeydiyyat */}
              {tab === "register" && (
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => { setAgreed(a => !a); setError(""); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreed && styles.checkboxChecked, { borderColor: agreed ? Colors.accent : colors.border }]}>
                    {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={[styles.termsText, { color: colors.muted }]}>{t("agreeTerms", lang)}</Text>
                </TouchableOpacity>
              )}

              {!!error && (
                <View style={styles.alertErr}>
                  <Text style={styles.alertErrText}>⚠ {error}</Text>
                </View>
              )}
              {!!info && (
                <View style={styles.alertOk}>
                  <Text style={styles.alertOkText}>✓ {info}</Text>
                </View>
              )}

              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={["#4b8eef", "#818cf8"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.submitBtn}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.submitText}>
                        {tab === "login" ? t("signIn", lang) : t("createAccount", lang)}
                      </Text>}
                </LinearGradient>
              </TouchableOpacity>

              {/* Ayırıcı */}
              <View style={styles.divRow}>
                <View style={styles.divLine} />
                <Text style={[styles.divText, { color: colors.dimmed }]}>{t("or", lang)}</Text>
                <View style={styles.divLine} />
              </View>

              {/* Google */}
              <TouchableOpacity
                onPress={handleGoogle}
                disabled={googleLoading}
                style={styles.googleBtn}
                activeOpacity={0.85}
              >
                {googleLoading
                  ? <ActivityIndicator size="small" color={colors.text} />
                  : <>
                      <View style={styles.googleLogo}>
                        <Text style={{ fontSize: 16 }}>G</Text>
                      </View>
                      <Text style={[styles.googleText, { color: colors.text }]}>{t("continueGoogle", lang)}</Text>
                    </>}
              </TouchableOpacity>

              {/* Keçid */}
              <TouchableOpacity onPress={() => switchTab(tab === "login" ? "register" : "login")}>
                <Text style={[styles.switchText, { color: colors.dimmed }]}>
                  {tab === "login" ? t("noAccount", lang) : t("haveAccount", lang)}
                  <Text style={styles.switchLink}>
                    {tab === "login" ? t("register", lang) : t("login", lang)}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.footer, { color: colors.dimmed }]}>{t("footer", lang)}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  orb:           { position: "absolute", width: 500, height: 500, borderRadius: 250, top: -100, alignSelf: "center", backgroundColor: "rgba(75,142,239,0.10)" },
  scroll:        { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 52 },
  langRow:       { alignItems: "center", marginBottom: 24 },
  logoRow:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 32 },
  logoBox:       { width: 56, height: 56, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  logoText:      { fontSize: 28, fontWeight: "800", color: Colors.text, letterSpacing: 1 },
  logoSub:       { fontSize: 12, color: Colors.dimmed, marginTop: 2 },
  titleBlock:    { alignItems: "center", marginBottom: 18 },
  welcomeTitle:  { fontSize: 22, fontWeight: "800", color: Colors.text },
  welcomeSub:    { fontSize: 13, color: Colors.dimmed, marginTop: 4 },
  card:          { backgroundColor: "rgba(8,13,34,0.92)", borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 22, overflow: "hidden" },
  tabRow:        { flexDirection: "row", margin: 12, padding: 4, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, gap: 2 },
  tabBtn:        { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center" },
  tabBtnActive:  { backgroundColor: "rgba(75,142,239,0.18)", borderWidth: 1, borderColor: "rgba(75,142,239,0.30)" },
  tabText:       { fontSize: 13, fontWeight: "600", color: Colors.dimmed },
  tabTextActive: { color: "rgba(186,218,255,0.92)" },
  form:          { padding: 20, paddingTop: 8, gap: 14 },
  fieldGroup:    { gap: 6 },
  fieldLabel:    { fontSize: 12, fontWeight: "600", marginLeft: 2 },
  field:         { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: Colors.border, borderRadius: 14, height: 50 },
  termsRow:      { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 2 },
  checkbox:      { width: 20, height: 20, borderRadius: 6, borderWidth: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)" },
  checkboxChecked:{ backgroundColor: Colors.accent },
  termsText:     { flex: 1, fontSize: 12, lineHeight: 17 },
  fieldIcon:     { marginLeft: 14, marginRight: 6 },
  input:         { flex: 1, color: Colors.text, fontSize: 14, height: "100%", paddingLeft: 6 },
  eyeBtn:        { position: "absolute", right: 14 },
  alertErr:      { backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)", borderRadius: 12, padding: 10 },
  alertErrText:  { color: "rgba(252,165,165,0.90)", fontSize: 12, textAlign: "center" },
  alertOk:       { backgroundColor: "rgba(34,197,94,0.08)", borderWidth: 1, borderColor: "rgba(34,197,94,0.18)", borderRadius: 12, padding: 10 },
  alertOkText:   { color: "rgba(134,239,172,0.90)", fontSize: 12, textAlign: "center" },
  submitBtn:     { height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  submitText:    { color: "#fff", fontSize: 16, fontWeight: "700" },
  divRow:        { flexDirection: "row", alignItems: "center", gap: 10 },
  divLine:       { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  divText:       { color: Colors.dimmed, fontSize: 12 },
  googleBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 50, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14 },
  googleLogo:    { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  googleText:    { color: Colors.text, fontSize: 15, fontWeight: "600" },
  switchText:    { color: Colors.dimmed, fontSize: 13, textAlign: "center" },
  switchLink:    { color: "rgba(147,197,253,0.85)", fontWeight: "600" },
  footer:        { color: Colors.dimmed, fontSize: 11, textAlign: "center", marginTop: 24 },
});
