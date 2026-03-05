"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, getCategoryTranslationKey, type LangCode } from "@/data/translations";

const STORAGE_KEY = "onmart-language";

type LanguageContextValue = {
  language: LangCode;
  setLanguage: (code: LangCode) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && stored in translations) {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((code: LangCode) => {
    setLanguageState(code);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (!mounted) return key;
      const map = translations[language];
      return map[key] ?? translations.en[key] ?? key;
    },
    [language, mounted]
  );
  const value: LanguageContextValue = { language, setLanguage, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useCategoryName(slug: string): string {
  const { t } = useLanguage();
  const key = getCategoryTranslationKey(slug);
  const translated = t(key);
  return translated !== key ? translated : slug;
}
