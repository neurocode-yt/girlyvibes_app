import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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

const LIST_GAP = 14;
const CARD_HEIGHT = 252; // image 180 + fixed body 72
const CARD_SLOT = CARD_HEIGHT + LIST_GAP;
const DRAG_HOLD_DELAY_MS = 600;
const AUTO_SCROLL_EDGE = 110;
const AUTO_SCROLL_STEP = 9;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const FLOATING_EMOJIS = [
  { emoji: "💗", side: "top", x: "8%", y: -20, drift: -14, delay: 0 },
  { emoji: "🥰", side: "top", x: "35%", y: -24, drift: -18, delay: 80 },
  { emoji: "✨", side: "top", x: "66%", y: -18, drift: -12, delay: 160 },
  { emoji: "🩷", side: "top", x: "88%", y: -22, drift: -16, delay: 240 },
  { emoji: "🎀", side: "right", x: "100%", y: 36, drift: 12, delay: 120 },
  { emoji: "💞", side: "right", x: "100%", y: 132, drift: 16, delay: 280 },
  { emoji: "💗", side: "bottom", x: "18%", y: CARD_HEIGHT - 8, drift: 14, delay: 40 },
  { emoji: "🥰", side: "bottom", x: "48%", y: CARD_HEIGHT - 4, drift: 18, delay: 200 },
  { emoji: "✨", side: "bottom", x: "78%", y: CARD_HEIGHT - 10, drift: 12, delay: 360 },
  { emoji: "🩷", side: "left", x: -12, y: 44, drift: -12, delay: 100 },
  { emoji: "🎀", side: "left", x: -14, y: 120, drift: -16, delay: 260 },
  { emoji: "💞", side: "left", x: -10, y: 198, drift: -12, delay: 420 },
] as const;

// ─── Draggable Card ────────────────────────────────────────────────────────────

type DraggableCardProps = {
  activity: Activity;
  index: number;
  highlighted: boolean;
  isActive: boolean;
  positionY: Animated.Value;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, dy: number, moveY: number) => void;
  onDragEnd: (id: string, dy: number) => void;
};

function FloatingEmojiLayer({ progress }: { progress: Animated.Value }) {
  return (
    <View pointerEvents="none" style={styles.floatLayer}>
      {FLOATING_EMOJIS.map((item, index) => {
        const horizontalDrift = item.side === "left" || item.side === "right";
        const opacity = progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.18, 0.39 + (item.delay % 160) / 1600, 0.25],
        });
        const translateX = horizontalDrift
          ? progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, item.drift],
            })
          : 0;
        const translateY = horizontalDrift
          ? 0
          : progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, item.drift],
            });
        const scale = progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.86, 1.08, 0.92],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [`${index % 2 === 0 ? -8 : 8}deg`, `${index % 2 === 0 ? 9 : -9}deg`],
        });

        return (
          <Animated.Text
            key={`${item.emoji}-${index}`}
            style={[
              styles.floatEmoji,
              {
                left: item.x,
                top: item.y,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }, { rotate }],
              },
            ]}
          >
            {item.emoji}
          </Animated.Text>
        );
      })}
    </View>
  );
}

