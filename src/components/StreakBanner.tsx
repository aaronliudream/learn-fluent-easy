import { Flame, Clock, Trophy, Sparkles } from "lucide-react";
import { useStreakStats, computeBadges } from "@/hooks/useStreakStats";
import { T } from "@/i18n/T";

type Props = { userId: string | null | undefined };

export function StreakBanner({ userId }: Props) {
  const { stats } = useStreakStats(userId);
  if (!userId) return null;

  const badges = computeBadges(stats);
  const earnedCount = badges.filter(b => b.earned).length;
  const cs = stats?.current_streak ?? 0;
  const mins = stats?.minutes_this_month ?? 0;
  const days = stats?.active_days_this_month ?? 0;
  const activeToday = stats?.active_today ?? false;

  return (
    <div className="mb-5 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-4 shadow-sm">
      {/* Top row: 3 stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat
          icon={<Flame className={`size-5 ${cs > 0 ? "text-orange-500" : "text-muted-foreground"}`} />}
          value={cs}
          unit={<T>天</T>}
          label={<T>连续打卡</T>}
          accent={cs > 0}
        />
        <Stat
          icon={<Clock className="size-5 text-sky-600" />}
          value={mins}
          unit={<T>分</T>}
          label={<><T>本月学习</T> · {days}<T>天</T></>}
        />
        <Stat
          icon={<Trophy className="size-5 text-amber-600" />}
          value={earnedCount}
          unit={`/${badges.length}`}
          label={<T>徽章</T>}
        />
      </div>

      {/* Today status pill */}
      <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-white/70 px-3 py-2 text-xs">
        {activeToday ? (
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <Sparkles className="size-3.5" /> <T>今日已打卡 ✓</T>
          </span>
        ) : (
          <span className="font-semibold text-orange-700">
            <T>今天还没打卡，做点什么都算 →</T>
          </span>
        )}
        {cs >= 2 && !activeToday && (
          <span className="text-rose-600"><T>别中断哦</T></span>
        )}
      </div>

      {/* Badges row */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {badges.map(b => (
          <div
            key={b.id}
            title={`${b.label} · ${b.desc}`}
            className={`flex shrink-0 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-center transition ${
              b.earned
                ? "bg-white shadow-sm ring-1 ring-amber-300"
                : "bg-white/40 opacity-60 grayscale"
            }`}
          >
            <span className="text-2xl leading-none">{b.emoji}</span>
            <span className="text-[10px] font-bold leading-tight"><T>{b.label}</T></span>
            {!b.earned && b.progress && (
              <span className="text-[9px] text-muted-foreground">{b.progress.current}/{b.progress.target}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, value, unit, label, accent }: { icon: React.ReactNode; value: number | string; unit: React.ReactNode; label: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/70 px-2 py-2.5">
      <div className="mb-0.5">{icon}</div>
      <div className={`flex items-baseline gap-0.5 ${accent ? "text-orange-600" : "text-foreground"}`}>
        <span className="text-xl font-extrabold leading-none">{value}</span>
        <span className="text-[11px] font-semibold opacity-80">{unit}</span>
      </div>
      <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}