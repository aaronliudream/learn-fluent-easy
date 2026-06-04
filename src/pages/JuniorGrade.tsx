import { T } from "@/i18n/T";import { Link, Navigate, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Sparkles, BookOpen, Target, Headphones, PenLine } from "lucide-react";
import OnlineWidget from "@/components/social/OnlineWidget";
import { useJuniorClassroomSync } from "@/hooks/useJuniorClassroomSync";
import { type JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";

const GRADE_META: Record<string, {title: string;emoji: string;gradient: string;tag: string;}> = {
  "1": { title: "初一 · Grade 7", emoji: "🌱", gradient: "from-emerald-500 to-teal-500", tag: "JUNIOR · G1" },
  "2": { title: "初二 · Grade 8", emoji: "🚀", gradient: "from-violet-500 to-indigo-500", tag: "JUNIOR · G2" },
  "3": { title: "初三 · Grade 9", emoji: "🔥", gradient: "from-fuchsia-500 to-rose-500", tag: "JUNIOR · G3" }
};

export default function JuniorGrade() {
  // 年级页：已恢复显示（管理员预览成长中心卡）。如需重新隐藏，取消下一行注释即可。
  // return <Navigate to="/junior" replace />;

  const { grade } = useParams<{grade: string;}>();
  const g = grade ?? "1";
  const gradeCn = g === "1" ? "初一" : g === "2" ? "初二" : "初三";
  const meta = GRADE_META[g] ?? GRADE_META["1"];
  // URL uses 1/2/3 (初一/初二/初三) but DB stores 7/8/9 (Grade 7/8/9).
  const dbGrade = g === "1" ? 7 : g === "2" ? 8 : g === "3" ? 9 : Number(g);
  // 与首页同口径:用 useJuniorClassroomSync 取该年级真实掌握度(g7/g8/g9)
  const gradeKey = (`g${dbGrade}`) as JuniorGradeKey;
  const classroom = useJuniorClassroomSync(gradeKey);

  const SECTIONS = [
  {
    to: `/junior/grammar?grade=${dbGrade}`,
    icon: BookOpen,
    title: "中考语法专项",
    desc: "时态 · 从句 · 非谓语 · 中考考点直击",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500"
  },
  {
    to: `/junior/reading?grade=${dbGrade}`,
    icon: Target,
    title: "阅读训练",
    desc: "主题阅读 · 答题解析 · 答对喂宠物",
    gradient: "from-amber-500 via-orange-500 to-rose-500"
  },
  {
    to: `/junior/listening?grade=${dbGrade}`,
    icon: Headphones,
    title: "听力短文训练",
    desc: "对话/短文 · 听音答题 · 中考听力题型",
    gradient: "from-sky-500 via-blue-500 to-indigo-500"
  },
  {
    to: `/junior/writing?grade=${dbGrade}`,
    icon: PenLine,
    title: "中考写作训练",
    desc: "命题作文 · AI 批改 · 高分范文对比",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500"
  }];


  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回初中专区</T>
      </BackLink>

      {/* 掌握度卡 —— 与首页同口径(useJuniorClassroomSync 真实数据，按年级 g7/g8/g9) */}
      <section className="mb-3 flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-5 text-white shadow-tile">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/25 text-2xl font-extrabold backdrop-blur-sm">
          {classroom.loading ? "…" : `${classroom.percent}%`}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">MASTERY</div>
          <div className="text-lg font-extrabold leading-tight">{gradeCn}掌握度</div>
          <div className="mt-0.5 text-xs opacity-90">
            已掌握 {classroom.mastered} / {classroom.total} 项 · 词汇/语法/阅读/听力/写作
          </div>
        </div>
      </section>

      {/* 课堂同步入口在年级页隐藏(保留代码/路由/数据,可恢复);/junior 顶层页的大卡仍保留
      <Link
        to={`/junior/hub/${dbGrade}`}
        className="mb-3 relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-5 text-white shadow-tile transition hover:-translate-y-0.5"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/20 blur-2xl" />
        <div className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-white/25 text-4xl backdrop-blur-sm">
          📘
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">CLASSROOM · SYNC</div>
          <div className="text-lg font-extrabold leading-tight"><T>课堂同步 · 人教版</T></div>
          <div className="mt-0.5 text-xs opacity-90"><T>按单元学习 · 词汇/语法/阅读/听力/写作 · 10% 进度 AI 小测</T></div>
        </div>
        <span className="relative rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur-sm"><T>▶ 进入</T></span>
      </Link>
      */}
      <Link
        to={`/junior/vocab?grade=${dbGrade}`}
        className="mb-3 relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 p-5 text-white shadow-tile transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-18px_rgba(91,43,201,0.6)]">
        
        <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/20 blur-2xl" />
        <span className="pointer-events-none absolute -left-6 -bottom-10 size-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-white/25 text-4xl backdrop-blur-sm">
          🎮
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">VOCAB · GAMES</div>
          <div className="text-lg font-extrabold leading-tight"><T>核心词汇 · 5 种游戏</T></div>
          <div className="mt-0.5 text-xs opacity-90"><T>单词便当 / 任务 / 对决 / 听写 · 边玩边背</T></div>
        </div>
        <span className="relative rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur-sm"><T>▶ 开始</T></span>
      </Link>

      <section className="grid gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              to={s.to}
              className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile transition hover:-translate-y-0.5`}>
              
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight"><T>{s.title}</T></div>
                <div className="mt-0.5 text-xs opacity-90"><T>{s.desc}</T></div>
              </div>
            </Link>);

        })}
      </section>

      <div className="mt-6 flex justify-center"><OnlineWidget grade="junior" page={`/junior/g/${g}`} /></div>
    </main>);

}
