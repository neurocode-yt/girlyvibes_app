import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";

import { ROUTINE_TEMPLATES, type RoutineTemplate } from "@/data/routines";
import { useAuth } from "@/contexts/AuthContext";
import { 
  syncProfileToCloud, 
  syncNoteToCloud, 
  syncSecretNoteToCloud,
  deleteNoteFromCloud, 
  deleteSecretNoteFromCloud,
  syncEntryToCloud, 
  deleteEntryFromCloud, 
  syncRoutineToCloud, 
  deleteRoutineFromCloud,
  fetchCloudData 
} from "@/lib/sync";

interface RoutineProgress {
  [routineId: string]: {
    [stepId: string]: boolean;
  };
}

interface CompletedRoutines {
  [routineId: string]: boolean;
}

interface GlowUpProgress {
  activePlanId: string | null;
  activePlanIds?: string[];
  startDate: string | null;
  planStartDates?: { [planId: string]: string };
  completedTasks: { [dayKey: string]: boolean };
}

interface DetoxChallenge {
  challengeId: string | null;
  startDate: string | null;
  checkedInDays: string[];
}

export type VisionBoardMode = "square" | "horizontal" | "vertical";

export interface DiaryEntry {
  id: string;        // date key YYYY-MM-DD
  mood: string;      // mood key e.g. "happy"
  moodEmoji: string; // the actual emoji
  note: string;
  cardColor: string; // hex
  updatedAt?: number;
}

export interface RichBlock {
  id: string;
  text: string;
  type: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'bullet' | 'audio' | 'image';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  fontStyle: 'sans' | 'soft' | 'serif' | 'mono' | 'hand' | 'fancy';
  audioUri?: string;
  imageUri?: string;
  audioStoragePath?: string;
  imageStoragePath?: string;
  mediaBucket?: string;
  mimeType?: string;
  audioDurationMillis?: number;
  bulletSymbol?: string;
  emojiScale?: number; // 1.0–3.0, default 1
}

export interface DiaryNote {
  id: string;        // `${date}-${timestamp}`
  date: string;      // YYYY-MM-DD
  text: string;
  richContent?: RichBlock[];
  color: string;     // hex card color
  title?: string;    // note title
  createdAt: number; // ms timestamp
  updatedAt?: number;
}

export interface AppData {
  streak: number;
  lastStreakDate: string | null;
  totalRoutinesCompleted: number;
  routineProgress: RoutineProgress;
  completedRoutines?: CompletedRoutines;
  glowUpProgress: GlowUpProgress;
  detoxChallenge: DetoxChallenge;
  favoriteAdvice: string[];
  profileName: string;
  profilePhoto: string | null;
  profilePhotoStoragePath?: string | null;
  favoriteRoutineId: string | null;
  visionBoardImage: string | null;
  visionBoardStoragePath?: string | null;
  visionBoardMode: VisionBoardMode;
  diaryEntries: { [dateKey: string]: DiaryEntry };
  diaryNotes: DiaryNote[];
  secretDiaryPin: string | null;
  secretDiaryEnabled: boolean;
  secretDiaryNotes: DiaryNote[];
  customRoutines: RoutineTemplate[];
  lastRoutineResetDate?: string;
}

interface AppContextType {
  data: AppData;
  updateProfile: (name: string, photo: string | null) => Promise<void>;
  saveDiaryEntry: (entry: DiaryEntry) => Promise<void>;
  deleteDiaryEntry: (dateKey: string) => Promise<void>;
  saveNote: (note: DiaryNote) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  updateNote: (noteId: string, text: string, color: string, richContent?: RichBlock[], title?: string) => Promise<void>;
  setSecretDiaryPin: (pin: string) => Promise<void>;
  clearSecretDiaryPin: () => Promise<void>;
  saveSecretNote: (note: DiaryNote) => Promise<void>;
  deleteSecretNote: (noteId: string) => Promise<void>;
  updateSecretNote: (noteId: string, text: string, color: string, richContent?: RichBlock[], title?: string) => Promise<void>;
  saveUserRoutine: (routine: RoutineTemplate) => Promise<void>;
  deleteUserRoutine: (routineId: string) => Promise<void>;
  setFavoriteRoutine: (routineId: string | null) => Promise<void>;
  updateVisionBoard: (imageUri: string | null, mode?: VisionBoardMode) => Promise<void>;
  toggleRoutineStep: (routineId: string, stepId: string) => Promise<void>;
  isStepCompleted: (routineId: string, stepId: string) => boolean;
  getRoutineCompletionPercent: (routineId: string, totalSteps: number) => number;
  completeRoutine: (routineId: string) => Promise<void>;
  isRoutineCompleted: (routineId: string) => boolean;
  startGlowUpPlan: (planId: string) => Promise<void>;
  deactivateGlowUpPlan: (planId: string) => Promise<void>;
  toggleGlowUpTask: (planId: string, dayNum: number, taskId: string) => Promise<void>;
  isGlowUpTaskDone: (planId: string, dayNum: number, taskId: string) => boolean;
  getDayProgress: (planId: string, dayNum: number, taskIds: string[]) => number;
  getCurrentDay: (planId?: string) => number;
  startDetoxChallenge: (challengeId: string) => Promise<void>;
  checkInDetox: () => Promise<void>;
  isDetoxCheckedInToday: () => boolean;
  getDetoxDaysCompleted: () => number;
  toggleFavoriteAdvice: (cardId: string) => Promise<void>;
  isFavorite: (cardId: string) => boolean;
  clearData: () => Promise<void>;
}

