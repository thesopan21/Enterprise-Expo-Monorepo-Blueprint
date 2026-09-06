import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";

export const i18nInstance: I18nInstance = i18next.createInstance();

let initialized = false;

// Idempotent: the first call initializes i18next with the given locale;
// every later call just switches the active language if it changed.
// `initImmediate: false` makes init() resolve synchronously (no
// bundled-resource loading to wait on), so there's no flash of missing
// translations before the first render.
export function ensureI18nInitialized(locale: string): void {
  if (!initialized) {
    initialized = true;
    void i18nInstance.use(initReactI18next).init({
      resources: { en: { translation: en } },
      lng: locale,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      initImmediate: false,
    });
    return;
  }

  if (i18nInstance.language !== locale) {
    void i18nInstance.changeLanguage(locale);
  }
}
