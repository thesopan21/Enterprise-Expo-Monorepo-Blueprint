import { useTranslation as useReactI18nextTranslation } from "react-i18next";

export type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

export interface UseTranslationResult {
  t: TranslateFn;
}

// Thin wrapper so app code only ever imports from @workspace/i18n, never
// react-i18next directly — keeps the underlying vendor swappable later
// without touching call sites (same boundary @workspace/analytics and
// @workspace/store draw around their own vendor choices).
export function useTranslation(): UseTranslationResult {
  const { t } = useReactI18nextTranslation();
  return { t: t as TranslateFn };
}
