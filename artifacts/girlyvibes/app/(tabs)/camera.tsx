import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppMaterialCommunityIcons as MaterialIcons } from "@/components/Icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterKey = "normal" | "warm" | "cool" | "rose" | "vintage" | "dream" | "mono";

interface FilterConfig {
  emoji: string;
  overlay: string;
  intensity?: number;
  brightness?: number;
}

const FILTER_CONFIGS: Record<FilterKey, FilterConfig> = {
  normal: { emoji: "✨", overlay: "transparent" },
  warm:   { emoji: "☀️", overlay: "rgba(255, 155, 40, 0.28)" },
  cool:   { emoji: "💎", overlay: "rgba(60, 150, 255, 0.24)" },
  rose:   { emoji: "🌹", overlay: "rgba(220, 70, 130, 0.22)" },
  vintage:{ emoji: "🎞️", overlay: "rgba(160, 110, 40, 0.34)" },
  dream:  { emoji: "🌙", overlay: "rgba(170, 110, 255, 0.26)" },
  mono:   { emoji: "🖤", overlay: "rgba(30, 30, 30, 0.38)" },
};

const FILTER_KEYS: FilterKey[] = ["normal", "warm", "cool", "rose", "vintage", "dream", "mono"];

function getFilterLabel(key: FilterKey, t: any, isAR: boolean): string {
  const map: Record<FilterKey, string> = {
    normal:  t.camera.filterNormal,
    warm:    t.camera.filterWarm,
    cool:    t.camera.filterCool,
    rose:    t.camera.filterRose,
    vintage: t.camera.filterVintage,
    dream:   t.camera.filterDream,
    mono:    t.camera.filterMono,
  };
  return map[key];
}

export default function CameraTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("normal");

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === "web") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setSelectedFilter("normal");
      }
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("", t.camera.permissionDenied);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setSelectedFilter("normal");
    }
  };

  const selectFilter = (key: FilterKey) => {
    Haptics.selectionAsync();
    setSelectedFilter(key);
  };

  const filterCfg = FILTER_CONFIGS[selectedFilter];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#FBE4EC", "#FFF9F7"]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Text
          style={[
            styles.title,
            { color: colors.primary, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {t.camera.screenTitle}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {t.camera.screenSubtitle}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={!photoUri ? takePhoto : undefined}
          style={({ pressed }) => [
            styles.photoFrame,
            { borderColor: colors.highlight, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {photoUri ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              {filterCfg.overlay !== "transparent" && (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor: filterCfg.overlay,
                      borderRadius: 20,
                    },
                  ]}
                />
              )}
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {filterCfg.emoji} {getFilterLabel(selectedFilter, t, isRTL)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <MaterialIcons name="camera-outline" size={56} color={colors.primary} />
              <Text
                style={[
                  styles.placeholderText,
                  { color: colors.mutedForeground, textAlign: "center" },
                ]}
              >
                {t.camera.noPhotoYet}
              </Text>
            </View>
          )}
        </Pressable>

        {photoUri && (
          <>
            <View style={styles.filterSection}>
              <Text
                style={[
                  styles.filterLabel,
                  { color: colors.text, textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t.camera.filters}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterStrip}
              >
                {FILTER_KEYS.map((key) => {
                  const cfg = FILTER_CONFIGS[key];
                  const isActive = selectedFilter === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => selectFilter(key)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        {
                          backgroundColor: isActive ? colors.primary : colors.card,
                          borderColor: isActive ? colors.primary : colors.border,
                          transform: [{ scale: pressed ? 0.95 : 1 }],
                        },
                      ]}
                    >
                      <Text style={styles.filterEmoji}>{cfg.emoji}</Text>
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: isActive ? "#fff" : colors.text },
                        ]}
                      >
                        {getFilterLabel(key, t, isRTL)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [
                styles.retakeBtn,
                { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <MaterialIcons name="camera-outline" size={18} color={colors.primary} />
              <Text style={[styles.retakeBtnText, { color: colors.primary }]}>
                {t.camera.retake}
              </Text>
            </Pressable>
          </>
        )}

        {!photoUri && (
          <Pressable
            onPress={takePhoto}
            style={({ pressed }) => [
              styles.takeBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
                shadowColor: colors.primary,
              },
            ]}
          >
            <MaterialIcons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.takeBtnText}>{t.camera.takePhoto}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },
  photoFrame: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#FBE4EC",
  },
  photoWrapper: {
    flex: 1,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 20,
  },
  placeholderText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  filterBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  filterSection: {
    width: "100%",
    maxWidth: 380,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
  },
  filterStrip: {
    gap: 8,
    paddingHorizontal: 2,
  },
  filterChip: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 3,
    minWidth: 64,
  },
  filterEmoji: {
    fontSize: 20,
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  takeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  takeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    marginTop: 4,
  },
  retakeBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
