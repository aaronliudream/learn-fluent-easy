import { T } from "@/i18n/T";
import { Link, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, BookOpen, Clock, Eye, GraduationCap } from "lucide-react";
import { getExam } from "@/data/exams";

const MODES = [
  {
    key: "practice" as const,
    icon: BookOpen,
    title: "练习模式",
    desc: "不限时 · 按题组（如一篇阅读）全部答完才出解析 · 适合分段精练",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    key: "exam" as const,
    icon: GraduationCap,
    title: "考试模式",
    desc: "100 分钟倒计时 · 提交后统一出分 · 模拟真实考场",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    key: "review" as const,
    icon: Eye,
    title: "复习模式",
    desc: "直接显示全部答案与解析 · 快速回顾考点",
    gradient: "from-violet-500 to-indigo-600",
  },
];

export default function SuzhouExamModeSelect() {
  const { examId } = useParams<{ examId: string }>();
  const exam = examId ? getExam(examId) : undefined;

  if (!exam) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <T>试卷未找到</T>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior/suzhou" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回试卷列表</T>
      </BackLink>

      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><T>选择模式</T></div>
        <h1 className="mt-1 text-xl font-extrabold leading-tight"><T>{exam.title}</T></h1>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> {Math.round(exam.duration_seconds / 60)} <T>分钟 ·</T> {exam.questions.length} <T>题</T>
        </p>
      </div>

      <section className="grid gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.key}
              to={`/junior/suzhou/${exam.id}?mode=${m.key}`}
              className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${m.gradient} p-4 text-white shadow-tile transition hover:-translate-y-0.5`}>
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight"><T>{m.title}</T></div>
                <div className="mt-0.5 text-xs opacity-90"><T>{m.desc}</T></div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
