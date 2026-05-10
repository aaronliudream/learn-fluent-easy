import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticInsights {
  summary: string;
  insights: string[];
  expected_gain: number;
  weak_modules: string[];
  source: "cache" | "ai" | "template";
}

/**
 * Fetch (and lazily generate) the AI diagnostic for the signed-in user.
 * Backed by `generate-diagnostic` Edge Function with 24h cache + template fallback.
 */
export function useDiagnostic(autoFetch = true) {
  const [data, setData] = useState<DiagnosticInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setData(null);
        return;
      }
      const { data: res, error: err } = await supabase.functions.invoke("generate-diagnostic", {
        body: { force },
      });
      if (err) throw err;
      setData(res as DiagnosticInsights);
    } catch (e: any) {
      setError(e?.message || "diagnostic_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (autoFetch) refresh(false); }, [autoFetch, refresh]);

  return { data, loading, error, refresh };
}