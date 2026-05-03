import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useApp } from "@/contexts/AppContext";
import { DETOX_CHALLENGES } from "@/data/boredom";
import type { Activity } from "@/data/boredom";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActivities } from "@/hooks/useActivities";
import { getActivityImage } from "@/lib/activityImages";

// ─── Types ─────────────────────────────────────────────────────────────────────

type HeartConfig = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
  delay: number;
  ampX: number;
  ampY: number;
};

type DragSharedValues = {
  dragY: SharedValue<number>;
  draggingIndex: SharedValue<number>;
  orderedIds: SharedValue<string[]>;
  allShifts: SharedValue<{ [key: string]: number }>;
};

type DraggableCardProps = {
  activity: Activity;
  index: number;
  highlighted: boolean;
  drag: DragSharedValues;
  totalCount: number;
  onDragStart: (index: number) => void;
  commitOrder: (from: number, to: number) => void;
};

type SortableListProps = {
  highlighted: string | null;
  onScrollToggle: (enabled: boolean) => void;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const CARD_SLOT = 248;

const HEART_CONFIGS: HeartConfig[] = [
  { top: -6,  left: 2,   size: 18, delay: 0,   ampX: 3,  ampY: 6 },
  { top: 14,  left: 20,  size: 13, delay: 200, ampX: 4,  ampY: 5 },
  { top: 2,   left: 36,  size: 11, delay: 400, ampX: 5,  ampY: 7 },
  { top: -6,  right: 2,  size: 18, delay: 100, ampX: -3, ampY: 6 },
  { top: 14,  right: 20, size: 13, delay: 300, ampX: -4, ampY: 5 },
  { top: 2,   right: 36, size: 11, delay: 500, ampX: -5, ampY: 7 },
  { bottom: -6,  left: 2,   size: 18, delay: 150, ampX: 3,  ampY: -6 },
  { bottom: 14,  left: 20,  size: 13, delay: 350, ampX: 4,  ampY: -5 },
  { bottom: 2,   left: 36,  size: 11, delay: 50,  ampX: 5,  ampY: -7 },
  { bottom: -6,  right: 2,  size: 18, delay: 250, ampX: -3, ampY: -6 },
  { bottom: 14,  right: 20, size: 13, delay: 450, ampX: -4, ampY: -5 },
  { bottom: 2,   right: 36, size: 11, delay: 80,  ampX: -5, ampY: -7 },
];

// ─── Floating Heart ────────────────────────────────────────────────────────────

function FloatingHeart({ cfg, isVisible }: { cfg: HeartConfig; isVisible: boolean }) {
  const wobbleX = useSharedValue(0);
  const wobbleY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withDelay(cfg.delay, withTiming(0.3, { duration: 250 }));
      wobbleX.value = withDelay(
        cfg.delay,
        withRepeat(
          withSequence(
            withTiming(cfg.ampX, { duration: 700 }),
            withTiming(-cfg.ampX * 0.5, { duration: 700 }),
          ),
          -1,
          true,
        ),
      );
      wobbleY.value = withDelay(
        cfg.delay,
        withRepeat(
          withSequence(
            withTiming(cfg.ampY, { duration: 600 }),
            withTiming(cfg.ampY * 0.3, { duration: 600 }),
          ),
          -1,
          true,
        ),
      );
    } else {
      cancelAnimation(wobbleX);
      cancelAnimation(wobbleY);
      opacity.value = withTiming(0, { duration: 150 });
      wobbleX.value = withTiming(0, { duration: 200 });
      wobbleY.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: wobbleX.value },
      { translateY: wobbleY.value },
    ],
  }));

  const pos: { top?: number; bottom?: number; left?: number; right?: number } = {};
  if (cfg.top    !== undefined) pos.top    = cfg.top;
  if (cfg.bottom !== undefined) pos.bottom = cfg.bottom;
  if (cfg.left   !== undefined) pos.left   = cfg.left;
  if (cfg.right  !== undefined) pos.right  = cfg.right;

  return (
    <Animated.View style={[styles.heart, pos, animStyle]}>
      <Text style={{ fontSize: cfg.size }}>🩷</Text>
    </Animated.View>
  );
}

function FloatingHeartsOverlay({ visible }: { visible: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {HEART_CONFIGS.map((cfg, i) => (
        <FloatingHeart key={i} cfg={cfg} isVisible={visible} />
      ))}
    </View>
  );
}

// ─── Draggable Card ────────────────────────────────────────────────────────────

