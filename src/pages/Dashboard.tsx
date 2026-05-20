import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Clock, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { MasteryBar, MasteryCounts } from "@/components/learning-center/MasteryBar";
import { enrichMasteryGpsData } from "@/lib/enrichMasteryGps";
import { SkillRadar } from "@/components/mastery/SkillRadar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShareButton } from "@/components/share/ShareButton";
import { useStreakStats } from "@/hooks/useStreakStats";
import { StageContinueCta } from "@/components/mastery/StageContinueCta";

/**
 * Hub Dashboard — reads from the same GPS views as LearningCenter (mastery_stage_proportion
 * + mastery_with_proportions) so numbers are identical on both pages.
 * Stage key "senior" matches the DB view; the tab just labels it "高中".
 */

interface GPSStat {
  master: number;
  fluent: number;
  weak: number;
  none: number;
  total: number;
  score_pct: number;
}

interface GPSModuleStat extends GPSStat {
  module: string;
}

const ZERO: GPSStat = { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 };

const STAGES = [
  { key: "primary", label: "小学", sub: "G1-G6",          route: "/primary" },
  { key: "junior",  label: "初中", sub: "G7-G9 · 中考",   route: "/junior"  },
  { key: "senior",  label: "高中", sub: "G10-G12 · 高考", route: "/gaokao"  },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读", lesson: "课程",
};
const MODULE_EMOJI: Record<string, string> = {
  vocab: "📖", grammar: "🔤", reading: "📃", listening: "🎧",
  writing: "✍️", cloze: "🧩", phonics: "🔠", lesson: "📚",
};

const MODULE_ROUTES: Record<StageKey, Record<string, string>> = {
  primary: { vocab: "/primary/vocab", reading: "/primary/reading", lesson: "/primary", phonics: "/primary", listening: "/primary", writing: "/primary" },
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

/* ─── TodayReviewCard (unchanged from original) ─── */
function TodayReviewCard() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setCount(0); return; }
      const nowIso = new Date().toISOString();
      const { count: n } = await supabase
        .from("user_mistakes")
        .select("id", { head: true, count: "exact" })
        .eq("is_resolved", false)
        .lte("next_review_at", nowIso);
      if (!cancelled) setCount(n ?? 0);
    })();
    return () => { cancelled = true; };
  }, []);

  if (count === null) return null;
  if (count === 0) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        <div className="text-2xl">🎉</div>
        <div className="text-sm font-semibold"><T>今天没有要复习的错题，干得好！</T></div>
      </div>
    );
  }
  const mins = Math.max(1, Math.round(count * 0.5));
  return (
    <Link
      to="/review/today"
      className="group mt-4 flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-tile transition-all hover:-translate-y-0.5">
      <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
        <Clock className="size-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85"><T>⏰ 今日复习</T></div>
        <div className="mt-1 text-lg font-extrabold leading-tight"><T>今日待复习</T> {count} <T>道 · 预计</T> {mins} <T>分钟</T></div>
        <div className="mt-0.5 text-xs opacity-90"><T>按记忆曲线推送，刷掉就不再忘</T></div>
      </div>
      <div className="rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-rose-600 shadow group-hover:scale-105 transition"><T>开始 →</T></div>
    </Link>
  );
}

