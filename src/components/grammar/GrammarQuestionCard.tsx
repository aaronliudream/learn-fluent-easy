import { T } from "@/i18n/T";
import { useMemo, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";

/**
 * Universal grammar question card — Playful Cards style.
 *
 * Auto-selects the most appropriate UI mode based on which fields the
 * question row has populated:
 *
 *   - If `distractors` has 3 items → MULTI-CHOICE REWRITE
 *   - If `use_ai_grading=true` and open types → AI-GRADED
 *   - If `question_type='mcq'` and option_a..d filled → CLASSIC MCQ
 *   - Otherwise → STRING-MATCH OPEN
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
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null;
  accepted_answers: string[] | null;
  explanation: string;
  distractors: { text: string; msg: string }[] | null;
  natural_note: string | null;
  grammar_topic: string | null;
  use_ai_grading: boolean;
  // Adaptive difficulty (1=easy, 2=medium, 3=hard). Optional for backward compat.
  difficulty?: number | null;
};

export type AnswerResult =
  | { kind: "correct"; latencyMs: number; picked?: string }
  | { kind: "acceptable"; latencyMs: number; betterPhrasing?: string; picked?: string }
  | { kind: "wrong"; latencyMs: number; errorReason?: string; picked?: string };

interface Props {
  question: GrammarQuestion;
  index: number;
  onAnswered: (result: AnswerResult) => void;
  onAskTutor?: () => void;
  enableTtsForStem?: boolean;
  /** 放大题干与选项字体(初中语法专项用;高考默认 false 不变)。 */
  large?: boolean;
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

const CHOICE_LETTERS = ["A", "B", "C", "D"] as const;

function choiceButtonClass(
  state: "idle" | "correct" | "wrong" | "revealed" | "dimmed",
  large = false,
) {
  const base = cn(
    "w-full text-left px-4 py-3 rounded-2xl border-2 transition-all flex items-baseline gap-2.5 font-medium",
    large && "text-lg",
  );
  switch (state) {
    case "correct":
      return cn(
        base,
        "border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 shadow-[0_3px_0_0_hsl(160_60%_70%)]",
      );
    case "wrong":
      return cn(
        base,
        "border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 opacity-70",
      );
    case "revealed":
      return cn(
        base,
        "border-emerald-300 bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/25 dark:to-cyan-950/20",
      );
    case "dimmed":
      return cn(base, "opacity-40 border-pink-100 dark:border-pink-900/30");
    default:
      return cn(
        base,
        "border-pink-100 bg-white hover:border-cyan-300 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-cyan-50/50 hover:-translate-y-0.5 hover:shadow-md dark:border-pink-900/30 dark:bg-card dark:hover:border-cyan-700",
      );
  }
}

export function GrammarQuestionCard({
  question,
  index,
  onAnswered,
  onAskTutor,
  enableTtsForStem,
  large = false,
}: Props) {
  const q = question;
  const qType = q.question_type || "mcq";

  const hasDistractors = Array.isArray(q.distractors) && q.distractors.length === 3;
  const isLegacyMcq = qType === "mcq" && (q.option_a || q.option_b);
  const useAi = q.use_ai_grading && qType !== "mcq";

  const shuffledChoices = useMemo(() => {
    if (!hasDistractors) return null;
    const all = [
      { text: q.correct_answer || "", correct: true, msg: "" },
      ...(q.distractors || []).map((d) => ({ text: d.text, correct: false, msg: d.msg })),
    ];
    let seed = 0;
    for (const ch of q.id) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
    const arr = [...all];
    for (let i = arr.length - 1; i > 0; i--) {
      seed = ((seed * 9301 + 49297) % 233280);
      const j = Math.floor((seed / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [q.id, hasDistractors, q.correct_answer, q.distractors]);

  const [shownAt] = useState<number>(() => Date.now());
  const [picked, setPicked] = useState<string | null>(null);
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

  const pickMcq = (letter: string) => {
    if (picked) return;
    setPicked(letter);
    const ok = letter === q.correct_answer;
    onAnswered({
      kind: ok ? "correct" : "wrong",
      latencyMs: Date.now() - shownAt,
      errorReason: ok ? undefined : "rule_unknown",
      picked: letter,
    });
  };

  const pickRewrite = (choice: { text: string; correct: boolean; msg: string }) => {
    if (picks.some((p) => p.text === choice.text)) return;
    if (picks.some((p) => p.correct)) return;
    setPicks((p) => [...p, choice]);
    if (choice.correct) {
      onAnswered({ kind: "correct", latencyMs: Date.now() - shownAt, picked: choice.text });
    } else if (picks.length === 0) {
      onAnswered({
        kind: "wrong",
        latencyMs: Date.now() - shownAt,
        errorReason: "rule_unknown",
        picked: choice.text,
      });
    }
  };

  const submitOpenLocal = () => {
    if (revealed || !input.trim()) return;
    setRevealed(true);
    const ok = checkOpenAnswerLocal(input, q);
    onAnswered({
      kind: ok ? "correct" : "wrong",
      latencyMs: Date.now() - shownAt,
      errorReason: ok ? undefined : "rule_unknown",
      picked: input,
    });
  };

  const submitOpenAI = async () => {
    if (revealed || aiLoading || !input.trim()) return;
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
        setRevealed(true);
        const ok = checkOpenAnswerLocal(input, q);
        onAnswered({
          kind: ok ? "correct" : "wrong",
          latencyMs: Date.now() - shownAt,
          errorReason: ok ? undefined : "rule_unknown",
          picked: input,
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
        errorReason: kind === "wrong" ? data.errorReason || "rule_unknown" : undefined,
        ...(kind === "acceptable" ? { betterPhrasing: data.betterPhrasing } : {}),
        picked: input,
      });
    } catch {
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
    if (q.stem) speak(q.stem.replace(/\\n/g, " "), { accent: "US" }).catch(() => {});
  };

  const lockedMcq = isLegacyMcq && !!picked;
  const lockedRewrite = hasDistractors && picks.some((p) => p.correct);
  const lockedOpen = !isLegacyMcq && !hasDistractors && revealed;
  const isLocked = lockedMcq || lockedRewrite || lockedOpen;

  return (
    <section className="playful-card relative overflow-hidden p-4 sm:p-5">
      <span className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full bg-pink-200/30 blur-xl" />
      <span className="pointer-events-none absolute -bottom-3 -left-3 size-12 rounded-full bg-cyan-200/30 blur-xl" />

      <div className="relative flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 text-xs font-extrabold text-white shadow-sm">
            {index + 1}
          </span>
          <span className="rounded-full bg-gradient-to-r from-pink-100 to-cyan-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-600 dark:from-pink-950/50 dark:to-cyan-950/50 dark:text-pink-300">
            {TYPE_LABEL[qType] || qType}
          </span>
        </div>
        {enableTtsForStem && (
          <button
            onClick={playStem}
            className="rounded-full p-1.5 text-cyan-600 transition hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
            title="朗读题目"
            aria-label="朗读题目"
          >
            <Volume2 className="size-4" />
          </button>
        )}
      </div>

      <div className={cn("relative font-bold whitespace-pre-wrap leading-relaxed mb-4 text-foreground", large ? "text-lg sm:text-xl" : "text-base")}>
        {q.stem?.replace(/\\n/g, "\n")}
      </div>

      {hasDistractors && shuffledChoices && (
        <div className="relative space-y-2.5">
          {shuffledChoices.map((c, i) => {
            const wasPicked = picks.some((p) => p.text === c.text);
            const showCorrect = wasPicked && c.correct;
            const showWrong = wasPicked && !c.correct;
            const showRevealed = lockedRewrite && c.correct && !wasPicked;
            const state = showCorrect
              ? "correct"
              : showWrong
                ? "wrong"
                : showRevealed
                  ? "revealed"
                  : lockedRewrite && !c.correct && !wasPicked
                    ? "dimmed"
                    : "idle";
            return (
              <button
                key={c.text + i}
                onClick={() => pickRewrite(c)}
                disabled={isLocked || (wasPicked && !c.correct)}
                className={choiceButtonClass(state, large)}
              >
                <span
                  className={cn(
                    "flex-shrink-0 grid size-6 place-items-center rounded-lg text-xs font-extrabold",
                    showCorrect || showRevealed
                      ? "bg-emerald-400 text-white"
                      : showWrong
                        ? "bg-rose-400 text-white"
                        : "bg-gradient-to-br from-pink-100 to-cyan-100 text-pink-600 dark:from-pink-950/50 dark:to-cyan-950/50",
                  )}
                >
                  {showCorrect || showRevealed ? "✓" : showWrong ? "✗" : CHOICE_LETTERS[i]}
                </span>
                <span className={cn("leading-snug", large ? "text-lg" : "text-base")}>{c.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {isLegacyMcq && !hasDistractors && (
        <div className="relative grid grid-cols-2 gap-2.5">
          {CHOICE_LETTERS.map((L) => {
            const txt = (q as Record<string, unknown>)[`option_${L.toLowerCase()}`] as string | null;
            if (txt == null) return null;
            const isPicked = picked === L;
            const isAns = picked && L === q.correct_answer;
            const isWrong = picked && isPicked && L !== q.correct_answer;
            const state = isAns ? "correct" : isWrong ? "wrong" : picked ? "dimmed" : "idle";
            return (
              <button
                key={L}
                disabled={!!picked}
                onClick={() => pickMcq(L)}
                className={choiceButtonClass(state, large)}
              >
                <span
                  className={cn(
                    "mr-1 grid size-6 place-items-center rounded-lg text-xs font-extrabold",
                    isAns
                      ? "bg-emerald-400 text-white"
                      : isWrong
                        ? "bg-rose-400 text-white"
                        : "bg-gradient-to-br from-pink-100 to-cyan-100 text-pink-600",
                  )}
                >
                  {isAns ? "✓" : isWrong ? "✗" : L}
                </span>
                <span className="min-w-0 flex-1">{txt}</span>
                {isAns && (
                  <span className="ml-auto shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    正确
                  </span>
                )}
                {isWrong && (
                  <span className="ml-auto shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    你的答案
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!hasDistractors && !isLegacyMcq && (
        <div className="relative space-y-3">
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
              "w-full rounded-2xl border-2 bg-white px-4 py-3 text-sm transition outline-none focus:border-cyan-400 dark:bg-card",
              revealed &&
                (aiResult ? aiResult.grammarOk : checkOpenAnswerLocal(input, q))
                ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                : revealed
                  ? "border-rose-400 bg-rose-50/50 dark:bg-rose-950/20"
                  : "border-pink-100 dark:border-pink-900/40",
            )}
          />
          {!revealed ? (
            <button
              onClick={useAi ? submitOpenAI : submitOpenLocal}
              disabled={!input.trim() || aiLoading}
              className="playful-btn playful-btn-cyan inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-2 text-xs text-white"
            >
              {aiLoading && <Loader2 className="size-3 animate-spin" />}
              {aiLoading ? "AI 批改中…" : useAi ? "✨ 智能批改" : "提交答案"}
            </button>
          ) : (
            <div className="rounded-2xl border-2 border-cyan-100 bg-cyan-50/50 p-3 text-xs dark:border-cyan-900/40 dark:bg-cyan-950/20">
              <div className="font-bold mb-1 text-cyan-700 dark:text-cyan-300">
                <T>参考答案：</T>
              </div>
              <div className="font-mono text-[13px]">{q.correct_answer}</div>
            </div>
          )}
        </div>
      )}

      {aiResult && (
        <div
          className={cn(
            "relative mt-4 rounded-2xl p-4 text-xs space-y-1.5 border-2",
            aiResult.grammarOk && aiResult.meaningOk && aiResult.naturalness !== "awkward"
              ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20"
              : aiResult.grammarOk && aiResult.meaningOk
                ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30"
                : "border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30",
          )}
        >
          <div className="flex flex-wrap gap-1.5 mb-1">
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
                aiResult.grammarOk ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800",
              )}
            >
              <T>语法</T> {aiResult.grammarOk ? "✓" : "✗"}
            </span>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
                aiResult.meaningOk ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800",
              )}
            >
              <T>含义</T> {aiResult.meaningOk ? "✓" : "✗"}
            </span>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
                aiResult.naturalness === "native" && "bg-emerald-200 text-emerald-800",
                aiResult.naturalness === "ok" && "bg-amber-200 text-amber-800",
                aiResult.naturalness === "awkward" && "bg-rose-200 text-rose-800",
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
          <div className="leading-relaxed">
            {aiResult.feedback.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i} className="font-bold">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </div>
          {aiResult.betterPhrasing && (
            <div className="mt-2 pt-2 border-t border-current/10">
              <div className="text-[10px] font-bold tracking-wider opacity-70 mb-0.5">
                <T>💎 更地道的写法</T>
              </div>
              <div className="font-mono text-[12px]">{aiResult.betterPhrasing}</div>
            </div>
          )}
        </div>
      )}

      {hasDistractors && picks.length > 0 && !picks[picks.length - 1].correct && (
        <div className="relative mt-4 rounded-2xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-3 text-xs dark:border-rose-900/40 dark:from-rose-950/30">
          {picks[picks.length - 1].msg.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>
      )}

      {isLocked && q.explanation && (
        <div className="relative mt-4 rounded-2xl border-2 border-pink-100 bg-gradient-to-br from-pink-50/80 to-cyan-50/80 p-3 text-xs leading-relaxed dark:border-pink-900/30 dark:from-pink-950/20 dark:to-cyan-950/20">
          💡{" "}
          {q.explanation.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>
      )}

      {isLocked &&
        q.natural_note &&
        (lockedRewrite || (aiResult?.grammarOk && aiResult?.meaningOk)) && (
          <div className="relative mt-2 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-3 text-xs leading-relaxed dark:border-amber-900/40 dark:bg-amber-950/20">
            💎{" "}
            <span className="font-bold">
              <T>地道度提示：</T>
            </span>
            {q.natural_note}
          </div>
        )}

    </section>
  );
}
