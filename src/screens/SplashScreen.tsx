import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { Colors } from "../theme/colors";

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOp    = useRef(new Animated.Value(0)).current;
  const titleOp   = useRef(new Animated.Value(0)).current;
  const titleY    = useRef(new Animated.Value(20)).current;
  const subOp     = useRef(new Animated.Value(0)).current;
  const exitFade  = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(require("../../assets/animations/splash.mp4"), p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOp, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(titleOp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 45, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(subOp, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(4400),
      Animated.timing(exitFade, { toValue: 1, duration: 600, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Real AI-yaradılmış hava videosu — tam ekran fon */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* Mətnin oxunması üçün gradient örtük */}
      <LinearGradient
        colors={["rgba(8,13,34,0.15)", "rgba(8,13,34,0.30)", "rgba(8,13,34,0.80)"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Məzmun */}
      <View style={styles.content}>
        <Animated.View style={{ opacity: logoOp, transform: [{ scale: logoScale }] }}>
          <LinearGradient
            colors={["#4b8eef", "#818cf8", "#22d3ee"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Ionicons name="partly-sunny" size={42} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
          HAVAİ
        </Animated.Text>
        <Animated.Text style={[styles.sub, { opacity: subOp }]}>
          AI Weather Assistant
        </Animated.Text>
      </View>

      {/* Çıxış örtüyü — qeydiyyat ekranına hamar keçid */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bg, opacity: exitFade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f28", alignItems: "center", justifyContent: "center" },
  content:   { alignItems: "center", position: "absolute", bottom: "20%" },
  logoBox:   { width: 86, height: 86, borderRadius: 26, justifyContent: "center", alignItems: "center", marginBottom: 20, shadowColor: "#4b8eef", shadowOpacity: 0.6, shadowRadius: 28, elevation: 18 },
  title:     { color: "#fff", fontSize: 38, fontWeight: "800", letterSpacing: 3, marginBottom: 8 },
  sub:       { color: "rgba(255,255,255,0.7)", fontSize: 14, letterSpacing: 0.5 },
});
