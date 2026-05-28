/**
 * 《英语闯关》强化训练 — 调 fc-strengthen-questions edge function 拿题
 *
 * 输入: 用户错题 (本地 LS) → 聚合为弱项标签 + 小样本 → POST edge function
 * 输出: 服务端校验过的 5 道 FCQuestion (混合题型, 不含 reading_judge_TF)
 *
 * 调用模式与 speak.ts 的 TTS 一致 (直 fetch + supabase session header)。
 */

import { supabase } from "@/integrations/supabase/client";
import type { FCQuestion } from "./types";
import {
  getMistakes,
  groupByVocabDomain,
  groupByGrammarPoint,
} from "./mistakes";

const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fc-strengthen-questions`;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface StrengthenResult {
  ok: true;
  questions: FCQuestion[];
  warnings: string[];
}
export interface StrengthenError {
  ok: false;
  /** kind: rate_limited / no_mistakes / ai_failed / network / server */
  kind: "rate_limited" | "no_mistakes" | "ai_failed" | "network" | "server";
  message: string;
}

/** 把高频 vocab_domain / grammar_point 提到前 N. */
function topNTags(
  groups: Record<string, unknown[]>,
  n: number,
): string[] {
  return Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, n)
    .map(([k]) => k);
}

/**
 * 生成 5 道强化训练题。
 *
 * - 用户至少要有 1 条错题 (否则没素材给 AI 命中)
 * - rate limit 由 edge function 服务端节制 (1 分钟 20 次)
 */
export async function fetchStrengthenQuestions(
  userId: string | null | undefined,
  grade: number,
  count = 5,
): Promise<StrengthenResult | StrengthenError> {
  const mistakes = getMistakes(userId, grade);
  if (mistakes.length === 0) {
    return {
      ok: false,
      kind: "no_mistakes",
      message: "还没有错题数据。先去关卡里答几道题, 答错的我帮你记住, 然后再来强化训练。",
    };
  }

  const weak_vocab_domains = topNTags(groupByVocabDomain(mistakes), 5);
  const weak_grammar_points = topNTags(groupByGrammarPoint(mistakes), 5);

  // 取最近 3 条错题作样本 (含 stem + correctText + questionType)
  const recent = mistakes
    .slice(-3)
    .map((m) => ({
      stem: m.stem,
      correctText: m.correctText,
      questionType: m.questionType,
    }));

  // 复用 TTS 模式: supabase session 鉴权头
  let token = SUPABASE_ANON;
  try {
    const session = (await supabase.auth.getSession()).data.session;
    if (session?.access_token) token = session.access_token;
  } catch {
    /* fall through */
  }

  try {
    const res = await fetch(SUPABASE_FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        grade,
        weak_vocab_domains,
        weak_grammar_points,
        recent_mistakes_sample: recent,
        count,
      }),
    });

    if (res.status === 429) {
      const j = await res.json().catch(() => ({}));
      return {
        ok: false,
        kind: "rate_limited",
        message: j?.message || "出题太频繁啦, 歇一会再试。",
      };
    }
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return {
        ok: false,
        kind: "ai_failed",
        message: j?.message || `服务器报错 (${res.status})`,
      };
    }
    const j = await res.json();
    if (!Array.isArray(j?.questions) || j.questions.length === 0) {
      return {
        ok: false,
        kind: "ai_failed",
        message: "AI 这次没出出有效题, 再试一次试试。",
      };
    }
    return {
      ok: true,
      questions: j.questions as FCQuestion[],
      warnings: Array.isArray(j.warnings) ? j.warnings : [],
    };
  } catch (e) {
    return {
      ok: false,
      kind: "network",
      message: "网络不行, 检查一下连接再试。",
    };
  }
}
