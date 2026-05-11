import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import {
  Trophy, Award, Sparkles, CheckCircle2, XCircle, Loader2, Volume2,
  ArrowRight, Star, Printer, RefreshCw, Lightbulb, Target, ChevronRight } from
"lucide-react";
import { cn } from "@/lib/utils";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { sparkOnAnswer } from "@/lib/sparkAnswerFeedback";

/* ============== Types ============== */
type Mode = "challenge" | "checkup";
type Vocab = {
  id: string;word: string;meaning_cn: string | null;pos: string | null;
  example_en: string | null;theme: string | null;
};
type Unit = {id: string;title_cn: string;emoji: string | null;sort_order: number;grade: number;};
type Mastery = {
  word_id: string;mastery_level: number | null;interval_days: number | null;
  quiz_correct: number | null;quiz_wrong: number | null;
  listen_correct: number | null;listen_wrong: number | null;
};
type QType = "cn2en" | "en2cn" | "listen";
type Question = {
  type: QType;
  word: Vocab;
  options: string[];
  correctIdx: number;
  difficulty: number; // 1=easy, 2=med, 3=hard
};

const TOTAL_CHALLENGE = 12;
const TOTAL_CHECKUP = 15;
const PASS_PCT = 80;

/* ============== Helpers ============== */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickN<T>(arr: T[], n: number): T[] {return shuffle(arr).slice(0, n);}
function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
function medalFor(pct: number): {medal: "gold" | "silver" | "bronze" | "none";label: string;emoji: string;tone: string;} {
  if (pct >= 95) return { medal: "gold", label: "金牌通关", emoji: "🥇", tone: "from-amber-400 to-orange-500" };
  if (pct >= 85) return { medal: "silver", label: "银牌通关", emoji: "🥈", tone: "from-slate-300 to-slate-500" };
  if (pct >= 80) return { medal: "bronze", label: "铜牌通关", emoji: "🥉", tone: "from-amber-700 to-amber-900" };
  return { medal: "none", label: "继续加油", emoji: "🌱", tone: "from-emerald-400 to-teal-500" };
}
function levelFor(pct: number): string {
  if (pct >= 95) return "A+";if (pct >= 85) return "A";
  if (pct >= 70) return "B+";if (pct >= 55) return "B";return "C+";
}
function makeCertCode(uid: string, key: string): string {
  let h = 0;const s = `${uid}-${key}`;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
  return `BME-${h.toString(36).toUpperCase().slice(0, 4)}-${key.replace(/-/g, "").slice(-4)}`;
}

/* ============== Build questions ============== */
function buildChallengeQs(words: Vocab[], allDistractors: string[]): Question[] {
  const pool = pickN(words, TOTAL_CHALLENGE);
  return pool.map((w, i) => {
    const t: QType = i % 3 === 0 ? "cn2en" : i % 3 === 1 ? "en2cn" : "listen";
    return makeQ(w, t, words, allDistractors, 1);
  });
}
function buildAdaptiveQs(
words: Vocab[], mastery: Mastery[], allDistractors: string[])
: Question[] {
  // 自适应顺序：弱词 + 中等词 + 强词混合，先易后难校准
  const masteryMap = new Map(mastery.map((m) => [m.word_id, m]));
  const score = (v: Vocab) => {
    const m = masteryMap.get(v.id);
    if (!m) return 0;
    const total = (m.quiz_correct ?? 0) + (m.quiz_wrong ?? 0) + (m.listen_correct ?? 0) + (m.listen_wrong ?? 0);
    if (!total) return 0;
    const acc = ((m.quiz_correct ?? 0) + (m.listen_correct ?? 0)) / total;
    return (m.mastery_level ?? 0) + acc;
  };
  const sorted = [...words].sort((a, b) => score(a) - score(b));
  const weakish = sorted.slice(0, Math.ceil(sorted.length * 0.4));
  const mid = sorted.slice(Math.ceil(sorted.length * 0.4), Math.ceil(sorted.length * 0.75));
  const strong = sorted.slice(Math.ceil(sorted.length * 0.75));

  const picks = [
  ...pickN(weakish, Math.min(7, weakish.length)),
  ...pickN(mid, Math.min(5, mid.length)),
  ...pickN(strong, Math.min(3, strong.length))].
  slice(0, TOTAL_CHECKUP);

  // 不足时用全部词补齐
  while (picks.length < TOTAL_CHECKUP && picks.length < words.length) {
    const extra = words.find((w) => !picks.includes(w));
    if (!extra) break;
    picks.push(extra);
  }

  return picks.map((w, i) => {
    const types: QType[] = ["cn2en", "en2cn", "listen"];
    const t = types[i % 3];
    const m = masteryMap.get(w.id);
    const diff = (m?.mastery_level ?? 0) >= 2 ? 3 : (m?.mastery_level ?? 0) >= 1 ? 2 : 1;
    return makeQ(w, t, words, allDistractors, diff);
  });
}
function makeQ(w: Vocab, t: QType, all: Vocab[], allDistractors: string[], diff: number): Question {
  if (t === "cn2en" || t === "listen") {
    // options are English words
    const distractors = pickN(all.filter((x) => x.id !== w.id).map((x) => x.word), 3);
    const options = shuffle([w.word, ...distractors]);
    return { type: t, word: w, options, correctIdx: options.indexOf(w.word), difficulty: diff };
  } else {
    // en2cn: options are CN meanings
    const distractors = pickN(allDistractors.filter((x) => x !== (w.meaning_cn ?? "")), 3);
    const options = shuffle([w.meaning_cn ?? w.word, ...distractors]);
    return { type: t, word: w, options, correctIdx: options.indexOf(w.meaning_cn ?? w.word), difficulty: diff };
  }
}

