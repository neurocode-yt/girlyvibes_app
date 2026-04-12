import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { ACTIVITIES, DETOX_CHALLENGES, type Activity } from "@/data/boredom";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

function ActivityGrid({ highlighted }: { highlighted: string | null }) {
  const colors = useColors();
  const { l } = useLanguage();

  return (
    <View style={styles.grid}>
      {ACTIVITIES.map((activity) => {
        const isHighlighted = highlighted === activity.id;
        return (
          <View
            key={activity.id}
            style={[
              styles.activityCard,
              {
                backgroundColor: isHighlighted
                  ? colors.primary
                  : activity.color,
                borderColor: isHighlighted ? colors.primary : colors.border,
                transform: [{ scale: isHighlighted ? 1.04 : 1 }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name={activity.icon}
              size={22}
              color={isHighlighted ? "#fff" : colors.primary}
            />
            <Text
              style={[
                styles.activityTitle,
                { color: isHighlighted ? "#fff" : colors.foreground },
              ]}
              numberOfLines={2}
            >
              {l(activity.title, activity.titleEn)}
            </Text>
            <Text
              style={[
                styles.activityDuration,
                {
                  color: isHighlighted
                    ? "rgba(255,255,255,0.8)"
                    : colors.mutedForeground,
                },
              ]}
            >
              {l(activity.duration, activity.durationEn)}
            </Text>
          </View>
        );
      })}
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
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                await startDetoxChallenge(ch.id);
              }}
            >
              <View
                style={[
                  styles.challengeDayBadge,
                  { backgroundColor: ch.color },
                ]}
              >
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

      <View
        style={[
          styles.activeChallenge,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
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
              <View
                style={[styles.ruleDot, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.ruleText, { color: colors.foreground }]}>
                {rule}
              </Text>
            </View>
          ))}
        </View>

        {!checkedToday ? (
          <Pressable
            style={[styles.checkInBtn, { backgroundColor: colors.primary }]}
            onPress={async () => {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              await checkInDetox();
            }}
          >
            <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
            <Text style={styles.checkInBtnText}>{t.boredom.checkIn}</Text>
          </Pressable>
        ) : (
          <View
            style={[styles.checkedInBanner, { backgroundColor: colors.success + "33" }]}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={colors.success}
            />
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
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  function surprise() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const randomActivity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    setHighlighted(randomActivity.id);
  }

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {t.boredom.screenTitle}
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {t.boredom.screenSubtitle}
        </Text>

        <Pressable
          style={[styles.surpriseBtn, { backgroundColor: colors.primary }]}
          onPress={surprise}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialCommunityIcons name="dice-5-outline" size={22} color="#fff" />
          </Animated.View>
          <Text style={styles.surpriseBtnText}>{t.boredom.surpriseMe}</Text>
        </Pressable>

        {highlighted && (
          <View
            style={[
              styles.highlightBanner,
              { backgroundColor: colors.highlight, borderColor: colors.primary },
            ]}
          >
            <MaterialCommunityIcons
              name="star-four-points"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.highlightText, { color: colors.primary }]}>
              {t.boredom.try}{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>
                {(() => { const a = ACTIVITIES.find((a) => a.id === highlighted); return a ? l(a.title, a.titleEn) : ""; })()}
              </Text>
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          {t.boredom.offlineIdeas}
        </Text>
        <ActivityGrid highlighted={highlighted} />

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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  activityCard: {
    width: "47%",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  activityTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },
  activityDuration: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
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
