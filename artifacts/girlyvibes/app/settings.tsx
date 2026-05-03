import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, l, isRTL } = useLanguage();
  const { data, updateProfile } = useApp();

  const [name, setName] = useState(data.profileName);
  const [photo, setPhoto] = useState<string | null>(data.profilePhoto);
  const [saving, setSaving] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  async function pickPhoto() {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          l("إذن مطلوب", "Permission Required"),
          l("يرجى السماح بالوصول إلى مكتبة الصور", "Please allow access to your photo library")
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  async function removePhoto() {
    setPhoto(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function save() {
    setSaving(true);
    await updateProfile(name.trim(), photo);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingTop: topInset + 12 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.navRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons
              name={isRTL ? "arrow-right" : "arrow-left"}
              size={24}
              color={colors.foreground}
            />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {l("الإعدادات", "Settings")}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.photoSection}>
          <Pressable onPress={pickPhoto} style={[styles.avatarBtn, { backgroundColor: colors.highlight }]}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus-outline" size={32} color={colors.primary} />
                <Text style={[styles.avatarHint, { color: colors.primary }]}>
                  {l("أضيفي صورة", "Add photo")}
                </Text>
              </>
            )}
          </Pressable>

          <View style={styles.photoActions}>
            <Pressable
              style={[styles.photoActionBtn, { backgroundColor: colors.primary }]}
              onPress={pickPhoto}
            >
              <MaterialCommunityIcons name="image-edit-outline" size={16} color="#fff" />
              <Text style={styles.photoActionText}>
                {l("تغيير الصورة", "Change photo")}
              </Text>
            </Pressable>
            {photo && (
              <Pressable
                style={[styles.photoActionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                onPress={removePhoto}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.mutedForeground} />
                <Text style={[styles.photoActionText, { color: colors.mutedForeground }]}>
                  {l("حذف الصورة", "Remove")}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            {l("الاسم", "Your name")}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="account-outline" size={20} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
              value={name}
              onChangeText={setName}
              placeholder={l("اكتبي اسمك هنا...", "Enter your name...")}
              placeholderTextColor={colors.mutedForeground}
              maxLength={40}
              returnKeyType="done"
              autoCapitalize="words"
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.saveBtn,
            { backgroundColor: saving ? colors.mutedForeground : colors.primary },
          ]}
          onPress={save}
          disabled={saving}
        >
          <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>
            {saving ? l("جاري الحفظ...", "Saving...") : l("حفظ", "Save")}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 24,
  },
  navRow: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  photoSection: {
    alignItems: "center",
    gap: 16,
  },
  avatarBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarHint: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  photoActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  photoActionText: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
