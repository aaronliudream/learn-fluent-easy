import { supabase } from "@/integrations/supabase/client";
import { fsrsSchedule, gradeFromAttempt, type FsrsState } from "./fsrs";

/**
 * Junior grammar mastery scheduling — FSRS-backed.
 * Mirrors src/lib/grammarFsrs.ts (the Gaokao version) but writes to the
 * `junior_user_mastery` table instead of `gaokao_user_mastery`.
 *
 * Levels 0..4: Untouched / Learning / Familiar / Proficient / Mastered.
 * Mastered requires: ≥12 correct across ≥2 question types, ≥85% recent acc,
 * stability ≥21d, and a successful retention check (≥7d gap then correct).
 *
 * Why a separate file (instead of generalizing the Gaokao one)?
 * Keeps the Gaokao code untouched. Lovable can later refactor the two into
 * one parameterized module if desired.
 */

export type JuniorGrammarErrorReason =
  | "rule_unknown"
  | "confusion"
  | "careless"
  | "vocab"
  | "speed";

export type JuniorGrammarMatrix = {
  types?: Record<string, { c: number; w: number }>;
  recent?: number[];
  errors?: Record<string, number>;
  wrongQ?: string[];
  // 知识点层(item_type='grammar_kp' 行专用,不影响考点行):
  streak?: number; // 连对计数,答对+1/答错清零
  reviewsPassed?: number; // Learned 后通过的「到期复习」次数
  learnedAt?: string; // 首次达 Learned 的时间
};

/** 知识点掌握门槛:连对 N 道 → Learned;Learned 后通过 M 次到期复习 → Mastered。 */
export const KP_LEARNED_STREAK = 5;
export const KP_MASTERED_REVIEWS = 2;

export type JuniorGrammarMastery = {
  id?: string;
  user_id?: string;
  item_id: string;
  correct_count: number;
  wrong_count: number;
  mastery_level: number;
  stability: number;
  difficulty: number;
  last_seen_at: string | null;
  due_at: string | null;
  reached_master_at: string | null;
  last_result: string | null;
  lapses: number;
  mastery_matrix: JuniorGrammarMatrix;
};

function recentAcc(recent: number[] = []): number {
  if (!recent.length) return 0;
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

function distinctTypes(types: Record<string, { c: number; w: number }> = {}): number {
  return Object.values(types).filter((t) => t.c >= 2).length;
}

export function deriveLevel(m: {
  correct_count: number;
  wrong_count: number;
  stability: number;
  reached_master_at: string | null;
  mastery_matrix: JuniorGrammarMatrix;
}): number {
  const acc = recentAcc(m.mastery_matrix?.recent);
  const c = m.correct_count;
  const s = m.stability;
  const types = distinctTypes(m.mastery_matrix?.types);
  if (c >= 12 && types >= 2 && acc >= 0.85 && s >= 21 && !!m.reached_master_at) return 4;
  if (c >= 8 && acc >= 0.8 && s >= 7) return 3;
  if (c >= 4 && acc >= 0.6) return 2;
  if (c + m.wrong_count >= 1) return 1;
  return 0;
}

function checkRetention(prev: JuniorGrammarMastery | null, isCorrect: boolean): boolean {
  if (!isCorrect || !prev?.last_seen_at) return false;
  const gap = Date.now() - new Date(prev.last_seen_at).getTime();
  return gap >= 7 * 24 * 3600 * 1000;
}

export async function loadJuniorGrammarMastery(
  pointId: string,
): Promise<JuniorGrammarMastery | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("junior_user_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_type", "grammar_point")
    .eq("item_id", pointId)
    .maybeSingle();
  return (data as unknown as JuniorGrammarMastery) ?? null;
}

export async function loadJuniorGrammarMasteryAll(): Promise<JuniorGrammarMastery[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("junior_user_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_type", "grammar_point");
  return (data ?? []) as unknown as JuniorGrammarMastery[];
}

export type DueRevengeItem = {
  pointId: string;
  pointTitle: string;
  questionId: string;
  phase: string;
  stem: string;
  picked: string;
  correct: string;
  why?: string;
};

