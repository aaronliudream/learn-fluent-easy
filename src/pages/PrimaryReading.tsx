import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";

type Article = {
  id: string;
  grade: number;
  sort_order: number;
  theme: string;
  title_cn: string;
  title_en: string;
  emoji: string | null;
  cover_gradient: string | null;
  level: number;
  estimated_minutes: number;
  progress?: { stars: number; completed_at: string | null }[];
};

const GRADE_NAMES = ["一","二","三","四","五","六"];

export default function PrimaryReading() {
  const { grade: gradeParam } = useParams<{ grade?: string }>();
  const g = Number(gradeParam ?? "1");
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("primary_reading_articles")
      .select("id,grade,sort_order,theme,title_cn,title_en,emoji,cover_gradient,level,estimated_minutes,progress:primary_reading_progress(stars,completed_at)")
      .eq("grade", g)
      .order("sort_order")
      .then(({ data }) => {
        setList((data ?? []) as any);
        setLoading(false);
      });
  }, [g]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink
        to={`/primary/grade/${g}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回 {GRADE_NAMES[g-1] ?? g}年级
      </BackLink>

      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          PRIMARY · READING · G{g}
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
          📖 {GRADE_NAMES[g-1]}年级 · 趣味阅读
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          5 步通关：热身 · 听读 · 跟读 · 思考 · 宝藏关
        </p>
      </div>

      <ModuleStageTests segment="primary" grade={g} module="reading" />

      <div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">加载中…</div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          课文正在编写中，敬请期待 ✨
        </div>
      ) : (
        <section className="grid gap-3">
          {list.map((a) => {
            const stars = a.progress?.[0]?.stars ?? 0;
            const done = !!a.progress?.[0]?.completed_at;
            return (
              <Link
                key={a.id}
                to={`/primary/reading/${a.id}`}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${a.cover_gradient ?? "from-rose-400 to-amber-400"} p-5 text-white shadow-tile transition hover:-translate-y-0.5`}
              >
                <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/20 blur-2xl" />
                <div className="flex items-start gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/25 text-3xl">
                    {a.emoji ?? "📖"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80">
                      <BookOpen className="size-3" />
                      Lv.{a.level} · {a.theme}
                    </div>
                    <div className="mt-0.5 truncate text-lg font-extrabold">{a.title_cn}</div>
                    <div className="text-xs opacity-90">{a.title_en}</div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] opacity-90">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3"/> {a.estimated_minutes} 分钟</span>
                      <span className="inline-flex items-center gap-0.5">
                        {Array.from({length:3}).map((_,i)=>(
                          <Star key={i} className={`size-3 ${i<stars?"fill-yellow-300 stroke-yellow-200":"stroke-white/50"}`} />
                        ))}
                      </span>
                      {done && <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-bold">✓ 已完成</span>}
                    </div>
                  </div>
                  <Sparkles className="size-5 self-center opacity-80 transition group-hover:rotate-12" />
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
