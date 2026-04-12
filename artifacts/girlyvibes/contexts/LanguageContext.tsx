import AsyncStorage from "@react-native-async-storage/async-storage";
import { reloadAppAsync } from "expo";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { I18nManager } from "react-native";

import { AR, EN, Lang, Translations } from "@/constants/i18n";

const LANG_KEY = "girlyvibes_lang";

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  isRTL: boolean;
  l: (ar: string, en: string) => string;
  toggleLanguage: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export async function getStoredLang(): Promise<Lang> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "ar") return stored;
  } catch {
    // ignore
  }
  return "ar";
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    const isAr = lang === "ar";
    I18nManager.allowRTL(isAr);
    I18nManager.forceRTL(isAr);
  }, [lang]);

  const toggleLanguage = useCallback(async () => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    await AsyncStorage.setItem(LANG_KEY, next);
    const isAr = next === "ar";
    I18nManager.allowRTL(isAr);
    I18nManager.forceRTL(isAr);
    await reloadAppAsync();
  }, [lang]);

  const t = lang === "ar" ? AR : EN;
  const isRTL = lang === "ar";
  const l = useCallback(
    (ar: string, en: string) => (lang === "ar" ? ar : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, t, isRTL, l, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
