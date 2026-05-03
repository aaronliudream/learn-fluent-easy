import { forwardRef } from "react";
import { useI18n } from "./I18nProvider";
import { reportRenderedText } from "./devLeakDetector";
import { useBilingualMode } from "./bilingualMode";
import type { StringKey } from "./strings";

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
  return (text: string) => {
    const out = tDynamic(text);
    reportRenderedText(out, lang);
    return out;
  };
}

/**
 * Bilingual dynamic-text component. On bilingual routes (/primary, /junior,
 * /gaokao, /china), renders English (主) + user-language (副) stacked.
 * Outside bilingual routes, behaves identically to <T>.
 * If user language IS English, falls back to single English line.
 */
export const TBi = forwardRef<unknown, {
  children: string | undefined | null;
  /** Layout: "stack" (default, two lines) | "inline" (slash-separated). */
  layout?: "stack" | "inline";
  className?: string;
}>(function TBi({ children, layout = "stack", className }, _ref) {
  const { tDynamic, tDynamicEn, lang } = useI18n();
  const bilingual = useBilingualMode();
  if (!children) return null;
  const src = String(children);
  const userLine = tDynamic(src);
  reportRenderedText(userLine, lang);
  // Not bilingual route, or user lang is English → single line.
  if (!bilingual || lang === "en") return <>{userLine}</>;
  const enLine = tDynamicEn(src);
  if (!enLine || enLine === userLine) return <>{userLine}</>;
  if (layout === "inline") {
    return <span className={className}>{enLine} / {userLine}</span>;
  }
  return (
    <span className={className ? className : "inline-flex flex-col leading-tight"}>
      <span>{enLine}</span>
      <span className="text-[0.78em] font-normal opacity-70">{userLine}</span>
    </span>
  );
});

/**
 * Bilingual static-key component. Replaces `{t("key")}` in JSX where
 * bilingual rendering is desired. Outside bilingual routes (or for English
 * users), renders just the user-language string.
 */
export function TKey({ k, vars, layout = "stack", className }: {
  k: StringKey;
  vars?: Record<string, string | number>;
  layout?: "stack" | "inline";
  className?: string;
}) {
  const { t, tEn, lang } = useI18n();
  const bilingual = useBilingualMode();
  const userLine = t(k, vars);
  if (!bilingual || lang === "en") return <>{userLine}</>;
  const enLine = tEn(k, vars);
  if (!enLine || enLine === userLine) return <>{userLine}</>;
  if (layout === "inline") {
    return <span className={className}>{enLine} / {userLine}</span>;
  }
  return (
    <span className={className ? className : "inline-flex flex-col leading-tight"}>
      <span>{enLine}</span>
      <span className="text-[0.78em] font-normal opacity-70">{userLine}</span>
    </span>
  );
}