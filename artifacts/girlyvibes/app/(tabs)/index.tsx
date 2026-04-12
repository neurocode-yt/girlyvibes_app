import { AppIonicons as Ionicons, AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
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
import { ADVICE_CATEGORIES } from "@/data/advice";
import { ROUTINE_TEMPLATES } from "@/data/routines";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { Translations } from "@/constants/i18n";

function getGreeting(t: Translations) {
  const hour = new Date().getHours();
  if (hour < 12) return t.home.greetingMorning;
  if (hour < 17) return t.home.greetingAfternoon;
  return t.home.greetingEvening;
}

const AR_TIPS = [
  "الاتساق أقوى من الكمال. كوني حاضرة لنفسك كل يوم.",
  "ابدئي بخطوات صغيرة. عادة صحية واحدة أفضل من صفر عادات مثالية.",
  "قيمتك لا تُقاس بإنتاجيتك أو مظهرك.",
  "كل يوم تعتنين فيه بنفسك هو يوم تستثمرين فيه في مستقبلك.",
  "الراحة ليست كسلاً. جسمك يحتاج الراحة لينمو ويتألق.",
  "أنتِ بالضبط من تحتاجين أن تكوني الآن، وأنتِ تصبحين أفضل.",
  "اشربي ماء. اغسلي وجهك. كوني لطيفة مع نفسك. كرري.",
  "خطوات صغيرة في الاتجاه الصحيح لا تزال خطوات إلى الأمام.",
];
const EN_TIPS = [
  "Consistency beats perfection. Show up for yourself every day.",
  "Start small. One healthy habit beats zero perfect ones.",
  "Your worth isn't measured by productivity or appearance.",
  "Every day you care for yourself is a day you invest in your future.",
  "Rest isn't laziness. Your body needs it to grow and glow.",
  "You're exactly who you need to be right now, and you're becoming better.",
  "Drink water. Wash your face. Be kind to yourself. Repeat.",
  "Small steps in the right direction are still steps forward.",
];
function getTip(lang: string) {
  const tips = lang === "ar" ? AR_TIPS : EN_TIPS;
  const today = new Date().getDay();
  return tips[today % tips.length];
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, getRoutineCompletionPercent } = useApp();
  const { t, l, lang, isRTL } = useLanguage();

  const greeting = getGreeting(t);
  const dailyTip = getTip(lang);

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
              {t.home.todayReminder}
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
              {t.home.dayStreak}
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
              {t.home.routinesDone}
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
              {t.home.savedReads}
            </Text>
          </View>
        </View>

        {/* Today's Routine Quick Check */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {t.home.morningRoutineSection}
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
                {l(topRoutine.title, topRoutine.titleEn)}
              </Text>
              <Text
                style={[
                  styles.routineCardSub,
                  { color: colors.mutedForeground },
                ]}
              >
                {topRoutine.steps.length} {l("خطوة", "steps")}
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
            {t.home.tapToContinue}
          </Text>
        </Pressable>

        {/* Glow Up Plan Status */}
        {data.glowUpProgress.activePlanId && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t.home.activeplan}
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
                  {l("أنتِ في خطة جلو أب! ✨", "You're on a Glow Up plan! ✨")}
                </Text>
                <Text style={styles.planBannerSub}>
                  {l("استمري — أنتِ رائعة", "Keep going — you're amazing")}
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
          {t.home.readOfDay}
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
              {(() => {
                const cat = ADVICE_CATEGORIES.find((c) => c.id === featuredAdvice.category);
                return cat ? l(cat.title, cat.titleEn) : "";
              })()}
            </Text>
          </View>
          <Text style={[styles.adviceTitle, { color: colors.foreground }]}>
            {l(featuredAdvice.title, featuredAdvice.titleEn)}
          </Text>
          <Text style={[styles.advicePreview, { color: colors.mutedForeground }]}>
            {l(featuredAdvice.preview, featuredAdvice.previewEn)}
          </Text>
          <View style={styles.readMoreRow}>
            <Text style={[styles.readMore, { color: colors.primary }]}>
              {l("اقرئي المزيد", "Read more")}
            </Text>
            <Text
              style={[styles.readTime, { color: colors.mutedForeground }]}
            >
              · {l(featuredAdvice.readTime, featuredAdvice.readTimeEn)}
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
