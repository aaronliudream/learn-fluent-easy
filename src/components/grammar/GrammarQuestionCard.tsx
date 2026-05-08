import { useMemo, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";

/**
 * Universal grammar question card.
 *
 * Auto-selects the most appropriate UI mode based on which fields the
 * question row has populated:
 *
 *   - If `distractors` has 3 items → MULTI-CHOICE REWRITE
 *     (4-button picker; right one = correct_answer, wrong ones = distractors)
 *   - If `use_ai_grading=true` and `question_type ∈ {fill,transform,translation,correction}` → AI-GRADED
 *     (typed input → check-grammar-rewrite edge function → 3-layer feedback)
 *   - If `question_type='mcq'` and option_a..d filled → CLASSIC MCQ (legacy)
 *   - Otherwise → STRING-MATCH OPEN
 *     (typed input compared against accepted_answers / correct_answer)
 *
 * Same data table (`junior_grammar_questions`) covers all four. New rich
 * fields are optional — old questions still work.
 */

const TYPE_LABEL: Record<string, string> = {
  mcq: "选择",
  fill: "填空",
  transform: "句型转换",
  translation: "翻译",
  correction: "改错",
};

export type GrammarQuestion = {
  id: string;
  stem: string;
  question_type: string | null;
  // Classic mcq fields
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null;
  accepted_answers: string[] | null;
  explanation: string;
  // New rich fields
  distractors: { text: string; msg: string }[] | null;
  natural_note: string | null;
  grammar_topic: string | null;
  use_ai_grading: boolean;
};

export type AnswerResult =
  | { kind: "correct"; latencyMs: number }
  | { kind: "acceptable"; latencyMs: number; betterPhrasing?: string }
  | { kind: "wrong"; latencyMs: number; errorReason?: string };

interface Props {
  question: GrammarQuestion;
  index: number;
  /** Called once when the user finalizes their answer (right or wrong). */
  onAnswered: (result: AnswerResult) => void;
  /** Optional: open the TutorChat side-pane. */
  onAskTutor?: () => void;
  /** For TTS: speak the stem on demand. */
  enableTtsForStem?: boolean;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[.．。!?！？,，;；:：]+$/g, "").trim();
}

function checkOpenAnswerLocal(input: string, q: GrammarQuestion): boolean {
  const acc = (q.accepted_answers && q.accepted_answers.length
    ? q.accepted_answers
    : [q.correct_answer || ""]
  ).filter(Boolean) as string[];
  const norm = normalize(input);
  return acc.some((a) => normalize(a) === norm);
}

