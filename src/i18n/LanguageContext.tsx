import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';
import mrTranslations from '../locales/mr.json';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<SupportedLanguage, any> = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('nufews_lang');
      if (saved === 'hi' || saved === 'mr' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      // LocalStorage might be disabled in some iframe contexts
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('nufews_lang', lang);
    } catch (e) {}
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let currentObj: any = translations[language];
      let fallbackObj: any = translations.en;

      let value: any = currentObj;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

      // If translation missing in current language, try English fallback
      if (value === undefined) {
        let fVal: any = fallbackObj;
        for (const k of keys) {
          if (fVal && typeof fVal === 'object' && k in fVal) {
            fVal = fVal[k];
          } else {
            fVal = undefined;
            break;
          }
        }
        value = fVal;
      }

      if (typeof value !== 'string') {
        return key;
      }

      if (params) {
        let interpolated = value;
        for (const [pKey, pVal] of Object.entries(params)) {
          interpolated = interpolated.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        }
        return interpolated;
      }

      return value;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
