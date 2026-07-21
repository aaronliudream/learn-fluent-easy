import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Headphones, Target, TrendingUp, TrendingDown, Trophy, Loader2,
  Sparkles, AlertCircle, ChevronRight, Calendar, Backpack, School, GraduationCap,
  Mic, PenLine, FileText, Clock } from
"lucide-react";
import { cn } from "@/lib/utils";

type Stage = "primary" | "junior" | "gaokao";

const STAGE_META: Record<Stage, {label: string;icon: any;route: string;}> = {
  primary: { label: "小学", icon: Backpack, route: "/primary" },
  junior: { label: "初中", icon: School, route: "/junior" },
  gaokao: { label: "高中", icon: GraduationCap, route: "/gaokao" }
};

// === Junior / Gaokao corpus totals (keep in sync with useMasteryOverview) ===
const JUNIOR_TOTALS = { vocab: 2016, reading: 91, listening: 209, grammar: 52, writing: 30 };
const GAOKAO_TOTALS = { vocab: 2921, reading: 65, grammar: 298, cloze: 40 };

// ===== PRIMARY =====
type PrimaryMastery = {word_id: string;mastery_level: number | null;interval_days: number | null;listen_correct: number | null;listen_wrong: number | null;};
type PrimaryProg = {lesson_id: string;completed_at: string | null;};
type PrimaryTarget = {grade: number;target_vocab: number;target_lessons: number;benchmark_name: string;};
type Snap = {week_start: string;vocab_mastered: number;lessons_completed: number;};

const GRADES = [1, 2, 3, 4, 5, 6];

