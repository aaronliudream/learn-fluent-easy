import { X } from "@/i18n/T";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Trophy, Heart, Sparkles } from "lucide-react";
import OnlineWidget from "@/components/social/OnlineWidget";
import { ContinueCard } from "@/components/mastery/ContinueCard";

const GRADES = [
  {
    grade: 1,
    title: "初一 · Grade 7",
    subtitle: "起步年级 · 时态/词汇打基础",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    emoji: "🌱",
  },
  {
    grade: 2,
    title: "初二 · Grade 8",
    subtitle: "中考关键年 · 从句/语法系统化",
    gradient: "from-violet-500 via-indigo-500 to-blue-500",
    emoji: "🚀",
  },
  {
    grade: 3,
    title: "初三 · Grade 9",
    subtitle: "中考冲刺 · 真题/写作/听力",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    emoji: "🔥",
  },
];

export default function Junior() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/china" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回中国学生专区
      </BackLink>
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          初中英语 · JUNIOR HIGH
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">初中英语专区</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          按年级进入：核心词汇游戏 · 中考语法 · 阅读 · 听力 · 写作
        </p>
      </div>

      <ContinueCard stage="junior" />

      <section className="grid gap-3">
        {GRADES.map((g) => (
          <Link
            key={g.grade}
            to={`/junior/g/${g.grade}`}
            className={`relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br ${g.gradient} p-5 text-white shadow-tile transition hover:-translate-y-0.5`}
          >
            <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
            <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
              {g.emoji}
            </div>
            <div className="relative flex-1 min-w-0">
              <div className="text-lg font-extrabold leading-tight">{g.title}</div>
              <div className="mt-0.5 text-xs opacity-90">{g.subtitle}</div>
            </div>
            <span className="relative text-2xl">→</span>
          </Link>
        ))}
      </section>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Trophy className="size-4 text-amber-500" /> 学习方式
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          <li>🎮 词汇用 5 种游戏（便当/任务/对决/翻牌/听写）彻底掌握</li>
          <li>📚 中考语法专项 + 阅读 + 听力 + 写作 全覆盖</li>
          <li>🐣 答对得金币和宠物经验，错题进智能复习</li>
          <li>📈 自动按艾宾浩斯曲线安排复习</li>
        </ul>
      </div>
    </main>
  );
}
