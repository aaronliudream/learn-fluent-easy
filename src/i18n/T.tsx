import { forwardRef } from "react";
import { useI18n } from "./I18nProvider";
import { reportRenderedText } from "./devLeakDetector";

/**
 * Wrap any source-language text (Chinese in our case) so it gets translated
 * to the user's chosen language on demand and cached in localStorage.
 * Returns the source text unchanged for Chinese / English users (zero cost).
 * Re-renders automatically when async translations land.
 */
// forwardRef so parents like <Button asChild>, <Link>, or AITalkDialog can
// pass a ref through without React warning. The ref is intentionally
// unused — <T> renders only a text node.
export const T = forwardRef<unknown, { children: string | undefined | null }>(
  function T({ children }, _ref) {
    const { tDynamic, lang } = useI18n();
    if (!children) return null;
    const out = tDynamic(String(children));
    reportRenderedText(out, lang);
    return <>{out}</>;
  },
);

/** Hook variant for cases where you can't render a JSX child (e.g. attributes,
 *  toast() arguments, document.title). */
export function useT() {
  const { tDynamic, lang } = useI18n();
  return (text: string, params?: Record<string, string | number>) => {
    const out = tDynamic(text, params);
    reportRenderedText(out, lang);
    return out;
  };
}