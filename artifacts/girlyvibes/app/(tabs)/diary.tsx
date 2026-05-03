import { AppMaterialCommunityIcons as Icon } from "@/components/Icons";
import { DiaryEntry, DiaryNote, RichBlock, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
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

function SwipeableWeekStrip({ entries }: { entries: { [k: string]: DiaryEntry } }) {
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
                const dayLabel = t.diary.weekDays[day.date.getDay()];
                return (
                  <View key={day.key} style={swipeStyles.dayCol}>
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
                  </View>
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
};

const RICH_TEXT_COLORS = [
  "#222222", "#E01060", "#FF6B00", "#D4A000",
  "#2E7D32", "#0277BD", "#6A1B9A", "#C2185B",
  "#00695C", "#546E7A",
];

let _bc = 0;
function makeBlock(o?: Partial<RichBlock>): RichBlock {
  return { id: `b${Date.now()}${++_bc}`, text: "", type: "body", bold: false, italic: false, underline: false, color: "#222222", fontStyle: "sans", ...o };
}

function blockFontFamily(block: RichBlock): string {
  if (block.fontStyle === "serif") return Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }) ?? "serif";
  if (block.fontStyle === "mono")  return Platform.select({ ios: "Courier New", android: "monospace", default: "Courier New, monospace" }) ?? "monospace";
  const heading = block.type === "h1" || block.type === "h2";
  if (block.bold || heading) return "Inter_700Bold";
  if (block.type === "h3") return "Inter_600SemiBold";
  return "Inter_400Regular";
}

// ─── Emoji helpers ─────────────────────────────────────────────────────────────

function containsEmoji(text: string): boolean {
  try {
    return /\p{Extended_Pictographic}/u.test(text);
  } catch {
    return /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/u.test(text);
  }
}

const EMOJI_SLIDER_TRACK = 160;
const EMOJI_SCALE_MIN = 1.0;
const EMOJI_SCALE_MAX = 3.0;

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
      <Text style={{ fontSize: Math.round(13 + 22 * pct) }}>😊</Text>
      <Text style={tbStyles.emojiScaleLabel}>{value.toFixed(1)}×</Text>
    </View>
  );
}

// ─ Single block text input ────────────────────────────────────────────────────

