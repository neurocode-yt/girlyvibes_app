import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginBottom: isWeb ? 0 : 2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0.5,
          borderTopColor: colors.border,
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: t.tabs.routines,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="glowup"
        options={{
          title: t.tabs.glowup,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="star-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="advice"
        options={{
          title: t.tabs.advice,
          tabBarIcon: ({ color }) => (
            <Feather name="heart" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="boredom"
        options={{
          title: t.tabs.boredom,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dice-5-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
