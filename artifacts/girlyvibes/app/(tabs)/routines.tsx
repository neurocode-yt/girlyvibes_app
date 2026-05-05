import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
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
import { ROUTINE_TEMPLATES, type RoutineTemplate } from "@/data/routines";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

function RoutineCard({
  routine,
  isExpanded,
  onToggle,
}: {
  routine: RoutineTemplate;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const { t, l } = useLanguage();
  const { isStepCompleted, toggleRoutineStep, getRoutineCompletionPercent, completeRoutine, isRoutineCompleted } =
    useApp();

  const percent = getRoutineCompletionPercent(routine.id, routine.steps.length);
  const allDone = percent === 100;
  const routineCompleted = isRoutineCompleted(routine.id);

  async function handleStep(stepId: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleRoutineStep(routine.id, stepId);
  }

  async function handleComplete() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeRoutine(routine.id);
  }

  return (
    <View
      style={[
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.card },
      ]}
    >
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: routine.color }]}>
          <MaterialCommunityIcons
            name={routine.emoji}
            size={22}
            color={colors.primary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            {l(routine.title, routine.titleEn)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            {l(routine.subtitle, routine.subtitleEn)}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.percentText, { color: colors.primary }]}>
            {percent}%
          </Text>
          <MaterialCommunityIcons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.mutedForeground}
          />
        </View>
      </Pressable>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${percent}%` as `${number}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      {isExpanded && (
        <View style={styles.steps}>
          {routine.steps.map((step) => {
            const done = isStepCompleted(routine.id, step.id);
            return (
              <Pressable
                key={step.id}
                style={[
                  styles.stepRow,
                  { borderColor: colors.border },
                ]}
                onPress={() => handleStep(step.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: done ? colors.primary : colors.border,
                      backgroundColor: done ? colors.primary : "transparent",
                    },
                  ]}
                >
                  {done && (
                    <MaterialCommunityIcons name="check" size={12} color="#fff" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
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
                  {step.subtitle && (
                    <Text
                      style={[
                        styles.stepSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {l(step.subtitle, step.subtitleEn ?? "")}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}

          {allDone && !routineCompleted && (
            <Pressable
              style={[styles.completeBtn, { backgroundColor: colors.primary }]}
              onPress={handleComplete}
            >
              <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
              <Text style={styles.completeBtnText}>{t.routines.markComplete}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function RoutinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>("morning");

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {t.routines.screenTitle}
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {t.routines.screenSubtitle}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {ROUTINE_TEMPLATES.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            isExpanded={expandedId === routine.id}
            onToggle={() =>
              setExpandedId(expandedId === routine.id ? null : routine.id)
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  percentText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  progressBar: {
    height: 3,
    marginHorizontal: 0,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  steps: {
    padding: 16,
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  stepSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  completeBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
