import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HoldEmojiBurst } from "@/components/HoldEmojiBurst";
import { AppProvider } from "@/contexts/AppContext";
import { getStoredLang, LanguageProvider } from "@/contexts/LanguageContext";
import { Lang } from "@/constants/i18n";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="advice-detail" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="profile" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="settings" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [lang, setLang] = useState<Lang | null>(null);
  const [ready, setReady] = useState(false);
  const splashHidden = useRef(false);

  const hideSplash = () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  };

  useEffect(() => {
    getStoredLang().then(setLang).catch(() => setLang("ar"));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && lang !== null) {
      hideSplash();
      setReady(true);
    }
  }, [fontsLoaded, fontError, lang]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lang === null) setLang("ar");
      hideSplash();
      setReady(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <LanguageProvider initialLang={lang ?? "ar"}>
              <AppProvider>
                <HoldEmojiBurst>
                  <RootLayoutNav />
                </HoldEmojiBurst>
              </AppProvider>
            </LanguageProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
