// Minimal Spark growth loop — Phase 1.
// Goal: every chat turn nudges bond, every quiz win pushes XP,
// hitting bond=100 levels Spark up. Show ONE toast when it happens.
//
// Why so small: we have zero retention data yet. The point is just
// to give kids visible feedback so they come back tomorrow.

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAILY_TURN_CAP = 30;        // anti-spam: max bond gained from chatting
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
    const left = Math.max(0, DAILY_TURN_CAP - used);
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

/** Call once per user-sent chat turn. Daily-capped. */
export function bondOnChatTurn() {
  const give = takeDailyBond(BOND_PER_TURN);
  if (give > 0) void applyGrowth(give, 0);
}

/** Call once when a quiz finishes with score >= 60%. */
export function bondOnQuizWin() {
  void applyGrowth(BOND_PER_QUIZ_WIN, XP_PER_QUIZ_WIN);
}
