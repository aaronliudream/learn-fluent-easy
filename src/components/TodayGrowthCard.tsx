import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Target, BookOpen, Brain, Clock, TrendingUp, Sparkles } from "lucide-react";
import { getDailyStats, type DailyStats } from "@/lib/dailyStats";
import { cn } from "@/lib/utils";

/**
 * 「今日成长」卡片 — 展示当天学习量
 * 设计参考 Khan Academy / Duolingo / Class Dojo：
 *   ① 一眼可见的成就：完成数 / 新词 / 阅读
 *   ② 进度条直观显示日目标完成度
 *   ③ 连续天数 streak 制造正向驱动
 */
export function TodayGrowthCard({ compact = false }: { compact?: boolean }) {
  const [s, setS] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDailyStats().then(d => { if (mounted) { setS(d); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
        正在统计今日成长…
      </div>
    );
  }
  if (!s) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
        登录后查看你的今日成长 ✨
      </div>
    );
  }

  const taskPct = Math.min(100, Math.round((s.tasks / Math.max(1, s.goalTasks)) * 100));
  const minPct = Math.min(100, Math.round((s.minutes / Math.max(1, s.goalMinutes)) * 100));
  const goalReached = s.tasks >= s.goalTasks && s.minutes >= s.goalMinutes;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 p-5 text-white shadow-tile",
      compact && "p-4"
    )}>
      <span className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-white/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">TODAY · 今日成长</div>
          <div className="mt-1 text-xl font-extrabold">
            {goalReached ? "🎉 今日目标已达成！" : s.tasks === 0 ? "🌱 今天还没开始呢" : "💪 继续加油"}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 text-sm font-extrabold">
          <Flame className="size-4 fill-orange-300 stroke-orange-300" /> {s.streakDays} 天
        </div>
      </div>

      {/* Goal progress bars */}
      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <ProgressTile icon={<Target className="size-3.5" />} label="任务" value={`${s.tasks}/${s.goalTasks}`} pct={taskPct} />
        <ProgressTile icon={<Clock className="size-3.5" />} label="时长" value={`${s.minutes}/${s.goalMinutes}分`} pct={minPct} />
      </div>

      {/* Achievements grid */}
      <div className="relative mt-3 grid grid-cols-3 gap-2">
        <Stat icon={<Sparkles className="size-4" />} value={s.newWords} label="新掌握词" />
        <Stat icon={<Brain className="size-4" />} value={s.reviewedWords} label="复习词" />
        <Stat icon={<BookOpen className="size-4" />} value={s.readingDone} label="读完篇" />
      </div>

      {/* Accuracy & link */}
      <div className="relative mt-3 flex items-center justify-between text-[11px]">
        <div className="inline-flex items-center gap-1 opacity-90">
          <TrendingUp className="size-3" />
          准确率 {Math.round(s.accuracy * 100)}% · 答对 {s.correct} 题
        </div>
        <Link to="/parent" className="rounded-full bg-white/25 px-2.5 py-0.5 font-bold hover:bg-white/35">
          家长报告 →
        </Link>
      </div>
    </div>
  );
}

function ProgressTile({ icon, label, value, pct }: { icon: React.ReactNode; label: string; value: string; pct: number }) {
  return (
    <div className="rounded-2xl bg-white/20 p-2.5">
      <div className="flex items-center justify-between text-[11px] font-bold opacity-95">
        <span className="inline-flex items-center gap-1">{icon} {label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25">
        <div className="h-full bg-white shadow-sm transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 opacity-90">{icon}</div>
      <div className="text-xl font-black leading-none">{value}</div>
      <div className="mt-0.5 text-[10px] opacity-90">{label}</div>
    </div>
  );
}
