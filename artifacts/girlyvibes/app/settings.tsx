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
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, l, isRTL } = useLanguage();
  const { data, updateProfile } = useApp();
  const { session } = useAuth();

  const [name, setName] = useState(data.profileName);
  const [photo, setPhoto] = useState<string | null>(data.profilePhoto);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const isAnonymousUser = session?.user?.is_anonymous === true;

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
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
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

  async function changeAccountPassword() {
    const password = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (password.length < 6) {
      Alert.alert(
        l("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù‚ØµÙŠØ±Ø©", "Password too short"),
        l("Ø§Ø³ØªØ®Ø¯Ù…ÙŠ 6 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.", "Use at least 6 characters."),
      );
      return;
    }

    if (password !== confirm) {
      Alert.alert(
        l("ÙƒÙ„Ù…ØªØ§ Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚ØªÙŠÙ†", "Passwords do not match"),
        l("Ø£Ø¹ÙŠØ¯ÙŠ ÙƒØªØ§Ø¨Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù„Ù„ØªØ£ÙƒØ¯.", "Please confirm the same password."),
      );
      return;
    }

    try {
      setSavingPassword(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        l("ØªÙ… ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", "Password changed"),
        l("ØªÙ… ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø­Ø³Ø§Ø¨Ùƒ.", "Your account password has been updated."),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(
        l("ØªØ¹Ø°Ø± ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", "Could not change password"),
        message || l("ØªØ£ÙƒØ¯ÙŠ Ù…Ù† Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª Ø«Ù… Ø­Ø§ÙˆÙ„ÙŠ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.", "Check your internet connection and try again."),
      );
    } finally {
      setSavingPassword(false);
    }
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

        {!isAnonymousUser && (
          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <MaterialCommunityIcons name="lock-reset" size={22} color={colors.primary} />
              <Text style={[styles.securityTitle, { color: colors.foreground }]}>
                {l("ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø§Ù„Ø­Ø³Ø§Ø¨", "Change account password")}
              </Text>
            </View>
            <Text style={[styles.securityHint, { color: colors.mutedForeground }]}>
              {l(
                "ÙŠØ­ØªØ§Ø¬ ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¥Ù„Ù‰ Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª Ù„Ø£Ù†Ù‡ Ø¢Ù…Ù† ÙˆÙ…Ø±ØªØ¨Ø· Ø¨Ø®Ø§Ø¯Ù… Ø§Ù„Ø¯Ø®ÙˆÙ„.",
                "Account password changes require internet because they are secured by the login server."
              )}
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={l("ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø©", "New password")}
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="lock-check-outline" size={20} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={l("ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", "Confirm password")}
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Pressable
              style={[styles.passwordBtn, { backgroundColor: savingPassword ? colors.mutedForeground : colors.foreground }]}
              onPress={changeAccountPassword}
              disabled={savingPassword}
            >
              <MaterialCommunityIcons name="shield-check-outline" size={18} color="#fff" />
              <Text style={styles.passwordBtnText}>
                {savingPassword ? l("Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ø¯ÙŠØ«...", "Updating...") : l("ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", "Change password")}
              </Text>
            </Pressable>
          </View>
        )}

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
  securityCard: {
    gap: 12,
  },
  securityHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  securityTitle: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  securityHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
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
  passwordBtn: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 14,
  },
  passwordBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
