import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isWordMastered, pctOf } from "@/lib/juniorHub/unitOverallProgress";
import {
  loadGrammarQuestionMastery,
  computeGrammarProgress,
} from "@/lib/juniorGrammarQuestionMastery";
import type { UnitDef } from "@/lib/juniorHub/types";

export type UnitMasteryMap = Record<string, { mastered: number; total: number; pct: number }>;

/**
 * 册页每张单元卡的「掌握度」——**整册一次批量拉取**,不是逐卡查询。
 *
 * ★为什么必须批量★ 册页一屏 6–14 张单元卡,逐卡查就是 12–28 次往返,
 * 首屏会肉眼可见地卡。这里固定 4–5 次查询,与单元数无关:
 *   ① junior_vocab:整册词表(id, unit)一次拿全
 *   ② junior_word_mastery:全部 word_id 分片查(每片 200)
 *   ③ junior_grammar_points:全部 code → (id, code) 一次
 *   ④ junior_grammar_questions:全部 point_id 分片查
 *   ⑤ junior_user_mastery:走 loadGrammarQuestionMastery(内部已分片)
 *
 * ★口径与单元内页完全一致★ 词汇走 isWordMastered(全站唯一判定处),
 * 语法走 computeGrammarProgress —— 两者都是单元页用的同一个函数,不另写一套。
 *
 * 未登录 / 无数据 → 返回空 map,调用方不渲染(而不是显示假的 0%)。
 */
export function useSemesterMastery(
  units: UnitDef[] | undefined,
  grade: number,
  publisher?: string | null,
): UnitMasteryMap {
  const [map, setMap] = useState<UnitMasteryMap>({});
  const key = (units ?? []).map((u) => u.id).join(",");

  useEffect(() => {
    let cancelled = false;
    const list = units ?? [];
    if (!list.length) {
      setMap({});
      return;
    }
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      // ── 词汇:整册词表 → 每单元 word_id ──
      const byUnitWords: Record<string, string[]> = {};
      const books = [...new Set(list.map((u) => u.book))];
      for (const book of books) {
        let q = supabase
          .from("junior_vocab")
          .select("id,unit")
          .eq("grade", grade)
          .eq("volume", book);
        if (publisher) q = q.eq("publisher", publisher);
        const { data } = await q;
        if (cancelled) return;
        for (const r of (data ?? []) as { id: string; unit: string }[]) {
          const unit = list.find((u) => u.book === book && u.unitKey === r.unit);
          if (!unit) continue;
          (byUnitWords[unit.id] ||= []).push(r.id);
        }
      }
      const allWordIds = Object.values(byUnitWords).flat();
      const masteredWords = new Set<string>();
      for (let i = 0; i < allWordIds.length; i += 200) {
        const slice = allWordIds.slice(i, i + 200);
        const { data } = await supabase
          .from("junior_word_mastery")
          .select("word_id,quiz_consec,match_consec,spell_consec,bento_consec,context_consec,listen_correct,cloze_correct")
          .eq("user_id", user.id)
          .in("word_id", slice);
        if (cancelled) return;
        for (const r of (data ?? []) as Record<string, never>[]) {
          if (isWordMastered(r as unknown as Record<string, number>)) {
            masteredWords.add((r as unknown as { word_id: string }).word_id);
          }
        }
      }

      // ── 语法:整册 code → point → question,再一次性查题级掌握 ──
      const codeToUnit: Record<string, string> = {};
      for (const u of list) for (const c of u.grammarCodes ?? []) codeToUnit[c] = u.id;
      const allCodes = Object.keys(codeToUnit);
      const byUnitQids: Record<string, string[]> = {};
      if (allCodes.length) {
        let pq = supabase.from("junior_grammar_points").select("id,code").in("code", allCodes);
        if (publisher) pq = pq.eq("publisher", publisher);
        const { data: pts } = await pq;
        if (cancelled) return;
        const pointToUnit: Record<string, string> = {};
        for (const p of (pts ?? []) as { id: string; code: string }[]) {
          const unitId = codeToUnit[p.code];
          if (unitId) pointToUnit[p.id] = unitId;
        }
        const pointIds = Object.keys(pointToUnit);
        for (let i = 0; i < pointIds.length; i += 100) {
          const slice = pointIds.slice(i, i + 100);
          const { data } = await supabase
            .from("junior_grammar_questions")
            .select("id,point_id")
            .in("point_id", slice);
          if (cancelled) return;
          for (const q of (data ?? []) as { id: string; point_id: string }[]) {
            const unitId = pointToUnit[q.point_id];
            if (unitId) (byUnitQids[unitId] ||= []).push(q.id);
          }
        }
      }
      const allQids = Object.values(byUnitQids).flat();
      const qMastery = await loadGrammarQuestionMastery(allQids);
      if (cancelled) return;

      // ── 合并:与单元内页同口径(词汇 + 语法)──
      const out: UnitMasteryMap = {};
      for (const u of list) {
        const wordIds = byUnitWords[u.id] ?? [];
        const qids = byUnitQids[u.id] ?? [];
        const g = computeGrammarProgress(qids, qMastery);
        const total = wordIds.length + g.total;
        if (total <= 0) continue;
        const mastered = wordIds.filter((id) => masteredWords.has(id)).length + g.mastered;
        out[u.id] = { mastered, total, pct: pctOf(mastered, total) };
      }
      if (!cancelled) setMap(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [key, grade, publisher]); // eslint-disable-line react-hooks/exhaustive-deps

  return map;
}

export default useSemesterMastery;
