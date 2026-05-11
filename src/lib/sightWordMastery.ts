/**
 * Sight Words 掌握度 — 完全复用 src/lib/masteryFsrs.ts 的 SRS 算法,
 * 只是把数据存到 primary_sight_word_mastery 表.
 *
 * 与 phonicsMastery.ts 是同一套模板的复制,字段命名保持一致.
 */
import { supabase } from "@/integrations/supabase/client";
import { isMasteryDue, nextSrsState } from "@/lib/masteryFsrs";

export type SightWordMastery = {
  word_id: string;
  mastery_level: number;          // 0..3
  ease: number;
  interval_days: number;
  due_at: string;
  last_seen_at: string | null;
  recognize_correct: number;
  recognize_wrong: number;
  listen_correct: number;
  listen_wrong: number;
  context_correct: number;
  context_wrong: number;
};

export type SightWordMasteryMap = Map<string, SightWordMastery>;

export async function getSightWordMasteryMap(): Promise<SightWordMasteryMap> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  const map: SightWordMasteryMap = new Map();
  if (!uid) return map;
  const { data } = await supabase
    .from("primary_sight_word_mastery")
    .select(
      "word_id,mastery_level,ease,interval_days,due_at,last_seen_at,recognize_correct,recognize_wrong,listen_correct,listen_wrong,context_correct,context_wrong"
    )
    .eq("user_id", uid);
  (data ?? []).forEach((r: any) => map.set(r.word_id, r as SightWordMastery));
  return map;
}

export async function bumpSightWordMastery(
  wordId: string,
  kind: "recognize" | "listen" | "context",
  correct: boolean
): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;

  const { data: cur } = await supabase
    .from("primary_sight_word_mastery")
    .select("*")
    .eq("user_id", uid)
    .eq("word_id", wordId)
    .maybeSingle();

  const r: any = cur ?? {
    user_id: uid,
    word_id: wordId,
    mastery_level: 0,
    ease: 2.5,
    interval_days: 0,
    recognize_correct: 0,
    recognize_wrong: 0,
    listen_correct: 0,
    listen_wrong: 0,
    context_correct: 0,
    context_wrong: 0,
  };
  if (kind === "recognize") correct ? r.recognize_correct++ : r.recognize_wrong++;
  else if (kind === "listen") correct ? r.listen_correct++ : r.listen_wrong++;
  else correct ? r.context_correct++ : r.context_wrong++;

  // 清理旧字段(spell_*),避免 upsert 把 undefined 写回
  delete (r as any).spell_correct;
  delete (r as any).spell_wrong;

  const srs = nextSrsState(r, correct);
  r.ease = srs.ease;
  r.interval_days = srs.interval_days;
  r.due_at = srs.due_at;
  r.last_seen_at = new Date().toISOString();

  await supabase
    .from("primary_sight_word_mastery")
    .upsert(r, { onConflict: "user_id,word_id" });
}

export async function bumpSightWordLevel(wordId: string, delta = 1, cap = 3): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  const { data: cur } = await supabase
    .from("primary_sight_word_mastery")
    .select("mastery_level")
    .eq("user_id", uid)
    .eq("word_id", wordId)
    .maybeSingle();
  const next = Math.min(cap, ((cur as any)?.mastery_level ?? 0) + delta);
  await supabase
    .from("primary_sight_word_mastery")
    .upsert(
      {
        user_id: uid,
        word_id: wordId,
        mastery_level: next,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,word_id" }
    );
}

export function isSightWordDue(m: SightWordMastery | undefined): boolean {
  return isMasteryDue(m);
}