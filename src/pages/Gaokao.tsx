import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Sparkles, PenLine, Headphones, Edit3, Lock, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TodayGrowthCard } from "@/components/TodayGrowthCard";

const SECTIONS = [
  {
    to: "/gaokao/diagnostic",
    icon: Activity,
    title: "水平诊断",
    desc: "10 分钟 mini 测评，告诉你薄弱在哪里",
    gradient: "from-emerald-500 to-teal-600",
    available: true,
  },
  {
    to: "/gaokao/grammar",
    icon: BookOpen,
    title: "语法",
    desc: "时态 / 从句 / 非谓语 / 虚拟语气，每个考点配讲解 + 题库",
    gradient: "from-blue-600 to-indigo-700",
    available: true,
  },
  {
    to: "/gaokao/reading",
    icon: FileText,
    title: "阅读理解",
    desc: "文章结构分析 + 每个选项为什么对 / 错",
    gradient: "from-violet-600 to-purple-700",
    available: true,
  },
  {
    to: "/gaokao/vocab",
    icon: Sparkles,
    title: "高考词汇",
    desc: "3500 词按掌握度推送，已掌握的不再重复",
    gradient: "from-fuchsia-600 to-pink-600",
    available: true,
  },
  {
    to: "/gaokao/cloze",
    icon: PenLine,
    title: "完形填空",
    desc: "高一基础册 · 16 篇话题精讲，逐空精解 + 自动收录错题",
    gradient: "from-violet-600 to-purple-700",
    available: true,
  },
  {
    to: "#",
    icon: Edit3,
    title: "写作",
    desc: "敬请期待",
    gradient: "from-slate-400 to-slate-500",
    available: false,
  },
  {
    to: "#",
    icon: Headphones,
    title: "听力",
    desc: "敬请期待",
    gradient: "from-slate-400 to-slate-500",
    available: false,
  },
];

export default function Gaokao() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回首页
      </Link>
      <PageHeader title="高考英语" hideReviewBanner />

      <div className="mb-5">
        <TodayGrowthCard />
      </div>

      {/* Stage tests entry - 3 grades */}
      <div className="mb-5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-4 text-white shadow-tile">
        <div className="flex items-center gap-2 text-sm font-extrabold">📊 阶段测试 · 通关挑战</div>
        <div className="mt-1 text-[11px] opacity-90">单元小测 → 模块过关 → 学段诊断 → 高考模拟终测 · 答对得宠物经验和金币</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[1,2,3].map(g => (
            <Link key={g} to={`/stage-tests/gaokao/${g}`} className="rounded-xl bg-white/20 py-2 text-center text-sm font-extrabold transition hover:bg-white/30">
              高{g}
            </Link>
          ))}
        </div>
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
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight">{s.title}</div>
                <div className="mt-0.5 text-xs opacity-90">{s.desc}</div>
              </div>
              {!s.available && <Lock className="size-4 opacity-80" />}
            </div>
          );
          return s.available ? (
            <Link key={s.title} to={s.to}>{Card}</Link>
          ) : (
            <div key={s.title} className="cursor-not-allowed">{Card}</div>
          );
        })}
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        游客可以试做前几题 · 登录后才能保存错题本和诊断报告
      </p>
    </main>
  );
}