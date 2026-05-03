import { AppMaterialCommunityIcons as Icon } from "@/components/Icons";
import { DiaryEntry, DiaryNote, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Alert,
  Animated,
  Dimensions,
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

function AddNoteForm({
  onSave,
  onCancel,
}: {
  onSave: (text: string, color: string) => void;
  onCancel: () => void;
}) {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const [text, setText] = useState("");
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const canSave = text.trim().length > 0;

  return (
    <View style={[addNoteStyles.wrapper, { backgroundColor: noteColor }]}>
      <TextInput
        style={[addNoteStyles.input, { color: "#333", textAlign: isRTL ? "right" : "left" }]}
        placeholder={t.diary.noteHint}
        placeholderTextColor="#aaa"
        multiline
        value={text}
        onChangeText={setText}
        autoFocus
        textAlignVertical="top"
      />
      <View style={addNoteStyles.colorStrip}>
        {NOTE_COLORS.map((c) => (
          <Pressable
            key={c}
            style={[
              addNoteStyles.swatch,
              {
                backgroundColor: c,
                borderWidth: noteColor === c ? 3 : 1.5,
                borderColor: noteColor === c ? "#333" : "#ddd",
                transform: [{ scale: noteColor === c ? 1.15 : 1 }],
              },
            ]}
            onPress={() => { Haptics.selectionAsync(); setNoteColor(c); }}
          />
        ))}
      </View>
      <View style={[addNoteStyles.btnRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Pressable
          style={[addNoteStyles.cancelBtn, { borderColor: "#ccc" }]}
          onPress={onCancel}
        >
          <Text style={[addNoteStyles.cancelText, { color: "#888" }]}>{t.diary.cancel}</Text>
        </Pressable>
        <Pressable
          style={[addNoteStyles.saveBtn, { backgroundColor: canSave ? "#333" : "#ccc", flex: 1 }]}
          onPress={() => canSave && onSave(text.trim(), noteColor)}
          disabled={!canSave}
        >
          <Icon name="check-circle-outline" size={16} color={canSave ? "#fff" : "#888"} />
          <Text style={[addNoteStyles.saveText, { color: canSave ? "#fff" : "#888" }]}>
            {t.diary.saveEntry}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const addNoteStyles = StyleSheet.create({
  wrapper: { borderRadius: 18, padding: 16, marginBottom: 12 },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    minHeight: 100,
    marginBottom: 14,
  },
  colorStrip: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  btnRow: { gap: 10 },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

function NoteCard({ note, onDelete }: { note: DiaryNote; onDelete: () => void }) {
  const { isRTL } = useLanguage();
  return (
    <View style={[noteCardStyles.card, { backgroundColor: note.color }]}>
      <Pressable style={noteCardStyles.closeBtn} onPress={onDelete} hitSlop={8}>
        <Icon name="close" size={14} color="#666" />
      </Pressable>
      <Text style={[noteCardStyles.text, { textAlign: isRTL ? "right" : "left" }]}>
        {note.text}
      </Text>
    </View>
  );
}

const noteCardStyles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 10, position: "relative" },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  text: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, paddingRight: 28 },
});

function NotesSection() {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const { data, saveNote, deleteNote } = useApp();
  const [adding, setAdding] = useState(false);
  const todayK = todayKey();

  const allNotes = (data.diaryNotes ?? []).sort((a, b) => b.createdAt - a.createdAt);
  const todayNotes = allNotes.filter((n) => n.date === todayK);
  const pastNotes = allNotes.filter((n) => n.date !== todayK);

  const handleSave = async (text: string, color: string) => {
    const note: DiaryNote = {
      id: `${todayK}-${Date.now()}`,
      date: todayK,
      text,
      color,
      createdAt: Date.now(),
    };
    await saveNote(note);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdding(false);
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
      <View style={[notesSectionStyles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={[notesSectionStyles.title, { color: colors.foreground }]}>
          {t.diary.notesTitle}
        </Text>
        {!adding && (
          <Pressable
            style={[notesSectionStyles.addBtn, { backgroundColor: colors.primary + "18" }]}
            onPress={() => setAdding(true)}
          >
            <Icon name="plus" size={15} color={colors.primary} />
            <Text style={[notesSectionStyles.addBtnText, { color: colors.primary }]}>
              {t.diary.addNote}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ marginHorizontal: 16 }}>
        {adding && (
          <AddNoteForm onSave={handleSave} onCancel={() => setAdding(false)} />
        )}

        {todayNotes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={() => handleDelete(note.id)} />
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
                <NoteCard note={note} onDelete={() => handleDelete(note.id)} />
              </View>
            ))}
          </View>
        )}

        {!adding && todayNotes.length === 0 && pastNotes.length === 0 && (
          <View style={notesSectionStyles.emptyRow}>
            <Text style={[notesSectionStyles.emptyText, { color: colors.mutedForeground }]}>
              {t.diary.noNotes}
            </Text>
          </View>
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
