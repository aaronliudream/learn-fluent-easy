/**
 * PR-6:「我的数据」四宫格 + 每日目标环 + 打卡月历。
 *
 * 数据全部来自 vocab_user_stats / vocab_study_days,不新建表、不另算口径 ——
 * 连续天数用 stats.ts 的 computeStreak,四个 UI 不许各算各的。
 *
 * ⚠️ 未就绪一律**骨架屏,绝不渲染 0** —— 老用户看到"累计 0 分钟"是事故级体验。
 *    这条和词汇中心那次是同一个教训。
 */
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { FONT_STAT } from "@/lib/vocab/theme";
import {
  getStats, listStudyDays, setDailyGoal, computeStreak, comebackLine,
  bjToday, shiftDay, fmtDuration, GOAL_OPTIONS,
  type UserStats, type StudyDay,
} from "@/lib/vocab/stats";

/** 某月第一天 / 天数(纯字符串日历,不碰时区)。 */
function monthMeta(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { firstWeekday: first.getUTCDay(), days };
}

type Props = {
  color: string;
  /**
   * 全局累计(**跨所有词库**,按 word_id 去重)。null = 还没就绪 → 走骨架屏。
   * ⚠️ 这两个数**不随上方词库下拉切换而变** —— 它们是用户的"总资产"。
   *    所以标题只写「累计学习 / 累计掌握」,绝不带词库名;
   *    字号也刻意比上方当前词库的大字小一档,避免两层口径被读成同一个。
   */
  globalLearned: number | null;
  globalMastered: number | null;
};

