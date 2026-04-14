'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from './translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
});

function readCookie(): Lang {
  if (typeof document === 'undefined') return 'es';
  const match = document.cookie.match(/(?:^|;\s*)me_lang=([^;]+)/);
  return match?.[1] === 'en' ? 'en' : 'es';
}

function writeCookie(lang: Lang) {
  document.cookie = `me_lang=${lang};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageProvider({ children, initialLang = 'es' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    // Sync with cookie on mount (handles cases where SSR and client disagree)
    setLangState(readCookie());
  }, []);

  function setLang(l: Lang) {
    writeCookie(l);
    setLangState(l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
