import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useApp } from "../context/AppContext";
import { Colors } from "../theme/colors";
import { t } from "../lib/i18n";

import HomeScreen     from "../screens/HomeScreen";
import SavedScreen    from "../screens/SavedScreen";
import AIAdviceScreen from "../screens/AIAdviceScreen";
import AIChatScreen   from "../screens/AIChatScreen";
import ProfileScreen  from "../screens/ProfileScreen";
import PremiumScreen  from "../screens/PremiumScreen";
import AuthScreen     from "../screens/AuthScreen";
import SplashScreen   from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TABS = [
  { name: "Home",     tkey: "tabWeather", icon: "partly-sunny",        iconOff: "partly-sunny-outline" },
  { name: "Saved",    tkey: "savedTab",   icon: "bookmark",            iconOff: "bookmark-outline" },
  { name: "AIAdvice", tkey: "tabAI",      icon: "flash",               iconOff: "flash-outline" },
  { name: "AIChat",   tkey: "tabChat",    icon: "chatbubble-ellipses", iconOff: "chatbubble-ellipses-outline" },
  { name: "Profile",  tkey: "tabProfile", icon: "person",              iconOff: "person-outline" },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { lang, colors } = useApp();

  return (
    <View style={styles.tabBarWrapper}>
      <BlurView intensity={60} tint="dark"
        style={[styles.tabBarBlur, { borderColor: colors.tabBorder }]}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            const tab     = TABS.find(tb => tb.name === route.name)!;
            const focused = state.index === index;
            const label   = t(tab.tkey, lang);

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.7}
              >
                {focused ? (
                  <LinearGradient
                    colors={["#4b8eef", "#818cf8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activePill}
                  >
                    <Ionicons name={tab.icon as any} size={20} color="#fff" />
                    <Text style={styles.activePillLabel}>{label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveItem}>
                    <Ionicons name={tab.iconOff as any} size={22} color={Colors.dimmed} />
                    <Text style={styles.inactiveLabel}>{label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Saved"    component={SavedScreen}    />
      <Tab.Screen name="AIAdvice" component={AIAdviceScreen} />
      <Tab.Screen name="AIChat"   component={AIChatScreen}   />
      <Tab.Screen name="Profile"  component={ProfileScreen}  />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Premium"  component={PremiumScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { authState } = useApp();
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 5100);
    return () => clearTimeout(timer);
  }, []);

  if (splash || authState === "loading") {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState === "guest" ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 16,
    left: 20,
    right: 20,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  tabBarBlur: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  tabBarInner: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 18,
  },
  activePillLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  inactiveItem: {
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
  },
  inactiveLabel: {
    color: Colors.dimmed,
    fontSize: 10,
    fontWeight: "600",
  },
});
