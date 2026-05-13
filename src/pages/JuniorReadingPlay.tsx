import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Clock, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import NoCopyGuard from "@/components/NoCopyGuard";
import StarRating from "@/components/StarRating";
import { recordMastery, loadMastery, MasteryRow, PASS_PCT } from "@/lib/masteryProgress";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { ExamPaper, ExamContainer, ExamCard, ExamOption, ExamProgress } from "@/components/exam/ExamPaper";
import { ExamStepper } from "@/components/exam/ExamStepper";
import { InlineTutorChat } from "@/components/exam/InlineTutorChat";
import {
  DiagnosisTable,
  MistakeBookCallout,
  NextStepCards,
  inferTrap,
  buildNextStepsFromResult,
} from "@/components/exam/DiagnosisExtras";
import { Sparkles, Eye, ArrowLeft as BackIcon } from "lucide-react";

type Q = {q: string;options: string[];answer: string;explanation?: string;};
type R = {id: string;title: string;body: string;word_count: number | null;grade: number;questions: Q[];vocab_notes: {word: string;cn: string;}[];};
type ListItem = {id: string;title: string;};

export default function JuniorReadingPlay() {
  const { id } = useParams<{id: string;}>();
  const nav = useNavigate();
  const [r, setR] = useState<R | null>(null);
  const [list, setList] = useState<ListItem[]>([]);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [streak, setStreak] = useState(0);
  const [email, setEmail] = useState<string>("user");
  const [userId, setUserId] = useState<string | null>(null);
  const [allRevealed, setAllRevealed] = useState(false);
  const startRef = useRef<number>(Date.now());
  const qStartRef = useRef<Record<number, number>>({});
  const [now, setNow] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);
  // 流程阶段：测试 → 诊断 → 对话
  const [phase, setPhase] = useState<"test" | "diagnosis" | "dialogue">("test");
  const [tutorPrefill, setTutorPrefill] = useState<string>("");

  // Full-test lock: AI may only discuss the reading after submission.
  useRegisterAssistant(
    r ?
    {
      context: "junior_reading",
      ref: r.id,
      topic: `初中阅读 · ${r.title}`,
      mode: "full-test",
      unlocked: submitted,
      lockedHint: "请先把所有阅读题做完并点「提交」之后再来找我答疑哦 ✨",
      pageTitle: "💬 小月 · 阅读复盘",
      snapshot: submitted ?
      {
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
          explanation: q.explanation
        }))
      } :
      undefined
    } :
    null
  );

  // 推荐阅读时长（秒）：单词数 / 1.8 词每秒（约100词/分钟），最少 30 秒
  const minSec = useMemo(() => Math.max(30, Math.round((r?.word_count ?? 150) / 1.8)), [r?.word_count]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("junior_reading").select("id,title,body,word_count,grade,questions,vocab_notes").eq("id", id).maybeSingle();
      setR(data as any);
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        setUserId(u.user.id);
        setEmail(u.user.email ?? u.user.id.slice(0, 8));
        setMastery(await loadMastery("junior_reading"));
      }
      const grade = (data as any)?.grade;
      if (grade) {
        const { data: items } = await supabase.from("junior_reading").
        select("id,title").eq("grade", grade).order("created_at", { ascending: true });
        setList((items ?? []) as ListItem[]);
      }
      startRef.current = Date.now();
      setNow(Date.now());
    })();
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = Math.floor((now - startRef.current) / 1000);
  const timeOk = elapsed >= minSec;
  const allAnswered = r ? r.questions.every((_, i) => picks[i]) : false;
  const allCorrect = r ? r.questions.every((q, i) => picks[i] === q.answer) : false;
  const correctCount = r ? r.questions.filter((q, i) => picks[i] === q.answer).length : 0;

  const nextItem = useMemo(() => {
    if (!r || !list.length) return null;
    const idx = list.findIndex((x) => x.id === r.id);
    return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  }, [r, list]);

  const pick = async (qi: number, letter: string) => {
    if (!r || picks[qi]) return;
    const ms = Date.now() - (qStartRef.current[qi] ?? Date.now());
    qStartRef.current[qi] = Date.now();
    setPicks((p) => ({ ...p, [qi]: letter }));
    const ok = letter === r.questions[qi].answer;
    if (userId) {
      await supabase.from("junior_reading_attempts").insert({
        user_id: userId, reading_id: r.id, question_idx: qi,
        user_answer: letter, is_correct: ok
      });
    }
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "junior_reading", `${r.id}:${qi}`, "junior_reading", ms);
      await bumpPetSkill("reading_owl", 1);
    } else {
      setStreak(0);notifyWrong();
    }
    recordUnifiedAttempt({
      stage: "junior",
      grade: r.grade ?? 7,
      module: "reading",
      item_type: "reading_question",
      item_id: `${r.id}:${qi}`,
      item_label: r.title,
      is_correct: ok,
      user_answer: letter,
      correct_answer: r.questions[qi].answer,
      context: { reading_id: r.id, question_idx: qi, explanation: r.questions[qi].explanation }
    }).catch(() => {});
  };

  const handleSubmit = async () => {
    if (!r) return;
    if (!allAnswered) {toast.error("请先回答所有题目");return;}
    setSubmitted(true);
    const pct = Math.round(correctCount / r.questions.length * 100);
    if (timeOk) {
      // 写入完成 + 掌握度
      if (userId) {
        await supabase.from("junior_reading_completions").
        upsert({ user_id: userId, reading_id: r.id, perfect: pct === 100, time_spent_sec: elapsed }, { onConflict: "user_id,reading_id" });
        const updated = await recordMastery({ module: "junior_reading", itemId: r.id, pct });
        if (updated) setMastery((m) => ({ ...m, [r.id]: updated }));
      }
      if (pct === 100) {
        await awardForBlock("junior_reading");
      } else if (pct >= PASS_PCT) {
        toast(`✅ 通过 · 100% 才算完美掌握`);
      } else {
        toast.error(`只有 ${pct}%，需 ≥${PASS_PCT}% 才能解锁下一篇`);
      }
      celebrateScore(pct);
    } else {
      toast.warning(`还需阅读 ${minSec - elapsed} 秒`);
    }
  };

  const retry = () => {
    setPicks({});
    setSubmitted(false);
    setStreak(0);
    setAttempt((a) => a + 1);
    startRef.current = Date.now();
  };

  // 检查当前篇是否被允许进入：上一篇 best_pct ≥ PASS_PCT
  useEffect(() => {
    if (!r || !list.length || !userId) return;
    const idx = list.findIndex((x) => x.id === r.id);
    if (idx <= 0) return;
    const prev = list[idx - 1];
    const prevRow = mastery[prev.id];
    if (!prevRow || prevRow.best_pct < PASS_PCT) {
      toast.error("请先完成上一篇并通过 80% 才能阅读本篇");
      nav(`/junior/reading/${prev.id}`, { replace: true });
    }
  }, [r, list, userId, mastery, nav]);

  if (!r) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground"><T>加载中…</T></main>;

  const currentRow = mastery[r.id];
  const passed = (currentRow?.best_pct ?? 0) >= PASS_PCT;
  const perfect = currentRow?.stars && currentRow.stars >= 1;
  const goNext = () => {
    if (!nextItem) return;
    if (!passed) {toast.error("本篇得分需 ≥80% 才能进入下一篇");return;}
    nav(`/junior/reading/${nextItem.id}`);
  };

  const passage = (
    <div className="relative">
      <article className="exam-card p-6 sm:p-8 relative">
        <div className="exam-eyebrow mb-2"><T>Passage 阅读材料</T></div>
        <div className="exam-passage-title">{r.title}</div>
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

  const unlocked = passed;

  const progressStates = r.questions.map((q, i) => {
    const p = picks[i];
    if (!p) return "todo" as const;
    return p === q.answer ? ("correct" as const) : ("wrong" as const);
  });

  return (
    <ExamPaper>
      <NoCopyGuard />
      <ExamContainer max="7xl">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b exam-divider">
          <BackLink to="/junior/reading" className="inline-flex items-center gap-1.5 text-[13px] exam-soft hover:exam-ink transition">
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
          <div className="exam-eyebrow mb-2"><T>初中英语 · 阅读理解</T></div>
          <h1 className="exam-display text-[clamp(26px,3.6vw,40px)] leading-[1.1]">{r.title}</h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10 items-start">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto exam-passage-scroll">
            {passage}
          </div>
          <div>
            {qBlock}

            {/* 提交 / 重做 / 下一篇 */}
            <div className="mt-6 exam-card p-5">
            {!submitted ?
            <button onClick={handleSubmit} disabled={!allAnswered}
            className="exam-btn exam-btn-primary w-full">
                <T>提交并判定解锁 (</T>{correctCount}/{r.questions.length})
              </button> :

            <div className="space-y-3">
                <div className="exam-display text-[18px]">
                  <T>得分：</T>{correctCount}/{r.questions.length} <T>· 用时</T> {elapsed}s
                </div>
                {!timeOk ?
              <div className="exam-feedback" style={{ borderLeftColor: "hsl(var(--exam-gold))", background: "hsl(var(--exam-gold-soft))" }}>
                    <T>⏳ 阅读时长不足，请再认真读</T> {minSec - elapsed} <T>秒后再提交</T>
                  </div> :
              allCorrect ?
              <div className="exam-feedback exam-feedback-correct">
                    <T>🌟 完美掌握！星级 +1 · 已解锁下一篇</T>
                  </div> :
              passed ?
              <div className="exam-feedback" style={{ borderLeftColor: "hsl(var(--exam-gold))", background: "hsl(var(--exam-gold-soft))" }}>
                    <T>✅ 通过 (</T>{correctCount}/{r.questions.length}<T>)！已解锁下一篇 · 重做到 100% 可获得⭐</T>
                  </div> :

              <div className="exam-feedback exam-feedback-wrong">
                    <T>❌ 仅</T> {correctCount}/{r.questions.length}<T>，需 ≥</T>{Math.ceil(r.questions.length * PASS_PCT / 100)} <T>题正确才能解锁</T>
                  </div>
              }
                <div className="flex gap-2">
                  {!allCorrect &&
                <button onClick={retry} className="exam-btn exam-btn-ghost flex-1">
                      <RotateCcw className="size-4" /> <T>重做本篇</T>
                    </button>
                }
                  {nextItem &&
                <button onClick={goNext} disabled={!unlocked} className="exam-btn exam-btn-primary flex-1">
                      {unlocked ? <><T>下一篇</T> <ChevronRight className="size-4" /></> : <><Lock className="size-4" /> <T>解锁后进入下一篇</T></>}
                    </button>
                }
                </div>
              </div>
            }
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t exam-divider flex flex-wrap items-center justify-center gap-2">
          <Link to="/junior/reading" className="exam-btn exam-btn-primary"><ArrowLeft className="size-4" /> <T>返回阅读列表</T></Link>
          <Link to="/junior" className="exam-btn exam-btn-ghost"><T>初中首页</T></Link>
          <Link to="/pets" className="exam-btn exam-btn-ghost"><T>宠物</T></Link>
        </div>
      </ExamContainer>
    </ExamPaper>);

}