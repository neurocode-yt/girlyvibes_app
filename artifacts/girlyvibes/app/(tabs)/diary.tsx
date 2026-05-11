import { AppMaterialCommunityIcons as Icon } from "@/components/Icons";
import { DiaryEntry, DiaryNote, RichBlock, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STRIP_WIDTH = SCREEN_WIDTH - 32;

// ─── Mood definitions ───────────────────────────────────────────────────────

const MOODS = [
  { key: "happy",    emoji: "😊", color: "#FFD166", labelKey: "moodHappy"    },
  { key: "loved",    emoji: "🥰", color: "#FF6B9D", labelKey: "moodLoved"    },
  { key: "excited",  emoji: "✨", color: "#F8A4D8", labelKey: "moodExcited"  },
  { key: "calm",     emoji: "🌸", color: "#A8E6CF", labelKey: "moodCalm"     },
  { key: "tired",    emoji: "😴", color: "#B8BCC8", labelKey: "moodTired"    },
  { key: "sad",      emoji: "😔", color: "#9B8EC4", labelKey: "moodSad"      },
  { key: "anxious",  emoji: "😟", color: "#FFB347", labelKey: "moodAnxious"  },
  { key: "powerful", emoji: "💪", color: "#4ECDC4", labelKey: "moodPowerful" },
] as const;

const CARD_COLORS = [
  "#FFE4E8", "#FFE8CC", "#FFF4CC", "#E8F8E8",
  "#E8F4FD", "#F0E8FF", "#FFE8F4", "#E8FFF8",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayKey(): string {
  const d = new Date();
  return dateToKey(d);
}

function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(key: string, isRTL: boolean): string {
  const d = dateKeyToDate(key);
  return d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatCompactDate(key: string, isRTL: boolean): string {
  const d = dateKeyToDate(key);
  return d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

function pastDateKeys(count: number): string[] {
  const today = dateKeyToDate(todayKey());
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i - 1);
    return dateToKey(d);
  });
}

function isDateKeyPastOrToday(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const d = dateKeyToDate(key);
  if (Number.isNaN(d.getTime())) return false;
  return dateToKey(d) === key && key <= todayKey();
}

function getMoodByKey(key: string) {
  return MOODS.find((m) => m.key === key) ?? MOODS[0];
}

// ─── Swipeable week strip ────────────────────────────────────────────────────

const MONTH_PALETTES = [
  { bg: "#FFF0F5", accent: "#F06292", ring: "#F0629230" }, // Jan — rose
  { bg: "#FFF3E0", accent: "#FF8A65", ring: "#FF8A6530" }, // Feb — coral
  { bg: "#EDFBF2", accent: "#4CAF88", ring: "#4CAF8830" }, // Mar — mint
  { bg: "#FCE4EC", accent: "#E91E8C", ring: "#E91E8C30" }, // Apr — hot pink
  { bg: "#E0FAFA", accent: "#00BCD4", ring: "#00BCD430" }, // May — teal
  { bg: "#FFFDE7", accent: "#F9A825", ring: "#F9A82530" }, // Jun — gold
  { bg: "#FFF1EC", accent: "#FF5722", ring: "#FF572230" }, // Jul — orange
  { bg: "#F3E5F5", accent: "#9C27B0", ring: "#9C27B030" }, // Aug — violet
  { bg: "#EDE7F6", accent: "#673AB7", ring: "#673AB730" }, // Sep — deep purple
  { bg: "#E1F5FE", accent: "#0288D1", ring: "#0288D130" }, // Oct — sky
  { bg: "#F5F9E6", accent: "#7CB342", ring: "#7CB34230" }, // Nov — olive
  { bg: "#ECEFF1", accent: "#546E7A", ring: "#546E7A30" }, // Dec — slate
];

const WEEKS_COUNT = 26; // ~6 months back

function generateWeeks(count: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align to Sunday start
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());

  const weeks: Array<Array<{ date: Date; key: string }>> = [];
  for (let w = count - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(currentSunday);
      date.setDate(currentSunday.getDate() - w * 7 + d);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      week.push({ date, key });
    }
    weeks.push(week);
  }
  return weeks;
}

