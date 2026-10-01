'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';
type Bi = { en: string; ar: string };

type UiCtx = {
  language: Language;
  theme: Theme;
  setLanguage: (v: Language) => void;
  setTheme: (v: Theme) => void;
  t: (item: Bi) => string;
  notify: (message: string) => void;
  toast: string;
};

const Ctx = createContext<UiCtx | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('light');
  const [toast, setToast] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLanguageState(read<Language>('noor-language', 'en'));
    setThemeState(read<Theme>('noor-theme', 'light'));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('noor-language', JSON.stringify(language));
    window.localStorage.setItem('noor-theme', JSON.stringify(theme));
  }, [language, theme, ready]);

  const setLanguage = useCallback((v: Language) => setLanguageState(v), []);
  const setTheme = useCallback((v: Theme) => setThemeState(v), []);
  const t = useCallback((item: Bi) => (language === 'ar' ? item.ar : item.en), [language]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2700);
  }, []);

  const value = useMemo(
    () => ({ language, theme, setLanguage, setTheme, t, notify, toast }),
    [language, theme, setLanguage, setTheme, t, notify, toast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUi() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUi must be used inside UiProvider');
  return ctx;
}