/* ─── StatCard ─── */
function StatCard({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <div className={`text-xl font-extrabold tabular-nums ${tone}`}>{n.toLocaleString()}</div>
      <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}

/* ─── StageView — GPS-backed, identical data source to LearningCenter ─── */
function StageView({ stage, stat, modules }: { stage: StageKey; stat: GPSStat; modules: GPSModuleStat[] }) {
  const stageRoute = STAGES.find((s) => s.key === stage)?.route ?? "/";
  const stageLabel = STAGES.find((s) => s.key === stage)?.label ?? "";

  // Derive continue CTA from GPS data (weak first, then fluent, then first non-empty)
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
        <T>还没有任何数据，先去做几道题。</T>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Overview card */}
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 md:flex-row md:items-center md:gap-6">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="text-4xl font-extrabold tabular-nums text-primary">{Math.round(stat.score_pct)}%</div>
          <div className="text-[11px] font-semibold text-muted-foreground">{stageLabel}<T> 总掌握度</T></div>
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <StatCard n={stat.master} label="已掌握" tone="text-emerald-600 dark:text-emerald-400" />
            <StatCard n={stat.fluent} label="熟练"   tone="text-blue-600 dark:text-blue-400" />
            <StatCard n={stat.weak}   label="需强化"  tone="text-orange-600 dark:text-orange-400" />
            <StatCard n={stat.none}   label="未学"    tone="text-muted-foreground" />
          </div>
          <MasteryBar master={stat.master} fluent={stat.fluent} weak={stat.weak} none={stat.none} />
          <MasteryCounts master={stat.master} fluent={stat.fluent} weak={stat.weak} none={stat.none} />
        </div>
        <ShareButton
          variant="pill"
          label="📤 分享"
          item={{
            type: "score",
            module: stageLabel + "英语",
            score: stat.score_pct,
            url: typeof window !== "undefined" ? window.location.origin : "https://bigmoonenglish.com",
          }} />
      </section>

      {/* Continue CTA */}
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

      {/* Grammar panorama */}
      <Link
        to="/dashboard/grammar"
        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white">📊</div>
        <div className="flex-1">
          <div className="text-base font-extrabold"><T>语法掌握全景图</T></div>
          <div className="text-xs text-muted-foreground"><T>按考点查看每一项语法的强弱</T></div>
        </div>
        <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Module grid */}
      {modules.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground"><T>各模块进度</T></h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => {
              const route = MODULE_ROUTES[stage]?.[m.module] ?? stageRoute;
              return (
                <Link
                  key={m.module}
                  to={route}
                  className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{MODULE_EMOJI[m.module] ?? "🧠"}</span>
                      <span className="text-base font-bold">{MODULE_LABEL[m.module] ?? m.module}</span>
                    </div>
                    <span className="text-xl font-extrabold tabular-nums text-primary">{Math.round(m.score_pct)}%</span>
                  </div>
                  <div className="mt-3">
                    <MasteryBar master={m.master} fluent={m.fluent} weak={m.weak} none={m.none} />
                  </div>
                  <MasteryCounts className="mt-2 text-[11px]" master={m.master} fluent={m.fluent} weak={m.weak} none={m.none} />
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
  const [stageTab,  setStageTab]  = useState<string>("primary");

  // Same hook as LearningCenter — identical numbers guaranteed
  const { stats: streak } = useStreakStats(userId);

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

      // Fetch the same views LearningCenter uses
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
      // Sort modules by total items desc (same order convention as LearningCenter)
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

  if (!signedIn && !loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 text-center">
        <PageHeader title="📊 学习中心" subtitle="一目了然知道掌握了什么、下一步学什么" back="/" />
        <p className="mt-6 text-sm text-muted-foreground"><T>登录后查看你的学习数据</T></p>
        <Link to="/auth" className="mt-4 inline-block rounded-full border border-border px-4 py-2 text-sm font-medium"><T>登录</T></Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader title="📊 学习中心" subtitle="一目了然知道掌握了什么、下一步学什么" back="/" />

      {/* Streak & activity — same useStreakStats hook as LearningCenter */}
      {streak && (
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
            🔥 <span className="tabular-nums">{streak.current_streak}</span> <T>天连续打卡</T>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="tabular-nums">{streak.active_days_this_month}</span>
            <span className="text-xs text-muted-foreground"><T>天本月活跃</T></span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium">
            <Sparkles className="size-3.5 text-muted-foreground" />
            <span className="tabular-nums">{streak.minutes_this_month}</span>
            <span className="text-xs text-muted-foreground"><T>分钟本月学习</T></span>
          </div>
        </div>
      )}

      {/* GPS detail link */}
      <Link
        to="/dashboard"
        className="mt-4 flex items-center justify-between rounded-2xl border-2 border-foreground bg-card p-4 hover:bg-muted/40">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">GPS · 掌握度地图</div>
          <div className="mt-0.5 text-base font-extrabold"><T>学习地图（统一掌握度）</T></div>
          <div className="text-xs text-muted-foreground"><T>按教育部新课标 2022 · 4 色诊断 · AI 建议</T></div>
        </div>
        <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background"><T>进入 →</T></span>
      </Link>

      <TodayReviewCard />

      <div className="mt-5">
        <SkillRadar />
      </div>

      <Tabs value={stageTab} onValueChange={setStageTab} className="mt-4">
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
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
