import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight hook that fetches the *extra* data the new Dashboard hero needs
 * on top of useStreakStats() + the GPS views: name, coins, badges count,
 * pet level/name, weekly rank, today's minutes, weak-spot Top 3, and a
 * 30-day daily-minutes trend (for the sparkline).
 *
 * Each individual query is non-blocking — if a table is empty or RLS rejects
 * a row, we degrade to safe defaults instead of breaking the whole page.
 */

export type StageKey = "primary" | "junior" | "senior";

export interface WeakSpot {
  id: string;
  module: string;
  label: string;
  wrong_count: number;
  last_wrong_at: string;
}

export interface ModuleActivity {
  module: string;            // e.g. "vocab" | "grammar" | ...
  lastSeenAt: string | null; // ISO; null if no mistakes / events recorded yet
  dueNow: number;            // mistakes due now (next_review_at <= now)
  nextDueAt: string | null;  // earliest upcoming due
}

export interface DashboardExtras {
  displayName: string;
  // Gamification chips
  coins: number;
  badges: number;
  rank: number | null;        // null if no leaderboard data or opted out
  // Today
  minutesToday: number;
  dailyGoalMin: number;
  // Weak spots (top 3, unresolved, sorted by wrong_count desc)
  weakSpots: WeakSpot[];
  // 30-day daily minutes (oldest → newest, length = 30, zero-filled)
  trend30d: { date: string; minutes: number }[];
  // Week-over-week minutes delta (signed)
  weeklyMinutesDelta: number;
  // Most-recent stage (detected from learning_events; defaults to "primary")
  suggestedStage: StageKey;
  // Per-module activity rollup (used for module-card "next due" hints)
  moduleActivity: Record<string, ModuleActivity>;
  loading: boolean;
}

export const DEFAULT_DAILY_GOAL_MIN = 20;

function emptyExtras(): DashboardExtras {
  return {
    displayName: "学习者",
    coins: 0,
    badges: 0,
    rank: null,
    minutesToday: 0,
    dailyGoalMin: DEFAULT_DAILY_GOAL_MIN,
    weakSpots: [],
    trend30d: Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return { date: d.toISOString().slice(0, 10), minutes: 0 };
    }),
    weeklyMinutesDelta: 0,
    suggestedStage: "primary",
    moduleActivity: {},
    loading: true,
  };
}