function DraggableCard({
  activity,
  index,
  highlighted,
  isActive,
  positionY,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableCardProps) {
  const colors = useColors();
  const { l } = useLanguage();
  const image = getActivityImage(activity.imageKey);

  const scale = useRef(new Animated.Value(1)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const floatProgress = useRef(new Animated.Value(0)).current;

  // Refs so PanResponder closures always have current values
  const activityIdRef = useRef(activity.id);
  activityIdRef.current = activity.id;
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragMoveRef = useRef(onDragMove);
  onDragMoveRef.current = onDragMove;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

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
    ]).start();
  }, []);

  useEffect(() => {
    if (!isActive) {
      floatProgress.stopAnimation();
      floatProgress.setValue(0);
      return;
    }

    floatProgress.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatProgress, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(floatProgress, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [floatProgress, isActive]);

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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDragStartRef.current(activityIdRef.current);
          Animated.spring(scale, {
            toValue: 1.06,
            useNativeDriver: true,
            speed: 22,
            bounciness: 4,
          }).start();
        }, DRAG_HOLD_DELAY_MS);
      },
      onPanResponderMove: (_, g) => {
        if (!isLongPressed.current) return;
        onDragMoveRef.current(activityIdRef.current, g.dy, g.moveY);
      },
      onPanResponderRelease: (_, g) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (isLongPressed.current) {
          onDragEndRef.current(activityIdRef.current, g.dy);
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 0 }).start();
        }
        isLongPressed.current = false;
      },
      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        isLongPressed.current = false;
        onDragEndRef.current(activityIdRef.current, 0);
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 0 })
          .start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={{
        left: 0,
        opacity: entryOpacity,
        position: "absolute",
        right: 0,
        top: 0,
        height: CARD_HEIGHT,
        transform: [{ translateY: positionY }],
        zIndex: isActive ? 1000 : 1,
        elevation: isActive ? 16 : 1,
      }}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.cardOuter,
          {
            transform: [{ scale }],
            zIndex: isActive ? 1000 : 0,
            elevation: isActive ? 18 : 1,
          },
          isActive && styles.cardActive,
        ]}
      >
        {isActive && <FloatingEmojiLayer progress={floatProgress} />}
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
  scrollYRef: React.MutableRefObject<number>;
  onAutoScroll: (delta: number) => void;
  onScrollToggle: (enabled: boolean) => void;
};

