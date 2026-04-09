"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Language, Translations } from "./types";
import { LANGUAGES } from "./types";

const STORAGE_KEY = "syllabi_lang";
const DEFAULT_LANG: Language = "en";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
});

// Lazy-load locale bundles to keep initial JS small
const localeLoaders: Record<Language, () => Promise<{ default: Translations }>> = {
  en: () => import("./locales/en"),
  es: () => import("./locales/es"),
  pt: () => import("./locales/pt"),
  fr: () => import("./locales/fr"),
  de: () => import("./locales/de"),
  it: () => import("./locales/it"),
  nl: () => import("./locales/nl"),
  pl: () => import("./locales/pl"),
  ja: () => import("./locales/ja"),
  ko: () => import("./locales/ko"),
  zh: () => import("./locales/zh"),
  ar: () => import("./locales/ar"),
  hi: () => import("./locales/hi"),
  ru: () => import("./locales/ru"),
  tr: () => import("./locales/tr"),
  sv: () => import("./locales/sv"),
};

// Cache loaded translations in memory
const translationCache: Partial<Record<Language, Translations>> = {};

/** Resolve a dot-path like "nav.howItWorks" into a value */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur && typeof cur === "object") {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return path; // fallback: return key
    }
  }
  return typeof cur === "string" ? cur : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored && LANGUAGES.some((l) => l.code === stored) ? stored : DEFAULT_LANG;
  });
  const [translations, setTranslations] = useState<Translations | null>(null);

  // Load translations for a given language
  const loadTranslations = useCallback(async (l: Language) => {
    if (translationCache[l]) {
      setTranslations(translationCache[l]!);
      return;
    }
    try {
      const mod = await localeLoaders[l]();
      translationCache[l] = mod.default;
      setTranslations(mod.default);
    } catch {
      // Fallback to English
      if (l !== "en") {
        const mod = await localeLoaders["en"]();
        setTranslations(mod.default);
      }
    }
  }, []);

  // On mount: load translations for the initial language (resolved from localStorage in state init)
  useEffect(() => {
    loadTranslations(lang);
  }, [lang, loadTranslations]);

  // When lang changes: update dir + lang attribute on <html>
  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta?.rtl ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback(
    (l: Language) => {
      setLangState(l);
      localStorage.setItem(STORAGE_KEY, l);
      loadTranslations(l);
    },
    [loadTranslations]
  );

  const t = useCallback(
    (key: string): string => {
      if (!translations) return key;
      return getNestedValue(translations as unknown as Record<string, unknown>, key);
    },
    [translations]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t } = useContext(LanguageContext);
  return { t };
}