function SwipeableWeekStrip({
  entries,
  onPastDayPress,
}: {
  entries: { [k: string]: DiaryEntry };
  onPastDayPress: (dateKey: string) => void;
}) {
  const { t, isRTL } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const [visibleIdx, setVisibleIdx] = useState(WEEKS_COUNT - 1);
  const todayK = todayKey();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const weeks = useMemo(() => generateWeeks(WEEKS_COUNT), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: (WEEKS_COUNT - 1) * STRIP_WIDTH, animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / STRIP_WIDTH);
    setVisibleIdx(Math.max(0, Math.min(WEEKS_COUNT - 1, idx)));
  };

  const visibleWeek = weeks[visibleIdx];
  const palette = MONTH_PALETTES[visibleWeek[3].date.getMonth()];
  const monthLabel = visibleWeek[3].date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <View style={swipeStyles.container}>
      <View style={[swipeStyles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={[swipeStyles.monthLabel, { color: palette.accent }]}>{monthLabel}</Text>
        <Text style={[swipeStyles.hint, { color: palette.accent + "99" }]}>
          {isRTL ? "← اسحبي →" : "← swipe →"}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={32}
        decelerationRate="fast"
        snapToInterval={STRIP_WIDTH}
        snapToAlignment="start"
        style={swipeStyles.scrollView}
      >
        {weeks.map((week, wi) => {
          const wPalette = MONTH_PALETTES[week[3].date.getMonth()];
          return (
            <View
              key={wi}
              style={[swipeStyles.weekPage, { width: STRIP_WIDTH, backgroundColor: wPalette.bg }]}
            >
              {week.map((day) => {
                const entry = entries[day.key];
                const mood = entry ? getMoodByKey(entry.mood) : null;
                const isToday = day.key === todayK;
                const isFuture = day.date > now;
                const isPast = day.date < now;
                const dayLabel = t.diary.weekDays[day.date.getDay()];
                return (
                  <Pressable
                    key={day.key}
                    style={swipeStyles.dayCol}
                    disabled={!isPast}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onPastDayPress(day.key);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !isPast }}
                    accessibilityLabel={`Open diary entry for ${formatDisplayDate(day.key, false)}`}
                  >
                    <Text style={[swipeStyles.dayLabel, { color: wPalette.accent }]}>{dayLabel}</Text>
                    <View
                      style={[
                        swipeStyles.dot,
                        {
                          backgroundColor: mood
                            ? mood.color
                            : isToday
                            ? wPalette.accent + "33"
                            : wPalette.ring,
                          borderWidth: isToday ? 2.5 : 0,
                          borderColor: wPalette.accent,
                          opacity: isFuture ? 0.25 : 1,
                        },
                      ]}
                    >
                      {mood ? <Text style={swipeStyles.dotEmoji}>{mood.emoji}</Text> : null}
                    </View>
                    <Text
                      style={[
                        swipeStyles.dayNum,
                        {
                          color: isToday ? wPalette.accent : "#555",
                          fontFamily: isToday ? "Inter_700Bold" : "Inter_400Regular",
                        },
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 18 },
  headerRow: { justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingHorizontal: 4 },
  monthLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scrollView: { borderRadius: 18, overflow: "hidden" },
  weekPage: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  dayCol: { alignItems: "center", gap: 6 },
  dayLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  dot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dotEmoji: { fontSize: 18 },
  dayNum: { fontSize: 11 },
});

// ─── Mood picker row ────────────────────────────────────────────────────────

function MoodPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <View style={moodStyles.grid}>
      {MOODS.map((mood) => {
        const active = selected === mood.key;
        return (
          <Pressable
            key={mood.key}
            style={[
              moodStyles.chip,
              {
                backgroundColor: active ? mood.color : mood.color + "40",
                borderColor: active ? mood.color : "transparent",
                borderWidth: active ? 2 : 1,
                transform: [{ scale: active ? 1.08 : 1 }],
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(mood.key);
            }}
          >
            <Text style={moodStyles.emoji}>{mood.emoji}</Text>
            <Text style={[moodStyles.chipLabel, { color: active ? "#444" : "#666" }]}>
              {(t.diary as any)[mood.labelKey]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const moodStyles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20 },
  emoji: { fontSize: 17 },
  chipLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
});

// ─── Color picker ────────────────────────────────────────────────────────────

function ColorPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (c: string) => void;
}) {
  return (
    <View style={colorStyles.row}>
      {CARD_COLORS.map((c) => (
        <Pressable
          key={c}
          style={[colorStyles.swatch, { backgroundColor: c, borderWidth: selected === c ? 3 : 1.5, borderColor: selected === c ? "#C06" : "#ddd" }]}
          onPress={() => { Haptics.selectionAsync(); onSelect(c); }}
        />
      ))}
    </View>
  );
}

const colorStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 18, flexWrap: "wrap" },
  swatch: { width: 32, height: 32, borderRadius: 16 },
});

// ─── Today card ──────────────────────────────────────────────────────────────

function TodayCard() {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const { data, saveDiaryEntry, deleteDiaryEntry } = useApp();

  const key = todayKey();
  const existing = data.diaryEntries?.[key];

  const [editing, setEditing] = useState(!existing);
  const [selectedMood, setSelectedMood] = useState<string | null>(existing?.mood ?? null);
  const [note, setNote] = useState(existing?.note ?? "");
  const [cardColor, setCardColor] = useState(existing?.cardColor ?? CARD_COLORS[0]);

  useEffect(() => {
    if (existing) {
      setSelectedMood(existing.mood);
      setNote(existing.note);
      setCardColor(existing.cardColor);
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [key]);

  const handleSave = async () => {
    if (!selectedMood) return;
    const mood = getMoodByKey(selectedMood);
    const entry: DiaryEntry = {
      id: key,
      mood: selectedMood,
      moodEmoji: mood.emoji,
      note: note.trim(),
      cardColor,
    };
    await saveDiaryEntry(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  };

  const handleDelete = () => {
    if (Platform.OS === "web") {
      deleteDiaryEntry(key);
      setSelectedMood(null);
      setNote("");
      setCardColor(CARD_COLORS[0]);
      setEditing(true);
      return;
    }
    Alert.alert(t.diary.deleteConfirm, "", [
      { text: t.diary.cancel, style: "cancel" },
      {
        text: t.diary.deleteEntry,
        style: "destructive",
        onPress: async () => {
          await deleteDiaryEntry(key);
          setSelectedMood(null);
          setNote("");
          setCardColor(CARD_COLORS[0]);
          setEditing(true);
        },
      },
    ]);
  };

  const mood = selectedMood ? getMoodByKey(selectedMood) : null;

  return (
    <View style={[todayStyles.card, { backgroundColor: existing && !editing ? cardColor : colors.card, borderColor: colors.border }]}>
      <View style={[todayStyles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={[todayStyles.dateText, { color: colors.mutedForeground }]}>
          {formatDisplayDate(key, isRTL)}
        </Text>
        {existing && !editing && (
          <View style={[todayStyles.headerActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Pressable onPress={() => setEditing(true)} hitSlop={8} style={[todayStyles.iconBtn, { backgroundColor: colors.background }]}>
              <Icon name="pencil" size={15} color={colors.primary} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8} style={[todayStyles.iconBtn, { backgroundColor: colors.background }]}>
              <Icon name="trash-can-outline" size={15} color="#E05" />
            </Pressable>
          </View>
        )}
      </View>

      {!editing && existing ? (
        <View>
          <View style={[todayStyles.moodRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={todayStyles.bigEmoji}>{existing.moodEmoji}</Text>
            <Text style={[todayStyles.moodName, { color: colors.foreground }]}>
              {mood ? (t.diary as any)[mood.labelKey] : ""}
            </Text>
          </View>
          {existing.note ? (
            <Text style={[todayStyles.noteText, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
              {existing.note}
            </Text>
          ) : null}
        </View>
      ) : (
        <View>
          <Text style={[todayStyles.sectionLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {t.diary.moodLabel}
          </Text>
          <MoodPicker selected={selectedMood} onSelect={setSelectedMood} />

          <TextInput
            style={[todayStyles.input, {
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              textAlign: isRTL ? "right" : "left",
            }]}
            placeholder={t.diary.notePlaceholder}
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />

          <Text style={[todayStyles.sectionLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left", marginBottom: 10 }]}>
            {t.diary.colorPicker}
          </Text>
          <ColorPicker selected={cardColor} onSelect={setCardColor} />

          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
            {existing && (
              <Pressable
                style={[todayStyles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setEditing(false)}
              >
                <Text style={[todayStyles.cancelBtnText, { color: colors.mutedForeground }]}>{t.diary.cancel}</Text>
              </Pressable>
            )}
            <Pressable
              style={[todayStyles.saveBtn, { backgroundColor: selectedMood ? colors.primary : colors.border, flex: 1 }]}
              onPress={handleSave}
              disabled={!selectedMood}
            >
              <Icon name="check-circle-outline" size={18} color={selectedMood ? "#fff" : colors.mutedForeground} />
              <Text style={[todayStyles.saveBtnText, { color: selectedMood ? "#fff" : colors.mutedForeground }]}>
                {t.diary.saveEntry}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function PastDayEntryModal({
  dateKey,
  visible,
  onAddNote,
  onClose,
}: {
  dateKey: string | null;
  visible: boolean;
  onAddNote: (dateKey: string) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const { data, saveDiaryEntry, deleteDiaryEntry } = useApp();
  const key = dateKey ?? todayKey();
  const existing = dateKey ? data.diaryEntries?.[dateKey] : undefined;
  const [editing, setEditing] = useState(!existing);
  const [selectedMood, setSelectedMood] = useState<string | null>(existing?.mood ?? null);
  const [note, setNote] = useState(existing?.note ?? "");
  const [cardColor, setCardColor] = useState(existing?.cardColor ?? CARD_COLORS[0]);

  useEffect(() => {
    if (!visible || !dateKey) return;
    if (existing) {
      setSelectedMood(existing.mood);
      setNote(existing.note);
      setCardColor(existing.cardColor);
      setEditing(false);
    } else {
      setSelectedMood(null);
      setNote("");
      setCardColor(CARD_COLORS[0]);
      setEditing(true);
    }
  }, [dateKey, existing, visible]);

  const handleSave = async () => {
    if (!selectedMood || !dateKey) return;
    const mood = getMoodByKey(selectedMood);
    await saveDiaryEntry({
      id: dateKey,
      mood: selectedMood,
      moodEmoji: mood.emoji,
      note: note.trim(),
      cardColor,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (!dateKey) return;
    const clear = async () => {
      await deleteDiaryEntry(dateKey);
      setSelectedMood(null);
      setNote("");
      setCardColor(CARD_COLORS[0]);
      setEditing(true);
      onClose();
    };

    if (Platform.OS === "web") {
      clear();
      return;
    }
    Alert.alert(t.diary.deleteConfirm, "", [
      { text: t.diary.cancel, style: "cancel" },
      { text: t.diary.deleteEntry, style: "destructive", onPress: clear },
    ]);
  };

  const mood = selectedMood ? getMoodByKey(selectedMood) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={entryModalStyles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[entryModalStyles.sheet, { backgroundColor: colors.background, paddingTop: insets.top + 14 }]}>
          <View style={[entryModalStyles.topRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[entryModalStyles.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
              {formatDisplayDate(key, isRTL)}
            </Text>
            <Pressable style={[todayStyles.iconBtn, { backgroundColor: colors.card }]} onPress={onClose}>
              <Icon name="close" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View style={[todayStyles.card, { backgroundColor: existing && !editing ? cardColor : colors.card, borderColor: colors.border, marginHorizontal: 0 }]}>
            <View style={[todayStyles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[todayStyles.dateText, { color: colors.mutedForeground }]}>
                {formatDisplayDate(key, isRTL)}
              </Text>
              {existing && !editing && (
                <View style={[todayStyles.headerActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Pressable onPress={() => setEditing(true)} hitSlop={8} style={[todayStyles.iconBtn, { backgroundColor: colors.background }]}>
                    <Icon name="pencil" size={15} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={handleDelete} hitSlop={8} style={[todayStyles.iconBtn, { backgroundColor: colors.background }]}>
                    <Icon name="trash-can-outline" size={15} color="#E05" />
                  </Pressable>
                </View>
              )}
            </View>

            {!editing && existing ? (
              <View>
                <View style={[todayStyles.moodRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Text style={todayStyles.bigEmoji}>{existing.moodEmoji}</Text>
                  <Text style={[todayStyles.moodName, { color: colors.foreground }]}>
                    {mood ? (t.diary as any)[mood.labelKey] : ""}
                  </Text>
                </View>
                {existing.note ? (
                  <Text style={[todayStyles.noteText, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                    {existing.note}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View>
                <Text style={[todayStyles.sectionLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                  {t.diary.moodLabel}
                </Text>
                <MoodPicker selected={selectedMood} onSelect={setSelectedMood} />

                <TextInput
                  style={[todayStyles.input, {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                    textAlign: isRTL ? "right" : "left",
                  }]}
                  placeholder={t.diary.notePlaceholder}
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  value={note}
                  onChangeText={setNote}
                />

                <Text style={[todayStyles.sectionLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left", marginBottom: 10 }]}>
                  {t.diary.colorPicker}
                </Text>
                <ColorPicker selected={cardColor} onSelect={setCardColor} />

                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
                  {existing && (
                    <Pressable
                      style={[todayStyles.cancelBtn, { borderColor: colors.border }]}
                      onPress={() => setEditing(false)}
                    >
                      <Text style={[todayStyles.cancelBtnText, { color: colors.mutedForeground }]}>{t.diary.cancel}</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={[todayStyles.saveBtn, { backgroundColor: selectedMood ? colors.primary : colors.border, flex: 1 }]}
                    onPress={handleSave}
                    disabled={!selectedMood}
                  >
                    <Icon name="check-circle-outline" size={18} color={selectedMood ? "#fff" : colors.mutedForeground} />
                    <Text style={[todayStyles.saveBtnText, { color: selectedMood ? "#fff" : colors.mutedForeground }]}>
                      {t.diary.saveEntry}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
          <Pressable
            style={[entryModalStyles.noteBtn, { backgroundColor: colors.primary + "18", borderColor: colors.border }]}
            onPress={() => {
              if (!dateKey) return;
              onClose();
              onAddNote(dateKey);
            }}
          >
            <Icon name="notebook-outline" size={18} color={colors.primary} />
            <Text style={[entryModalStyles.noteBtnText, { color: colors.primary }]}>
              {t.diary.addNote}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const entryModalStyles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(45, 20, 34, 0.28)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingHorizontal: 16,
    shadowColor: "#7D4B45",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 20,
  },
  topRow: {
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  noteBtn: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 18,
    marginTop: -8,
    padding: 13,
  },
  noteBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});

const todayStyles = StyleSheet.create({
  card: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 24 },
  header: { justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  dateText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  headerActions: { gap: 8, alignItems: "center" },
  iconBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  moodRow: { alignItems: "center", gap: 10, marginBottom: 10 },
  bigEmoji: { fontSize: 42 },
  moodName: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  noteText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  input: {
    borderWidth: 1, borderRadius: 14, padding: 14,
    fontSize: 15, fontFamily: "Inter_400Regular",
    minHeight: 90, textAlignVertical: "top", marginBottom: 16,
  },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});

// ─── Past entry card ─────────────────────────────────────────────────────────

function PastEntryCard({ entry, onDelete }: { entry: DiaryEntry; onDelete: () => void }) {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const mood = getMoodByKey(entry.mood);
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[pastStyles.card, { backgroundColor: entry.cardColor, transform: [{ scale }] }]}>
      <View style={[pastStyles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={[pastStyles.moodChip, { backgroundColor: mood.color + "80" }]}>
          <Text style={pastStyles.moodEmoji}>{entry.moodEmoji}</Text>
          <Text style={[pastStyles.moodLabel, { color: "#444" }]}>{(t.diary as any)[mood.labelKey]}</Text>
        </View>
        <View style={[pastStyles.right, { flexDirection: isRTL ? "row-reverse" : "row", gap: 8, alignItems: "center" }]}>
          <Text style={[pastStyles.dateText, { color: "#666", textAlign: isRTL ? "right" : "left" }]}>
            {formatDisplayDate(entry.id, isRTL)}
          </Text>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={[pastStyles.deleteBtn, { backgroundColor: "rgba(0,0,0,0.08)" }]}
          >
            <Icon name="trash-can-outline" size={14} color="#E05" />
          </Pressable>
        </View>
      </View>
      {entry.note ? (
        <Text
          style={[pastStyles.note, { color: "#333", textAlign: isRTL ? "right" : "left" }]}
          numberOfLines={3}
        >
          {entry.note}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const pastStyles = StyleSheet.create({
  card: { marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 12 },
  header: { justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  moodChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  moodEmoji: { fontSize: 18 },
  moodLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  right: {},
  dateText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  deleteBtn: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  note: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
});

// ─── Notes feature ────────────────────────────────────────────────────────────

const NOTE_COLORS = [
  "#FFE4E8", "#FFD6A5", "#FDFFB6", "#CAFFBF",
  "#9BF6FF", "#A0C4FF", "#BDB2FF", "#FFC6FF",
  "#FFB3BA", "#FFDAC1", "#E2F0CB", "#B5EAD7",
];

// ─── Rich text editor ─────────────────────────────────────────────────────────

const BLOCK_SIZES: Record<RichBlock["type"], { fontSize: number; lineHeight: number }> = {
  h1:    { fontSize: 28, lineHeight: 38 },
  h2:    { fontSize: 22, lineHeight: 30 },
  h3:    { fontSize: 18, lineHeight: 26 },
  body:  { fontSize: 16, lineHeight: 24 },
  small: { fontSize: 13, lineHeight: 20 },
  bullet: { fontSize: 16, lineHeight: 24 },
  audio: { fontSize: 14, lineHeight: 20 },
};

const RICH_TEXT_COLORS = [
  "#222222", "#E01060", "#FF6B00", "#D4A000",
  "#2E7D32", "#0277BD", "#6A1B9A", "#C2185B",
  "#00695C", "#546E7A",
];

const BULLET_SYMBOLS = ["♡", "♥︎", "ꨄ︎", "𓆩❤︎𓆪", "ᯓ", "𖹭", "✈︎", "❥", "🧚🏻‍♀️", "۶۟", "ৎ"];
const FAIRYTALE_BULLET = "🧚🏻‍♀️";

let _bc = 0;
function makeBlock(o?: Partial<RichBlock>): RichBlock {
  return { id: `b${Date.now()}${++_bc}`, text: "", type: "body", bold: false, italic: false, underline: false, color: "#222222", fontStyle: "sans", ...o };
}

function serializeNoteDraft(title: string, color: string, blocks: RichBlock[]) {
  return JSON.stringify({
    title: title.trim(),
    color,
    blocks: blocks.map((b) => ({
      text: b.text,
      type: b.type,
      bold: b.bold,
      italic: b.italic,
      underline: b.underline,
      color: b.color,
      fontStyle: b.fontStyle,
      audioUri: b.audioUri,
      audioDurationMillis: b.audioDurationMillis,
      bulletSymbol: b.bulletSymbol,
      emojiScale: b.emojiScale,
    })),
  });
}

const NOTE_FONT_OPTIONS: Array<{
  key: RichBlock["fontStyle"];
  label: string;
  preview: string;
}> = [
  { key: "sans", label: "Inter", preview: "Aa" },
  { key: "soft", label: "Soft", preview: "Aa" },
  { key: "serif", label: "Serif", preview: "Aa" },
  { key: "mono", label: "Mono", preview: "{}" },
  { key: "hand", label: "Hand", preview: "Hi" },
  { key: "fancy", label: "Fancy", preview: "Aa" },
];

function blockFontFamily(block: RichBlock): string {
  if (block.fontStyle === "soft") {
    return Platform.select({
      ios: "Avenir Next",
      android: "sans-serif-medium",
      default: "Trebuchet MS",
    })!;
  }
  if (block.fontStyle === "serif") {
    return Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "Georgia",
    })!;
  }
  if (block.fontStyle === "mono") {
    return Platform.select({
      ios: "Courier New",
      android: "monospace",
      default: "Courier New",
    })!;
  }
  if (block.fontStyle === "hand") {
    return Platform.select({
      ios: "Noteworthy",
      android: "casual",
      default: "Comic Sans MS",
    })!;
  }
  if (block.fontStyle === "fancy") {
    return Platform.select({
      ios: "Snell Roundhand",
      android: "cursive",
      default: "Brush Script MT",
    })!;
  }
  return block.bold ? "Inter_700Bold" : "Inter_400Regular";
}

// ─── Emoji helpers ─────────────────────────────────────────────────────────────

function containsEmoji(text: string): boolean {
  try {
    return /\p{Extended_Pictographic}/u.test(text);
  } catch {
    return /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/u.test(text);
  }
}

function formatAudioDuration(ms?: number): string {
  if (!ms) return "0:00";
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const EMOJI_SLIDER_TRACK = 160;
const EMOJI_SCALE_MIN = 1.0;
const EMOJI_SCALE_MAX = 8.0;

function VoiceBlock({
  block,
  onUpdate,
}: {
  block: RichBlock;
  onUpdate: (updates: Partial<RichBlock>) => void;
}) {
  const { l } = useLanguage();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
      recording?.stopAndUnloadAsync().catch(() => {});
    };
  }, [recording, sound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(l("نحتاج إذن الميكروفون لتسجيل الملاحظة الصوتية.", "Microphone permission is needed to record a voice note."));
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const nextRecording = new Audio.Recording();
      await nextRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await nextRecording.startAsync();
      setRecording(nextRecording);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Alert.alert(l("تعذر بدء التسجيل.", "Could not start recording."));
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      if (uri) {
        onUpdate({
          audioUri: uri,
          audioDurationMillis: status.durationMillis ?? 0,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setRecording(null);
      Alert.alert(l("تعذر حفظ التسجيل.", "Could not save recording."));
    }
  };

  const playAudio = async () => {
    if (!block.audioUri) return;
    try {
      if (sound) {
        await sound.replayAsync();
        setIsPlaying(true);
        return;
      }
      const created = await Audio.Sound.createAsync({ uri: block.audioUri });
      setSound(created.sound);
      created.sound.setOnPlaybackStatusUpdate((status) => {
        if ("didJustFinish" in status && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      await created.sound.playAsync();
      setIsPlaying(true);
    } catch {
      Alert.alert(l("تعذر تشغيل التسجيل.", "Could not play this recording."));
    }
  };

  const pauseAudio = async () => {
    if (!sound) return;
    await sound.pauseAsync();
    setIsPlaying(false);
  };

  const removeAudio = async () => {
    await sound?.unloadAsync();
    setSound(null);
    setIsPlaying(false);
    onUpdate({ audioUri: undefined, audioDurationMillis: undefined });
  };

  return (
    <View style={voiceStyles.card}>
      <LinearGradient
        colors={["rgba(255,255,255,0.74)", "rgba(255,255,255,0.38)"]}
        style={voiceStyles.glow}
      />
      <View style={voiceStyles.headerRow}>
        <View style={voiceStyles.micBadge}>
          <Icon name="chatbubble-ellipses-outline" size={17} color="#C2185B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={voiceStyles.title}>{l("ملاحظة صوتية", "Voice note")}</Text>
          <Text style={voiceStyles.sub}>
            {recording
              ? l("يتم التسجيل الآن...", "Recording now...")
              : block.audioUri
              ? formatAudioDuration(block.audioDurationMillis)
              : l("سجلي صوتك داخل هذه الملاحظة", "Record your voice inside this note")}
          </Text>
        </View>
      </View>

      <View style={voiceStyles.waveRow}>
        {Array.from({ length: 22 }).map((_, i) => (
          <View
            key={i}
            style={[
              voiceStyles.wave,
              {
                height: 8 + ((i * 7) % 24),
                opacity: recording || isPlaying ? 0.85 : 0.38,
              },
            ]}
          />
        ))}
      </View>

      <View style={voiceStyles.actions}>
        {recording ? (
          <Pressable style={[voiceStyles.voiceBtn, voiceStyles.stopBtn]} onPress={stopRecording}>
            <Text style={voiceStyles.stopBtnText}>{l("إيقاف", "Stop")}</Text>
          </Pressable>
        ) : (
          <Pressable style={voiceStyles.voiceBtn} onPress={startRecording}>
            <Text style={voiceStyles.voiceBtnText}>
              {block.audioUri ? l("إعادة التسجيل", "Re-record") : l("تسجيل", "Record")}
            </Text>
          </Pressable>
        )}

        {block.audioUri && !recording && (
          <>
            <Pressable style={voiceStyles.secondaryBtn} onPress={isPlaying ? pauseAudio : playAudio}>
              <Text style={voiceStyles.secondaryBtnText}>{isPlaying ? l("إيقاف مؤقت", "Pause") : l("تشغيل", "Play")}</Text>
            </Pressable>
            <Pressable style={voiceStyles.deleteVoiceBtn} onPress={removeAudio}>
              <Text style={voiceStyles.deleteVoiceText}>{l("حذف", "Remove")}</Text>
            </Pressable>
          </>
        )}
      </View>

      <TextInput
        style={voiceStyles.captionInput}
        placeholder={l("تعليق قصير للصوت...", "Short caption for this audio...")}
        placeholderTextColor="rgba(51,51,51,0.45)"
        value={block.text}
        onChangeText={(text) => onUpdate({ text })}
      />
    </View>
  );
}

const voiceStyles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.38)",
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 14,
    marginVertical: 8,
    overflow: "hidden",
    padding: 14,
  },
  glow: { ...StyleSheet.absoluteFillObject },
  headerRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  micBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,107,157,0.18)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  title: { color: "#333", fontFamily: "Inter_700Bold", fontSize: 14 },
  sub: { color: "rgba(51,51,51,0.62)", fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  waveRow: { alignItems: "center", flexDirection: "row", gap: 4, height: 42, marginTop: 12 },
  wave: { backgroundColor: "#C2185B", borderRadius: 999, width: 4 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  voiceBtn: { backgroundColor: "#C2185B", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  voiceBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  stopBtn: { backgroundColor: "#333" },
  stopBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  secondaryBtn: { backgroundColor: "rgba(255,255,255,0.56)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  secondaryBtnText: { color: "#333", fontFamily: "Inter_700Bold", fontSize: 12 },
  deleteVoiceBtn: { backgroundColor: "rgba(224,0,85,0.1)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  deleteVoiceText: { color: "#D20A55", fontFamily: "Inter_700Bold", fontSize: 12 },
  captionInput: {
    color: "#333",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 10,
    padding: 0,
  },
});

function EmojiSizeSlider({
  value, onChange, onRelease,
}: { value: number; onChange: (v: number) => void; onRelease: () => void }) {
  const startVal = useRef(value);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onReleaseRef = useRef(onRelease);
  valueRef.current = value;
  onChangeRef.current = onChange;
  onReleaseRef.current = onRelease;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startVal.current = valueRef.current; },
      onPanResponderMove: (_, g) => {
        const delta = (g.dx / EMOJI_SLIDER_TRACK) * (EMOJI_SCALE_MAX - EMOJI_SCALE_MIN);
        const v = Math.max(EMOJI_SCALE_MIN, Math.min(EMOJI_SCALE_MAX, startVal.current + delta));
        onChangeRef.current(Math.round(v * 10) / 10);
      },
      onPanResponderRelease: () => { onReleaseRef.current(); },
    })
  ).current;

  const pct = (value - EMOJI_SCALE_MIN) / (EMOJI_SCALE_MAX - EMOJI_SCALE_MIN);
  const thumbX = Math.max(0, Math.min(pct * EMOJI_SLIDER_TRACK - 10, EMOJI_SLIDER_TRACK - 20));

  return (
    <View style={tbStyles.emojiRow}>
      <Text style={{ fontSize: 13 }}>😊</Text>
      <View style={tbStyles.emojiTrackWrap} {...pan.panHandlers}>
        <View style={tbStyles.emojiTrack}>
          <View style={[tbStyles.emojiFill, { width: pct * EMOJI_SLIDER_TRACK }]} />
        </View>
        <View style={[tbStyles.emojiThumb, { left: thumbX }]} />
      </View>
      <Text style={{ fontSize: Math.round(13 + 47 * pct) }}>😊</Text>
      <Text style={tbStyles.emojiScaleLabel}>{value.toFixed(1)}×</Text>
    </View>
  );
}

// ─ Single block text input ────────────────────────────────────────────────────

function RichBlockInput({
  block, isActive, onChangeText, onUpdateBlock, onFocus, onEnter, onBackspaceEmpty, inputRef,
}: {
  block: RichBlock; isActive: boolean;
  onChangeText: (id: string, t: string) => void;
  onUpdateBlock: (id: string, updates: Partial<RichBlock>) => void;
  onFocus: (id: string) => void;
  onEnter: (id: string, after: string) => void;
  onBackspaceEmpty: (id: string) => void;
  inputRef: (r: TextInput | null) => void;
}) {
  const [bulletPickerOpen, setBulletPickerOpen] = useState(false);

  if (block.type === "audio") {
    return (
      <View style={[richBlockStyles.wrap, isActive && richBlockStyles.wrapActive]}>
        {isActive && <View style={[richBlockStyles.rail, { backgroundColor: "#C2185B" }]} />}
        <Pressable onPress={() => onFocus(block.id)}>
          <VoiceBlock block={block} onUpdate={(updates) => onUpdateBlock(block.id, updates)} />
        </Pressable>
      </View>
    );
  }

  const sz = BLOCK_SIZES[block.type];
  const scale = block.emojiScale ?? 1;
  const effectiveFontSize = Math.round(sz.fontSize * scale);
  const effectiveLineHeight = Math.round(sz.lineHeight * scale);
  const bulletSymbol = BULLET_SYMBOLS.includes(block.bulletSymbol ?? "")
    ? block.bulletSymbol!
    : BULLET_SYMBOLS[0];
  const isFairytaleBullet = bulletSymbol === FAIRYTALE_BULLET;
  const cycleBullet = () => {
    const index = BULLET_SYMBOLS.indexOf(bulletSymbol);
    onUpdateBlock(block.id, {
      bulletSymbol: BULLET_SYMBOLS[(index + 1) % BULLET_SYMBOLS.length],
    });
  };

  return (
    <View style={[richBlockStyles.wrap, isActive && richBlockStyles.wrapActive]}>
      {isActive && <View style={[richBlockStyles.rail, { backgroundColor: block.color }]} />}
      {block.type === "bullet" && (
        <>
          <Pressable
            style={[richBlockStyles.bulletWrap, { height: effectiveLineHeight }]}
            onPress={cycleBullet}
            onLongPress={() => setBulletPickerOpen(true)}
            delayLongPress={260}
            hitSlop={12}
          >
            <Text
              style={[
                richBlockStyles.bulletSymbol,
                {
                  fontSize: isFairytaleBullet ? Math.round(effectiveFontSize * 1.25) : 21,
                  lineHeight: effectiveLineHeight,
                },
              ]}
            >
              {bulletSymbol}
            </Text>
          </Pressable>
          {bulletPickerOpen && (
            <View style={richBlockStyles.bulletPicker}>
              {BULLET_SYMBOLS.map((symbol) => (
                <Pressable
                  key={symbol}
                  style={[
                    richBlockStyles.bulletOption,
                    bulletSymbol === symbol && richBlockStyles.bulletOptionActive,
                  ]}
                  onPress={() => {
                    onUpdateBlock(block.id, { bulletSymbol: symbol });
                    setBulletPickerOpen(false);
                  }}
                >
                  <Text style={richBlockStyles.bulletOptionText}>{symbol}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
      <TextInput
        ref={inputRef}
        style={{
          fontSize: effectiveFontSize,
          lineHeight: effectiveLineHeight,
          fontFamily: blockFontFamily(block),
          fontWeight: block.bold ? "700" : "400",
          fontStyle: block.italic ? "italic" : "normal",
          textDecorationLine: block.underline ? "underline" : "none",
          color: block.color,
          paddingLeft: block.type === "bullet" ? 72 : 20,
          paddingRight: 20,
          paddingVertical: 6,
          minHeight: effectiveLineHeight + 12,
          opacity: 1,
        }}
        value={block.text}
        multiline
        blurOnSubmit={false}
        onFocus={() => onFocus(block.id)}
        onChangeText={(val) => {
          if (val.includes("\n")) {
            const [before, ...rest] = val.split("\n");
            onChangeText(block.id, before);
            onEnter(block.id, rest.join("\n"));
          } else {
            onChangeText(block.id, val);
          }
        }}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === "Backspace" && block.text === "") onBackspaceEmpty(block.id);
        }}
      />
    </View>
  );
}

const richBlockStyles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    marginHorizontal: 10,
    marginVertical: 1,
    overflow: "visible",
    position: "relative",
  },
  wrapActive: {
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  rail: {
    bottom: 8,
    borderRadius: 4,
    left: 4,
    opacity: 0.65,
    position: "absolute",
    top: 8,
    width: 4,
  },
  bulletWrap: {
    alignItems: "center",
    justifyContent: "center",
    left: 8,
    position: "absolute",
    top: 6,
    width: 62,
    zIndex: 5,
  },
  bulletSymbol: {
    color: "#C2185B",
    fontSize: 21,
    lineHeight: 30,
    includeFontPadding: false,
    minWidth: 58,
    textAlign: "center",
    textShadowColor: "rgba(194,24,91,0.18)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bulletPicker: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "rgba(194,24,91,0.16)",
    borderRadius: 18,
    borderWidth: 1,
    elevation: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    left: 14,
    maxWidth: 250,
    padding: 6,
    position: "absolute",
    shadowColor: "#C2185B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    top: 42,
    zIndex: 20,
  },
  bulletOption: {
    alignItems: "center",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    minWidth: 36,
    paddingHorizontal: 6,
  },
  bulletOptionActive: {
    backgroundColor: "rgba(255,107,157,0.18)",
  },
  bulletOptionText: {
    color: "#C2185B",
    fontSize: 19,
    lineHeight: 26,
  },
});

// ─ Formatting toolbar ─────────────────────────────────────────────────────────

type FormattingToolbarProps = {
  activeBlock: RichBlock | null;
  onUpdateBlock: (u: Partial<RichBlock>) => void;
  noteColor: string;
  onNoteColorChange: (c: string) => void;
  onRefocus: () => void;
  hasEmoji: boolean;
  emojiScale: number;
  onEmojiScale: (s: number) => void;
  onAddBlock: () => void;
  onDuplicateBlock: () => void;
  onMoveBlock: (direction: -1 | 1) => void;
  onDeleteBlock: () => void;
  onBulletSymbolChange: (symbol: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
};

function FormattingToolbar({
  activeBlock,
  onUpdateBlock,
  noteColor,
  onNoteColorChange,
  onRefocus,
  hasEmoji,
  emojiScale,
  onEmojiScale,
  onAddBlock,
  onDuplicateBlock,
  onMoveBlock,
  onDeleteBlock,
  onBulletSymbolChange,
  canMoveUp,
  canMoveDown,
  canDelete,
}: FormattingToolbarProps) {
  const insets = useSafeAreaInsets();
  const b = activeBlock;
  const [bulletPickerOpen, setBulletPickerOpen] = useState(false);
  if (!b) return null;

  const Btn = ({ label, active, onPress, extraTextStyle }: {
    label: string; active: boolean; onPress: () => void; extraTextStyle?: object;
  }) => (
    <Pressable
      style={[tbStyles.btn, active && tbStyles.btnOn]}
      onPress={() => { onPress(); onRefocus(); }}
    >
      <Text style={[tbStyles.btnTxt, active && tbStyles.btnTxtOn, extraTextStyle]}>{label}</Text>
    </Pressable>
  );

  const ActionBtn = ({
    label,
    onPress,
    disabled,
    tone = "neutral",
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    tone?: "neutral" | "danger";
  }) => (
    <Pressable
      style={[
        tbStyles.actionBtn,
        tone === "danger" && tbStyles.actionBtnDanger,
        disabled && tbStyles.actionBtnDisabled,
      ]}
      disabled={disabled}
      onPress={() => {
        onPress();
        onRefocus();
      }}
    >
      <Text
        style={[
          tbStyles.actionBtnText,
          tone === "danger" && tbStyles.actionBtnTextDanger,
          disabled && tbStyles.actionBtnTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[tbStyles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {bulletPickerOpen && (
        <View style={tbStyles.toolbarBulletPicker}>
          {BULLET_SYMBOLS.map((symbol) => (
            <Pressable
              key={symbol}
              style={[
                tbStyles.toolbarBulletOption,
                (b.bulletSymbol ?? BULLET_SYMBOLS[0]) === symbol && tbStyles.toolbarBulletOptionActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onBulletSymbolChange(symbol);
                setBulletPickerOpen(false);
                onRefocus();
              }}
            >
              <Text style={tbStyles.toolbarBulletText}>{symbol}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Emoji size slider — shows when block contains emoji */}
      {hasEmoji && (
        <EmojiSizeSlider
          value={emojiScale}
          onChange={(s) => onEmojiScale(s)}
          onRelease={onRefocus}
        />
      )}

      {/* Row 1 — type + inline + font */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={tbStyles.actionRow}>
        <ActionBtn label="+ Block" onPress={onAddBlock} />
        <ActionBtn label="+ Voice" onPress={() => onUpdateBlock({ type: "audio", text: "", audioUri: undefined, audioDurationMillis: undefined })} />
        <ActionBtn label="Copy" onPress={onDuplicateBlock} />
        <ActionBtn label="↑" onPress={() => onMoveBlock(-1)} disabled={!canMoveUp} />
        <ActionBtn label="↓" onPress={() => onMoveBlock(1)} disabled={!canMoveDown} />
        <ActionBtn label="Delete" onPress={onDeleteBlock} disabled={!canDelete} tone="danger" />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={tbStyles.row}>
        {(["h1","h2","h3","body","small"] as const).map(tp => (
          <Btn key={tp} label={tp === "body" ? "¶" : tp === "small" ? "sm" : tp.toUpperCase()} active={b.type === tp} onPress={() => onUpdateBlock({ type: tp })} />
        ))}
        <View style={tbStyles.listControlWrap}>
          <Pressable
            style={[tbStyles.btn, b.type === "bullet" && tbStyles.btnOn]}
            onPress={() => {
              onUpdateBlock({
                type: "bullet",
                bulletSymbol: b.bulletSymbol ?? BULLET_SYMBOLS[0],
              });
              onRefocus();
            }}
            onLongPress={() => {
              onUpdateBlock({
                type: "bullet",
                bulletSymbol: b.bulletSymbol ?? BULLET_SYMBOLS[0],
              });
              setBulletPickerOpen(true);
            }}
            delayLongPress={260}
          >
            <Text style={[tbStyles.btnTxt, b.type === "bullet" && tbStyles.btnTxtOn]}>
              {(b.bulletSymbol ?? BULLET_SYMBOLS[0])} List
            </Text>
          </Pressable>
        </View>
        <View style={tbStyles.sep} />
        <Btn label="B" active={b.bold}      onPress={() => onUpdateBlock({ bold: !b.bold })}           extraTextStyle={{ fontFamily: "Inter_700Bold" }} />
        <Btn label="I" active={b.italic}    onPress={() => onUpdateBlock({ italic: !b.italic })}       extraTextStyle={{ fontStyle: "italic" }} />
        <Btn label="U" active={b.underline} onPress={() => onUpdateBlock({ underline: !b.underline })} extraTextStyle={{ textDecorationLine: "underline" }} />
        <View style={tbStyles.sep} />
        {NOTE_FONT_OPTIONS.map((font) => (
          <Pressable
            key={font.key}
            style={[tbStyles.fontBtn, b.fontStyle === font.key && tbStyles.btnOn]}
            onPress={() => {
              onUpdateBlock({ fontStyle: font.key });
              onRefocus();
            }}
          >
            <Text
              style={[
                tbStyles.fontPreview,
                b.fontStyle === font.key && tbStyles.btnTxtOn,
                { fontFamily: blockFontFamily({ ...b, fontStyle: font.key }) },
              ]}
            >
              {font.preview}
            </Text>
            <Text style={[tbStyles.fontLabel, b.fontStyle === font.key && tbStyles.btnTxtOn]}>
              {font.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Row 2 — text colors + card bg colors */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={tbStyles.colorRow}>
        <Text style={tbStyles.colorLabel}>A</Text>
        {RICH_TEXT_COLORS.map(c => (
          <Pressable key={c} style={[tbStyles.dot, { backgroundColor: c }, b.color === c && tbStyles.dotActive]}
            onPress={() => { Haptics.selectionAsync(); onUpdateBlock({ color: c }); onRefocus(); }} />
        ))}
        <View style={tbStyles.sep} />
        <Text style={tbStyles.colorLabel}>🎨</Text>
        {NOTE_COLORS.map(c => (
          <Pressable key={c} style={[tbStyles.dot, { backgroundColor: c }, noteColor === c && tbStyles.dotActive]}
            onPress={() => { Haptics.selectionAsync(); onNoteColorChange(c); onRefocus(); }} />
        ))}
      </ScrollView>
    </View>
  );
}

const tbStyles = StyleSheet.create({
  container: { backgroundColor: "rgba(255,255,255,0.94)", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10, overflow: "visible", position: "relative", zIndex: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 44, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 46, gap: 4 },
  colorRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 44, gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.07)" },
  actionBtnDanger: { backgroundColor: "rgba(224,0,85,0.1)" },
  actionBtnDisabled: { opacity: 0.36 },
  actionBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#333" },
  actionBtnTextDanger: { color: "#D20A55" },
  actionBtnTextDisabled: { color: "#999" },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 34, alignItems: "center", justifyContent: "center" },
  btnOn: { backgroundColor: "rgba(0,0,0,0.12)" },
  btnTxt: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#666" },
  btnTxtOn: { color: "#111" },
  listControlWrap: { position: "relative" },
  toolbarBulletPicker: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.66)",
    borderColor: "rgba(194,24,91,0.18)",
    borderRadius: 20,
    borderWidth: 1,
    bottom: 96,
    elevation: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    left: 12,
    maxWidth: 286,
    padding: 10,
    position: "absolute",
    shadowColor: "#C2185B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    zIndex: 100,
  },
  toolbarBulletOption: {
    alignItems: "center",
    backgroundColor: "rgba(194,24,91,0.07)",
    borderRadius: 16,
    height: 40,
    justifyContent: "center",
    minWidth: 42,
    paddingHorizontal: 8,
  },
  toolbarBulletOptionActive: { backgroundColor: "rgba(255,107,157,0.24)", borderColor: "rgba(194,24,91,0.22)", borderWidth: 1 },
  toolbarBulletText: { color: "#C2185B", fontSize: 20, lineHeight: 26, includeFontPadding: false, textAlign: "center" },
  fontBtn: {
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    minWidth: 58,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fontPreview: { color: "#444", fontSize: 15, lineHeight: 18 },
  fontLabel: { color: "#666", fontFamily: "Inter_500Medium", fontSize: 10, lineHeight: 12, marginTop: 1 },
  sep: { width: 1, height: 24, backgroundColor: "rgba(0,0,0,0.12)", marginHorizontal: 4 },
  colorLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#999", width: 14, textAlign: "center" },
  dot: { width: 24, height: 24, borderRadius: 12 },
  dotActive: { borderWidth: 3, borderColor: "#333" },
  // Emoji slider
  emojiRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 42, gap: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" },
  emojiTrackWrap: { width: EMOJI_SLIDER_TRACK, height: 24, justifyContent: "center", position: "relative" },
  emojiTrack: { height: 4, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 2 },
  emojiFill: { height: 4, backgroundColor: "#FF6B9D", borderRadius: 2 },
  emojiThumb: { position: "absolute", top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: "#FF6B9D", borderWidth: 2, borderColor: "#fff" },
  emojiScaleLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#888", minWidth: 40 },
});

// ─ Modal ─────────────────────────────────────────────────────────────────────

function NoteEditorModal({
  visible, initialNote, onSave, onClose,
}: {
  visible: boolean;
  initialNote: DiaryNote | null;
  onSave: (text: string, color: string, richContent: RichBlock[], title?: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t, isRTL, l } = useLanguage();
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<RichBlock[]>(() => [makeBlock()]);
  const [activeId, setActiveId] = useState("");
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [savePromptVisible, setSavePromptVisible] = useState(false);
  const blockRefs = useRef<{ [id: string]: TextInput | null }>({});
  const titleRef = useRef<TextInput | null>(null);
  const initialDraftRef = useRef("");

  useEffect(() => {
    if (!visible) return;
    setTitle(initialNote?.title ?? "");
    setNoteColor(initialNote?.color ?? NOTE_COLORS[0]);
    if (initialNote?.richContent?.length) {
      const nb = initialNote.richContent;
      setBlocks(nb);
      setActiveId(nb[0].id);
      initialDraftRef.current = serializeNoteDraft(initialNote?.title ?? "", initialNote?.color ?? NOTE_COLORS[0], nb);
    } else {
      const lines = (initialNote?.text ?? "").split("\n").filter(Boolean);
      const nb = lines.length ? lines.map((l) => makeBlock({ text: l })) : [makeBlock()];
      setBlocks(nb);
      setActiveId(nb[0].id);
      initialDraftRef.current = serializeNoteDraft(initialNote?.title ?? "", initialNote?.color ?? NOTE_COLORS[0], nb);
    }
  }, [visible, initialNote?.id]);

  // Keep a ref so refocusActive can always read the latest activeId
  const activeIdRef = useRef("");
  activeIdRef.current = activeId;

  const refocusActive = useCallback(() => {
    setTimeout(() => {
      const id = activeIdRef.current;
      if (id) blockRefs.current[id]?.focus();
    }, 50);
  }, []);

  const activeBlock = blocks.find((b) => b.id === activeId) ?? null;
  const activeIndex = blocks.findIndex((b) => b.id === activeId);
  const hasContent = !!title.trim() || blocks.some((b) => b.text.trim() || b.audioUri);
  const hasEmojiInBlock = containsEmoji(activeBlock?.text ?? "");
  const emojiScale = activeBlock?.emojiScale ?? 1.0;

  const updateBlock = (id: string, updates: Partial<RichBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

  const handleChangeText = (id: string, text: string) => updateBlock(id, { text });

  const handleEnter = (id: string, after: string) => {
    const src = blocks.find((b) => b.id === id);
    const isEmptyBullet = src?.type === "bullet" && !src.text.trim() && !after.trim();
    const nextType =
      isEmptyBullet || src?.type === "h1" || src?.type === "h2" || src?.type === "audio"
        ? "body"
        : src?.type;
    const nb = makeBlock({
      type: nextType,
      color: src?.color,
      fontStyle: src?.fontStyle,
      bulletSymbol: nextType === "bullet" ? src?.bulletSymbol : undefined,
      text: after,
    });
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, nb);
      return next;
    });
    setActiveId(nb.id);
    setTimeout(() => blockRefs.current[nb.id]?.focus(), 30);
  };

  const handleAddBlock = () => {
    const base = activeBlock ?? blocks[blocks.length - 1];
    const nb = makeBlock({
      color: base?.color,
      fontStyle: base?.fontStyle,
      type: "body",
    });
    setBlocks((prev) => {
      const idx = activeIndex >= 0 ? activeIndex : prev.length - 1;
      const next = [...prev];
      next.splice(idx + 1, 0, nb);
      return next;
    });
    setActiveId(nb.id);
    setTimeout(() => blockRefs.current[nb.id]?.focus(), 30);
  };

  const handleDuplicateBlock = () => {
    if (!activeBlock) return;
    const { id: _id, ...copy } = activeBlock;
    const nb = makeBlock(copy);
    setBlocks((prev) => {
      const idx = activeIndex >= 0 ? activeIndex : prev.length - 1;
      const next = [...prev];
      next.splice(idx + 1, 0, nb);
      return next;
    });
    setActiveId(nb.id);
    setTimeout(() => blockRefs.current[nb.id]?.focus(), 30);
  };

  const handleMoveBlock = (direction: -1 | 1) => {
    if (activeIndex < 0) return;
    const target = activeIndex + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(activeIndex, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const handleDeleteBlock = () => {
    if (blocks.length <= 1 || activeIndex < 0) return;
    const nextActive = blocks[activeIndex - 1] ?? blocks[activeIndex + 1];
    setBlocks((prev) => prev.filter((b) => b.id !== activeId));
    setActiveId(nextActive.id);
    setTimeout(() => blockRefs.current[nextActive.id]?.focus(), 30);
  };

  const handleBackspaceEmpty = (id: string) => {
    if (blocks.length <= 1) return;
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === 0) return;
    const prev = blocks[idx - 1];
    setBlocks((p) => p.filter((b) => b.id !== id));
    setActiveId(prev.id);
    setTimeout(() => blockRefs.current[prev.id]?.focus(), 30);
  };

  const handleSave = () => {
    const normalizedBlocks = blocks.length
      ? blocks
      : [makeBlock()];
    const text = normalizedBlocks.map((b) => b.text).join("\n").trim();
    onSave(text, noteColor, normalizedBlocks, title.trim());
  };

  const handleCloseRequest = () => {
    const isDirty = serializeNoteDraft(title, noteColor, blocks) !== initialDraftRef.current;
    if (!hasContent || !isDirty) {
      onClose();
      return;
    }

    setSavePromptVisible(true);
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleCloseRequest}>
      <View style={[editorStyles.root, { backgroundColor: noteColor }]}>
        {/* Top bar */}
        <View style={[editorStyles.topBar, { paddingTop: insets.top + 12, flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable style={editorStyles.topBtn} onPress={handleCloseRequest} hitSlop={10}>
            <Icon name="arrow-left" size={22} color="#333" />
          </Pressable>
          <Text style={editorStyles.topTitle}>
            {initialNote ? t.diary.editEntry : t.diary.addNote}
          </Text>
          <Pressable
            style={[editorStyles.saveBtn, { backgroundColor: hasContent ? "#33333324" : "#33333308" }]}
            onPress={hasContent ? handleSave : undefined}
            disabled={!hasContent}
            hitSlop={10}
          >
            <Text style={[editorStyles.saveBtnTxt, { color: hasContent ? "#333" : "#aaa" }]}>
              {t.diary.saveEntry}
            </Text>
          </Pressable>
        </View>

        {/* Editor + floating toolbar */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 60 }}
          >
            {/* Title input */}
            <TextInput
              ref={titleRef}
              style={[editorStyles.titleInput, { textAlign: isRTL ? "right" : "left" }]}
              placeholder={l("عنوان الملاحظة...", "Note title...")}
              placeholderTextColor="#aaa"
              value={title}
              onChangeText={setTitle}
              multiline={false}
            />

            {blocks.map((block) => (
              <RichBlockInput
                key={block.id}
                block={block}
                isActive={block.id === activeId}
                onChangeText={handleChangeText}
                onUpdateBlock={updateBlock}
                onFocus={setActiveId}
                onEnter={handleEnter}
                onBackspaceEmpty={handleBackspaceEmpty}
                inputRef={(r) => { blockRefs.current[block.id] = r; }}
              />
            ))}
          </ScrollView>
          <FormattingToolbar
            activeBlock={activeBlock}
            onUpdateBlock={(u) => activeId && updateBlock(activeId, u)}
            noteColor={noteColor}
            onNoteColorChange={setNoteColor}
            onRefocus={refocusActive}
            hasEmoji={hasEmojiInBlock}
            emojiScale={emojiScale}
            onEmojiScale={(s) => activeId && updateBlock(activeId, { emojiScale: s })}
            onAddBlock={handleAddBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onMoveBlock={handleMoveBlock}
            onDeleteBlock={handleDeleteBlock}
            onBulletSymbolChange={(symbol) =>
              activeId && updateBlock(activeId, { type: "bullet", bulletSymbol: symbol })
            }
            canMoveUp={activeIndex > 0}
            canMoveDown={activeIndex >= 0 && activeIndex < blocks.length - 1}
            canDelete={blocks.length > 1}
          />
        </KeyboardAvoidingView>

        {savePromptVisible && (
          <View style={editorStyles.promptOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setSavePromptVisible(false)}
            />
            <View style={[editorStyles.promptCard, { backgroundColor: noteColor }]}>
              <View style={editorStyles.promptIcon}>
                <Icon name="content-save-heart-outline" size={24} color="#C2185B" />
              </View>
              <Text style={[editorStyles.promptTitle, { textAlign: isRTL ? "right" : "left" }]}>
                {l("حفظ الملاحظة؟", "Save note?")}
              </Text>
              <Text style={[editorStyles.promptText, { textAlign: isRTL ? "right" : "left" }]}>
                {l("لديك تغييرات غير محفوظة.", "You have unsaved changes.")}
              </Text>
              <View style={[editorStyles.promptActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Pressable
                  style={editorStyles.promptNoBtn}
                  onPress={() => {
                    setSavePromptVisible(false);
                    onClose();
                  }}
                >
                  <Text style={editorStyles.promptNoText}>{l("لا", "No")}</Text>
                </Pressable>
                <Pressable
                  style={editorStyles.promptSaveBtn}
                  onPress={() => {
                    setSavePromptVisible(false);
                    handleSave();
                  }}
                >
                  <Text style={editorStyles.promptSaveText}>{l("حفظ", "Save")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const editorStyles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.08)", alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#333", flex: 1, textAlign: "center" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtnTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  promptOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(45, 20, 34, 0.26)",
    justifyContent: "center",
    padding: 24,
    zIndex: 50,
  },
  promptCard: {
    borderColor: "rgba(194,24,91,0.16)",
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 340,
    padding: 20,
    shadowColor: "#C2185B",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: "100%",
    elevation: 18,
  },
  promptIcon: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.56)",
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    marginBottom: 14,
    width: 42,
  },
  promptTitle: { color: "#2F2028", fontFamily: "Inter_700Bold", fontSize: 20, lineHeight: 26 },
  promptText: { color: "rgba(47,32,40,0.72)", fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, marginTop: 6 },
  promptActions: { gap: 10, justifyContent: "flex-end", marginTop: 18 },
  promptNoBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.46)",
    borderRadius: 16,
    minWidth: 86,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  promptSaveBtn: {
    alignItems: "center",
    backgroundColor: "#C2185B",
    borderRadius: 16,
    minWidth: 96,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  promptNoText: { color: "#6B4A58", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  promptSaveText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  titleInput: {
    color: "#333",
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    minHeight: 58,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
});

// ─── Emoji-aware text renderer (for note card preview) ───────────────────────

function EmojiText({ text, style, emojiScale, numberOfLines }: {
  text: string; style: object; emojiScale: number; numberOfLines?: number;
}) {
  const segments = useMemo(() => {
    const res: Array<{ t: string; isEmoji: boolean }> = [];
    try {
      const re = /\p{Extended_Pictographic}/gu;
      let lastIdx = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        if (m.index > lastIdx) res.push({ t: text.slice(lastIdx, m.index), isEmoji: false });
        res.push({ t: m[0], isEmoji: true });
        lastIdx = re.lastIndex;
      }
      if (lastIdx < text.length) res.push({ t: text.slice(lastIdx), isEmoji: false });
    } catch {
      res.push({ t: text, isEmoji: false });
    }
    return res;
  }, [text]);

  const baseFontSize = (style as any).fontSize ?? 16;
  return (
    <Text numberOfLines={numberOfLines} style={style}>
      {segments.map((s, i) =>
        s.isEmoji ? (
          <Text key={i} style={{ fontSize: Math.round(baseFontSize * emojiScale) }}>{s.t}</Text>
        ) : (
          <Text key={i}>{s.t}</Text>
        )
      )}
    </Text>
  );
}

// ─── Note card (pressable → opens editor) ────────────────────────────────────

function NoteCard({
  note, onPress, onDelete,
}: {
  note: DiaryNote; onPress: () => void; onDelete: () => void;
}) {
  const { t, isRTL, l } = useLanguage();
  const rich = note.richContent;
  const previewBlocks = rich?.filter((block) => block.text.trim()).slice(0, 5) ?? [];
  const wordCount = note.text.trim().split(/\s+/).filter(Boolean).length;
  const noteTime = new Date(note.createdAt).toLocaleTimeString(isRTL ? "ar-SA" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Pressable style={[noteCardStyles.card, { backgroundColor: note.color }]} onPress={onPress}>
      <View pointerEvents="none" style={noteCardStyles.cardGlow} />
      <Pressable
        style={[noteCardStyles.closeBtn, isRTL ? { left: 10 } : { right: 10 }]}
        onPress={onDelete}
        hitSlop={10}
      >
        <Icon name="trash-can-outline" size={14} color="#9B315A" />
      </Pressable>

      <View style={[noteCardStyles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={noteCardStyles.metaPill}>
          <Icon name="time-outline" size={12} color="#7A5264" />
          <Text style={noteCardStyles.metaText}>{noteTime}</Text>
        </View>
        <Text style={noteCardStyles.metaText}>
          {wordCount} {l("كلمة", "words")}
        </Text>
      </View>

      <Text style={[noteCardStyles.title, { textAlign: isRTL ? "right" : "left", paddingRight: isRTL ? 0 : 30, paddingLeft: isRTL ? 30 : 0 }]} numberOfLines={1}>
        {note.title?.trim() || l("ملاحظة بدون عنوان", "Untitled note")}
      </Text>

      {previewBlocks.length > 0 ? (
        <View style={{ paddingRight: isRTL ? 0 : 32, paddingLeft: isRTL ? 32 : 0 }}>
          {previewBlocks.map((block, i) => {
            if (block.type === "audio") {
              return (
                <View key={block.id} style={noteCardStyles.audioPreview}>
                  <Icon name="chatbubble-ellipses-outline" size={14} color="#9B315A" />
                  <Text style={noteCardStyles.audioPreviewText} numberOfLines={1}>
                    {block.text?.trim() || l("ملاحظة صوتية", "Voice note")} · {formatAudioDuration(block.audioDurationMillis)}
                  </Text>
                </View>
              );
            }
            const sz = BLOCK_SIZES[block.type];
            const scale = block.emojiScale ?? 1;
            const previewSize = Math.min(sz.fontSize * scale, 56);
            const blockStyle: TextStyle = {
              fontSize: previewSize,
              lineHeight: previewSize * 1.28,
              fontFamily: blockFontFamily(block),
              fontWeight: block.bold ? "700" : "400",
              fontStyle: block.italic ? "italic" : "normal",
              textDecorationLine: block.underline ? "underline" : "none",
              color: block.color,
              textAlign: isRTL ? "right" : "left",
            };
            const nLines = scale > 3 ? 1 : (i === 0 && block.type !== "body" ? 1 : 2);
            return (
              <View key={block.id} style={block.type === "bullet" ? noteCardStyles.bulletPreviewRow : undefined}>
                {block.type === "bullet" && (
                  <Text style={noteCardStyles.bulletPreviewSymbol}>
                    {block.bulletSymbol ?? BULLET_SYMBOLS[0]}
                  </Text>
                )}
                <EmojiText
                  numberOfLines={nLines}
                  style={blockStyle}
                  emojiScale={Math.min(scale, 3)}
                  text={block.text}
                />
              </View>
            );
          })}
        </View>
      ) : note.text.trim() ? (
        <Text style={[noteCardStyles.text, { textAlign: isRTL ? "right" : "left", paddingRight: isRTL ? 0 : 30, paddingLeft: isRTL ? 30 : 0 }]} numberOfLines={4}>
          {note.text}
        </Text>
      ) : (
        <Text style={[noteCardStyles.text, noteCardStyles.emptyPreview, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
          {l("اكتبي شيئاً لطيفاً هنا", "Write something lovely here")}
        </Text>
      )}

      <View style={[noteCardStyles.editHint, { alignItems: isRTL ? "flex-start" : "flex-end" }]}>
        <View style={noteCardStyles.editPill}>
          <Icon name="pencil" size={11} color="#7A5264" />
          <Text style={noteCardStyles.editText}>{l("تعديل", "Edit")}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const noteCardStyles = StyleSheet.create({
  card: {
    borderColor: "rgba(255,255,255,0.58)",
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 12,
    overflow: "hidden",
    padding: 16,
    position: "relative",
    shadowColor: "#C06",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  cardGlow: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    height: 120,
    position: "absolute",
    right: -28,
    top: -54,
    width: 120,
  },
  title: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#333", marginBottom: 8 },
  closeBtn: {
    position: "absolute",
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.48)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  text: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, paddingRight: 30 },
  emptyPreview: { color: "rgba(51,51,51,0.54)", fontStyle: "italic" },
  metaRow: { alignItems: "center", gap: 8, marginBottom: 10, paddingRight: 34 },
  metaPill: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.42)", borderRadius: 14, flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  metaText: { color: "#7A5264", fontFamily: "Inter_600SemiBold", fontSize: 11 },
  audioPreview: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.38)", borderRadius: 14, flexDirection: "row", gap: 6, marginTop: 4, paddingHorizontal: 9, paddingVertical: 7 },
  audioPreviewText: { color: "#7A5264", flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  bulletPreviewRow: { alignItems: "flex-start", flexDirection: "row", gap: 8 },
  bulletPreviewSymbol: { color: "#C2185B", fontSize: 16, lineHeight: 24, marginTop: 0, minWidth: 20, textAlign: "center" },
  editHint: { marginTop: 10 },
  editPill: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.42)", borderRadius: 14, flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  editText: { color: "#7A5264", fontFamily: "Inter_600SemiBold", fontSize: 11 },
});

// ─── Notes section ────────────────────────────────────────────────────────────

function AllNotesModal({
  visible,
  notes,
  onClose,
  onDeleteNote,
  onEditNote,
}: {
  visible: boolean;
  notes: DiaryNote[];
  onClose: () => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: DiaryNote) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL, l } = useLanguage();

  const notesByDate = useMemo(() => {
    return notes.reduce<Record<string, DiaryNote[]>>((acc, note) => {
      acc[note.date] = [...(acc[note.date] ?? []), note];
      return acc;
    }, {});
  }, [notes]);

  const dateOptions = useMemo(() => {
    return Object.keys(notesByDate).sort((a, b) => (a < b ? 1 : -1));
  }, [notesByDate]);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0] ?? "");
  const selectedNotes = (notesByDate[selectedDate] ?? []).sort((a, b) => b.createdAt - a.createdAt);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return notes.filter((note) => {
      const richText = note.richContent?.map((block) => block.text).join(" ") ?? "";
      return `${note.title ?? ""} ${note.text} ${richText}`.toLowerCase().includes(normalizedSearch);
    });
  }, [normalizedSearch, notes]);
  const displayedNotes = normalizedSearch ? searchResults : selectedNotes;
  const customDate = "";
  const dateError = "";
  const selectedEntry: DiaryEntry | undefined = undefined;
  const selectedMood: string | null = null;
  const memoryText = "";
  const cardColor = CARD_COLORS[0];
  const setCustomDate = (_value: string) => {};
  const setDateError = (_value: string) => {};
  const setSelectedMood = (_value: string) => {};
  const setMemoryText = (_value: string) => {};
  const setCardColor = (_value: string) => {};
  const handleSaveEntry = () => {};
  const onAddNote = (_dateKey: string) => {};
  const onDeleteEntry = (_dateKey: string) => {};

  useEffect(() => {
    if (visible) {
      setSelectedDate((current) => (dateOptions.includes(current) ? current : dateOptions[0] ?? ""));
    }
  }, [dateOptions, visible]);

  const handleOpenCustomDate = () => {
    const next = customDate.trim();
    if (!isDateKeyPastOrToday(next)) {
      setDateError(l("اكتبي التاريخ بصيغة YYYY-MM-DD ولا يكون في المستقبل.", "Use YYYY-MM-DD, and choose today or a past date."));
      return;
    }
    setDateError("");
    setSelectedDate(next);
    setCustomDate("");
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[allNotesStyles.root, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}>
        <LinearGradient colors={["#FFE4EC", colors.background]} style={StyleSheet.absoluteFill} />
        <View style={[allNotesStyles.topBar, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable style={allNotesStyles.closeBtn} onPress={onClose} hitSlop={10}>
            <Icon name="arrow-left" size={22} color="#6B3C4C" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[allNotesStyles.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
              {l("كل الملاحظات", "All notes")}
            </Text>
            <Text style={[allNotesStyles.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
              {l("اختاري تاريخاً لرؤية ملاحظاتك.", "Choose a date to view your notes.")}
            </Text>
          </View>
        </View>

        <View style={[allNotesStyles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={l("ابحثي في كل الملاحظات...", "Search all notes...")}
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            style={[allNotesStyles.searchInput, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
          />
          {!!searchQuery && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={10} style={allNotesStyles.searchClear}>
              <Icon name="close" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {false && <View style={[allNotesStyles.jumpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[allNotesStyles.jumpLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {l("افتحي أي يوم سابق", "Open any past day")}
          </Text>
          <View style={[allNotesStyles.jumpRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TextInput
              value={customDate}
              onChangeText={setCustomDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={[allNotesStyles.jumpInput, { color: colors.foreground, borderColor: colors.border, textAlign: isRTL ? "right" : "left" }]}
            />
            <Pressable style={[allNotesStyles.jumpBtn, { backgroundColor: colors.primary }]} onPress={handleOpenCustomDate}>
              <Text style={allNotesStyles.jumpBtnText}>{l("افتحي", "Open")}</Text>
            </Pressable>
          </View>
          {!!dateError && (
            <Text style={[allNotesStyles.errorText, { textAlign: isRTL ? "right" : "left" }]}>{dateError}</Text>
          )}
        </View>}

        {!normalizedSearch && <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={allNotesStyles.dateScroll}
          contentContainerStyle={[allNotesStyles.dateRail, { flexDirection: isRTL ? "row-reverse" : "row" }]}
        >
          {dateOptions.map((dateKey) => {
            const isSelected = dateKey === selectedDate;
            const count = notesByDate[dateKey]?.length ?? 0;
            return (
              <Pressable
                key={dateKey}
                style={[
                  allNotesStyles.dateChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedDate(dateKey)}
              >
                <Text style={[allNotesStyles.dateChipText, { color: isSelected ? "#fff" : colors.foreground }]}>
                  {formatCompactDate(dateKey, isRTL)}
                </Text>
                <Text style={[allNotesStyles.dateChipSub, { color: isSelected ? "#fff" : colors.mutedForeground }]}>
                  {count} {l("ملاحظة", count === 1 ? "note" : "notes")}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
          {false && <View style={[allNotesStyles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[allNotesStyles.dayHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[allNotesStyles.dayTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                  {formatDisplayDate(selectedDate, isRTL)}
                </Text>
                <Text style={[allNotesStyles.daySub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                  {selectedEntry ? l("مزاج محفوظ لهذا اليوم", "Mood saved for this day") : l("أضيفي مزاج اليوم إذا أردتِ", "Add this day's mood if you want")}
                </Text>
              </View>
              <Pressable style={[allNotesStyles.addNoteBtn, { backgroundColor: colors.primary + "18" }]} onPress={() => onAddNote(selectedDate)}>
                <Icon name="plus" size={15} color={colors.primary} />
                <Text style={[allNotesStyles.addNoteText, { color: colors.primary }]}>{t.diary.addNote}</Text>
              </Pressable>
            </View>

            <Text style={[todayStyles.sectionLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
              {t.diary.moodLabel}
            </Text>
            <MoodPicker selected={selectedMood} onSelect={setSelectedMood} />
            <TextInput
              style={[todayStyles.input, {
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                textAlign: isRTL ? "right" : "left",
              }]}
              placeholder={t.diary.notePlaceholder}
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              value={memoryText}
              onChangeText={setMemoryText}
            />
            <Text style={[todayStyles.sectionLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left", marginBottom: 10 }]}>
              {t.diary.colorPicker}
            </Text>
            <ColorPicker selected={cardColor} onSelect={setCardColor} />
            <View style={[allNotesStyles.memoryActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              {!!selectedEntry && (
                <Pressable style={[allNotesStyles.deleteMemoryBtn, { borderColor: colors.border }]} onPress={() => onDeleteEntry(selectedDate)}>
                  <Icon name="trash-can-outline" size={15} color="#E05" />
                </Pressable>
              )}
              <Pressable
                style={[allNotesStyles.saveMemoryBtn, { backgroundColor: selectedMood ? colors.primary : colors.border }]}
                onPress={handleSaveEntry}
                disabled={!selectedMood}
              >
                <Icon name="check-circle-outline" size={18} color={selectedMood ? "#fff" : colors.mutedForeground} />
                <Text style={[allNotesStyles.saveMemoryText, { color: selectedMood ? "#fff" : colors.mutedForeground }]}>
                  {t.diary.saveEntry}
                </Text>
              </Pressable>
            </View>
          </View>}

          <View style={allNotesStyles.notesList}>
            <Text style={[allNotesStyles.notesListTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
              {normalizedSearch
                ? l("نتائج البحث", "Search results")
                : selectedDate ? formatDisplayDate(selectedDate, isRTL) : l("لا توجد ملاحظات", "No notes yet")}
            </Text>
            {displayedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => onEditNote(note)}
                onDelete={() => onDeleteNote(note.id)}
              />
            ))}
            {(normalizedSearch ? displayedNotes.length === 0 : dateOptions.length === 0) && (
              <View style={[allNotesStyles.emptyDay, { borderColor: colors.border }]}>
                <Icon name="notebook-outline" size={22} color={colors.primary} />
                <Text style={[allNotesStyles.emptyDayText, { color: colors.mutedForeground }]}>
                  {normalizedSearch ? l("لا توجد نتائج لهذا البحث.", "No matching notes.") : l("لا توجد ملاحظات بعد.", "No notes yet.")}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const allNotesStyles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  closeBtn: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.72)", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24, lineHeight: 30 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, marginTop: 2 },
  searchWrap: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    height: 44,
    paddingVertical: 0,
  },
  searchClear: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  jumpCard: { borderRadius: 20, borderWidth: 1, marginHorizontal: 16, marginTop: 4, padding: 12 },
  jumpLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 8 },
  jumpRow: { alignItems: "center", gap: 8 },
  jumpInput: { borderRadius: 14, borderWidth: 1, flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, paddingHorizontal: 12, paddingVertical: 10 },
  jumpBtn: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 11 },
  jumpBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  errorText: { color: "#C2185B", fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 8 },
  dateScroll: { flexGrow: 0, maxHeight: 58 },
  dateRail: { alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  dateChip: { borderRadius: 16, borderWidth: 1, minWidth: 76, paddingHorizontal: 10, paddingVertical: 7 },
  dateChipText: { fontFamily: "Inter_700Bold", fontSize: 12, lineHeight: 15 },
  dateChipSub: { fontFamily: "Inter_500Medium", fontSize: 10, lineHeight: 13, marginTop: 1 },
  dayCard: { borderRadius: 24, borderWidth: 1, marginHorizontal: 16, padding: 16 },
  dayHeader: { alignItems: "center", gap: 12, marginBottom: 14 },
  dayTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  daySub: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, marginTop: 2 },
  addNoteBtn: { alignItems: "center", borderRadius: 18, flexDirection: "row", gap: 5, paddingHorizontal: 11, paddingVertical: 8 },
  addNoteText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  memoryActions: { alignItems: "center", gap: 10 },
  deleteMemoryBtn: { alignItems: "center", borderRadius: 14, borderWidth: 1, height: 46, justifyContent: "center", width: 46 },
  saveMemoryBtn: { alignItems: "center", borderRadius: 14, flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", padding: 14 },
  saveMemoryText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  notesList: { marginHorizontal: 16, marginTop: 18 },
  notesListTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, marginBottom: 10 },
  emptyDay: { alignItems: "center", borderRadius: 20, borderStyle: "dashed", borderWidth: 1, gap: 8, padding: 22 },
  emptyDayText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, textAlign: "center" },
});

function NotesSection({
  requestedNoteDate,
  onRequestedNoteDateHandled,
}: {
  requestedNoteDate: string | null;
  onRequestedNoteDateHandled: () => void;
}) {
  const colors = useColors();
  const { t, isRTL, l } = useLanguage();
  const { data, saveDiaryEntry, deleteDiaryEntry, saveNote, deleteNote, updateNote } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [allNotesVisible, setAllNotesVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<DiaryNote | null>(null);
  const [draftDate, setDraftDate] = useState(todayKey());
  const todayK = todayKey();

  const allNotes = [...(data.diaryNotes ?? [])].sort((a, b) => b.createdAt - a.createdAt);
  const todayNotes = allNotes.filter((n) => n.date === todayK);

  const openNew = (dateKey = todayK) => {
    setDraftDate(dateKey);
    setEditingNote(null);
    setAllNotesVisible(false);
    setModalVisible(true);
  };

  const openEdit = (note: DiaryNote) => {
    setDraftDate(note.date);
    setEditingNote(note);
    setAllNotesVisible(false);
    setModalVisible(true);
  };

  useEffect(() => {
    if (!requestedNoteDate) return;
    openNew(requestedNoteDate);
    onRequestedNoteDateHandled();
  }, [requestedNoteDate]);

  const handleSave = async (text: string, color: string, richContent: RichBlock[], title?: string) => {
    if (editingNote) {
      await updateNote(editingNote.id, text, color, richContent, title);
    } else {
      await saveNote({
        id: `${draftDate}-${Date.now()}`,
        date: draftDate,
        text,
        richContent,
        color,
        title,
        createdAt: Date.now(),
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
    setEditingNote(null);
    setDraftDate(todayK);
  };

  const handleClose = () => {
    setModalVisible(false);
    setEditingNote(null);
    setDraftDate(todayK);
  };

  const handleDelete = (noteId: string) => {
    if (Platform.OS === "web") { deleteNote(noteId); return; }
    Alert.alert(t.diary.deleteConfirm, "", [
      { text: t.diary.cancel, style: "cancel" },
      { text: t.diary.deleteEntry, style: "destructive", onPress: () => deleteNote(noteId) },
    ]);
  };

  const handleSaveEntry = async (entry: DiaryEntry) => {
    await saveDiaryEntry(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteEntry = (dateKey: string) => {
    if (Platform.OS === "web") {
      deleteDiaryEntry(dateKey);
      return;
    }
    Alert.alert(t.diary.deleteConfirm, "", [
      { text: t.diary.cancel, style: "cancel" },
      { text: t.diary.deleteEntry, style: "destructive", onPress: () => deleteDiaryEntry(dateKey) },
    ]);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <NoteEditorModal
        visible={modalVisible}
        initialNote={editingNote}
        onSave={handleSave}
        onClose={handleClose}
      />
      <AllNotesModal
        visible={allNotesVisible}
        notes={allNotes}
        onClose={() => setAllNotesVisible(false)}
        onDeleteNote={handleDelete}
        onEditNote={openEdit}
      />

      <View style={[notesSectionStyles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={[notesSectionStyles.title, { color: colors.foreground }]}>
          {t.diary.notesTitle}
        </Text>
        <Pressable
          style={[notesSectionStyles.addBtn, { backgroundColor: colors.primary + "18" }]}
          onPress={() => openNew()}
        >
          <Icon name="plus" size={15} color={colors.primary} />
          <Text style={[notesSectionStyles.addBtnText, { color: colors.primary }]}>
            {t.diary.addNote}
          </Text>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: 16 }}>
        <Pressable
          style={[notesSectionStyles.viewAllBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setAllNotesVisible(true)}
        >
          <View style={[notesSectionStyles.viewAllIcon, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="notebook-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[notesSectionStyles.viewAllTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
              {l("عرض كل الملاحظات", "View all notes")}
            </Text>
            <Text style={[notesSectionStyles.viewAllSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
              {l("شاهدي ملاحظاتك حسب التاريخ.", "See your notes by date.")}
            </Text>
          </View>
          <Icon name="arrow-right" size={18} color={colors.primary} />
        </Pressable>

        {todayNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPress={() => openEdit(note)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}

        {todayNotes.length === 0 && (
          <Pressable style={notesSectionStyles.emptyRow} onPress={() => openNew()}>
            <Text style={[notesSectionStyles.emptyText, { color: colors.mutedForeground }]}>
              {l("لا توجد ملاحظات لليوم. أضيفي واحدة أو افتحي كل الملاحظات.", "No notes for today. Add one or open all notes.")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const notesSectionStyles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 14,
  },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  viewAllBtn: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    padding: 14,
  },
  viewAllIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  viewAllTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  viewAllSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 2 },
  pastDateLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 5, marginTop: 10 },
  emptyRow: { alignItems: "center", paddingVertical: 16 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function DiaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { data } = useApp();
  const [selectedEntryDate, setSelectedEntryDate] = useState<string | null>(null);
  const [requestedNoteDate, setRequestedNoteDate] = useState<string | null>(null);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const entries = data.diaryEntries ?? {};
  const todayK = todayKey();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 120 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {t.diary.screenTitle}
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {t.diary.screenSubtitle}
        </Text>
      </LinearGradient>

      <SwipeableWeekStrip
        entries={entries}
        onPastDayPress={setSelectedEntryDate}
      />

      <PastDayEntryModal
        dateKey={selectedEntryDate}
        visible={!!selectedEntryDate}
        onAddNote={setRequestedNoteDate}
        onClose={() => setSelectedEntryDate(null)}
      />

      <TodayCard />

      <NotesSection
        requestedNoteDate={requestedNoteDate}
        onRequestedNoteDateHandled={() => setRequestedNoteDate(null)}
      />

      {Object.keys(entries).length === 0 && !entries[todayK] && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.diary.noEntries}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginHorizontal: 16, marginBottom: 12 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
