import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Send, RotateCcw, BookMarked, ChevronUp, ChevronDown, Lightbulb, Languages, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getClozePassageById, isLocalPepClozePassage } from "@/lib/gaokaoContent";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { awardCoins, awardForBlock, petReact } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { recordMastery } from "@/lib/masteryProgress";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { recordZoneMistake, answerToIdx } from "@/lib/recordZoneMistake";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";

type Passage = {
  id: string;passage_no: number;title: string;topic: string | null;topic_group: string | null;
  genre: string | null;difficulty: number;word_count: number | null;recommended_minutes: number;
  body_with_placeholders: string;translation_zh: string | null;article_analysis: string | null;
  exam_points: string | null;
};
type Blank = {
  id: string;blank_no: number;option_a: string;option_b: string;option_c: string;option_d: string;
  correct_answer: string;pos_tag: string | null;skill_tag: string | null;skill_method: string | null;
  general_explanation: string | null;
  explanation_a: string | null;explanation_b: string | null;explanation_c: string | null;explanation_d: string | null;
};

type Result = {session_id: string;total_blanks: number;correct_count: number;score_pct: number;};

const LETTERS = ["A", "B", "C", "D"] as const;

export default function GaokaoClozePlay() {
  const { id } = useParams<{id: string;}>();
  const nav = useNavigate();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [blanks, setBlanks] = useState<Blank[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeBlank, setActiveBlank] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [expandedBlank, setExpandedBlank] = useState<number | null>(null);
  const startedAt = useRef(Date.now());

  // Full-test lock: AI may only discuss the cloze passage after submission.
  useRegisterAssistant(
    passage ?
    {
      context: "gaokao_cloze",
      ref: passage.id,
      topic: `高考完形 · ${passage.title}`,
      mode: "full-test",
      unlocked: submitted,
      lockedHint: "请先把所有空填完并提交后，我再来帮你逐题分析 ✨",
      pageTitle: "💬 小月 · 完形复盘",
      snapshot: submitted ?
      {
        title: passage.title,
        topic: passage.topic,
        blanks: blanks.map((b) => ({
          no: b.blank_no,
          options: { A: b.option_a, B: b.option_b, C: b.option_c, D: b.option_d },
          correct_answer: b.correct_answer,
          user_answer: answers[b.blank_no],
          is_correct: answers[b.blank_no] === b.correct_answer,
          skill: b.skill_tag,
          general_explanation: b.general_explanation
        }))
      } :
      undefined
    } :
    null
  );

  useEffect(() => {
    if (!id) return;
    const local = getClozePassageById(id);
    if (local) {
      const { blanks: bs, ...rest } = local;
      setPassage(rest as Passage);
      setBlanks(bs as Blank[]);
      return;
    }
    (async () => {
      const [{ data: p }, { data: bs }] = await Promise.all([
        supabase.from("gaokao_cloze_passages").select("*").eq("id", id).maybeSingle(),
        supabase.from("gaokao_cloze_blanks").select("*").eq("passage_id", id).order("blank_no"),
      ]);
      setPassage(p as Passage);
      setBlanks((bs || []) as Blank[]);
    })();
  }, [id]);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const blankMap = useMemo(() => {
    const m: Record<number, Blank> = {};
    blanks.forEach((b) => {m[b.blank_no] = b;});
    return m;
  }, [blanks]);

  const answeredCount = Object.values(answers).filter(Boolean).length;

  // Render passage with inline blank chips
  const segments = useMemo(() => {
    if (!passage) return [];
    const parts: Array<{type: "text";text: string;} | {type: "blank";no: number;}> = [];
    const re = /__(\d+)__/g;
    let last = 0;
    const text = passage.body_with_placeholders;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ type: "text", text: text.slice(last, m.index) });
      parts.push({ type: "blank", no: parseInt(m[1], 10) });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
    return parts;
  }, [passage]);

  async function handleSubmit() {
    if (!id || submitting) return;
    if (answeredCount < blanks.length) {
      const ok = window.confirm(`还有 ${blanks.length - answeredCount} 题未作答，确定提交？`);
      if (!ok) return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("请先登录以保存成绩");
      nav("/auth");
      setSubmitting(false);
      return;
    }
    let r: Result | null = null;
    if (isLocalPepClozePassage(id!)) {
      let correct = 0;
      for (const b of blanks) {
        if (answers[b.blank_no] === b.correct_answer) correct += 1;
      }
      r = {
        session_id: "local-pep",
        total_blanks: blanks.length,
        correct_count: correct,
        score_pct: blanks.length ? correct / blanks.length : 0,
      };
    } else {
      const { data, error } = await supabase.rpc("submit_cloze_session", {
        _passage_id: id,
        _answers: answers,
        _duration_seconds: elapsed,
      });
      if (error) {
        setSubmitting(false);
        toast.error(error.message);
        return;
      }
      r = (data as Result[])[0] ?? null;
    }
    setSubmitting(false);
    if (!r) return;
    setResult(r);
    setSubmitted(true);
    // 记录掌握度（用于解锁下一篇 + 遗忘曲线复习）
    if (r) {
      await recordMastery({
        module: "gaokao_cloze",
        itemId: id,
        pct: Math.round((r.score_pct ?? 0) * 100)
      });
    }
    // Per-blank unified mastery (cloze 模块按教育部课标计入高中掌握度)
    for (const b of blanks) {
      const userAns = answers[b.blank_no];
      const ok = userAns === b.correct_answer;
      recordUnifiedAttempt({
        stage: "senior",
        grade: 10,
        module: "cloze",
        item_type: "cloze_blank",
        item_id: b.id,
        item_label: passage?.title ?? `Cloze ${passage?.passage_no ?? ""}`,
        is_correct: ok,
        user_answer: userAns,
        correct_answer: b.correct_answer,
        context: { passage_id: id, blank_no: b.blank_no, skill: b.skill_tag, explanation: b.general_explanation }
      }).catch(() => {});
      // 额外:完整快照写统一错题本(题干+全选项+作答),做对自动移出。纯新增,失败只 warn。
      const clozeOpts = [b.option_a, b.option_b, b.option_c, b.option_d];
      void recordZoneMistake({
        module: "senior_cloze",
        sourceKeyBase: `${id}:${b.blank_no}`,
        isCorrect: ok,
        stem: `${passage?.title ?? "完形填空"} · 第 ${b.blank_no} 空`,
        options: clozeOpts,
        correctIdx: answerToIdx(b.correct_answer, clozeOpts),
        pickedIdx: answerToIdx(userAns, clozeOpts),
        explanation: b.general_explanation,
        sourceLabel: passage?.title ?? null,
      });
    }
    // 宠物挂钩：每对一空 1 星币 + 满分 +20 + 5题块 +5
    if (r?.correct_count > 0) {
      const total = r.correct_count + (r.correct_count === r.total_blanks ? 20 : 0);
      await awardCoins(total, "gaokao_cloze_submit");
      const blocks = Math.floor(r.correct_count / 5);
      for (let i = 0; i < blocks; i++) await awardForBlock("gaokao_cloze");
      await bumpPetSkill("cloze_ninja", 1);
      petReact("happy", { coins: total });
    }
    const pct = r.total_blanks > 0 ? Math.round(r.correct_count / r.total_blanks * 100) : 0;
    celebrateScore(pct);
    if (r.correct_count !== r.total_blanks) {
      toast(`${r.correct_count} / ${r.total_blanks} · 错题已自动加入错题本`);
    }
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setActiveBlank(null);
    setExpandedBlank(null);
    startedAt.current = Date.now();
    setElapsed(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!passage) {
    return <div className="mx-auto min-h-screen max-w-3xl animate-pulse px-5 py-8"><div className="h-96 rounded-2xl bg-muted" /></div>;
  }

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-4 pb-32">
      <GuestBanner />
      {/* Sticky compact header */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-border bg-background/85 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <Link to="/gaokao/cloze" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> <T>列表</T>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            {!submitted &&
            <>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="size-3.5" />{mins}:{secs}</span>
                <span className="font-mono text-muted-foreground">{answeredCount}/{blanks.length}</span>
              </>
            }
            {submitted && result &&
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold",
            result.score_pct >= 0.8 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
            result.score_pct >= 0.6 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
            "bg-rose-500/15 text-rose-600 dark:text-rose-400")}>
                {result.correct_count}/{result.total_blanks} · {Math.round(result.score_pct * 100)}%
              </span>
            }
          </div>
        </div>
      </div>

      {/* Title block */}
      <header className="mb-4">
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">P{passage.passage_no.toString().padStart(2, "0")}</span>
          {passage.topic_group && <span>{passage.topic_group}</span>}
          {passage.genre && <><span>·</span><span>{passage.genre}</span></>}
          <span>·</span><span>{passage.word_count} <T>词</T></span>
        </div>
        <h1 className="text-xl font-bold leading-tight md:text-2xl">{passage.title}</h1>
      </header>

      {/* Reading area — Notion / Readlang inspired */}
      <article className="rounded-2xl border border-border bg-card px-5 py-6 text-[17px] leading-[2.0] tracking-[0.005em] text-foreground md:text-[18px] md:leading-[2.05]" style={{ fontFamily: "'Charter','Iowan Old Style','Georgia','Source Serif Pro',serif" }}>
        {segments.map((s, i) => {
          if (s.type === "text") return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{s.text}</span>;
          const b = blankMap[s.no];
          const ans = answers[s.no];
          const isCorrect = submitted && b && ans === b.correct_answer;
          const isWrong = submitted && b && ans && ans !== b.correct_answer;
          const isActive = activeBlank === s.no;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {if (!submitted) setActiveBlank(activeBlank === s.no ? null : s.no);else setExpandedBlank(expandedBlank === s.no ? null : s.no);}}
              className={cn(
                "mx-0.5 inline-flex min-w-[3.5em] items-center justify-center gap-1 rounded-md border px-2 py-0.5 align-baseline text-[15px] font-semibold transition",
                "font-sans",
                !submitted && !ans && "border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
                !submitted && ans && "border-primary/60 bg-primary/10 text-primary hover:bg-primary/15",
                !submitted && isActive && "ring-2 ring-primary/60",
                submitted && isCorrect && "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                submitted && isWrong && "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-400 line-through decoration-rose-500/60",
                submitted && !ans && "border-rose-500/40 bg-rose-500/5 text-rose-600"
              )}
              title={submitted && b ? `正确答案: ${b.correct_answer}` : undefined}>
              
              <sup className="text-[10px] opacity-60">{s.no}</sup>
              {ans ? b ? (b as any)[`option_${ans.toLowerCase()}`] : ans : "_____"}
              {submitted && isCorrect && <CheckCircle2 className="size-3" />}
              {submitted && isWrong && <XCircle className="size-3" />}
            </button>);

        })}
      </article>

      {/* Active blank floating option chip (study-mode picker) */}
      {!submitted && activeBlank !== null && blankMap[activeBlank] &&
      <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span><T>第</T> {activeBlank} <T>空 · 选一个最佳答案</T></span>
              <button onClick={() => setActiveBlank(null)} className="rounded p-1 hover:bg-muted">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LETTERS.map((L) => {
              const text = (blankMap[activeBlank] as any)[`option_${L.toLowerCase()}`];
              const selected = answers[activeBlank] === L;
              return (
                <button
                  key={L}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [activeBlank]: L }));
                    // jump to next unanswered
                    const next = blanks.find((b) => b.blank_no > activeBlank && !answers[b.blank_no] && b.blank_no !== activeBlank);
                    setActiveBlank(next ? next.blank_no : null);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50 hover:bg-muted"
                  )}>
                  
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", selected ? "bg-primary-foreground/20" : "bg-muted")}>{L}</span>
                    <span className="truncate">{text}</span>
                  </button>);

            })}
            </div>
          </div>
        </div>
      }

      {/* Quick blank navigator */}
      {!submitted &&
      <div className="mt-4 rounded-2xl border border-border bg-card p-3">
          <div className="mb-2 text-xs text-muted-foreground"><T>快速跳转</T></div>
          <div className="flex flex-wrap gap-1.5">
            {blanks.map((b) =>
          <button
            key={b.id}
            onClick={() => setActiveBlank(b.blank_no)}
            className={cn(
              "size-8 rounded-lg text-xs font-semibold transition",
              answers[b.blank_no] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
              activeBlank === b.blank_no && "ring-2 ring-primary"
            )}>
            
                {b.blank_no}
              </button>
          )}
          </div>
        </div>
      }

      {/* 内容流内的醒目完成按钮 —— 答完最后一题滚动到这里就能看到 */}
      {!submitted &&
      <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center">
          <div className="mb-3 text-sm text-muted-foreground">
            <T>已完成</T> <b className="text-foreground">{answeredCount}</b> / {blanks.length} <T>题</T>
            {answeredCount < blanks.length && <> <T>· 还剩</T> <b className="text-amber-600">{blanks.length - answeredCount}</b> <T>题未作答</T></>}
          </div>
          <button
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-extrabold transition",
            answeredCount === blanks.length ?
            "bg-primary text-primary-foreground shadow-lg hover:opacity-90 animate-pulse" :
            "bg-muted text-muted-foreground hover:bg-muted/80",
            submitting && "opacity-50 cursor-wait"
          )}>
          
            <Send className="size-5" />
            {submitting ? "批改中…" : answeredCount === blanks.length ? "✅ 完成并提交答案" : `提交（${answeredCount}/${blanks.length}）`}
          </button>
          {answeredCount < blanks.length &&
        <div className="mt-2 text-[11px] text-muted-foreground">
              <T>空着的题会按错处理，可点上方"快速跳转"补完</T>
            </div>
        }
        </div>
      }

      {/* Per-blank explanation panel after submit */}
      {submitted &&
      <section className="mt-6 space-y-2">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="size-4 text-amber-500" /> <T>逐题精讲</T>
          </h2>
          {blanks.map((b) => {
          const ans = answers[b.blank_no];
          const correct = ans === b.correct_answer;
          const expanded = expandedBlank === b.blank_no;
          return (
            <div key={b.id} className={cn("overflow-hidden rounded-xl border", correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5")}>
                <button
                onClick={() => setExpandedBlank(expanded ? null : b.blank_no)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
                
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  correct ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>{b.blank_no}</span>
                    {correct ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-rose-600" />}
                    <span className="text-sm">
                      <T>你选</T> <b>{ans || "—"}</b> <T>· 正确</T> <b className="text-emerald-700 dark:text-emerald-400">{b.correct_answer}</b>
                    </span>
                    {b.skill_tag && <span className="ml-1 hidden rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">{b.skill_tag}</span>}
                  </div>
                  {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                {expanded &&
              <div className="space-y-3 border-t border-border/50 bg-background/50 px-3 py-3 text-sm">
                    {b.skill_method &&
                <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-900 dark:text-amber-100">
                        <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide opacity-70"><T>解题方法</T></div>
                        {b.skill_method}
                      </div>
                }
                    {b.general_explanation && <p className="leading-relaxed">{b.general_explanation}</p>}
                    <div className="grid gap-1.5">
                      {LETTERS.map((L) => {
                    const expl = (b as any)[`explanation_${L.toLowerCase()}`];
                    const opt = (b as any)[`option_${L.toLowerCase()}`];
                    const isCorrect = L === b.correct_answer;
                    const isUserPick = L === ans;
                    return (
                      <div key={L} className={cn("rounded-lg border px-3 py-2 text-xs",
                      isCorrect ? "border-emerald-500/40 bg-emerald-500/10" :
                      isUserPick ? "border-rose-500/40 bg-rose-500/10" :
                      "border-border bg-muted/30"
                      )}>
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className={cn("inline-flex size-4 items-center justify-center rounded-full text-[10px]",
                          isCorrect ? "bg-emerald-500 text-white" : isUserPick ? "bg-rose-500 text-white" : "bg-muted-foreground/20")}>{L}</span>
                              <span>{opt}</span>
                              {isCorrect && <span className="ml-auto text-[10px] text-emerald-600"><T>✓ 正确</T></span>}
                              {isUserPick && !isCorrect && <span className="ml-auto text-[10px] text-rose-600"><T>你的选择</T></span>}
                            </div>
                            {expl && <div className="mt-1 leading-relaxed text-muted-foreground">{expl}</div>}
                          </div>);

                  })}
                    </div>
                  </div>
              }
              </div>);

        })}
        </section>
      }

      {/* Article aids */}
      {submitted &&
      <section className="mt-6 space-y-2">
          <button onClick={() => setShowTranslation((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted/50">
            <span className="inline-flex items-center gap-2"><Languages className="size-4" /> <T>全文翻译</T></span>
            {showTranslation ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {showTranslation && passage.translation_zh &&
        <div className="rounded-xl border border-border bg-card px-5 py-4 text-[15px] leading-[1.95] text-muted-foreground" style={{ fontFamily: "'PingFang SC','Hiragino Sans GB',sans-serif" }}>
              {passage.translation_zh}
            </div>
        }
          <button onClick={() => setShowAnalysis((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted/50">
            <span className="inline-flex items-center gap-2"><Sparkles className="size-4" /> <T>文章脉络 & 考点综述</T></span>
            {showAnalysis ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {showAnalysis &&
        <div className="space-y-3 rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed">
              {passage.article_analysis && <div><div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><T>文章解析</T></div><p>{passage.article_analysis}</p></div>}
              {passage.exam_points && <div><div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><T>考点综述</T></div><p>{passage.exam_points}</p></div>}
            </div>
        }
        </section>
      }

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          {!submitted ?
          <>
              <Link to="/gaokao/cloze" className="rounded-xl border border-border px-3 py-2.5 text-sm"><T>取消</T></Link>
              <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
              
                <Send className="size-4" /> {submitting ? "批改中…" : `提交 (${answeredCount}/${blanks.length})`}
              </button>
            </> :

          <>
              <button onClick={handleRetry} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-sm">
                <RotateCcw className="size-4" /> <T>重做</T>
              </button>
              <Link to="/gaokao/mistakes" className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-sm">
                <BookMarked className="size-4" /> <T>错题本</T>
              </Link>
              <Link to="/gaokao/cloze" className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                <T>下一篇 →</T>
              </Link>
            </>
          }
        </div>
      </div>
    </main>);

}