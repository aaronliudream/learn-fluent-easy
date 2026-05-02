import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, ChevronRight, GraduationCap, Sparkles, Target, Trophy } from "lucide-react";
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
};

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("gaokao_reading_articles")
        .select("id, grade_band, sub_band, title, word_count, recommended_minutes, difficulty, cefr_level, genre_label, specific_topic, topic_group, theme_context")
        .eq("is_published", true)
        .order("sort_order");
      setArticles((data ?? []) as Article[]);
      setLoading(false);
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