/**
 * Revenge 取数(DB 唯一源):找所有 due 的 grammar point → 收集其 mastery_matrix.wrongQ
 * → 批量反查 junior_grammar_questions 拿题面 → 组装 Runner 用的填空错题。
 * due 仍按 point 级 due_at(与 rankWeakPoints 同口径),绝不让 wrongQ 自己单独调度。
 * correct 取「答案文本」:legacy MCQ 把 A-D 字母映射成 option_<letter>;否则 correct_answer 即文本。
 * picked DB 没存 → 留空;why = explanation。
 */
export async function loadDueRevengeItems(
  opts?: { pointId?: string },
): Promise<DueRevengeItem[]> {
  const rows = await loadJuniorGrammarMasteryAll();
  const now = Date.now();
  const dueRows = rows.filter((r) => {
    if (opts?.pointId && r.item_id !== opts.pointId) return false;
    if ((r.mastery_matrix?.wrongQ ?? []).length === 0) return false;
    return !!(r.due_at && new Date(r.due_at).getTime() <= now);
  });
  if (!dueRows.length) return [];

  const ids = [...new Set(dueRows.flatMap((r) => r.mastery_matrix?.wrongQ ?? []))];
  const pointIds = [...new Set(dueRows.map((r) => r.item_id))];
  const [qRes, pRes] = await Promise.all([
    supabase
      .from("junior_grammar_questions")
      .select("id,point_id,stem,correct_answer,option_a,option_b,option_c,option_d,explanation")
      .in("id", ids),
    supabase.from("junior_grammar_points").select("id,title").in("id", pointIds),
  ]);
  const titleByPoint = new Map(
    ((pRes.data ?? []) as { id: string; title: string }[]).map((p) => [p.id, p.title]),
  );

  const out: DueRevengeItem[] = [];
  for (const q of (qRes.data ?? []) as Array<Record<string, string | null>>) {
    const letter = (q.correct_answer ?? "").trim().toUpperCase();
    const correct = /^[A-D]$/.test(letter)
      ? q[`option_${letter.toLowerCase()}`] ?? q.correct_answer ?? ""
      : q.correct_answer ?? "";
    if (!correct || !q.id || !q.point_id) continue; // 无可判分答案文本 → 跳过(保险)
    out.push({
      pointId: q.point_id,
      pointTitle: titleByPoint.get(q.point_id) ?? q.point_id,
      questionId: q.id,
      phase: "复习",
      stem: q.stem ?? "",
      picked: "",
      correct,
      why: q.explanation ?? undefined,
    });
  }
  return out;
}

/**
 * Revenge 答对某题 → 从该 point 的 mastery_matrix.wrongQ 移除该 question_id 并写回。
 * 答对即删(wrongQ 是「待复习池」,不是 FSRS 历史)。只动 wrongQ,不碰 due_at/level/FSRS。
 */
export async function removeFromWrongQ(
  pointId: string,
  questionId: string,
): Promise<void> {
  const prev = await loadJuniorGrammarMastery(pointId);
  if (!prev?.id) return;
  const matrix: JuniorGrammarMatrix = prev.mastery_matrix
    ? JSON.parse(JSON.stringify(prev.mastery_matrix))
    : {};
  const next = (matrix.wrongQ ?? []).filter((id) => id !== questionId);
  if (next.length === (matrix.wrongQ?.length ?? 0)) return; // 无变化不写
  matrix.wrongQ = next;
  await supabase.from("junior_user_mastery").update({ mastery_matrix: matrix }).eq("id", prev.id);
}

