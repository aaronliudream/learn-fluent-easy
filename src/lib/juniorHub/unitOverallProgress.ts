import { supabase } from "@/integrations/supabase/client";
import { loadProgressForCodes } from "@/lib/juniorGrammarUnits";

/**
 * 单元综合 完成度/掌握度(第一步:词汇 + 语法,这两块有单元归属)。
 * - 词汇:done=有 junior_word_mastery 记录(做过);mastered=任一游戏 consec≥2(答对2次=掌握,全站统一 MASTER_STREAK)。
 *   绿环(完成度)单独走浏览进度(browsedWordCount/vocabGroup),不用本函数的 done。
 * - 语法:复用 loadProgressForCodes(按题:done=做过,mastered=累计答对2次),与语法专项页/第4关同源。
 * 听力/阅读暂不计入(题库无 volume/unit 归属,见第二步)。
 */

export type UnitOverall = { done: number; mastered: number; total: number };
export const VOCAB_MASTER_LEVEL = 3; // (旧口径,保留备查)
export const VOCAB_MASTER_STREAK = 2; // 答对2次=掌握(全站统一,= useJuniorVocabMastery.MASTER_STREAK)

/**
 * 核心词汇关「完成度环」口径(初中+高中统一):绿环=浏览进度(看了多少词),非"做过题"。
 * vocabGroup = 已看到的最后一组下标(单调不回退,存 junior_hub_progress.state);每组 12 词。
 * 掌握度(橙环)仍走游戏掌握(loadUnitVocabProgress.mastered = mastery_level≥3),与本函数无关。
 * ⚠️ 纯展示口径,不写任何数据 → 不影响学生进度数据。
 */
export const VOCAB_GROUP_SIZE = 12;
export function browsedWordCount(vocabGroup: number | null | undefined, total: number): number {
  if (!total || vocabGroup == null) return 0;
  return Math.min((vocabGroup + 1) * VOCAB_GROUP_SIZE, total);
}

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
      .select("word_id,quiz_consec,match_consec,spell_consec,bento_consec,context_consec")
      .eq("user_id", user.id)
      .in("word_id", slice);
    for (const r of (data ?? []) as Record<string, number>[]) {
      done++; // 做过(有记录)
      // 掌握度(橙环)= 全站"答对2次=掌握"口径:任一游戏 consec≥2(MASTER_STREAK,见 useJuniorVocabMastery)。
      const maxConsec = Math.max(
        r.quiz_consec ?? 0, r.match_consec ?? 0, r.spell_consec ?? 0, r.bento_consec ?? 0, r.context_consec ?? 0,
      );
      if (maxConsec >= VOCAB_MASTER_STREAK) mastered++;
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
