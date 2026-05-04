import { Link, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Sparkles, BookOpen, Target, Headphones, PenLine } from "lucide-react";
import OnlineWidget from "@/components/social/OnlineWidget";

const GRADE_META: Record<string, { title: string; emoji: string; gradient: string; tag: string }> = {
  "1": { title: "初一 · Grade 7", emoji: "🌱", gradient: "from-emerald-500 to-teal-500", tag: "JUNIOR · G1" },
  "2": { title: "初二 · Grade 8", emoji: "🚀", gradient: "from-violet-500 to-indigo-500", tag: "JUNIOR · G2" },
  "3": { title: "初三 · Grade 9", emoji: "🔥", gradient: "from-fuchsia-500 to-rose-500", tag: "JUNIOR · G3" },
};

export default function JuniorGrade() {
  const { grade } = useParams<{ grade: string }>();
  const g = grade ?? "1";
  const meta = GRADE_META[g] ?? GRADE_META["1"];
  // URL uses 1/2/3 (初一/初二/初三) but DB stores 7/8/9 (Grade 7/8/9).
  const dbGrade = g === "1" ? 7 : g === "2" ? 8 : g === "3" ? 9 : Number(g);

  const SECTIONS = [
    {
      to: `/junior/grammar?grade=${dbGrade}`,
      icon: BookOpen,
      title: "中考语法专项",
      desc: "时态 · 从句 · 非谓语 · 中考考点直击",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    },
    {
      to: `/junior/reading?grade=${dbGrade}`,
      icon: Target,
      title: "阅读训练",
      desc: "主题阅读 · 答题解析 · 答对喂宠物",
      gradient: "from-amber-500 via-orange-500 to-rose-500",
    },
    {
      to: `/junior/listening?grade=${dbGrade}`,
      icon: Headphones,
      title: "听力短文训练",
      desc: "对话/短文 · 听音答题 · 中考听力题型",
      gradient: "from-sky-500 via-blue-500 to-indigo-500",
    },
    {
      to: `/junior/writing?grade=${dbGrade}`,
      icon: PenLine,
      title: "中考写作训练",
      desc: "命题作文 · AI 批改 · 高分范文对比",
      gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回初中专区
      </BackLink>

      <div className={`mb-5 flex items-center gap-4 rounded-3xl bg-gradient-to-br ${meta.gradient} p-5 text-white shadow-tile`}>
        <div className="grid size-14 place-items-center rounded-2xl bg-white/25 text-3xl">{meta.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">{meta.tag}</div>
          <h1 className="text-2xl font-extrabold leading-tight">{meta.title}</h1>
          <p className="mt-0.5 text-xs opacity-90">五大模块系统训练 · 一站搞定中考考点</p>
        </div>
      </div>

      {/* 阶段测试入口 */}
      <Link
        to={`/stage-tests/junior/${g}`}
        className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-4 text-white shadow-tile transition hover:-translate-y-0.5"
      >
        <div className="grid size-12 place-items-center rounded-xl bg-white/25 text-2xl">📊</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold">阶段测试 · 通关挑战</div>
          <div className="text-[11px] opacity-90">单元小测 → 模块过关 → 中考冲刺 · 答对得宠物经验和金币</div>
        </div>
        <span className="text-2xl">→</span>
      </Link>

      <section className="grid gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              to={s.to}
              className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile transition hover:-translate-y-0.5`}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight">{s.title}</div>
                <div className="mt-0.5 text-xs opacity-90">{s.desc}</div>
              </div>
            </Link>
          );
        })}
      </section>

      <div className="mt-6 flex justify-center"><OnlineWidget grade="junior" page={`/junior/g/${g}`} /></div>
    </main>
  );
}