const DEFAULT_DATA: AppData = {
  streak: 0,
  lastStreakDate: null,
  totalRoutinesCompleted: 0,
  routineProgress: {},
  completedRoutines: {},
  glowUpProgress: {
    activePlanId: null,
    activePlanIds: [],
    startDate: null,
    planStartDates: {},
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
  profilePhotoStoragePath: null,
  favoriteRoutineId: null,
  visionBoardImage: null,
  visionBoardStoragePath: null,
  visionBoardMode: "square",
  diaryEntries: {},
  diaryNotes: [],
  secretDiaryPin: null,
  secretDiaryEnabled: false,
  secretDiaryNotes: [],
  customRoutines: [],
};

const AppContext = createContext<AppContextType | null>(null);

function normalizeAppData(raw: Partial<AppData> | null | undefined): AppData {
  const parsed = raw ?? {};
  return {
    ...DEFAULT_DATA,
    ...parsed,
    glowUpProgress: {
      ...DEFAULT_DATA.glowUpProgress,
      ...(parsed.glowUpProgress ?? {}),
    },
    detoxChallenge: {
      ...DEFAULT_DATA.detoxChallenge,
      ...(parsed.detoxChallenge ?? {}),
    },
    favoriteAdvice: parsed.favoriteAdvice ?? [],
    favoriteRoutineId: parsed.favoriteRoutineId ?? null,
    visionBoardImage: parsed.visionBoardImage ?? null,
    visionBoardStoragePath: parsed.visionBoardStoragePath ?? null,
    visionBoardMode: parsed.visionBoardMode ?? "square",
    profilePhotoStoragePath: parsed.profilePhotoStoragePath ?? null,
    diaryEntries: parsed.diaryEntries ?? {},
    diaryNotes: parsed.diaryNotes ?? [],
    secretDiaryPin: parsed.secretDiaryPin ?? null,
    secretDiaryEnabled: parsed.secretDiaryEnabled ?? !!parsed.secretDiaryPin,
    secretDiaryNotes: parsed.secretDiaryNotes ?? [],
    customRoutines: parsed.customRoutines ?? [],
  };
}

function itemStamp(item: { updatedAt?: number; createdAt?: number }) {
  return item.updatedAt ?? item.createdAt ?? 0;
}

function mergeByNewest<T extends { id: string; updatedAt?: number; createdAt?: number }>(
  localItems: T[],
  cloudItems: T[],
) {
  const merged = new Map<string, T>();
  for (const item of [...localItems, ...cloudItems]) {
    const existing = merged.get(item.id);
    if (!existing || itemStamp(item) >= itemStamp(existing)) {
      merged.set(item.id, item);
    }
  }
  return Array.from(merged.values());
}

function mergeEntries(
  localEntries: AppData["diaryEntries"],
  cloudEntries: AppData["diaryEntries"],
) {
  const merged: AppData["diaryEntries"] = { ...localEntries };
  for (const [id, cloudEntry] of Object.entries(cloudEntries)) {
    const localEntry = merged[id];
    if (!localEntry || itemStamp(cloudEntry) >= itemStamp(localEntry)) {
      merged[id] = cloudEntry;
    }
  }
  return merged;
}

function mergeCloudData(localData: AppData, cloudData: Partial<AppData> | null) {
  if (!cloudData) return localData;

  const normalizedCloud = normalizeAppData(cloudData);
  return {
    ...localData,
    ...normalizedCloud,
    streak: Math.max(localData.streak ?? 0, normalizedCloud.streak ?? 0),
    totalRoutinesCompleted: Math.max(
      localData.totalRoutinesCompleted ?? 0,
      normalizedCloud.totalRoutinesCompleted ?? 0,
    ),
    lastStreakDate: normalizedCloud.lastStreakDate ?? localData.lastStreakDate,
    favoriteRoutineId: normalizedCloud.favoriteRoutineId ?? localData.favoriteRoutineId,
    visionBoardImage: normalizedCloud.visionBoardImage ?? localData.visionBoardImage,
    visionBoardStoragePath: normalizedCloud.visionBoardStoragePath ?? localData.visionBoardStoragePath,
    profileName: normalizedCloud.profileName || localData.profileName,
    profilePhoto: normalizedCloud.profilePhoto ?? localData.profilePhoto,
    profilePhotoStoragePath: normalizedCloud.profilePhotoStoragePath ?? localData.profilePhotoStoragePath,
    diaryNotes: mergeByNewest(localData.diaryNotes ?? [], normalizedCloud.diaryNotes ?? []),
    secretDiaryPin: normalizedCloud.secretDiaryPin ?? localData.secretDiaryPin ?? null,
    secretDiaryEnabled: normalizedCloud.secretDiaryEnabled || localData.secretDiaryEnabled || !!normalizedCloud.secretDiaryPin || !!localData.secretDiaryPin,
    secretDiaryNotes: mergeByNewest(localData.secretDiaryNotes ?? [], normalizedCloud.secretDiaryNotes ?? []),
    diaryEntries: mergeEntries(localData.diaryEntries ?? {}, normalizedCloud.diaryEntries ?? {}),
    customRoutines: mergeByNewest(
      localData.customRoutines.map((routine) => ({ ...routine, updatedAt: 0 })),
      normalizedCloud.customRoutines.map((routine) => ({ ...routine, updatedAt: 1 })),
    ).map(({ updatedAt: _updatedAt, ...routine }) => routine),
    favoriteAdvice: Array.from(
      new Set([...(localData.favoriteAdvice ?? []), ...(normalizedCloud.favoriteAdvice ?? [])]),
    ),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id || "local";
  const STORAGE_KEY = `girlyvibes_app_data_${userId}`;

  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const lastSyncAlertAtRef = useRef(0);

  const showSyncFailure = useCallback((label: string) => {
    const now = Date.now();
    if (now - lastSyncAlertAtRef.current < 5000) return;
    lastSyncAlertAtRef.current = now;
    Alert.alert(
      "Database sync failed",
      `${label} were saved on this device, but could not update the database right now. Check internet/Supabase setup; the app will try again when it syncs.`,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setData({ ...DEFAULT_DATA, lastRoutineResetDate: new Date().toDateString() }); // Clear memory before loading
    
    AsyncStorage.getItem(STORAGE_KEY).then(async (raw) => {
      let localData: AppData = { ...DEFAULT_DATA };
      if (raw) {
        try {
          localData = normalizeAppData(JSON.parse(raw));
        } catch {
          // ignore
        }
      }

      let parsedData = localData;
      if (session?.user?.id) {
        const cloudData = await fetchCloudData(session.user.id);
        parsedData = mergeCloudData(localData, cloudData);
      }

      const today = new Date().toDateString();
      let needsSave = false;

      // Daily reset for routines
      if (parsedData.lastRoutineResetDate !== today) {
        parsedData.routineProgress = {};
        parsedData.completedRoutines = {};
        parsedData.lastRoutineResetDate = today;
        needsSave = true;
      }

      if (cancelled) return;
      setData(parsedData);
      
      if (needsSave || !raw || session?.user?.id) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      }

      if (session?.user?.id) {
        syncProfileToCloud(session.user.id, parsedData);
        parsedData.diaryNotes.forEach((note) => syncNoteToCloud(session.user.id, note));
        parsedData.secretDiaryNotes.forEach((note) => syncSecretNoteToCloud(session.user.id, note));
        Object.values(parsedData.diaryEntries).forEach((entry) =>
          syncEntryToCloud(session.user.id, entry),
        );
        parsedData.customRoutines.forEach((routine) =>
          syncRoutineToCloud(session.user.id, routine),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [STORAGE_KEY, session?.user?.id]);

  const save = useCallback(async (newData: AppData) => {
    setData(newData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    if (userId !== "local") {
      const syncedData = await syncProfileToCloud(userId, newData);
      if (syncedData) {
        setData(syncedData);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));
      } else {
        showSyncFailure("Changes");
      }
    }
  }, [STORAGE_KEY, showSyncFailure, userId]);

  const updateProfile = useCallback(
    async (name: string, photo: string | null) => {
      await save({
        ...data,
        profileName: name,
        profilePhoto: photo,
        profilePhotoStoragePath: photo === data.profilePhoto ? data.profilePhotoStoragePath : null,
      });
    },
    [data, save]
  );

  const setFavoriteRoutine = useCallback(
    async (routineId: string | null) => {
      await save({ ...data, favoriteRoutineId: routineId });
    },
    [data, save]
  );

  const updateVisionBoard = useCallback(
    async (imageUri: string | null, mode: VisionBoardMode = data.visionBoardMode ?? "square") => {
      await save({
        ...data,
        visionBoardImage: imageUri,
        visionBoardMode: mode,
        visionBoardStoragePath: imageUri === data.visionBoardImage ? data.visionBoardStoragePath : null,
      });
    },
    [data, save]
  );

  const toggleRoutineStep = useCallback(
    async (routineId: string, stepId: string) => {
      const today = new Date().toDateString();
      let currentData = data;

      if (currentData.lastRoutineResetDate !== today) {
        currentData = {
          ...currentData,
          routineProgress: {},
          completedRoutines: {},
          lastRoutineResetDate: today,
        };
      }

      const prev = currentData.routineProgress[routineId] ?? {};
      const updated: AppData = {
        ...currentData,
        routineProgress: {
          ...currentData.routineProgress,
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
      const done = Math.min(Object.values(steps).filter(Boolean).length, totalSteps);
      return Math.round((done / totalSteps) * 100);
    },
    [data]
  );

  const completeRoutine = useCallback(
    async (routineId: string) => {
      const today = new Date().toDateString();
      let currentData = data;

      if (currentData.lastRoutineResetDate !== today) {
        currentData = {
          ...currentData,
          routineProgress: {},
          completedRoutines: {},
          lastRoutineResetDate: today,
        };
      }

      if (currentData.completedRoutines?.[routineId]) return;

      const isNewDay = currentData.lastStreakDate !== today;
      const wasYesterday =
        currentData.lastStreakDate ===
        new Date(Date.now() - 86400000).toDateString();

      const newStreak = isNewDay
        ? wasYesterday || currentData.streak === 0
          ? currentData.streak + 1
          : 1
        : currentData.streak;

      await save({
        ...currentData,
        streak: newStreak,
        lastStreakDate: today,
        totalRoutinesCompleted: currentData.totalRoutinesCompleted + 1,
        completedRoutines: {
          ...(currentData.completedRoutines ?? {}),
          [routineId]: true,
        },
      });
    },
    [data, save]
  );

  const isRoutineCompleted = useCallback(
    (routineId: string) => data.completedRoutines?.[routineId] ?? false,
    [data],
  );

  const startGlowUpPlan = useCallback(
    async (planId: string) => {
      const existingActiveIds =
        data.glowUpProgress.activePlanIds ??
        (data.glowUpProgress.activePlanId ? [data.glowUpProgress.activePlanId] : []);
      const activePlanIds = existingActiveIds.includes(planId)
        ? existingActiveIds
        : [...existingActiveIds, planId];
      const now = new Date().toISOString();

      await save({
        ...data,
        glowUpProgress: {
          ...data.glowUpProgress,
          activePlanId: planId,
          activePlanIds,
          startDate: data.glowUpProgress.startDate ?? now,
          planStartDates: {
            ...(data.glowUpProgress.planStartDates ?? {}),
            [planId]: data.glowUpProgress.planStartDates?.[planId] ?? now,
          },
        },
      });
    },
    [data, save]
  );

  const deactivateGlowUpPlan = useCallback(
    async (planId: string) => {
      const existingActiveIds =
        data.glowUpProgress.activePlanIds ??
        (data.glowUpProgress.activePlanId ? [data.glowUpProgress.activePlanId] : []);
      const activePlanIds = existingActiveIds.filter((id) => id !== planId);
      const completedTasks = Object.fromEntries(
        Object.entries(data.glowUpProgress.completedTasks).filter(
          ([key]) => !key.startsWith(`${planId}_`),
        ),
      );
      const planStartDates = { ...(data.glowUpProgress.planStartDates ?? {}) };
      delete planStartDates[planId];

      await save({
        ...data,
        glowUpProgress: {
          ...data.glowUpProgress,
          activePlanId:
            data.glowUpProgress.activePlanId === planId
              ? activePlanIds[activePlanIds.length - 1] ?? null
              : data.glowUpProgress.activePlanId,
          activePlanIds,
          startDate: activePlanIds.length === 0 ? null : data.glowUpProgress.startDate,
          planStartDates,
          completedTasks,
        },
      });
    },
    [data, save],
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

  const getCurrentDay = useCallback((planId?: string) => {
    const startDate = planId
      ? data.glowUpProgress.planStartDates?.[planId] ?? data.glowUpProgress.startDate
      : data.glowUpProgress.startDate;
    if (!startDate) return 1;
    const start = new Date(startDate);
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
      const stampedEntry = { ...entry, updatedAt: Date.now() };
      await save({
        ...data,
        diaryEntries: { ...data.diaryEntries, [entry.id]: stampedEntry },
      });
      if (userId !== "local") {
        const ok = await syncEntryToCloud(userId, stampedEntry);
        if (!ok) showSyncFailure("Diary entry");
      }
    },
    [data, save, showSyncFailure, userId]
  );

  const deleteDiaryEntry = useCallback(
    async (dateKey: string) => {
      const updated = { ...data.diaryEntries };
      delete updated[dateKey];
      await save({ ...data, diaryEntries: updated });
      if (userId !== "local") {
        const ok = await deleteEntryFromCloud(userId, dateKey);
        if (!ok) showSyncFailure("Diary entry deletion");
      }
    },
    [data, save, showSyncFailure, userId]
  );

  const saveNote = useCallback(
    async (note: DiaryNote) => {
      const stampedNote = { ...note, updatedAt: Date.now() };
      const existing = data.diaryNotes ?? [];
      const next = existing.some((n) => n.id === stampedNote.id)
        ? existing.map((n) => (n.id === stampedNote.id ? stampedNote : n))
        : [...existing, stampedNote];
      const nextData = { ...data, diaryNotes: next };
      await save(nextData);
      if (userId !== "local") {
        const syncedNote = await syncNoteToCloud(userId, stampedNote);
        if (syncedNote) {
          const syncedData = {
            ...nextData,
            diaryNotes: next.map((n) => (n.id === syncedNote.id ? syncedNote : n)),
          };
          setData(syncedData);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));
        } else {
          showSyncFailure("Diary note");
        }
      }
    },
    [STORAGE_KEY, data, save, showSyncFailure, userId]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      const updated = (data.diaryNotes ?? []).filter((n) => n.id !== noteId);
      await save({ ...data, diaryNotes: updated });
      if (userId !== "local") deleteNoteFromCloud(userId, noteId);
    },
    [data, save, userId]
  );

  const updateNote = useCallback(
    async (noteId: string, text: string, color: string, richContent?: RichBlock[], title?: string) => {
      const updatedNoteInfo = { text, color, title, updatedAt: Date.now(), ...(richContent ? { richContent } : {}) };
      const updated = (data.diaryNotes ?? []).map((n) =>
        n.id === noteId ? { ...n, ...updatedNoteInfo } : n
      );
      const nextData = { ...data, diaryNotes: updated };
      await save(nextData);
      const fullNote = updated.find(n => n.id === noteId);
      if (userId !== "local" && fullNote) {
        const syncedNote = await syncNoteToCloud(userId, fullNote);
        if (syncedNote) {
          const syncedData = {
            ...nextData,
            diaryNotes: updated.map((n) => (n.id === syncedNote.id ? syncedNote : n)),
          };
          setData(syncedData);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));
        } else {
          showSyncFailure("Diary note");
        }
      }
    },
    [STORAGE_KEY, data, save, showSyncFailure, userId]
  );

  const setSecretDiaryPin = useCallback(
    async (pin: string) => {
      await save({
        ...data,
        secretDiaryPin: pin,
        secretDiaryEnabled: true,
      });
    },
    [data, save],
  );

  const clearSecretDiaryPin = useCallback(
    async () => {
      await save({
        ...data,
        secretDiaryPin: null,
        secretDiaryEnabled: false,
      });
    },
    [data, save],
  );

  const saveSecretNote = useCallback(
    async (note: DiaryNote) => {
      const stampedNote = { ...note, updatedAt: Date.now() };
      const existing = data.secretDiaryNotes ?? [];
      const next = existing.some((n) => n.id === stampedNote.id)
        ? existing.map((n) => (n.id === stampedNote.id ? stampedNote : n))
        : [...existing, stampedNote];
      const nextData = { ...data, secretDiaryNotes: next };
      await save(nextData);
      if (userId !== "local") {
        const syncedNote = await syncSecretNoteToCloud(userId, stampedNote);
        if (syncedNote) {
          const syncedData = {
            ...nextData,
            secretDiaryNotes: next.map((n) => (n.id === syncedNote.id ? syncedNote : n)),
          };
          setData(syncedData);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));
        } else {
          showSyncFailure("Private note");
        }
      }
    },
    [STORAGE_KEY, data, save, showSyncFailure, userId],
  );

  const deleteSecretNote = useCallback(
    async (noteId: string) => {
      const updated = (data.secretDiaryNotes ?? []).filter((n) => n.id !== noteId);
      await save({ ...data, secretDiaryNotes: updated });
      if (userId !== "local") deleteSecretNoteFromCloud(userId, noteId);
    },
    [data, save, userId],
  );

  const updateSecretNote = useCallback(
    async (noteId: string, text: string, color: string, richContent?: RichBlock[], title?: string) => {
      const updatedNoteInfo = { text, color, title, updatedAt: Date.now(), ...(richContent ? { richContent } : {}) };
      const updated = (data.secretDiaryNotes ?? []).map((n) =>
        n.id === noteId ? { ...n, ...updatedNoteInfo } : n
      );
      const nextData = { ...data, secretDiaryNotes: updated };
      await save(nextData);
      const fullNote = updated.find(n => n.id === noteId);
      if (userId !== "local" && fullNote) {
        const syncedNote = await syncSecretNoteToCloud(userId, fullNote);
        if (syncedNote) {
          const syncedData = {
            ...nextData,
            secretDiaryNotes: updated.map((n) => (n.id === syncedNote.id ? syncedNote : n)),
          };
          setData(syncedData);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));
        } else {
          showSyncFailure("Private note");
        }
      }
    },
    [STORAGE_KEY, data, save, showSyncFailure, userId],
  );

  const saveUserRoutine = useCallback(
    async (routine: RoutineTemplate) => {
      const existing = data.customRoutines ?? [];
      const next = existing.some((item) => item.id === routine.id)
        ? existing.map((item) => (item.id === routine.id ? routine : item))
        : [...existing, routine];
      await save({ ...data, customRoutines: next });
      if (userId !== "local") {
        const ok = await syncRoutineToCloud(userId, routine);
        if (!ok) showSyncFailure("Custom routine");
      }
    },
    [data, save, showSyncFailure, userId]
  );

  const deleteUserRoutine = useCallback(
    async (routineId: string) => {
      const customRoutines = (data.customRoutines ?? []).filter((routine) => routine.id !== routineId);
      const routineProgress = { ...data.routineProgress };
      const completedRoutines = { ...(data.completedRoutines ?? {}) };
      const templateIds = new Set(ROUTINE_TEMPLATES.map((routine) => routine.id));
      delete routineProgress[routineId];
      delete completedRoutines[routineId];
      await save({
        ...data,
        customRoutines,
        routineProgress,
        completedRoutines,
        favoriteRoutineId:
          data.favoriteRoutineId === routineId && !templateIds.has(routineId)
            ? null
            : data.favoriteRoutineId,
      });
      if (userId !== "local") {
        const ok = await deleteRoutineFromCloud(userId, routineId);
        if (!ok) showSyncFailure("Custom routine deletion");
      }
    },
    [data, save, showSyncFailure, userId]
  );

  const clearData = useCallback(async () => {
    const initial = { ...DEFAULT_DATA, lastRoutineResetDate: new Date().toDateString() };
    setData(initial);
    // Note: We no longer delete from AsyncStorage here so we don't lose the user's data!
    // We just clear the local React memory so the app feels fresh until they log back in.
  }, []);

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
        setSecretDiaryPin,
        clearSecretDiaryPin,
        saveSecretNote,
        deleteSecretNote,
        updateSecretNote,
        saveUserRoutine,
        deleteUserRoutine,
        setFavoriteRoutine,
        updateVisionBoard,
        toggleRoutineStep,
        isStepCompleted,
        getRoutineCompletionPercent,
        completeRoutine,
        isRoutineCompleted,
        startGlowUpPlan,
        deactivateGlowUpPlan,
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
        clearData,
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
