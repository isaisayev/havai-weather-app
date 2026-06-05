import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { LANG_OPTIONS } from "../lib/i18n";
import { Colors } from "../theme/colors";

interface Props {
  /** "chip" — kiçik kart (auth ekranı), "row" — sətir (profil) */
  variant?: "chip" | "row";
}

export default function LanguagePicker({ variant = "chip" }: Props) {
  const { lang, setLang, colors } = useApp();
  const [open, setOpen] = useState(false);

  const current = LANG_OPTIONS.find(l => l.code === lang) ?? LANG_OPTIONS[0];

  return (
    <>
      {variant === "chip" ? (
        <TouchableOpacity
          style={[styles.chip, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={16} color={Colors.accent} />
          <Text style={[styles.chipText, { color: colors.text }]}>{current.label}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.dimmed} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.row}
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="globe-outline" size={17} color={colors.dimmed} />
            <Text style={[styles.rowLabel, { color: colors.muted }]}>{current.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={15} color={colors.dimmed} />
        </TouchableOpacity>
      )}

      {/* Seçim modalı */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.bgCard, borderColor: colors.borderAccent }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Ionicons name="globe-outline" size={18} color={Colors.accent} />
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Language</Text>
            </View>
            {LANG_OPTIONS.map(opt => {
              const active = opt.code === lang;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.option, active && { backgroundColor: "rgba(75,142,239,0.10)" }]}
                  onPress={() => { setLang(opt.code); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, { color: active ? Colors.accent : colors.text }]}>
                    {opt.label}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip:        { flexDirection: "row", alignItems: "center", gap: 7, alignSelf: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, borderWidth: 1 },
  chipText:    { fontSize: 13, fontWeight: "700" },

  row:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft:     { flexDirection: "row", alignItems: "center", gap: 10 },
  rowLabel:    { fontSize: 14 },

  overlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  sheet:       { width: "100%", maxWidth: 320, borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1 },
  sheetTitle:  { fontSize: 15, fontWeight: "700" },
  option:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 15 },
  optionText:  { fontSize: 15, fontWeight: "600" },
});
