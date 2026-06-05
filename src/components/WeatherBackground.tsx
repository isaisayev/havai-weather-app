import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";

type BgConfig =
  | { type: "video"; src: any; poster: any }
  | { type: "image"; src: any };

const DAY_BG: Record<string, BgConfig> = {
  sunny:         { type: "video", src: require("../../assets/backgrounds/sunny-bg.mp4"),  poster: require("../../assets/backgrounds/sunny-bg.jpg") },
  clear:         { type: "video", src: require("../../assets/backgrounds/sunny-bg.mp4"),  poster: require("../../assets/backgrounds/sunny-bg.jpg") },
  partly_cloudy: { type: "video", src: require("../../assets/backgrounds/home-bg.mp4"),   poster: require("../../assets/backgrounds/home-bg.jpg") },
  cloudy:        { type: "image", src: require("../../assets/backgrounds/cloudy-bg.jpg") },
  rainy:         { type: "video", src: require("../../assets/backgrounds/rain-bg.mp4"),   poster: require("../../assets/backgrounds/forecast-bg.jpg") },
  drizzle:       { type: "video", src: require("../../assets/backgrounds/rain-bg.mp4"),   poster: require("../../assets/backgrounds/forecast-bg.jpg") },
  stormy:        { type: "video", src: require("../../assets/backgrounds/storm-bg.mp4"),  poster: require("../../assets/backgrounds/storm-bg.jpg") },
  snowy:         { type: "image", src: require("../../assets/backgrounds/snowy-bg.jpg") },
  foggy:         { type: "image", src: require("../../assets/backgrounds/foggy-bg.jpg") },
  windy:         { type: "image", src: require("../../assets/backgrounds/foggy-bg.jpg") },
};

const NIGHT_BG: Record<string, BgConfig> = {
  sunny:         { type: "video", src: require("../../assets/backgrounds/night-clear.mp4"),  poster: require("../../assets/backgrounds/dark-bg.jpg") },
  clear:         { type: "video", src: require("../../assets/backgrounds/night-clear.mp4"),  poster: require("../../assets/backgrounds/dark-bg.jpg") },
  partly_cloudy: { type: "video", src: require("../../assets/backgrounds/night-clear.mp4"),  poster: require("../../assets/backgrounds/dark-bg.jpg") },
  cloudy:        { type: "video", src: require("../../assets/backgrounds/night-cloudy.mp4"), poster: require("../../assets/backgrounds/dark-bg.jpg") },
  foggy:         { type: "video", src: require("../../assets/backgrounds/night-cloudy.mp4"), poster: require("../../assets/backgrounds/dark-bg.jpg") },
  rainy:         { type: "video", src: require("../../assets/backgrounds/night-rain.mp4"),   poster: require("../../assets/backgrounds/dark-bg.jpg") },
  drizzle:       { type: "video", src: require("../../assets/backgrounds/night-rain.mp4"),   poster: require("../../assets/backgrounds/dark-bg.jpg") },
  stormy:        { type: "video", src: require("../../assets/backgrounds/night-rain.mp4"),   poster: require("../../assets/backgrounds/dark-bg.jpg") },
  snowy:         { type: "video", src: require("../../assets/backgrounds/night-snow.mp4"),   poster: require("../../assets/backgrounds/dark-bg.jpg") },
  windy:         { type: "video", src: require("../../assets/backgrounds/night-cloudy.mp4"), poster: require("../../assets/backgrounds/dark-bg.jpg") },
};

const DEFAULT_BG: BgConfig = { type: "image", src: require("../../assets/backgrounds/dark-bg.jpg") };

interface Props {
  condition?: string;
  isNight?:   boolean;
  children:   React.ReactNode;
}

function VideoBg({ src, isNight, children }: { src: any; isNight?: boolean; children: React.ReactNode }) {
  const player = useVideoPlayer(src, p => {
    p.loop   = true;
    p.muted  = true;
    p.play();
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
      <LinearGradient
        colors={
          isNight
            ? ["rgba(2,6,23,0.66)", "rgba(2,6,23,0.40)", "rgba(2,6,23,0.60)", "rgba(2,6,23,0.92)"]
            : ["rgba(0,0,0,0.55)", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.42)", "rgba(0,0,0,0.85)"]
        }
        locations={[0, 0.28, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

export default function WeatherBackground({ condition, isNight, videoBg = true, children }: Props) {
  const map = isNight ? NIGHT_BG : DAY_BG;
  const bg: BgConfig = (condition && map[condition]) ? map[condition] : DEFAULT_BG;

  if (bg.type === "video" && videoBg) {
    return <VideoBg src={bg.src} isNight={isNight}>{children}</VideoBg>;
  }

  return (
    <ImageBackground source={bg.src} style={styles.container} resizeMode="cover">
      <LinearGradient
        colors={
          isNight
            ? ["rgba(2,6,23,0.66)", "rgba(2,6,23,0.40)", "rgba(2,6,23,0.60)", "rgba(2,6,23,0.92)"]
            : ["rgba(0,0,0,0.55)", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.42)", "rgba(0,0,0,0.85)"]
        }
        locations={[0, 0.28, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
