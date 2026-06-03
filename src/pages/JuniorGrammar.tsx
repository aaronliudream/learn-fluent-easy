import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Flame, Target, ChevronRight, TrendingUp, List, Map as MapIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import { ErrorRadar } from "@/components/grammar/ErrorRadar";
import { GrammarMasteryMap } from "@/components/grammar/GrammarMasteryMap";
import { cn } from "@/lib/utils";
import {
  loadJuniorGrammarMasteryAll,
  aggregateJuniorGrammarErrors,
  JUNIOR_LEVEL_META,
  JUNIOR_ERROR_REASON_LABELS,
  type JuniorGrammarMastery,
  type JuniorGrammarErrorReason } from
"@/lib/juniorGrammarFsrs";
import { juniorGrammarPlayPath } from "@/lib/juniorGrammarNav";
import { JuniorGradeFilter, juniorGradeParams, type JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";

/** 从 ?grade= 参数(可能是 1/2/3 或 7/8/9)推出筛选条 chip 的当前值。 */
function gradeKeyFromParam(grade: string | null): JuniorGradeKey {
  if (!grade) return "all";
  const db = Number(grade) >= 7 ? Number(grade) : Number(grade) + 6;
  return db === 7 ? "g7" : db === 8 ? "g8" : db === 9 ? "g9" : "all";
}

type Cat = {id: string;name_cn: string;emoji: string;sort_order: number;};
type Pt = {
  id: string;
  category_id: string;
  title: string;
  cefr: string;
  grade: number;
  summary: string;
  content_depth: number | null;
};

export default function JuniorGrammar() {
  const [params, setParams] = useSearchParams();
  const grade = params.get("grade");
  const gradeDisplay = grade ? String(Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)) : null;
  const backTo = gradeDisplay ? `/junior/g/${gradeDisplay}` : "/junior";
  const onGrade = (key: JuniorGradeKey) => {
    const { dbGrade } = juniorGradeParams(key);
    const next = new URLSearchParams(params);
    if (dbGrade != null) next.set("grade", String(dbGrade));
    else next.delete("grade");
    setParams(next, { replace: true });
  };
  const [cats, setCats] = useState<Cat[]>([]);
  const [pts, setPts] = useState<Pt[]>([]);
  const [mastery, setMastery] = useState<Record<string, JuniorGrammarMastery>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">(() => {
    if (typeof window === "undefined") return "list";
    return (localStorage.getItem("junior_grammar_view") as "list" | "map") || "list";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("junior_grammar_view", view);
    }
  }, [view]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, p, all] = await Promise.all([
      // 语法学习页:排除需原文的非语法分类(听力/阅读/完形);保留语法(tense/clause/verb/other)
      // 与「词汇与交际」(纯选择题,可做按考点抽题)。仅过滤展示,不动 junior_grammar_points 数据。
      supabase.
      from("junior_grammar_categories").
      select("*").
      not("code", "in", "(listening,reading,cloze)").
      order("sort_order"),
      supabase.
      from("junior_grammar_points").
      select("id,category_id,title,cefr,grade,summary,content_depth").
      order("sort_order"),
      loadJuniorGrammarMasteryAll()]
      );
      const catRows = (c.data ?? []) as Cat[];
      setCats(catRows);
      // 点也按保留的语法分类过滤,非语法分类的题点不出现在统计/推荐/到期等任何位置。
      const grammarCatIds = new Set(catRows.map((x) => x.id));
      const allPts = ((p.data ?? []) as Pt[]).filter((x) => grammarCatIds.has(x.category_id));
      setPts(grade ? allPts.filter((x) => x.grade === Number(grade)) : allPts);
      const map: Record<string, JuniorGrammarMastery> = {};
      for (const r of all) map[r.item_id] = r;
      setMastery(map);
      setLoading(false);
    })();
  }, [grade]);

  // ─── Stats per category ───
  const catStats = useMemo(() => {
    const stats: Record<
      string,
      {total: number;mastered: number;proficient: number;familiar: number;learning: number;due: number;score: number;}> =
    {};
    for (const c of cats) {
      const ps = pts.filter((p) => p.category_id === c.id);
      let mastered = 0,proficient = 0,familiar = 0,learning = 0,due = 0;
      let scoreSum = 0;
      for (const p of ps) {
        const ms = mastery[p.id];
        const lvl = ms?.mastery_level ?? 0;
        if (lvl === 4) mastered++;else
        if (lvl === 3) proficient++;else
        if (lvl === 2) familiar++;else
        if (lvl === 1) learning++;
        scoreSum += lvl / 4;
        if (ms?.due_at && new Date(ms.due_at).getTime() <= Date.now()) due++;
      }
      stats[c.id] = {
        total: ps.length,
        mastered, proficient, familiar, learning, due,
        score: ps.length ? scoreSum / ps.length : 0
      };
    }
    return stats;
  }, [cats, pts, mastery]);

  // ─── Total stats ───
  const totalStats = useMemo(() => {
    let mastered = 0,dueNow = 0;
    let scoreSum = 0;
    for (const p of pts) {
      const ms = mastery[p.id];
      if (ms?.mastery_level === 4) mastered++;
      scoreSum += (ms?.mastery_level ?? 0) / 4;
      if (ms?.due_at && new Date(ms.due_at).getTime() <= Date.now()) dueNow++;
    }
    return {
      total: pts.length,
      mastered,
      dueNow,
      score: pts.length ? scoreSum / pts.length : 0
    };
  }, [pts, mastery]);

  // ─── Due list (top 3) ───
  const dueList = useMemo(() => {
    const arr: {p: Pt;ms: JuniorGrammarMastery;}[] = [];
    for (const p of pts) {
      const ms = mastery[p.id];
      if (ms?.due_at && new Date(ms.due_at).getTime() <= Date.now()) arr.push({ p, ms });
    }
    arr.sort((a, b) => new Date(a.ms.due_at!).getTime() - new Date(b.ms.due_at!).getTime());
    return arr.slice(0, 3);
  }, [pts, mastery]);

  // ─── Recommended next: weakest category, lowest level point with content_depth>=1 ───
  const recommendNext = useMemo(() => {
    if (cats.length === 0 || pts.length === 0) return null;
    const sortedCats = [...cats].sort((a, b) => (catStats[a.id]?.score ?? 0) - (catStats[b.id]?.score ?? 0));
    for (const cat of sortedCats) {
      const catPts = pts.filter((p) => p.category_id === cat.id);
      // Prefer points with new content (content_depth>=1) — the upgraded experience
      const richPts = catPts.filter((p) => (p.content_depth ?? 0) >= 1);
      const candidates = richPts.length > 0 ? richPts : catPts;
      const sorted = [...candidates].sort((a, b) => {
        const la = mastery[a.id]?.mastery_level ?? 0;
        const lb = mastery[b.id]?.mastery_level ?? 0;
        return la - lb;
      });
      if (sorted.length > 0) return { category: cat, point: sorted[0] };
    }
    return null;
  }, [cats, pts, catStats, mastery]);

  // ─── Error aggregation ───
  const errorAgg = useMemo(() => aggregateJuniorGrammarErrors(Object.values(mastery)), [mastery]);
  const totalErrors = Object.values(errorAgg).reduce((a: number, b) => a + (b as number), 0);

  const ringColorByScore = (s: number) =>
  s >= 0.85 ? "stroke-yellow-500" : s >= 0.6 ? "stroke-amber-500" : s >= 0.3 ? "stroke-emerald-500" : s >= 0.1 ? "stroke-sky-500" : "stroke-muted";

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <p className="text-sm text-muted-foreground"><T>加载中…</T></p>
      </main>);

  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回初中专区
      </BackLink>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">JUNIOR · GRAMMAR</div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl"><T>中考语法专项</T></h1>
          <p className="mt-1 text-sm text-muted-foreground"><T>按 CEFR 分级 · 间隔复习 · AI 智能批改</T></p>
        </div>
        <div className="inline-flex shrink-0 rounded-xl border bg-card p-1 text-xs">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 transition",
              view === "list" ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}>
            <List className="size-3.5" /> <T>列表</T>
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            aria-pressed={view === "map"}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 transition",
              view === "map" ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}>
            <MapIcon className="size-3.5" /> <T>地图</T>
          </button>
        </div>
      </div>

      <JuniorGradeFilter value={gradeKeyFromParam(grade)} onChange={onGrade} className="mb-4" />

      {grade &&
      <ModuleStageTests
        segment="junior"
        grade={Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)}
        module="grammar" />

      }

      {/* ===== Map view ===== */}
      {view === "map" && pts.length > 0 && (
        <GrammarMasteryMap
          categories={cats}
          points={pts}
          mastery={mastery}
          currentPointId={recommendNext?.point.id ?? null}
        />
      )}

      {/* ===== HERO: today's single decisive CTA (list view only) =====
           Logic:
             - If anything is due → "今日待复习" card (rose, urgent)
             - Else if a recommend exists → "今日推荐" card (emerald, exploratory)
             - Else → small empty state
           Only ONE big card so the user knows exactly what to do next. */}
      {view === "list" && pts.length > 0 && (() => {
        const top = dueList[0];
        if (top) {
          const meta = JUNIOR_LEVEL_META[top.ms.mastery_level ?? 0];
          return (
            <section className="mb-5">
              <Link
                to={juniorGrammarPlayPath(top.p.id, top.p)}
                className="block rounded-2xl border border-rose-300/60 dark:border-rose-800/60 bg-gradient-to-br from-rose-50 via-card to-rose-50/40 dark:from-rose-950/30 dark:via-card dark:to-rose-950/10 p-5 hover:shadow-md transition group">
                <div className="flex items-center gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-2xl">🔥</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded">
                        <T>今日待复习</T>
                      </span>
                      <span className="text-[10px] font-bold text-rose-600 tabular-nums">
                        × {totalStats.dueNow}
                      </span>
                    </div>
                    <div className="mt-1.5 font-extrabold text-lg leading-tight truncate">
                      {meta.emoji} {top.p.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      <T>抢在遗忘曲线之前重做</T> · CEFR {top.p.cefr}
                    </div>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-bold group-hover:bg-rose-700 transition">
                    <T>立即复习</T> <ChevronRight className="size-4" />
                  </div>
                </div>
              </Link>
            </section>
          );
        }
        if (recommendNext) {
          return (
            <section className="mb-5">
              <Link
                to={juniorGrammarPlayPath(recommendNext.point.id, recommendNext.point)}
                className="block rounded-2xl border border-emerald-300/60 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 via-card to-emerald-50/40 dark:from-emerald-950/30 dark:via-card dark:to-emerald-950/10 p-5 hover:shadow-md transition group">
                <div className="flex items-center gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-2xl">
                    {recommendNext.category.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <Sparkles className="size-3" /> <T>今日推荐</T>
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        <T>从最薄弱模块开始</T>
                      </span>
                    </div>
                    <div className="mt-1.5 font-extrabold text-lg leading-tight truncate">
                      {recommendNext.point.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {recommendNext.category.name_cn} · CEFR {recommendNext.point.cefr}
                    </div>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-bold group-hover:bg-emerald-700 transition">
                    <T>立即开始</T> <ChevronRight className="size-4" />
                  </div>
                </div>
              </Link>
            </section>
          );
        }
        return null;
      })()}

      {/* ===== Compact 4-tile stat strip (list view only) ===== */}
      {view === "list" && pts.length > 0 && (
        <section className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          {/* 总掌握度 */}
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><T>总掌握度</T></div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums">
              {Math.round(totalStats.score * 100)}<span className="text-sm font-normal text-muted-foreground">%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full transition-all", totalStats.score >= 0.85 ? "bg-yellow-500" : totalStats.score >= 0.6 ? "bg-amber-500" : totalStats.score >= 0.3 ? "bg-emerald-500" : "bg-sky-500")}
                style={{ width: `${Math.max(2, totalStats.score * 100)}%` }}
              />
            </div>
          </div>
          {/* 已掌握 */}
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
              👑 <T>已掌握</T>
            </div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums">
              {totalStats.mastered}<span className="text-sm font-normal text-muted-foreground"> / {totalStats.total}</span>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground"><T>抗遗忘 21 天</T></div>
          </div>
          {/* 待复习 */}
          <div className={cn(
            "rounded-xl border p-3",
            totalStats.dueNow > 0 ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300/60 dark:border-rose-800/60" : "bg-card",
          )}>
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
              totalStats.dueNow > 0 ? "text-rose-700 dark:text-rose-300" : "text-muted-foreground",
            )}>
              <Flame className="size-3" /> <T>待复习</T>
            </div>
            <div className={cn(
              "mt-1 text-2xl font-extrabold tabular-nums",
              totalStats.dueNow > 0 ? "text-rose-600" : "",
            )}>
              {totalStats.dueNow}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              {totalStats.dueNow > 0 ? <T>今天到期</T> : <T>暂无到期</T>}
            </div>
          </div>
          {/* 错题分析 */}
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
              <Target className="size-3" /> <T>错题数</T>
            </div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums">
              {totalErrors}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              {totalErrors >= 5 ? <T>查看错因分布 ↓</T> : <T>需更多数据</T>}
            </div>
          </div>
        </section>
      )}

      {/* ===== 错因分布 (list view only) =====
           Sparse data (< 5 errors) → thin inline strip (no radar — looks empty)
           Rich data (≥ 5 errors)    → full radar + bar list */}
      {view === "list" && totalErrors > 0 && totalErrors < 5 && (
        <section className="mb-6 rounded-xl border bg-card px-4 py-3 flex items-center gap-3 text-xs">
          <Target className="size-3.5 text-primary shrink-0" />
          <span className="font-bold"><T>错因分布</T></span>
          <span className="text-muted-foreground">
            {(Object.entries(errorAgg) as [JuniorGrammarErrorReason, number][])
              .filter(([, v]) => (v as number) > 0)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([k, v]) => `${JUNIOR_ERROR_REASON_LABELS[k]} ${v}`)
              .join(" · ")}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground"><T>错满 5 题后展开雷达图</T></span>
        </section>
      )}
      {view === "list" && totalErrors >= 5 &&
      <section className="mb-6 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-base font-bold flex items-center gap-1.5">
                <Target className="size-4 text-primary" /> <T>你的错因分布</T>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <T>基于</T> {totalErrors} <T>次错题分析，针对性弥补弱点</T>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <ErrorRadar data={errorAgg} size={200} />
            <div className="flex-1 grid gap-2 text-xs w-full">
              {(Object.entries(errorAgg) as [JuniorGrammarErrorReason, number][]).
            sort((a, b) => (b[1] as number) - (a[1] as number)).
            map(([k, v]) => {
              const pct = totalErrors ? (v as number) / totalErrors : 0;
              return (
                <div key={k} className="flex items-center gap-2">
                      <span className="w-20 text-muted-foreground shrink-0">{JUNIOR_ERROR_REASON_LABELS[k]}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${pct * 100}%` }} />
                      </div>
                      <span className="w-10 text-right tabular-nums font-bold">{v}</span>
                    </div>);

            })}
            </div>
          </div>
        </section>
      }

      {/* ===== Category list with progress (list view only) ===== */}
      {view === "list" && (<>
      <h2 className="mb-3 text-base font-bold flex items-center gap-1.5">
        <BookOpen className="size-4 text-primary" /> <T>语法考点</T>
      </h2>
      <div className="space-y-6">
        {cats.map((c) => {
          const catPts = pts.filter((p) => p.category_id === c.id);
          if (catPts.length === 0) return null;
          const stats = catStats[c.id] || { total: 0, mastered: 0, proficient: 0, familiar: 0, learning: 0, due: 0, score: 0 };
          return (
            <section key={c.id}>
              {/* Category header with progress ring */}
              <div className="mb-3 flex items-center gap-3">
                <MasteryRing
                  value={stats.score}
                  size={48}
                  stroke={5}
                  colorClass={ringColorByScore(stats.score)}>
                  
                  <div className="text-lg">{c.emoji}</div>
                </MasteryRing>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold">{c.name_cn}</h3>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px]">
                    <span className="font-bold tabular-nums">{Math.round(stats.score * 100)}%</span>
                    <span className="text-muted-foreground">{stats.total} <T>个考点</T></span>
                    {stats.due > 0 &&
                    <span className="text-rose-600 font-bold">⚠ {stats.due} <T>待复习</T></span>
                    }
                  </div>
                  {/* Mastery distribution bar */}
                  {stats.total > 0 &&
                  <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      {stats.mastered > 0 &&
                    <div className="bg-yellow-500" style={{ width: `${stats.mastered / stats.total * 100}%` }} />
                    }
                      {stats.proficient > 0 &&
                    <div className="bg-amber-500" style={{ width: `${stats.proficient / stats.total * 100}%` }} />
                    }
                      {stats.familiar > 0 &&
                    <div className="bg-emerald-500" style={{ width: `${stats.familiar / stats.total * 100}%` }} />
                    }
                      {stats.learning > 0 &&
                    <div className="bg-sky-500" style={{ width: `${stats.learning / stats.total * 100}%` }} />
                    }
                    </div>
                  }
                </div>
              </div>

              {/* Points in this category */}
              <ul className="grid gap-2 sm:grid-cols-2">
                {catPts.map((p) => {
                  const ms = mastery[p.id];
                  const lvl = ms?.mastery_level ?? 0;
                  const meta = JUNIOR_LEVEL_META[lvl];
                  const isDue = ms?.due_at && new Date(ms.due_at).getTime() <= Date.now();
                  const hasRichContent = (p.content_depth ?? 0) >= 1;
                  // Gold-standard points → single CTA to adaptive mastery test (no duplicate Lab button).
                  // Legacy points → keep the old lesson page link (no Lab button — Lab now requires gold content).
                  const playPath = juniorGrammarPlayPath(p.id, p);
                  return (
                    <li key={p.id}>
                      <Link
                          to={playPath}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition hover:shadow-sm",
                            hasRichContent
                              ? "bg-gradient-to-br from-emerald-50 via-card to-emerald-50/40 dark:from-emerald-950/20 dark:via-card dark:to-emerald-950/10 border-emerald-300/60 dark:border-emerald-800/60 hover:border-emerald-500"
                              : "bg-card hover:border-primary",
                          )}>

                        <span className="text-lg flex-shrink-0" title={meta.label}>
                          {meta.emoji}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold truncate">{p.title}</span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>CEFR {p.cefr}</span>
                            {hasRichContent &&
                              <span className="inline-block px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[9px]">
                                <T>🎯 闯关测试</T>
                              </span>
                              }
                            {isDue &&
                              <span className="inline-block px-1 py-0.5 rounded bg-rose-500/15 text-rose-600 font-bold text-[9px]">
                                <T>复</T>
                              </span>
                              }
                          </span>
                        </span>
                        <ChevronRight className="size-3.5 text-muted-foreground flex-shrink-0" />
                      </Link>
                      <Link
                        to={`/junior/grammar/${p.id}/practice`}
                        className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-primary/40 px-2 py-1.5 text-[11px] font-bold text-primary transition hover:bg-primary/5"
                      >
                        <Sparkles className="size-3" /> <T>按考点抽题练习</T>
                      </Link>
                    </li>);

                })}
              </ul>
            </section>);

        })}
      </div>

      {/* ===== Slim legend ===== */}
      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
        <span className="font-bold text-foreground inline-flex items-center gap-1">
          <TrendingUp className="size-3" /> <T>掌握等级</T>
        </span>
        <span>🌱 <T>未开始</T></span>
        <span>·</span>
        <span>🌿 <T>初学</T></span>
        <span>·</span>
        <span>🌳 <T>熟悉</T> ≥60%</span>
        <span>·</span>
        <span>⭐ <T>熟练</T> ≥80% · 7d</span>
        <span>·</span>
        <span>👑 <T>掌握</T> ≥85% · 21d</span>
      </div>

      {/* ===== 选学专题 · 虚拟语气 (relegated to footer banner) ===== */}
      <a
        href="/grammar-lab/subjunctive"
        className="mt-4 flex items-center gap-3 rounded-xl border bg-gradient-to-r from-amber-500/5 via-card to-primary/5 px-4 py-3 hover:shadow-sm transition group">
        <span className="text-xl shrink-0">🎯</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold uppercase tracking-widest">
            <span className="text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded">
              <T>选学专题</T>
            </span>
            <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded">
              <T>中考 + 高考衔接</T>
            </span>
          </div>
          <div className="font-bold text-sm mt-1 truncate"><T>虚拟语气全攻克 · 9 关</T></div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition" />
      </a>
      </>)}
    </main>);

}