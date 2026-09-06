import type { Storage } from "@workspace/storage";
import { useLocales } from "expo-localization";
import { createContext, useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";

import { ensureI18nInitialized, i18nInstance } from "./i18n";

const LOCALE_STORAGE_KEY = "i18n:locale";

export interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export interface LocaleProviderProps extends PropsWithChildren {
  // Injected, like createSessionManager's SecureStoreAdapter and
  // createAppStore's AxiosInstance — this package never imports a concrete
  // storage implementation itself, so it stays testable without native
  // modules and lets the app choose which @workspace/storage adapter to use.
  storage: Storage;
}

export function LocaleProvider({ storage, children }: LocaleProviderProps) {
  const deviceLocales = useLocales();

  const [locale, setLocaleState] = useState<string>(
    () => storage.get<string>(LOCALE_STORAGE_KEY) ?? deviceLocales[0].languageTag,
  );

  useMemo(() => {
    ensureI18nInitialized(locale);
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: string) => {
      storage.set(LOCALE_STORAGE_KEY, nextLocale);
      setLocaleState(nextLocale);
    },
    [storage],
  );

  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <I18nextProvider i18n={i18nInstance}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}