function isoMonday(d: Date): string {
  const x = new Date(d);const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

export default function AchievementBanner({ defaultStage = "primary" as Stage }: {defaultStage?: Stage;}) {
  const [stage, setStage] = useState<Stage>(() => {
    const saved = localStorage.getItem("parent:lastStage") as Stage | null;
    return saved && ["primary", "junior", "gaokao"].includes(saved) ? saved : defaultStage;
  });

  return (
    <section className="mb-4 overflow-hidden rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 shadow-sm dark:border-violet-900 dark:from-violet-950/30 dark:via-sky-950/20 dark:to-emerald-950/20">
      {/* Header — stage tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-200/60 bg-white/40 px-5 py-3 backdrop-blur-sm dark:border-violet-900/40 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          <h2 className="text-base font-extrabold md:text-lg"><T>📊 孩子的学习成就</T></h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["primary", "junior", "gaokao"] as Stage[]).map((s) => {
            const M = STAGE_META[s];
            return (
              <button
                key={s}
                onClick={() => {setStage(s);localStorage.setItem("parent:lastStage", s);}}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-extrabold transition",
                  s === stage ? "border-violet-500 bg-violet-500 text-white shadow" : "border-border bg-card hover:border-violet-300"
                )}>
                <M.icon className="size-3.5" /> <T>{M.label}</T></button>);

          })}
        </div>
      </div>

      {stage === "primary" ? <PrimaryBlock /> : stage === "junior" ? <JuniorBlock /> : <GaokaoBlock />}
    </section>);

}

/* ============================================================
 * 小学 — G1-G6 切换
 * ============================================================ */
function PrimaryBlock() {
  const [grade, setGrade] = useState<number>(() => Number(localStorage.getItem("primary:lastGrade") ?? "1"));
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<PrimaryTarget | null>(null);
  const [vocabTotal, setVocabTotal] = useState(0);
  const [lessonsTotal, setLessonsTotal] = useState(0);
  const [mastery, setMastery] = useState<PrimaryMastery[]>([]);
  const [progress, setProgress] = useState<PrimaryProg[]>([]);
  const [lastSnap, setLastSnap] = useState<Snap | null>(null);
  const [readingDone, setReadingDone] = useState(0);
  const [readingTotal, setReadingTotal] = useState(0);
  const [speakingCount, setSpeakingCount] = useState(0);
  const [speakingAvg, setSpeakingAvg] = useState(0);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      const [{ data: tg }, { data: vocab }, { data: lessons }] = await Promise.all([
      supabase.from("primary_grade_targets").select("*").eq("grade", grade).maybeSingle(),
      supabase.from("primary_vocab").select("id").eq("grade", grade),
      supabase.from("primary_lessons").select("id, primary_units!inner(grade)").eq("primary_units.grade", grade)]
      );
      setTarget(tg as any ?? null);
      setVocabTotal((vocab ?? []).length);
      setLessonsTotal((lessons ?? []).length);

      const { data: rArt } = await supabase.
      from("primary_reading_articles").
      select("id").eq("grade", grade);
      setReadingTotal((rArt ?? []).length);

      if (uid) {
        const { data: m } = await supabase.
        from("primary_word_mastery").
        select("word_id,mastery_level,interval_days,listen_correct,listen_wrong").
        eq("user_id", uid).eq("grade", grade);
        setMastery((m ?? []) as PrimaryMastery[]);

        const lessonIds = (lessons ?? []).map((l: any) => l.id);
        if (lessonIds.length) {
          const { data: lp } = await supabase.
          from("primary_lesson_progress").
          select("lesson_id,completed_at").
          eq("user_id", uid).in("lesson_id", lessonIds);
          setProgress((lp ?? []) as PrimaryProg[]);
        } else {setProgress([]);}

        const today = new Date();
        const { data: ls } = await supabase.
        from("parent_weekly_snapshots").
        select("week_start,vocab_mastered,lessons_completed").
        eq("user_id", uid).eq("grade", grade).
        lt("week_start", isoMonday(today)).
        order("week_start", { ascending: false }).limit(1).maybeSingle();
        setLastSnap(ls as any ?? null);

        const articleIds = (rArt ?? []).map((a: any) => a.id);
        if (articleIds.length) {
          const { data: rp } = await supabase.
          from("primary_reading_progress").
          select("article_id,stars,score").
          eq("user_id", uid).in("article_id", articleIds);
          setReadingDone((rp ?? []).filter((r: any) => (r.stars ?? 0) >= 3 || (r.score ?? 0) >= 80).length);
        } else {setReadingDone(0);}

        const { data: sp } = await supabase.
        from("primary_speaking_attempts").
        select("overall_score").eq("user_id", uid).eq("grade", grade);
        const arr = (sp ?? []) as any[];
        setSpeakingCount(arr.length);
        setSpeakingAvg(arr.length ? Math.round(arr.reduce((s, x) => s + (x.overall_score ?? 0), 0) / arr.length) : 0);
      }
      setLoading(false);
    })();
  }, [grade]);

  const stats = useMemo(() => {
    const masteredIds = new Set(mastery.filter((m) => (m.mastery_level ?? 0) >= 3 && (m.interval_days ?? 0) >= 7).map((m) => m.word_id));
    const learningIds = new Set(mastery.filter((m) => !masteredIds.has(m.word_id) && (m.mastery_level ?? 0) >= 1).map((m) => m.word_id));
    let lOk = 0,lTot = 0;
    for (const r of mastery) {
      lOk += r.listen_correct ?? 0;
      lTot += (r.listen_correct ?? 0) + (r.listen_wrong ?? 0);
    }
    return {
      vocabMastered: masteredIds.size,
      vocabLearning: learningIds.size,
      vocabUntouched: Math.max(0, vocabTotal - mastery.length),
      lessonsDone: progress.filter((p) => p.completed_at).length,
      listenOk: lOk,
      listenTot: lTot,
      listenPct: lTot ? Math.round(lOk / lTot * 100) : 0
    };
  }, [mastery, progress, vocabTotal]);

  const targetVocab = target?.target_vocab ?? 220;
  const targetLessons = target?.target_lessons ?? 32;
  const vocabPct = Math.min(100, Math.round(stats.vocabMastered / Math.max(1, targetVocab) * 100));
  const lessonsPct = Math.min(100, Math.round(stats.lessonsDone / Math.max(1, targetLessons) * 100));
  const readingPct = readingTotal ? Math.round(readingDone / readingTotal * 100) : 0;
  const overallPct = Math.round(vocabPct * 0.45 + lessonsPct * 0.25 + stats.listenPct * 0.15 + readingPct * 0.15);
  const deltaWords = lastSnap ? stats.vocabMastered - lastSnap.vocab_mastered : null;
  const deltaLessons = lastSnap ? stats.lessonsDone - lastSnap.lessons_completed : null;
  const remainingVocab = Math.max(0, targetVocab - stats.vocabMastered);
  const remainingLessons = Math.max(0, targetLessons - stats.lessonsDone);
  const weeksToGoal = Math.max(Math.ceil(remainingVocab / 7), Math.ceil(remainingLessons / 3));

  if (loading) return <LoadingRow />;

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-violet-200/40 bg-white/30 px-5 py-2 dark:border-violet-900/30 dark:bg-black/10">
        <span className="text-xs font-bold text-muted-foreground"><T>选择年级 · 对标</T> {target?.benchmark_name ?? "剑桥 Starters"}</span>
        <div className="flex flex-wrap gap-1.5">
          {GRADES.map((g) =>
          <button key={g}
          onClick={() => {setGrade(g);localStorage.setItem("primary:lastGrade", String(g));}}
          className={cn(
            "rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold transition",
            g === grade ? "border-violet-500 bg-violet-500 text-white shadow" : "border-border bg-card hover:border-violet-300"
          )}>
            G{g}</button>
          )}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-5">
        <BigMetric icon={BookOpen} tone="from-emerald-500 to-teal-500" label="📚 词汇掌握"
        numerator={stats.vocabMastered} denominator={targetVocab} delta={deltaWords} remaining={remainingVocab}
        subtext={`还有 ${stats.vocabLearning} 个学习中 · ${stats.vocabUntouched} 个未学`} />
        <BigMetric icon={Calendar} tone="from-sky-500 to-blue-500" label="🎯 课程通关"
        numerator={stats.lessonsDone} denominator={targetLessons} delta={deltaLessons} remaining={remainingLessons}
        subtext={`G${grade} 共 ${lessonsTotal} 节课`} />
        <BigMetric icon={Headphones} tone="from-orange-500 to-amber-500" label="🎧 听力正确率"
        numerator={stats.listenPct} denominator={100} delta={null} remaining={null}
        subtext={`累计听力答题 ${stats.listenTot} 次（答对 ${stats.listenOk}）`} isPercent />
        <BigMetric icon={FileText} tone="from-rose-500 to-pink-500" label="📖 阅读篇章"
        numerator={readingDone} denominator={Math.max(1, readingTotal)} delta={null}
        remaining={Math.max(0, readingTotal - readingDone)}
        subtext={`G${grade} 共 ${readingTotal} 篇 · ≥80 分算通关`} />
        <BigMetric icon={Mic} tone="from-cyan-500 to-sky-500" label="🗣️ 口语练习"
        numerator={speakingCount} denominator={Math.max(speakingCount, 30)} delta={null} remaining={null}
        subtext={speakingCount ? `平均得分 ${speakingAvg} 分` : "还没开口练习"} />
        <BigMetric icon={Trophy} tone="from-violet-500 to-fuchsia-500" label="🧠 综合掌握度"
        numerator={overallPct} denominator={100} delta={null} remaining={null}
        subtext={`词汇 ${vocabPct}%×45% + 课程 ${lessonsPct}%×25% + 听力 ${stats.listenPct}%×15% + 阅读 ${readingPct}%×15%`} isPercent />
      </div>

      <BottomStrip
        weeksToGoal={weeksToGoal}
        showWeak={stats.vocabUntouched > 0}
        weakHref={`/primary/hub/${grade}`}
        primaryHref={`/primary/hub/${grade}`}
        primaryLabel={`进入小学 G${grade} 课程`} />
      
    </>);

}

