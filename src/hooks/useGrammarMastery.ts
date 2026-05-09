import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GrammarPointRow {
  id: string;
  slug: string;
  stage: "primary" | "junior" | "gaokao";
  grade: string | null;
  category: string;
  name: string;
  sort_order: number;
}

export interface MasteryRow {
  point_id: string;
  score: number;
  attempts: number;
  correct: number;
  last_practiced_at: string | null;
}

export interface MergedPoint extends GrammarPointRow {
  score: number;
  attempts: number;
  correct: number;
  last_practiced_at: string | null;
}

export function useGrammarMastery(stage: "primary" | "junior" | "gaokao") {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<MergedPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id || null;
      if (cancelled) return;
      setSignedIn(!!uid);

      const { data: pts } = await supabase
        .from("grammar_points")
        .select("id, slug, stage, grade, category, name, sort_order")
        .eq("stage", stage)
        .order("sort_order");

      let masteryByPoint: Record<string, MasteryRow> = {};
      if (uid) {
        const { data: m } = await supabase
          .from("user_grammar_mastery")
          .select("point_id, score, attempts, correct, last_practiced_at")
          .eq("user_id", uid);
        for (const r of m || []) masteryByPoint[r.point_id] = r as MasteryRow;
      }

      const merged: MergedPoint[] = (pts || []).map((p) => {
        const m = masteryByPoint[p.id];
        return {
          ...(p as GrammarPointRow),
          score: m?.score ?? 0,
          attempts: m?.attempts ?? 0,
          correct: m?.correct ?? 0,
          last_practiced_at: m?.last_practiced_at ?? null,
        };
      });

      if (!cancelled) {
        setPoints(merged);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [stage]);

  return { signedIn, loading, points };
}