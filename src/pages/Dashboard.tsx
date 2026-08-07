import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { MasteryBar, MasteryCounts } from "@/components/learning-center/MasteryBar";
import { enrichMasteryGpsData } from "@/lib/enrichMasteryGps";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShareButton } from "@/components/share/ShareButton";
import { useStreakStats } from "@/hooks/useStreakStats";
import { StageContinueCta } from "@/components/mastery/StageContinueCta";
import { useDashboardExtras, type StageKey, type ModuleActivity } from "@/hooks/useDashboardExtras";
import { getContinueTarget } from "@/lib/dashboardContinue";
import { TodayHero } from "@/components/dashboard/TodayHero";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { WeakSpots } from "@/components/dashboard/WeakSpots";
import { TrendChart } from "@/components/dashboard/TrendChart";

/**
 * Hub Dashboard — student-facing.
 *
 * Layout (top → bottom):
 *   1. TodayHero       — greeting + today's goal + streak + 4 chips
 *   2. TodayTasks      — curated 3 tasks for today (left, 3/5 cols)
 *      WeakSpots       — top 3 user_mistakes (right, 2/5 cols)
 *   3. TrendChart      — 30-day minutes sparkline + WoW delta
 *   4. Stage tabs      — auto-defaults to user's most-active stage
 *      StageView       — overview card + merged SkillRadar + module grid
 *   5. Grammar panorama link (footer)
 *
 * Data sources:
 *   - useStreakStats          (streak, today-active, month minutes)
 *   - useDashboardExtras      (hero chips, weak spots, trend, per-module
 *                              activity, suggested stage, today minutes)
 *   - enrichMasteryGpsData    (mastery_with_proportions enriched with corpus
 *                              vocab stats — identical to LearningCenter)
 */

interface GPSStat {
  master: number; fluent: number; weak: number; none: number;
  total: number; score_pct: number;
}
interface GPSModuleStat extends GPSStat { module: string; }

const ZERO: GPSStat = { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 };

const STAGES = [
  { key: "primary", label: "小学", sub: "G1-G6",          route: "/primary" },
  { key: "junior",  label: "初中", sub: "G7-G9 · 中考",   route: "/junior"  },
  { key: "senior",  label: "高中", sub: "G10-G12 · 高考", route: "/gaokao"  },
] as const;

const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读", lesson: "课程",
};
const MODULE_EMOJI: Record<string, string> = {
  vocab: "📖", grammar: "🔤", reading: "📃", listening: "🎧",
  writing: "✍️", cloze: "🧩", phonics: "🔠", lesson: "📚",
};

const MODULE_ROUTES: Record<StageKey, Record<string, string>> = {
  primary: { vocab: "/primary", reading: "/primary", lesson: "/primary", phonics: "/primary", listening: "/primary", writing: "/primary" },
  junior:  { vocab: "/junior/vocab",  reading: "/junior/reading",  grammar: "/junior/grammar", listening: "/junior/listening", writing: "/junior/writing", cloze: "/junior/cloze" },
  senior:  { vocab: "/gaokao/vocab",  reading: "/gaokao/reading",  grammar: "/gaokao/grammar", cloze: "/gaokao/cloze" },
};

function num(v: unknown): number { return Number(v) || 0; }

function aggregateScopes(rows: Record<string, unknown>[]): GPSStat {
  const a = { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 };
  for (const r of rows) {
    a.master += num(r.master_count);
    a.fluent += num(r.fluent_count);
    a.weak   += num(r.weak_count);
    a.none   += num(r.none_count);
    a.total  += num(r.scope_total);
  }
  if (a.total > 0) {
    a.score_pct = Math.round((a.master + a.fluent * 0.7 + a.weak * 0.3) / a.total * 1000) / 10;
  }
  return a;
}

/* ─── Stat tile ─── */
function StatCard({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <div className={`text-xl font-extrabold tabular-nums ${tone}`}>{n.toLocaleString()}</div>
      <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground"><T>{label}</T></div>
    </div>
  );
}

/* ─── Per-module due-status pill ─── */
function ModuleDueHint({ activity }: { activity: ModuleActivity | undefined }) {
  if (!activity) return null;
  if (activity.dueNow > 0) {
    return (
      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
        🔴 <T>待复习</T> {activity.dueNow}
      </span>
    );
  }
  if (activity.nextDueAt) {
    const diff = new Date(activity.nextDueAt).getTime() - Date.now();
    const days = Math.ceil(diff / 86_400_000);
    if (days <= 1) {
      return <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">🟡 <T>明天到期</T></span>;
    }
    if (days <= 3) {
      return <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">🟡 {days} <T>天后到期</T></span>;
    }
    return <span className="text-[11px] text-muted-foreground">🟢 <T>已规划</T></span>;
  }
  return null;
}

function relTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return "—";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return mins <= 1 ? "刚刚" : `${mins} 分钟前`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "昨天";
  if (days < 7)   return `${days} 天前`;
  return `${Math.round(days / 7)} 周前`;
}

/* ─── StageView (overview + radar + module grid) ─── */
function StageView({
  stage, stat, modules, moduleActivity,
}: {
  stage: StageKey;
  stat: GPSStat;
  modules: GPSModuleStat[];
  moduleActivity: Record<string, ModuleActivity>;
}) {
  const stageRoute = STAGES.find((s) => s.key === stage)?.route ?? "/";
  const stageLabel = STAGES.find((s) => s.key === stage)?.label ?? "";

  // Derive continue CTA from GPS data
  const sortedByWeak = [...modules].filter((m) => m.total > 0).sort((a, b) => b.weak - a.weak);
  const weakMod   = sortedByWeak.find((m) => m.weak > 0);
  const fluentMod = modules.find((m) => m.fluent > 0);
  const continueMod = weakMod ?? fluentMod ?? modules.find((m) => m.total > 0);
  const continueKind = weakMod ? "weak" : fluentMod ? "fluent" : "new";
  const continueRoute = continueMod
    ? (MODULE_ROUTES[stage]?.[continueMod.module] ?? stageRoute)
    : stageRoute;
  const continueTone =
    continueKind === "weak"   ? "from-orange-500 to-rose-500" :
    continueKind === "fluent" ? "from-indigo-500 to-violet-500" :
                                "from-emerald-500 to-teal-500";
  const continueTitle =
    continueKind === "weak"
      ? `${MODULE_EMOJI[continueMod?.module ?? ""] ?? ""} ${MODULE_LABEL[continueMod?.module ?? ""] ?? ""} · 薄弱 ${continueMod?.weak ?? 0} 项`
      : continueKind === "fluent"
      ? `${MODULE_EMOJI[continueMod?.module ?? ""] ?? ""} 继续 ${MODULE_LABEL[continueMod?.module ?? ""] ?? ""}`
      : `开始${stageLabel}英语`;
  const continueSubtitle =
    continueKind === "weak"   ? "需要强化训练，先攻最薄弱的" :
    continueKind === "fluent" ? `已熟悉 ${continueMod?.fluent ?? 0} 项，继续冲击掌握` :
                                "从第 1 项开始";

  if (!stat || (stat.total === 0 && modules.length === 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
        {stage === "primary"
          ? <T>小学掌握度从现在起开始记录，做几关新题就会显示（历史进度暂未迁移）。</T>
          : <T>还没有任何数据，先去做几道题。</T>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Overview + Radar (merged) */}
      <section className="rounded-3xl border border-border bg-card p-5 md:p-6 shadow-tile">
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <div className="text-5xl font-extrabold tabular-nums text-primary">{Math.round(stat.score_pct)}%</div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {stageLabel}<T> 总掌握度</T>
                </div>
              </div>
              <div className="ml-auto">
                <ShareButton
                  variant="pill"
                  label="📤 分享"
                  item={{
                    type: "score",
                    module: stageLabel + "英语",
                    score: stat.score_pct,
                    url: typeof window !== "undefined" ? window.location.origin : "https://bigmoonenglish.com",
                  }} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatCard n={stat.master} label="已掌握" tone="text-emerald-600 dark:text-emerald-400" />
              <StatCard n={stat.fluent} label="熟练"   tone="text-blue-600 dark:text-blue-400" />
              <StatCard n={stat.weak}   label="需强化"  tone="text-orange-600 dark:text-orange-400" />
              <StatCard n={stat.none}   label="未学"    tone="text-muted-foreground" />
            </div>
            <div className="mt-3">
              <MasteryBar master={stat.master} fluent={stat.fluent} weak={stat.weak} none={stat.none} />
              <MasteryCounts master={stat.master} fluent={stat.fluent} weak={stat.weak} none={stat.none} />
            </div>
          </div>
      </section>

      {/* Continue CTA (uses the project's enhanced component) */}
      {continueMod && (
        <StageContinueCta
          stage={stage}
          continueModule={continueMod.module}
          defaultTo={continueRoute}
          defaultTitle={continueTitle}
          defaultSubtitle={continueSubtitle}
          defaultTone={continueTone}
        />
      )}

      {/* Module grid (enhanced with last-seen + next-due) */}
      {modules.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground"><T>各模块进度</T></h3>
            <span className="text-xs text-muted-foreground"><T>点击进入对应训练</T></span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => {
              const route = MODULE_ROUTES[stage]?.[m.module] ?? stageRoute;
              const activity = moduleActivity[m.module];
              return (
                <Link
                  key={m.module}
                  to={route}
                  className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{MODULE_EMOJI[m.module] ?? "🧠"}</span>
                      <span className="text-base font-bold"><T>{MODULE_LABEL[m.module] ?? m.module}</T></span>
                    </div>
                    <span className="text-xl font-extrabold tabular-nums text-primary">{Math.round(m.score_pct)}%</span>
                  </div>
                  <div className="mt-3">
                    <MasteryBar master={m.master} fluent={m.fluent} weak={m.weak} none={m.none} />
                  </div>
                  <MasteryCounts className="mt-2 text-[11px]" master={m.master} fluent={m.fluent} weak={m.weak} none={m.none} />
                  {(activity?.lastSeenAt || activity) && (
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">⏱ <T>上次</T>: {relTime(activity?.lastSeenAt ?? null)}</span>
                      <ModuleDueHint activity={activity} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [userId,   setUserId]   = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [loading,  setLoading]  = useState(true);
  const [stageMap,  setStageMap]  = useState<Map<StageKey, GPSStat>>(new Map());
  const [moduleMap, setModuleMap] = useState<Map<StageKey, GPSModuleStat[]>>(new Map());
  const [stageTab,  setStageTab]  = useState<StageKey | null>(null); // null until extras loaded

  const { stats: streak } = useStreakStats(userId);
  const extras = useDashboardExtras(userId);

  // Auto-default the stage tab once we know the suggested stage (only once)
  useEffect(() => {
    if (stageTab === null && !extras.loading) {
      setStageTab(extras.suggestedStage);
    }
  }, [extras.loading, extras.suggestedStage, stageTab]);

  // Fetch GPS views (same approach as LearningCenter — uses enrichMasteryGpsData)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) { setSignedIn(false); setLoading(false); setUserId(null); }
        return;
      }
      if (!cancelled) setUserId(user.id);
      const uid = user.id;

      const { data: scopeRows } = await supabase
        .from("mastery_with_proportions")
        .select("*")
        .eq("user_id", uid);
      if (cancelled) return;

      const rawScopes = ((scopeRows ?? []) as Record<string, unknown>[]).map((r) => ({
        stage: r.stage as string,
        grade: num(r.grade),
        module: r.module as string,
        master: num(r.master_count),
        fluent: num(r.fluent_count),
        weak: num(r.weak_count),
        none: num(r.none_count),
        total: num(r.scope_total),
        score_pct: num(r.score_pct),
        proportion_pct: num(r.proportion_of_total),
      }));
      const enriched = await enrichMasteryGpsData(uid, rawScopes);

      const newStageMap = new Map<StageKey, GPSStat>();
      for (const r of enriched.stageProps) {
        newStageMap.set(r.stage, {
          master: r.master,
          fluent: r.fluent,
          weak: r.weak,
          none: r.none,
          total: r.total,
          score_pct: r.score_pct,
        });
      }

      const accum = new Map<string, Record<string, unknown>[]>();
      for (const r of enriched.scopes) {
        const k = `${r.stage}:${r.module}`;
        const arr = accum.get(k) ?? [];
        arr.push({
          master_count: r.master,
          fluent_count: r.fluent,
          weak_count: r.weak,
          none_count: r.none,
          scope_total: r.total,
        });
        accum.set(k, arr);
      }
      const newModuleMap = new Map<StageKey, GPSModuleStat[]>();
      for (const [k, rows] of accum) {
        const [stageStr, module] = k.split(":");
        const stage = stageStr as StageKey;
        const agg = aggregateScopes(rows);
        const existing = newModuleMap.get(stage) ?? [];
        existing.push({ module, ...agg });
        newModuleMap.set(stage, existing);
      }
      for (const [stage, mods] of newModuleMap) {
        newModuleMap.set(stage, mods.sort((a, b) => b.total - a.total));
      }

      if (!cancelled) {
        setStageMap(newStageMap);
        setModuleMap(newModuleMap);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Total mistakes due (used by TodayTasks)
  const totalDue = useMemo(() => {
    return Object.values(extras.moduleActivity).reduce((s, m) => s + m.dueNow, 0);
  }, [extras.moduleActivity]);

  // Weak vocab count for the currently selected stage (used by TodayTasks)
  const weakVocabForStage = useMemo(() => {
    if (!stageTab) return 0;
    const mods = moduleMap.get(stageTab) ?? [];
    const v = mods.find((m) => m.module === "vocab");
    return v?.weak ?? 0;
  }, [moduleMap, stageTab]);

  // Whether reading is available for the current stage
  const stageHasReading = useMemo(() => {
    if (!stageTab) return false;
    return (moduleMap.get(stageTab) ?? []).some((m) => m.module === "reading");
  }, [moduleMap, stageTab]);

  // ── Signed-out gate ──
  if (!signedIn && !loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 text-center">
        <PageHeader title="📊 学习中心" subtitle="一目了然知道掌握了什么、下一步学什么" back />
        <p className="mt-6 text-sm text-muted-foreground"><T>登录后查看你的学习数据</T></p>
        <Link to="/auth" className="mt-4 inline-block rounded-full border border-border px-4 py-2 text-sm font-medium"><T>登录</T></Link>
      </main>
    );
  }

  const effectiveStage: StageKey = stageTab ?? "primary";

  // 「继续上次」卡:从三学段 hub state(本地+云同步同源)读最后学习位置。纯展示。
  const continueTarget = useMemo(() => getContinueTarget(stageTab), [stageTab]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader title="📊 学习中心" subtitle="一目了然知道掌握了什么、下一步学什么" back />

      {/* Cross-link to parent view (same account, parent-friendly layout) */}
      <div className="mt-3 flex justify-end">
        <Link
          to="/parent"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <span>👨‍👩‍👧</span> <T>家长视图</T> <span aria-hidden>→</span>
        </Link>
      </div>

      {/* 1. Today hero */}
      <div className="mt-5">
        <TodayHero
          displayName={extras.displayName}
          currentStreak={streak?.current_streak ?? 0}
          minutesToday={extras.minutesToday}
          dailyGoalMin={extras.dailyGoalMin}
          coins={extras.coins}
          badges={extras.badges}
          rank={extras.rank}
        />
      </div>

      {/* 1.5 Continue where you left off */}
      {continueTarget && (
        <Link
          to={continueTarget.to}
          className="mt-5 flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl text-white">📍</div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground"><T>继续上次</T></div>
            <div className="truncate text-base font-extrabold">
              {continueTarget.stageLabel}英语 · {continueTarget.unitTitle} · 第 {continueTarget.nextStageNo} 关
            </div>
            {continueTarget.stageTitle && (
              <div className="truncate text-xs text-muted-foreground">{continueTarget.stageTitle}</div>
            )}
          </div>
          <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
        </Link>
      )}

      {/* 2. Tasks + Weak spots */}
      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TodayTasks
            stage={effectiveStage}
            dueCount={totalDue}
            weakVocab={weakVocabForStage}
            hasReading={stageHasReading}
          />
        </div>
        <div className="lg:col-span-2">
          <WeakSpots items={extras.weakSpots} />
        </div>
      </div>

      {/* 3. Trend */}
      <div className="mt-5">
        <TrendChart
          trend30d={extras.trend30d}
          weeklyMinutesDelta={extras.weeklyMinutesDelta}
        />
      </div>

      {/* 4. Stage tabs */}
      <Tabs value={effectiveStage} onValueChange={(v) => setStageTab(v as StageKey)} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="primary"><T>🎒 小学</T></TabsTrigger>
          <TabsTrigger value="junior"><T>📓 初中</T></TabsTrigger>
          <TabsTrigger value="senior"><T>🎓 高中</T></TabsTrigger>
        </TabsList>
        {(["primary", "junior", "senior"] as StageKey[]).map((s) => (
          <TabsContent key={s} value={s} className="mt-5">
            {loading ? (
              <div className="py-8 text-center text-xs text-muted-foreground"><T>加载中…</T></div>
            ) : (
              <StageView
                stage={s}
                stat={stageMap.get(s) ?? ZERO}
                modules={moduleMap.get(s) ?? []}
                moduleActivity={extras.moduleActivity}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

    </main>
  );
}
