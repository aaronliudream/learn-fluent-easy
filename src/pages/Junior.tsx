import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, BookOpen, Headphones, Target, Lock, Trophy, Heart, Users } from "lucide-react";

const SECTIONS = [
  {
    to: "/junior/vocab",
    icon: Sparkles,
    title: "初中核心词汇",
    desc: "中考新课标 16 大主题 · 200+ 词 · 听音辨义 · 智能掌握度",
    gradient: "from-violet-500 via-indigo-500 to-blue-500",
    available: true,
  },
  {
    to: "#",
    icon: BookOpen,
    title: "中考语法专项",
    desc: "敬请期待",
    gradient: "from-slate-400 to-slate-500",
    available: false,
  },
  {
    to: "#",
    icon: Headphones,
    title: "听力短文训练",
    desc: "敬请期待",
    gradient: "from-slate-400 to-slate-500",
    available: false,
  },
  {
    to: "#",
    icon: Target,
    title: "完形阅读闯关",
    desc: "敬请期待",
    gradient: "from-slate-400 to-slate-500",
    available: false,
  },
];

export default function Junior() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <Link to="/china" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回中国学生专区
      </Link>
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          初中英语 · JUNIOR HIGH
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">初中英语专区</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          按教育部《义务教育英语课程标准（2022 年版）》 · 中考考点系统训练
        </p>
      </div>

      <section className="grid gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const Card = (
            <div
              className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile ${
                s.available ? "transition hover:-translate-y-0.5" : "opacity-70"
              }`}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight">{s.title}</div>
                <div className="mt-0.5 text-xs opacity-90">{s.desc}</div>
              </div>
              {!s.available && <Lock className="relative size-4 opacity-80" />}
            </div>
          );
          return s.available ? (
            <Link key={s.title} to={s.to}>{Card}</Link>
          ) : (
            <div key={s.title} className="cursor-not-allowed">{Card}</div>
          );
        })}
      </section>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Trophy className="size-4 text-amber-500" /> 学习方式
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          <li>📖 主题词块化学习，对接中考考纲</li>
          <li>👂 标准英美音听音辨义</li>
          <li>🎯 测验答题接入智能复习系统（FSRS）</li>
          <li>📈 自动统计掌握度，动态调整复习</li>
        </ul>
      </div>
    </main>
  );
}