function DraggableCard({
  activity,
  index,
  highlighted,
  drag,
  totalCount,
  onDragStart,
  commitOrder,
}: DraggableCardProps) {
  const colors = useColors();
  const { l } = useLanguage();
  const image = getActivityImage(activity.imageKey);
  const [isActive, setIsActive] = useState(false);

  const { dragY, draggingIndex, orderedIds, allShifts } = drag;

  const gesture = Gesture.Pan()
    .activateAfterLongPress(420)
    .onStart(() => {
      draggingIndex.value = index;
      runOnJS(setIsActive)(true);
      runOnJS(onDragStart)(index);
    })
    .onUpdate((e) => {
      dragY.value = e.translationY;
      const di = draggingIndex.value;
      const ids = orderedIds.value;
      const count = ids.length;
      const raw = di + Math.round(e.translationY / CARD_SLOT);
      const ti = raw < 0 ? 0 : raw >= count ? count - 1 : raw;
      const shifts = {};
      for (let j = 0; j < count; j++) {
        if (j === di) continue;
        if (di < ti && j > di && j <= ti) {
          shifts[ids[j]] = -CARD_SLOT;
        } else if (di > ti && j < di && j >= ti) {
          shifts[ids[j]] = CARD_SLOT;
        }
      }
      allShifts.value = shifts;
    })
    .onEnd(() => {
      const di = draggingIndex.value;
      const count = orderedIds.value.length;
      const raw = di + Math.round(dragY.value / CARD_SLOT);
      const ti = raw < 0 ? 0 : raw >= count ? count - 1 : raw;
      runOnJS(commitOrder)(di, ti);
      dragY.value = withSpring(0, { damping: 14 });
      draggingIndex.value = -1;
      allShifts.value = {};
      runOnJS(setIsActive)(false);
    })
    .onFinalize(() => {
      if (draggingIndex.value !== -1) {
        dragY.value = withSpring(0, { damping: 14 });
        draggingIndex.value = -1;
        allShifts.value = {};
        runOnJS(setIsActive)(false);
      }
    });

  const animStyle = useAnimatedStyle(() => {
    const isDragging = draggingIndex.value === index;
    const shift = allShifts.value[activity.id] ?? 0;
    return {
      transform: [
        { translateY: isDragging ? dragY.value : shift },
        { scale: isDragging ? 1.03 : 1 },
      ],
      zIndex: isDragging ? 200 : 1,
      elevation: isDragging ? 12 : 0,
    };
  });

  return (
    <Animated.View entering={FadeInDown.delay(index * 55).duration(480)}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardOuter, animStyle]}>
          <FloatingHeartsOverlay visible={isActive} />

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
              <Image source={image} style={styles.cardImage} contentFit="cover" />
              {highlighted && (
                <View style={[styles.cardHighlightBadge, { backgroundColor: colors.primary }]}>
                  <MaterialCommunityIcons name="star-four-points" size={12} color="#fff" />
                  <Text style={styles.cardHighlightBadgeText}>{l("مقترحة", "Pick this!")}</Text>
                </View>
              )}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.55)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardDurationBadge}>
                <Text style={styles.cardDurationText}>
                  {l(activity.duration, activity.durationEn)}
                </Text>
              </View>
              {isActive && (
                <View style={[styles.dragHint, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
                  <MaterialCommunityIcons name="drag-vertical" size={20} color="#fff" />
                </View>
              )}
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
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

// ─── Sortable Activity List ────────────────────────────────────────────────────

function SortableActivityList({ highlighted, onScrollToggle }: SortableListProps) {
  const { activities } = useActivities();
  const [orderedItems, setOrderedItems] = useState<Activity[]>(activities);

  useEffect(() => {
    setOrderedItems(activities);
  }, [activities]);

  const dragY = useSharedValue(0);
  const draggingIndex = useSharedValue(-1);
  const orderedIds = useSharedValue<string[]>(orderedItems.map((i) => i.id));
  const allShifts = useSharedValue<{ [key: string]: number }>({});

  useEffect(() => {
    orderedIds.value = orderedItems.map((i) => i.id);
  }, [orderedItems]);

  const drag: DragSharedValues = {
    dragY,
    draggingIndex,
    orderedIds,
    allShifts,
  };

  const onDragStart = (index: number) => {
    onScrollToggle(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const commitOrder = (from: number, to: number) => {
    onScrollToggle(true);
    if (from === to) return;
    const newItems = [...orderedItems];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setOrderedItems(newItems);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.list}>
      {orderedItems.map((activity, index) => (
        <DraggableCard
          key={activity.id}
          activity={activity}
          index={index}
          totalCount={orderedItems.length}
          highlighted={highlighted === activity.id}
          drag={drag}
          onDragStart={onDragStart}
          commitOrder={commitOrder}
        />
      ))}
    </View>
  );
}

// ─── Detox Section ─────────────────────────────────────────────────────────────

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
                <Text style={[styles.challengeDayNum, { color: colors.primary }]}>{ch.days}</Text>
                <Text style={[styles.challengeDayText, { color: colors.primary }]}>{t.boredom.days}</Text>
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

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function BoredomScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, l } = useLanguage();
  const { activities } = useActivities();
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const spinValue = useSharedValue(0);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  function surprise() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    spinValue.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 0 }),
    );
    const random = activities[Math.floor(Math.random() * activities.length)];
    setHighlighted(random.id);
    setTimeout(() => setHighlighted(null), 4000);
  }

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 120 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
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
          <Animated.View style={spinStyle}>
            <MaterialCommunityIcons name="dice-5-outline" size={22} color="#fff" />
          </Animated.View>
          <Text style={styles.surpriseBtnText}>{t.boredom.surpriseMe}</Text>
        </Pressable>

        {highlighted && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
              styles.highlightBanner,
              { backgroundColor: colors.highlight, borderColor: colors.primary },
            ]}
          >
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
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          {t.boredom.offlineIdeas}
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          {l("اضغطي مطولاً لإعادة الترتيب", "Hold to reorder")}
        </Text>

        <SortableActivityList
          highlighted={highlighted}
          onScrollToggle={setScrollEnabled}
        />

        <DetoxSection />
      </View>
    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

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
    marginBottom: 4,
    marginTop: 8,
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  list: {
    gap: 14,
    marginBottom: 28,
  },
  cardOuter: {
    borderRadius: 20,
  },
  heart: {
    position: "absolute",
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
    zIndex: 2,
  },
  cardDurationText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  dragHint: {
    position: "absolute",
    top: 10,
    right: 12,
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
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
