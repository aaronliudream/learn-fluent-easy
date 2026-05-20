import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Flame, Target, ChevronRight, TrendingUp, Gamepad2, Map, ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  hasLabContent,
  juniorGrammarPlayPath,
  pickTodayAdventure,
} from "@/lib/juniorGrammarNav";
import {
  countPendingRevengeMistakes,
  pickBestRevengePoint,
  rankWeakPoints,
} from "@/lib/juniorGrammarRevenge";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import { ErrorRadar } from "@/components/grammar/ErrorRadar";
import {
  loadJuniorGrammarMasteryAll,
  aggregateJuniorGrammarErrors,
  JUNIOR_LEVEL_META,
  JUNIOR_ERROR_REASON_LABELS,
  type JuniorGrammarMastery,
  type JuniorGrammarErrorReason } from
"@/lib/juniorGrammarFsrs";

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
  const [params] = useSearchParams();
  const grade = params.get("grade");
  const gradeDisplay = grade ? String(Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)) : null;
  const backTo = gradeDisplay ? `/junior/g/${gradeDisplay}` : "/junior";
  const [cats, setCats] = useState<Cat[]>([]);
  const [pts, setPts] = useState<Pt[]>([]);
  const [mastery, setMastery] = useState<Record<string, JuniorGrammarMastery>>({});
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, p, all] = await Promise.all([
      supabase.from("junior_grammar_categories").select("*").order("sort_order"),
      supabase.
      from("junior_grammar_points").
      select("id,category_id,title,cefr,grade,summary,content_depth").
      order("sort_order"),
      loadJuniorGrammarMasteryAll()]
      );
      setCats((c.data ?? []) as Cat[]);
      const allPts = (p.data ?? []) as Pt[];
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

  const todayAdventure = useMemo(
    () => pickTodayAdventure(pts, mastery, recommendNext),
    [pts, mastery, recommendNext],
  );

  const todayIsDue = useMemo(() => {
    if (!todayAdventure) return false;
    const ms = mastery[todayAdventure.id];
    return !!(ms?.due_at && new Date(ms.due_at).getTime() <= Date.now());
  }, [todayAdventure, mastery]);

  // ─── Error aggregation ───
  const errorAgg = useMemo(() => aggregateJuniorGrammarErrors(Object.values(mastery)), [mastery]);
  const totalErrors = Object.values(errorAgg).reduce((a: number, b) => a + (b as number), 0);
  const pendingRevenge = useMemo(() => countPendingRevengeMistakes(), [pts, mastery]);
  const weakPoints = useMemo(() => rankWeakPoints(pts, mastery).slice(0, 5), [pts, mastery]);
  const bestRevenge = useMemo(() => pickBestRevengePoint(pts, mastery), [pts, mastery]);
  const topErrorReason = useMemo(() => {
    const sorted = (Object.entries(errorAgg) as [JuniorGrammarErrorReason, number][])
      .sort((a, b) => (b[1] as number) - (a[1] as number));
    return sorted[0]?.[1] ? sorted[0][0] : null;
  }, [errorAgg]);

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
        <ArrowLeft className="size-4" /> {gradeDisplay ? `返回初${gradeDisplay}` : "返回初中专区"}
      </BackLink>
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">JUNIOR · GRAMMAR</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl"><T>语法冒险</T></h1>
        <p className="mt-1 text-sm text-muted-foreground"><T>每天一关 · 闯关赚 XP · 间隔复习不掉队</T></p>
      </div>

      {todayAdventure &&
      <Link
        to={juniorGrammarPlayPath(todayAdventure.id, todayAdventure)}
        className="mb-6 block rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-5 text-white shadow-lg hover:shadow-xl transition group">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Gamepad2 className="size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <T>今日冒险</T>
              </span>
              {todayIsDue &&
              <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[10px] font-bold text-amber-950">
                <T>待复习</T>
              </span>
              }
              {hasLabContent(todayAdventure) &&
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold">
                <T>闯关模式</T>
              </span>
              }
            </div>
            <div className="mt-2 text-lg font-extrabold leading-snug line-clamp-2">{todayAdventure.title}</div>
            <p className="mt-2 text-xs text-white/85">
              <T>约 8 分钟 · 钩子 → 反射 → 改错 → Boss</T>
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold">
              <T>开始闯关</T>
              <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
      }

      {grade &&
      <ModuleStageTests
        segment="junior"
        grade={Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)}
        module="grammar" />

      }

      {/* ===== 选学专题 · 虚拟语气 (preserve from previous integration) ===== */}
      <a
        href="/grammar-lab/subjunctive"
        className="block mb-6 rounded-2xl border bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-primary/10 p-5 hover:shadow-tile transition group">
        
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">🎯</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded">
                <T>选学专题</T>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                <T>中考 + 高考衔接</T>
              </span>
            </div>
            <div className="font-bold text-lg mt-2"><T>虚拟语气全攻克</T></div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              <T>前 3 关（If I were you · I wish 现在 · I wish 过去）正好对应中考要求，后面 6 关是高考扩展，提前预习</T>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2 transition-all">
              <T>进入专题 →</T>
            </div>
          </div>
        </div>
      </a>

      {/* ===== Hero: 总掌握度 / 待复习 / 智能推荐 ===== */}
      {pts.length > 0 &&
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
                  <div className="text-xl font-extrabold leading-none">
                    {Math.round(totalStats.score * 100)}<span className="text-xs">%</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5"><T>总掌握</T></div>
                </div>
              </MasteryRing>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground"><T>已掌握考点</T></div>
                <div className="text-2xl font-extrabold tabular-nums">
                  {totalStats.mastered}<span className="text-base font-normal text-muted-foreground"> / {totalStats.total}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground"><T>👑 = 抗遗忘 21 天</T></div>
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
                {dueList.map(({ p, ms }) => {
              const meta = JUNIOR_LEVEL_META[ms.mastery_level ?? 0];
              return (
                <li key={p.id}>
                      <Link
                    to={juniorGrammarPlayPath(p.id, p)}
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
          <Link to={juniorGrammarPlayPath(recommendNext.point.id, recommendNext.point)} className="block group">
                <div className="text-xs text-muted-foreground"><T>从最薄弱模块开始</T></div>
                <div className="text-base font-bold mt-0.5 group-hover:text-primary transition line-clamp-2">
                  {recommendNext.category.emoji} {recommendNext.point.title}
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">CEFR {recommendNext.point.cefr}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                  <T>立即开始</T> <ChevronRight className="size-3" />
                </div>
              </Link> :

          <p className="text-xs text-muted-foreground"><T>暂无推荐</T></p>
          }
          </div>
        </section>
      }

      {/* ===== 错因雷达 + 复仇入口 ===== */}
      {(totalErrors > 0 || pendingRevenge > 0) &&
      <section className="mb-6 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-base font-bold flex items-center gap-1.5">
                <Target className="size-4 text-primary" /> <T>错因雷达 · 弱点专攻</T>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <T>累计</T> {totalErrors} <T>次错因 · </T>
                <Link to="/junior/grammar/revenge" className="font-bold text-rose-600 hover:underline"><T>点此处复仇冲刺 →</T></Link>
              </div>
            </div>
          </div>
          {pendingRevenge > 0 &&
          <Link
            to="/junior/grammar/revenge"
            className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 py-3 text-sm font-bold text-white shadow">
            <Zap className="size-4" />
            <T>错题复仇冲刺</T>
            <span className="rounded-full bg-white/25 px-2 tabular-nums">{pendingRevenge}</span>
          </Link>
          }
          {totalErrors > 0 &&
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
          }
          {weakPoints.length > 0 &&
          <div className="border-t pt-3 mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2"><T>薄弱考点</T></div>
            <ul className="space-y-1">
              {weakPoints.map((w) => (
                <li key={w.point.id}>
                  <Link
                    to={w.mistakeCount > 0 ? `/junior/grammar/revenge?point=${w.point.id}` : juniorGrammarPlayPath(w.point.id, w.point)}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/50">
                    <span className="truncate font-medium">{w.point.title}</span>
                    <span className="shrink-0 text-rose-600 font-bold">
                      {w.mistakeCount > 0 ? `${w.mistakeCount} 题` : w.isDue ? "待复习" : `${w.wrongCount} 错`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          }
        </section>
      }

      {/* ===== 关卡地图（默认收起） ===== */}
      <button
        type="button"
        onClick={() => setShowMap((v) => !v)}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-left text-sm font-bold hover:bg-muted/50 transition">
        <span className="flex items-center gap-2">
          <Map className="size-4 text-primary" />
          <T>关卡地图</T>
          <span className="text-xs font-normal text-muted-foreground">({pts.length} <T>个考点</T>)</span>
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition", showMap && "rotate-180")} />
      </button>

      {showMap &&
      <div className="space-y-6 mb-6">
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
                  return (
                    <li key={p.id}>
                      <Link
                        to={juniorGrammarPlayPath(p.id, p)}
                        className="flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm transition hover:border-primary hover:shadow-sm">
                        <span className="text-lg flex-shrink-0" title={meta.label}>
                          {meta.emoji}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold truncate">{p.title}</span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>CEFR {p.cefr}</span>
                            {hasRichContent &&
                              <span className="inline-block px-1 py-0.5 rounded bg-violet-500/15 text-violet-700 dark:text-violet-300 font-bold text-[9px]">
                                <T>🎮 闯关</T>
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
                    </li>);

                })}
              </ul>
            </section>);

        })}
      </div>
      }

      {/* ===== Legend ===== */}
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