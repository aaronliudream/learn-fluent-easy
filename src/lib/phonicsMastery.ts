// Phonics 掌握度 — 复用 primary_word_mastery 的 SRS 套路。
// 与单词掌握度独立:用 primary_phonics_mastery 表,phonics_id 是文本 ("p_a")。
import { supabase } from "@/integrations/supabase/client";

export type PhonicsMastery = {
  phonics_id: string;
  mastery_level: number;        // 0 未学 / 1 学过 / 2 熟练 / 3 掌握
  ease: number;
  interval_days: number;
  due_at: string;               // ISO
  last_seen_at: string | null;
  quiz_correct: number;
  quiz_wrong: number;
  listen_correct: number;
  listen_wrong: number;
};

export type PhonicsMasteryMap = Map<string, PhonicsMastery>;

/** 拉当前用户全部 phonics 掌握度。未登录返回空 Map。 */
export async function getPhonicsMasteryMap(): Promise<PhonicsMasteryMap> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  const map: PhonicsMasteryMap = new Map();
  if (!uid) return map;
  const { data } = await supabase
    .from("primary_phonics_mastery")
    .select(
      "phonics_id,mastery_level,ease,interval_days,due_at,last_seen_at,quiz_correct,quiz_wrong,listen_correct,listen_wrong"
    )
    .eq("user_id", uid);
  (data ?? []).forEach((r: any) => map.set(r.phonics_id, r as PhonicsMastery));
  return map;
}

/** 记录一次答题。轻量 SRS:对则间隔×ease,错则间隔=1天 ease-=0.15。 */
export async function bumpPhonicsMastery(
  phonicsId: string,
  kind: "quiz" | "listen",
  correct: boolean
): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return; // 游客不写库

  const { data: cur } = await supabase
    .from("primary_phonics_mastery")
    .select("*")
    .eq("user_id", uid)
    .eq("phonics_id", phonicsId)
    .maybeSingle();

  const r: any = cur ?? {
    user_id: uid,
    phonics_id: phonicsId,
    mastery_level: 0,
    ease: 2.5,
    interval_days: 0,
    quiz_correct: 0,
    quiz_wrong: 0,
    listen_correct: 0,
    listen_wrong: 0,
  };

  // 计数
  if (kind === "quiz") correct ? r.quiz_correct++ : r.quiz_wrong++;
  else correct ? r.listen_correct++ : r.listen_wrong++;

  // SRS
  if (correct) {
    r.ease = Math.min(3.0, (r.ease ?? 2.5) + 0.05);
    r.interval_days = r.interval_days < 1 ? 1 : r.interval_days * r.ease;
  } else {
    r.ease = Math.max(1.3, (r.ease ?? 2.5) - 0.15);
    r.interval_days = 1;
  }
  const dueMs = Date.now() + r.interval_days * 24 * 3600 * 1000;
  r.due_at = new Date(dueMs).toISOString();
  r.last_seen_at = new Date().toISOString();

  await supabase
    .from("primary_phonics_mastery")
    .upsert(r, { onConflict: "user_id,phonics_id" });
}

/** 学完一个音 → 把 mastery_level 提升到 floor(level)+1,封顶 3。 */
export async function bumpPhonicsLevel(phonicsId: string, delta = 1, cap = 3): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  const { data: cur } = await supabase
    .from("primary_phonics_mastery")
    .select("mastery_level")
    .eq("user_id", uid)
    .eq("phonics_id", phonicsId)
    .maybeSingle();
  const next = Math.min(cap, ((cur as any)?.mastery_level ?? 0) + delta);
  await supabase
    .from("primary_phonics_mastery")
    .upsert(
      {
        user_id: uid,
        phonics_id: phonicsId,
        mastery_level: next,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,phonics_id" }
    );
}

/** 强制把整组所有音的 mastery_level 提升到至少 minLevel(用于"通过整组挑战")。 */
export async function ensureGroupMastery(phonicsIds: string[], minLevel: number): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid || phonicsIds.length === 0) return;
  const { data: cur } = await supabase
    .from("primary_phonics_mastery")
    .select("phonics_id,mastery_level")
    .eq("user_id", uid)
    .in("phonics_id", phonicsIds);
  const curMap = new Map<string, number>();
  (cur ?? []).forEach((r: any) => curMap.set(r.phonics_id, r.mastery_level));
  const rows = phonicsIds.map((pid) => ({
    user_id: uid,
    phonics_id: pid,
    mastery_level: Math.max(curMap.get(pid) ?? 0, minLevel),
    last_seen_at: new Date().toISOString(),
  }));
  await supabase
    .from("primary_phonics_mastery")
    .upsert(rows, { onConflict: "user_id,phonics_id" });
}

/** 判断一组是否解锁:前一组所有音 mastery_level >= 2。第 1 组永远解锁。 */
export function isGroupUnlocked(
  groupIndex: number,                   // 0-based
  groupItemsByIndex: { id: string }[][],
  mastery: PhonicsMasteryMap
): boolean {
  if (groupIndex === 0) return true;
  const prev = groupItemsByIndex[groupIndex - 1] ?? [];
  if (prev.length === 0) return true;
  return prev.every((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2);
}

export function isDue(m: PhonicsMastery | undefined): boolean {
  if (!m) return false;
  if (m.mastery_level >= 3) return false;
  return new Date(m.due_at).getTime() <= Date.now();
}