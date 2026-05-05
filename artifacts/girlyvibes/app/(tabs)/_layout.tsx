import { Tabs } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, Line, Path } from "react-native-svg";

import { useLanguage } from "@/contexts/LanguageContext";

type TabGlyphName = "home" | "routines" | "glowup" | "advice" | "chat" | "boredom" | "diary" | "profile";

function TabGlyph({
  color,
  focused,
  name,
}: {
  color: string;
  focused?: boolean;
  name: TabGlyphName;
}) {
  const size = focused ? 27 : 24;
  const strokeWidth = focused ? 2.1 : 1.9;
  const softFill = focused ? color : "none";

  if (name === "home") {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M5 15.5 L16 6 L27 15.5" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 14.5 V27 H24 V14.5" fill={softFill} opacity={focused ? 0.18 : 1} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <Path d="M13 27 V20 H19 V27" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <Circle cx="22" cy="21" r="1.6" fill={color} opacity="0.75" />
      </Svg>
    );
  }

  if (name === "routines") {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M7 25 L23.5 8.5 C25.4 6.6 28 9.2 26.1 11.1 L10 27.2" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Line key={i} x1={10 + i * 2.6} y1={22 - i * 2.6} x2={14 + i * 2.6} y2={26 - i * 2.6} stroke={color} strokeWidth="1.35" strokeLinecap="round" opacity="0.9" />
        ))}
      </Svg>
    );
  }

  if (name === "glowup") {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Ellipse cx="17" cy="12.5" rx="6.5" ry="8" fill={softFill} opacity={focused ? 0.18 : 1} stroke={color} strokeWidth={strokeWidth} />
        <Path d="M14 20 L9 27" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        <Path d="M23 3 L24.7 7.2 L29 8.8 L24.7 10.4 L23 15 L21.3 10.4 L17 8.8 L21.3 7.2 Z" fill={color} opacity="0.78" />
        <Circle cx="8" cy="8" r="1.6" fill={color} opacity="0.55" />
      </Svg>
    );
  }

  if (name === "profile") {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Circle cx="16" cy="11" r="5" fill={softFill} opacity={focused ? 0.18 : 1} stroke={color} strokeWidth={strokeWidth} />
        <Path d="M7 27 C8.2 20.5 12 17.5 16 17.5 C20 17.5 23.8 20.5 25 27 Z" fill={softFill} opacity={focused ? 0.16 : 1} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <Path d="M23 5 L24.2 8 L27 9.2 L24.2 10.4 L23 13.5 L21.8 10.4 L19 9.2 L21.8 8 Z" fill={color} opacity="0.68" />
      </Svg>
    );
  }

  if (name === "advice") {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path
          d="M16 27 C8 20.2 5 17.2 5 12.5 C5 9.5 7.4 7 10.3 7 C12.5 7 14.4 8.2 16 10 C17.6 8.2 19.5 7 21.7 7 C24.6 7 27 9.5 27 12.5 C27 17.2 24 20.2 16 27 Z"
          fill={focused ? color : "none"}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === "chat") {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M6 15 C6 9.8 10.5 6 16 6 C21.5 6 26 9.8 26 15 C26 20.2 21.5 24 16 24 C14.6 24 13.3 23.8 12.1 23.3 L7 25 L8.5 20.8 C6.9 19.3 6 17.3 6 15 Z" fill={softFill} opacity={focused ? 0.15 : 1} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <Circle cx="12.5" cy="15" r="1.2" fill={color} />
        <Circle cx="16" cy="15" r="1.2" fill={color} />
        <Circle cx="19.5" cy="15" r="1.2" fill={color} />
      </Svg>
    );
  }

  if (name === "boredom") {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M7 13 H25 L23 27 H9 Z" fill={softFill} opacity={focused ? 0.16 : 1} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <Path d="M11 13 C11 8 21 8 21 13" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        <Path d="M12 11 L10 6 M16 10 L16 5 M20 11 L22 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <Circle cx="12" cy="7" r="1.5" fill="#E6B45E" stroke={color} strokeWidth="0.7" />
        <Circle cx="16" cy="5" r="1.4" fill="#98C9A3" stroke={color} strokeWidth="0.7" />
        <Circle cx="22" cy="6" r="1.5" fill="#E8A7B4" stroke={color} strokeWidth="0.7" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M9 5 H22 L26 9 V27 H9 Z" fill={softFill} opacity={focused ? 0.16 : 1} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M22 5 V10 H26" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {[10, 14, 18, 22].map((y) => (
        <Line key={y} x1="6" y1={y} x2="11" y2={y} stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      ))}
      <Line x1="14" y1="16" x2="22" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="14" y1="21" x2="20" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function AnimatedTabButton(props: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const isCenter = Boolean(props.center);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.78,
      useNativeDriver: true,
      speed: 26,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole={props.accessibilityRole}
      accessibilityState={props.accessibilityState}
      style={[props.style, styles.tabButton, isCenter && styles.centerTabButton]}
    >
      <Animated.View
        style={[
          styles.tabButtonInner,
          isCenter && styles.centerTabButtonInner,
          { transform: [{ scale }] },
        ]}
      >
        {props.children}
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const isWeb = Platform.OS === "web";

  const tabBarButton = (props: any) => <AnimatedTabButton {...props} />;
  const centerTabBarButton = (props: any) => <AnimatedTabButton {...props} center />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8E4B5A",
        tabBarInactiveTintColor: "#8C6C78",
        tabBarActiveBackgroundColor: "rgba(181, 91, 114, 0.18)",
        tabBarShowLabel: true,
        tabBarIconStyle: {
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: "Inter_500Medium",
          lineHeight: 12,
          marginBottom: isWeb ? 0 : 4,
        },
        tabBarItemStyle: {
          borderRadius: 14,
          height: isWeb ? 58 : 60,
          marginHorizontal: 0,
          marginVertical: 6,
          paddingTop: 3,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#F2C4CF",
          borderTopWidth: isWeb ? 1 : 0.5,
          borderTopColor: "rgba(126, 83, 68, 0.18)",
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          shadowColor: "#7D4B45",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 5,
          paddingHorizontal: 4,
          paddingTop: 4,
          ...(isWeb ? { height: 84 } : { height: 82 + insets.bottom }),
        },
        tabBarBackground: () =>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#F2C4CF" },
            ]}
          />,
        tabBarButton,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: t.tabs.routines,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="routines" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: t.tabs.diary,
          tabBarButton: centerTabBarButton,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="diary" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="glowup"
        options={{
          title: t.tabs.glowup,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="glowup" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="profile" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="advice"
        options={{
          href: null,
          title: t.tabs.advice,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="advice" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          title: t.chat.screenTitle,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="chat" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="boredom"
        options={{
          href: null,
          title: t.tabs.boredom,
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="boredom" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    overflow: "visible",
  },
  tabButtonInner: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  centerTabButton: {
    marginTop: -24,
  },
  centerTabButtonInner: {
    backgroundColor: "#F8D6DE",
    borderColor: "rgba(126, 83, 68, 0.18)",
    borderRadius: 24,
    borderWidth: 1,
    height: 70,
    shadowColor: "#8E4B5A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    width: 68,
    elevation: 6,
  },
});