/* ============================================================
 * 初中 — 中考新课标
 * ============================================================ */
function JuniorBlock() {
  const [loading, setLoading] = useState(true);
  const [vocabMastered, setVocabMastered] = useState(0);
  const [vocabLearning, setVocabLearning] = useState(0);
  const [readingMastered, setReadingMastered] = useState(0);
  const [listenAcc, setListenAcc] = useState<{ok: number;tot: number;}>({ ok: 0, tot: 0 });
  const [grammarMastered, setGrammarMastered] = useState(0);
  const [grammarTotal, setGrammarTotal] = useState(0);
  const [writingCount, setWritingCount] = useState(0);
  const [writingAvg, setWritingAvg] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {setLoading(false);return;}
      const [vm, mp, la, jm, wa, gpts] = await Promise.all([
      supabase.from("junior_word_mastery").select("mastery_level").eq("user_id", user.id),
      supabase.from("mastery_progress").select("module,stars,best_pct").eq("user_id", user.id).eq("module", "junior_reading"),
      supabase.from("junior_listening_attempts").select("is_correct").eq("user_id", user.id),
      // 语法板块口径 = 按题(grammar_question 累计答对2次=掌握),与 useMasteryOverview / 单元页小圆圈同源
      supabase.from("junior_user_mastery").select("correct_count").eq("user_id", user.id).eq("item_type", "grammar_question"),
      supabase.from("junior_writing_attempts").select("overall_score").eq("user_id", user.id),
      supabase.from("junior_grammar_points").select("id").not("unit", "is", null)]
      );
      let mast = 0,learn = 0;
      for (const r of vm.data ?? []) {
        const lvl = (r as any).mastery_level ?? 0;
        if (lvl >= 3) mast += 1;else if (lvl >= 1) learn += 1;
      }
      setVocabMastered(mast);setVocabLearning(learn);
      let rd = 0;
      for (const r of mp.data ?? []) {
        if ((r as any).stars >= 5 || ((r as any).best_pct ?? 0) >= 80) rd += 1;
      }
      setReadingMastered(rd);
      let ok = 0,tot = 0;
      for (const r of la.data ?? []) {tot += 1;if ((r as any).is_correct) ok += 1;}
      setListenAcc({ ok, tot });
      let gm = 0;
      for (const r of jm.data ?? []) {
        if (((r as any).correct_count ?? 0) >= 2) gm += 1;
      }
      setGrammarMastered(gm);
      // 动态总题数 = 新体系语法题(挂在 unit 非空语法点上的题),与板块总览一致
      const pids = ((gpts.data ?? []) as {id: string;}[]).map((p) => p.id);
      let gtotal = 0;
      for (let i = 0; i < pids.length; i += 100) {
        const slice = pids.slice(i, i + 100);
        const { count } = await supabase.
        from("junior_grammar_questions").
        select("*", { count: "exact", head: true }).
        in("point_id", slice);
        gtotal += count ?? 0;
      }
      setGrammarTotal(gtotal);
      const warr = (wa.data ?? []) as any[];
      setWritingCount(warr.length);
      setWritingAvg(warr.length ? Math.round(warr.reduce((s, x) => s + (x.overall_score ?? 0), 0) / warr.length) : 0);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingRow />;

  const vocabPct = Math.round(vocabMastered / JUNIOR_TOTALS.vocab * 100);
  const readingPct = Math.round(readingMastered / JUNIOR_TOTALS.reading * 100);
  const listenPct = listenAcc.tot ? Math.round(listenAcc.ok / listenAcc.tot * 100) : 0;
  const grammarPct = grammarTotal ? Math.round(grammarMastered / grammarTotal * 100) : 0;
  const writingPct = Math.min(100, Math.round(writingCount / JUNIOR_TOTALS.writing * 100));
  const overall = Math.round(vocabPct * 0.35 + readingPct * 0.20 + listenPct * 0.15 + grammarPct * 0.20 + writingPct * 0.10);

  return (
    <>
      <div className="border-b border-violet-200/40 bg-white/30 px-5 py-2 text-xs font-bold text-muted-foreground dark:border-violet-900/30 dark:bg-black/10">
        <T>中考新课标 · 词汇 / 阅读 / 听力 / 语法 / 写作 五维评估</T>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-5">
        <BigMetric icon={BookOpen} tone="from-emerald-500 to-teal-500" label="📚 中考词汇"
        numerator={vocabMastered} denominator={JUNIOR_TOTALS.vocab} delta={null}
        remaining={Math.max(0, JUNIOR_TOTALS.vocab - vocabMastered)}
        subtext={`${vocabLearning} 个学习中`} />
        <BigMetric icon={FileText} tone="from-sky-500 to-blue-500" label="📖 阅读篇章"
        numerator={readingMastered} denominator={JUNIOR_TOTALS.reading} delta={null}
        remaining={Math.max(0, JUNIOR_TOTALS.reading - readingMastered)}
        subtext={`已通关 ≥80 分的篇章数`} />
        <BigMetric icon={Headphones} tone="from-orange-500 to-amber-500" label="🎧 听力正确率"
        numerator={listenPct} denominator={100} delta={null} remaining={null}
        subtext={`累计答题 ${listenAcc.tot} 题`} isPercent />
        <BigMetric icon={Target} tone="from-indigo-500 to-violet-500" label="🧩 语法掌握"
        numerator={grammarMastered} denominator={Math.max(1, grammarTotal)} delta={null}
        remaining={Math.max(0, grammarTotal - grammarMastered)}
        subtext={`按题计 · 全 ${grammarTotal} 题(累计答对2次=掌握)`} />
        <BigMetric icon={PenLine} tone="from-rose-500 to-pink-500" label="✍️ 写作练习"
        numerator={writingCount} denominator={JUNIOR_TOTALS.writing} delta={null} remaining={null}
        subtext={writingCount ? `平均 ${writingAvg} 分` : "还没开始练写作"} />
        <BigMetric icon={Trophy} tone="from-violet-500 to-fuchsia-500" label="🧠 综合掌握度"
        numerator={overall} denominator={100} delta={null} remaining={null}
        subtext={`词 ${vocabPct}% + 阅 ${readingPct}% + 听 ${listenPct}% + 法 ${grammarPct}% + 写 ${writingPct}%`} isPercent />
      </div>
      <BottomStrip
        weeksToGoal={null}
        overallText={`综合评分 ${overall} / 100 · 持续练习中`}
        showWeak={vocabPct < 90}
        weakHref="/junior/vocab"
        primaryHref="/junior"
        primaryLabel="进入初中学习中心" />
      
    </>);

}

