'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lang } from './translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
});

function writeCookie(lang: Lang) {
  document.cookie = `me_lang=${lang};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageProvider({ children, initialLang = 'es' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

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
