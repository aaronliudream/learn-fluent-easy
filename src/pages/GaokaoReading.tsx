import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Clock, ChevronRight, GraduationCap, Sparkles, Target, Trophy,
  Library, Gauge, Wand2, CheckCircle2, Circle, RefreshCw, Flame, TrendingUp, Award,
  Zap, Search, ChevronDown } from
"lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listReadingArticles } from "@/lib/gaokaoContent";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ModuleStageTests from "@/components/ModuleStageTests";

type GradeBand = "g1" | "g2" | "g3" | "gaokao";

type Article = {
  id: string;
  grade_band: GradeBand;
  sub_band: string | null;
  title: string;
  word_count: number;
  recommended_minutes: number;
  difficulty: number;
  cefr_level: string | null;
  genre_label: string | null;
  specific_topic: string;
  topic_group: string;
  theme_context: string;
  lexile_score: number | null;
};

type LexileProfile = {
  estimated_lexile: number;
  optimal_min: number;
  optimal_max: number;
  cefr_estimate: string;
  articles_used: number;
  confidence: string;
};

type Recommendation = {
  article_id: string;
  title: string;
  lexile_score: number;
  grade_band: string;
  genre_label: string | null;
  specific_topic: string;
  word_count: number;
  recommended_minutes: number;
  zone: "optimal" | "reinforce" | "challenge";
  zone_label: string;
  done_before: boolean;
};

type SessionStat = {
  best_pct: number;
  attempts: number;
  last_at: string;
};

type ContinueCard = {
  article: Article;
  kind: "resume" | "next" | "first";
  stat?: SessionStat;
};
// 状态: mastered ≥ 85% | passed ≥ 60% | tried < 60% | new

type ArticleStatus = "mastered" | "passed" | "tried" | "new";

function statusOf(s?: SessionStat): ArticleStatus {
  if (!s) return "new";
  if (s.best_pct >= 85) return "mastered";
  if (s.best_pct >= 60) return "passed";
  return "tried";
}

function lexileBadgeColor(lex: number) {
  if (lex < 700) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (lex < 900) return "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30";
  if (lex < 1100) return "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
}