/* ============================================================
 * 高中 — 高考冲刺
 * ============================================================ */
function GaokaoBlock() {
  const [loading, setLoading] = useState(true);
  const [vocabMastered, setVocabMastered] = useState(0);
  const [vocabLearning, setVocabLearning] = useState(0);
  const [grammarMastered, setGrammarMastered] = useState(0);
  const [readingMastered, setReadingMastered] = useState(0);
  const [clozeBest, setClozeBest] = useState(0);
  const [clozeCount, setClozeCount] = useState(0);
  const [clozeAvg, setClozeAvg] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {setLoading(false);return;}
      const [um, mp, cz] = await Promise.all([
      supabase.from("gaokao_user_mastery").select("mastery_level,item_type").eq("user_id", user.id),
      supabase.from("mastery_progress").select("module,stars,best_pct").eq("user_id", user.id).in("module", ["gaokao_reading", "gaokao_cloze"]),
      supabase.from("gaokao_cloze_sessions").select("score_pct,status").eq("user_id", user.id).eq("status", "submitted")]
      );
      let vMast = 0,vLearn = 0,gMast = 0;
      for (const r of um.data ?? []) {
        const lvl = (r as any).mastery_level ?? 0;
        const type = (r as any).item_type;
        if (type === "vocab") {
          if (lvl >= 3) vMast += 1;else if (lvl >= 1) vLearn += 1;
        } else if (type === "grammar_point") {
          if (lvl >= 3) gMast += 1;
        }
      }
      setVocabMastered(vMast);setVocabLearning(vLearn);setGrammarMastered(gMast);
      let rd = 0;
      for (const r of mp.data ?? []) {
        if ((r as any).stars >= 5 || ((r as any).best_pct ?? 0) >= 80) rd += 1;
      }
      setReadingMastered(rd);
      const carr = (cz.data ?? []) as any[];
      setClozeCount(carr.length);
      setClozeBest(carr.length ? carr.filter((x) => (x.score_pct ?? 0) >= 80).length : 0);
      setClozeAvg(carr.length ? Math.round(carr.reduce((s, x) => s + (x.score_pct ?? 0), 0) / carr.length) : 0);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingRow />;

  const vocabPct = Math.round(vocabMastered / GAOKAO_TOTALS.vocab * 100);
  const grammarPct = Math.round(grammarMastered / GAOKAO_TOTALS.grammar * 100);
  const readingPct = Math.round(readingMastered / GAOKAO_TOTALS.reading * 100);
  const clozePct = clozeCount ? clozeAvg : 0;
  const overall = Math.round(vocabPct * 0.40 + grammarPct * 0.20 + readingPct * 0.20 + clozePct * 0.15 + 0);

  return (
    <>
      <div className="border-b border-violet-200/40 bg-white/30 px-5 py-2 text-xs font-bold text-muted-foreground dark:border-violet-900/30 dark:bg-black/10">
        <T>高考 3500 词 + 真题题型 · 词汇 / 语法 / 阅读 / 完形 / 听力 五维评估</T>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-5">
        <BigMetric icon={BookOpen} tone="from-emerald-500 to-teal-500" label="📚 高考词汇"
        numerator={vocabMastered} denominator={GAOKAO_TOTALS.vocab} delta={null}
        remaining={Math.max(0, GAOKAO_TOTALS.vocab - vocabMastered)}
        subtext={`${vocabLearning} 个学习中`} />
        <BigMetric icon={Target} tone="from-indigo-500 to-violet-500" label="🧩 语法考点"
        numerator={grammarMastered} denominator={GAOKAO_TOTALS.grammar} delta={null}
        remaining={Math.max(0, GAOKAO_TOTALS.grammar - grammarMastered)}
        subtext={`已掌握的语法点数`} />
        <BigMetric icon={FileText} tone="from-sky-500 to-blue-500" label="📖 阅读篇章"
        numerator={readingMastered} denominator={GAOKAO_TOTALS.reading} delta={null}
        remaining={Math.max(0, GAOKAO_TOTALS.reading - readingMastered)}
        subtext={`高考真题阅读 · ≥80 分算通关`} />
        <BigMetric icon={PenLine} tone="from-rose-500 to-pink-500" label="📝 完形填空"
        numerator={clozeBest} denominator={Math.max(clozeCount, 1)} delta={null} remaining={null}
        subtext={clozeCount ? `共练 ${clozeCount} 篇 · 平均 ${clozeAvg} 分` : "还没开始练完形"} />
        <BigMetric icon={Headphones} tone="from-orange-500 to-amber-500" label="🎧 听力训练"
        numerator={0} denominator={100} delta={null} remaining={null}
        subtext={`即将上线 · 真题听力 + AI 跟读评估`} isPercent />
        <BigMetric icon={Trophy} tone="from-violet-500 to-fuchsia-500" label="🧠 综合掌握度"
        numerator={overall} denominator={100} delta={null} remaining={null}
        subtext={`词 ${vocabPct}%×40% + 法 ${grammarPct}%×20% + 阅 ${readingPct}%×20% + 完形 ${clozePct}%×15%（听力即将上线）`} isPercent />
      </div>
      <BottomStrip
        weeksToGoal={null}
        overallText={`已达成高考目标的 ${overall}%，加油冲刺！`}
        showWeak={vocabPct < 90}
        weakHref="/gaokao/vocab"
        primaryHref="/gaokao"
        primaryLabel="进入高考冲刺中心" />
      
    </>);

}

