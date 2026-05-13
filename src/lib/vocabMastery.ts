/**
 * vocabMastery.ts — 5-step guided vocab progression
 *
 * Wraps the existing gaokao_user_mastery system (which both gaokao and junior
 * vocab pages already write to via bumpVocabMastery) and exposes a simple
 * "what step is this word at" API for the GuidedSession container.
 *
 * Steps (per word):
 *   0 → never seen      → flashcard
 *   1 → seen, no en2cn  → en2cn  (English → 中文 4 choice)
 *   2 → has en2cn       → cn2en  (中文 → English 4 choice)
 *   3 → has cn2en       → spell  (听音 + 中文 → type word)
 *   4 → has spell       → cloze  (例句填空)
 *   5 → has cloze       → DONE — handed to FSRS, due_at scheduled
 *
 * Using QuizKind counters from MasteryMatrix as the truth source means we
 * stay backwards-compatible with all existing scoring & FSRS pipelines.
 */

import { supabase } from "@/integrations/supabase/client";
import type { MasteryMatrix, QuizKind } from "./masteryScore";

export type GuideStep = 0 | 1 | 2 | 3 | 4 | 5;

// TODO: deprecate STEP_KIND. GuidedSession should derive its per-word
// gradient from MASTERY_STEP_KINDS instead. Maintaining two sources
// of truth for step→kinds mapping is a future bug.
/** Map a step (1..4) to the QuizKind we'll record when the user answers. */
export const STEP_KIND: Record<1 | 2 | 3 | 4, QuizKind> = {
  1: "en2cn",
  2: "cn2en",
  3: "spell",
  4: "cloze",
};

/**
 * Authoritative 5-step → kind[] table for the cohort Mastery Path UI.
 *
 * This is the canonical mapping that the 5-step progress bar reads (see
 * `VocabMasteryPath.STAGES`). Per-word progression inside `GuidedSession`
 * still uses `STEP_KIND` above — the two are intentionally different
 * structures (per-word ladder vs cohort-step rollup).
 *
 *   ① browse  : 看一遍 (event kind 'expose' — 进度由 localStorage 短路统计)
 *   ② form    : 听辨 + 拼写       → CohortDictationSession
 *   ③ meaning : 中英互选            → CohortMeaningSession
 *   ④ use     : 完形                → CohortClozeSession
 *   ⑤ master  : FSRS 复习达标       (由 fsrs_review 事件统计,stepProgress 短路)
 *
 * 列表里只放「真的有组件会写到 cohort_events 的 kind」,否则 80% 通过永远凑不齐。
 * `expose` 和 `fsrs_review` 不是 QuizKind,而是 cohort_events 上的特殊事件 kind,
 * stepProgress() 对 browse / master 走专用分支不依赖列表内容,这里保留它们仅作
 * 文档用途。
 */
export const MASTERY_STEP_KINDS: Record<
  "browse" | "form" | "meaning" | "use" | "master",
  readonly string[]
> = {
  browse: ["expose"],
  form: ["listen", "spell"],
  meaning: ["en2cn", "cn2en"],
  use: ["cloze"],
  master: ["fsrs_review"],
};

export const STEP_LABEL: Record<GuideStep, string> = {
  0: "看一眼",
  1: "认意思",
  2: "想单词",
  3: "拼出来",
  4: "用起来",
  5: "✓ 已掌握",
};

/** Decide the next step for a word given its current matrix. */
export function stepFromMatrix(m: MasteryMatrix | null | undefined): GuideStep {
  const matrix = m ?? {};
  if (!matrix.en2cn) return 1;
  if (!matrix.cn2en) return 2;
  if (!matrix.spell) return 3;
  if (!matrix.cloze) return 4;
  return 5;
}

export interface MasteryRow {
  matrix: MasteryMatrix;
  level: number;
  dueAt: string | null;
  reachedMasterAt: string | null;
}

/**
 * Fetch mastery rows for a set of vocab ids. Both gaokao and junior pages
 * write to gaokao_user_mastery (item_type='vocab') via bumpVocabMastery, so a
 * single read covers both stages.
 */
export async function fetchMasteryMap(
  vocabIds: string[],
): Promise<Map<string, MasteryRow>> {
  const out = new Map<string, MasteryRow>();
  if (vocabIds.length === 0) return out;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return out;
  // Chunk to avoid IN-list limits.
  const CHUNK = 200;
  for (let i = 0; i < vocabIds.length; i += CHUNK) {
    const slice = vocabIds.slice(i, i + CHUNK);
    const { data } = await supabase
      .from("gaokao_user_mastery")
      .select("item_id,mastery_matrix,mastery_level,due_at,reached_master_at")
      .eq("user_id", user.id)
      .eq("item_type", "vocab")
      .in("item_id", slice);
    (data ?? []).forEach((r: any) => {
      out.set(r.item_id, {
        matrix: (r.mastery_matrix ?? {}) as MasteryMatrix,
        level: r.mastery_level ?? 0,
        dueAt: r.due_at,
        reachedMasterAt: r.reached_master_at,
      });
    });
  }
  return out;
}

/**
 * IDs from `vocabIds` that are past their FSRS due date right now.
 * Used by the ReviewPool card.
 */
export async function fetchDueReviewIds(vocabIds: string[]): Promise<string[]> {
  if (vocabIds.length === 0) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const nowIso = new Date().toISOString();
  const out: string[] = [];
  const CHUNK = 200;
  for (let i = 0; i < vocabIds.length; i += CHUNK) {
    const slice = vocabIds.slice(i, i + CHUNK);
    const { data } = await supabase
      .from("gaokao_user_mastery")
      .select("item_id,due_at")
      .eq("user_id", user.id)
      .eq("item_type", "vocab")
      .in("item_id", slice)
      .lte("due_at", nowIso);
    (data ?? []).forEach((r: any) => out.push(r.item_id));
  }
  return out;
}