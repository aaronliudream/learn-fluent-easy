import { useEffect, useState } from "react";
import type { ContinuePick } from "@/hooks/useMasteryOverview";
import {
  fetchJuniorGrammarContinue,
  juniorGrammarContinueSyncHint,
} from "@/lib/juniorGrammarContinue";

/** Loads smart junior-grammar continue pick (revenge / today adventure / hub). */
export function useJuniorGrammarContinue(enabled: boolean) {
  const [pick, setPick] = useState<ContinuePick | null>(() =>
    enabled ? juniorGrammarContinueSyncHint() : null,
  );
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setPick(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchJuniorGrammarContinue()
      .then((p) => {
        if (!cancelled) setPick(p);
      })
      .catch(() => {
        if (!cancelled) setPick(juniorGrammarContinueSyncHint());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { pick, loading };
}