const BANDS: {id: GradeBand;label: string;sub: string;icon: typeof BookOpen;gradient: string;ring: string;}[] = [
{ id: "g1", label: "高一", sub: "Foundation", icon: Sparkles, gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-500/30" },
{ id: "g2", label: "高二", sub: "Build-up", icon: BookOpen, gradient: "from-sky-500 to-blue-600", ring: "ring-sky-500/30" },
{ id: "g3", label: "高三", sub: "Polish", icon: Target, gradient: "from-violet-500 to-purple-600", ring: "ring-violet-500/30" },
{ id: "gaokao", label: "高考", sub: "Sprint 真题", icon: Trophy, gradient: "from-amber-500 to-orange-600", ring: "ring-amber-500/30" }];


const THEME_LABEL: Record<string, string> = {
  self: "人与自我",
  society: "人与社会",
  nature: "人与自然"
};

const STATUS_FILTERS: {k: ArticleStatus | "all";label: string;dot: string;}[] = [
{ k: "all", label: "全部", dot: "" },
{ k: "new", label: "未读", dot: "bg-slate-400" },
{ k: "tried", label: "需重做", dot: "bg-orange-500" },
{ k: "passed", label: "通过", dot: "bg-amber-500" },
{ k: "mastered", label: "完美掌握", dot: "bg-emerald-500" }];


export default function GaokaoReading() {
  const [sp] = useSearchParams();
  const yearBandParam = sp.get("year_band") || sp.get("grade");
  const gradeNum = yearBandParam ? Number(yearBandParam) : null;
  const yearBandKey: GradeBand | null =
    gradeNum === 1 ? "g1" : gradeNum === 2 ? "g2" : gradeNum === 3 ? "g3" : null;
  const [tab, setTab] = useState<GradeBand | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LexileProfile | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [sessions, setSessions] = useState<Record<string, SessionStat>>({});
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [lastReadId, setLastReadId] = useState<string | null>(null);
  const [dashOpen, setDashOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const pep = listReadingArticles({
        yearBand: gradeNum ?? undefined,
        gradeBand: yearBandKey ?? undefined,
      });
      setArticles(
        pep.map((a) => ({
          id: a.id,
          grade_band: a.grade_band,
          sub_band: a.sub_band,
          title: a.title,
          word_count: a.word_count,
          recommended_minutes: a.recommended_minutes,
          difficulty: a.difficulty,
          cefr_level: a.cefr_level,
          genre_label: a.genre_label,
          specific_topic: a.specific_topic,
          topic_group: a.topic_group,
          theme_context: a.theme_context,
          lexile_score: a.lexile_score,
        })) as Article[],
      );
      setLoading(false);

      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const [{ data: p }, { data: r }, { data: ss }] = await Promise.all([
        supabase.rpc("get_user_reading_lexile"),
        supabase.rpc("get_lexile_recommendations"),
        supabase.
        from("gaokao_reading_sessions").
        select("article_id, score_pct, submitted_at, status").
        eq("user_id", u.user.id).
        order("submitted_at", { ascending: false })]
        );
        if (p && p[0]) setProfile(p[0] as LexileProfile);
        if (r) setRecs(r as Recommendation[]);
        if (ss) {
          const map: Record<string, SessionStat> = {};
          let latestId: string | null = null;
          for (const s of ss as {article_id: string;score_pct: number;submitted_at: string;status: string;}[]) {
            if (!latestId) latestId = s.article_id;
            if (s.status !== "submitted") continue;
            const ex = map[s.article_id];
            if (!ex) {
              map[s.article_id] = { best_pct: s.score_pct ?? 0, attempts: 1, last_at: s.submitted_at };
            } else {
              ex.attempts += 1;
              ex.best_pct = Math.max(ex.best_pct, s.score_pct ?? 0);
            }
          }
          setSessions(map);
          setLastReadId(latestId);
        }
      }
    })();
  }, [gradeNum, yearBandKey]);

  const grouped = useMemo(() => {
    const m = new Map<GradeBand, Article[]>();
    for (const a of articles) {
      if (!m.has(a.grade_band)) m.set(a.grade_band, []);
      m.get(a.grade_band)!.push(a);
    }
    return m;
  }, [articles]);

  // ====== 全局统计 ======
  const overall = useMemo(() => {
    const total = articles.length;
    let mastered = 0,passed = 0,tried = 0,sumPct = 0,attempts = 0;
    for (const a of articles) {
      const st = statusOf(sessions[a.id]);
      if (st === "mastered") mastered++;else
      if (st === "passed") passed++;else
      if (st === "tried") tried++;
      const s = sessions[a.id];
      if (s) {sumPct += s.best_pct;attempts += s.attempts;}
    }
    const done = mastered + passed + tried;
    const newCount = total - done;
    const pct = total ? Math.round(mastered / total * 100) : 0;
    const avgScore = done ? Math.round(sumPct / done) : 0;
    return { total, mastered, passed, tried, newCount, pct, avgScore, attempts, done };
  }, [articles, sessions]);

  // ====== 每年级统计 ======
  const bandStats = useMemo(() => {
    const stats: Record<string, {total: number;mastered: number;done: number;tried: number;lastAt: number;}> = {};
    for (const b of BANDS) stats[b.id] = { total: 0, mastered: 0, done: 0, tried: 0, lastAt: 0 };
    for (const a of articles) {
      const st = stats[a.grade_band];if (!st) continue;
      st.total++;
      const s = statusOf(sessions[a.id]);
      if (s === "mastered") {st.mastered++;st.done++;} else
      if (s === "tried") {st.tried++;st.done++;} else
      if (s !== "new") st.done++;
      const sess = sessions[a.id];
      if (sess) {
        const t = new Date(sess.last_at).getTime();
        if (t > st.lastAt) st.lastAt = t;
      }
    }
    return stats;
  }, [articles, sessions]);

  function relativeTime(ms: number): string {
    if (!ms) return "";
    const diff = Date.now() - ms;
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "今天";
    if (d === 1) return "昨天";
    if (d < 7) return `${d}天前`;
    if (d < 30) return `${Math.floor(d / 7)}周前`;
    return `${Math.floor(d / 30)}月前`;
  }

  // ====== 当前 tab 文章 + 筛选 + 排序 ======
  const current = useMemo(() => {
    const list = tab ? grouped.get(tab) ?? [] : [];
    const q = search.trim().toLowerCase();
    return list.
    filter((a) => {
      if (statusFilter !== "all" && statusOf(sessions[a.id]) !== statusFilter) return false;
      if (!q) return true;
      return (a.title + " " + a.specific_topic + " " + (a.genre_label ?? "")).toLowerCase().includes(q);
    }).
    sort((a, b) => {
      const sa = statusOf(sessions[a.id]);const sb = statusOf(sessions[b.id]);
      // 需重做最优先 → 未读 → 通过 → 已掌握
      const ord: Record<ArticleStatus, number> = { tried: 0, new: 1, passed: 2, mastered: 3 };
      if (ord[sa] !== ord[sb]) return ord[sa] - ord[sb];
      return (a.lexile_score ?? 0) - (b.lexile_score ?? 0);
    });
  }, [grouped, tab, sessions, statusFilter, search]);

  const currentBand = tab ? BANDS.find((b) => b.id === tab)! : null;

  // ====== 「继续阅读」hero 卡 ======
  const continueCard = useMemo<ContinueCard | null>(() => {
    if (!articles.length) return null;
    // 1. 有最近访问的文章 → 继续 / 复盘
    if (lastReadId) {
      const article = articles.find((a) => a.id === lastReadId);
      if (article) {
        const stat = sessions[lastReadId];
        return { article, kind: stat ? "next" : "resume", stat };
      }
    }
    // 2. 推荐里挑一篇没做过的
    const firstRec = recs.find((r) => !r.done_before);
    if (firstRec) {
      const article = articles.find((a) => a.id === firstRec.article_id);
      if (article) return { article, kind: "first" };
    }
    // 3. 兜底：第一篇未读
    const firstNew = articles.find((a) => !sessions[a.id]);
    if (firstNew) return { article: firstNew, kind: "first" };
    return null;
  }, [articles, recs, sessions, lastReadId]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8">
      <BackLink to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回高考英语</T>
      </BackLink>

      <PageHeader hideReviewBanner title="阅读理解训练" subtitle="按你的水平推荐文章 · 答题 → 评分 → 精读复盘" back />

      {gradeNum &&
      <ModuleStageTests segment="gaokao" grade={gradeNum} module="reading" />
      }
      {yearBandKey && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
          <span>{gradeNum === 1 ? "高一" : gradeNum === 2 ? "高二" : "高三"}</span>
          <span className="opacity-70"><T>阅读池</T></span>
        </div>
      )}
      {yearBandKey && !loading && articles.length < 5 && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200">
          📚 <T>当前年级文章池较小（</T>{articles.length}<T>篇）。可使用 AI 实时生成高质量阅读 →</T>
          <Link to="/gaokao/exam" className="ml-2 font-bold underline"><T>去 AI 题型工坊</T></Link>
        </div>
      )}

      {/* ============= 继续阅读 Hero ============= */}
      {continueCard &&
      <Link
        to={`/gaokao/reading/article/${continueCard.article.id}`}
        className="group mb-5 block rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition relative overflow-hidden">
        
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-10 size-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="grid size-14 sm:size-16 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
              {continueCard.kind === "resume" ? <Zap className="size-7" /> : continueCard.kind === "next" ? <RefreshCw className="size-7" /> : <Sparkles className="size-7" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/85 mb-1">
                {continueCard.kind === "resume" ? "继续上次未完成" : continueCard.kind === "next" ? "上次读完了，再来一篇" : "今日推荐 · 立即开始"}
                {continueCard.stat &&
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] tabular-nums"><T>上次</T> {Math.round(continueCard.stat.best_pct)}%</span>
              }
              </div>
              <div className="text-base sm:text-lg font-extrabold leading-tight line-clamp-2 pr-8">
                {continueCard.article.title}
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-white/85 flex-wrap">
                <span className="inline-flex items-center gap-1"><Clock className="size-3" />{continueCard.article.recommended_minutes} <T>分钟</T></span>
                <span>· {continueCard.article.word_count} <T>词</T></span>
                {continueCard.article.lexile_score && <span className="font-mono font-bold">· {continueCard.article.lexile_score}L</span>}
                {continueCard.article.genre_label && <span>· {continueCard.article.genre_label}</span>}
              </div>
            </div>
            <div className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-full bg-white text-primary px-4 py-2 text-sm font-bold shadow-lg group-hover:translate-x-1 transition">
              <T>开始</T> <ChevronRight className="size-4" />
            </div>
            <ChevronRight className="size-6 sm:hidden shrink-0" />
          </div>
        </Link>
      }

      {/* ============= 顶部学习仪表盘 ============= */}
      <section className="mb-5 rounded-2xl border bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent relative overflow-hidden">
        <div className="absolute -right-12 -top-12 size-44 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        {/* —— 收起态：紧凑一行 —— */}
        <button
          onClick={() => setDashOpen((v) => !v)}
          className="relative w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/[0.02] transition">
          
          {/* mini 进度环 */}
          <div className="relative shrink-0">
            <svg viewBox="0 0 36 36" className="size-10 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={`${overall.pct / 100 * 94.2} 94.2`} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-[10px] font-extrabold tabular-nums">{overall.pct}%</div>
          </div>
          {/* 关键数字 */}
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            {profile ?
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-violet-500 text-primary-foreground px-2 py-0.5 text-[11px] font-bold">
                <Gauge className="size-3" /> {profile.estimated_lexile}L · {profile.cefr_estimate}
              </span> :

            <span className="text-[11px] text-muted-foreground font-semibold"><T>先做 3 篇校准能力</T></span>
            }
            <span className="text-[11px] text-muted-foreground">
              <b className="text-foreground tabular-nums">{overall.mastered}</b>/{overall.total} <T>完美</T>
            </span>
            {overall.tried > 0 &&
            <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">· {overall.tried} <T>需重做</T></span>
            }
            {overall.attempts > 0 &&
            <span className="text-[11px] text-muted-foreground hidden sm:inline"><T>· 平均</T> {overall.avgScore}%</span>
            }
          </div>
          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
            {dashOpen ? "收起" : "详情"}
            <ChevronDown className={cn("size-4 transition", dashOpen && "rotate-180")} />
          </span>
        </button>

        {/* —— 展开态 —— */}
        {dashOpen &&
        <div className="relative px-5 pb-5 pt-1 border-t border-border/40">
        <div className="relative grid sm:grid-cols-[auto_1fr] gap-5 items-center">
          {/* 左：进度环 */}
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${overall.pct / 100 * 326.7} 326.7`} className="transition-all duration-700" />
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(262 83% 58%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-3xl font-extrabold tabular-nums leading-none">{overall.pct}<span className="text-lg">%</span></div>
                <div className="text-[10px] text-muted-foreground mt-1"><T>完美掌握</T></div>
              </div>
            </div>
          </div>

          {/* 右：能力 + 数字 */}
          <div className="grid gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {profile ?
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-violet-500 text-primary-foreground px-3 py-1 text-xs font-bold shadow">
                  <Gauge className="size-3.5" /> {profile.estimated_lexile}L · CEFR {profile.cefr_estimate}
                </span> :

                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-foreground px-3 py-1 text-xs font-bold">
                  <Award className="size-3.5" /> <T>先做 3 篇校准能力</T>
                </span>
                }
              <span className="inline-flex items-center gap-1 rounded-full bg-card border px-2.5 py-1 text-[11px] text-muted-foreground">
                <Flame className="size-3 text-orange-500" /> <T>共</T> {overall.total} <T>篇</T>
              </span>
              {overall.attempts > 0 &&
                <span className="inline-flex items-center gap-1 rounded-full bg-card border px-2.5 py-1 text-[11px] text-muted-foreground">
                  <TrendingUp className="size-3 text-emerald-500" /> <T>平均</T> {overall.avgScore}%
                </span>
                }
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Stat color="emerald" label="完美" value={overall.mastered} icon={CheckCircle2} />
              <Stat color="amber" label="通过" value={overall.passed} icon={Award} />
              <Stat color="orange" label="重做" value={overall.tried} icon={RefreshCw} />
              <Stat color="slate" label="未读" value={overall.newCount} icon={Circle} />
            </div>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${overall.mastered / Math.max(overall.total, 1) * 100}%` }} />
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${overall.passed / Math.max(overall.total, 1) * 100}%` }} />
              <div className="h-full bg-orange-500 transition-all" style={{ width: `${overall.tried / Math.max(overall.total, 1) * 100}%` }} />
            </div>

            {profile &&
              <div className="text-[11px] text-muted-foreground">
                <T>💡 最佳学习区</T> <b className="text-foreground">{profile.optimal_min}L–{profile.optimal_max}L</b>
                {profile.confidence === "cold_start" ?
                <span className="text-amber-600"> <T>· 冷启动中，先完成 3 篇校准</T></span> :
                <> <T>· 已基于</T> <b>{profile.articles_used}</b> <T>篇估算</T></>}
              </div>
              }
          </div>
        </div>

        {/* 智能推荐 */}
        {recs.length > 0 &&
          <div className="relative mt-5 pt-5 border-t border-border/60">
            <div className="flex items-center gap-1.5 mb-2">
              <Wand2 className="size-4 text-violet-500" />
              <h3 className="font-bold text-sm"><T>挑给你的 · 难度刚好</T></h3>
              <span className="text-[10px] text-muted-foreground"><T>不太难也不太简单</T></span>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {recs.slice(0, 3).map((r) =>
              <Link key={r.article_id} to={`/gaokao/reading/article/${r.article_id}`}
              className="rounded-xl border bg-card p-3 hover:border-primary/50 hover:shadow-md transition group">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className={cn(
                    "text-[10px] rounded-full px-1.5 py-0.5 font-bold",
                    r.zone === "optimal" ? "bg-primary text-primary-foreground" :
                    r.zone === "challenge" ? "bg-rose-500 text-white" :
                    "bg-emerald-500 text-white"
                  )}>{r.zone_label}</span>
                    <span className={cn("text-[10px] rounded border px-1.5 py-0.5 font-mono font-bold", lexileBadgeColor(r.lexile_score))}>
                      {r.lexile_score}L
                    </span>
                    {r.done_before && <span className="text-[10px] text-muted-foreground"><T>↻ 复练</T></span>}
                  </div>
                  <div className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">{r.title}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span><Clock className="inline size-3 mr-0.5" />{r.recommended_minutes} min</span>
                    <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              )}
            </div>
          </div>
          }
        </div>
        }
      </section>

      {/* 答题流程 + 知识点入口 */}
      <div className="mb-5 grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-gradient-to-br from-card to-muted/30 p-4">
          <div className="flex items-center gap-1.5 text-base font-bold">
            <GraduationCap className="size-5 text-primary" /> <T>每篇文章怎么练</T>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {[
            { n: "1", t: "限时答题", d: "⏱ 模拟考场" },
            { n: "2", t: "查看得分", d: "📊 错在哪类题" },
            { n: "3", t: "逐题精读", d: "🔍 ABCD 全解析" }].
            map((s) =>
            <div key={s.n} className="rounded-lg bg-background/60 border p-2.5">
                <div className="font-bold text-foreground text-sm flex items-center gap-1.5"><span className="inline-grid place-items-center size-5 rounded-full bg-primary text-primary-foreground text-[11px]">{s.n}</span>{s.t}</div>
                <div className="text-muted-foreground mt-1 text-[11px]">{s.d}</div>
              </div>
            )}
          </div>
        </div>
        <Link to="/gaokao/reading/knowledge"
        className="flex items-center gap-3 rounded-2xl border bg-gradient-to-br from-violet-500/10 via-card to-card p-4 hover:border-violet-500/40 transition">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-600">
            <Library className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm"><T>📚 阅读知识手册</T></div>
            <div className="text-[11px] text-muted-foreground mt-0.5"><T>看不懂题型？这里查 · 7 大题型 + 解题套路</T></div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>

      {/* ====== 年级卡片 — 含进度 ====== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {BANDS.map((b) => {
          const Icon = b.icon;
          const active = tab === b.id;
          const s = bandStats[b.id] ?? { total: 0, mastered: 0, done: 0, tried: 0, lastAt: 0 };
          const pct = s.total ? Math.round(s.mastered / s.total * 100) : 0;
          const newCount = s.total - s.done;
          const lastLabel = relativeTime(s.lastAt);
          return (
            <button key={b.id} onClick={() => setTab(active ? null : b.id)}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-3 text-left transition group",
              active ? `bg-gradient-to-br ${b.gradient} text-white border-transparent shadow-lg ring-2 ${b.ring}` : "bg-card hover:border-primary/40 hover:-translate-y-0.5"
            )}>
              {/* 需重做小红点 */}
              {!active && s.tried > 0 &&
              <span className="absolute right-2 top-2 z-10 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold shadow ring-2 ring-background">
                  {s.tried}
                </span>
              }
              <div className="flex items-start justify-between mb-1.5">
                <div className={cn("rounded-lg p-1.5", active ? "bg-white/25" : `bg-gradient-to-br ${b.gradient} text-white`)}>
                  <Icon className="size-3.5" />
                </div>
                {lastLabel &&
                <div className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-md", active ? "bg-white/25 text-white" : "bg-muted text-muted-foreground")}>
                    {lastLabel}
                  </div>
                }
              </div>
              <div className="font-bold text-base leading-tight"><T>{b.label}</T></div>
              <div className={cn("text-[10px] leading-tight", active ? "text-white/85" : "text-muted-foreground")}>{b.sub}</div>

              {/* 进度数字行 */}
              <div className={cn("mt-2 flex items-center gap-2 text-[10px] tabular-nums font-semibold", active ? "text-white/95" : "text-muted-foreground")}>
                <span className={cn("inline-flex items-center gap-0.5", active ? "" : "text-emerald-600 dark:text-emerald-400")}>
                  <CheckCircle2 className="size-2.5" />{s.mastered}
                </span>
                {newCount > 0 &&
                <span>· {newCount} <T>未读</T></span>
                }
                {s.total > 0 &&
                <span className="ml-auto">{pct}%</span>
                }
              </div>

              <div className={cn("mt-1.5 h-1.5 rounded-full overflow-hidden", active ? "bg-white/25" : "bg-muted")}>
                <div className={cn("h-full transition-all", active ? "bg-white" : "bg-gradient-to-r " + b.gradient)} style={{ width: `${pct}%` }} />
              </div>
            </button>);

        })}
      </div>

      {!tab &&
      <EmptyHint
        bandStats={bandStats}
        onPick={(id) => setTab(id)}
        totalTried={overall.tried} />

      }

      {tab && currentBand && <>
      {/* 搜索 + 状态筛选 */}
      <div className="mb-3 grid sm:grid-cols-[1fr_auto] gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索文章标题或话题..."
              className="w-full rounded-xl border bg-card pl-10 pr-3 py-2 text-sm outline-none focus:border-primary" />
            
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {STATUS_FILTERS.map((s) =>
            <button key={s.k} onClick={() => setStatusFilter(s.k)}
            className={cn(
              "rounded-full px-2.5 py-1 transition inline-flex items-center gap-1.5",
              statusFilter === s.k ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
              {s.dot && <span className={cn("size-1.5 rounded-full", s.dot)} />}
              <T>{s.label}</T>
            </button>
            )}
        </div>
      </div>

      {/* 当前板块说明 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold"><T>{currentBand.label}</T> · {currentBand.sub}</h2>
        <span className="text-xs text-muted-foreground">{current.length} <T>篇</T></span>
      </div>

      {loading && <p className="text-sm text-muted-foreground"><T>加载中...</T></p>}

      {!loading && current.length === 0 &&
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
          <BookOpen className="size-8 mx-auto text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground"><T>没有符合筛选的文章</T></p>
        </div>
        }

      <ul className="grid gap-3">
        {current.map((a, idx) => {
            const stat = sessions[a.id];
            const prev = current[idx - 1];
            const prevStat = prev ? sessions[prev.id] : undefined;
            const locked = idx > 0 && (!prevStat || prevStat.best_pct < 80);
            const st = statusOf(stat);
            const inOptimal = profile && a.lexile_score &&
            a.lexile_score >= profile.optimal_min - 1 && a.lexile_score <= profile.optimal_max + 1;
            return (
              <li key={a.id}>
              <Link to={`/gaokao/reading/article/${a.id}`}
                onClick={(e) => {if (locked) {e.preventDefault();toast.error("请先完成上一篇并通过 80%");}}}
                className={cn(
                  "block rounded-2xl border p-4 transition hover:shadow-tile relative overflow-hidden",
                  locked && "opacity-50 cursor-not-allowed pointer-events-auto",
                  st === "mastered" ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60" :
                  st === "passed" ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60" :
                  st === "tried" ? "bg-orange-500/5 border-orange-500/30 hover:border-orange-500/60" :
                  "bg-card hover:border-primary/40"
                )}>
                {locked &&
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-muted-foreground/80 text-white px-2 py-0.5 text-[10px] font-bold shadow">
                    <T>🔒 待解锁</T>
                  </span>
                  }
                {inOptimal &&
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet-500 text-white px-1.5 py-0.5 text-[9px] font-bold shadow">
                    <Zap className="size-2.5" /> <T>最佳区</T>
                  </span>
                  }
                <div className="flex items-start gap-3">
                  {/* 状态图标 + 得分 */}
                  <div className="shrink-0">
                    {stat ?
                      <div className={cn(
                        "grid size-12 place-items-center rounded-xl text-center",
                        st === "mastered" ? "bg-emerald-500 text-white" :
                        st === "passed" ? "bg-amber-500 text-white" :
                        "bg-orange-500 text-white"
                      )}>
                        <div>
                          <div className="text-sm font-extrabold leading-none tabular-nums">{Math.round(stat.best_pct)}<span className="text-[9px]">%</span></div>
                          <div className="text-[8px] opacity-90 mt-0.5"><T>最佳</T></div>
                        </div>
                      </div> :

                      <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                        <Circle className="size-5" />
                      </div>
                      }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {a.sub_band &&
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{a.sub_band}</span>
                        }
                      {a.cefr_level &&
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{a.cefr_level}</span>
                        }
                      {a.lexile_score &&
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-mono font-bold border", lexileBadgeColor(a.lexile_score))}>
                          {a.lexile_score}L
                        </span>
                        }
                      {a.genre_label &&
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{a.genre_label}</span>
                        }
                      {/* 状态文字徽标 */}
                      {st === "mastered" && <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold"><CheckCircle2 className="size-2.5" /><T>完美</T></span>}
                      {st === "passed" && <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold"><T>通过</T></span>}
                      {st === "tried" && <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 px-1.5 py-0.5 text-[10px] font-bold"><RefreshCw className="size-2.5" /><T>重做</T></span>}
                    </div>
                    <div className="mt-1.5 font-semibold leading-tight line-clamp-2 pr-12">{a.title}</div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" />{a.recommended_minutes} <T>分钟</T></span>
                      <span>· {a.word_count} <T>词</T></span>
                      <span>· {THEME_LABEL[a.theme_context] ?? a.theme_context} / {a.specific_topic}</span>
                      <span className="text-amber-500">{"★".repeat(a.difficulty)}<span className="text-muted-foreground/30">{"★".repeat(5 - a.difficulty)}</span></span>
                      {stat && stat.attempts > 1 &&
                        <span className="text-primary"><T>· 已练</T> {stat.attempts} <T>次</T></span>
                        }
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              </Link>
            </li>);

          })}
      </ul>
      </>}
    </main>);

}

function Stat({ color, label, value, icon: Icon }: {color: "emerald" | "amber" | "orange" | "slate";label: string;value: number;icon: typeof Circle;}) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    slate: "bg-muted text-muted-foreground border-border"
  }[color];
  return (
    <div className={cn("rounded-xl border px-2 py-1.5 text-center", colors)}>
      <div className="flex items-center justify-center gap-1 text-[10px] opacity-80"><Icon className="size-3" />{label}</div>
      <div className="text-lg font-extrabold tabular-nums leading-tight">{value}</div>
    </div>);

}

function EmptyHint({
  bandStats,
  onPick,
  totalTried




}: {bandStats: Record<string, {total: number;mastered: number;done: number;tried: number;lastAt: number;}>;onPick: (id: GradeBand) => void;totalTried: number;}) {
  // 找有 tried 的年级（薄弱点）
  const weakBand = BANDS.find((b) => (bandStats[b.id]?.tried ?? 0) > 0);
  // 找最近练过的年级
  const recentBand = [...BANDS].sort(
    (a, b) => (bandStats[b.id]?.lastAt ?? 0) - (bandStats[a.id]?.lastAt ?? 0)
  ).find((b) => (bandStats[b.id]?.lastAt ?? 0) > 0);

  if (totalTried > 0 && weakBand) {
    return (
      <button
        onClick={() => onPick(weakBand.id)}
        className="w-full text-left rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-card to-card p-5 hover:border-orange-500/60 hover:shadow-md transition group">
        
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-500 text-white">
            <RefreshCw className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <T>你有</T> {totalTried} <T>篇需要重做</T>
            </div>
            <div className="mt-0.5 text-base font-bold"><T>先攻克薄弱点 ·</T> <T>{weakBand.label}</T></div>
            <div className="mt-0.5 text-xs text-muted-foreground"><T>这些题你只对了不到 60%，重做一次记得更牢</T></div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-orange-500 transition" />
        </div>
      </button>);

  }

  if (recentBand) {
    return (
      <button
        onClick={() => onPick(recentBand.id)}
        className="w-full text-left rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-md transition group">
        
        <div className="flex items-center gap-3">
          <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl text-white bg-gradient-to-br", recentBand.gradient)}>
            <recentBand.icon className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><T>最近在练</T></div>
            <div className="mt-0.5 text-base font-bold"><T>回到</T> <T>{recentBand.label}</T> · {recentBand.sub}</div>
            <div className="mt-0.5 text-xs text-muted-foreground"><T>已完成</T> {bandStats[recentBand.id]?.done ?? 0} / {bandStats[recentBand.id]?.total ?? 0} <T>篇</T></div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition" />
        </div>
      </button>);

  }

  // 全新用户
  return (
    <div className="rounded-2xl border border-dashed bg-gradient-to-br from-card to-muted/30 p-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary mb-3">
        <Sparkles className="size-6" />
      </div>
      <div className="text-base font-bold mb-1"><T>从高一开始 · 循序渐进</T></div>
      <div className="text-xs text-muted-foreground mb-4"><T>建议按年级顺序练习，系统会自动推送下一篇</T></div>
      <div className="flex justify-center gap-2 flex-wrap">
        {BANDS.map((b) =>
        <button
          key={b.id}
          onClick={() => onPick(b.id)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-br hover:shadow-md transition",
            b.gradient
          )}>
          
            <T>{b.label}</T>
          </button>
        )}
      </div>
    </div>);

}