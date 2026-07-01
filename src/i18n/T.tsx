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
// forwardRef so parents like <Button asChild> or <Link> can
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
  /** Layout: "stack" (default, two lines) | "inline" (slash) | "compact" (副小灰一行). */
  layout?: "stack" | "inline" | "compact";
  className?: string;
}>(function TBi({ children, layout = "stack", className }, _ref) {
  const { tDynamic, tDynamicEn, lang } = useI18n();
  const bilingual = useBilingualMode();
  if (!children) return null;
  const src = String(children);
  // Chinese-student zone (/primary, /junior, /gaokao, /china):
  // ALWAYS render English + Chinese source, regardless of user language.
  // Never translate to German/Spanish/etc here.
  if (bilingual) {
    const enLine = tDynamicEn(src);
    reportRenderedText(src, "zh");
    if (!enLine || enLine === src) return <>{src}</>;
    return renderBilingual(enLine, src, layout, className);
  }
  const userLine = tDynamic(src);
  reportRenderedText(userLine, lang);
  return <>{userLine}</>;
});

function renderBilingual(enLine: string, zhLine: string, layout: "stack" | "inline" | "compact", className?: string) {
  if (layout === "inline") {
    return <span className={className}>{enLine} / {zhLine}</span>;
  }
  if (layout === "compact") {
    return (
      <span className={className ?? "inline-flex items-baseline gap-1.5"}>
        <span>{enLine}</span>
        <span className="text-[0.72em] font-normal opacity-60 truncate max-w-[10em]">{zhLine}</span>
      </span>
    );
  }
  return (
    <span className={className ?? "inline-flex flex-col leading-[1.15] gap-0.5 text-left"}>
      <span className="break-words">{enLine}</span>
      <span className="text-[0.72em] font-normal opacity-65 break-words">{zhLine}</span>
    </span>
  );
}

/**
 * Bilingual static-key component. Replaces `{t("key")}` in JSX where
 * bilingual rendering is desired. Outside bilingual routes (or for English
 * users), renders just the user-language string.
 */
export function TKey({ k, vars, layout = "stack", className }: {
  k: StringKey;
  vars?: Record<string, string | number>;
  layout?: "stack" | "inline" | "compact";
  className?: string;
}) {
  const { t, tEn, tZh } = useI18n();
  const bilingual = useBilingualMode();
  if (!bilingual) return <>{t(k, vars)}</>;
  // Chinese-student zone: force Chinese副 + English主, never user language.
  const enLine = tEn(k, vars);
  const zhLine = typeof tZh === "function" ? tZh(k, vars) : t(k, vars);
  if (!enLine || enLine === zhLine) return <>{zhLine}</>;
  return renderBilingual(enLine, zhLine, layout, className);
}

/**
 * Hook for attribute-only contexts (placeholder, aria-label, title, document.title)
 * that cannot accept JSX. Returns an EN/user-lang combined string when on a
 * bilingual route, otherwise just the user-language string.
 * Use the "inline" form (default) — placeholders shouldn't wrap.
 */
export function useTBi() {
  const { tDynamic, tDynamicEn, lang } = useI18n();
  const bilingual = useBilingualMode();
  return (text: string, opts?: { sep?: string }) => {
    if (!text) return text;
    if (!bilingual) return tDynamic(text);
    // Chinese-student zone: always EN / 中文, regardless of user language.
    const en = tDynamicEn(text);
    if (!en || en === text) return text;
    return `${en} ${opts?.sep ?? "/"} ${text}`;
  };
}

/**
 * Shorthand alias for <TBi>. Use <X>中文</X> in page sweeps to wrap
 * any source-language UI text. Identical behavior to <TBi>.
 * Example: <h1><X>中考语法专项</X></h1>
 */
export const X = TBi;