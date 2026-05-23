import { T } from "@/i18n/T";
import { useMemo, useState } from "react";
import { Loader2, Volume2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";

/**
 * Universal grammar question card — Playful Cards style
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
  correction: "改错"
};

const TYPE_COLORS: Record<string, string> = {
  mcq: "from-pink-500 to-rose-500",
  fill: "from-cyan-500 to-blue-500",
  transform: "from-purple-500 to-pink-500",
  translation: "from-amber-500 to-orange-500",
  correction: "from-emerald-500 to-cyan-500"
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
  // Adaptive difficulty (1=easy, 2=medium, 3=hard). Optional for backward compat.
  difficulty?: number | null;
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
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.．。!?！？,，;；:：]+$/g, "")
    .trim();
}

function checkOpenAnswerLocal(input: string, q: GrammarQuestion): boolean {
  const acc = (
    q.accepted_answers && q.accepted_answers.length
      ? q.accepted_answers
      : [q.correct_answer || ""]
  ).filter(Boolean) as string[];
  const norm = normalize(input);
  return acc.some((a) => normalize(a) === norm);
}

export function GrammarQuestionCard({
  question,
  index,
  onAnswered,
  onAskTutor,
  enableTtsForStem,
}: Props) {
  const q = question;
  const qType = q.question_type || "mcq";

  // Mode detection
  const hasDistractors =
    Array.isArray(q.distractors) && q.distractors.length === 3;
  const isLegacyMcq = qType === "mcq" && (q.option_a || q.option_b);
  const useAi = q.use_ai_grading && qType !== "mcq";

  // Stable shuffled choices for multi-choice mode (one shuffle per question id)
  const shuffledChoices = useMemo(() => {
    if (!hasDistractors) return null;
    const all = [
      { text: q.correct_answer || "", correct: true, msg: "" },
      ...(q.distractors || []).map((d) => ({
        text: d.text,
        correct: false,
        msg: d.msg,
      })),
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
  const [picked, setPicked] = useState<string | null>(null); // mcq letter or distractor text
  const [picks, setPicks] = useState<
    { text: string; correct: boolean; msg: string }[]
  >([]);
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
  const pickRewrite = (choice: {
    text: string;
    correct: boolean;
    msg: string;
  }) => {
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
      const { data, error } = await supabase.functions.invoke(
        "check-grammar-rewrite",
        {
          body: {
            studentAnswer: input,
            modelAnswer: q.correct_answer || "",
            grammarTopic: q.grammar_topic || qType,
            promptCN: undefined,
            promptEN: q.stem,
            acceptedAnswers: q.accepted_answers || [],
            feedbackLanguage: "Chinese",
          },
        }
      );
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
      if (
        grammarOk &&
        meaningOk &&
        (naturalness === "native" || naturalness === "ok")
      ) {
        kind = "correct";
      } else if (grammarOk && meaningOk && naturalness === "awkward") {
        kind = "acceptable";
      } else {
        kind = "wrong";
      }
      onAnswered({
        kind,
        latencyMs: Date.now() - shownAt,
        errorReason:
          kind === "wrong" ? data.errorReason || "rule_unknown" : undefined,
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
    speak(q.stem, { accent: "US" }).catch(() => {
      /* ignore */
    });
  };

  // ───────── Render ─────────
  const lockedMcq = isLegacyMcq && !!picked;
  const lockedRewrite = hasDistractors && picks.some((p) => p.correct);
  const lockedOpen = !isLegacyMcq && !hasDistractors && revealed;
  const isLocked = lockedMcq || lockedRewrite || lockedOpen;

  const typeColor = TYPE_COLORS[qType] || "from-pink-500 to-cyan-500";

  return (
    <section className="space-y-4">
      {/* Type badge + question stem */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
            typeColor
          )}
        >
          <Sparkles className="size-3" />
          {TYPE_LABEL[qType] || qType}
        </div>
        {enableTtsForStem && (
          <button
            onClick={playStem}
            className="rounded-full p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-950/30 transition-all duration-200"
            title="朗读题目"
            aria-label="朗读题目"
          >
            <Volume2 className="size-4" />
          </button>
        )}
      </div>

      <div className="text-sm font-bold whitespace-pre-wrap leading-relaxed text-foreground">
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 text-white text-xs font-bold mr-2">
          {index + 1}
        </span>
        {q.stem}
      </div>

      {/* ─── Mode A: Multi-choice rewrite — Playful buttons ─── */}
      {hasDistractors && shuffledChoices && (
        <div className="space-y-2.5">
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
                  "w-full text-left px-4 py-3 rounded-2xl border-2 transition-all duration-300 flex items-baseline gap-3 transform",
                  showCorrect &&
                    "border-cyan-400 bg-gradient-to-r from-cyan-50 to-pink-50 dark:from-cyan-950/40 dark:to-pink-950/40 shadow-lg shadow-cyan-200/40 scale-[1.02]",
                  showRevealed &&
                    "border-cyan-300 bg-cyan-50/60 dark:bg-cyan-950/20",
                  showWrong &&
                    "border-rose-400 bg-rose-50/60 dark:bg-rose-950/20 opacity-60 scale-[0.98]",
                  !wasPicked &&
                    !lockedRewrite &&
                    "border-pink-200/60 dark:border-pink-800/40 hover:border-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 hover:scale-[1.01]",
                  lockedRewrite && !c.correct && !wasPicked && "opacity-40"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all",
                    showCorrect || showRevealed
                      ? "bg-gradient-to-br from-cyan-400 to-pink-400 text-white"
                      : showWrong
                      ? "bg-rose-500 text-white"
                      : "bg-gradient-to-br from-pink-100 to-cyan-100 dark:from-pink-900/40 dark:to-cyan-900/40 text-pink-600 dark:text-pink-400"
                  )}
                >
                  {showCorrect || showRevealed
                    ? "✓"
                    : showWrong
                    ? "✗"
                    : String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm leading-snug">{c.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Mode B: Legacy MCQ — Playful buttons ─── */}
      {isLegacyMcq && !hasDistractors && (
        <div className="grid gap-2.5">
          {(["A", "B", "C", "D"] as const).map((L) => {
            const txt = (q as Record<string, unknown>)[
              "option_" + L.toLowerCase()
            ] as string | null;
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
                  "rounded-2xl border-2 px-4 py-3 text-left text-sm transition-all duration-300 transform flex items-center gap-3",
                  !picked &&
                    "border-pink-200/60 dark:border-pink-800/40 hover:border-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 hover:scale-[1.01]",
                  isAns &&
                    "border-cyan-400 bg-gradient-to-r from-cyan-50 to-pink-50 dark:from-cyan-950/40 dark:to-pink-950/40 shadow-lg shadow-cyan-200/40 scale-[1.02]",
                  isWrong &&
                    "border-rose-400 bg-rose-50 dark:bg-rose-950/30 scale-[0.98]",
                  picked && !isAns && !isWrong && "opacity-50"
                )}
              >
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                    isAns
                      ? "bg-gradient-to-br from-cyan-400 to-pink-400 text-white"
                      : isWrong
                      ? "bg-rose-500 text-white"
                      : "bg-gradient-to-br from-pink-100 to-cyan-100 dark:from-pink-900/40 dark:to-cyan-900/40 text-pink-600 dark:text-pink-400"
                  )}
                >
                  {isAns ? "✓" : isWrong ? "✗" : L}
                </span>
                {txt}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Mode C: Open-typed (string-match or AI) — Playful input ─── */}
      {!hasDistractors && !isLegacyMcq && (
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={revealed || aiLoading}
            rows={
              qType === "translation" ||
              qType === "transform" ||
              qType === "correction"
                ? 2
                : 1
            }
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
              "w-full rounded-2xl border-2 bg-white/80 dark:bg-background/80 px-4 py-3 text-sm transition-all duration-300 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-900/40",
              revealed &&
                (aiResult ? aiResult.grammarOk : checkOpenAnswerLocal(input, q))
                ? "border-cyan-400 bg-gradient-to-r from-cyan-50 to-pink-50 dark:from-cyan-950/30 dark:to-pink-950/30"
                : revealed
                ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30"
                : "border-pink-200/60 dark:border-pink-800/40"
            )}
          />
          {!revealed ? (
            <button
              onClick={useAi ? submitOpenAI : submitOpenLocal}
              disabled={!input.trim() || aiLoading}
              className="rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-40 inline-flex items-center gap-2 shadow-lg shadow-pink-300/40 dark:shadow-pink-900/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {aiLoading && <Loader2 className="size-4 animate-spin" />}
              {aiLoading ? "AI 批改中…" : useAi ? "✨ 智能批改" : "提交答案"}
            </button>
          ) : (
            <div className="rounded-2xl bg-gradient-to-r from-cyan-50 to-pink-50 dark:from-cyan-950/30 dark:to-pink-950/30 border border-cyan-200 dark:border-cyan-800/40 p-4">
              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                📝 参考答案：
              </div>
              <div className="font-mono text-sm">{q.correct_answer}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── AI feedback (3-layer) — Playful style ─── */}
      {aiResult && (
        <div
          className={cn(
            "rounded-2xl p-4 text-xs space-y-2 border-2 transition-all duration-300",
            aiResult.grammarOk &&
              aiResult.meaningOk &&
              aiResult.naturalness !== "awkward"
              ? "border-cyan-300 bg-gradient-to-r from-cyan-50 to-pink-50 dark:from-cyan-950/30 dark:to-pink-950/30"
              : aiResult.grammarOk && aiResult.meaningOk
              ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
              : "border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30"
          )}
        >
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                aiResult.grammarOk
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white"
                  : "bg-gradient-to-r from-rose-400 to-rose-500 text-white"
              )}
            >
              <T>语法</T> {aiResult.grammarOk ? "✓" : "✗"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                aiResult.meaningOk
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white"
                  : "bg-gradient-to-r from-rose-400 to-rose-500 text-white"
              )}
            >
              <T>含义</T> {aiResult.meaningOk ? "✓" : "✗"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                aiResult.naturalness === "native" &&
                  "bg-gradient-to-r from-pink-400 to-purple-500 text-white",
                aiResult.naturalness === "ok" &&
                  "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
                aiResult.naturalness === "awkward" &&
                  "bg-gradient-to-r from-rose-400 to-rose-500 text-white"
              )}
            >
              <T>地道度</T>{" "}
              {aiResult.naturalness === "native"
                ? "native"
                : aiResult.naturalness === "ok"
                ? "OK"
                : "awkward"}
            </span>
          </div>
          <div className="leading-relaxed text-sm">
            {aiResult.feedback.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i} className="font-bold text-pink-600 dark:text-pink-400">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
          {aiResult.betterPhrasing && (
            <div className="mt-3 pt-3 border-t border-pink-200/50 dark:border-pink-800/30">
              <div className="text-[10px] font-bold tracking-wider text-purple-500 mb-1">
                💎 更地道的写法
              </div>
              <div className="font-mono text-sm">{aiResult.betterPhrasing}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── Multi-choice latest-pick feedback — Playful style ─── */}
      {hasDistractors &&
        picks.length > 0 &&
        !picks[picks.length - 1].correct && (
          <div className="rounded-2xl p-4 text-sm border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
            {picks[picks.length - 1].msg.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i} className="font-bold text-rose-600 dark:text-rose-400">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        )}

      {/* ─── Static explanation (after answered) — Playful style ─── */}
      {isLocked && q.explanation && (
        <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-cyan-50 dark:from-pink-950/20 dark:to-cyan-950/20 border border-pink-200/50 dark:border-pink-800/30 p-4 text-sm leading-relaxed">
          <span className="text-pink-500 mr-1">💡</span>
          {q.explanation.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="font-bold text-pink-600 dark:text-pink-400">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
      )}

      {/* ─── Natural-note (only shown when grammar correct) — Playful style ─── */}
      {isLocked &&
        q.natural_note &&
        (lockedRewrite || (aiResult?.grammarOk && aiResult?.meaningOk)) && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-300/60 dark:border-amber-800/40 p-4 text-sm leading-relaxed">
            <span className="text-amber-500 mr-1">💎</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              <T>地道度提示：</T>
            </span>
            {q.natural_note}
          </div>
        )}

      {/* ─── Ask the tutor — Playful style ─── */}
      {isLocked && onAskTutor && (
        <div className="pt-2">
          <button
            onClick={onAskTutor}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-pink-300 dark:border-pink-700 px-4 py-2 text-sm font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all duration-300 transform hover:scale-105"
          >
            💬 问小月 / Ask Luna
          </button>
        </div>
      )}
    </section>
  );
}
