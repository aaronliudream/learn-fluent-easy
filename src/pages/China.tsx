import { ArrowRight, ArrowLeft, BookOpenCheck, School, GraduationCap, Backpack, Library, Lock, Award, Coins, Heart, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import OnlineWidget from "@/components/social/OnlineWidget";
import { ensureSocialDefaults, pingPresence } from "@/lib/social";

type Stage = {
  to?: string;
  icon: any;
  eyebrow: string;
  title: string;
  desc: string;
  gradient: string;
  locked?: boolean;
  badge?: string;
};

const STAGES: Stage[] = [
  {
    to: "/primary",
    icon: Backpack,
    eyebrow: "小学英语 · PRIMARY",
    title: "小学英语专区",
    desc: "26 字母自然拼读 + 200 核心词，新课标趣味启蒙",
    gradient: "from-sky-400 via-cyan-400 to-emerald-400",
    badge: "已上线",
  },
  {
    to: "/junior",
    icon: School,
    eyebrow: "初中英语 · JUNIOR HIGH",
    title: "初中英语专区",
    desc: "中考新课标 200+ 词，按考点系统训练，智能复习",
    gradient: "from-violet-500 via-indigo-500 to-blue-500",
    badge: "已上线",
  },
  {
    to: "/gaokao",
    icon: BookOpenCheck,
    eyebrow: "高中英语 · 高考",
    title: "高中生 · 高考英语专区",
    desc: "诊断薄弱点，覆盖语法、阅读、词汇全部考点，错题智能追加同类题",
    gradient: "from-red-600 via-rose-600 to-orange-500",
    badge: "已上线",
  },
  {
    icon: GraduationCap,
    eyebrow: "大学英语 · CET-4",
    title: "大学英语四级专区",
    desc: "四级高频词汇、长难句、听力与写作模板",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    locked: true,
    badge: "即将上线",
  },
  {
    icon: Library,
    eyebrow: "大学英语 · CET-6",
    title: "大学英语六级专区",
    desc: "六级进阶词汇、翻译与篇章理解强化训练",
    gradient: "from-fuchsia-600 via-purple-600 to-indigo-600",
    locked: true,
    badge: "即将上线",
  },
  {
    icon: Award,
    eyebrow: "研究生英语 · POSTGRADUATE",
    title: "研究生英语专区",
    desc: "考研英语一/二真题词汇、长难句与翻译写作专项突破",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    locked: true,
    badge: "即将上线",
  },
];

const China = () => {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="grid size-10 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
            aria-label="返回首页"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              中国学生专区 · CHINA STUDENTS
            </div>
            <h1 className="text-grad-title mt-1 truncate text-2xl font-extrabold tracking-tight md:text-4xl">
              中国学生英语学习专区
            </h1>
          </div>
        </div>
        <p className="ml-1 mt-2 text-sm text-muted-foreground md:ml-[52px]">
        按学段精准提分：小学 · 初中 · 高中(高考) · 大学四级 · 大学六级 · 研究生
        </p>
      </header>

      {/* 快捷入口：星币宠物 + 全局家长报告 */}
      <div className="mb-3 flex items-center justify-between">
        <OnlineWidget grade="primary" page="/china" />
        <Link to="/social" className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
          <Sparkles className="h-3.5 w-3.5" />同学社区
        </Link>
      </div>
      <section className="mb-2 grid gap-3 sm:grid-cols-2">
        <Link to="/pets" className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-4 text-white shadow-tile transition hover:-translate-y-0.5">
          <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/20 blur-2xl" />
          <div className="relative grid size-11 place-items-center rounded-xl bg-white/25 backdrop-blur-sm">
            <Heart className="size-5" />
          </div>
          <div className="relative flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">PETS · 学习宠物</div>
            <div className="text-base font-extrabold">我的电子宠物</div>
            <div className="text-[11px] opacity-90">学习赚星币 · 喂养、出游、领养、进化</div>
          </div>
          <Coins className="size-5 opacity-90" />
        </Link>
        <Link to="/parent" className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 p-4 text-white shadow-tile transition hover:-translate-y-0.5">
          <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/20 blur-2xl" />
          <div className="relative grid size-11 place-items-center rounded-xl bg-white/25 backdrop-blur-sm">
            <Users className="size-5" />
          </div>
          <div className="relative flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">PARENT CENTER · 家长中心</div>
            <div className="text-base font-extrabold">全学段家长报告</div>
            <div className="text-[11px] opacity-90">小学 / 初中 / 高中 进度、薄弱点、趋势一目了然</div>
          </div>
          <ArrowRight className="size-5 opacity-90 transition group-hover:translate-x-1" />
        </Link>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const inner = (
            <>
              <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-85">
                    {s.eyebrow}
                  </div>
                  {s.badge && (
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold tracking-wide backdrop-blur-sm">
                      {s.badge}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-base font-extrabold leading-tight md:text-lg">{s.title}</div>
                <div className="mt-1 line-clamp-2 text-xs opacity-90 md:text-sm">{s.desc}</div>
              </div>
              {s.locked ? (
                <Lock className="relative size-4 shrink-0 opacity-80" />
              ) : (
                <ArrowRight className="relative size-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-1" />
              )}
            </>
          );
          const cls = `group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 text-white shadow-tile transition-all ${s.locked ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-15px_hsl(0_50%_30%/0.5)]"}`;
          return s.locked || !s.to ? (
            <div key={i} className={cls} aria-disabled>{inner}</div>
          ) : (
            <Link key={i} to={s.to} className={cls}>{inner}</Link>
          );
        })}
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        更多学段内容正在紧张开发中，敬请期待 ✨
      </p>
    </main>
  );
};

export default China;