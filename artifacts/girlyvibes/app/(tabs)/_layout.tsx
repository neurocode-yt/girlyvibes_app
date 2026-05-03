import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import {
  AppFeather as Feather,
  AppIonicons as Ionicons,
  AppMaterialCommunityIcons as MaterialCommunityIcons,
} from "@/components/Icons";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

function AnimatedTabButton(props: any) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  }));

  return (
    <Pressable
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.78, { damping: 10, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 6, stiffness: 180 });
      }}
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole={props.accessibilityRole}
      accessibilityState={props.accessibilityState}
      style={[props.style, { overflow: "hidden" }]}
    >
      <Animated.View style={animStyle}>{props.children}</Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const tabBarButton = (props: any) => <AnimatedTabButton {...props} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 9,
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
        tabBarButton,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: t.tabs.routines,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="checkbox-marked-circle-outline"
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="glowup"
        options={{
          title: t.tabs.glowup,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="star-outline"
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="advice"
        options={{
          title: t.tabs.advice,
          tabBarIcon: ({ color }) => (
            <Feather name="heart" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t.chat.screenTitle,
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="boredom"
        options={{
          title: t.tabs.boredom,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="dice-5-outline"
              size={21}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
