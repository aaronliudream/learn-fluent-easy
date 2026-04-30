import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StreakStats = {
  current_streak: number;
  longest_streak: number;
  active_days_this_month: number;
  minutes_this_month: number;
  total_quiz_correct: number;
  has_first_ai_talk: boolean;
  active_today: boolean;
};

export type Badge = {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  earned: boolean;
  progress?: { current: number; target: number };
};

export function computeBadges(s: StreakStats | null): Badge[] {
  const cs = s?.current_streak ?? 0;
  const tq = s?.total_quiz_correct ?? 0;
  const fa = s?.has_first_ai_talk ?? false;
  return [
    { id: "first_talk", emoji: "🎯", label: "首次开口", desc: "完成第一次 AI 对话", earned: fa },
    { id: "streak_7", emoji: "🔥", label: "七日坚持", desc: "连续打卡 7 天", earned: cs >= 7, progress: { current: Math.min(cs, 7), target: 7 } },
    { id: "streak_30", emoji: "💎", label: "月度坚守", desc: "连续打卡 30 天", earned: cs >= 30, progress: { current: Math.min(cs, 30), target: 30 } },
    { id: "quiz_100", emoji: "🏆", label: "百题达人", desc: "累计答对 100 道题", earned: tq >= 100, progress: { current: Math.min(tq, 100), target: 100 } },
  ];
}

export function useStreakStats(userId: string | null | undefined) {
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) { setStats(null); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_user_streak_stats" as never);
        if (cancelled) return;
        if (error) {
          console.warn("streak rpc error", error);
          setStats(null);
        } else {
          // RPC returns a setof row → array of one
          const row = data ? (Array.isArray(data) ? data[0] : data) : null;
          setStats((row ?? null) as StreakStats | null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return { stats, loading };
}