import { T } from "@/i18n/T";
import { Link, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Eye, GraduationCap, Lock } from "lucide-react";
import { getExam } from "@/data/exams";
import {
  getSuzhouExamProgress,
  isReviewUnlocked,
  reviewLockedHint,
} from "@/lib/suzhouExamProgress";

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
  const progress = examId ? getSuzhouExamProgress(examId) : {};
  const reviewUnlocked = examId ? isReviewUnlocked(examId) : false;
  const reviewHint = examId ? reviewLockedHint(examId) : "";

  if (!exam) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <T>试卷未找到</T>
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
    <main className="mx-auto w-full min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:max-w-4xl">
      <BackLink to="/junior/suzhou" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回试卷列表</T>
      </BackLink>

      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><T>选择模式</T></div>
        <h1 className="mt-1 text-xl font-extrabold leading-tight"><T>{exam.title}</T></h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground [font-variant-numeric:tabular-nums]">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            {Math.round(exam.duration_seconds / 60)} <T>分钟</T>
          </span>
          <span aria-hidden className="opacity-50">·</span>
          <span className="whitespace-nowrap">
            {exam.questions.length} <T>题</T>
          </span>
        </p>
      </div>

      <section className="grid gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const locked = m.key === "review" && !reviewUnlocked;
          const modeDone =
            m.key === "exam"
              ? Boolean(progress.exam?.completedAt)
              : m.key === "practice"
                ? Boolean(progress.practice?.completedAt)
                : reviewUnlocked;

          const inner = (
            <>
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center self-center rounded-xl bg-white/20 backdrop-blur-sm">
                {locked ? <Lock className="size-6" aria-hidden /> : <Icon className="size-6" aria-hidden />}
              </div>
              <div className="relative min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-base font-extrabold leading-tight"><T>{m.title}</T></div>
                  {modeDone && !locked && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="size-3" /> <T>已完成</T>
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs opacity-90">
                  {locked ? <T>{reviewHint}</T> : <T>{m.desc}</T>}
                </div>
              </div>
            </>
          );

          if (locked) {
            return (
              <div
                key={m.key}
                aria-disabled
                className={`relative flex cursor-not-allowed items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${m.gradient} px-4 py-4 text-white opacity-75 shadow-tile`}>
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={m.key}
              to={`/junior/suzhou/${exam.id}?mode=${m.key}`}
              className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${m.gradient} px-4 py-4 text-white shadow-tile transition hover:-translate-y-0.5`}>
              {inner}
            </Link>
          );
        })}
      </section>
    </main>
    </div>
  );
}