export default function MyDataPanel({ color, globalLearned, globalMastered }: Props) {
  const today = bjToday();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [days, setDays] = useState<StudyDay[] | null>(null);
  const [ym, setYm] = useState(today.slice(0, 7));
  const [monthDays, setMonthDays] = useState<StudyDay[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, d] = await Promise.all([
          getStats(),
          listStudyDays(shiftDay(today, -400), today),   // 连续天数要够长的窗口
        ]);
        if (!alive) return;
        setStats(s); setDays(d);
      } catch { if (alive) { setStats(null); setDays([]); } }
    })();
    return () => { alive = false; };
  }, [today]);

  useEffect(() => {
    let alive = true;
    const from = `${ym}-01`;
    const { days: n } = monthMeta(ym);
    listStudyDays(from, `${ym}-${String(n).padStart(2, "0")}`)
      .then(r => { if (alive) setMonthDays(r); })
      .catch(() => { if (alive) setMonthDays([]); });
    return () => { alive = false; };
  }, [ym]);

  const goal = stats?.daily_goal ?? 20;
  const todayRow = (days ?? []).find(d => d.day === today);
  const todayAnswers = todayRow?.answers ?? 0;
  const todayMs = (todayRow?.seconds ?? 0) * 1000;
  const totalAnswers = useMemo(() => (days ?? []).reduce((n, d) => n + (d.answers ?? 0), 0), [days]);
  const streak = useMemo(() => (days ? computeStreak(days, goal, today) : 0), [days, goal, today]);
  const metToday = todayAnswers >= goal;
  /* 断签鼓励:昨天没达标、今天也还没达标时才出。已经在学的人不需要被安慰。 */
  const brokeStreak = !!days && streak === 0 && totalAnswers > 0 && !metToday;

  /* 全局累计没就绪也走骨架 —— 它和 stats 一样,渲染 0 就是"累计归零"的事故观感 */
  if (!stats || !days || globalLearned === null || globalMastered === null) {
    return (
      <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="mb-4 h-[22px] w-24 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-[64px] animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </div>
    );
  }

  const pct = goal > 0 ? Math.min(1, todayAnswers / goal) : 0;
  const { firstWeekday, days: dayCount } = monthMeta(ym);
  const metSet = new Set(monthDays.filter(d => (d.answers ?? 0) >= goal).map(d => d.day));
  const anySet = new Set(monthDays.filter(d => (d.answers ?? 0) > 0).map(d => d.day));

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-slate-900">我的数据</h2>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[13px] font-semibold text-amber-700">
            <Flame className="h-3.5 w-3.5" />连续 {streak} 天
          </span>
        )}
      </div>
      {/* 说清这一整块是"跨词库总计",与上方那块"当前词库"分开 */}
      <p className="mb-3 text-[12px] text-slate-400">跨所有词库累计,不随上方词库切换</p>

      {/* 四宫格:全部是**全局累计**口径 */}
      <div className="grid grid-cols-2 gap-3">
        <Cell label="累计学习" value={`${globalLearned}`} unit="词" color={color} />
        <Cell label="累计掌握" value={`${globalMastered}`} unit="词" color={color} />
        <Cell label="累计时长" value={fmtDuration(stats.total_time_ms).split(" ")[0]} unit={fmtDuration(stats.total_time_ms).split(" ")[1]} color={color} />
        <Cell label="积分" value={`${stats.total_points}`} unit="分" color={color} />
      </div>

      {/* 每日目标(今日两个数收在这里,不再单独占宫格) */}
      <div className="mt-4 border-t border-black/[0.06] pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[14px] text-slate-600">
            {/* 这里原本用的是全角空格,eslint 的 no-irregular-whitespace 一直在报;
                改成 margin,视觉一样、错误消掉 */}
            今日目标<b className="ml-2 font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{todayAnswers}/{goal}</b>
            <span className="ml-2 text-[13px] text-slate-400">今日 {fmtDuration(todayMs)}</span>
            {metToday && <span className="ml-2 text-[13px] font-medium text-emerald-600">已达标</span>}
          </span>
          <select value={goal} aria-label="每天背多少个词"
            onChange={e => { const v = Number(e.target.value); setStats(s => s ? { ...s, daily_goal: v } : s); void setDailyGoal(v); }}
            className="rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[13px] text-slate-600">
            {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g} 词/天</option>)}
          </select>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-[width] duration-500"
            style={{ width: pct > 0 ? `max(4px, ${pct * 100}%)` : 0, background: color }} />
        </div>
        {brokeStreak && (
          /* 断签文案:不指责、不施压。三套按天轮换,同一天进来看到同一句。 */
          <p className="mt-2.5 rounded-xl bg-slate-50 px-3 py-2 text-[13px] leading-relaxed text-slate-500">
            {comebackLine(today)}
          </p>
        )}
      </div>

      {/* 打卡月历 */}
      <div className="mt-4 border-t border-black/[0.06] pt-4">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" aria-label="上个月"
            onClick={() => setYm(shiftDay(`${ym}-01`, -1).slice(0, 7))}
            className="rounded-full p-1 text-slate-400"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-[14px] font-medium text-slate-700">{ym.replace("-", " 年 ")} 月</span>
          <button type="button" aria-label="下个月" disabled={ym >= today.slice(0, 7)}
            onClick={() => setYm(shiftDay(`${ym}-28`, 7).slice(0, 7))}
            className={cn("rounded-full p-1", ym >= today.slice(0, 7) ? "text-slate-200" : "text-slate-400")}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["日", "一", "二", "三", "四", "五", "六"].map(w => (
            <span key={w} className="text-[11px] text-slate-300">{w}</span>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => <span key={`pad${i}`} />)}
          {Array.from({ length: dayCount }, (_, i) => {
            const d = `${ym}-${String(i + 1).padStart(2, "0")}`;
            const future = d > today;
            return (
              <span key={d} className="flex h-7 items-center justify-center" title={d}>
                {future ? (
                  <span className="h-1.5 w-1.5 rounded-full border border-slate-200" />
                ) : metSet.has(d) ? (
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                ) : anySet.has(d) ? (
                  /* 学了但没达标:半亮。全灰会抹掉"我今天来过"这件事 */
                  <span className="h-2 w-2 rounded-full" style={{ background: color, opacity: 0.35 }} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                )}
              </span>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          实心 = 达标 · 半亮 = 学了但没到目标 · 空心 = 未来
        </p>
      </div>
    </div>
  );
}

function Cell({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50/70 px-3.5 py-3">
      <div className="text-[12px] text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-[24px] font-bold leading-none" style={{ fontFamily: FONT_STAT, color, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </span>
        <span className="text-[12px] text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