export function GrammarQuestionCard({ question, index, onAnswered, onAskTutor, enableTtsForStem }: Props) {
  const q = question;
  const qType = q.question_type || "mcq";

  // Mode detection
  const hasDistractors = Array.isArray(q.distractors) && q.distractors.length === 3;
  const isLegacyMcq = qType === "mcq" && (q.option_a || q.option_b);
  const useAi = q.use_ai_grading && qType !== "mcq";

  // Stable shuffled choices for multi-choice mode (one shuffle per question id)
  const shuffledChoices = useMemo(() => {
    if (!hasDistractors) return null;
    const all = [
      { text: q.correct_answer || "", correct: true, msg: "" },
      ...(q.distractors || []).map((d) => ({ text: d.text, correct: false, msg: d.msg })),
    ];
    // Stable seed from id so re-renders don't reshuffle
    let seed = 0;
    for (const ch of q.id) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
    const arr = [...all];
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [q.id, hasDistractors, q.correct_answer, q.distractors]);

  // ─── State across all modes ───
  const [shownAt] = useState<number>(() => Date.now());
  const [picked, setPicked] = useState<string | null>(null);   // mcq letter or distractor text
  const [picks, setPicks] = useState<{ text: string; correct: boolean; msg: string }[]>([]);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    grammarOk: boolean;
    meaningOk: boolean;
    naturalness: "native" | "ok" | "awkward";
    feedback: string;
    betterPhrasing?: string;
    errorReason?: string;
  } | null>(null);

  // ─── MCQ pick (legacy) ───
  const pickMcq = (letter: string) => {
    if (picked) return;
    setPicked(letter);
    const ok = letter === q.correct_answer;
    onAnswered({
      kind: ok ? "correct" : "wrong",
      latencyMs: Date.now() - shownAt,
      errorReason: ok ? undefined : "rule_unknown",
    });
  };

  // ─── Multi-choice rewrite pick ───
  const pickRewrite = (choice: { text: string; correct: boolean; msg: string }) => {
    if (picks.some((p) => p.text === choice.text)) return;
    if (picks.some((p) => p.correct)) return; // already locked on correct
    setPicks((p) => [...p, choice]);
    if (choice.correct) {
      onAnswered({ kind: "correct", latencyMs: Date.now() - shownAt });
    } else {
      // Don't finalize yet — student can try again. Only count as final wrong
      // when they eventually pick the correct one (then we still record the
      // first attempt as wrong for FSRS fairness).
      // For the FSRS event: count this as wrong on first wrong pick.
      if (picks.length === 0) {
        onAnswered({
          kind: "wrong",
          latencyMs: Date.now() - shownAt,
          errorReason: "rule_unknown",
        });
      }
    }
  };

  // ─── String-match open submit ───
  const submitOpenLocal = () => {
    if (revealed) return;
    if (!input.trim()) return;
    setRevealed(true);
    const ok = checkOpenAnswerLocal(input, q);
    onAnswered({
      kind: ok ? "correct" : "wrong",
      latencyMs: Date.now() - shownAt,
      errorReason: ok ? undefined : "rule_unknown",
    });
  };

  // ─── AI-graded open submit ───
  const submitOpenAI = async () => {
    if (revealed || aiLoading) return;
    if (!input.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-grammar-rewrite", {
        body: {
          studentAnswer: input,
          modelAnswer: q.correct_answer || "",
          grammarTopic: q.grammar_topic || qType,
          promptCN: undefined,
          promptEN: q.stem,
          acceptedAnswers: q.accepted_answers || [],
          feedbackLanguage: "Chinese",
        },
      });
      if (error || !data) {
        // Fall back to local string match — never block the user
        setRevealed(true);
        const ok = checkOpenAnswerLocal(input, q);
        onAnswered({
          kind: ok ? "correct" : "wrong",
          latencyMs: Date.now() - shownAt,
          errorReason: ok ? undefined : "rule_unknown",
        });
        return;
      }
      setAiResult(data);
      setRevealed(true);
      const grammarOk = !!data.grammarOk;
      const meaningOk = !!data.meaningOk;
      const naturalness = data.naturalness as "native" | "ok" | "awkward";
      let kind: AnswerResult["kind"];
      if (grammarOk && meaningOk && (naturalness === "native" || naturalness === "ok")) {
        kind = "correct";
      } else if (grammarOk && meaningOk && naturalness === "awkward") {
        kind = "acceptable";
      } else {
        kind = "wrong";
      }
      onAnswered({
        kind,
        latencyMs: Date.now() - shownAt,
        errorReason: kind === "wrong" ? (data.errorReason || "rule_unknown") : undefined,
        ...(kind === "acceptable" ? { betterPhrasing: data.betterPhrasing } : {}),
      });
    } catch {
      // Network failure → local fallback
      setRevealed(true);
      const ok = checkOpenAnswerLocal(input, q);
      onAnswered({
        kind: ok ? "correct" : "wrong",
        latencyMs: Date.now() - shownAt,
        errorReason: ok ? undefined : "rule_unknown",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const playStem = () => {
    if (!q.stem) return;
    speak(q.stem, { accent: "US" }).catch(() => { /* ignore */ });
  };

  // ───────── Render ─────────
  const lockedMcq = isLegacyMcq && !!picked;
  const lockedRewrite = hasDistractors && picks.some((p) => p.correct);
  const lockedOpen = !isLegacyMcq && !hasDistractors && revealed;
  const isLocked = lockedMcq || lockedRewrite || lockedOpen;

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5">
      {/* Type badge + question stem */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {TYPE_LABEL[qType] || qType}
        </div>
        {enableTtsForStem && (
          <button
            onClick={playStem}
            className="text-muted-foreground hover:text-emerald-600 transition"
            title="朗读题目"
            aria-label="朗读题目"
          >
            <Volume2 className="size-4" />
          </button>
        )}
      </div>

      <div className="text-sm font-bold whitespace-pre-wrap leading-relaxed mb-3">
        {index + 1}. {q.stem}
      </div>

      {/* ─── Mode A: Multi-choice rewrite ─── */}
      {hasDistractors && shuffledChoices && (
        <div className="space-y-2">
          {shuffledChoices.map((c, i) => {
            const wasPicked = picks.some((p) => p.text === c.text);
            const showCorrect = wasPicked && c.correct;
            const showWrong = wasPicked && !c.correct;
            const showRevealed = lockedRewrite && c.correct && !wasPicked;
            return (
              <button
                key={c.text + i}
                onClick={() => pickRewrite(c)}
                disabled={isLocked || (wasPicked && !c.correct)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl border-2 transition flex items-baseline gap-2",
                  showCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                  showRevealed && "border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20",
                  showWrong && "border-rose-400 bg-rose-50/60 dark:bg-rose-950/20 opacity-60",
                  !wasPicked && !lockedRewrite && "border-border hover:border-emerald-400",
                  lockedRewrite && !c.correct && !wasPicked && "opacity-40",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs flex-shrink-0 mt-0.5 w-5 text-center",
                    showCorrect || showRevealed ? "text-emerald-600" : showWrong ? "text-rose-600" : "text-muted-foreground",
                  )}
                >
                  {showCorrect || showRevealed ? "✓" : showWrong ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm leading-snug">{c.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Mode B: Legacy MCQ ─── */}
      {isLegacyMcq && !hasDistractors && (
        <div className="grid gap-2">
          {(["A", "B", "C", "D"] as const).map((L) => {
            const txt = (q as Record<string, unknown>)["option_" + L.toLowerCase()] as string | null;
            if (txt == null) return null;
            const isPicked = picked === L;
            const isAns = picked && L === q.correct_answer;
            const isWrong = picked && isPicked && L !== q.correct_answer;
            return (
              <button
                key={L}
                disabled={!!picked}
                onClick={() => pickMcq(L)}
                className={cn(
                  "rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                  !picked && "border-border hover:border-indigo-400",
                  isAns && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                  isWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                  picked && !isAns && !isWrong && "opacity-60",
                )}
              >
                <span className="mr-2 font-extrabold">{L}.</span>
                {txt}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Mode C: Open-typed (string-match or AI) ─── */}
      {!hasDistractors && !isLegacyMcq && (
        <div className="space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={revealed || aiLoading}
            rows={qType === "translation" || qType === "transform" || qType === "correction" ? 2 : 1}
            placeholder={
              qType === "translation"
                ? "请输入英文翻译…"
                : qType === "correction"
                ? "请输入改正后的句子…"
                : qType === "transform"
                ? "请输入转换后的句子…"
                : "请填入答案…"
            }
            className={cn(
              "w-full rounded-xl border-2 bg-background px-3 py-2 text-sm transition outline-none focus:border-indigo-400",
              revealed && (aiResult ? aiResult.grammarOk : checkOpenAnswerLocal(input, q))
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                : revealed
                ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30"
                : "border-border",
            )}
          />
          {!revealed ? (
            <button
              onClick={useAi ? submitOpenAI : submitOpenLocal}
              disabled={!input.trim() || aiLoading}
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-extrabold text-white disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              {aiLoading && <Loader2 className="size-3 animate-spin" />}
              {aiLoading ? "AI 批改中…" : useAi ? "✨ 智能批改" : "提交答案"}
            </button>
          ) : (
            <div className="rounded-lg bg-muted/60 p-2.5 text-xs">
              <div className="font-bold mb-1">参考答案：</div>
              <div className="font-mono text-[13px]">{q.correct_answer}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── AI feedback (3-layer) ─── */}
      {aiResult && (
        <div
          className={cn(
            "mt-3 rounded-lg p-3 text-xs space-y-1.5 border-2",
            aiResult.grammarOk && aiResult.meaningOk && aiResult.naturalness !== "awkward"
              ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
              : aiResult.grammarOk && aiResult.meaningOk
              ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
              : "border-rose-300 bg-rose-50 dark:bg-rose-950/30",
          )}
        >
          <div className="flex flex-wrap gap-1.5 mb-1">
            <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-bold", aiResult.grammarOk ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800")}>
              语法 {aiResult.grammarOk ? "✓" : "✗"}
            </span>
            <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-bold", aiResult.meaningOk ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800")}>
              含义 {aiResult.meaningOk ? "✓" : "✗"}
            </span>
            <span className={cn(
              "inline-block rounded px-1.5 py-0.5 text-[10px] font-bold",
              aiResult.naturalness === "native" && "bg-emerald-200 text-emerald-800",
              aiResult.naturalness === "ok" && "bg-amber-200 text-amber-800",
              aiResult.naturalness === "awkward" && "bg-rose-200 text-rose-800",
            )}>
              地道度 {aiResult.naturalness === "native" ? "native" : aiResult.naturalness === "ok" ? "OK" : "awkward"}
            </span>
          </div>
          <div className="leading-relaxed">
            {aiResult.feedback.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </div>
          {aiResult.betterPhrasing && (
            <div className="mt-2 pt-2 border-t border-current/10">
              <div className="text-[10px] font-bold tracking-wider opacity-70 mb-0.5">💎 更地道的写法</div>
              <div className="font-mono text-[12px]">{aiResult.betterPhrasing}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── Multi-choice latest-pick feedback ─── */}
      {hasDistractors && picks.length > 0 && !picks[picks.length - 1].correct && (
        <div className="mt-3 rounded-lg p-3 text-xs border-2 border-rose-300 bg-rose-50 dark:bg-rose-950/30">
          {picks[picks.length - 1].msg.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>
      )}

      {/* ─── Static explanation (after answered) ─── */}
      {isLocked && q.explanation && (
        <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed">
          💡 {q.explanation.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>
      )}

      {/* ─── Natural-note (only shown when grammar correct) ─── */}
      {isLocked && q.natural_note && (lockedRewrite || (aiResult?.grammarOk && aiResult?.meaningOk)) && (
        <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-xs leading-relaxed">
          💎 <span className="font-bold">地道度提示：</span>{q.natural_note}
        </div>
      )}

      {/* ─── Ask the tutor ─── */}
      {isLocked && onAskTutor && (
        <div className="mt-3">
          <button
            onClick={onAskTutor}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            💬 问小月 / Ask Luna
          </button>
        </div>
      )}
    </section>
  );
}
