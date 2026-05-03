import { ArrowRight, BookOpenCheck, School, GraduationCap, Backpack, Library, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

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
    icon: Backpack,
    eyebrow: "小学英语 · PRIMARY",
    title: "小学英语专区",
    desc: "字母、自然拼读、基础词汇与句型，趣味闯关式启蒙",
    gradient: "from-sky-400 via-cyan-400 to-emerald-400",
    locked: true,
    badge: "即将上线",
  },
  {
    icon: School,
    eyebrow: "初中英语 · JUNIOR HIGH",
    title: "初中英语专区",
    desc: "中考核心语法、词汇与完形阅读，按考点系统训练",
    gradient: "from-violet-500 via-indigo-500 to-blue-500",
    locked: true,
    badge: "即将上线",
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
];

const China = () => {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        backTo="/"
        eyebrow="中国学生专区 · CHINA"
        title="中国学生英语学习专区"
        subtitle="按学段精准提分：小学 · 初中 · 高中(高考) · 大学四级 · 大学六级"
      />

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