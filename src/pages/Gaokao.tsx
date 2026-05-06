import { X } from "@/i18n/T";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Trophy, Heart, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ContinueCard } from "@/components/mastery/ContinueCard";

const GRADES = [
  { grade: 1, title: "高一 · Grade 10", subtitle: "起步年级 · 词汇基础 + 语法搭建", gradient: "from-emerald-500 via-teal-500 to-cyan-500", emoji: "🌱" },
  { grade: 2, title: "高二 · Grade 11", subtitle: "提分年级 · 语法系统化 + 阅读专项", gradient: "from-violet-500 via-indigo-500 to-blue-500", emoji: "🚀" },
  { grade: 3, title: "高三 · Grade 12", subtitle: "冲刺年级 · 真题套卷 + 写作 + 完形", gradient: "from-fuchsia-500 via-pink-500 to-rose-500", emoji: "🔥" },
];

export default function Gaokao() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/china" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回中国学生专区
      </BackLink>
      <PageHeader title="高中英语" hideReviewBanner />
      <p className="mt-1 text-sm text-muted-foreground">按年级进入：核心词汇 · 语法 · 阅读 · 完形 · 写作 · 听力</p>

      <div className="mt-4">
        <ContinueCard stage="gaokao" />
      </div>

      <section className="mt-5 grid gap-3">
        {GRADES.map((g) => (
          <Link
            key={g.grade}
            to={`/gaokao/g/${g.grade}`}
            className={`relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br ${g.gradient} p-5 text-white shadow-tile transition hover:-translate-y-0.5`}
          >
            <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
            <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">{g.emoji}</div>
            <div className="relative flex-1 min-w-0">
              <div className="text-lg font-extrabold leading-tight">{g.title}</div>
              <div className="mt-0.5 text-xs opacity-90">{g.subtitle}</div>
            </div>
            <span className="relative text-2xl">→</span>
          </Link>
        ))}

        <Link
          to="/gaokao/exam"
          className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-5 text-white shadow-tile transition hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/20 blur-2xl" />
          <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/25 text-3xl backdrop-blur-sm">🏆</div>
          <div className="relative flex-1 min-w-0">
            <div className="text-lg font-extrabold leading-tight">高考英语 · 综合冲刺</div>
            <div className="mt-0.5 text-xs opacity-90">3500 词 + 真题模拟 + 三年综合诊断 + 错题攻坚</div>
          </div>
          <span className="relative text-2xl">→</span>
        </Link>
      </section>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Trophy className="size-4 text-amber-500" /> 学习方式
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          <li>🎮 词汇用游戏化训练，错题自动进智能复习</li>
          <li>📚 语法 / 阅读 / 完形 / 写作按年级分层，由浅入深</li>
          <li>🐣 答对得金币 + 宠物经验，错题进艾宾浩斯曲线</li>
          <li>🏆 高考综合区做真题套卷，全方位查漏补缺</li>
        </ul>
      </div>

      <div className="mt-4 grid gap-3">
        <Link to="/social" className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 p-3 text-white shadow-tile">
          <Sparkles className="size-5" />
          <div className="flex-1">
            <div className="text-sm font-extrabold">同学社区</div>
            <div className="text-[11px] opacity-90">动态 · 排行榜 · 市集 · 合作答题</div>
          </div>
        </Link>
      </div>
    </main>
  );
}