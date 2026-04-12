import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { GLOW_UP_PLANS, type GlowUpPlan } from "@/data/glowupPlans";
import { useColors } from "@/hooks/useColors";
import { AR } from "@/constants/i18n";

function PlanCard({
  plan,
  isActive,
  onStart,
  onExpand,
  isExpanded,
}: {
  plan: GlowUpPlan;
  isActive: boolean;
  onStart: () => void;
  onExpand: () => void;
  isExpanded: boolean;
}) {
  const colors = useColors();
  const { isGlowUpTaskDone, toggleGlowUpTask, getCurrentDay } = useApp();

  const currentDay = getCurrentDay();

  const totalTasksDone = isActive
    ? plan.days.reduce((acc, d) => {
        return (
          acc + d.tasks.filter((t) => isGlowUpTaskDone(plan.id, d.day, t.id)).length
        );
      }, 0)
    : 0;

  const totalTasks = plan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const progressPercent = totalTasks > 0 ? Math.round((totalTasksDone / totalTasks) * 100) : 0;

  return (
    <View
      style={[
        styles.planCard,
        {
          borderColor: isActive ? colors.primary : colors.border,
          backgroundColor: colors.card,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={plan.gradient}
        style={styles.planCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.planCardTop}>
          <View>
            <Text style={[styles.planDuration, { color: "#fff" }]}>
              {plan.duration} {AR.glowup.days}
            </Text>
            <Text style={[styles.planTitle, { color: "#fff" }]}>
              {plan.title}
            </Text>
            <Text style={[styles.planTagline, { color: "rgba(255,255,255,0.85)" }]}>
              {plan.tagline}
            </Text>
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{AR.glowup.activeBadge}</Text>
            </View>
          )}
        </View>

        {isActive && (
          <View style={styles.planProgress}>
            <View style={styles.progressRow}>
              <Text style={{ color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 }}>
                {totalTasksDone} / {totalTasks} {AR.glowup.tasks}
              </Text>
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 }}>
                {progressPercent}%
              </Text>
            </View>
            <View style={styles.planProgressBar}>
              <View
                style={[
                  styles.planProgressFill,
                  { width: `${progressPercent}%` as `${number}%` },
                ]}
              />
            </View>
          </View>
        )}
      </LinearGradient>

      <View style={styles.planCardBody}>
        {!isActive ? (
          <Pressable
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={onStart}
          >
            <Text style={styles.startBtnText}>{AR.glowup.startPlan}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onExpand}
            style={[styles.expandBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.expandBtnText, { color: colors.foreground }]}>
              {isExpanded ? AR.glowup.hideDays : AR.glowup.viewTasks}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>
        )}

        {isActive && isExpanded && (
          <View style={styles.daysList}>
            {plan.days.slice(0, Math.min(currentDay + 1, plan.days.length)).map((d) => {
              const dayDone = d.tasks.filter((t) =>
                isGlowUpTaskDone(plan.id, d.day, t.id)
              ).length;
              const isPast = d.day < currentDay;
              const isToday = d.day === currentDay;
              return (
                <View
                  key={d.day}
                  style={[
                    styles.dayItem,
                    {
                      borderColor: colors.border,
                      backgroundColor: isToday
                        ? colors.highlight + "44"
                        : "transparent",
                    },
                  ]}
                >
                  <View style={styles.dayHeader}>
                    <View style={styles.dayNumRow}>
                      <Text
                        style={[
                          styles.dayNum,
                          {
                            color: isToday ? colors.primary : colors.mutedForeground,
                          },
                        ]}
                      >
                        {AR.glowup.today} {d.day}
                      </Text>
                      {isToday && (
                        <View
                          style={[
                            styles.todayPill,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Text style={styles.todayPillText}>{AR.glowup.today}</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.dayTheme, { color: colors.foreground }]}
                    >
                      {d.theme}
                    </Text>
                  </View>

                  {d.tasks.map((task) => {
                    const done = isGlowUpTaskDone(plan.id, d.day, task.id);
                    return (
                      <Pressable
                        key={task.id}
                        style={styles.taskRow}
                        onPress={async () => {
                          if (isToday) {
                            await Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            await toggleGlowUpTask(plan.id, d.day, task.id);
                          }
                        }}
                        disabled={!isToday}
                      >
                        <View
                          style={[
                            styles.taskCheck,
                            {
                              borderColor: done ? colors.primary : colors.border,
                              backgroundColor: done
                                ? colors.primary
                                : "transparent",
                            },
                          ]}
                        >
                          {done && (
                            <MaterialCommunityIcons
                              name="check"
                              size={10}
                              color="#fff"
                            />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.taskTitle,
                              {
                                color: done
                                  ? colors.mutedForeground
                                  : colors.foreground,
                                textDecorationLine: done
                                  ? "line-through"
                                  : "none",
                              },
                            ]}
                          >
                            {task.title}
                          </Text>
                          <Text
                            style={[
                              styles.taskCat,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            {task.category}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                  <Text
                    style={[styles.dayProgress, { color: colors.mutedForeground }]}
                  >
                    {dayDone} / {d.tasks.length} {AR.glowup.completed}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

export default function GlowUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, startGlowUpPlan } = useApp();
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  async function handleStart(planId: string) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await startGlowUpPlan(planId);
    setExpandedPlanId(planId);
  }

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
          {AR.glowup.screenTitle}
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {AR.glowup.screenSubtitle}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {GLOW_UP_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={data.glowUpProgress.activePlanId === plan.id}
            isExpanded={expandedPlanId === plan.id}
            onStart={() => handleStart(plan.id)}
            onExpand={() =>
              setExpandedPlanId(
                expandedPlanId === plan.id ? null : plan.id
              )
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
    gap: 16,
    paddingBottom: 16,
  },
  planCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  planCardGradient: {
    padding: 20,
  },
  planCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planDuration: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.85,
  },
  planTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  planTagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  planProgress: {
    marginTop: 16,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  planProgressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  planProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  planCardBody: {
    padding: 16,
  },
  startBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  startBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  expandBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  daysList: {
    marginTop: 12,
    gap: 12,
  },
  dayItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  dayHeader: {
    marginBottom: 4,
  },
  dayNumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  dayNum: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  todayPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayPillText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  dayTheme: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  taskCat: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  dayProgress: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 4,
  },
});
