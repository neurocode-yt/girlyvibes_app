import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { DETOX_CHALLENGES } from "@/data/boredom";
import type { Activity } from "@/data/boredom";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActivities } from "@/hooks/useActivities";
import { getActivityImage } from "@/lib/activityImages";

// ─── Constants ─────────────────────────────────────────────────────────────────

const CARD_SLOT = 244; // image 180 + body ~50 + gap 14

// ─── Draggable Card ────────────────────────────────────────────────────────────

type DraggableCardProps = {
  activity: Activity;
  index: number;
  totalCount: number;
  highlighted: boolean;
  onRegisterSlotOffset: (id: string, offset: Animated.Value) => void;
  onDragStart: (index: number) => void;
  onDragMove: (index: number, dy: number) => void;
  onDragEnd: (index: number, dy: number) => void;
};

function DraggableCard({
  activity,
  index,
  totalCount,
  highlighted,
  onRegisterSlotOffset,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableCardProps) {
  const colors = useColors();
  const { l } = useLanguage();
  const image = getActivityImage(activity.imageKey);
  const [isActive, setIsActive] = useState(false);

  // Own gesture translation (goes up/down with finger)
  const ownDragY = useRef(new Animated.Value(0)).current;
  // Parent-controlled shift (neighbors slide out of the way)
  const slotOffset = useRef(new Animated.Value(0)).current;
  // Combined Y = own drag + neighbor shift — stable ref
  const combinedY = useRef(Animated.add(ownDragY, slotOffset)).current;

  const scale = useRef(new Animated.Value(1)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslate = useRef(new Animated.Value(24)).current;

  // Refs so PanResponder closures always have current values
  const indexRef = useRef(index);
  indexRef.current = index;
  const totalCountRef = useRef(totalCount);
  totalCountRef.current = totalCount;
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragMoveRef = useRef(onDragMove);
  onDragMoveRef.current = onDragMove;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  // Register this card's slotOffset with the parent
  useEffect(() => {
    onRegisterSlotOffset(activity.id, slotOffset);
  }, [activity.id]);

  // Entry animation (only on first mount)
  const entryDone = useRef(false);
  useEffect(() => {
    if (entryDone.current) return;
    entryDone.current = true;
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 380,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(entryTranslate, {
        toValue: 0,
        duration: 380,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isLongPressed = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => isLongPressed.current,
      onPanResponderGrant: () => {
        isLongPressed.current = false;
        longPressTimer.current = setTimeout(() => {
          isLongPressed.current = true;
          setIsActive(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDragStartRef.current(indexRef.current);
          Animated.spring(scale, {
            toValue: 1.06,
            useNativeDriver: true,
            speed: 22,
            bounciness: 4,
          }).start();
        }, 380);
      },
      onPanResponderMove: (_, g) => {
        if (!isLongPressed.current) return;
        ownDragY.setValue(g.dy);
        onDragMoveRef.current(indexRef.current, g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (isLongPressed.current) {
          onDragEndRef.current(indexRef.current, g.dy);
          Animated.parallel([
            Animated.spring(ownDragY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 0 }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 0 }),
          ]).start();
          setIsActive(false);
        }
        isLongPressed.current = false;
      },
      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        isLongPressed.current = false;
        setIsActive(false);
        Animated.parallel([
          Animated.spring(ownDragY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 0 }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 0 }),
        ]).start();
        onDragEndRef.current(indexRef.current, 0);
      },
    })
  ).current;

  return (
    <Animated.View
      style={{
        opacity: entryOpacity,
        transform: [{ translateY: entryTranslate }],
        zIndex: isActive ? 999 : 1,
        elevation: isActive ? 16 : 1,
      }}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.cardOuter,
          { transform: [{ translateY: combinedY }, { scale }] },
          isActive && styles.cardActive,
        ]}
      >
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
              <View
                style={[
                  styles.cardHighlightBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={12}
                  color="#fff"
                />
                <Text style={styles.cardHighlightBadgeText}>
                  {l("مقترحة", "Pick this!")}
                </Text>
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
              <View
                style={[
                  styles.dragHint,
                  { backgroundColor: "rgba(0,0,0,0.45)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="drag-vertical"
                  size={20}
                  color="#fff"
                />
              </View>
            )}
          </View>

          <View
            style={[
              styles.cardBody,
              {
                backgroundColor: highlighted
                  ? colors.highlight
                  : colors.card,
              },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                {
                  color: highlighted
                    ? colors.primary
                    : colors.foreground,
                },
              ]}
              numberOfLines={2}
            >
              {l(activity.title, activity.titleEn)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Sortable Activity List ────────────────────────────────────────────────────

type SortableListProps = {
  highlighted: string | null;
  onScrollToggle: (enabled: boolean) => void;
};

function SortableActivityList({ highlighted, onScrollToggle }: SortableListProps) {
  const { activities } = useActivities();
  const [orderedItems, setOrderedItems] = useState<Activity[]>(activities);

  const orderedItemsRef = useRef(orderedItems);
  orderedItemsRef.current = orderedItems;

  // Map of activityId → slotOffset Animated.Value (owned by each card)
  const slotOffsetMap = useRef<Map<string, Animated.Value>>(new Map()).current;
  const hoverIndexRef = useRef<number | null>(null);

  useEffect(() => {
    setOrderedItems(activities);
  }, [activities]);

  const registerSlotOffset = (id: string, offset: Animated.Value) => {
    slotOffsetMap.set(id, offset);
  };

  const updateNeighborOffsets = (fromIndex: number, toIndex: number) => {
    const items = orderedItemsRef.current;
    items.forEach((item, i) => {
      if (i === fromIndex) return;
      let target = 0;
      if (fromIndex < toIndex && i > fromIndex && i <= toIndex) {
        target = -CARD_SLOT; // dragging DOWN → neighbors above the gap shift up
      } else if (fromIndex > toIndex && i >= toIndex && i < fromIndex) {
        target = CARD_SLOT;  // dragging UP → neighbors below the gap shift down
      }
      const offset = slotOffsetMap.get(item.id);
      if (offset) {
        Animated.spring(offset, {
          toValue: target,
          useNativeDriver: true,
          speed: 35,
          bounciness: 0,
        }).start();
      }
    });
  };

  const resetNeighborOffsets = () => {
    slotOffsetMap.forEach((offset) => {
      offset.setValue(0);
    });
  };

  const onDragStart = (fromIndex: number) => {
    hoverIndexRef.current = fromIndex;
    onScrollToggle(false);
  };

  const onDragMove = (fromIndex: number, dy: number) => {
    const n = orderedItemsRef.current.length;
    const newHover = Math.max(0, Math.min(n - 1, fromIndex + Math.round(dy / CARD_SLOT)));
    if (newHover !== hoverIndexRef.current) {
      hoverIndexRef.current = newHover;
      updateNeighborOffsets(fromIndex, newHover);
      Haptics.selectionAsync();
    }
  };

  const onDragEnd = (fromIndex: number, dy: number) => {
    const n = orderedItemsRef.current.length;
    const to = Math.max(0, Math.min(n - 1, fromIndex + Math.round(dy / CARD_SLOT)));
    resetNeighborOffsets();
    hoverIndexRef.current = null;
    onScrollToggle(true);
    if (fromIndex !== to) {
      const newItems = [...orderedItemsRef.current];
      const [moved] = newItems.splice(fromIndex, 1);
      newItems.splice(to, 0, moved);
      setOrderedItems(newItems);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
          onRegisterSlotOffset={registerSlotOffset}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      ))}
    </View>
  );
}

// ─── Detox Section ─────────────────────────────────────────────────────────────

function DetoxSection() {
  const colors = useColors();
  const { t, l, lang } = useLanguage();
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
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
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
                <Text
                  style={[
                    styles.challengeDayNum,
                    { color: colors.primary },
                  ]}
                >
                  {ch.days}
                </Text>
                <Text
                  style={[
                    styles.challengeDayText,
                    { color: colors.primary },
                  ]}
                >
                  {t.boredom.days}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[
                    styles.challengeName,
                    { color: colors.foreground },
                  ]}
                >
                  {l(ch.title, ch.titleEn)}
                </Text>
                <Text
                  style={[
                    styles.challengeDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
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
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.challengeProgress}>
          <Text
            style={[
              styles.challengeProgressText,
              { color: colors.foreground },
            ]}
          >
            {t.boredom.dayOf} {daysCompleted} {t.boredom.of} {totalDays}
          </Text>
          <Text
            style={[
              styles.challengeProgressNum,
              { color: colors.primary },
            ]}
          >
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
          {(
            lang === "ar"
              ? activeChallenge.rules
              : activeChallenge.rulesEn
          ).map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <View
                style={[styles.ruleDot, { backgroundColor: colors.primary }]}
              />
              <Text
                style={[styles.ruleText, { color: colors.foreground }]}
              >
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
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color="#fff"
            />
            <Text style={styles.checkInBtnText}>{t.boredom.checkIn}</Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.checkedInBanner,
              { backgroundColor: colors.success + "33" },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={colors.success}
            />
            <Text
              style={[
                styles.checkedInText,
                { color: colors.successForeground },
              ]}
            >
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
  const { t, l, lang } = useLanguage();
  const { activities } = useActivities();
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const spinValue = useRef(new Animated.Value(0)).current;
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  function surprise() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    const random = activities[Math.floor(Math.random() * activities.length)];
    setHighlighted(random.id);
    setTimeout(() => setHighlighted(null), 4000);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "web" ? 100 : 120,
      }}
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
          <Animated.View
            style={{ transform: [{ rotate: spinInterpolate }] }}
          >
            <MaterialCommunityIcons
              name="dice-5-outline"
              size={22}
              color="#fff"
            />
          </Animated.View>
          <Text style={styles.surpriseBtnText}>{t.boredom.surpriseMe}</Text>
        </Pressable>

        {highlighted && (
          <View
            style={[
              styles.highlightBanner,
              {
                backgroundColor: colors.highlight,
                borderColor: colors.primary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="star-four-points"
              size={16}
              color={colors.primary}
            />
            <Text
              style={[styles.highlightText, { color: colors.primary }]}
            >
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
        <Text
          style={[styles.sectionHint, { color: colors.mutedForeground }]}
        >
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
  cardActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
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
