import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TargetLanguage = "en" | "zh";

export const TARGET_LANGUAGES: { value: TargetLanguage; label: string; flag: string; native: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸", native: "English" },
  { value: "zh", label: "Chinese", flag: "🇨🇳", native: "中文 (HSK)" },
];

const STORAGE_KEY = "target_language";

export const readStoredTargetLanguage = (): TargetLanguage => {
  if (typeof window === "undefined") return "en";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
};

/**
 * Hook that tracks the current target language and provides a setter that
 * persists to both localStorage AND the user's profile (when signed in),
 * then reloads the page so the rest of the app picks up the new course
 * tree synchronously.
 */
export function useTargetLanguage() {
  const [language, setLanguageState] = useState<TargetLanguage>(readStoredTargetLanguage);

  useEffect(() => {
    // On mount, sync from profile if the user is signed in. If the profile
    // value differs from localStorage, prefer the profile (cross-device
    // continuity).
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data } = await supabase
          .from("profiles")
          .select("target_language")
          .eq("user_id", user.id)
          .maybeSingle();
        const remote = (data as { target_language?: string } | null)?.target_language;
        if (remote && (remote === "en" || remote === "zh") && remote !== language) {
          window.localStorage.setItem(STORAGE_KEY, remote);
          setLanguageState(remote);
        }
      } catch {
        /* silent */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = async (next: TargetLanguage, opts: { reload?: boolean } = {}) => {
    const reload = opts.reload ?? true;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch { /* noop */ }
    setLanguageState(next);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ target_language: next })
          .eq("user_id", user.id);
      }
    } catch { /* noop */ }
    if (reload && typeof window !== "undefined") {
      // Course tree is loaded at module init time, so reload is required
      // for the new structure to take effect everywhere.
      window.location.reload();
    }
  };

  return { language, setLanguage };
}
