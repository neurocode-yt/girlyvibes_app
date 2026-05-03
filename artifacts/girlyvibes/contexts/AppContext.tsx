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

export interface DiaryEntry {
  id: string;        // date key YYYY-MM-DD
  mood: string;      // mood key e.g. "happy"
  moodEmoji: string; // the actual emoji
  note: string;
  cardColor: string; // hex
}

export interface RichBlock {
  id: string;
  text: string;
  type: 'h1' | 'h2' | 'h3' | 'body' | 'small';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  fontStyle: 'sans' | 'serif' | 'mono';
  emojiScale?: number; // 1.0–3.0, default 1
}

export interface DiaryNote {
  id: string;        // `${date}-${timestamp}`
  date: string;      // YYYY-MM-DD
  text: string;
  richContent?: RichBlock[];
  color: string;     // hex card color
  createdAt: number; // ms timestamp
}

interface AppData {
  streak: number;
  lastStreakDate: string | null;
  totalRoutinesCompleted: number;
  routineProgress: RoutineProgress;
  glowUpProgress: GlowUpProgress;
  detoxChallenge: DetoxChallenge;
  favoriteAdvice: string[];
  profileName: string;
  profilePhoto: string | null;
  diaryEntries: { [dateKey: string]: DiaryEntry };
  diaryNotes: DiaryNote[];
}

interface AppContextType {
  data: AppData;
  updateProfile: (name: string, photo: string | null) => Promise<void>;
  saveDiaryEntry: (entry: DiaryEntry) => Promise<void>;
  deleteDiaryEntry: (dateKey: string) => Promise<void>;
  saveNote: (note: DiaryNote) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  updateNote: (noteId: string, text: string, color: string, richContent?: RichBlock[]) => Promise<void>;
  toggleRoutineStep: (routineId: string, stepId: string) => Promise<void>;
  isStepCompleted: (routineId: string, stepId: string) => boolean;
  getRoutineCompletionPercent: (routineId: string, totalSteps: number) => number;
  completeRoutine: (routineId: string) => Promise<void>;
  startGlowUpPlan: (planId: string) => Promise<void>;
  toggleGlowUpTask: (planId: string, dayNum: number, taskId: string) => Promise<void>;
  isGlowUpTaskDone: (planId: string, dayNum: number, taskId: string) => boolean;
  getDayProgress: (planId: string, dayNum: number, taskIds: string[]) => number;
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
  profileName: "",
  profilePhoto: null,
  diaryEntries: {},
  diaryNotes: [],
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

  const updateProfile = useCallback(
    async (name: string, photo: string | null) => {
      await save({ ...data, profileName: name, profilePhoto: photo });
    },
    [data, save]
  );

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
    (planId: string, dayNum: number, taskIds: string[]) => {
      if (taskIds.length === 0) return 0;
      const done = taskIds.filter((taskId) => {
        const key = `${planId}_d${dayNum}_${taskId}`;
        return data.glowUpProgress.completedTasks[key];
      }).length;
      return Math.round((done / taskIds.length) * 100);
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

  const saveDiaryEntry = useCallback(
    async (entry: DiaryEntry) => {
      await save({
        ...data,
        diaryEntries: { ...data.diaryEntries, [entry.id]: entry },
      });
    },
    [data, save]
  );

  const deleteDiaryEntry = useCallback(
    async (dateKey: string) => {
      const updated = { ...data.diaryEntries };
      delete updated[dateKey];
      await save({ ...data, diaryEntries: updated });
    },
    [data, save]
  );

  const saveNote = useCallback(
    async (note: DiaryNote) => {
      const existing = data.diaryNotes ?? [];
      await save({ ...data, diaryNotes: [...existing, note] });
    },
    [data, save]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      const updated = (data.diaryNotes ?? []).filter((n) => n.id !== noteId);
      await save({ ...data, diaryNotes: updated });
    },
    [data, save]
  );

  const updateNote = useCallback(
    async (noteId: string, text: string, color: string, richContent?: RichBlock[]) => {
      const updated = (data.diaryNotes ?? []).map((n) =>
        n.id === noteId ? { ...n, text, color, ...(richContent ? { richContent } : {}) } : n
      );
      await save({ ...data, diaryNotes: updated });
    },
    [data, save]
  );

  return (
    <AppContext.Provider
      value={{
        data,
        updateProfile,
        saveDiaryEntry,
        deleteDiaryEntry,
        saveNote,
        deleteNote,
        updateNote,
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
