import { T } from "@/i18n/T";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Parent-facing hero card replacing the previous tiny `<p>` of mixed metadata.
 *
 * Layout: greeting + child name → 3 headline metrics (this-week minutes / today
 * goal / month active days) → 4 gamification chips (coins / badges / pet / rank).
 *
 * Coins, streak, daily_minutes, and displayName are passed in (already fetched
 * by GlobalParent). The remaining chips (badges count, pet level, weekly rank)
 * are fetched here in parallel with safe fallbacks so the hero never blocks.
 */
export function ThisWeekHero(props: {
  displayName: string;
  currentStreak: number;
  coins: number;
  /** Daily minutes for the last N days (oldest → newest). Last entry == today. */
  dailyMinutes: { d: string; mins: number }[];
  /** Active days this month (from useStreakStats). */
  activeDaysThisMonth: number;
  /** Main stage (primary | junior | gaokao | null). */
  mainStageLabel: string | null;
  /** Daily-goal minutes (kept consistent with student dashboard default = 20). */
  dailyGoalMin?: number;
  onPrintPdf: () => void;
}) {
  const {
    displayName, currentStreak, coins, dailyMinutes,
    activeDaysThisMonth, mainStageLabel, dailyGoalMin = 20, onPrintPdf,
  } = props;

  const [badges, setBadges] = useState(0);
  const [petLevel, setPetLevel] = useState(1);
  const [petName, setPetName] = useState("Spark");
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) return;
      const [badgesR, petR, rankR] = await Promise.all([
        supabase.from("user_badges").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("pet_state").select("name, level").eq("user_id", uid).maybeSingle(),
        supabase.rpc("get_weekly_leaderboard"),
      ]);
      if (cancelled) return;
      setBadges(Number(badgesR.count ?? 0) || 0);
      if (petR.data) {
        setPetLevel(Number((petR.data as { level?: number }).level ?? 1) || 1);
        setPetName(String((petR.data as { name?: string }).name ?? "Spark"));
      }
      const me = ((rankR.data as Array<{ rank: number; is_me: boolean }> | null) ?? [])
        .find((r) => r.is_me);
      if (me) setRank(Number(me.rank));
    })();
    return () => { cancelled = true; };
  }, []);

  // Derive: this-week total minutes, today minutes, week-over-week delta.
  const today = todayKey();
  const todayMins = dailyMinutes.find((d) => d.d === today)?.mins ?? 0;
  // Last 7 vs prior 7
  const sorted = [...dailyMinutes].sort((a, b) => a.d.localeCompare(b.d));
  const last7 = sorted.slice(-7).reduce((s, x) => s + x.mins, 0);
  const prev7 = sorted.slice(-14, -7).reduce((s, x) => s + x.mins, 0);
  const wowPct = prev7 > 0
    ? Math.round(((last7 - prev7) / prev7) * 100)
    : (last7 > 0 ? 100 : 0);
  const wowPositive = wowPct >= 0;

  const goalPct = Math.min(100, Math.round((todayMins / Math.max(1, dailyGoalMin)) * 100));
  const minsLeft = Math.max(0, dailyGoalMin - todayMins);
  const greeting = hourGreeting();
  const dateStr = todayLabel();

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-[0_18px_40px_-14px_rgba(237,63,140,0.45)]"
      style={{ backgroundImage: "linear-gradient(135deg,#7B3FF1 0%,#ED3F8C 55%,#F47C45 100%)" }}>
      {/* decorative moon glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-white/15 blur-xl" aria-hidden />
      <div className="pointer-events-none absolute right-8 top-6 size-24 rounded-full bg-white/25" aria-hidden />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-85 tabular-nums">
            <T>家长中心</T> · {dateStr}
          </div>
          <div className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight">
            {greeting}<T>，</T><span className="whitespace-nowrap">{displayName}</span>
            <span className="opacity-80 font-bold mx-1">·</span>
            <T>这周表现很棒！</T>
          </div>
          {mainStageLabel && (
            <div className="mt-1 text-sm opacity-90">
              <T>主修</T> <span className="font-bold">{mainStageLabel}</span> · 🔥 {currentStreak} <T>天连续打卡</T>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-3xl leading-none">🔥</div>
          <div className="text-2xl font-extrabold tabular-nums leading-none">{currentStreak}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-85"><T>day streak</T></div>
        </div>
      </div>

      {/* 3 headline metrics */}
      <div className="relative mt-6 grid md:grid-cols-3 gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85"><T>本周累计学习</T></div>
          <div className="mt-1 text-3xl md:text-4xl font-extrabold tabular-nums leading-none">
            {Math.floor(last7 / 60)}<span className="text-xl opacity-90">h</span> {last7 % 60}<span className="text-xl opacity-90">m</span>
          </div>
          <div className="mt-1 text-xs font-bold opacity-95">
            {wowPositive ? "↑ +" : "↓ "}{wowPct}% <T>vs 上周</T>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85"><T>今日目标</T></div>
          <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${goalPct}%` }} />
          </div>
          <div className="mt-1 text-xs">
            <b className="tabular-nums">{todayMins} / {dailyGoalMin}</b> <T>分钟</T> ·
            {minsLeft > 0 ? <> <T>还差</T> {minsLeft} <T>分钟</T></> : <> 🎉 <T>已完成</T></>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85"><T>本月活跃</T></div>
          <div className="mt-1 text-3xl md:text-4xl font-extrabold tabular-nums leading-none">
            {activeDaysThisMonth}<span className="text-xl opacity-90"><T>天</T></span>
          </div>
          <div className="mt-1 text-xs opacity-90">
            <T>30 天里学习</T> {activeDaysThisMonth} <T>天</T>
          </div>
        </div>
      </div>

      {/* 4 gamification chips */}
      <div className="relative mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
        <Chip emoji="🪙" value={coins.toLocaleString()} label="coins" />
        <Chip emoji="🏆" value={badges.toLocaleString()} label="badges" />
        <Chip emoji="🐉" value={`Lv.${petLevel}`} label={`pet · ${petName}`} />
        <Chip emoji="🥇" value={rank ? `#${rank}` : "—"} label="本周排名" />
      </div>

      {/* Action row */}
      <div className="relative mt-5 flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={onPrintPdf}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/95 text-foreground text-sm font-bold px-4 py-2 hover:bg-white">
          <Download className="size-4" /> <T>导出 PDF</T>
        </button>
      </div>
    </section>
  );
}

function Chip({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2 flex items-center gap-2">
      <div className="text-2xl">{emoji}</div>
      <div>
        <div className="text-lg font-extrabold tabular-nums leading-none">{value}</div>
        <div className="text-[10px] opacity-85 uppercase tracking-wider"><T>{label}</T></div>
      </div>
    </div>
  );
}

function hourGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return "🌙 凌晨好";
  if (h < 12) return "🌅 早上好";
  if (h < 14) return "🌞 中午好";
  if (h < 18) return "☀️ 下午好";
  return "🌙 晚上好";
}

function todayLabel() {
  const d = new Date();
  const wk = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
  return `${d.getFullYear()} / ${String(d.getMonth() + 1).padStart(2, "0")} / ${String(d.getDate()).padStart(2, "0")} · ${wk}`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
