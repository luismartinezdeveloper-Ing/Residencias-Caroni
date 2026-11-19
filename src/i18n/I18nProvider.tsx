import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { MESSAGES, SupportedLocale } from './messages';

const LOCALE_STORAGE_KEY = 'caroni_locale';

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'es',
  setLocale: () => {},
  toggleLocale: () => {},
});

function readStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'en' || saved === 'es') {
      return saved;
    }
  } catch {
    // Ignorar errores de acceso a localStorage en contextos restringidos
  }
  return 'es';
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(readStoredLocale);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        // No-op seguro
      }
    }
  }, [locale]);

  const setLocale = (next: SupportedLocale) => {
    setLocaleState(next);
  };

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, toggleLocale }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>
      <IntlProvider locale={locale} defaultLocale="es" messages={MESSAGES[locale]}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
