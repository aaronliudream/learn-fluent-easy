import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Trophy, BookOpen, Target, Headphones, PenLine, Rocket, Sparkles, Mic } from "lucide-react";
import { ContinueCard } from "@/components/mastery/ContinueCard";

const GRADE_FILTERS = [
  { key: "all", label: "全部", q: "" },
  { key: "7", label: "G7 初一", q: "7" },
  { key: "8", label: "G8 初二", q: "8" },
  { key: "9", label: "G9 初三", q: "9" },
];
const LS_KEY = "junior:gradeFilter";

export default function Junior() {
  const [grade, setGrade] = useState<string>("all");
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setGrade(saved);
  }, []);
  useEffect(() => { localStorage.setItem(LS_KEY, grade); }, [grade]);
  const q = grade === "all" ? "" : `?grade=${grade}`;

  const MODULES = [
    { to: `/junior/vocab${q}`, icon: "🎮", title: "核心词汇 · 5 种游戏", desc: "单词便当 / 任务 / 对决 / 听写 · 边玩边背", gradient: "from-violet-500 via-indigo-500 to-blue-500", hero: true },
    { to: `/talk?stage=junior`, icon: Mic, title: "AI 口语对话 · 中考话题", desc: "和 Alex 真人语音聊天 · 校园 / 兴趣 / 旅行 / 节日", gradient: "from-rose-500 via-pink-500 to-fuchsia-600" },
    { to: `/junior/grammar${q}`, icon: BookOpen, title: "中考语法专项", desc: "时态 · 从句 · 非谓语 · 中考考点直击", gradient: "from-emerald-500 via-teal-500 to-cyan-500" },
    { to: `/junior/reading${q}`, icon: Target, title: "阅读训练", desc: "主题阅读 · 答题解析 · 答对喂宠物", gradient: "from-amber-500 via-orange-500 to-rose-500" },
    { to: `/junior/listening${q}`, icon: Headphones, title: "听力短文训练", desc: "对话/短文 · 听音答题 · 中考听力题型", gradient: "from-sky-500 via-blue-500 to-indigo-500" },
    { to: `/junior/writing${q}`, icon: PenLine, title: "中考写作训练", desc: "命题作文 · AI 批改 · 高分范文对比", gradient: "from-fuchsia-500 via-pink-500 to-rose-500" },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/#stages" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回学习阶段
      </BackLink>
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          初中英语 · JUNIOR HIGH
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">初中英语专区</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          核心词汇游戏 · 中考语法 · 阅读 · 听力 · 写作（可按年级筛选）
        </p>
      </div>

      <ContinueCard stage="junior" />

      {/* Grammar Lab 显眼入口 */}
      <Link
        to={`/junior/grammar${q}`}
        className="group relative mt-4 flex items-center gap-4 overflow-hidden rounded-3xl border-2 border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 p-5 text-white shadow-2xl transition hover:-translate-y-0.5 hover:shadow-fuchsia-500/40"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/20 blur-3xl" />
        <span className="pointer-events-none absolute -left-6 -bottom-6 size-24 rounded-full bg-pink-400/30 blur-2xl" />
        <div className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Rocket className="size-8" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-extrabold tracking-wider backdrop-blur-sm">
              NEW
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">Grammar Lab · 9 阶段语法实验室</span>
          </div>
          <div className="mt-1 text-xl font-extrabold leading-tight">🚀 进入语法实验室</div>
          <div className="mt-1 flex items-center gap-1 text-xs opacity-95">
            <Sparkles className="size-3" /> 钩子 · 口诀 · 老师讲解 · 反射卡 · 情景演练 · 改错 · BOSS 题
          </div>
        </div>
      </Link>

      <div className="my-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">年级筛选</div>
        <div className="flex flex-wrap gap-2">
          {GRADE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setGrade(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                grade === f.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-3">
        {MODULES.map((m) => {
          const Icon = typeof m.icon === "string" ? null : m.icon;
          return (
            <Link
              key={m.title}
              to={m.to}
              className={`relative flex items-center gap-4 overflow-hidden ${m.hero ? "rounded-3xl p-5" : "rounded-2xl p-4"} bg-gradient-to-br ${m.gradient} text-white shadow-tile transition hover:-translate-y-0.5`}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className={`relative grid ${m.hero ? "size-16 text-4xl" : "size-12"} shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm`}>
                {Icon ? <Icon className="size-6" /> : <span>{m.icon as string}</span>}
              </div>
              <div className="relative flex-1 min-w-0">
                <div className={`${m.hero ? "text-lg" : "text-base"} font-extrabold leading-tight`}>{m.title}</div>
                <div className="mt-0.5 text-xs opacity-90">{m.desc}</div>
              </div>
            </Link>
          );
        })}
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
