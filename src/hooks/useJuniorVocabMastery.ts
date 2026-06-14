import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** 掌握门槛:某游戏某词连续答对达到此值 = 该游戏掌握(独立 per 游戏)。 */
export const MASTER_STREAK = 2;

export type VocabGameKind = "quiz" | "match" | "spell" | "bento" | "context";

export interface WordConsec {
  quiz: number;
  match: number;
  spell: number;
  bento: number;
  context: number;
}

export interface JuniorVocabMasteryState {
  loading: boolean;
  authed: boolean;
  /** word_id → 各游戏连对次数(无记录的词不在 map 内,视为 0)。 */
  consec: Map<string, WordConsec>;
  /** 重新拉取(做完一批后刷新)。 */
  reload: () => void;
}

/**
 * 读 junior_word_mastery,返回某年级各词的 per-游戏连对次数。
 * 词汇游戏共用:用于「取未掌握词」+「掌握进度 /608」。仅登录用户有数据。
 */
export function useJuniorVocabMastery(gradeNum: number): JuniorVocabMasteryState {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [consec, setConsec] = useState<Map<string, WordConsec>>(new Map());
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user || !gradeNum) {
        // 未登录,或调用方未启用(如高考便当不传 grade)→ 不查表
        setAuthed(false);
        setConsec(new Map());
        setLoading(false);
        return;
      }
      setAuthed(true);
      const map = new Map<string, WordConsec>();
      const PAGE = 1000;
      for (let from = 0; from < 5000; from += PAGE) {
        const { data, error } = await supabase
          .from("junior_word_mastery")
          .select("word_id,quiz_consec,match_consec,spell_consec,bento_consec,context_consec")
          .eq("user_id", user.id)
          .eq("grade", gradeNum)
          .range(from, from + PAGE - 1);
        if (error || !data || data.length === 0) break;
        for (const r of data as Record<string, unknown>[]) {
          map.set(String(r.word_id), {
            quiz: Number(r.quiz_consec ?? 0),
            match: Number(r.match_consec ?? 0),
            spell: Number(r.spell_consec ?? 0),
            bento: Number(r.bento_consec ?? 0),
            context: Number(r.context_consec ?? 0),
          });
        }
        if (data.length < PAGE) break;
      }
      if (cancelled) return;
      setConsec(map);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [gradeNum, version]);

  return { loading, authed, consec, reload };
}
