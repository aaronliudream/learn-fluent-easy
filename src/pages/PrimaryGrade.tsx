import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";

const buildSkills = (g: number) => [
  { key: "games", title: "🎮 单词游戏中心", desc: "选义 · 听音 · 翻牌 · 拼词", gradient: "from-rose-400 to-orange-400", to: `/primary/games/${g}` },
  { key: "listening", title: "🎧 听力", desc: "听词选图 · 短对话理解", gradient: "from-sky-400 to-cyan-400", to: `/primary/games/${g}/listen` },
  { key: "reading", title: "📖 阅读", desc: "5 步通关：热身·听读·跟读·思考·宝藏关", gradient: "from-emerald-400 to-teal-400", to: `/primary/reading/grade/${g}` },
  { key: "writing", title: "✍️ 写作", desc: "拼写 · 填空 · 看图写句", gradient: "from-violet-400 to-fuchsia-400", to: `/primary/games/${g}/spell` },
  { key: "vocab", title: "📚 词汇", desc: "本年级核心词", gradient: "from-amber-400 to-orange-400", to: `/primary/vocab/${g}` },
  { key: "chat", title: "💬 Spark 对话", desc: "AI 陪你说英语", gradient: "from-pink-400 to-rose-400", to: "/primary/chat" },
];

type LessonRow = {
  id: string; title_cn: string; title_en: string | null; estimated_minutes: number;
  primary_skill: string; sort_order: number;
  unit: { id: string; title_cn: string; emoji: string | null; sort_order: number };
  progress?: { stars: number; completed_at: string | null }[];
};

export default function PrimaryGrade() {
  const { grade } = useParams<{ grade: string }>();
  const g = Number(grade ?? "3");
  const SKILLS = buildSkills(g);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("primary_lessons")
        .select("id,title_cn,title_en,estimated_minutes,primary_skill,sort_order,unit:primary_units!inner(id,title_cn,emoji,sort_order,grade),progress:primary_lesson_progress(stars,completed_at)")
        .eq("unit.grade", g)
        .order("sort_order");
      setLessons((data ?? []) as any);
      setLoading(false);
    })();
  }, [g]);

  const nextLesson = lessons.find(l => !(l.progress && l.progress.length)) ?? lessons[0];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回年级选择
      </BackLink>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PRIMARY · G{g}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">{g} 年级 · 四大能力</h1>
        <p className="mt-1 text-xs text-muted-foreground">输入 → 理解 → 练习 → 输出 → 测试 · 每天一键开始</p>
      </div>

      {/* Today's lesson big CTA */}
      {nextLesson && (
        <Link to={`/primary/lesson/${nextLesson.id}`}
          className="mb-5 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 p-5 text-white shadow-tile transition hover:-translate-y-0.5">
          <div className="grid size-14 place-items-center rounded-2xl bg-white/25 text-3xl">{nextLesson.unit.emoji ?? "📖"}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">今日推荐 · 5 步学透</div>
            <div className="truncate text-lg font-extrabold">{nextLesson.title_cn}</div>
            <div className="text-xs opacity-90">{nextLesson.unit.title_cn} · 约 {nextLesson.estimated_minutes} 分钟</div>
          </div>
          <Play className="size-7 fill-white" />
        </Link>
      )}

      {/* Lessons list */}
      {!loading && lessons.length > 0 && (
        <section className="mb-6">
          <ModuleStageTests segment="primary" grade={g} module="vocab" />
          <div className="mb-2 flex items-center gap-2 text-sm font-extrabold">
            <Sparkles className="size-4 text-amber-500" /> 本年级课程
          </div>
          <div className="grid gap-2">
            {lessons.map(l => {
              const stars = l.progress?.[0]?.stars ?? 0;
              const done = !!l.progress?.[0]?.completed_at;
              return (
                <Link key={l.id} to={`/primary/lesson/${l.id}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-amber-300">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-rose-200 text-xl">{l.unit.emoji ?? "📘"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-extrabold">{l.title_cn}</div>
                    <div className="text-[11px] text-muted-foreground">{l.unit.title_cn} · {l.estimated_minutes} 分钟</div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star key={i} className={`size-3.5 ${i < stars ? "fill-amber-400 stroke-amber-500" : "stroke-muted-foreground/40"}`} />
                    ))}
                  </div>
                  {done && <div className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">✓</div>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-3">
        {SKILLS.map((s) => (
          <Link key={s.key} to={s.to} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile transition hover:-translate-y-0.5`}>
            <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
            <div className="text-base font-extrabold">{s.title}</div>
            <div className="mt-1 text-xs opacity-90">{s.desc}</div>
            {s.to === "#" && <div className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">即将上线</div>}
          </Link>
        ))}
      </section>
    </main>
  );
}