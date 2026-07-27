import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadUnitVocabProgress, combineUnitMastery } from "@/lib/juniorHub/unitOverallProgress";
import { loadProgressForCodes } from "@/lib/juniorGrammarUnits";
import type { UnitDef } from "@/lib/juniorHub/types";

/**
 * 单元级「掌握度」——供单元页顶部与「完成度」并列显示(初中 / 高中同源)。
 *
 * 为什么单独抽成 hook,而不是复用 StageList 里那两份 state:
 * 那两份在 StageList 内部(关卡行右侧的小圆圈用),而头部数字在外层 JuniorHubUnit 里,
 * 跨组件拿不到。把加载逻辑收在这里,两个 Hub 各调一次,口径不会分叉。
 *
 * ⚠️ 必须在调用方的任何 early-return **之前**调用 —— 它是 hook,条件调用会破坏 hooks 顺序。
 * 所以这里对 unit=null 做了内部短路,让调用方可以无条件调用它。
 * (2026-07-26 全站白屏就是一次「声明/调用顺序」事故,这里不重蹈。)
 *
 * 覆盖范围只有词汇 + 语法(有单元归属的两块),见 combineUnitMastery 的说明。
 */
export function useUnitMastery(unit: UnitDef | null, grade: number, publisher?: string | null) {
  const [result, setResult] = useState<{ mastered: number; total: number; pct: number } | null>(null);

  const unitId = unit?.id ?? "";
  const codesKey = (unit?.grammarCodes ?? []).join(",");

  // ★这里收到的必须已经是 DB 层的 publisher 值★
  //   初中 URL 层是 pep/fltrp,DB 列存历史值 junior/junior_fltrp(见 juniorHub/publisher.ts);
  //   高中是另一套命名空间。两条线共用本 hook,所以**不在这里做映射** —— 谁调用谁负责转换,
  //   否则用初中的映射去套高中的值,会把高中一并弄坏。
  const dbPub = publisher || null;

  useEffect(() => {
    let cancelled = false;
    if (!unit) {
      setResult(null);
      return;
    }
    (async () => {
      // 词汇:先取本单元词表 id,再查掌握(与关卡行的小圆圈同一函数,口径一致)
      let vocab: { mastered: number; total: number } | null = null;
      try {
        let q = supabase
          .from("junior_vocab")
          .select("id")
          .eq("grade", grade)
          .eq("volume", unit.book)
          .eq("unit", unit.unitKey);
        if (dbPub) q = q.eq("publisher", dbPub);
        const { data } = await q;
        const ids = (data ?? []).map((r: { id: string }) => r.id);
        if (ids.length) vocab = await loadUnitVocabProgress(ids);
      } catch {
        vocab = null;
      }
      // 语法:按题级(累计答对 2 次 = 掌握),与语法专项页 / 单元综合测试同源
      let grammar: { mastered: number; total: number } | null = null;
      const codes = unit.grammarCodes ?? [];
      if (codes.length) {
        try {
          grammar = await loadProgressForCodes(codes);
        } catch {
          grammar = null;
        }
      }
      if (!cancelled) setResult(combineUnitMastery(vocab, grammar));
    })();
    return () => {
      cancelled = true;
    };
  }, [unitId, codesKey, grade, dbPub]); // eslint-disable-line react-hooks/exhaustive-deps

  return result;
}

export default useUnitMastery;
