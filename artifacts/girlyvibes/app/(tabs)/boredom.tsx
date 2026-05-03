import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { DETOX_CHALLENGES, type Activity } from "@/data/boredom";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActivities } from "@/hooks/useActivities";
import { getActivityImage } from "@/lib/activityImages";

function ActivityCard({
  activity,
  highlighted,
}: {
  activity: Activity;
  highlighted: boolean;
}) {
  const colors = useColors();
  const { l } = useLanguage();
  const image = getActivityImage(activity.imageKey);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: highlighted ? colors.primary : colors.border,
          borderWidth: highlighted ? 2 : 1,
        },
      ]}
    >
      <View style={styles.cardImageWrapper}>
        <Image source={image} style={styles.cardImage} resizeMode="cover" />
        {highlighted && (
          <View style={[styles.cardHighlightBadge, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="star-four-points" size={12} color="#fff" />
            <Text style={styles.cardHighlightBadgeText}>
              {l("مقترحة", "Pick this!")}
            </Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          style={styles.cardImageOverlay}
        />
        <View style={styles.cardDurationBadge}>
          <Text style={styles.cardDurationText}>
            {l(activity.duration, activity.durationEn)}
          </Text>
        </View>
      </View>

      <View style={[styles.cardBody, { backgroundColor: highlighted ? colors.highlight : colors.card }]}>
        <Text
          style={[styles.cardTitle, { color: highlighted ? colors.primary : colors.foreground }]}
          numberOfLines={2}
        >
          {l(activity.title, activity.titleEn)}
        </Text>
      </View>
    </View>
  );
}

function ActivityList({ highlighted }: { highlighted: string | null }) {
  const { activities } = useActivities();

  return (
    <View style={styles.list}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          highlighted={highlighted === activity.id}
        />
      ))}
    </View>
  );
}

function DetoxSection() {
  const colors = useColors();
  const { t, l } = useLanguage();
  const {
    data,
    startDetoxChallenge,
    checkInDetox,
    isDetoxCheckedInToday,
    getDetoxDaysCompleted,
  } = useApp();

  const challenge = data.detoxChallenge;
  const activeChallenge = challenge.challengeId
    ? DETOX_CHALLENGES.find((c) => c.id === challenge.challengeId)
    : null;
  const daysCompleted = getDetoxDaysCompleted();
  const checkedToday = isDetoxCheckedInToday();

  if (!activeChallenge) {
    return (
      <View style={styles.detoxSection}>
        <Text style={[styles.detoxTitle, { color: colors.foreground }]}>
          {t.boredom.detoxTitle}
        </Text>
        <Text style={[styles.detoxSub, { color: colors.mutedForeground }]}>
          {t.boredom.detoxSub}
        </Text>
        <View style={styles.challengeCards}>
          {DETOX_CHALLENGES.map((ch) => (
            <Pressable
              key={ch.id}
              style={[
                styles.challengeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={async () => {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await startDetoxChallenge(ch.id);
              }}
            >
              <View style={[styles.challengeDayBadge, { backgroundColor: ch.color }]}>
                <Text style={[styles.challengeDayNum, { color: colors.primary }]}>
                  {ch.days}
                </Text>
                <Text style={[styles.challengeDayText, { color: colors.primary }]}>
                  {t.boredom.days}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.challengeName, { color: colors.foreground }]}>
                  {l(ch.title, ch.titleEn)}
                </Text>
                <Text style={[styles.challengeDesc, { color: colors.mutedForeground }]}>
                  {l(ch.description, ch.descriptionEn)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const totalDays = activeChallenge.days;
  const progress = Math.min(daysCompleted / totalDays, 1);

  return (
    <View style={styles.detoxSection}>
      <Text style={[styles.detoxTitle, { color: colors.foreground }]}>
        {l(activeChallenge.title, activeChallenge.titleEn)}
      </Text>

      <View style={[styles.activeChallenge, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.challengeProgress}>
          <Text style={[styles.challengeProgressText, { color: colors.foreground }]}>
            {t.boredom.dayOf} {daysCompleted} {t.boredom.of} {totalDays}
          </Text>
          <Text style={[styles.challengeProgressNum, { color: colors.primary }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <View style={[styles.detoxBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.detoxBarFill,
              {
                width: `${Math.round(progress * 100)}%` as `${number}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.challengeRules}>
          {(l("ar", "en") === "ar" ? activeChallenge.rules : activeChallenge.rulesEn).map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.ruleText, { color: colors.foreground }]}>{rule}</Text>
            </View>
          ))}
        </View>

        {!checkedToday ? (
          <Pressable
            style={[styles.checkInBtn, { backgroundColor: colors.primary }]}
            onPress={async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await checkInDetox();
            }}
          >
            <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
            <Text style={styles.checkInBtnText}>{t.boredom.checkIn}</Text>
          </Pressable>
        ) : (
          <View style={[styles.checkedInBanner, { backgroundColor: colors.success + "33" }]}>
            <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} />
            <Text style={[styles.checkedInText, { color: colors.successForeground }]}>
              {t.boredom.checkedIn}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function BoredomScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, l } = useLanguage();
  const { activities } = useActivities();
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  function surprise() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(spinAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(spinAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    const random = activities[Math.floor(Math.random() * activities.length)];
    setHighlighted(random.id);
    setTimeout(() => setHighlighted(null), 4000);
  }

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 120 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {t.boredom.screenTitle}
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {t.boredom.screenSubtitle}
        </Text>

        <Pressable style={[styles.surpriseBtn, { backgroundColor: colors.primary }]} onPress={surprise}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialCommunityIcons name="dice-5-outline" size={22} color="#fff" />
          </Animated.View>
          <Text style={styles.surpriseBtnText}>{t.boredom.surpriseMe}</Text>
        </Pressable>

        {highlighted && (
          <View style={[styles.highlightBanner, { backgroundColor: colors.highlight, borderColor: colors.primary }]}>
            <MaterialCommunityIcons name="star-four-points" size={16} color={colors.primary} />
            <Text style={[styles.highlightText, { color: colors.primary }]}>
              {t.boredom.try}{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>
                {(() => {
                  const a = activities.find((a) => a.id === highlighted);
                  return a ? l(a.title, a.titleEn) : "";
                })()}
              </Text>
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          {t.boredom.offlineIdeas}
        </Text>
        <ActivityList highlighted={highlighted} />
        <DetoxSection />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 16,
  },
  surpriseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
  },
  surpriseBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  highlightBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  highlightText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
    marginTop: 8,
  },
  list: {
    gap: 14,
    marginBottom: 28,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  cardImageWrapper: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardHighlightBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    zIndex: 2,
  },
  cardHighlightBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  cardDurationBadge: {
    position: "absolute",
    bottom: 10,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardDurationText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 22,
  },
  detoxSection: {
    marginBottom: 16,
  },
  detoxTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  detoxSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  challengeCards: {
    gap: 10,
  },
  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  challengeDayBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeDayNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  challengeDayText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  challengeName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  challengeDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  activeChallenge: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  challengeProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeProgressText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  challengeProgressNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  detoxBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  detoxBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  challengeRules: {
    gap: 8,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  ruleText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
  checkInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  checkInBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  checkedInBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
  },
  checkedInText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
