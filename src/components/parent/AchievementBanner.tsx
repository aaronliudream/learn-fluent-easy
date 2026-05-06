import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Headphones, Target, TrendingUp, TrendingDown, Trophy, Loader2, Sparkles, AlertCircle, ChevronRight, Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Mastery = {
  word_id: string;
  mastery_level: number | null;
  interval_days: number | null;
  listen_correct: number | null;
  listen_wrong: number | null;
  last_seen_at: string | null;
};
type LessonProg = { lesson_id: string; completed_at: string | null; accuracy: number | null };
type Target = { grade: number; target_vocab: number; target_lessons: number; benchmark_name: string; benchmark_desc: string | null };
type Snap = { week_start: string; vocab_mastered: number; lessons_completed: number; listen_correct: number; listen_total: number };

const GRADES = [1, 2, 3, 4, 5, 6];

function isoMonday(d: Date): string {
  const x = new Date(d); const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

export default function AchievementBanner() {
  const [grade, setGrade] = useState<number>(() => Number(localStorage.getItem("primary:lastGrade") ?? "1"));
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Target | null>(null);
  const [vocabTotal, setVocabTotal] = useState(0);
  const [lessonsTotal, setLessonsTotal] = useState(0);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [progress, setProgress] = useState<LessonProg[]>([]);
  const [lastSnap, setLastSnap] = useState<Snap | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;

      const [{ data: tg }, { data: vocab }, { data: lessons }] = await Promise.all([
        supabase.from("primary_grade_targets").select("*").eq("grade", grade).maybeSingle(),
        supabase.from("primary_vocab").select("id").eq("grade", grade),
        supabase.from("primary_lessons").select("id, primary_units!inner(grade)").eq("primary_units.grade", grade),
      ]);
      setTarget((tg as any) ?? null);
      setVocabTotal((vocab ?? []).length);
      setLessonsTotal((lessons ?? []).length);

      if (uid) {
        const { data: m } = await supabase
          .from("primary_word_mastery")
          .select("word_id,mastery_level,interval_days,listen_correct,listen_wrong,last_seen_at")
          .eq("user_id", uid).eq("grade", grade);
        setMastery((m ?? []) as Mastery[]);

        const lessonIds = (lessons ?? []).map((l: any) => l.id);
        if (lessonIds.length) {
          const { data: lp } = await supabase
            .from("primary_lesson_progress")
            .select("lesson_id,completed_at,accuracy")
            .eq("user_id", uid).in("lesson_id", lessonIds);
          setProgress((lp ?? []) as LessonProg[]);
        } else { setProgress([]); }

        // Last week's snapshot — for delta
        const today = new Date();
        const lastMonday = new Date(today); lastMonday.setDate(today.getDate() - 7);
        const { data: ls } = await supabase
          .from("parent_weekly_snapshots")
          .select("week_start,vocab_mastered,lessons_completed,listen_correct,listen_total")
          .eq("user_id", uid).eq("grade", grade)
          .lt("week_start", isoMonday(today))
          .order("week_start", { ascending: false }).limit(1).maybeSingle();
        setLastSnap((ls as any) ?? null);
      }
      setLoading(false);
    })();
  }, [grade]);

  // Strict mastery: mastery_level >= 3 AND interval_days >= 7
  const stats = useMemo(() => {
    const masteredIds = new Set(mastery.filter(m => (m.mastery_level ?? 0) >= 3 && (m.interval_days ?? 0) >= 7).map(m => m.word_id));
    const learningIds = new Set(mastery.filter(m => !masteredIds.has(m.word_id) && (m.mastery_level ?? 0) >= 1).map(m => m.word_id));
    const totalTouched = mastery.length;
    const lessonsDone = progress.filter(p => p.completed_at).length;

    // Listening
    const listenC = mastery.reduce((a, m) => a + (m.listen_correct ?? 0), 0);
    const listenW = mastery.reduce((a, m) => a + (m.listen_wrong ?? 0), 0);
    const listenAcc = listenC + listenW > 0 ? Math.round((listenC / (listenC + listenW)) * 100) : 0;

    return {
      vocabMastered: masteredIds.size,
      vocabLearning: learningIds.size,
      vocabUntouched: Math.max(0, vocabTotal - totalTouched),
      lessonsDone,
      listenAcc, listenAttempts: listenC + listenW,
    };
  }, [mastery, progress, vocabTotal]);

  // Save this-week snapshot once per session, so next week we have a delta
  useEffect(() => {
    if (loading) return;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user?.id) return;
      const wk = isoMonday(new Date());
      await supabase.from("parent_weekly_snapshots").upsert({
        user_id: u.user.id, grade, week_start: wk,
        vocab_mastered: stats.vocabMastered,
        vocab_learning: stats.vocabLearning,
        lessons_completed: stats.lessonsDone,
        listen_correct: 0, listen_total: stats.listenAttempts,
        minutes_studied: 0,
      }, { onConflict: "user_id,grade,week_start" });
    })();
  }, [loading, stats.vocabMastered, stats.lessonsDone, grade]);

  const targetVocab = target?.target_vocab ?? 220;
  const targetLessons = target?.target_lessons ?? 32;

  // Composite mastery: 60% vocab + 40% lessons
  const vocabPct = Math.min(100, Math.round((stats.vocabMastered / Math.max(1, targetVocab)) * 100));
  const lessonsPct = Math.min(100, Math.round((stats.lessonsDone / Math.max(1, targetLessons)) * 100));
  const overallPct = Math.round(vocabPct * 0.6 + lessonsPct * 0.4);

  const deltaWords = lastSnap ? stats.vocabMastered - lastSnap.vocab_mastered : null;
  const deltaLessons = lastSnap ? stats.lessonsDone - lastSnap.lessons_completed : null;

  const remainingVocab = Math.max(0, targetVocab - stats.vocabMastered);
  const remainingLessons = Math.max(0, targetLessons - stats.lessonsDone);

  // Rough ETA: assume 3 lessons + 7 words per week
  const weeksToGoal = Math.max(
    Math.ceil(remainingVocab / 7),
    Math.ceil(remainingLessons / 3),
  );

  if (loading) {
    return (
      <section className="mb-4 rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 p-6 dark:border-violet-900 dark:from-violet-950/30 dark:via-sky-950/20 dark:to-emerald-950/20">
        <div className="flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载孩子数据…
        </div>
      </section>
    );
  }

  return (
    <section className="mb-4 overflow-hidden rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 shadow-sm dark:border-violet-900 dark:from-violet-950/30 dark:via-sky-950/20 dark:to-emerald-950/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-200/60 bg-white/40 px-5 py-3 backdrop-blur-sm dark:border-violet-900/40 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          <h2 className="text-base font-extrabold md:text-lg">📊 孩子的学习成就</h2>
          {target && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              对标 {target.benchmark_name}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => { setGrade(g); localStorage.setItem("primary:lastGrade", String(g)); }}
              className={cn(
                "rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold transition",
                g === grade ? "border-violet-500 bg-violet-500 text-white shadow" : "border-border bg-card hover:border-violet-300"
              )}
            >G{g}</button>
          ))}
        </div>
      </div>

      {/* Three big metrics */}
      <div className="grid gap-3 p-4 sm:grid-cols-3 md:p-5">
        <BigMetric
          icon={BookOpen}
          tone="from-emerald-500 to-teal-500"
          label="📚 词汇掌握"
          numerator={stats.vocabMastered}
          denominator={targetVocab}
          delta={deltaWords}
          remaining={remainingVocab}
          subtext={`还有 ${stats.vocabLearning} 个学习中 · ${stats.vocabUntouched} 个未学`}
        />
        <BigMetric
          icon={Calendar}
          tone="from-sky-500 to-blue-500"
          label="🎯 课程通关"
          numerator={stats.lessonsDone}
          denominator={targetLessons}
          delta={deltaLessons}
          remaining={remainingLessons}
          subtext={`一年级共 ${lessonsTotal} 节课`}
        />
        <BigMetric
          icon={Headphones}
          tone="from-violet-500 to-fuchsia-500"
          label="🧠 综合掌握度"
          numerator={overallPct}
          denominator={100}
          delta={null}
          remaining={null}
          subtext={`词汇 ${vocabPct}% × 60% + 课程 ${lessonsPct}% × 40%`}
          isPercent
        />
      </div>

      {/* Bottom strip — ETA + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-200/60 bg-white/40 px-5 py-3 dark:border-violet-900/40 dark:bg-black/20">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="size-4 text-amber-500" />
          {weeksToGoal > 0 ? (
            <span className="font-bold">
              按目前节奏，预计 <span className="text-violet-700 dark:text-violet-300">{weeksToGoal} 周</span> 完成本年级目标 🎯
            </span>
          ) : (
            <span className="font-bold text-emerald-700">🎉 已完成本年级目标！</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.vocabUntouched > 0 && (
            <Link to={`/primary/vocab/${grade}?focus=weak`} className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-extrabold text-white hover:bg-violet-700">
              <AlertCircle className="size-3" /> 一键补练 <ChevronRight className="size-3" />
            </Link>
          )}
          <Link to={`/primary/grade/${grade}`} className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-3 py-1 text-[11px] font-extrabold text-violet-700 hover:bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300">
            进入 G{grade} 学习中心 <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BigMetric({
  icon: Icon, tone, label, numerator, denominator, delta, remaining, subtext, isPercent,
}: {
  icon: any; tone: string; label: string;
  numerator: number; denominator: number;
  delta: number | null; remaining: number | null;
  subtext: string; isPercent?: boolean;
}) {
  const pct = Math.min(100, Math.round((numerator / Math.max(1, denominator)) * 100));
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
      <div className="mb-1 flex items-center justify-between">
        <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white", tone)}>
          <Icon className="size-3" /> {label}
        </div>
        {delta !== null && delta !== 0 && (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
            delta > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700"
          )}>
            {delta > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black tabular-nums md:text-4xl">{numerator}</span>
        <span className="text-base font-bold text-muted-foreground">/ {denominator}{isPercent ? "%" : ""}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full bg-gradient-to-r transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="font-bold text-muted-foreground">{pct}% 完成</span>
        {remaining !== null && remaining > 0 && (
          <span className="font-extrabold text-violet-700 dark:text-violet-300">还差 {remaining}</span>
        )}
      </div>
      <div className="mt-1.5 text-[10.5px] leading-snug text-muted-foreground">{subtext}</div>
    </div>
  );
}
