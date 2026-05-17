import React, { createContext, useCallback, useContext, useState } from 'react';
import { translate } from '../data/i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('bs_lang') || 'ru'; } catch { return 'ru'; }
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('bs_lang', l); } catch {}
  }, []);

  const t = useCallback((key) => translate(key, lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
