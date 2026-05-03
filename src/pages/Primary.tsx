import { Link } from "react-router-dom";
import { ArrowLeft, BookA, Sparkles, Headphones, Target, Lock, Trophy, MessageCircle } from "lucide-react";

const SECTIONS = [
  {
    to: "/primary/chat",
    icon: MessageCircle,
    title: "AI 对话 · Spark 陪你聊",
    desc: "和小宠物 Spark 用英语聊天 · 安全友好 · 错了也会被温柔鼓励 ✨",
    gradient: "from-pink-400 via-fuchsia-400 to-violet-400",
    available: true,
  },
  {
    to: "/primary/letters",
    icon: BookA,
    title: "26 字母 · 自然拼读",
    desc: "字母名 + Phonics 短长音 + 口型笔顺 + 儿歌 + 例词 emoji 卡",
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    available: true,
  },
  {
    to: "/primary/vocab",
    icon: Sparkles,
    title: "小学核心词汇",
    desc: "教育部新课标 16 大主题 · 200 词 · 听音辨义 · 智能掌握度",
    gradient: "from-sky-400 via-cyan-400 to-emerald-400",
    available: true,
  },
  {
    to: "#",
    icon: Headphones,
    title: "听力小故事",
    desc: "敬请期待",
    gradient: "from-slate-400 to-slate-500",
    available: false,
  },
  {
    to: "#",
    icon: Target,
    title: "趣味闯关测验",
    desc: "敬请期待",
    gradient: "from-slate-400 to-slate-500",
    available: false,
  },
];

export default function Primary() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <Link
        to="/china"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回中国学生专区
      </Link>
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          小学英语 · PRIMARY ENGLISH
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
          小学英语启蒙专区
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          按教育部《义务教育英语课程标准（2022 年版）》 · 多感官趣味学习
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
          <li>👀 看：字母大小写 + 笔顺动画提示</li>
          <li>👂 听：纯正英美发音，反复跟读</li>
          <li>👄 说：口型提示帮助小朋友模仿发音</li>
          <li>🎵 唱：朗朗上口的儿歌口诀</li>
          <li>🎮 玩：emoji 例词卡 + 智能复习</li>
        </ul>
      </div>
    </main>
  );
}
