import { T } from "@/i18n/T";

/**
 * Hero card: greeting + today's goal progress + streak + 4 gamification chips.
 * All data comes pre-fetched from useStreakStats + useDashboardExtras.
 */
export function TodayHero(props: {
  displayName: string;
  currentStreak: number;
  minutesToday: number;
  dailyGoalMin: number;
  coins: number;
  badges: number;
  rank: number | null;
}) {
  // petLevel/petName 已随 pet_state 死查询一并删除(2026-08-06):宠物板块下线后
  // 这两个 prop 从没被渲染过,却让 dashboard 每次多发一次跨境请求。
  const {
    displayName, currentStreak, minutesToday, dailyGoalMin,
    coins, badges, rank,
  } = props;
  const goalPct = Math.min(100, Math.round((minutesToday / Math.max(1, dailyGoalMin)) * 100));
  const minsLeft = Math.max(0, dailyGoalMin - minutesToday);
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
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-85 tabular-nums">{dateStr}</div>
          <div className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight">
            {greeting}<T>，</T>
            <span className="whitespace-nowrap">{displayName}</span>
            <span className="opacity-80 font-bold mx-1">·</span>
            <T>准备好今天的学习吗？</T>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-3xl leading-none">🔥</div>
          <div className="text-2xl font-extrabold tabular-nums leading-none">{currentStreak}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-85"><T>天连续</T></div>
        </div>
      </div>

      {/* Today goal */}
      <div className="relative mt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-bold opacity-95"><T>今日目标</T></div>
          <div className="text-sm font-bold tabular-nums">
            <span className="text-base">{minutesToday}</span> / {dailyGoalMin} <span className="opacity-80"><T>分钟</T></span>
          </div>
        </div>
        <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${goalPct}%` }} />
        </div>
        <div className="mt-1 text-xs opacity-90">
          {minsLeft > 0
            ? <><T>还差</T> {minsLeft} <T>分钟，今天就能保住连胜！</T></>
            : <T>🎉 今日目标已完成！</T>}
        </div>
      </div>

      {/* chips */}
      <div className="relative mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
        <Chip emoji="🪙" value={coins.toLocaleString()} label="coins" />
        <Chip emoji="🏆" value={badges.toLocaleString()} label="badges" />
        <Chip emoji="🥇" value={rank ? `#${rank}` : "—"} label="本周排名" />
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
  return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")} · ${String(d.getDate()).padStart(2, "0")} · ${wk}`;
}
