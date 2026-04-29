import { useI18n } from "./I18nProvider";

/**
 * Wrap any source-language text (Chinese in our case) so it gets translated
 * to the user's chosen language on demand and cached in localStorage.
 * Returns the source text unchanged for Chinese / English users (zero cost).
 * Re-renders automatically when async translations land.
 */
export function T({ children }: { children: string | undefined | null }) {
  const { tDynamic } = useI18n();
  if (!children) return null;
  return <>{tDynamic(String(children))}</>;
}

/** Hook variant for cases where you can't render a JSX child (e.g. attributes,
 *  toast() arguments, document.title). */
export function useT() {
  const { tDynamic } = useI18n();
  return tDynamic;
}