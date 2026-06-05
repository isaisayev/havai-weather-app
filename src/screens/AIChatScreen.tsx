import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { CONFIG } from "../lib/config";
import { supabase } from "../lib/supabase";
import { Cache } from "../lib/cache";
import { Colors } from "../theme/colors";
import { t } from "../lib/i18n";

type Msg = { id: string; role: "user" | "ai"; text: string };

const ROLES = [
  { key: "friend",   icon: "happy-outline",      color: "#34d399" },
  { key: "expert",   icon: "school-outline",      color: "#60a5fa" },
  { key: "official", icon: "briefcase-outline",   color: "#818cf8" },
  { key: "humor",    icon: "happy",               color: "#f59e0b" },
] as const;

export default function AIChatScreen() {
  const { isPremium, authState, lang, weather, colors } = useApp();
  const az = lang === "az";

  const [role,      setRole]      = useState(ROLES[0]);
  const [messages,  setMessages]  = useState<Msg[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const listRef = useRef<FlatList>(null);

  // Rol dəyişdikdə həmin rolun saxlanmış tarixçəsini yüklə
  useEffect(() => {
    Cache.loadChat(role.key).then(saved => setMessages(saved));
  }, [role.key]);

  // Rol dəyişdir (tarixçəni silmədən)
  function selectRole(r: typeof ROLES[number]) {
    if (r.key === role.key) return;
    setRole(r);
  }

  // Tarixçəni saxla (mesaj dəyişdikcə)
  function persist(msgs: Msg[]) {
    Cache.saveChat(role.key, msgs);
  }

  function clearCurrent() {
    setMessages([]);
    Cache.clearChat(role.key);
  }

  if (authState === "guest" || !isPremium) {
    return (
      <View style={[styles.lock, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill}/>
        {!isPremium && <LinearGradient colors={["rgba(251,191,36,0.12)","transparent"]} style={StyleSheet.absoluteFill}/>}
        <Ionicons name={authState==="guest" ? "lock-closed" : "star"} size={52}
          color={authState==="guest" ? colors.dimmed : Colors.gold}/>
        <Text style={[styles.lockTitle, { color: colors.text }, authState!=="guest" && {color:Colors.gold}]}>
          {authState==="guest" ? t("loginRequired", lang) : "Premium"}
        </Text>
        <Text style={[styles.lockSub, { color: colors.muted }]}>
          {t("premiumRequired", lang)}
        </Text>
      </View>
    );
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Msg = { id: Date.now().toString(), role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      const res = await fetch(`${CONFIG.apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          role:           role.key,
          lang,
          weatherContext: weather?.current ?? null,
          messages:       history.slice(-15).map(m => ({
            role:    m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      const aiText = data.content ?? t("aiError", lang);
      setMessages(prev => { const next = [...prev, { id: (Date.now()+1).toString(), role: "ai" as const, text: aiText }]; persist(next); return next; });
    } catch {
      setMessages(prev => { const next = [...prev, { id: (Date.now()+1).toString(), role: "ai" as const, text: t("aiErrorRetry", lang) }]; persist(next); return next; });
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg}/>
      <LinearGradient colors={colors.bgGrad as any} style={StyleSheet.absoluteFill}/>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={["#4b8eef","#818cf8"]} style={styles.headerIcon}
            start={{x:0,y:0}} end={{x:1,y:1}}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#fff"/>
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>{t("aiChat", lang)}</Text>
            <Text style={[styles.headerSub, {color: role.color}]}>
              {t(role.key, lang)}
            </Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearCurrent} style={[styles.clearBtn, { borderColor: colors.border }]}>
            <Ionicons name="trash-outline" size={16} color={colors.dimmed}/>
          </TouchableOpacity>
        )}
      </View>

      {/* Rol seçimi */}
      <View style={styles.roleRow}>
        {ROLES.map(r => (
          <TouchableOpacity key={r.key}
            onPress={() => selectRole(r)}
            style={[styles.roleChip, { borderColor: colors.border }, role.key===r.key && {backgroundColor:`${r.color}20`, borderColor:r.color}]}
          >
            <Ionicons name={r.icon as any} size={14} color={role.key===r.key ? r.color : colors.dimmed}/>
            <Text style={[styles.roleLabel, { color: colors.dimmed }, role.key===r.key && {color:r.color}]}>
              {t(r.key, lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mesajlar */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconBox, {backgroundColor:`${role.color}15`}]}>
              <Ionicons name={role.icon as any} size={36} color={role.color}/>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {(lang === "az" || lang === "tr")
                ? `${t(role.key, lang)} ${t("chatWithRole", lang)}`
                : `${t("chatWithRole", lang)} ${t(role.key, lang)}`}
            </Text>
            <Text style={[styles.emptySub, { color: colors.dimmed }]}>
              {t("askWeather", lang)}
            </Text>
            <View style={styles.suggestions}>
              {[t("suggest1", lang), t("suggest2", lang), t("suggest3", lang)].map((s, i) => (
                <TouchableOpacity key={i} style={[styles.suggestion, {borderColor:`${role.color}40`}]}
                  onPress={() => { setInput(s); }}>
                  <Text style={[styles.suggestionText, {color:role.color}]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, item.role==="user" ? styles.rowUser : styles.rowAI]}>
            {item.role === "ai" && (
              <View style={[styles.avatar, {backgroundColor:`${role.color}20`}]}>
                <Ionicons name={role.icon as any} size={14} color={role.color}/>
              </View>
            )}
            <View style={[styles.bubble,
              item.role==="user"
                ? [styles.bubbleUser, {backgroundColor: role.color}]
                : [styles.bubbleAI, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]
            ]}>
              <Text style={[styles.bubbleText, { color: colors.text }, item.role==="user" && {color:"#fff"}]}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Yazır göstəricisi */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={[styles.avatar, {backgroundColor:`${role.color}20`}]}>
            <Ionicons name={role.icon as any} size={14} color={role.color}/>
          </View>
          <View style={[styles.typingBubble, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}>
            <ActivityIndicator size="small" color={role.color}/>
            <Text style={[styles.typingText, {color:role.color}]}>
              {t("typing", lang)}
            </Text>
          </View>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS==="ios" ? "padding" : "height"}
        style={styles.inputWrapper}>
        <View style={styles.inputBar}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder={t("typeMessage", lang)}
            placeholderTextColor={colors.dimmed}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity onPress={send} disabled={loading || !input.trim()}
            style={[styles.sendBtn, {backgroundColor: input.trim() ? role.color : "rgba(255,255,255,0.08)"}]}>
            <Ionicons name="send" size={17} color={input.trim() ? "#fff" : colors.dimmed}/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  lock:           { flex: 1, backgroundColor: Colors.bg, justifyContent: "center", alignItems: "center", gap: 14, padding: 32 },
  lockTitle:      { color: Colors.text, fontSize: 22, fontWeight: "700" },
  lockSub:        { color: Colors.muted, fontSize: 14, textAlign: "center" },

  header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: Platform.OS==="ios" ? 56 : 40, paddingBottom: 12 },
  headerLeft:     { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon:     { width: 40, height: 40, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  headerTitle:    { color: "#fff", fontSize: 17, fontWeight: "800" },
  headerSub:      { fontSize: 12, fontWeight: "600", marginTop: 1 },
  clearBtn:       { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: Colors.border, justifyContent: "center", alignItems: "center" },

  roleRow:        { flexDirection: "row", paddingHorizontal: 14, gap: 8, marginBottom: 8 },
  roleChip:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
  roleLabel:      { color: Colors.dimmed, fontSize: 11, fontWeight: "700" },

  list:           { paddingHorizontal: 14, paddingBottom: 12, flexGrow: 1 },
  empty:          { flex: 1, alignItems: "center", gap: 10, paddingTop: 40 },
  emptyIconBox:   { width: 72, height: 72, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  emptyTitle:     { color: Colors.text, fontSize: 17, fontWeight: "700" },
  emptySub:       { color: Colors.dimmed, fontSize: 13, textAlign: "center", maxWidth: 240 },
  suggestions:    { gap: 8, marginTop: 8, width: "100%" },
  suggestion:     { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.03)" },
  suggestionText: { fontSize: 13, fontWeight: "600", textAlign: "center" },

  row:            { flexDirection: "row", alignItems: "flex-end", marginBottom: 8, gap: 8 },
  rowUser:        { justifyContent: "flex-end" },
  rowAI:          { justifyContent: "flex-start" },
  avatar:         { width: 30, height: 30, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  bubble:         { maxWidth: "78%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser:     { borderBottomRightRadius: 5 },
  bubbleAI:       { backgroundColor: "rgba(13,21,53,0.90)", borderWidth: 1, borderColor: "rgba(75,142,239,0.15)", borderBottomLeftRadius: 5 },
  bubbleText:     { color: Colors.text, fontSize: 14, lineHeight: 21 },

  typingRow:      { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingBottom: 6 },
  typingBubble:   { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(13,21,53,0.90)", borderWidth: 1, borderColor: "rgba(75,142,239,0.15)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  typingText:     { fontSize: 12, fontWeight: "600" },

  inputWrapper:   { marginBottom: Platform.OS==="ios" ? 84 : 76 },
  inputBar:       { flexDirection: "row", gap: 10, paddingHorizontal: 14, paddingVertical: 10, paddingBottom: Platform.OS==="ios" ? 12 : 10, backgroundColor: "rgba(8,13,34,0.96)", borderTopWidth: 1, borderTopColor: "rgba(75,142,239,0.12)" },
  input:          { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: Colors.border, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, color: Colors.text, fontSize: 14, maxHeight: 100 },
  sendBtn:        { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", alignSelf: "flex-end" },
});
