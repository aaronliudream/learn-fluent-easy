import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Star, Flame, Trophy, Map as MapIcon, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";

// Phase 1 删除项:6 个能力按钮入口、"今日 10 词挑战"独立卡 — 都并入未来的冒险流(阶段 2)。
// 这个页面降级为"完整学习地图"详情页,不再是默认入口。

type LessonRow = {
  id: string;title_cn: string;title_en: string | null;estimated_minutes: number;
  primary_skill: string;sort_order: number;
  unit: {id: string;title_cn: string;emoji: string | null;sort_order: number;};
  progress?: {stars: number;completed_at: string | null;}[];
};

// 勋章定义（基于已有数据派生）
type BadgeDef = {key: string;emoji: string;title: string;check: (s: BadgeStats) => boolean;hint: string;};
type BadgeStats = {totalDone: number;totalStars: number;perfectLessons: number;streak: number;unitsCleared: number;cultureSeen: boolean;};
const BADGES: BadgeDef[] = [
{ key: "first", emoji: "🌱", title: "启程", hint: "完成 1 课", check: (s) => s.totalDone >= 1 },
{ key: "five", emoji: "🚀", title: "小火箭", hint: "完成 5 课", check: (s) => s.totalDone >= 5 },
{ key: "ten", emoji: "⭐", title: "十全十美", hint: "完成 10 课", check: (s) => s.totalDone >= 10 },
{ key: "perfect", emoji: "💎", title: "三星达人", hint: "3 课全 ⭐⭐⭐", check: (s) => s.perfectLessons >= 3 },
{ key: "streak3", emoji: "🔥", title: "三日连击", hint: "连续 3 天", check: (s) => s.streak >= 3 },
{ key: "streak7", emoji: "🏆", title: "七日王者", hint: "连续 7 天", check: (s) => s.streak >= 7 },
{ key: "stars30", emoji: "✨", title: "星光熠熠", hint: "累计 30 颗星", check: (s) => s.totalStars >= 30 },
{ key: "unit", emoji: "🏝️", title: "登岛者", hint: "通关 1 个单元", check: (s) => s.unitsCleared >= 1 }];


function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(dates.map((d) => d.slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  for (let i = 0; i < 365; i++) {
    const key = cur.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cur.setDate(cur.getDate() - 1);
    } else if (i === 0) {
      // 今天没学，看昨天起算
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// 能力雷达图（SVG，无依赖）
function RadarChart({ scores }: {scores: {label: string;value: number;}[];}) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 65;
  const n = scores.length;
  const angle = (i: number) => Math.PI * 2 * i / n - Math.PI / 2;
  const point = (i: number, v: number) => {
    const rr = r * Math.max(0.05, Math.min(1, v));
    return [cx + Math.cos(angle(i)) * rr, cy + Math.sin(angle(i)) * rr];
  };
  const polygon = scores.map((s, i) => point(i, s.value).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-full">
      {[0.25, 0.5, 0.75, 1].map((f) =>
      <polygon
        key={f}
        points={scores.map((_, i) => {
          const [x, y] = [cx + Math.cos(angle(i)) * r * f, cy + Math.sin(angle(i)) * r * f];
          return `${x},${y}`;
        }).join(" ")}
        className="fill-none stroke-muted-foreground/15"
        strokeWidth={1} />

      )}
      {scores.map((_, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="stroke-muted-foreground/15" strokeWidth={1} />;
      })}
      <polygon points={polygon} className="fill-primary/30 stroke-primary" strokeWidth={2} />
      {scores.map((s, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * (r + 12), cy + Math.sin(angle(i)) * (r + 12)];
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[9px] font-bold">
            <T>{s.label}</T>
          </text>);

      })}
    </svg>);

}

