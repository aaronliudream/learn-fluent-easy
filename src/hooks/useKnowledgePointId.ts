import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string>();

/** Resolve junior_knowledge_points.code → id for hub grammar-stage single-kp links. */
export function useKnowledgePointId(code: string | null | undefined): string | null {
  const [id, setId] = useState<string | null>(() => (code ? cache.get(code) ?? null : null));

  useEffect(() => {
    if (!code) {
      setId(null);
      return;
    }
    const hit = cache.get(code);
    if (hit) {
      setId(hit);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("junior_knowledge_points")
        .select("id")
        .eq("code", code)
        .maybeSingle();
      if (cancelled) return;
      if (data?.id) {
        cache.set(code, data.id);
        setId(data.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return id;
}
