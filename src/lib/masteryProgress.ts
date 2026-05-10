import { supabase } from "@/integrations/supabase/client";
import { recordUnifiedAttempt, type Stage, type ModuleKey } from "./unifiedMastery";

export type MasteryRow = {
  id: string;
  user_id: string;
  module: string;
  item_id: string;
  stars: number;
  best_pct: number;
  attempts: number;
  last_perfect_at: string | null;
  next_review_at: string | null;
  last_attempt_at: string;
};

/** 双档解锁阈值 */
export const PASS_PCT = 80;       // ≥80% 解锁下一篇
export const PERFECT_PCT = 100;   // 100% 算"完美/掌握度+1星"

/** 艾宾浩斯简化间隔（天）：0★→1天，1★→3，2★→7，3★→14，4★→30，5★→90 */
const REVIEW_DAYS = [1, 3, 7, 14, 30, 90];

function nextReviewAt(stars: number): string {
  const days = REVIEW_DAYS[Math.min(stars, REVIEW_DAYS.length - 1)];
  return new Date(Date.now() + days * 86400_000).toISOString();
}

/** 判断需要复习（next_review_at 已过期且 stars < 5） */
export function needsReview(row: MasteryRow | undefined): boolean {
  if (!row || !row.next_review_at) return false;
  if (row.stars >= 5) return false;
  return new Date(row.next_review_at).getTime() <= Date.now();
}

/** 提交一次结果 → 更新掌握度（自动星升降+下次复习时间）*/
export async function recordMastery(opts: {
  module: string;
  itemId: string;
  pct: number;       // 本次得分 0..100
  // 🆕 v7：统一掌握度路由所需上下文（不传则从 module 字符串推断）
  grade?: number;
  itemLabel?: string;
}): Promise<MasteryRow | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return null;
  const userId = u.user.id;

  const { data: existing } = await supabase
    .from("mastery_progress")
    .select("*")
    .eq("user_id", userId).eq("module", opts.module).eq("item_id", opts.itemId)
    .maybeSingle();

  const prev = existing as MasteryRow | null;
  const isPerfect = opts.pct >= PERFECT_PCT;
  const isPass = opts.pct >= PASS_PCT;

  let stars = prev?.stars ?? 0;
  if (isPerfect) stars = Math.min(5, stars + 1);
  else if (!isPass) stars = Math.max(0, stars - 1); // 没通过 → 降1星

  const payload = {
    user_id: userId,
    module: opts.module,
    item_id: opts.itemId,
    stars,
    best_pct: Math.max(prev?.best_pct ?? 0, Math.round(opts.pct)),
    attempts: (prev?.attempts ?? 0) + 1,
    last_perfect_at: isPerfect ? new Date().toISOString() : prev?.last_perfect_at ?? null,
    next_review_at: isPerfect ? nextReviewAt(stars) : prev?.next_review_at ?? null,
    last_attempt_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data } = await supabase
    .from("mastery_progress")
    .upsert(payload, { onConflict: "user_id,module,item_id" })
    .select()
    .maybeSingle();

  // 🆕 v7：写 unified_mastery（module 字符串形如 "junior_reading" / "gaokao_cloze"）
  const parts = opts.module.split("_");
  const stagePrefix = parts[0];
  const modKey = parts.slice(1).join("_") || parts[0];
  const stage: Stage =
    stagePrefix === "primary" ? "primary"
      : stagePrefix === "junior" ? "junior"
      : "senior";
  const defaultGrade = stage === "primary" ? 3 : stage === "junior" ? 8 : 10;
  recordUnifiedAttempt({
    stage,
    grade: opts.grade ?? defaultGrade,
    module: (modKey as ModuleKey) ?? "reading",
    item_type: "item",
    item_id: opts.itemId,
    item_label: opts.itemLabel,
    // recordMastery 传的是百分比；≥80% 视为本次"通过"
    is_correct: opts.pct >= PASS_PCT,
    context: { pct: Math.round(opts.pct) },
  }).catch(() => {});

  return data as any;
}

/** 拉取某模块全部掌握度 → Map<itemId, row> */
export async function loadMastery(module: string): Promise<Record<string, MasteryRow>> {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return {};
  const { data } = await supabase
    .from("mastery_progress")
    .select("*")
    .eq("user_id", u.user.id).eq("module", module);
  const map: Record<string, MasteryRow> = {};
  for (const r of (data ?? []) as MasteryRow[]) map[r.item_id] = r;
  return map;
}

/** 拉取所有到期复习项 */
export async function loadDueReviews(modules?: string[]): Promise<MasteryRow[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return [];
  let q = supabase.from("mastery_progress").select("*")
    .eq("user_id", u.user.id)
    .lte("next_review_at", new Date().toISOString())
    .lt("stars", 5)
    .order("next_review_at", { ascending: true });
  if (modules?.length) q = q.in("module", modules);
  const { data } = await q;
  return (data ?? []) as MasteryRow[];
}

export type Status = "new" | "tried" | "passed" | "mastered" | "review_due";
export function statusOf(row?: MasteryRow): Status {
  if (!row) return "new";
  if (needsReview(row)) return "review_due";
  if (row.stars >= 5) return "mastered";
  if (row.best_pct >= PASS_PCT) return "passed";
  return "tried";
}

export const STATUS_LABEL: Record<Status, string> = {
  new: "未读",
  tried: "需重做",
  passed: "已通过",
  mastered: "完美掌握",
  review_due: "待复习",
};