import { T } from "@/i18n/T";
import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, RotateCcw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import NoCopyGuard from "@/components/NoCopyGuard";
import StarRating from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { MasteryRow, PASS_PCT } from "@/lib/masteryProgress";
import { recordUnifiedAttempt, type AttemptStage } from "@/hooks/useRecordAttempt";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { ExamPaper, ExamContainer, ExamCard, ExamOption, ExamProgress } from "@/components/exam/ExamPaper";
import { getReading, type ReadingPassage } from "@/lib/reading/source";
import { recordReadingMastery, loadReadingMastery } from "@/lib/reading/mastery";

// 学段 → 统一错题/掌握度打点用的 stage + 代表 grade(edge fn 会 clamp 1..12)。
const BAND_STAGE: Record<string, { stage: AttemptStage; grade: number }> = {
  primary: { stage: "primary", grade: 6 },
  junior: { stage: "junior", grade: 8 },
  senior: { stage: "senior", grade: 11 },
  general: { stage: "junior", grade: 8 },
};

export default function ReadingPlay() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [r, setR] = useState<ReadingPassage | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [streak, setStreak] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const startRef = useRef<number>(Date.now());
  const qStartRef = useRef<Record<number, number>>({});
  const [now, setNow] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [done, setDone] = useState(false);

  // 全篇测试锁:AI 仅在提交后可讨论本篇。
  useRegisterAssistant(
    r
      ? {
          context: "reading_center",
          ref: r.id,
          topic: `阅读中心 · ${r.title}`,
          mode: "full-test",
          unlocked: submitted,
          lockedHint: "请先把所有阅读题做完并点「提交」之后再来找我答疑哦 ✨",
          pageTitle: "💬 小月 · 阅读复盘",
          snapshot: submitted
            ? {
                title: r.title,
                passage_excerpt: r.body.slice(0, 1200),
                vocab_notes: r.vocab_notes?.slice(0, 12),
                questions: r.questions.map((q, i) => ({
                  index: i + 1,
                  stem: q.q,
                  options: q.options,
                  correct_answer: q.answer,
                  user_answer: picks[i],
                  is_correct: picks[i] === q.answer,
                  explanation: q.explanation,
                })),
              }
            : undefined,
        }
      : null,
  );

  // 推荐阅读时长(秒):词数 / 1.8 词每秒(约100词/分钟),最少 30 秒。
  const minSec = useMemo(() => Math.max(30, Math.round((r?.word_count ?? 150) / 1.8)), [r?.word_count]);

  useEffect(() => {
    if (!id) return;
    setDone(false);
    setSubmitted(false);
    setPicks({});
    setStreak(0);
    setAttempt(1);
    (async () => {
      const data = await getReading(id);
      setR(data);
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        setUserId(u.user.id);
        setMastery(await loadReadingMastery());
      }
      startRef.current = Date.now();
      setNow(Date.now());
    })();
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 完成后停留 10 秒自动返回列表(期间可手动点「返回列表」)。
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => nav("/reading"), 10000);
    return () => clearTimeout(t);
  }, [done, nav]);

  const elapsed = Math.floor((now - startRef.current) / 1000);
  const timeOk = elapsed >= minSec;
  const allAnswered = r ? r.questions.every((_, i) => picks[i]) : false;
  const allCorrect = r ? r.questions.every((q, i) => picks[i] === q.answer) : false;
  const correctCount = r ? r.questions.filter((q, i) => picks[i] === q.answer).length : 0;

  const pick = async (qi: number, letter: string) => {
    if (!r || picks[qi]) return;
    const ms = Date.now() - (qStartRef.current[qi] ?? Date.now());
    qStartRef.current[qi] = Date.now();
    setPicks((p) => ({ ...p, [qi]: letter }));
    const ok = letter === r.questions[qi].answer;
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "reading_center", `${r.id}:${qi}`, "reading_center", ms);
    } else {
      setStreak(0);
      notifyWrong();
    }
    const { stage, grade } = BAND_STAGE[r.grade_band] ?? BAND_STAGE.general;
    recordUnifiedAttempt({
      stage,
      grade,
      module: "reading",
      item_type: "reading_question",
      item_id: `reading_center:${r.id}:${qi}`,
      item_label: r.title,
      is_correct: ok,
      user_answer: letter,
      correct_answer: r.questions[qi].answer,
      context: { question: r.questions[qi].q, reading_id: r.id, question_idx: qi, explanation: r.questions[qi].explanation },
    }).catch(() => {});
  };

  const handleSubmit = async () => {
    if (!r) return;
    if (!allAnswered) { toast.error("请先回答所有题目"); return; }
    if (!timeOk) { toast.warning(`还需阅读 ${minSec - elapsed} 秒`); return; }
    setSubmitted(true);
    const pct = Math.round((correctCount / r.questions.length) * 100);
    // 掌握度落 mastery_progress(D4);错题已在 pick() 逐题经 recordUnifiedAttempt 写入
    // user_mistakes(module:"reading",答错入册/答对自动解决)——即 D3 选定的单一错题链路,
    // 不再另写整篇快照,避免与逐题行重复/产生空卡。
    if (userId) {
      const updated = await recordReadingMastery(r.id, pct);
      if (updated) setMastery((m) => ({ ...m, [r.id]: updated }));
    }
    if (pct === 100) {
      await awardForBlock("reading_center");
    } else if (pct >= PASS_PCT) {
      toast(`✅ 通过 ${pct}% · 100% 才算完美掌握`);
    } else {
      toast.error(`本篇 ${pct}% · 可重做提升`);
    }
    celebrateScore(pct);
    setDone(true);
  };

  const retry = () => {
    setPicks({});
    setSubmitted(false);
    setStreak(0);
    setAttempt((a) => a + 1);
    startRef.current = Date.now();
  };

  if (!r) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground"><T>加载中…</T></main>;

  if (done) {
    const pct = Math.round((correctCount / r.questions.length) * 100);
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-card">
          <div className="text-4xl">{pct === 100 ? "🌟" : "✅"}</div>
          <p className="mt-3 text-lg font-extrabold text-foreground">
            <T>完成！答对</T> {correctCount} / {r.questions.length} <T>题</T>
          </p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            {pct}%{pct === 100 ? <T> · 完美掌握 ⭐</T> : null}
          </p>
          <Link
            to="/reading"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-border py-3 text-sm font-semibold text-foreground"
          >
            <T>返回阅读列表</T>
          </Link>
          <p className="mt-4 text-[11px] text-muted-foreground"><T>10 秒后自动返回列表</T></p>
        </div>
      </main>
    );
  }

  const currentRow = mastery[r.id];
  const passed = (currentRow?.best_pct ?? 0) >= PASS_PCT;

  const passage = (
    <div className="relative">
      <article className="exam-card p-6 sm:p-8 relative">
        <div className="exam-eyebrow mb-2"><T>Passage 阅读材料</T></div>
        <div className="exam-passage whitespace-pre-wrap">{r.body}</div>
      </article>
      {r.vocab_notes?.length > 0 && (
        <div className="mt-4 exam-card p-4">
          <div className="exam-eyebrow mb-2"><T>Vocabulary 词汇</T></div>
          <div className="flex flex-wrap gap-2">
            {r.vocab_notes.map((v, i) => (
              <span key={i} className="exam-vocab-chip">
                <strong className="exam-display-italic" style={{ color: "hsl(var(--exam-ink))" }}>{v.word}</strong>
                <span className="exam-mute">·</span>
                <span>{v.cn}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const qBlock = (
    <div className="space-y-5">
      {r.questions.map((q, i) => {
        const picked = picks[i];
        const isCorrect = picked === q.answer;
        return (
          <ExamCard key={i}>
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="exam-q-num">No. {String(i + 1).padStart(2, "0")}</span>
              <span className="exam-skill-tag"><T>阅读理解</T></span>
            </div>
            <p className="exam-stem mb-4">{q.q}</p>
            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, oi) => {
                const L = ["A", "B", "C", "D"][oi] as "A" | "B" | "C" | "D";
                let state: "idle" | "selected" | "correct" | "wrong" | "dim" = "idle";
                if (picked) {
                  if (L === q.answer) state = "correct";
                  else if (picked === L) state = "wrong";
                  else state = "dim";
                }
                return (
                  <ExamOption
                    key={L}
                    letter={L}
                    text={opt}
                    state={state}
                    disabled={!!picked}
                    onClick={() => pick(i, L)}
                  />
                );
              })}
            </div>
            {picked && (
              <div className={cn("exam-feedback", isCorrect ? "exam-feedback-correct" : "exam-feedback-wrong")}>
                <span className="exam-fb-label">{isCorrect ? "✓ Correct" : `✗ Answer: ${q.answer}`}</span>
                {q.explanation && <div className="text-[13.5px] leading-relaxed exam-soft">{q.explanation}</div>}
              </div>
            )}
          </ExamCard>
        );
      })}
    </div>
  );

  const progressStates = r.questions.map((q, i) => {
    const p = picks[i];
    if (!p) return "todo" as const;
    return p === q.answer ? ("correct" as const) : ("wrong" as const);
  });

  return (
    <ExamPaper className="pb-32">
      <NoCopyGuard />
      <ExamContainer max="7xl">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b exam-divider">
          <BackLink to="/reading" className="inline-flex items-center gap-1.5 text-[13px] exam-soft hover:exam-ink transition">
            <ArrowLeft className="size-4" /> <T>返回</T>
          </BackLink>
          <div className="flex items-center gap-3">
            <ExamProgress
              states={progressStates}
              label={`${progressStates.filter((s) => s !== "todo").length} / ${r.questions.length}`}
            />
            <span className={cn("exam-timer flex items-center gap-1", !timeOk && "text-[hsl(var(--exam-accent))]")}>
              <Clock className="size-4" /> {Math.min(elapsed, minSec)}/{minSec}s
            </span>
            {currentRow && <StarRating stars={currentRow.stars} size={14} />}
            {attempt > 1 && <span className="exam-skill-tag" style={{ background: "hsl(var(--exam-accent-soft))", color: "hsl(var(--exam-accent))" }}><T>第</T> {attempt} <T>次</T></span>}
          </div>
        </div>

        {/* Title */}
        <header className="mb-8">
          <div className="exam-eyebrow mb-2"><T>阅读中心 · 阅读理解</T></div>
          <h1 className="exam-display text-[clamp(26px,3.6vw,40px)] leading-[1.1]">{r.title}</h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10 items-start">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto exam-passage-scroll">
            {passage}
          </div>
          <div>
            {qBlock}

            {/* 提交 / 重做 */}
            <div className="mt-6 exam-card p-5">
              {!submitted ? (
                <button onClick={handleSubmit} disabled={!allAnswered} className="exam-btn exam-btn-primary w-full">
                  <T>提交 (</T>{correctCount}/{r.questions.length})
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="exam-display text-[18px]">
                    <T>得分：</T>{correctCount}/{r.questions.length} <T>· 用时</T> {elapsed}s
                  </div>
                  {!timeOk ? (
                    <div className="exam-feedback" style={{ borderLeftColor: "hsl(var(--exam-gold))", background: "hsl(var(--exam-gold-soft))" }}>
                      <T>⏳ 阅读时长不足，请再认真读</T> {minSec - elapsed} <T>秒后再提交</T>
                    </div>
                  ) : allCorrect ? (
                    <div className="exam-feedback exam-feedback-correct">
                      <T>🌟 完美掌握！星级 +1</T>
                    </div>
                  ) : passed ? (
                    <div className="exam-feedback" style={{ borderLeftColor: "hsl(var(--exam-gold))", background: "hsl(var(--exam-gold-soft))" }}>
                      <T>✅ 通过 (</T>{correctCount}/{r.questions.length}<T>)!重做到 100% 可获得⭐</T>
                    </div>
                  ) : (
                    <div className="exam-feedback exam-feedback-wrong">
                      <T>❌ 仅</T> {correctCount}/{r.questions.length}<T>,可重做提升</T>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {!allCorrect && (
                      <button onClick={retry} className="exam-btn exam-btn-ghost flex-1">
                        <RotateCcw className="size-4" /> <T>重做本篇</T>
                      </button>
                    )}
                    <Link to="/reading" className="exam-btn exam-btn-primary flex-1">
                      <T>返回列表</T> <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t exam-divider flex flex-wrap items-center justify-center gap-2">
          <Link to="/reading" className="exam-btn exam-btn-primary"><ArrowLeft className="size-4" /> <T>返回阅读列表</T></Link>
        </div>
      </ExamContainer>
    </ExamPaper>
  );
}
