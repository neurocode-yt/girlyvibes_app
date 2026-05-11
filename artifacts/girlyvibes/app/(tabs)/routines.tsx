import { FloatingEmojis } from "@/components/FloatingEmojis";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTINE_TEMPLATES, type RoutineStep, type RoutineTemplate } from "@/data/routines";
import { useColors } from "@/hooks/useColors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_ROUTINES = 20;
const ROUTINE_COLORS = ["#FFE4EC", "#FFE8CC", "#FFF4CC", "#DDF7E8", "#DDEEFF", "#EFE1FF", "#FFE2F5", "#E1F7F3"];
const ROUTINE_ICONS: RoutineTemplate["emoji"][] = [
  "star-four-points",
  "heart-outline",
  "flower",
  "weather-sunny",
  "weather-night",
  "notebook-outline",
  "check-circle-outline",
  "shower-head",
  "school",
  "coffee-outline",
  "spa-outline",
  "dumbbell",
];

type EditableStep = Pick<RoutineStep, "id" | "title" | "titleEn" | "subtitle" | "subtitleEn" | "icon">;

function textForEdit(ar: string, en: string) {
  return en || ar || "";
}

function makeStep(text = "", index = 0): EditableStep {
  return {
    id: `step-${Date.now()}-${index}`,
    title: text,
    titleEn: text,
    subtitle: "",
    subtitleEn: "",
    icon: "checkbox-marked-circle-outline",
  };
}

function mergeRoutineTemplates(saved: RoutineTemplate[]) {
  const savedById = new Map(saved.map((routine) => [routine.id, routine]));
  const templateIds = new Set(ROUTINE_TEMPLATES.map((routine) => routine.id));
  return [
    ...ROUTINE_TEMPLATES.map((routine) => savedById.get(routine.id) ?? routine),
    ...saved.filter((routine) => !templateIds.has(routine.id)),
  ];
}

