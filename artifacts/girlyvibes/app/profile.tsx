import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { GLOW_UP_PLANS } from "@/data/glowupPlans";
import { ROUTINE_TEMPLATES } from "@/data/routines";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

function StatBlock({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string | number;
  label: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statBlock, { backgroundColor: color, borderColor: colors.border }]}>
      <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}
// import { supabase } from '@/lib/supabase';

// async function testAnonymousAuth() {
//   const { data, error } = await supabase.auth.signInAnonymously();

//   if (error) {
//     console.log('Supabase Auth error:', error.message);
//     return;
//   }

//   console.log('Anonymous user created:', data.user?.id);
// }


export function ProfileContent({ showBackButton = true }: { showBackButton?: boolean }) {

  // useEffect(() => {
  //   testAnonymousAuth();
  // }, []);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, l, isRTL, toggleLanguage } = useLanguage();
  const { data, getRoutineCompletionPercent, clearData } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const displayName = data.profileName.trim() || t.profile.profileName;

  const activePlan = data.glowUpProgress.activePlanId
    ? GLOW_UP_PLANS.find((p) => p.id === data.glowUpProgress.activePlanId)
    : null;

  const totalTasks = activePlan
    ? activePlan.days.reduce((acc, d) => acc + d.tasks.length, 0)
    : 0;
  const completedTasks = activePlan
    ? Object.values(data.glowUpProgress.completedTasks).filter(Boolean).length
    : 0;
  const planProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 120 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={[styles.header, { paddingTop: topInset + 12 }]}
      >
        <View style={[styles.navRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {showBackButton ? (
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
              hitSlop={12}
              style={[styles.backBtn, { backgroundColor: colors.highlight }]}
            >
              <MaterialCommunityIcons
                name={isRTL ? "arrow-right" : "arrow-left"}
                size={20}
                color={colors.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {t.profile.screenTitle}
          </Text>
          <View style={styles.navActions}>
            <Pressable onPress={toggleLanguage} hitSlop={12}>
              <MaterialCommunityIcons name="translate" size={22} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={12}
              style={[styles.settingsBtn, { backgroundColor: colors.highlight }]}
            >
              <MaterialCommunityIcons name="cog-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.avatarRow}>
          <Pressable
            onPress={() => router.push("/settings")}
            style={[styles.avatarWrapper, { backgroundColor: colors.highlight }]}
          >
            {data.profilePhoto ? (
              <Image
                source={{ uri: data.profilePhoto }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <MaterialCommunityIcons name="star-four-points" size={36} color={colors.primary} />
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="pencil" size={10} color="#fff" />
            </View>
          </Pressable>

          <View style={{ marginTop: 12, alignItems: "center" }}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {displayName}
            </Text>
            <View style={[styles.streakPill, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="fire" size={14} color="#fff" />
              <Text style={styles.streakPillText}>
                {data.streak} {t.profile.dayStreak}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {t.profile.yourStats}
        </Text>
        <View style={styles.statsGrid}>
          <StatBlock icon="fire" value={data.streak} label={t.profile.statStreak} color="#FDEBD0" />
          <StatBlock icon="checkbox-marked-circle-outline" value={data.totalRoutinesCompleted} label={t.profile.statRoutines} color="#FBE4EC" />
          <StatBlock icon="heart" value={data.favoriteAdvice.length} label={t.profile.statSaved} color="#D8C9E8" />
          <StatBlock icon="cellphone-off" value={data.detoxChallenge.checkedInDays.length} label={t.profile.statDetox} color="#D5ECD4" />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {t.profile.activePlan}
        </Text>
        {activePlan ? (
          <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient
              colors={activePlan.gradient}
              style={styles.planGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.planTitle}>{l(activePlan.title, activePlan.titleEn)}</Text>
              <Text style={styles.planTagline}>{l(activePlan.tagline, activePlan.taglineEn)}</Text>
            </LinearGradient>
            <View style={styles.planBody}>
              <View style={styles.planProgressRow}>
                <Text style={[styles.planProgressLabel, { color: colors.foreground }]}>
                  {completedTasks} {t.profile.of} {totalTasks} {t.profile.tasksComplete}
                </Text>
                <Text style={[styles.planProgressNum, { color: colors.primary }]}>
                  {planProgress}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${planProgress}%` as `${number}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.planDay, { color: colors.mutedForeground }]}>
                {activePlan.duration} {t.profile.dayPlan}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="star-outline" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t.profile.noPlan}
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {t.profile.routineProgress}
        </Text>
        <View style={styles.routineList}>
          {ROUTINE_TEMPLATES.map((routine) => {
            const pct = getRoutineCompletionPercent(routine.id, routine.steps.length);
            return (
              <View
                key={routine.id}
                style={[styles.routineRow, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <View style={[styles.routineIcon, { backgroundColor: routine.color }]}>
                  <MaterialCommunityIcons name={routine.emoji} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.routineName, { color: colors.foreground }]}>
                    {l(routine.title, routine.titleEn)}
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: colors.border, marginTop: 6 }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%` as `${number}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.pctText, { color: colors.primary }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        <Pressable
          style={[styles.logoutBtn, { borderColor: colors.border }]}
          onPress={async () => {
            await clearData();
            await supabase.auth.signOut();
          }}
        >
          <MaterialCommunityIcons name="logout" size={20} color={colors.primary} />
          <Text style={[styles.logoutText, { color: colors.foreground }]}>
            {l("تسجيل الخروج", "Log Out")}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export default function ProfileScreen() {
  return <ProfileContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  navRow: { alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  navActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  backBtnPlaceholder: { width: 34, height: 34 },
  settingsBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  avatarRow: { alignItems: "center" },
  avatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 84, height: 84, borderRadius: 42 },
  avatarEditBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  profileName: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 10, marginBottom: 8 },
  streakPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  streakPillText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  content: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginTop: 8, marginBottom: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  statBlock: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 6 },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  planCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden", marginBottom: 4 },
  planGradient: { padding: 18 },
  planTitle: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  planTagline: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  planBody: { padding: 16 },
  planProgressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  planProgressLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  planProgressNum: { fontSize: 16, fontFamily: "Inter_700Bold" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  planDay: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
  emptyCard: { padding: 24, borderRadius: 18, borderWidth: 1, alignItems: "center", gap: 10, marginBottom: 4 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  routineList: { gap: 10 },
  routineRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1 },
  routineIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  routineName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  pctText: { fontSize: 13, fontFamily: "Inter_700Bold", marginLeft: 10 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