/* ============== Component ============== */
export default function PrimaryAssessment() {
  const { grade: gradeStr, unitId } = useParams();
  const [search] = useSearchParams();
  const grade = Number(gradeStr || "1");
  const mode: Mode = search.get("mode") === "checkup" ? "checkup" : "challenge";

  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [phase, setPhase] = useState<"play" | "result">("play");
  const [showFeedback, setShowFeedback] = useState<null | boolean>(null);
  const [resultRow, setResultRow] = useState<any>(null);
  const [childName, setChildName] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  /* --- Load data --- */
  useEffect(() => {
    setLoading(true);
    setIdx(0);setPicks([]);setPhase("play");setShowFeedback(null);setResultRow(null);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      const name = (u?.user?.user_metadata as any)?.full_name ||
      (u?.user?.user_metadata as any)?.name ||
      u?.user?.email?.split("@")[0] || "孩子";
      setChildName(name);

      if (mode === "challenge" && unitId) {
        const { data: un } = await supabase.from("primary_units").select("id,title_cn,emoji,sort_order,grade").eq("id", unitId).maybeSingle();
        setUnit(un as any);
        // Get vocab for this unit's lessons (via theme matching) — fallback: use grade vocab filtered by unit theme
        const { data: vc } = await supabase.from("primary_vocab").select("id,word,meaning_cn,pos,example_en,theme").eq("grade", grade);
        const all = (vc ?? []) as Vocab[];
        const themeWords = (un as any)?.title_cn ? all.filter((w) => (w.theme ?? "").includes((un as any).title_cn) || (un as any).title_cn.includes(w.theme ?? "")) : [];
        const pool = themeWords.length >= 8 ? themeWords : all;
        const distractors = all.map((x) => x.meaning_cn || "").filter(Boolean);
        setQuestions(buildChallengeQs(pool, distractors));
      } else {
        // checkup mode
        const { data: vc } = await supabase.from("primary_vocab").select("id,word,meaning_cn,pos,example_en,theme").eq("grade", grade);
        const all = (vc ?? []) as Vocab[];
        const distractors = all.map((x) => x.meaning_cn || "").filter(Boolean);
        if (uid) {
          const { data: m } = await supabase.
          from("primary_word_mastery").
          select("word_id,mastery_level,interval_days,quiz_correct,quiz_wrong,listen_correct,listen_wrong").
          eq("user_id", uid).eq("grade", grade);
          setQuestions(buildAdaptiveQs(all, (m ?? []) as Mastery[], distractors));
        } else {
          setQuestions(buildAdaptiveQs(all, [], distractors));
        }
      }
      setLoading(false);
    })();
  }, [grade, unitId, mode]);

  /* --- Auto-play TTS for listening Qs --- */
  useEffect(() => {
    if (phase !== "play" || loading) return;
    const q = questions[idx];
    if (q?.type === "listen") setTimeout(() => speak(q.word.word), 200);
  }, [idx, phase, loading, questions]);

  const totalQ = questions.length;
  const correctCount = picks.filter((p, i) => p === questions[i]?.correctIdx).length;
  const pctSoFar = Math.round(correctCount / Math.max(1, picks.length) * 100);

  /* --- Pick handler --- */
  function onPick(optIdx: number) {
    if (showFeedback !== null) return;
    const q = questions[idx];
    const correct = optIdx === q.correctIdx;
    setShowFeedback(correct);
    setPicks((p) => [...p, optIdx]);
    // Phase 3 — Spark visibly reacts to every answer.
    sparkOnAnswer(correct, picks.filter((p, i) => p === questions[i]?.correctIdx).length + (correct ? 1 : 0));
    recordUnifiedAttempt({
      stage: "primary", grade, module: "vocab",
      item_type: `assessment_${q.type}`, item_id: q.word.id, item_label: q.word.word,
      is_correct: correct,
      user_answer: q.options[optIdx],
      correct_answer: q.options[q.correctIdx]
    }).catch(() => {});
    setTimeout(() => {
      setShowFeedback(null);
      if (idx + 1 >= totalQ) finish([...picks, optIdx]);else
      setIdx((i) => i + 1);
    }, 850);
  }

  /* --- Finish & save --- */
  async function finish(allPicks: number[]) {
    const correct = allPicks.filter((p, i) => p === questions[i]?.correctIdx).length;
    const total = questions.length;
    const pct = Math.round(correct / Math.max(1, total) * 100);
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;

    if (mode === "challenge" && uid && unit) {
      const m = medalFor(pct);
      const row = {
        user_id: uid, unit_id: unit.id, grade,
        score: correct, total, accuracy: pct,
        medal: m.medal, passed: pct >= PASS_PCT,
        details: { picks: allPicks, types: questions.map((q) => q.type) }
      };
      await supabase.from("primary_unit_challenges").insert(row);
      setResultRow({ ...row, ...m });
    } else if (mode === "checkup" && uid) {
      const skillScore = (t: QType) => {
        const ix = questions.map((q, i) => q.type === t ? i : -1).filter((i) => i >= 0);
        if (!ix.length) return 0;
        const c = ix.filter((i) => allPicks[i] === questions[i].correctIdx).length;
        return Math.round(c / ix.length * 100);
      };
      const vocabScore = Math.round((skillScore("cn2en") + skillScore("en2cn")) / 2);
      const listenScore = skillScore("listen");
      const overall = Math.round(vocabScore * 0.6 + listenScore * 0.4);
      const monthKey = new Date().toISOString().slice(0, 7);

      // Detect weak themes
      const themeMap = new Map<string, {c: number;t: number;}>();
      questions.forEach((q, i) => {
        const th = q.word.theme || "其它";
        if (!themeMap.has(th)) themeMap.set(th, { c: 0, t: 0 });
        const x = themeMap.get(th)!;
        x.t++;
        if (allPicks[i] === q.correctIdx) x.c++;
      });
      const weakThemes = Array.from(themeMap.entries()).
      filter(([_, v]) => v.t >= 2 && v.c / v.t < 0.7).
      map(([k]) => k).slice(0, 3);

      const recs: {title: string;reason: string;cta: string;link: string;}[] = [];
      if (listenScore < 75) recs.push({
        title: "听力专项训练",
        reason: `听力得分 ${listenScore}/100，低于词汇得分 ${vocabScore}`,
        cta: "进入听力游戏", link: `/primary/games/${grade}/listen`
      });
      if (vocabScore < 75) recs.push({
        title: "词汇巩固",
        reason: `词汇得分 ${vocabScore}/100，建议每日 5 分钟词卡复习`,
        cta: "进入词汇练习", link: `/primary/vocab/${grade}`
      });
      weakThemes.forEach((th) => recs.push({
        title: `补强「${th}」主题`,
        reason: `本主题正确率偏低`,
        cta: "查看相关单元", link: `/primary/grade/${grade}`
      }));
      if (!recs.length) recs.push({
        title: "保持节奏，挑战下一难度",
        reason: "各项指标健康，可解锁更高单元",
        cta: "进入学习中心", link: `/primary/grade/${grade}`
      });

      const row = {
        user_id: uid, grade, month_key: monthKey,
        total_questions: total, correct,
        vocab_score: vocabScore, listen_score: listenScore,
        spell_score: 0, overall_score: overall,
        level_label: levelFor(overall),
        cert_code: makeCertCode(uid, monthKey),
        weak_themes: weakThemes,
        recommendations: recs,
        questions: questions.map((q, i) => ({
          word: q.word.word, type: q.type, correct: allPicks[i] === q.correctIdx
        }))
      };
      await supabase.from("primary_monthly_checkups").upsert(row, { onConflict: "user_id,grade,month_key" });
      setResultRow({ ...row, ...medalFor(overall) });
    }
    // v2 Spark bond: assessment completion (uncapped, rare event).
    try {
      const { bondOnAssessmentComplete } = await import("@/lib/petGrowth");
      bondOnAssessmentComplete();
    } catch {/* noop */}
    setPhase("result");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-violet-950/20">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-amber-500" />
          <p className="mt-3 text-sm text-muted-foreground"><T>准备题目中…</T></p>
        </div>
      </div>);

  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <BackLink to={`/primary/grade/${grade}`}><T>返回</T></BackLink>
          <p className="mt-6 text-sm text-muted-foreground"><T>本年级词汇不足，无法生成题目。请先完成一些课程。</T></p>
        </div>
      </div>);

  }

  /* ============== RESULT VIEW ============== */
  if (phase === "result" && resultRow) {
    const isCheckup = mode === "checkup";
    const m = resultRow as any;
    const pct = isCheckup ? m.overall_score : m.accuracy;
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-violet-950/20">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-3 flex items-center justify-between print:hidden">
            <BackLink to={`/primary/grade/${grade}`}><T>返回</T></BackLink>
            <button onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-amber-700">
              <Printer className="size-3.5" /> <T>下载证书 PDF</T>
            </button>
          </div>

          <div ref={reportRef} className="report-print rounded-3xl border-4 border-double border-amber-400 bg-white p-6 shadow-lg dark:border-amber-700 dark:bg-card md:p-8">
            <div className="text-center">
              <Award className="mx-auto size-12 text-amber-600" />
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                {isCheckup ? "Monthly Checkup Certificate" : "Unit Challenge Certificate"}
              </div>
              <h1 className="mt-1 text-2xl font-black md:text-3xl">{childName}</h1>
              <div className={cn("mx-auto mt-3 inline-block rounded-2xl bg-gradient-to-br px-6 py-3 text-white shadow-md", m.tone)}>
                <div className="text-5xl">{m.emoji}</div>
                <div className="mt-1 text-sm font-extrabold"><T>{m.label}</T></div>
              </div>
              <div className="mt-3 text-4xl font-black tabular-nums">{pct}<span className="text-xl text-muted-foreground">/100</span></div>
              <div className="mt-1 text-xs text-muted-foreground">
                {isCheckup ?
                `${m.correct}/${m.total_questions} 题正确 · ${m.month_key} 月度评估` :
                `${m.score}/${m.total} 题正确 · ${unit?.emoji} ${unit?.title_cn} 单元`}
              </div>
              {isCheckup &&
              <div className="mt-1 text-[10px] font-mono text-muted-foreground"><T>证书编号</T> {m.cert_code}</div>
              }
            </div>

            {isCheckup &&
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <ScoreCard label="📚 词汇" value={m.vocab_score} />
                <ScoreCard label="🎧 听力" value={m.listen_score} />
                <ScoreCard label="🏆 综合" value={m.overall_score} />
              </div>
            }

            {isCheckup && (m.recommendations as any[])?.length > 0 &&
            <div className="mt-5">
                <h3 className="mb-2 flex items-center gap-1 text-sm font-extrabold">
                  <Lightbulb className="size-4 text-rose-500" /> <T>AI 学习建议</T>
                </h3>
                <div className="space-y-2">
                  {(m.recommendations as any[]).map((r, i) =>
                <Link key={i} to={r.link}
                className="block rounded-xl border-l-4 border-l-amber-500 bg-amber-50/60 p-3 transition hover:bg-amber-100/60 dark:bg-amber-950/30 dark:hover:bg-amber-900/30">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-extrabold"><T>{r.title}</T></div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{r.reason}</div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                          <T>{r.cta}</T> <ChevronRight className="size-3" />
                        </span>
                      </div>
                    </Link>
                )}
                </div>
              </div>
            }

            <div className="mt-6 flex flex-wrap justify-center gap-2 print:hidden">
              <button onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 rounded-full border-2 border-amber-300 bg-white px-4 py-1.5 text-xs font-extrabold text-amber-700 hover:bg-amber-50">
                <RefreshCw className="size-3.5" /> <T>陪 Spark 再来一次</T>
              </button>
              <Link to={`/primary/grade/${grade}`}
              className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-amber-700">
                <T>返回学习中心</T> <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .report-print, .report-print * { visibility: visible; }
            .report-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 4px double #f59e0b !important; }
            @page { margin: 12mm; }
          }
        `}</style>
      </div>);

  }

  /* ============== PLAY VIEW ============== */
  const q = questions[idx];
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-violet-950/20">
      <div className="mx-auto max-w-2xl px-4 py-5">
        <div className="mb-3 flex items-center justify-between">
          <BackLink to={`/primary/grade/${grade}`}><T>返回</T></BackLink>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {mode === "challenge" ? `🏝️ ${unit?.title_cn ?? ""} · 单元挑战` : "📊 月度评估"}
            </span>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-extrabold text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
              {idx + 1} / {totalQ}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
          style={{ width: `${(idx + (showFeedback !== null ? 1 : 0)) / totalQ * 100}%` }} />
        </div>

        {/* Question card */}
        <div className="rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-lg dark:border-amber-900 dark:bg-card md:p-8">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
              {q.type === "cn2en" ? "中文 → 英文" : q.type === "en2cn" ? "英文 → 中文" : "听音识词"}
            </div>
            {q.type === "listen" ?
            <button onClick={() => speak(q.word.word)}
            className="mx-auto mt-4 inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg transition hover:scale-105">
                <Volume2 className="size-10" />
              </button> :
            q.type === "cn2en" ?
            <h2 className="mt-3 text-3xl font-black md:text-4xl">{q.word.meaning_cn ?? q.word.word}</h2> :

            <h2 className="mt-3 text-3xl font-black md:text-4xl">{q.word.word}</h2>
            }
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIdx;
              const isPicked = picks[idx] === i;
              const showColor = showFeedback !== null && (isCorrect || isPicked);
              return (
                <button
                  key={i}
                  onClick={() => onPick(i)}
                  disabled={showFeedback !== null}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-3.5 text-left text-base font-bold transition active:scale-95",
                    !showColor && "border-border bg-card hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30",
                    showColor && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
                    showColor && !isCorrect && isPicked && "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                  )}>
                  
                  <span className="flex items-center gap-2">
                    {showColor && isCorrect && <CheckCircle2 className="size-4 text-emerald-600" />}
                    {showColor && !isCorrect && isPicked && <XCircle className="size-4 text-rose-600" />}
                    {opt}
                  </span>
                </button>);

            })}
          </div>

          {/* Live score */}
          <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs">
            <span className="font-bold text-muted-foreground"><T>已答</T> {picks.length} <T>题</T></span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300"><T>当前正确率</T> {pctSoFar}%</span>
          </div>
        </div>
      </div>
    </div>);

}

function ScoreCard({ label, value }: {label: string;value: number;}) {
  const tone = value >= 85 ? "from-emerald-400 to-teal-500" :
  value >= 70 ? "from-amber-400 to-orange-500" :
  "from-rose-400 to-pink-500";
  return (
    <div className="rounded-xl border bg-card p-3 text-center">
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-black tabular-nums">{value}<span className="text-sm text-muted-foreground">/100</span></div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full bg-gradient-to-r", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>);

}