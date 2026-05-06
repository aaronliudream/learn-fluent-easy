import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Sparkles, Star, Award, Target } from "lucide-react";
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

// 课标对照：1-2 年级 → CEFR Pre-A1 启蒙阶段
const CEFR_BY_GRADE: Record<number, { label: string; cn: string; goal: string }> = {
  1: { label: "Pre-A1", cn: "启蒙阶段", goal: "课标一级 · 累计认读约 150 词" },
  2: { label: "Pre-A1", cn: "启蒙阶段", goal: "课标一级 · 累计认读约 200 词" },
  3: { label: "A1", cn: "入门阶段", goal: "课标二级 · 累计认读约 400 词" },
  4: { label: "A1", cn: "入门阶段", goal: "课标二级 · 累计认读约 500 词" },
  5: { label: "A2", cn: "基础阶段", goal: "课标三级 · 累计认读约 600 词" },
  6: { label: "A2", cn: "基础阶段", goal: "课标三级 · 累计认读约 700 词" },
};

// 教育学推荐学习路径：输入 → 内化 → 输出
const LEARNING_PATH = [
  { stage: 1, title: "听 · 看", desc: "字母 · 词汇输入", skills: ["vocab", "listening"] },
  { stage: 2, title: "拼 · 读", desc: "拼读 · 分级阅读", skills: ["reading", "writing"] },
  { stage: 3, title: "练 · 玩", desc: "游戏巩固 SRS", skills: ["games"] },
  { stage: 4, title: "说 · 用", desc: "对话输出", skills: ["chat"] },
];

type LessonRow = {
  id: string; title_cn: string; title_en: string | null; estimated_minutes: number;
  primary_skill: string; sort_order: number;
  unit: { id: string; title_cn: string; emoji: string | null; sort_order: number };
  progress?: { stars: number; completed_at: string | null }[];
};

// 能力雷达图（SVG，无依赖）
function RadarChart({ scores }: { scores: { label: string; value: number }[] }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 65;
  const n = scores.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, v: number) => {
    const rr = r * Math.max(0.05, Math.min(1, v));
    return [cx + Math.cos(angle(i)) * rr, cy + Math.sin(angle(i)) * rr];
  };
  const polygon = scores.map((s, i) => point(i, s.value).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-full">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={scores.map((_, i) => {
            const [x, y] = [cx + Math.cos(angle(i)) * r * f, cy + Math.sin(angle(i)) * r * f];
            return `${x},${y}`;
          }).join(" ")}
          className="fill-none stroke-muted-foreground/15"
          strokeWidth={1}
        />
      ))}
      {scores.map((_, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="stroke-muted-foreground/15" strokeWidth={1} />;
      })}
      <polygon points={polygon} className="fill-primary/30 stroke-primary" strokeWidth={2} />
      {scores.map((s, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * (r + 12), cy + Math.sin(angle(i)) * (r + 12)];
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[9px] font-bold">
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

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

  // 能力雷达：按 primary_skill 分组完成率
  const skillBuckets: Record<string, { done: number; total: number }> = {
    listening: { done: 0, total: 0 },
    reading: { done: 0, total: 0 },
    speaking: { done: 0, total: 0 },
    writing: { done: 0, total: 0 },
    vocab: { done: 0, total: 0 },
  };
  lessons.forEach((l) => {
    const k = (l.primary_skill || "vocab").toLowerCase();
    const bucket = skillBuckets[k] ?? skillBuckets.vocab;
    bucket.total += 1;
    if (l.progress?.[0]?.completed_at) bucket.done += 1;
  });
  const radarScores = [
    { label: "听", value: skillBuckets.listening.total ? skillBuckets.listening.done / skillBuckets.listening.total : 0.05 },
    { label: "说", value: skillBuckets.speaking.total ? skillBuckets.speaking.done / skillBuckets.speaking.total : 0.05 },
    { label: "读", value: skillBuckets.reading.total ? skillBuckets.reading.done / skillBuckets.reading.total : 0.05 },
    { label: "写", value: skillBuckets.writing.total ? skillBuckets.writing.done / skillBuckets.writing.total : 0.05 },
    { label: "词", value: skillBuckets.vocab.total ? skillBuckets.vocab.done / skillBuckets.vocab.total : 0.05 },
  ];
  const totalDone = lessons.filter((l) => l.progress?.[0]?.completed_at).length;
  const totalAll = lessons.length;
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  const cefr = CEFR_BY_GRADE[g] ?? CEFR_BY_GRADE[1];

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

      {/* CEFR 国际等级 + 课标对照 */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-primary/20 bg-primary/5 p-3">
        <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
          <Award className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">CEFR {cefr.label}</span>
            <span className="text-[11px] font-bold text-foreground">{cefr.cn}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{cefr.goal}</div>
        </div>
        <div className="text-right">
          <div className="text-base font-extrabold text-primary">{overallPct}%</div>
          <div className="text-[10px] text-muted-foreground">总进度</div>
        </div>
      </div>

      {/* 教育学学习路径：输入 → 内化 → 输出 */}
      <section className="mb-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold text-muted-foreground">
          <Target className="size-3.5 text-rose-500" /> 推荐学习路径 · 二语习得规律
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {LEARNING_PATH.map((p, i) => (
            <div key={p.stage} className="relative rounded-xl border-2 border-border bg-card p-2 text-center">
              <div className="mx-auto grid size-6 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-[10px] font-extrabold text-white">{p.stage}</div>
              <div className="mt-1 text-[11px] font-extrabold">{p.title}</div>
              <div className="text-[9px] text-muted-foreground leading-tight">{p.desc}</div>
              {i < LEARNING_PATH.length - 1 && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-muted-foreground/40">›</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 能力雷达图 */}
      <section className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3">
        <div className="size-32 shrink-0">
          <RadarChart scores={radarScores} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold">五维能力雷达</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">基于已完成课程，对照课标核心素养</div>
          <div className="mt-2 grid grid-cols-5 gap-1 text-center">
            {radarScores.map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 px-1 py-1">
                <div className="text-[10px] font-bold text-muted-foreground">{s.label}</div>
                <div className="text-[11px] font-extrabold text-primary">{Math.round(s.value * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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