export default function PrimaryGrade() {
  const { grade } = useParams<{grade: string;}>();
  const g = Number(grade ?? "3");
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.
      from("primary_lessons").
      select("id,title_cn,title_en,estimated_minutes,primary_skill,sort_order,unit:primary_units!inner(id,title_cn,emoji,sort_order,grade),progress:primary_lesson_progress(stars,completed_at)").
      eq("unit.grade", g).
      order("sort_order");
      setLessons((data ?? []) as any);
      setLoading(false);
    })();
  }, [g]);

  const nextLesson = lessons.find((l) => !(l.progress && l.progress.length)) ?? lessons[0];

  // 能力雷达：按 primary_skill 分组完成率
  const skillBuckets: Record<string, {done: number;total: number;}> = {
    listening: { done: 0, total: 0 },
    reading: { done: 0, total: 0 },
    speaking: { done: 0, total: 0 },
    writing: { done: 0, total: 0 },
    vocab: { done: 0, total: 0 }
  };
  lessons.forEach((l) => {
    const k = (l.primary_skill || "vocab").toLowerCase();
    const bucket = skillBuckets[k] ?? skillBuckets.vocab;
    bucket.total += 1;
    if (l.progress?.[0]?.completed_at) bucket.done += 1;
  });
  const radarScores = [
  { label: "听", value: skillBuckets.listening.total ? skillBuckets.listening.done / skillBuckets.listening.total : 0.05 },
  { label: "说", value: skillBuckets.speaking.total ? skillBuckets.speaking.done / skillBuckets.speaking.total : 0.05 },
  { label: "读", value: skillBuckets.reading.total ? skillBuckets.reading.done / skillBuckets.reading.total : 0.05 },
  { label: "写", value: skillBuckets.writing.total ? skillBuckets.writing.done / skillBuckets.writing.total : 0.05 },
  { label: "词", value: skillBuckets.vocab.total ? skillBuckets.vocab.done / skillBuckets.vocab.total : 0.05 }];

  const totalDone = lessons.filter((l) => l.progress?.[0]?.completed_at).length;
  const totalAll = lessons.length;
  const overallPct = totalAll ? Math.round(totalDone / totalAll * 100) : 0;

  // 勋章 & 连续打卡 数据
  const completedDates = lessons.map((l) => l.progress?.[0]?.completed_at).filter(Boolean) as string[];
  const totalStars = lessons.reduce((sum, l) => sum + (l.progress?.[0]?.stars ?? 0), 0);
  const perfectLessons = lessons.filter((l) => (l.progress?.[0]?.stars ?? 0) >= 3).length;
  const streak = computeStreak(completedDates);
  // 按 unit 分组
  const unitsMap = new Map<string, {id: string;title_cn: string;emoji: string | null;sort_order: number;lessons: LessonRow[];}>();
  lessons.forEach((l) => {
    const u = unitsMap.get(l.unit.id);
    if (u) u.lessons.push(l);else
    unitsMap.set(l.unit.id, { ...l.unit, lessons: [l] });
  });
  const units = Array.from(unitsMap.values()).sort((a, b) => a.sort_order - b.sort_order);
  const unitsCleared = units.filter((u) => u.lessons.every((l) => l.progress?.[0]?.completed_at)).length;
  const badgeStats: BadgeStats = { totalDone, totalStars, perfectLessons, streak, unitsCleared, cultureSeen: false };
  const earnedCount = BADGES.filter((b) => b.check(badgeStats)).length;
  // 解锁逻辑：上一个单元全部通关才解锁下一个
  let unlockedSoFar = true;
  const unitStates = units.map((u, idx) => {
    const isUnlocked = idx === 0 || unlockedSoFar;
    const allDone = u.lessons.every((l) => l.progress?.[0]?.completed_at);
    if (!allDone) unlockedSoFar = false;
    const doneCount = u.lessons.filter((l) => l.progress?.[0]?.completed_at).length;
    const totalCount = u.lessons.length;
    return { ...u, isUnlocked, allDone, doneCount, totalCount, current: isUnlocked && !allDone };
  });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 pb-24 text-base">
      <BackLink to="/primary" className="mb-3 inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-5" /> <T>返回年级选择</T>
      </BackLink>

      {/* 顶部迷你状态栏 — 一行三个迷你徽章 */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">G{g}</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Flame className="size-4 text-orange-500" /> <b className="text-orange-600">{streak}</b> <T>天</T>
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Trophy className="size-4 text-amber-500" /> <b className="text-amber-600">{earnedCount}</b>/{BADGES.length}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Star className="size-4 fill-amber-400 stroke-amber-500" /> <b className="text-amber-600">{totalStars}</b>
          </span>
        </div>
        <Link
          to="/parent"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-extrabold text-white shadow-md ring-2 ring-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg dark:ring-emerald-900"
          aria-label="进入家长后台">
          <T>📊 家长后台</T>
        
        </Link>
      </div>

      {/* 🌟 主 CTA — 今天的冒险 */}
      {nextLesson ?
      <Link to={`/primary/lesson/${nextLesson.id}`}
      className="mb-3 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 p-5 text-white shadow-tile transition hover:-translate-y-0.5 hover:scale-[1.01]">
          <div className="grid size-16 shrink-0 place-items-center rounded-3xl bg-white/25 text-4xl backdrop-blur-sm">{nextLesson.unit.emoji ?? "🏝️"}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider opacity-90"><T>陪 Spark 出发</T></div>
            <div className="truncate text-2xl font-extrabold leading-tight">{nextLesson.title_cn}</div>
            <div className="mt-1 text-sm opacity-90">{nextLesson.unit.title_cn} <T>· 约</T> {nextLesson.estimated_minutes || 8} <T>分钟</T></div>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white/30 backdrop-blur-sm">
            <Play className="size-6 fill-white" />
          </div>
        </Link> :
      !loading &&
      <div className="mb-3 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-5 text-center text-white shadow-tile">
          <div className="text-4xl">🏆</div>
          <div className="mt-1 text-lg font-extrabold"><T>已完成本年级所有课程！</T></div>
        </div>
      }

      {/* Phase 1: 删除"今日 10 词"独立卡 + 6 能力按钮 → 全部并入未来的冒险流。
            这个页面现在只剩"完整学习地图"+"成就",作为详情页存在。 */}

      {/* 🗺 学习地图（按单元分岛） — 主要进度可视化 */}
      {!loading && units.length > 0 &&
      <section className="mb-5">
          <div className="mb-2 flex items-center gap-2 text-base font-extrabold">
            <MapIcon className="size-5 text-emerald-500" /> <T>学习地图</T>
            <span className="ml-auto text-xs font-normal text-muted-foreground">{totalDone}/{totalAll} <T>课</T></span>
          </div>
          <div className="space-y-2">
            {unitStates.map((u, idx) =>
          <div key={u.id} className={`rounded-2xl border-2 p-3 transition ${u.current ? "border-rose-300 bg-gradient-to-br from-rose-50 to-amber-50 shadow-tile dark:border-rose-700 dark:from-rose-950/30 dark:to-amber-950/30" : u.allDone ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30" : u.isUnlocked ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"}`}>
                <div className="mb-2 flex items-center gap-2">
                  <div className={`grid size-10 place-items-center rounded-xl text-xl shadow-sm ${u.allDone ? "bg-gradient-to-br from-emerald-400 to-teal-400 text-white" : u.isUnlocked ? "bg-gradient-to-br from-amber-300 to-rose-300" : "bg-muted"}`}>
                    {u.isUnlocked ? u.emoji ?? "🏝️" : "🔒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><T>岛屿</T> {idx + 1}{u.current && " · 你在这里"}</div>
                    <div className="truncate text-base font-extrabold">{u.title_cn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold">{u.doneCount}/{u.totalCount}</div>
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all" style={{ width: `${u.totalCount ? u.doneCount / u.totalCount * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
                {u.isUnlocked &&
            <div className="flex flex-wrap gap-1.5">
                    {u.lessons.map((l) => {
                const stars = l.progress?.[0]?.stars ?? 0;
                const done = !!l.progress?.[0]?.completed_at;
                return (
                  <Link key={l.id} to={`/primary/lesson/${l.id}`}
                  className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition hover:-translate-y-0.5 ${done ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-border bg-card hover:border-amber-300"}`}>
                          <span className="truncate max-w-[140px]">{l.title_cn}</span>
                          <span className="flex">
                            {Array.from({ length: 3 }).map((_, i) =>
                      <Star key={i} className={`size-2.5 ${i < stars ? "fill-amber-400 stroke-amber-500" : "stroke-muted-foreground/40"}`} />
                      )}
                          </span>
                        </Link>);

              })}
                  </div>
            }
                {!u.isUnlocked &&
            <div className="text-center text-xs text-muted-foreground"><T>通关上一岛即可解锁 🔓</T></div>
            }
              </div>
          )}
          </div>
        </section>
      }

      {/* 🏆 我的成就 — 折叠抽屉（默认收起） */}
      <details className="mb-4 rounded-2xl border-2 border-border bg-card">
        <summary className="flex cursor-pointer items-center gap-2 p-3.5 text-base font-extrabold list-none">
          <Trophy className="size-5 text-amber-500" />
          <span><T>我的成就</T></span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
            <T>勋章</T> {earnedCount}/{BADGES.length} <T>· 总进度</T> {overallPct}%
            <ChevronDown className="size-4 transition group-open:rotate-180" />
          </span>
        </summary>
        <div className="border-t p-3">
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map((b) => {
              const got = b.check(badgeStats);
              return (
                <div key={b.key} title={b.hint} className={`rounded-xl border-2 p-2 text-center transition ${got ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-950/30 dark:to-orange-950/30" : "border-border bg-muted/30 opacity-50 grayscale"}`}>
                  <div className="text-xl">{b.emoji}</div>
                  <div className="mt-0.5 text-[10px] font-extrabold"><T>{b.title}</T></div>
                  <div className="text-[9px] text-muted-foreground leading-tight"><T>{b.hint}</T></div>
                </div>);

            })}
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-muted/30 p-2.5">
            <div className="size-20 shrink-0">
              <RadarChart scores={radarScores} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-extrabold"><T>五维能力</T></div>
              <div className="mt-1 grid grid-cols-5 gap-1 text-center">
                {radarScores.map((s) =>
                <div key={s.label} className="rounded bg-card px-0.5 py-0.5">
                    <div className="text-[9px] font-bold text-muted-foreground"><T>{s.label}</T></div>
                    <div className="text-[10px] font-extrabold text-primary">{Math.round(s.value * 100)}%</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* 隐藏的阶段测试入口 */}
      {!loading && units.length > 0 &&
      <div className="mb-4">
          <ModuleStageTests segment="primary" grade={g} module="vocab" />
        </div>
      }
    </main>);

}