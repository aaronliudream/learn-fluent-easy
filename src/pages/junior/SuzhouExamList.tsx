import { T } from "@/i18n/T";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, FileText, Clock, MapPin, Star } from "lucide-react";
import { listExams } from "@/data/exams";

export default function SuzhouExamList() {
  const exams = listExams();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回初中专区</T>
      </BackLink>

      <div className="mb-5 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-stone-500 via-amber-600 to-orange-600 p-5 text-white shadow-tile">
        <div className="grid size-14 place-items-center rounded-2xl bg-white/25 text-3xl">🏛️</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90"><T>SUZHOU · 苏州中考</T></div>
          <h1 className="text-2xl font-extrabold leading-tight"><T>苏州中考英语真题</T></h1>
          <p className="mt-0.5 text-xs opacity-90"><T>历年真题模考 · 三种模式 · 即时解析</T></p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <MapPin className="size-4 text-amber-600" /> <T>苏州卷说明</T>
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          <li><T>完形 · 阅读 · 信息还原 · 词汇 · 书面表达 全覆盖</T></li>
          <li><T>支持练习 / 考试 / 复习三种模式</T></li>
          <li><T>客观题自动批改，主观题提供参考答案</T></li>
        </ul>
      </div>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><T>真题试卷</T></div>
          <Link
            to="/junior/suzhou/favorites"
            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100">
            <Star className="size-3.5" />
            <T>我的收藏</T>
          </Link>
        </div>
        {exams.map((exam) => (
          <Link
            key={exam.id}
            to={`/junior/suzhou/${exam.id}/mode`}
            className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 p-4 text-white shadow-tile transition hover:-translate-y-0.5">
            <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
            <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText className="size-6" />
            </div>
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-extrabold">{exam.year}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-90">{exam.city}</span>
              </div>
              <div className="mt-1 text-base font-extrabold leading-tight"><T>{exam.title}</T></div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs opacity-90">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" /> {Math.round(exam.duration_seconds / 60)} <T>分钟</T>
                </span>
                <span>{exam.questions.length} <T>题 · 满分</T> {exam.total_score}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