export async function recordJuniorGrammarAttempt(opts: {
  pointId: string;
  questionType: string;
  isCorrect: boolean;
  latencyMs?: number;
  errorReason?: JuniorGrammarErrorReason;
  questionId?: string;
  kpId?: string; // 该题所属知识点(junior_knowledge_points.id);传入则额外维护 grammar_kp 行
}): Promise<{ newLevel: number; intervalDays: number; justMastered: boolean } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const prev = await loadJuniorGrammarMastery(opts.pointId);
  const now = new Date();

  const grade = gradeFromAttempt({
    isCorrect: opts.isCorrect,
    latencyMs: opts.latencyMs,
    targetMs: 8000,
  });
  const prevState: FsrsState | null = prev
    ? {
        difficulty: prev.difficulty ?? 5.0,
        stability: prev.stability ?? 0,
        lastReviewIso: prev.last_seen_at,
      }
    : null;
  const fsrs = fsrsSchedule(prevState, grade, now);

  const matrix: JuniorGrammarMatrix = prev?.mastery_matrix
    ? JSON.parse(JSON.stringify(prev.mastery_matrix))
    : { types: {}, recent: [], errors: {} };
  matrix.types = matrix.types || {};
  matrix.recent = matrix.recent || [];
  matrix.errors = matrix.errors || {};

  const t = matrix.types[opts.questionType] || { c: 0, w: 0 };
  if (opts.isCorrect) t.c += 1; else t.w += 1;
  matrix.types[opts.questionType] = t;

  matrix.recent.push(opts.isCorrect ? 1 : 0);
  if (matrix.recent.length > 10) matrix.recent.shift();

  if (!opts.isCorrect && opts.errorReason) {
    matrix.errors[opts.errorReason] = (matrix.errors[opts.errorReason] || 0) + 1;
  }

  // 答错时把 question_id 记进 wrongQ(去重 + 保留最近 60)。
  // 只加不删:答对不移除,删除权交给 Step 2 的 Revenge 答对流程
  // (recordJuniorGrammarAttempt 被 mastery/未来 Revenge 共用,本阶段无法区分上下文)。
  if (opts.questionId && !opts.isCorrect) {
    const wrongQ = [...(matrix.wrongQ ?? []), opts.questionId];
    matrix.wrongQ = [...new Set(wrongQ)].slice(-60);
  }

  const correctCount = (prev?.correct_count ?? 0) + (opts.isCorrect ? 1 : 0);
  const wrongCount = (prev?.wrong_count ?? 0) + (opts.isCorrect ? 0 : 1);
  const lapses = (prev?.lapses ?? 0) + (opts.isCorrect ? 0 : 1);

  const retentionPassed = checkRetention(prev, opts.isCorrect);
  const reachedMasterAt =
    prev?.reached_master_at ||
    (retentionPassed && correctCount >= 12 && fsrs.stability >= 21
      ? now.toISOString()
      : null);

  const newLevel = deriveLevel({
    correct_count: correctCount,
    wrong_count: wrongCount,
    stability: fsrs.stability,
    reached_master_at: reachedMasterAt,
    mastery_matrix: matrix,
  });

  const payload = {
    correct_count: correctCount,
    wrong_count: wrongCount,
    mastery_level: newLevel,
    stability: fsrs.stability,
    difficulty: fsrs.difficulty,
    last_seen_at: now.toISOString(),
    last_grade: grade,
    last_latency_ms: opts.latencyMs ?? null,
    due_at: fsrs.dueAt.toISOString(),
    next_review_at: fsrs.dueAt.toISOString(),
    reached_master_at: reachedMasterAt,
    last_result: opts.isCorrect ? "correct" : "wrong",
    lapses,
    mastery_matrix: matrix,
  };

  if (prev?.id) {
    await supabase.from("junior_user_mastery").update(payload).eq("id", prev.id);
  } else {
    await supabase.from("junior_user_mastery").insert({
      user_id: user.id,
      item_type: "grammar_point",
      item_id: opts.pointId,
      ...payload,
    });
  }

  // 知识点层(可选):同一次作答额外记到该题所属知识点行,不影响上面的考点行。
  if (opts.kpId) {
    await applyKpAttempt(user.id, opts.kpId, opts.isCorrect, now, grade);
  }

  return {
    newLevel,
    intervalDays: fsrs.intervalDays,
    justMastered: !!reachedMasterAt && !prev?.reached_master_at,
  };
}

/**
 * 知识点连对/掌握(item_type='grammar_kp')。复用同一 fsrsSchedule(不改 FSRS 算法)。
 * - streak:答对+1 / 答错清零
 * - streak ≥ KP_LEARNED_STREAK 且 level<1 → level=1(Learned),记 learnedAt
 * - level≥1 且答对且当次是「到期复习」(now ≥ due_at) → reviewsPassed+1;≥KP_MASTERED_REVIEWS → level=2(Mastered)
 * - 已 Learned 后答错:streak 清零,但 level 不回退(保留 Learned)
 */