/* ============================================================
 * 通用底部条 + 指标卡 + Loading
 * ============================================================ */
function BottomStrip({
  weeksToGoal, overallText, showWeak, weakHref, primaryHref, primaryLabel







}: {weeksToGoal: number | null;overallText?: string;showWeak: boolean;weakHref: string;primaryHref: string;primaryLabel: string;}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-200/60 bg-white/40 px-5 py-3 dark:border-violet-900/40 dark:bg-black/20">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="size-4 text-amber-500" />
        {weeksToGoal !== null ?
        weeksToGoal > 0 ?
        <span className="font-bold"><T>按目前节奏，预计</T> <span className="text-violet-700 dark:text-violet-300">{weeksToGoal} <T>周</T></span> <T>完成本年级目标 🎯</T></span> :

        <span className="font-bold text-emerald-700"><T>🎉 已完成本年级目标！</T></span> :


        <span className="font-bold">{overallText}</span>
        }
      </div>
      <div className="flex flex-wrap gap-2">
        {showWeak &&
        <Link to={weakHref} className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-violet-700">
            <AlertCircle className="size-3.5" /> <T>一键补练</T> <ChevronRight className="size-3.5" />
          </Link>
        }
        <Link to={primaryHref} className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-3.5 py-1.5 text-xs font-extrabold text-violet-700 hover:bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300">
          {primaryLabel} <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>);

}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
    </div>);

}

