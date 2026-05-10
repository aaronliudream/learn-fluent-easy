// Minimal Spark growth loop — Phase 1.
// Goal: every chat turn nudges bond, every quiz win pushes XP,
// hitting bond=100 levels Spark up. Show ONE toast when it happens.
//
// Why so small: we have zero retention data yet. The point is just
// to give kids visible feedback so they come back tomorrow.

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { petReact } from "@/lib/coins";

// v2 — Spark bond is now fed by ALL learning behaviors, not just chat.
// Daily cap raised from 30 → 60 to cover the "今日冒险 (4 件事)" loop
// (≈ 50 bond) plus free-chat (≈ 10 bond). Above the cap, bond stops but
// XP keeps flowing so highly-engaged kids still see Spark grow over time.
const DAILY_BOND_CAP = 60;
const BOND_PER_TURN = 1;
const BOND_PER_QUIZ_WIN = 5;      // ≥60% on a quiz
const XP_PER_QUIZ_WIN = 20;
const LEVEL_THRESHOLD = 100;

const LEVEL_LINES = [
  "We're best friends now! 🐾",
  "I feel so happy with you! ✨",
  "You make me stronger! 💪",
  "Wow, we're a great team! 🌟",
  "I love learning with you! 🎉",
];

function todayKey() {
  const d = new Date();
  return `spark.bond.daily.${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function takeDailyBond(amount: number): number {
  try {
    const k = todayKey();
    const used = parseInt(localStorage.getItem(k) || "0", 10) || 0;
    const left = Math.max(0, DAILY_BOND_CAP - used);
    const give = Math.min(amount, left);
    if (give > 0) localStorage.setItem(k, String(used + give));
    return give;
  } catch { return amount; }
}

async function applyGrowth(bondDelta: number, xpDelta: number) {
  try {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) return;

    const { data: pet } = await supabase
      .from("pet_state").select("level,xp,bond").eq("user_id", uid).maybeSingle();

    let level = pet?.level ?? 1;
    let xp = (pet?.xp ?? 0) + xpDelta;
    let bond = (pet?.bond ?? 0) + bondDelta;
    let leveledUp = false;
    while (bond >= LEVEL_THRESHOLD) {
      bond -= LEVEL_THRESHOLD;
      level += 1;
      leveledUp = true;
    }

    if (pet) {
      await supabase.from("pet_state")
        .update({ level, xp, bond, last_interaction_at: new Date().toISOString() })
        .eq("user_id", uid);
    } else {
      await supabase.from("pet_state").insert({ user_id: uid, level, xp, bond });
    }

    if (leveledUp) {
      const line = LEVEL_LINES[(level - 2) % LEVEL_LINES.length];
      toast.success(`🎉 Spark 升到 Lv.${level}！`, { description: line, duration: 4000 });
    }
  } catch (e) {
    // Never block the chat
    console.warn("petGrowth failed", e);
  }
}

/**
 * Internal: apply bond+XP, and make Spark visibly react in the corner.
 * Capped/uncapped is decided per call site (see table below).
 * Visible reaction is always fired — even when daily bond cap is hit —
 * so kids never feel "I did this and Spark didn't notice".
 */
function feedSpark(opts: {
  bond: number;
  xp: number;
  capped: boolean;
  reactCoins?: number;   // number shown in floating reaction bubble
}) {
  const give = opts.capped ? takeDailyBond(opts.bond) : opts.bond;
  // Visible reaction on the floating Spark — listened to by FloatingPet.
  // Show the *intended* gain, not the post-cap amount, so feedback is consistent.
  try { petReact("happy", { coins: opts.reactCoins ?? opts.bond }); } catch { /* noop */ }
  // Also surface a top-of-screen toast so the gain is unmistakable
  // — bubble + toast together = "Spark 因我而动" 信号被孩子接收到。
  try {
    if (give > 0) {
      toast(`💖 Spark +${opts.bond} 亲密度`, {
        description: opts.xp > 0 ? `经验 +${opts.xp}` : undefined,
        duration: 1800,
      });
    } else if (opts.capped) {
      toast(`✨ Spark 今天已经吃饱啦`, {
        description: `经验 +${opts.xp}（亲密度明天再涨）`,
        duration: 1800,
      });
    }
  } catch { /* noop */ }
  if (give > 0 || opts.xp > 0) void applyGrowth(give, opts.xp);
}

/** Call once per user-sent chat turn. Daily-capped. */
export function bondOnChatTurn() {
  // Chat is high-frequency; don't pop a reaction every turn.
  const give = takeDailyBond(BOND_PER_TURN);
  if (give > 0) void applyGrowth(give, 0);
}

/** Call once when a generic quiz finishes with score >= 60%. NOT capped. */
export function bondOnQuizWin() {
  feedSpark({ bond: BOND_PER_QUIZ_WIN, xp: XP_PER_QUIZ_WIN, capped: false });
}

// =====================================================================
// v2 named completion APIs — one per learning module.
// Numerical proposal approved 2026-05 (see .lovable/spark-bond-inventory-v2.md):
//
// behavior              bond  xp   capped?
// chat per turn          +1    0   ✅
// quiz ≥60%              +5  +20   ❌
// lesson 1★/2★/3★    +10/15/25  +30/50/80  ✅
// reading complete      +15  +50   ✅
// listening complete    +12  +40   ✅
// phonics complete       +8  +25   ✅
// vocab quiz ≥70%        +6  +20   ✅
// culture stamp          +3  +10   ✅
// assessment complete   +20  +60   ❌
// =====================================================================

/** Lesson finished. stars: 1 / 2 / 3. Capped. */
export function bondOnLessonComplete(stars: 1 | 2 | 3) {
  const bond = stars === 3 ? 25 : stars === 2 ? 15 : 10;
  const xp   = stars === 3 ? 80 : stars === 2 ? 50 : 30;
  feedSpark({ bond, xp, capped: true });
}

/** Reading article finished (any score). Capped. */
export function bondOnReadingComplete() {
  feedSpark({ bond: 15, xp: 50, capped: true });
}

/** Listening session finished. Capped. (Reserved for PrimaryListening module.) */
export function bondOnListeningComplete() {
  feedSpark({ bond: 12, xp: 40, capped: true });
}

/** Phonics lesson / letter mastered. Capped. */
export function bondOnPhonicsComplete() {
  feedSpark({ bond: 8, xp: 25, capped: true });
}

/** Child echoed Spark in single-phonics learn page. Capped. Tiny nudge. */
export function bondOnSparkEcho() {
  feedSpark({ bond: 5, xp: 10, capped: true });
}

/** Single phonics learn → quiz all-correct. Capped. Bigger than chant echo. */
export function bondOnPhonicsLearnPass() {
  feedSpark({ bond: 15, xp: 40, capped: true });
}

/** Vocab session finished with accuracy >= 70%. Capped. */
export function bondOnVocabQuiz(accuracyPct: number) {
  if (accuracyPct < 70) return;
  feedSpark({ bond: 6, xp: 20, capped: true });
}

/** Mini-game session finished. Capped. (Same scale as vocab quiz.) */
export function bondOnGameComplete(accuracyPct: number) {
  if (accuracyPct < 60) return;
  feedSpark({ bond: 6, xp: 20, capped: true });
}

/** Culture stamp / cultural card collected. Capped. */
export function bondOnCultureStamp() {
  feedSpark({ bond: 3, xp: 10, capped: true });
}

/** Monthly assessment / unit challenge finished. NOT capped (rare event). */
export function bondOnAssessmentComplete() {
  feedSpark({ bond: 20, xp: 60, capped: false });
}

/**
 * Daily Adventure fully completed (all 4 steps).
 * NOT capped (once per day) — and we want the day to end with a
 * visible flash of growth so kids feel "I made Spark bigger today".
 */
export function bondOnAdventureComplete() {
  feedSpark({ bond: 30, xp: 100, capped: false });
}
