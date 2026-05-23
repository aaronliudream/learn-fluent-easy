import { T } from "@/i18n/T";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, FileText, Clock, MapPin, Star } from "lucide-react";
import { listExams } from "@/data/exams";
import type { ExamPaper } from "@/data/exams/types";

function ExamMeta({ exam }: { exam: ExamPaper }) {
  const minutes = Math.round(exam.duration_seconds / 60);
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-90 [font-variant-numeric:tabular-nums]">
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Clock className="size-3.5 shrink-0" aria-hidden />
        <span>{minutes}</span>
        <T>分钟</T>
      </span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span>{exam.questions.length}</span>
        <T>题</T>
        <span aria-hidden className="opacity-70">·</span>
        <T>满分</T>
        <span>{exam.total_score}</span>
      </span>
    </div>
  );
}

export default function SuzhouExamList() {
  const exams = listExams();

  return (
    <div className="min-h-screen w-full bg-background">
      <main className="mx-auto w-full min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:max-w-4xl">
        <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 shrink-0" aria-hidden /> <T>返回初中专区</T>
        </BackLink>

        <div className="mb-5 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-stone-500 via-amber-600 to-orange-600 p-5 text-white shadow-tile">
          <div className="grid size-14 shrink-0 place-items-center self-center rounded-2xl bg-white/25 text-3xl" aria-hidden>
            🏛️
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-90"><T>SUZHOU · 苏州中考</T></div>
            <h1 className="text-2xl font-extrabold leading-tight"><T>苏州中考英语真题</T></h1>
            <p className="mt-1 text-sm leading-snug opacity-90"><T>历年真题模考 · 三种模式 · 即时解析</T></p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <MapPin className="size-4 shrink-0 text-amber-600" aria-hidden /> <T>苏州卷说明</T>
          </div>
          <ul className="mt-2.5 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            <li><T>完形 · 阅读 · 信息还原 · 词汇 · 书面表达 全覆盖</T></li>
            <li><T>支持练习 / 考试 / 复习三种模式</T></li>
            <li><T>客观题自动批改，主观题提供参考答案</T></li>
          </ul>
        </div>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"><T>真题试卷</T></h2>
            <Link
              to="/junior/suzhou/favorites"
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100">
              <Star className="size-3.5 shrink-0" aria-hidden />
              <T>我的收藏</T>
            </Link>
          </div>
          {exams.map((exam) => (
            <Link
              key={exam.id}
              to={`/junior/suzhou/${exam.id}/mode`}
              aria-label={`${exam.year}年 ${exam.title}`}
              className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 px-4 py-4 text-white shadow-tile transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80">
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" aria-hidden />
              <div className="relative grid size-12 shrink-0 place-items-center self-center rounded-xl bg-white/20 backdrop-blur-sm">
                <FileText className="size-6" aria-hidden />
              </div>
              <div className="relative min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-extrabold tabular-nums">{exam.year}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.15em] opacity-90">{exam.city}</span>
                </div>
                <div className="mt-1 text-base font-extrabold leading-snug"><T>{exam.title}</T></div>
                <ExamMeta exam={exam} />
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