function BigMetric({
  icon: Icon, tone, label, numerator, denominator, delta, remaining, subtext, isPercent





}: {icon: any;tone: string;label: string;numerator: number;denominator: number;delta: number | null;remaining: number | null;subtext: string;isPercent?: boolean;}) {
  const pct = Math.min(100, Math.round(numerator / Math.max(1, denominator) * 100));
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-black/30">
      <div className="mb-2 flex items-center justify-between">
        <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-sm font-extrabold tracking-wide text-white", tone)}>
          <Icon className="size-4" /> {label}
        </div>
        {delta !== null && delta !== 0 &&
        <span className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-extrabold",
          delta > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700"
        )}>
            {delta > 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {delta > 0 ? `+${delta}` : delta}
          </span>
        }
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black tabular-nums md:text-5xl">{numerator}</span>
        <span className="text-lg font-bold text-muted-foreground">/ {denominator}{isPercent ? "%" : ""}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full bg-gradient-to-r transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-bold text-muted-foreground">{pct}<T>% 完成</T></span>
        {remaining !== null && remaining > 0 &&
        <span className="font-extrabold text-violet-700 dark:text-violet-300"><T>还差</T> {remaining}</span>
        }
      </div>
      <div className="mt-2 text-xs leading-snug text-muted-foreground">{subtext}</div>
    </div>);

}
