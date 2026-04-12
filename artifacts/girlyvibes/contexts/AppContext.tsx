import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "girlyvibes_app_data";

interface RoutineProgress {
  [routineId: string]: {
    [stepId: string]: boolean;
  };
}

interface GlowUpProgress {
  activePlanId: string | null;
  startDate: string | null;
  completedTasks: { [dayKey: string]: boolean };
}

interface DetoxChallenge {
  challengeId: string | null;
  startDate: string | null;
  checkedInDays: string[];
}

interface AppData {
  streak: number;
  lastStreakDate: string | null;
  totalRoutinesCompleted: number;
  routineProgress: RoutineProgress;
  glowUpProgress: GlowUpProgress;
  detoxChallenge: DetoxChallenge;
  favoriteAdvice: string[];
}

interface AppContextType {
  data: AppData;
  toggleRoutineStep: (routineId: string, stepId: string) => Promise<void>;
  isStepCompleted: (routineId: string, stepId: string) => boolean;
  getRoutineCompletionPercent: (routineId: string, totalSteps: number) => number;
  completeRoutine: (routineId: string) => Promise<void>;
  startGlowUpPlan: (planId: string) => Promise<void>;
  toggleGlowUpTask: (planId: string, dayNum: number, taskId: string) => Promise<void>;
  isGlowUpTaskDone: (planId: string, dayNum: number, taskId: string) => boolean;
  getDayProgress: (planId: string, dayNum: number, totalTasks: number) => number;
  getCurrentDay: () => number;
  startDetoxChallenge: (challengeId: string) => Promise<void>;
  checkInDetox: () => Promise<void>;
  isDetoxCheckedInToday: () => boolean;
  getDetoxDaysCompleted: () => number;
  toggleFavoriteAdvice: (cardId: string) => Promise<void>;
  isFavorite: (cardId: string) => boolean;
}

const DEFAULT_DATA: AppData = {
  streak: 0,
  lastStreakDate: null,
  totalRoutinesCompleted: 0,
  routineProgress: {},
  glowUpProgress: {
    activePlanId: null,
    startDate: null,
    completedTasks: {},
  },
  detoxChallenge: {
    challengeId: null,
    startDate: null,
    checkedInDays: [],
  },
  favoriteAdvice: [],
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setData(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const save = useCallback(async (newData: AppData) => {
    setData(newData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  const toggleRoutineStep = useCallback(
    async (routineId: string, stepId: string) => {
      const prev = data.routineProgress[routineId] ?? {};
      const updated: AppData = {
        ...data,
        routineProgress: {
          ...data.routineProgress,
          [routineId]: { ...prev, [stepId]: !prev[stepId] },
        },
      };
      await save(updated);
    },
    [data, save]
  );

  const isStepCompleted = useCallback(
    (routineId: string, stepId: string) => {
      return data.routineProgress[routineId]?.[stepId] ?? false;
    },
    [data]
  );

  const getRoutineCompletionPercent = useCallback(
    (routineId: string, totalSteps: number) => {
      if (totalSteps === 0) return 0;
      const steps = data.routineProgress[routineId] ?? {};
      const done = Object.values(steps).filter(Boolean).length;
      return Math.round((done / totalSteps) * 100);
    },
    [data]
  );

  const completeRoutine = useCallback(
    async (routineId: string) => {
      const today = new Date().toDateString();
      const isNewDay = data.lastStreakDate !== today;
      const wasYesterday =
        data.lastStreakDate ===
        new Date(Date.now() - 86400000).toDateString();

      const newStreak = isNewDay
        ? wasYesterday || data.streak === 0
          ? data.streak + 1
          : 1
        : data.streak;

      await save({
        ...data,
        streak: newStreak,
        lastStreakDate: today,
        totalRoutinesCompleted: data.totalRoutinesCompleted + 1,
      });
    },
    [data, save]
  );

  const startGlowUpPlan = useCallback(
    async (planId: string) => {
      await save({
        ...data,
        glowUpProgress: {
          activePlanId: planId,
          startDate: new Date().toISOString(),
          completedTasks: {},
        },
      });
    },
    [data, save]
  );

  const toggleGlowUpTask = useCallback(
    async (planId: string, dayNum: number, taskId: string) => {
      const key = `${planId}_d${dayNum}_${taskId}`;
      const updated: AppData = {
        ...data,
        glowUpProgress: {
          ...data.glowUpProgress,
          completedTasks: {
            ...data.glowUpProgress.completedTasks,
            [key]: !data.glowUpProgress.completedTasks[key],
          },
        },
      };
      await save(updated);
    },
    [data, save]
  );

  const isGlowUpTaskDone = useCallback(
    (planId: string, dayNum: number, taskId: string) => {
      const key = `${planId}_d${dayNum}_${taskId}`;
      return data.glowUpProgress.completedTasks[key] ?? false;
    },
    [data]
  );

  const getDayProgress = useCallback(
    (planId: string, dayNum: number, totalTasks: number) => {
      if (totalTasks === 0) return 0;
      let done = 0;
      for (let i = 0; i < totalTasks; i++) {
        const key = `${planId}_d${dayNum}_task`;
        if (data.glowUpProgress.completedTasks[key]) done++;
      }
      return Math.round((done / totalTasks) * 100);
    },
    [data]
  );

  const getCurrentDay = useCallback(() => {
    if (!data.glowUpProgress.startDate) return 1;
    const start = new Date(data.glowUpProgress.startDate);
    const diff = Math.floor((Date.now() - start.getTime()) / 86400000);
    return diff + 1;
  }, [data]);

  const startDetoxChallenge = useCallback(
    async (challengeId: string) => {
      await save({
        ...data,
        detoxChallenge: {
          challengeId,
          startDate: new Date().toISOString(),
          checkedInDays: [],
        },
      });
    },
    [data, save]
  );

  const checkInDetox = useCallback(async () => {
    const today = new Date().toDateString();
    if (data.detoxChallenge.checkedInDays.includes(today)) return;
    await save({
      ...data,
      detoxChallenge: {
        ...data.detoxChallenge,
        checkedInDays: [...data.detoxChallenge.checkedInDays, today],
      },
    });
  }, [data, save]);

  const isDetoxCheckedInToday = useCallback(() => {
    const today = new Date().toDateString();
    return data.detoxChallenge.checkedInDays.includes(today);
  }, [data]);

  const getDetoxDaysCompleted = useCallback(() => {
    return data.detoxChallenge.checkedInDays.length;
  }, [data]);

  const toggleFavoriteAdvice = useCallback(
    async (cardId: string) => {
      const favs = data.favoriteAdvice;
      const updated = favs.includes(cardId)
        ? favs.filter((id) => id !== cardId)
        : [...favs, cardId];
      await save({ ...data, favoriteAdvice: updated });
    },
    [data, save]
  );

  const isFavorite = useCallback(
    (cardId: string) => data.favoriteAdvice.includes(cardId),
    [data]
  );

  return (
    <AppContext.Provider
      value={{
        data,
        toggleRoutineStep,
        isStepCompleted,
        getRoutineCompletionPercent,
        completeRoutine,
        startGlowUpPlan,
        toggleGlowUpTask,
        isGlowUpTaskDone,
        getDayProgress,
        getCurrentDay,
        startDetoxChallenge,
        checkInDetox,
        isDetoxCheckedInToday,
        getDetoxDaysCompleted,
        toggleFavoriteAdvice,
        isFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