export function useDashboardExtras(userId: string | null | undefined): DashboardExtras {
  const [state, setState] = useState<DashboardExtras>(emptyExtras);

  useEffect(() => {
    if (!userId) {
      setState({ ...emptyExtras(), loading: false });
      return;
    }
    let cancelled = false;
    (async () => {
      // Run everything in parallel — each .catch returns a safe fallback so
      // one failed query never blocks the others.
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const profileQ = supabase
        .from("profiles")
        .select("display_name, leaderboard_alias")
        .eq("user_id", userId)
        .maybeSingle();

      const coinsQ = supabase
        .from("user_coins")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      const badgesQ = supabase
        .from("user_badges")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      // pet_state 查询已删(2026-08-06):宠物养成展示层全站下线后,petLevel/petName
      // 一路传到 TodayHero 却从没被渲染过 —— 每次进 dashboard 白发一次跨境请求。

      const rankQ = supabase.rpc("get_weekly_leaderboard");

      const weakQ = supabase
        .from("user_mistakes")
        .select("id, module, source_label, wrong_count, last_wrong_at")
        .eq("user_id", userId)
        .eq("is_resolved", false)
        .order("wrong_count", { ascending: false })
        .order("last_wrong_at", { ascending: false })
        .limit(3);

      const trendQ = supabase
        .from("learning_events")
        .select("created_at, study_minutes, lesson_key")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo.toISOString());

      // All unresolved mistakes (we only need module + dates, not full payload).
      // Limit 500 keeps payload tiny even for power users.
      const moduleQ = supabase
        .from("user_mistakes")
        .select("module, last_wrong_at, next_review_at")
        .eq("user_id", userId)
        .eq("is_resolved", false)
        .order("last_wrong_at", { ascending: false })
        .limit(500);

      const [profileR, coinsR, badgesR, rankR, weakR, trendR, moduleR] = await Promise.all([
        profileQ, coinsQ, badgesQ, rankQ, weakQ, trendQ, moduleQ,
      ]);
      if (cancelled) return;

      // --- profile / name ---
      const displayName =
        (profileR.data?.display_name as string | null) ||
        (profileR.data?.leaderboard_alias as string | null) ||
        "学习者";

      // --- coins / badges ---
      const coins = Number(coinsR.data?.balance ?? 0) || 0;
      const badges = Number(badgesR.count ?? 0) || 0;

      // --- rank ---
      let rank: number | null = null;
      const rankRows = (rankR.data as Array<{ rank: number; is_me: boolean }> | null) ?? [];
      const me = rankRows.find((r) => r.is_me);
      if (me) rank = Number(me.rank);

      // --- weak spots ---
      const weakSpots: WeakSpot[] = (weakR.data ?? []).map((r) => ({
        id: String(r.id),
        module: String(r.module ?? ""),
        label: String(r.source_label ?? r.module ?? "未命名"),
        wrong_count: Number(r.wrong_count ?? 1),
        last_wrong_at: String(r.last_wrong_at ?? ""),
      }));

      // --- 30-day trend (zero-fill) + today minutes + stage detection ---
      type Row = { created_at: string; study_minutes: number | null; lesson_key: string | null };
      const events = (trendR.data ?? []) as Row[];
      const bucket = new Map<string, number>();
      let minutesToday = 0;
      const stageCounts: Record<StageKey, number> = { primary: 0, junior: 0, senior: 0 };
      for (const e of events) {
        const day = e.created_at.slice(0, 10);
        const mins = Number(e.study_minutes ?? 0) || 0;
        bucket.set(day, (bucket.get(day) ?? 0) + mins);
        if (new Date(e.created_at) >= todayStart) minutesToday += mins;
        const key = (e.lesson_key ?? "").toLowerCase();
        if (key.includes("primary") || key.startsWith("primary:")) stageCounts.primary += 1;
        else if (key.includes("junior") || key.startsWith("junior:")) stageCounts.junior += 1;
        else if (key.includes("senior") || key.includes("gaokao") || key.startsWith("senior:")) stageCounts.senior += 1;
      }
      const trend30d = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const k = d.toISOString().slice(0, 10);
        return { date: k, minutes: bucket.get(k) ?? 0 };
      });
      // Week-over-week minutes delta (last 7 days vs prior 7 days)
      const sumRange = (start: number, end: number) =>
        trend30d.slice(start, end).reduce((s, x) => s + x.minutes, 0);
      const last7 = sumRange(23, 30);
      const prev7 = sumRange(16, 23);
      const weeklyMinutesDelta = last7 - prev7;
      // Suggested stage = most-recent activity stage; fall back to primary
      const suggestedStage =
        (Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as StageKey) || "primary";

      // --- module activity rollup ---
      type MRow = { module: string; last_wrong_at: string; next_review_at: string };
      const nowMs = Date.now();
      const modAcc: Record<string, ModuleActivity> = {};
      for (const r of (moduleR.data ?? []) as MRow[]) {
        const m = (r.module || "").toLowerCase();
        if (!m) continue;
        const slot = modAcc[m] ?? {
          module: m, lastSeenAt: null, dueNow: 0, nextDueAt: null,
        };
        if (!slot.lastSeenAt || r.last_wrong_at > slot.lastSeenAt) slot.lastSeenAt = r.last_wrong_at;
        if (new Date(r.next_review_at).getTime() <= nowMs) slot.dueNow += 1;
        if (!slot.nextDueAt || r.next_review_at < slot.nextDueAt) slot.nextDueAt = r.next_review_at;
        modAcc[m] = slot;
      }

      setState({
        displayName,
        coins,
        badges,
        rank,
        minutesToday,
        dailyGoalMin: DEFAULT_DAILY_GOAL_MIN,
        weakSpots,
        trend30d,
        weeklyMinutesDelta,
        suggestedStage: stageCounts[suggestedStage] > 0 ? suggestedStage : "primary",
        moduleActivity: modAcc,
        loading: false,
      });
    })().catch((err) => {
      console.warn("useDashboardExtras error", err);
      if (!cancelled) setState({ ...emptyExtras(), loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}
