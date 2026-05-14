import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Sparkles, Target, Flame, BookOpen, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import { ErrorRadar } from "@/components/grammar/ErrorRadar";
import ModuleStageTests from "@/components/ModuleStageTests";
import {
  loadGrammarMasteryAll,
  aggregateErrors,
  LEVEL_META,
  type GrammarMastery,
  type GrammarErrorReason } from
"@/lib/grammarFsrs";

type Module = {
  id: string;
  name_cn: string;
  name_en: string;
  emoji: string | null;
  description_cn: string | null;
  sort_order: number;
};

type Category = {
  id: string;
  module_id: string;
  name_cn: string;
  description_cn: string | null;
  exam_frequency: string | null;
  difficulty: number;
  sort_order: number;
};

type Point = {
  id: string;
  module_id: string | null;
  category_id: string | null;
  title: string;
  slug: string;
  difficulty: number;
  exam_frequency: string | null;
  question_count: number;
  sort_order: number;
};

const FREQ_BADGE: Record<string, string> = {
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "bg-muted text-muted-foreground"
};
const FREQ_LABEL: Record<string, string> = { high: "高频", medium: "中频", low: "低频" };

export default function GaokaoGrammar() {
  const [searchParams] = useSearchParams();
  const yearBandParam = searchParams.get("year_band") || searchParams.get("grade");
  const gradeNum = yearBandParam ? Number(yearBandParam) : null;
  const kpIdParam = searchParams.get("kp_id");
  const [modules, setModules] = useState<Module[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [mastery, setMastery] = useState<Record<string, GrammarMastery>>({});
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const navigate = (path: string) => { window.location.assign(path); };

  useEffect(() => {
    (async () => {
      const [{ data: ms }, { data: cs }, { data: ps }, all] = await Promise.all([
      supabase.from("gaokao_grammar_modules").select("*").order("sort_order"),
      supabase.from("gaokao_grammar_categories").select("*").order("sort_order"),
      supabase.
      from("gaokao_grammar_points").
      select("id, module_id, category_id, title, slug, difficulty, exam_frequency, question_count, sort_order").
      order("sort_order"),
      loadGrammarMasteryAll()]
      );
      setModules((ms ?? []) as Module[]);
      setCats((cs ?? []) as Category[]);
      setPoints((ps ?? []) as Point[]);
      const map: Record<string, GrammarMastery> = {};
      for (const r of all) map[r.item_id] = r;
      setMastery(map);
      setLoading(false);
      // If kp_id passed from prescription, jump straight to that point
      if (kpIdParam) {
        const target = (ps ?? []).find((p: any) => p.id === kpIdParam) as Point | undefined;
        if (target?.slug) {
          window.location.assign(`/gaokao/grammar/${target.slug}/quiz`);
        }
      }
    })();
  }, []);

  // ---------- Aggregations ----------
  const modulePoints = useMemo(() => {
    const m: Record<string, Point[]> = {};
    for (const p of points) {
      if (!p.module_id) continue;
      (m[p.module_id] ||= []).push(p);
    }
    return m;
  }, [points]);

  const moduleStats = useMemo(() => {
    const stats: Record<
      string,
      {total: number;mastered: number;proficient: number;familiar: number;learning: number;due: number;score: number;}> =
    {};
    for (const m of modules) {
      const ps = modulePoints[m.id] || [];
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
      stats[m.id] = {
        total: ps.length,
        mastered, proficient, familiar, learning, due,
        score: ps.length ? scoreSum / ps.length : 0
      };
    }
    return stats;
  }, [modules, modulePoints, mastery]);

  const totalStats = useMemo(() => {
    const all = points;
    let mastered = 0,dueNow = 0;
    let scoreSum = 0;
    for (const p of all) {
      const ms = mastery[p.id];
      if (ms?.mastery_level === 4) mastered++;
      scoreSum += (ms?.mastery_level ?? 0) / 4;
      if (ms?.due_at && new Date(ms.due_at).getTime() <= Date.now()) dueNow++;
    }
    return {
      total: all.length,
      mastered,
      dueNow,
      score: all.length ? scoreSum / all.length : 0
    };
  }, [points, mastery]);

  const dueList = useMemo(() => {
    const arr: {p: Point;ms: GrammarMastery;}[] = [];
    for (const p of points) {
      const ms = mastery[p.id];
      if (ms?.due_at && new Date(ms.due_at).getTime() <= Date.now()) arr.push({ p, ms });
    }
    arr.sort((a, b) => new Date(a.ms.due_at!).getTime() - new Date(b.ms.due_at!).getTime());
    return arr.slice(0, 6);
  }, [points, mastery]);

  const recommendNext = useMemo(() => {
    // weakest module's first untouched / lowest-level, high-frequency point
    const weakest = [...modules].sort((a, b) => (moduleStats[a.id]?.score ?? 0) - (moduleStats[b.id]?.score ?? 0))[0];
    if (!weakest) return null;
    const ps = (modulePoints[weakest.id] || []).
    filter((p) => p.exam_frequency !== "low").
    sort((a, b) => {
      const la = mastery[a.id]?.mastery_level ?? 0;
      const lb = mastery[b.id]?.mastery_level ?? 0;
      if (la !== lb) return la - lb;
      return a.difficulty - b.difficulty;
    });
    return ps[0] ? { module: weakest, point: ps[0] } : null;
  }, [modules, modulePoints, moduleStats, mastery]);

  const errorAgg = useMemo(() => aggregateErrors(Object.values(mastery)), [mastery]);
  const totalErrors = Object.values(errorAgg).reduce((a: number, b) => a + (b as number), 0);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
        <p className="text-sm text-muted-foreground"><T>加载中...</T></p>
      </main>);

  }

  const ringColorByScore = (s: number) =>
  s >= 0.85 ? "stroke-yellow-500" : s >= 0.6 ? "stroke-amber-500" : s >= 0.3 ? "stroke-emerald-500" : s >= 0.1 ? "stroke-sky-500" : "stroke-muted";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 pb-24">
      <BackLink to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回高考英语</T>
      </BackLink>
      <PageHeader back="/gaokao" hideReviewBanner title="语法考点" subtitle="按掌握度学习 · 间隔复习 · 错因分析" />
      {gradeNum && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
          <span>{gradeNum === 1 ? "高一" : gradeNum === 2 ? "高二" : "高三"}</span>
          <span className="opacity-70"><T>语法考点</T></span>
        </div>
      )}

      {gradeNum &&
      <ModuleStageTests segment="gaokao" grade={gradeNum} module="grammar" />
      }

      {/* ===== 特色专题: 虚拟语气 ===== */}
      <section className="mb-6">
        <a
          href="/grammar-lab/subjunctive"
          className="block rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 to-rose-50 p-5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg dark:from-amber-950/30 dark:to-rose-950/30">
          
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            <span className="rounded-full bg-amber-200/70 px-2 py-0.5 dark:bg-amber-900/50"><T>特色专题</T></span>
            <span className="rounded-full bg-rose-200/70 px-2 py-0.5 dark:bg-rose-900/50"><T>高考压轴</T></span>
          </div>
          <div className="text-lg font-extrabold"><T>虚拟语气全攻克</T></div>
          <div className="mt-1 text-xs text-muted-foreground"><T>9 关闯关式课程 · 从 If I were you 到混合虚拟、倒装、含蓄虚拟</T></div>
        </a>
      </section>

      {/* ===== Hero: 今日推荐 / 待复习 ===== */}
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {/* 总掌握度 */}
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5">
          <div className="flex items-center gap-4">
            <MasteryRing
              value={totalStats.score}
              size={84}
              stroke={8}
              colorClass={ringColorByScore(totalStats.score)}>
              
              <div className="text-center">
                <div className="text-xl font-extrabold leading-none">{Math.round(totalStats.score * 100)}<span className="text-xs">%</span></div>
                <div className="text-[9px] text-muted-foreground mt-0.5"><T>总掌握</T></div>
              </div>
            </MasteryRing>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground"><T>已掌握考点</T></div>
              <div className="text-2xl font-extrabold tabular-nums">
                {totalStats.mastered}<span className="text-base font-normal text-muted-foreground"> / {totalStats.total}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground"><T>👑 = 抗遗忘 21 天 + 多题型答对</T></div>
            </div>
          </div>
        </div>

        {/* 今日待复习 */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <Flame className="size-3.5" /> <T>今日待复习</T>
            </div>
            <span className="text-2xl font-extrabold tabular-nums text-rose-600">{totalStats.dueNow}</span>
          </div>
          {dueList.length === 0 ?
          <p className="text-xs text-muted-foreground mt-2"><T>今日无到期复习 — 学个新考点吧 ✨</T></p> :

          <ul className="space-y-1.5 mt-2">
              {dueList.slice(0, 3).map(({ p, ms }) => {
              const meta = LEVEL_META[ms.mastery_level ?? 0];
              return (
                <li key={p.id}>
                    <Link
                    to={`/gaokao/grammar/${p.slug}`}
                    className="flex items-center justify-between gap-2 rounded-lg p-1.5 text-xs hover:bg-muted/50">
                    
                      <span className="truncate">{meta.emoji} {p.title}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                    </Link>
                  </li>);

            })}
            </ul>
          }
        </div>

        {/* 智能推荐 */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 mb-2">
            <Sparkles className="size-3.5" /> <T>智能推荐</T>
          </div>
          {recommendNext ?
          <Link to={`/gaokao/grammar/${recommendNext.point.slug}`} className="block group">
              <div className="text-xs text-muted-foreground"><T>从最薄弱模块开始</T></div>
              <div className="text-base font-bold mt-0.5 group-hover:text-primary transition">
                {recommendNext.module.emoji} {recommendNext.point.title}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded ${FREQ_BADGE[recommendNext.point.exam_frequency || "medium"]}`}>
                  {FREQ_LABEL[recommendNext.point.exam_frequency || "medium"]}
                </span>
                <span className="text-muted-foreground"><T>难度</T> {"★".repeat(recommendNext.point.difficulty)}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                <T>立即开始</T> <ChevronRight className="size-3" />
              </div>
            </Link> :

          <p className="text-xs text-muted-foreground"><T>暂无推荐</T></p>
          }
        </div>
      </section>

      {/* ===== 错因雷达 ===== */}
      {totalErrors > 0 &&
      <section className="mb-6 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-base font-bold flex items-center gap-1.5">
                <Target className="size-4 text-primary" /> <T>你的错因分布</T>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5"><T>基于</T> {totalErrors} <T>次错题分析，针对性弥补弱点</T></div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <ErrorRadar data={errorAgg} size={220} />
            <div className="flex-1 grid gap-2 text-xs w-full">
              {(Object.entries(errorAgg) as [GrammarErrorReason, number][]).
            sort((a, b) => (b[1] as number) - (a[1] as number)).
            map(([k, v]) => {
              const pct = totalErrors ? (v as number) / totalErrors : 0;
              return (
                <div key={k} className="flex items-center gap-2">
                      <span className="w-20 text-muted-foreground shrink-0">{({ rule_unknown: "规则不懂", confusion: "相似混淆", careless: "粗心", vocab: "词汇不认识", speed: "时间不够" } as Record<string, string>)[k]}</span>
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

      {/* ===== 模块卡片网格 (Khan 风) ===== */}
      <h2 className="text-base font-bold mb-3 flex items-center gap-1.5">
        <BookOpen className="size-4 text-primary" /> <T>语法学习地图</T>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const s = moduleStats[m.id] || { total: 0, mastered: 0, proficient: 0, familiar: 0, learning: 0, due: 0, score: 0 };
          const isOpen = activeModule === m.id;
          const cs = cats.filter((c) => c.module_id === m.id);
          return (
            <div key={m.id} className="rounded-2xl border bg-card overflow-hidden transition hover:shadow-tile">
              <button
                onClick={() => setActiveModule(isOpen ? null : m.id)}
                className="w-full p-5 text-left">
                
                <div className="flex items-start gap-4">
                  <MasteryRing value={s.score} size={64} stroke={6} colorClass={ringColorByScore(s.score)}>
                    <div className="text-2xl">{m.emoji}</div>
                  </MasteryRing>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base">{m.name_cn}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{m.description_cn}</div>
                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      <span className="font-bold tabular-nums">{Math.round(s.score * 100)}%</span>
                      <span className="text-muted-foreground">{s.total} <T>个考点</T></span>
                      {s.due > 0 && <span className="text-rose-600 font-bold">⚠ {s.due} <T>待复习</T></span>}
                    </div>
                  </div>
                </div>
                {/* 段位条 */}
                <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  {s.mastered > 0 && <div className="bg-yellow-500" style={{ width: `${s.mastered / s.total * 100}%` }} />}
                  {s.proficient > 0 && <div className="bg-amber-500" style={{ width: `${s.proficient / s.total * 100}%` }} />}
                  {s.familiar > 0 && <div className="bg-emerald-500" style={{ width: `${s.familiar / s.total * 100}%` }} />}
                  {s.learning > 0 && <div className="bg-sky-500" style={{ width: `${s.learning / s.total * 100}%` }} />}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>👑{s.mastered} ⭐{s.proficient} 🌳{s.familiar} 🌿{s.learning}</span>
                  <span className="text-primary font-bold">{isOpen ? "收起 ▴" : "展开考点 ▾"}</span>
                </div>
              </button>

              {isOpen &&
              <div className="border-t bg-muted/20 px-3 py-2 space-y-3 max-h-[520px] overflow-y-auto">
                  {cs.map((cat) => {
                  const catPoints = (modulePoints[m.id] || []).filter((p) => p.category_id === cat.id);
                  if (!catPoints.length) return null;
                  return (
                    <div key={cat.id}>
                        <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          {cat.name_cn}
                        </div>
                        <ul className="grid gap-1">
                          {catPoints.map((p) => {
                          const ms = mastery[p.id];
                          const lvl = ms?.mastery_level ?? 0;
                          const meta = LEVEL_META[lvl];
                          const isDue = ms?.due_at && new Date(ms.due_at).getTime() <= Date.now();
                          return (
                            <li key={p.id}>
                                <div className="flex items-center gap-1 rounded-lg px-1 py-1 hover:bg-card transition">
                                  <Link
                                  to={`/gaokao/grammar/${p.slug}`}
                                  className="flex flex-1 min-w-0 items-center gap-2 px-1 py-1 text-sm"
                                  title="查看讲解 + 完整学习路径">
                                  
                                    <span className="text-base shrink-0" title={meta.label}>{meta.emoji}</span>
                                    <span className="flex-1 min-w-0 truncate">{p.title}</span>
                                    {isDue && <span className="text-[9px] px-1 py-0.5 rounded bg-rose-500/15 text-rose-600 font-bold"><T>复</T></span>}
                                    <span className={`text-[9px] px-1 py-0.5 rounded shrink-0 ${FREQ_BADGE[p.exam_frequency || "medium"]}`}>
                                      {FREQ_LABEL[p.exam_frequency || "medium"]}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums w-8 text-right">{p.question_count}<T>题</T></span>
                                  </Link>
                                  {p.question_count > 0 &&
                                <Link
                                  to={`/gaokao/grammar/${p.slug}/quiz/0`}
                                  className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition shrink-0"
                                  title="直接刷题">
                                  
                                      <Zap className="size-3" /> <T>刷题</T>
                                    </Link>
                                }
                                </div>
                              </li>);

                        })}
                        </ul>
                      </div>);

                })}
                </div>
              }
            </div>);

        })}
      </div>

      {/* ===== 图例 ===== */}
      <div className="mt-8 rounded-2xl border bg-muted/30 p-4">
        <div className="text-xs font-bold mb-2 flex items-center gap-1.5">
          <TrendingUp className="size-3.5" /> <T>掌握等级说明</T>
        </div>
        <div className="grid gap-1.5 text-[11px] sm:grid-cols-2 md:grid-cols-5">
          <div><T>🌱 未开始 — 还没练过</T></div>
          <div><T>🌿 初学 — 见过题</T></div>
          <div><T>🌳 熟悉 — 4 题正确率 ≥60%</T></div>
          <div><T>⭐ 熟练 — 8 题 ≥80% 抗遗忘 7 天</T></div>
          <div><T>👑 掌握 — 12 题多题型 ≥85% 抗遗忘 21 天</T></div>
        </div>
      </div>
    </main>);

}