function SortableActivityList({
  highlighted,
  scrollYRef,
  onAutoScroll,
  onScrollToggle,
}: SortableListProps) {
  const { activities } = useActivities();
  const [orderedItems, setOrderedItems] = useState<Activity[]>(activities);
  const [activeId, setActiveId] = useState<string | null>(null);

  const positionMap = useRef<Map<string, Animated.Value>>(new Map()).current;
  const orderRef = useRef<string[]>(activities.map((activity) => activity.id));
  const previewOrderRef = useRef<string[]>(orderRef.current);
  const activeIdRef = useRef<string | null>(null);
  const dragStartIndexRef = useRef(0);
  const dragStartScrollYRef = useRef(0);

  const getPosition = (id: string, index: number) => {
    let position = positionMap.get(id);
    if (!position) {
      position = new Animated.Value(index * CARD_SLOT);
      positionMap.set(id, position);
    }
    return position;
  };

  const moveId = (ids: string[], fromIndex: number, toIndex: number) => {
    const next = [...ids];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  };

  const animatePositions = (ids: string[], activeCardId: string | null) => {
    ids.forEach((id, index) => {
      if (id === activeCardId) return;
      Animated.spring(getPosition(id, index), {
        toValue: index * CARD_SLOT,
        useNativeDriver: true,
        speed: 34,
        bounciness: 0,
      }).start();
    });
  };

  useEffect(() => {
    const activityById = new Map(activities.map((activity) => [activity.id, activity]));
    const previousOrder = orderRef.current.length
      ? orderRef.current
      : activities.map((activity) => activity.id);
    const nextOrder = [
      ...previousOrder.filter((id) => activityById.has(id)),
      ...activities.map((activity) => activity.id).filter((id) => !previousOrder.includes(id)),
    ];

    orderRef.current = nextOrder;
    previewOrderRef.current = nextOrder;
    setOrderedItems(nextOrder.map((id) => activityById.get(id)).filter(Boolean) as Activity[]);
    nextOrder.forEach((id, index) => {
      getPosition(id, index).setValue(index * CARD_SLOT);
    });
  }, [activities]);

  const onDragStart = (id: string) => {
    const fromIndex = orderRef.current.indexOf(id);
    if (fromIndex < 0) return;

    activeIdRef.current = id;
    dragStartIndexRef.current = fromIndex;
    dragStartScrollYRef.current = scrollYRef.current;
    previewOrderRef.current = orderRef.current;
    setActiveId(id);
    onScrollToggle(false);
    getPosition(id, fromIndex).stopAnimation((value) => {
      getPosition(id, fromIndex).setValue(value);
    });
  };

  const onDragMove = (id: string, dy: number, moveY: number) => {
    if (activeIdRef.current !== id) return;

    const order = orderRef.current;
    const fromIndex = dragStartIndexRef.current;
    const adjustedDy = dy + (scrollYRef.current - dragStartScrollYRef.current);
    const nextIndex = Math.max(0, Math.min(order.length - 1, fromIndex + Math.round(adjustedDy / CARD_SLOT)));
    getPosition(id, fromIndex).setValue(fromIndex * CARD_SLOT + adjustedDy);

    if (moveY > SCREEN_HEIGHT - AUTO_SCROLL_EDGE) {
      onAutoScroll(AUTO_SCROLL_STEP);
    } else if (moveY < AUTO_SCROLL_EDGE) {
      onAutoScroll(-AUTO_SCROLL_STEP);
    }

    if (previewOrderRef.current.indexOf(id) !== nextIndex) {
      previewOrderRef.current = moveId(order, fromIndex, nextIndex);
      animatePositions(previewOrderRef.current, id);
      Haptics.selectionAsync();
    }
  };

  const onDragEnd = (id: string, dy: number) => {
    if (activeIdRef.current !== id) return;

    const order = orderRef.current;
    const fromIndex = dragStartIndexRef.current;
    const adjustedDy = dy + (scrollYRef.current - dragStartScrollYRef.current);
    const fallbackIndex = Math.max(0, Math.min(order.length - 1, fromIndex + Math.round(adjustedDy / CARD_SLOT)));
    const finalOrder = previewOrderRef.current.includes(id)
      ? previewOrderRef.current
      : moveId(order, fromIndex, fallbackIndex);
    const finalIndex = finalOrder.indexOf(id);
    const activityById = new Map(activities.map((activity) => [activity.id, activity]));

    activeIdRef.current = null;
    orderRef.current = finalOrder;
    previewOrderRef.current = finalOrder;
    onScrollToggle(true);
    setOrderedItems(finalOrder.map((activityId) => activityById.get(activityId)).filter(Boolean) as Activity[]);
    animatePositions(finalOrder, id);

    Animated.spring(getPosition(id, finalIndex), {
      toValue: finalIndex * CARD_SLOT,
      useNativeDriver: true,
      speed: 34,
      bounciness: 0,
    }).start(() => {
      setActiveId(null);
    });

    if (fromIndex !== finalIndex) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View
      style={[
        styles.list,
        { height: Math.max(0, orderedItems.length * CARD_SLOT - LIST_GAP) },
      ]}
    >
      {orderedItems.map((activity, index) => (
        <DraggableCard
          key={activity.id}
          activity={activity}
          index={index}
          highlighted={highlighted === activity.id}
          isActive={activeId === activity.id}
          positionY={getPosition(activity.id, index)}
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

  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
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

  function autoScroll(delta: number) {
    const nextY = Math.max(0, scrollYRef.current + delta);
    scrollYRef.current = nextY;
    scrollRef.current?.scrollTo({ y: nextY, animated: false });
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "web" ? 100 : 120,
      }}
      onScroll={(event) => {
        scrollYRef.current = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
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
          scrollYRef={scrollYRef}
          onAutoScroll={autoScroll}
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
    marginBottom: 28,
    position: "relative",
  },
  cardOuter: {
    borderRadius: 20,
    position: "relative",
    height: CARD_HEIGHT,
  },
  cardActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  floatLayer: {
    bottom: 0,
    left: 0,
    overflow: "visible",
    pointerEvents: "none",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 3,
  },
  floatEmoji: {
    color: "#F05C94",
    fontSize: 22,
    position: "absolute",
    textShadowColor: "rgba(255,255,255,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
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
    height: 72,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
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
