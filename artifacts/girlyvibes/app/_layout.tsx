import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { mciFont, featherFont, ioniconsFont } from "@/components/Icons";
import { AppProvider } from "@/contexts/AppContext";
import { getStoredLang, LanguageProvider } from "@/contexts/LanguageContext";
import { Lang } from "@/constants/i18n";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="advice-detail"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [lang, setLang] = useState<Lang | null>(null);

  useEffect(() => {
    async function loadAll() {
      try {
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          [mciFont]: require("../assets/fonts/MaterialCommunityIcons.ttf"),
          [featherFont]: require("../assets/fonts/Feather.ttf"),
          [ioniconsFont]: require("../assets/fonts/Ionicons.ttf"),
        });
        if (Platform.OS !== "web") {
          console.log("[FONTS] All fonts loaded. mciFont=" + mciFont,
            "featherFont=" + featherFont, "ioniconsFont=" + ioniconsFont);
          console.log("[FONTS] isLoaded:", mciFont + "=" + Font.isLoaded(mciFont),
            featherFont + "=" + Font.isLoaded(featherFont),
            ioniconsFont + "=" + Font.isLoaded(ioniconsFont));
        }
      } catch (e) {
        console.warn("[FONTS] Font loading error:", e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadAll();
  }, []);

  useEffect(() => {
    getStoredLang().then((l) => setLang(l));
  }, []);

  useEffect(() => {
    if (fontsLoaded && lang !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, lang]);

  if (!fontsLoaded || lang === null) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <LanguageProvider initialLang={lang}>
                <AppProvider>
                  <RootLayoutNav />
                </AppProvider>
              </LanguageProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