async function applyKpAttempt(
  userId: string,
  kpId: string,
  isCorrect: boolean,
  now: Date,
  grade: number,
): Promise<void> {
  const { data } = await supabase
    .from("junior_user_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", "grammar_kp")
    .eq("item_id", kpId)
    .maybeSingle();
  const prev = data as unknown as JuniorGrammarMastery | null;

  const matrix: JuniorGrammarMatrix = prev?.mastery_matrix
    ? JSON.parse(JSON.stringify(prev.mastery_matrix))
    : {};
  const wasDue = !!(prev?.due_at && new Date(prev.due_at).getTime() <= now.getTime());
  const streak = isCorrect ? (matrix.streak ?? 0) + 1 : 0;
  let level = prev?.mastery_level ?? 0;
  let reviewsPassed = matrix.reviewsPassed ?? 0;

  if (level < 1 && streak >= KP_LEARNED_STREAK) {
    level = 1;
    matrix.learnedAt = now.toISOString();
  }
  if (level >= 1 && isCorrect && wasDue) {
    reviewsPassed += 1;
    if (reviewsPassed >= KP_MASTERED_REVIEWS) level = 2;
  }
  matrix.streak = streak;
  matrix.reviewsPassed = reviewsPassed;

  const prevState: FsrsState | null = prev
    ? { difficulty: prev.difficulty ?? 5.0, stability: prev.stability ?? 0, lastReviewIso: prev.last_seen_at }
    : null;
  const fsrs = fsrsSchedule(prevState, grade, now);

  const payload = {
    correct_count: (prev?.correct_count ?? 0) + (isCorrect ? 1 : 0),
    wrong_count: (prev?.wrong_count ?? 0) + (isCorrect ? 0 : 1),
    mastery_level: level,
    stability: fsrs.stability,
    difficulty: fsrs.difficulty,
    last_seen_at: now.toISOString(),
    due_at: fsrs.dueAt.toISOString(),
    next_review_at: fsrs.dueAt.toISOString(),
    last_result: isCorrect ? "correct" : "wrong",
    mastery_matrix: matrix,
  };

  if (prev?.id) {
    await supabase.from("junior_user_mastery").update(payload).eq("id", prev.id);
  } else {
    await supabase.from("junior_user_mastery").insert({
      user_id: userId,
      item_type: "grammar_kp",
      item_id: kpId,
      ...payload,
    });
  }
}

export function aggregateJuniorGrammarErrors(
  rows: JuniorGrammarMastery[],
): Record<JuniorGrammarErrorReason, number> {
  const sum: Record<string, number> = {
    rule_unknown: 0, confusion: 0, careless: 0, vocab: 0, speed: 0,
  };
  for (const r of rows) {
    const errs = r.mastery_matrix?.errors || {};
    for (const [k, v] of Object.entries(errs)) {
      if (k in sum) sum[k] += v as number;
    }
  }
  return sum as Record<JuniorGrammarErrorReason, number>;
}

export const JUNIOR_ERROR_REASON_LABELS: Record<JuniorGrammarErrorReason, string> = {
  rule_unknown: "规则不懂",
  confusion: "相似混淆",
  careless: "粗心",
  vocab: "词汇不认识",
  speed: "时间不够",
};

export const JUNIOR_LEVEL_META: Record<
  number,
  { label: string; emoji: string; color: string; ring: string }
> = {
  0: { label: "未开始", emoji: "🌱", color: "text-muted-foreground", ring: "stroke-muted" },
  1: { label: "初学",  emoji: "🌿", color: "text-sky-600",        ring: "stroke-sky-500" },
  2: { label: "熟悉",  emoji: "🌳", color: "text-emerald-600",     ring: "stroke-emerald-500" },
  3: { label: "熟练",  emoji: "⭐", color: "text-amber-600",       ring: "stroke-amber-500" },
  4: { label: "掌握",  emoji: "👑", color: "text-yellow-600",      ring: "stroke-yellow-500" },
};
