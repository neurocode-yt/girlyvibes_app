import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
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
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export async function getStoredLang(): Promise<Lang> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "ar") return stored;
  } catch {
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

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "ar" ? "en" : "ar";
      AsyncStorage.setItem(LANG_KEY, next);
      const isAr = next === "ar";
      I18nManager.allowRTL(isAr);
      I18nManager.forceRTL(isAr);
      return next;
    });
  }, []);

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
