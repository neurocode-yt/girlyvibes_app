import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { ADVICE_CATEGORIES } from "@/data/advice";
import { ROUTINE_TEMPLATES } from "@/data/routines";
import { AR } from "@/constants/i18n";
import { useColors } from "@/hooks/useColors";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return AR.home.greetingMorning;
  if (hour < 17) return AR.home.greetingAfternoon;
  return AR.home.greetingEvening;
}

function getTip() {
  const tips = [
    "الاتساق أقوى من الكمال. كوني حاضرة لنفسك كل يوم.",
    "ابدئي بخطوات صغيرة. عادة صحية واحدة أفضل من صفر عادات مثالية.",
    "قيمتك لا تُقاس بإنتاجيتك أو مظهرك.",
    "كل يوم تعتنين فيه بنفسك هو يوم تستثمرين فيه في مستقبلك.",
    "الراحة ليست كسلاً. جسمك يحتاج الراحة لينمو ويتألق.",
    "أنتِ بالضبط من تحتاجين أن تكوني الآن، وأنتِ تصبحين أفضل.",
    "اشربي ماء. اغسلي وجهك. كوني لطيفة مع نفسك. كرري.",
    "خطوات صغيرة في الاتجاه الصحيح لا تزال خطوات إلى الأمام.",
  ];
  const today = new Date().getDay();
  return tips[today % tips.length];
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, getRoutineCompletionPercent } = useApp();

  const greeting = getGreeting();
  const dailyTip = getTip();

  const topRoutine = useMemo(() => {
    return ROUTINE_TEMPLATES[0];
  }, []);

  const morningProgress = getRoutineCompletionPercent(
    "morning",
    ROUTINE_TEMPLATES[0].steps.length
  );

  const featuredAdvice = useMemo(() => {
    const allCards = ADVICE_CATEGORIES.flatMap((c) => c.cards);
    const idx = new Date().getDate() % allCards.length;
    return allCards[idx];
  }, []);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const isRTL = I18nManager.isRTL;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "web" ? 100 : 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
              {greeting} ✦
            </Text>
            <Text style={[styles.brandName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
              Girly Vibes
            </Text>
          </View>
          <View style={[styles.headerActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/profile");
              }}
              style={[styles.profileBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.primary} />
            </Pressable>
            <View
              style={[styles.streakBadge, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="flame" size={16} color="#fff" />
              <Text style={styles.streakText}>{data.streak}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Daily Tip */}
        <View
          style={[
            styles.tipCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.tipLabel, { color: colors.primary }]}>
              {AR.home.todayReminder}
            </Text>
          </View>
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            {dailyTip}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons
              name="fire"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>
              {data.streak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {AR.home.dayStreak}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>
              {data.totalRoutinesCompleted}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {AR.home.routinesDone}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons
              name="heart-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>
              {data.favoriteAdvice.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {AR.home.savedReads}
            </Text>
          </View>
        </View>

        {/* Today's Routine Quick Check */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {AR.home.morningRoutineSection}
        </Text>
        <Pressable
          style={[
            styles.routineCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/(tabs)/routines");
          }}
        >
          <View style={styles.routineCardTop}>
            <View>
              <Text
                style={[styles.routineCardTitle, { color: colors.foreground }]}
              >
                {topRoutine.title}
              </Text>
              <Text
                style={[
                  styles.routineCardSub,
                  { color: colors.mutedForeground },
                ]}
              >
                {topRoutine.steps.length} خطوة
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text
                style={[styles.progressPercent, { color: colors.primary }]}
              >
                {morningProgress}%
              </Text>
            </View>
          </View>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${morningProgress}%` as `${number}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>
            {AR.home.tapToContinue}
          </Text>
        </Pressable>

        {/* Glow Up Plan Status */}
        {data.glowUpProgress.activePlanId && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {AR.home.activeplan}
            </Text>
            <Pressable
              style={[
                styles.planBanner,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/glowup");
              }}
            >
              <MaterialCommunityIcons
                name="star-shooting"
                size={24}
                color="#fff"
              />
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={styles.planBannerTitle}>
                  أنتِ في خطة جلو أب! ✨
                </Text>
                <Text style={styles.planBannerSub}>
                  استمري — أنتِ رائعة
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isRTL ? "chevron-left" : "chevron-right"}
                size={18}
                color="#fff"
              />
            </Pressable>
          </>
        )}

        {/* Featured Advice */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {AR.home.readOfDay}
        </Text>
        <Pressable
          style={[
            styles.adviceCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            router.push({
              pathname: "/advice-detail",
              params: { cardId: featuredAdvice.id },
            });
          }}
        >
          <View
            style={[
              styles.advicePill,
              { backgroundColor: colors.highlight },
            ]}
          >
            <Text style={[styles.advicePillText, { color: colors.primary }]}>
              {
                ADVICE_CATEGORIES.find((c) => c.id === featuredAdvice.category)
                  ?.title
              }
            </Text>
          </View>
          <Text style={[styles.adviceTitle, { color: colors.foreground }]}>
            {featuredAdvice.title}
          </Text>
          <Text style={[styles.advicePreview, { color: colors.mutedForeground }]}>
            {featuredAdvice.preview}
          </Text>
          <View style={styles.readMoreRow}>
            <Text style={[styles.readMore, { color: colors.primary }]}>
              اقرئي المزيد
            </Text>
            <Text
              style={[styles.readTime, { color: colors.mutedForeground }]}
            >
              · {featuredAdvice.readTime}
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    gap: 8,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  brandName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  content: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tipLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tipText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
    marginBottom: 4,
  },
  routineCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  routineCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routineCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  routineCardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#C88AA0",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  tapHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  planBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  planBannerTitle: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  planBannerSub: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  adviceCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  advicePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  advicePillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  adviceTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  advicePreview: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    marginBottom: 12,
  },
  readMoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMore: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  readTime: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
