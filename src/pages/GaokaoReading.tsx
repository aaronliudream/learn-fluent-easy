import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, ChevronRight, GraduationCap, Sparkles, Target, Trophy, Library, Gauge, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

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

function lexileBadgeColor(lex: number) {
  if (lex < 700) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (lex < 900) return "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30";
  if (lex < 1100) return "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
}

const BANDS: { id: GradeBand; label: string; sub: string; icon: typeof BookOpen; color: string }[] = [
  { id: "g1", label: "高一", sub: "Foundation · 打基础", icon: Sparkles, color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 border-emerald-500/30" },
  { id: "g2", label: "高二", sub: "Build-up · 扩词汇", icon: BookOpen, color: "from-sky-500/20 to-sky-500/5 text-sky-600 border-sky-500/30" },
  { id: "g3", label: "高三", sub: "Polish · 精读训练", icon: Target, color: "from-violet-500/20 to-violet-500/5 text-violet-600 border-violet-500/30" },
  { id: "gaokao", label: "高考", sub: "Sprint · 真题模拟", icon: Trophy, color: "from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-500/30" },
];

const THEME_LABEL: Record<string, string> = {
  self: "人与自我",
  society: "人与社会",
  nature: "人与自然",
};

export default function GaokaoReading() {
  const [tab, setTab] = useState<GradeBand>("g3");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LexileProfile | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("gaokao_reading_articles")
        .select("id, grade_band, sub_band, title, word_count, recommended_minutes, difficulty, cefr_level, genre_label, specific_topic, topic_group, theme_context, lexile_score")
        .eq("is_published", true)
        .order("sort_order");
      setArticles((data ?? []) as Article[]);
      setLoading(false);

      // 拉取个人 Lexile + 自适应推荐 (登录用户才有意义)
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const [{ data: p }, { data: r }] = await Promise.all([
          supabase.rpc("get_user_reading_lexile"),
          supabase.rpc("get_lexile_recommendations"),
        ]);
        if (p && p[0]) setProfile(p[0] as LexileProfile);
        if (r) setRecs(r as Recommendation[]);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<GradeBand, Article[]>();
    for (const a of articles) {
      if (!m.has(a.grade_band)) m.set(a.grade_band, []);
      m.get(a.grade_band)!.push(a);
    }
    return m;
  }, [articles]);

  const current = grouped.get(tab) ?? [];
  const currentBand = BANDS.find((b) => b.id === tab)!;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8">
      <Link to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高考英语
      </Link>

      <PageHeader
        hideReviewBanner
        title="阅读理解训练"
        subtitle="按年级分级 · 三阶段隔离法 · 雅思官方训练标准"
      />

      {/* 教学法说明卡 */}
      <div className="mb-5 rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="size-4 text-primary" /> 科学三阶段答题流程
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-background/60 p-2">
            <div className="font-semibold text-foreground">① 限时答题</div>
            <div className="text-muted-foreground mt-0.5">⏱ 答案完全锁死</div>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <div className="font-semibold text-foreground">② 即时成绩</div>
            <div className="text-muted-foreground mt-0.5">📊 题型诊断</div>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <div className="font-semibold text-foreground">③ 精读复盘</div>
            <div className="text-muted-foreground mt-0.5">🔍 ABCD 逐项</div>
          </div>
        </div>
      </div>

      {/* 🚀 个人 Lexile 能力卡 + 自适应推荐 */}
      {profile && (
        <div className="mb-5 rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary/5 via-violet-500/5 to-card p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-primary-foreground">
              <Gauge className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">你的阅读能力</span>
                <span className="text-[10px] border rounded px-1.5 py-0.5 text-muted-foreground">
                  Lexile · MetaMetrics
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                <span className="text-2xl font-bold tabular-nums text-primary">
                  {profile.estimated_lexile}L
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  ≈ CEFR {profile.cefr_estimate}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                最佳学习区 <b className="text-foreground">{profile.optimal_min}L–{profile.optimal_max}L</b>
                {" · "}
                {profile.confidence === "cold_start" ? (
                  <span className="text-amber-600">未做过测评，先做 3 篇校准</span>
                ) : (
                  <>已基于 <b className="text-foreground">{profile.articles_used}</b> 篇做过的文章估算</>
                )}
              </div>
            </div>
          </div>

          {recs.length > 0 && (
            <>
              <div className="mt-4 mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Wand2 className="size-3.5 text-violet-500" />
                自适应推荐 · 为你定制
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {recs.slice(0, 4).map((r) => (
                  <Link
                    key={r.article_id}
                    to={`/gaokao/reading/article/${r.article_id}`}
                    className="rounded-xl border bg-card p-2.5 hover:border-primary/40 transition group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn(
                        "text-[10px] rounded-full px-1.5 py-0.5 font-semibold",
                        r.zone === "optimal"
                          ? "bg-primary/15 text-primary"
                          : r.zone === "challenge"
                          ? "bg-rose-500/15 text-rose-600"
                          : "bg-emerald-500/15 text-emerald-700"
                      )}>
                        {r.zone_label}
                      </span>
                      <span className={cn("text-[10px] rounded border px-1 py-px font-mono", lexileBadgeColor(r.lexile_score))}>
                        {r.lexile_score}L
                      </span>
                      {r.done_before && (
                        <span className="text-[10px] text-muted-foreground">已做过</span>
                      )}
                    </div>
                    <div className="text-xs font-medium line-clamp-2 group-hover:text-primary transition">
                      {r.title}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 知识体系速查入口 */}
      <Link
        to="/gaokao/reading/knowledge"
        className="mb-5 flex items-center gap-3 rounded-2xl border bg-gradient-to-r from-violet-500/10 via-card to-card p-4 hover:border-violet-500/40 transition"
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-600">
          <Library className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">阅读知识点速查 · 体系化训练</div>
          <div className="text-xs text-muted-foreground mt-0.5">题型 116 · 文体 40 · 策略 71 · 信号词 113 · 话题 88 · 长难句 32...</div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>

      {/* 年级 Tab */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {BANDS.map((b) => {
          const Icon = b.icon;
          const active = tab === b.id;
          const count = grouped.get(b.id)?.length ?? 0;
          return (
            <button
              key={b.id}
              onClick={() => setTab(b.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                active
                  ? `bg-gradient-to-br ${b.color} border-current shadow-tile`
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className={cn("size-4", active ? "" : "text-muted-foreground")} />
                <span className={cn("text-[10px] tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
                  {count} 篇
                </span>
              </div>
              <div className={cn("mt-2 font-bold leading-tight", active ? "" : "text-foreground")}>{b.label}</div>
              <div className={cn("text-[10px] mt-0.5 leading-tight", active ? "opacity-75" : "text-muted-foreground")}>
                {b.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* 当前板块说明 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">{currentBand.label} · {currentBand.sub}</h2>
        <span className="text-xs text-muted-foreground">{current.length} 篇可练</span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">加载中...</p>}

      {!loading && current.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
          <BookOpen className="size-8 mx-auto text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">本板块文章正在精心准备中</p>
          <p className="text-xs text-muted-foreground/70 mt-1">先去其他年级板块看看吧 👆</p>
        </div>
      )}

      <ul className="grid gap-3">
        {current.map((a) => (
          <li key={a.id}>
            <Link
              to={`/gaokao/reading/article/${a.id}`}
              className="block rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-tile"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl text-sm font-bold",
                  "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
                )}>
                  {a.genre_label?.match(/[A-E]/)?.[0] ?? "R"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.sub_band && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {a.sub_band}
                      </span>
                    )}
                    {a.cefr_level && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {a.cefr_level}
                      </span>
                    )}
                    {a.genre_label && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {a.genre_label}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 font-semibold leading-tight line-clamp-2">{a.title}</div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" /> {a.recommended_minutes} 分钟
                    </span>
                    <span>· {a.word_count} 词</span>
                    <span>· {THEME_LABEL[a.theme_context] ?? a.theme_context} / {a.specific_topic}</span>
                    <span className="text-amber-500">{"★".repeat(a.difficulty)}{"☆".repeat(5 - a.difficulty)}</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground mt-1" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}