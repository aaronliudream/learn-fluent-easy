import { supabase } from "@/integrations/supabase/client";
import { loadProgressForCodes } from "@/lib/juniorGrammarUnits";

/**
 * 单元综合 完成度/掌握度(第一步:词汇 + 语法,这两块有单元归属)。
 * - 词汇:done=有 junior_word_mastery 记录(做过);mastered=mastery_level≥3(与初中板块总览 useMasteryOverview 同口径)。
 * - 语法:复用 loadProgressForCodes(按题:done=做过,mastered=累计答对2次),与语法专项页/第4关同源。
 * 听力/阅读暂不计入(题库无 volume/unit 归属,见第二步)。
 */

export type UnitOverall = { done: number; mastered: number; total: number };
export const VOCAB_MASTER_LEVEL = 3;

export async function loadUnitVocabProgress(wordIds: string[]): Promise<UnitOverall> {
  const total = wordIds.length;
  if (!total) return { done: 0, mastered: 0, total: 0 };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { done: 0, mastered: 0, total };
  let done = 0;
  let mastered = 0;
  for (let i = 0; i < wordIds.length; i += 200) {
    const slice = wordIds.slice(i, i + 200);
    const { data } = await supabase
      .from("junior_word_mastery")
      .select("word_id,mastery_level")
      .eq("user_id", user.id)
      .in("word_id", slice);
    for (const r of (data ?? []) as { word_id: string; mastery_level: number }[]) {
      done++;
      if ((r.mastery_level ?? 0) >= VOCAB_MASTER_LEVEL) mastered++;
    }
  }
  return { done, mastered, total };
}

export type UnitOverallBreakdown = {
  vocab: UnitOverall;
  grammar: UnitOverall;
  combined: UnitOverall;
};

export async function loadUnitOverall(opts: {
  wordIds: string[];
  grammarCodes: string[];
}): Promise<UnitOverallBreakdown> {
  const [vocab, g] = await Promise.all([
    loadUnitVocabProgress(opts.wordIds),
    loadProgressForCodes(opts.grammarCodes ?? []),
  ]);
  const grammar: UnitOverall = { done: g.done, mastered: g.mastered, total: g.total };
  const combined: UnitOverall = {
    done: vocab.done + grammar.done,
    mastered: vocab.mastered + grammar.mastered,
    total: vocab.total + grammar.total,
  };
  return { vocab, grammar, combined };
}

export const pctOf = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