function RichBlockInput({
  block, isActive, onChangeText, onFocus, onEnter, onBackspaceEmpty, inputRef,
}: {
  block: RichBlock; isActive: boolean;
  onChangeText: (id: string, t: string) => void;
  onFocus: (id: string) => void;
  onEnter: (id: string, after: string) => void;
  onBackspaceEmpty: (id: string) => void;
  inputRef: (r: TextInput | null) => void;
}) {
  const sz = BLOCK_SIZES[block.type];
  return (
    <TextInput
      ref={inputRef}
      style={{
        fontSize: sz.fontSize,
        lineHeight: sz.lineHeight,
        fontFamily: blockFontFamily(block),
        fontStyle: block.italic ? "italic" : "normal",
        textDecorationLine: block.underline ? "underline" : "none",
        color: block.color,
        paddingHorizontal: 20,
        paddingVertical: 6,
        minHeight: sz.lineHeight + 12,
        opacity: isActive ? 1 : 0.8,
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
  );
}

// ─ Formatting toolbar ─────────────────────────────────────────────────────────

function FormattingToolbar({
  activeBlock, onUpdateBlock, noteColor, onNoteColorChange, onRefocus, hasEmoji, emojiScale, onEmojiScale,
}: {
  activeBlock: RichBlock | null;
  onUpdateBlock: (u: Partial<RichBlock>) => void;
  noteColor: string;
  onNoteColorChange: (c: string) => void;
  onRefocus: () => void;
  hasEmoji: boolean;
  emojiScale: number;
  onEmojiScale: (s: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const b = activeBlock;
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

  return (
    <View style={[tbStyles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Emoji size slider — shows when block contains emoji */}
      {hasEmoji && (
        <EmojiSizeSlider
          value={emojiScale}
          onChange={(s) => onEmojiScale(s)}
          onRelease={onRefocus}
        />
      )}

      {/* Row 1 — type + inline + font */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={tbStyles.row}>
        {(["h1","h2","h3","body","small"] as const).map(tp => (
          <Btn key={tp} label={tp === "body" ? "¶" : tp === "small" ? "sm" : tp.toUpperCase()} active={b.type === tp} onPress={() => onUpdateBlock({ type: tp })} />
        ))}
        <View style={tbStyles.sep} />
        <Btn label="B" active={b.bold}      onPress={() => onUpdateBlock({ bold: !b.bold })}           extraTextStyle={{ fontFamily: "Inter_700Bold" }} />
        <Btn label="I" active={b.italic}    onPress={() => onUpdateBlock({ italic: !b.italic })}       extraTextStyle={{ fontStyle: "italic" }} />
        <Btn label="U" active={b.underline} onPress={() => onUpdateBlock({ underline: !b.underline })} extraTextStyle={{ textDecorationLine: "underline" }} />
        <View style={tbStyles.sep} />
        <Btn label="Aa" active={b.fontStyle === "sans"} onPress={() => onUpdateBlock({ fontStyle: "sans" })} />
        <Btn
          label="Tf"
          active={b.fontStyle === "serif"}
          onPress={() => onUpdateBlock({ fontStyle: "serif" })}
          extraTextStyle={{ fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }) ?? "serif" }}
        />
        <Btn
          label="{}"
          active={b.fontStyle === "mono"}
          onPress={() => onUpdateBlock({ fontStyle: "mono" })}
          extraTextStyle={{ fontFamily: Platform.select({ ios: "Courier New", android: "monospace", default: "Courier New, monospace" }) ?? "monospace" }}
        />
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
  container: { backgroundColor: "rgba(255,255,255,0.92)", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 46, gap: 2 },
  colorRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 44, gap: 8 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 34, alignItems: "center", justifyContent: "center" },
  btnOn: { backgroundColor: "rgba(0,0,0,0.12)" },
  btnTxt: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#666" },
  btnTxtOn: { color: "#111" },
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
  emojiScaleLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#888", minWidth: 30 },
});

// ─ Modal ─────────────────────────────────────────────────────────────────────

function NoteEditorModal({
  visible, initialNote, onSave, onClose,
}: {
  visible: boolean;
  initialNote: DiaryNote | null;
  onSave: (text: string, color: string, richContent: RichBlock[]) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const [blocks, setBlocks] = useState<RichBlock[]>(() => [makeBlock()]);
  const [activeId, setActiveId] = useState("");
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const blockRefs = useRef<{ [id: string]: TextInput | null }>({});

  useEffect(() => {
    if (!visible) return;
    setNoteColor(initialNote?.color ?? NOTE_COLORS[0]);
    if (initialNote?.richContent?.length) {
      setBlocks(initialNote.richContent);
      setActiveId(initialNote.richContent[0].id);
    } else {
      const lines = (initialNote?.text ?? "").split("\n").filter(Boolean);
      const nb = lines.length ? lines.map((l) => makeBlock({ text: l })) : [makeBlock()];
      setBlocks(nb);
      setActiveId(nb[0].id);
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
  const hasContent = blocks.some((b) => b.text.trim());
  const hasEmojiInBlock = containsEmoji(activeBlock?.text ?? "");
  const emojiScale = activeBlock?.emojiScale ?? 1.0;

  const updateBlock = (id: string, updates: Partial<RichBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

  const handleChangeText = (id: string, text: string) => updateBlock(id, { text });

  const handleEnter = (id: string, after: string) => {
    const src = blocks.find((b) => b.id === id);
    const nb = makeBlock({
      type: src?.type === "h1" || src?.type === "h2" ? "body" : src?.type,
      color: src?.color,
      fontStyle: src?.fontStyle,
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
    const text = blocks.map((b) => b.text).join("\n");
    onSave(text, noteColor, blocks);
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[editorStyles.root, { backgroundColor: noteColor }]}>
        {/* Top bar */}
        <View style={[editorStyles.topBar, { paddingTop: insets.top + 12, flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable style={editorStyles.topBtn} onPress={onClose} hitSlop={10}>
            <Icon name="arrow-left" size={22} color="#333" />
          </Pressable>
          <Text style={editorStyles.topTitle}>
            {initialNote ? t.diary.editEntry : t.diary.addNote}
          </Text>
          <Pressable
            style={[editorStyles.saveBtn, { backgroundColor: hasContent ? "#33333322" : "#33333308" }]}
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
            {blocks.map((block) => (
              <RichBlockInput
                key={block.id}
                block={block}
                isActive={block.id === activeId}
                onChangeText={handleChangeText}
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
          />
        </KeyboardAvoidingView>
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
          <Text key={i} style={{ fontSize: Math.min(baseFontSize * emojiScale, 72) }}>{s.t}</Text>
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
  const { isRTL } = useLanguage();
  const rich = note.richContent;
  return (
    <Pressable style={[noteCardStyles.card, { backgroundColor: note.color }]} onPress={onPress}>
      <Pressable style={noteCardStyles.closeBtn} onPress={onDelete} hitSlop={10}>
        <Icon name="close" size={14} color="#555" />
      </Pressable>

      {rich && rich.length > 0 ? (
        <View style={{ paddingRight: 32 }}>
          {rich.slice(0, 5).map((block, i) => {
            const sz = BLOCK_SIZES[block.type];
            const previewSize = Math.min(sz.fontSize, 17);
            const blockStyle = {
              fontSize: previewSize,
              lineHeight: previewSize * 1.5,
              fontFamily: blockFontFamily(block),
              fontStyle: block.italic ? "italic" : "normal" as const,
              textDecorationLine: block.underline ? "underline" : "none" as const,
              color: block.color,
              textAlign: isRTL ? "right" : "left" as const,
            };
            const scale = block.emojiScale ?? 1;
            const nLines = i === 0 && block.type !== "body" ? 1 : 2;
            return scale > 1 && containsEmoji(block.text) ? (
              <EmojiText key={block.id} text={block.text} style={blockStyle} emojiScale={scale} numberOfLines={nLines} />
            ) : (
              <Text key={block.id} numberOfLines={nLines} style={blockStyle}>{block.text}</Text>
            );
          })}
        </View>
      ) : (
        <Text style={[noteCardStyles.text, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={4}>
          {note.text}
        </Text>
      )}

      <View style={noteCardStyles.editHint}>
        <Icon name="pencil" size={11} color="#888" />
      </View>
    </Pressable>
  );
}

const noteCardStyles = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, marginBottom: 10, position: "relative" },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  text: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, paddingRight: 30 },
  editHint: { marginTop: 8, alignItems: "flex-end" },
});

// ─── Notes section ────────────────────────────────────────────────────────────

function NotesSection() {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const { data, saveNote, deleteNote, updateNote } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<DiaryNote | null>(null);
  const todayK = todayKey();

  const allNotes = (data.diaryNotes ?? []).sort((a, b) => b.createdAt - a.createdAt);
  const todayNotes = allNotes.filter((n) => n.date === todayK);
  const pastNotes = allNotes.filter((n) => n.date !== todayK);

  const openNew = () => {
    setEditingNote(null);
    setModalVisible(true);
  };

  const openEdit = (note: DiaryNote) => {
    setEditingNote(note);
    setModalVisible(true);
  };

  const handleSave = async (text: string, color: string, richContent: RichBlock[]) => {
    if (editingNote) {
      await updateNote(editingNote.id, text, color, richContent);
    } else {
      await saveNote({
        id: `${todayK}-${Date.now()}`,
        date: todayK,
        text,
        richContent,
        color,
        createdAt: Date.now(),
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
    setEditingNote(null);
  };

  const handleClose = () => {
    setModalVisible(false);
    setEditingNote(null);
  };

  const handleDelete = (noteId: string) => {
    if (Platform.OS === "web") { deleteNote(noteId); return; }
    Alert.alert(t.diary.deleteConfirm, "", [
      { text: t.diary.cancel, style: "cancel" },
      { text: t.diary.deleteEntry, style: "destructive", onPress: () => deleteNote(noteId) },
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

      <View style={[notesSectionStyles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={[notesSectionStyles.title, { color: colors.foreground }]}>
          {t.diary.notesTitle}
        </Text>
        <Pressable
          style={[notesSectionStyles.addBtn, { backgroundColor: colors.primary + "18" }]}
          onPress={openNew}
        >
          <Icon name="plus" size={15} color={colors.primary} />
          <Text style={[notesSectionStyles.addBtnText, { color: colors.primary }]}>
            {t.diary.addNote}
          </Text>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: 16 }}>
        {todayNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPress={() => openEdit(note)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}

        {pastNotes.length > 0 && (
          <View>
            {pastNotes.map((note) => (
              <View key={note.id}>
                <Text
                  style={[
                    notesSectionStyles.pastDateLabel,
                    { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {formatDisplayDate(note.date, isRTL)}
                </Text>
                <NoteCard
                  note={note}
                  onPress={() => openEdit(note)}
                  onDelete={() => handleDelete(note.id)}
                />
              </View>
            ))}
          </View>
        )}

        {todayNotes.length === 0 && pastNotes.length === 0 && (
          <Pressable style={notesSectionStyles.emptyRow} onPress={openNew}>
            <Text style={[notesSectionStyles.emptyText, { color: colors.mutedForeground }]}>
              {t.diary.noNotes}
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
  pastDateLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 5, marginTop: 10 },
  emptyRow: { alignItems: "center", paddingVertical: 16 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function DiaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const { data, deleteDiaryEntry } = useApp();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const entries = data.diaryEntries ?? {};
  const todayK = todayKey();

  const pastEntries = Object.values(entries)
    .filter((e) => e.id !== todayK)
    .sort((a, b) => (a.id < b.id ? 1 : -1));

  const handleDeletePast = (dateKey: string) => {
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

      <SwipeableWeekStrip entries={entries} />

      <TodayCard />

      <NotesSection />

      {pastEntries.length > 0 && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {t.diary.pastEntries}
          </Text>
          {pastEntries.map((entry) => (
            <PastEntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDeletePast(entry.id)}
            />
          ))}
        </View>
      )}

      {pastEntries.length === 0 && !entries[todayK] && (
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
