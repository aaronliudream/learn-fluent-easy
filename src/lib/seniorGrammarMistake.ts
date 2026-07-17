import { supabase } from "@/integrations/supabase/client";
import { bumpMistakeCorrect } from "@/lib/mistakeStreak";
import type { GrammarQuestion, AnswerResult } from "@/components/grammar/GrammarQuestionCard";

/**
 * 高中新体系(必修一二三)语法错题写入 —— 单题自包含快照。
 *
 * 复用初中阅读/完形那套「客户端直写 user_mistakes」的现成模式:
 *  - 做错  → upsert 一行(module='senior_grammar', source_key='grammar:<题目uuid>'),
 *           snapshot 存【全部选项 A/B/C/D】+ 题干/学生所选/正确答案/解析,
 *           这样 /mistakes 与老师端都能显示整题含全部选项。
 *  - 做对  → 若之前有该题错题,按同一 source_key 标 is_resolved=true(自动移出错题本)。
 *
 * 铁律:纯新增写入,不碰判分;整段 try/catch,失败只 console.warn,绝不阻断做题;
 *       只对以后生效(历史记录不动)。不经 edge,不需要 deploy。
 *
 * 四个语法专项入口共用(JuniorGrammarMastery / GaokaoGrammarMastery /
 * GaokaoUnitGrammarTest / JuniorKpPractice),因为它们判分结构一致、题源同表。
 */
export async function recordSeniorGrammarMistake(params: {
  question: GrammarQuestion;
  result: AnswerResult;
  isCorrect: boolean;
  sourceLabel?: string | null;
}): Promise<void> {
  try {
    const { question: q, result, isCorrect, sourceLabel } = params;
    if (!q?.id) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const sourceKey = `grammar:${q.id}`;

    // 做对 → 跨3天连对累计(若曾错过该题)。按 source_key 定位,和写入同一把钥匙。
    if (isCorrect) {
      await bumpMistakeCorrect("senior_grammar", sourceKey);
      return;
    }

    // 做错 → 存/覆盖单题快照(含全部选项 A/B/C/D)。
    const snapshot = {
      source: "senior_grammar",
      q_id: q.id,
      question_type: q.question_type ?? "mcq",
      stem: q.stem,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
      },
      correct_answer: q.correct_answer,
      user_answer: result.picked ?? null,
      explanation: q.explanation ?? null,
    };

    const { error } = await supabase.from("user_mistakes").upsert(
      {
        user_id: user.id,
        module: "senior_grammar",
        source_key: sourceKey,
        source_label: sourceLabel ?? null,
        question: q.stem ?? "",
        user_answer: result.picked ?? null,
        correct_answer: q.correct_answer,
        explanation: q.explanation ?? null,
        snapshot,
        is_resolved: false,
        correct_streak: 0,
        last_correct_date: null,
        last_wrong_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module,source_key" },
    );
    if (error) console.warn("[senior grammar mistake] upsert failed", error);
  } catch (e) {
    console.warn("[senior grammar mistake] write failed", e);
  }
}