function RoutineEditorModal({
  canDelete,
  initialRoutine,
  onClose,
  onDelete,
  onSave,
  routineCount,
  visible,
}: {
  canDelete: boolean;
  initialRoutine: RoutineTemplate | null;
  onClose: () => void;
  onDelete: () => void;
  onSave: (routine: RoutineTemplate) => void;
  routineCount: number;
  visible: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { l } = useLanguage();
  const isEditing = !!initialRoutine;
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(ROUTINE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<RoutineTemplate["emoji"]>("star-four-points");
  const [steps, setSteps] = useState<EditableStep[]>([makeStep()]);

  React.useEffect(() => {
    if (!visible) return;
    if (initialRoutine) {
      setTitle(textForEdit(initialRoutine.title, initialRoutine.titleEn));
      setSubtitle(textForEdit(initialRoutine.subtitle, initialRoutine.subtitleEn));
      setSelectedColor(initialRoutine.color);
      setSelectedIcon(initialRoutine.emoji);
      setSteps(initialRoutine.steps.map((step) => ({ ...step })));
      return;
    }
    setTitle("");
    setSubtitle("");
    setSelectedColor(ROUTINE_COLORS[0]);
    setSelectedIcon("star-four-points");
    setSteps([makeStep()]);
  }, [initialRoutine?.id, visible]);

  const cleanSteps = steps
    .map((step) => ({
      ...step,
      title: step.title.trim(),
      titleEn: step.titleEn.trim(),
      subtitle: step.subtitle?.trim(),
      subtitleEn: step.subtitleEn?.trim(),
    }))
    .filter((step) => step.title || step.titleEn);
  const canSave = !!title.trim() && cleanSteps.length > 0 && (isEditing || routineCount < MAX_ROUTINES);

  const updateStep = (id: string, text: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, title: text, titleEn: text } : step,
      ),
    );
  };

  const addStep = () => {
    setSteps((prev) => [...prev, makeStep("", prev.length)]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((step) => step.id !== id)));
  };

  const handleSave = () => {
    if (!canSave) return;
    const now = Date.now();
    onSave({
      id: initialRoutine?.id ?? `custom-${now}`,
      title: title.trim(),
      titleEn: title.trim(),
      subtitle: subtitle.trim() || l("روتين مخصص", "Custom routine"),
      subtitleEn: subtitle.trim() || "Custom routine",
      color: selectedColor,
      emoji: selectedIcon,
      steps: cleanSteps.map((step, index) => ({
        ...step,
        id: step.id || `step-${now}-${index}`,
        title: step.title || step.titleEn,
        titleEn: step.titleEn || step.title,
        icon: step.icon || "checkbox-marked-circle-outline",
      })),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.editorRoot, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}
      >
        <LinearGradient colors={["#FFE6EE", colors.background]} style={StyleSheet.absoluteFill} />
        <View style={styles.editorTop}>
          <Pressable style={styles.roundIconBtn} onPress={onClose} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#7A3D52" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.editorTitle, { color: colors.foreground }]}>
              {isEditing ? l("تعديل الروتين", "Edit routine") : l("روتين جديد", "New routine")}
            </Text>
            <Text style={[styles.editorSub, { color: colors.mutedForeground }]}>
              {l("اكتبي خياراتك وسنحوّلها إلى قائمة إنجاز.", "Add options and they become a checklist.")}
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
          <View style={styles.editorPanel}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={l("اسم الروتين", "Routine name")}
              placeholderTextColor="#9B7683"
              style={styles.editorInput}
            />
            <TextInput
              value={subtitle}
              onChangeText={setSubtitle}
              placeholder={l("وصف قصير", "Short description")}
              placeholderTextColor="#9B7683"
              style={[styles.editorInput, styles.editorInputSmall]}
            />

            <Text style={styles.editorLabel}>{l("اللون", "Color")}</Text>
            <View style={styles.paletteRow}>
              {ROUTINE_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color, borderColor: selectedColor === color ? "#7A3D52" : "rgba(122,61,82,0.12)" },
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <Text style={styles.editorLabel}>{l("الرمز", "Icon")}</Text>
            <View style={styles.iconPicker}>
              {ROUTINE_ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconChoice,
                    {
                      backgroundColor: selectedIcon === icon ? selectedColor : "rgba(255,255,255,0.7)",
                      borderColor: selectedIcon === icon ? "#7A3D52" : "rgba(122,61,82,0.12)",
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <MaterialCommunityIcons name={icon} size={20} color="#7A3D52" />
                </Pressable>
              ))}
            </View>

            <View style={styles.stepsHeader}>
              <Text style={styles.editorLabel}>{l("خيارات القائمة", "Checklist options")}</Text>
              <Text style={styles.stepCount}>{cleanSteps.length}</Text>
            </View>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.stepEditorRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <TextInput
                  value={step.titleEn || step.title}
                  onChangeText={(text) => updateStep(step.id, text)}
                  placeholder={l("خيار جديد", "New option")}
                  placeholderTextColor="#A3828E"
                  style={styles.stepInput}
                />
                <Pressable style={styles.removeStepBtn} onPress={() => removeStep(step.id)}>
                  <MaterialCommunityIcons name="close" size={16} color="#9B315A" />
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.addStepBtn} onPress={addStep}>
              <MaterialCommunityIcons name="plus" size={18} color="#9B315A" />
              <Text style={styles.addStepText}>{l("إضافة خيار", "Add option")}</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={[styles.editorFooter, { paddingBottom: insets.bottom + 10 }]}>
          {canDelete && (
            <Pressable style={styles.deleteRoutineBtn} onPress={onDelete}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#C2185B" />
            </Pressable>
          )}
          <Pressable
            style={[styles.saveRoutineBtn, { backgroundColor: canSave ? "#B55B72" : "rgba(181,91,114,0.18)" }]}
            disabled={!canSave}
            onPress={handleSave}
          >
            <Text style={[styles.saveRoutineText, { color: canSave ? "#fff" : "#9B7683" }]}>
              {isEditing ? l("حفظ التغييرات", "Save changes") : l("إنشاء الروتين", "Create routine")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function RoutineCard({
  canDelete,
  isExpanded,
  isFavorite,
  onDelete,
  onEdit,
  onFavorite,
  onToggle,
  routine,
}: {
  canDelete: boolean;
  isExpanded: boolean;
  isFavorite: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onFavorite: () => void;
  onToggle: () => void;
  routine: RoutineTemplate;
}) {
  const colors = useColors();
  const { t, l } = useLanguage();
  const { isStepCompleted, toggleRoutineStep, getRoutineCompletionPercent, completeRoutine, isRoutineCompleted } =
    useApp();

  const percent = getRoutineCompletionPercent(routine.id, routine.steps.length);
  const allDone = percent === 100 && routine.steps.length > 0;
  const routineCompleted = isRoutineCompleted(routine.id);

  async function handleStep(stepId: string) {
    if (routineCompleted) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleRoutineStep(routine.id, stepId);
  }

  async function handleComplete() {
    if (routineCompleted) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeRoutine(routine.id);
  }

  return (
    <View style={[styles.card, { borderColor: "rgba(122,61,82,0.12)", backgroundColor: colors.card }]}>
      <View style={routineCompleted ? { opacity: 0.64 } : undefined}>
        <Pressable onPress={routineCompleted ? undefined : onToggle} style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: routine.color }]}>
            <MaterialCommunityIcons name={routine.emoji} size={24} color="#7A3D52" />
          </View>
          <View style={styles.cardCopy}>
            <Text style={[styles.cardTitle, { color: colors.foreground, textDecorationLine: routineCompleted ? "line-through" : "none" }]}>
              {l(routine.title, routine.titleEn)}
            </Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]} numberOfLines={2}>
              {l(routine.subtitle, routine.subtitleEn)}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.percentText, { color: "#B55B72" }]}>{percent}%</Text>
            <View style={styles.cardActions}>
              <Pressable style={[styles.miniIconBtn, isFavorite && styles.favoriteMiniBtn]} onPress={onFavorite} hitSlop={8}>
                <MaterialCommunityIcons name={isFavorite ? "heart" : "heart-outline"} size={15} color={isFavorite ? "#B55B72" : "#7A3D52"} />
              </Pressable>
              <Pressable style={styles.miniIconBtn} onPress={onEdit} hitSlop={8}>
                <MaterialCommunityIcons name="pencil" size={15} color="#7A3D52" />
              </Pressable>
              {canDelete && (
                <Pressable style={styles.miniIconBtn} onPress={onDelete} hitSlop={8}>
                  <MaterialCommunityIcons name="trash-can-outline" size={15} color="#C2185B" />
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` as `${number}%` }]} />
        </View>

        {isExpanded && !routineCompleted && (
          <View style={styles.steps}>
            {routine.steps.map((step) => {
              const done = isStepCompleted(routine.id, step.id);
              return (
                <Pressable
                  key={step.id}
                  style={[styles.stepRow, { borderColor: "rgba(122,61,82,0.12)" }]}
                  onPress={() => handleStep(step.id)}
                >
                  <View style={[styles.checkbox, { backgroundColor: done ? "#B55B72" : "rgba(255,255,255,0.66)", borderColor: done ? "#B55B72" : "rgba(122,61,82,0.18)" }]}>
                    {done && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                  </View>
                  <Text
                    style={[
                      styles.stepTitle,
                      {
                        color: done ? colors.mutedForeground : colors.foreground,
                        textDecorationLine: done ? "line-through" : "none",
                      },
                    ]}
                  >
                    {l(step.title, step.titleEn)}
                  </Text>
                </Pressable>
              );
            })}

            {allDone && (
              <Pressable style={styles.completeBtn} onPress={handleComplete}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.completeBtnText}>{t.routines.markComplete}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {routineCompleted && <FloatingEmojis />}
    </View>
  );
}

export default function RoutinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, l } = useLanguage();
  const { data, saveUserRoutine, deleteUserRoutine, setFavoriteRoutine } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>("morning");
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const savedRoutines = data.customRoutines ?? [];
  const routines = useMemo(() => mergeRoutineTemplates(savedRoutines), [savedRoutines]);
  const savedIds = useMemo(() => new Set(savedRoutines.map((routine) => routine.id)), [savedRoutines]);
  const templateIds = useMemo(() => new Set(ROUTINE_TEMPLATES.map((routine) => routine.id)), []);
  const completedToday = routines.filter((routine) => data.completedRoutines?.[routine.id]).length;
  const canCreate = routines.length < MAX_ROUTINES;

  const openCreate = () => {
    if (!canCreate) {
      Alert.alert(l("وصلتِ للحد الأقصى", "Limit reached"), l("يمكنك حفظ 20 روتين فقط في نفس الوقت.", "You can keep up to 20 routines at a time."));
      return;
    }
    setEditingRoutine(null);
    setEditorVisible(true);
  };

  const handleSaveRoutine = async (routine: RoutineTemplate) => {
    await saveUserRoutine(routine);
    setExpandedId(routine.id);
    setEditorVisible(false);
    setEditingRoutine(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteRoutine = async (routine: RoutineTemplate | null) => {
    if (!routine) return;
    const isCustom = !templateIds.has(routine.id);
    const title = isCustom ? l("حذف الروتين؟", "Delete routine?") : l("إعادة الروتين الأصلي؟", "Reset routine?");
    const message = isCustom
      ? l("سيتم حذف هذا الروتين وخطواته.", "This routine and its checklist will be removed.")
      : l("سيعود الروتين إلى نسخته الأصلية.", "This routine will return to its original version.");
    const run = async () => {
      await deleteUserRoutine(routine.id);
      setEditorVisible(false);
      setEditingRoutine(null);
      setExpandedId(null);
    };
    if (Platform.OS === "web") {
      run();
      return;
    }
    Alert.alert(title, message, [
      { text: l("إلغاء", "Cancel"), style: "cancel" },
      { text: isCustom ? l("حذف", "Delete") : l("إعادة", "Reset"), style: "destructive", onPress: run },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 120 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient colors={["#FFE4EC", colors.background]} style={[styles.header, { paddingTop: topInset + 18 }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.routines.screenTitle}</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{t.routines.screenSubtitle}</Text>
          </View>
          <Pressable style={styles.createBtn} onPress={openCreate}>
            <MaterialCommunityIcons name="plus" size={19} color="#fff" />
            <Text style={styles.createBtnText}>{l("جديد", "New")}</Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryValue}>{routines.length}/{MAX_ROUTINES}</Text>
            <Text style={styles.summaryLabel}>{l("روتين", "routines")}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryValue}>{completedToday}</Text>
            <Text style={styles.summaryLabel}>{l("مكتمل اليوم", "done today")}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryValue}>{savedRoutines.filter((routine) => !templateIds.has(routine.id)).length}</Text>
            <Text style={styles.summaryLabel}>{l("مخصص", "custom")}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {routines.map((routine) => {
          const isCustom = !templateIds.has(routine.id);
          const hasSavedVersion = savedIds.has(routine.id);
          return (
            <RoutineCard
              key={routine.id}
              canDelete={isCustom || hasSavedVersion}
              routine={routine}
              isExpanded={expandedId === routine.id}
              isFavorite={data.favoriteRoutineId === routine.id}
              onEdit={() => {
                setEditingRoutine(routine);
                setEditorVisible(true);
              }}
              onFavorite={async () => {
                await setFavoriteRoutine(data.favoriteRoutineId === routine.id ? null : routine.id);
                Haptics.selectionAsync();
              }}
              onDelete={() => handleDeleteRoutine(routine)}
              onToggle={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
            />
          );
        })}
      </View>

      <RoutineEditorModal
        canDelete={!!editingRoutine && (!templateIds.has(editingRoutine.id) || savedIds.has(editingRoutine.id))}
        initialRoutine={editingRoutine}
        routineCount={routines.length}
        visible={editorVisible}
        onClose={() => {
          setEditorVisible(false);
          setEditingRoutine(null);
        }}
        onDelete={() => handleDeleteRoutine(editingRoutine)}
        onSave={handleSaveRoutine}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 18, paddingBottom: 18 },
  headerTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  createBtn: { alignItems: "center", backgroundColor: "#B55B72", borderRadius: 18, flexDirection: "row", gap: 5, paddingHorizontal: 14, paddingVertical: 10 },
  createBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  summaryRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  summaryPill: { backgroundColor: "rgba(255,255,255,0.72)", borderColor: "rgba(122,61,82,0.12)", borderRadius: 18, borderWidth: 1, flex: 1, padding: 12 },
  summaryValue: { color: "#7A3D52", fontFamily: "Inter_700Bold", fontSize: 18 },
  summaryLabel: { color: "rgba(74,44,56,0.66)", fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  content: { gap: 14, paddingHorizontal: 16 },
  card: { borderRadius: 22, borderWidth: 1, overflow: "hidden", shadowColor: "#B55B72", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 2 },
  cardHeader: { alignItems: "center", flexDirection: "row", gap: 12, padding: 16 },
  iconBox: { alignItems: "center", borderRadius: 16, height: 48, justifyContent: "center", width: 48 },
  cardCopy: { flex: 1 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginTop: 3 },
  cardRight: { alignItems: "flex-end", gap: 6 },
  cardActions: { flexDirection: "row", gap: 6 },
  miniIconBtn: { alignItems: "center", backgroundColor: "rgba(181,91,114,0.12)", borderRadius: 12, height: 28, justifyContent: "center", width: 28 },
  favoriteMiniBtn: { backgroundColor: "rgba(181,91,114,0.2)" },
  percentText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  progressTrack: { backgroundColor: "rgba(122,61,82,0.1)", height: 4 },
  progressFill: { backgroundColor: "#B55B72", height: "100%" },
  steps: { gap: 10, padding: 16, paddingTop: 14 },
  stepRow: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", gap: 12, paddingBottom: 10 },
  checkbox: { alignItems: "center", borderRadius: 8, borderWidth: 2, height: 24, justifyContent: "center", width: 24 },
  stepTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  completeBtn: { alignItems: "center", backgroundColor: "#B55B72", borderRadius: 16, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 4, padding: 14 },
  completeBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
  editorRoot: { flex: 1 },
  editorTop: { alignItems: "center", flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  roundIconBtn: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.78)", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  editorTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  editorSub: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18, marginTop: 2 },
  editorPanel: { backgroundColor: "rgba(255,255,255,0.68)", borderColor: "rgba(122,61,82,0.12)", borderRadius: 24, borderWidth: 1, marginHorizontal: 16, padding: 16 },
  editorInput: { backgroundColor: "rgba(255,255,255,0.86)", borderColor: "rgba(122,61,82,0.12)", borderRadius: 16, borderWidth: 1, color: "#33242A", fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 10, paddingHorizontal: 14, paddingVertical: 12 },
  editorInputSmall: { fontFamily: "Inter_400Regular", fontSize: 14 },
  editorLabel: { color: "#6B3C4C", fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 8, marginTop: 6 },
  paletteRow: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 8 },
  colorDot: { borderRadius: 16, borderWidth: 2, height: 32, width: 32 },
  iconPicker: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  iconChoice: { alignItems: "center", borderRadius: 14, borderWidth: 1, height: 42, justifyContent: "center", width: 42 },
  stepsHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  stepCount: { backgroundColor: "#F6D6E0", borderRadius: 12, color: "#7A3D52", fontFamily: "Inter_700Bold", minWidth: 28, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 3, textAlign: "center" },
  stepEditorRow: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 8 },
  stepBadge: { alignItems: "center", backgroundColor: "#F6D6E0", borderRadius: 12, height: 26, justifyContent: "center", width: 26 },
  stepBadgeText: { color: "#7A3D52", fontFamily: "Inter_700Bold", fontSize: 12 },
  stepInput: { backgroundColor: "rgba(255,255,255,0.86)", borderColor: "rgba(122,61,82,0.12)", borderRadius: 14, borderWidth: 1, color: "#33242A", flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, paddingHorizontal: 12, paddingVertical: 10 },
  removeStepBtn: { alignItems: "center", backgroundColor: "rgba(194,24,91,0.1)", borderRadius: 12, height: 34, justifyContent: "center", width: 34 },
  addStepBtn: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#F6D6E0", borderRadius: 16, flexDirection: "row", gap: 6, marginTop: 4, paddingHorizontal: 12, paddingVertical: 9 },
  addStepText: { color: "#7A3D52", fontFamily: "Inter_700Bold", fontSize: 13 },
  editorFooter: { alignItems: "center", backgroundColor: "rgba(255,244,247,0.94)", borderTopColor: "rgba(122,61,82,0.1)", borderTopWidth: 1, flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 10 },
  deleteRoutineBtn: { alignItems: "center", backgroundColor: "rgba(194,24,91,0.1)", borderRadius: 16, height: 48, justifyContent: "center", width: 52 },
  saveRoutineBtn: { alignItems: "center", borderRadius: 16, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: 18 },
  saveRoutineText: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
