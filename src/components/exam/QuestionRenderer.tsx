import { T } from "@/i18n/T";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamQuestion } from "@/data/exams";
import type { ExamMode } from "@/lib/suzhouExamUtils";
import { checkCorrect, isAutoGraded } from "@/lib/suzhouExamUtils";
import { ExamOption } from "@/components/exam/ExamPaper";

type Props = {
  question: ExamQuestion;
  qNum: number;
  mode: ExamMode;
  submitted: boolean;
  value: string;
  onChange: (val: string) => void;
  showExplanation: boolean;
};

function ExplanationBlock({
  question,
  userAnswer,
  isCorrect,
  pendingAi,
}: {
  question: ExamQuestion;
  userAnswer: string;
  isCorrect: boolean | null;
  pendingAi?: boolean;
}) {
  return (
    <div className="exam-explanation mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 border-l-4 border-amber-400">
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        {pendingAi ? (
          <span className="text-amber-700 dark:text-amber-300"><T>待 AI 评分</T></span>
        ) : isCorrect ? (
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
        ) : (
          <XCircle className="size-4 text-rose-500 shrink-0" />
        )}
        {!pendingAi && (
          <span><T>正确答案：</T>{question.answer.slice(0, 120)}{question.answer.length > 120 ? "…" : ""}</span>
        )}
        <span className="text-xs text-muted-foreground font-normal">
          <T>你的答案：</T>{userAnswer || "未作答"}
        </span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100">
          {question.knowledge_point}
        </span>
      </div>
      <div className="mt-2 text-sm leading-relaxed whitespace-pre-line exam-soft">{question.explanation}</div>
    </div>
  );
}

export default function QuestionRenderer({
  question,
  qNum,
  mode,
  submitted,
  value,
  onChange,
  showExplanation,
}: Props) {
  const locked = mode === "review";
  const disabled = locked || (mode === "exam" && submitted);
  const isCorrect = checkCorrect(question, value);
  const pendingAi = !isAutoGraded(question);

  const renderMcq = (letters: string[]) => (
    <div className="flex flex-col gap-2.5">
      {letters.map((letter) => {
        const text = question.options?.[letter] ?? letter;
        const picked = value === letter;
        let state: "idle" | "selected" | "correct" | "wrong" | "dim" = "idle";
        if (showExplanation && isCorrect !== null) {
          if (letter === question.answer.toUpperCase()) state = "correct";
          else if (picked) state = "wrong";
          else state = "dim";
        } else if (picked) {
          state = "selected";
        }
        if (letters.length <= 4) {
          return (
            <ExamOption
              key={letter}
              letter={letter as "A" | "B" | "C" | "D"}
              text={text}
              state={state}
              disabled={disabled}
              onClick={() => !disabled && onChange(letter)}
            />
          );
        }
        return (
          <button
            key={letter}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(letter)}
            className={cn(
              "exam-option text-left",
              state === "selected" && "exam-option-selected",
              state === "correct" && "exam-option-correct",
              state === "wrong" && "exam-option-wrong",
              state === "dim" && "exam-option-dim",
            )}>
            <span className="exam-option-letter">{letter}</span>
            <span className="flex-1">{text}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div data-qid={question.id}>
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <span className="exam-q-num">No. {String(qNum).padStart(2, "0")}</span>
        <span className="exam-skill-tag">{question.knowledge_point}</span>
      </div>

      {question.stem && <p className="exam-stem mb-4">{question.stem}</p>}

      {question.type === "multiple_choice" && renderMcq(["A", "B", "C", "D"])}

      {question.type === "letter_choice" && question.options &&
        renderMcq(Object.keys(question.options).sort())}

      {question.type === "fill_blank" && (
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-md rounded-lg border border-[hsl(var(--exam-rule))] bg-[hsl(var(--exam-paper))] px-3 py-2 text-sm exam-stem focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          placeholder="填写答案…"
        />
      )}

      {question.type === "short_answer" && (
        <textarea
          value={value}
          disabled={disabled}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[hsl(var(--exam-rule))] bg-[hsl(var(--exam-paper))] px-3 py-2 text-sm exam-stem focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          placeholder="用英语回答…"
        />
      )}

      {question.type === "essay" && (
        <div>
          <textarea
            value={value}
            disabled={disabled}
            rows={12}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--exam-rule))] bg-[hsl(var(--exam-paper))] px-3 py-2 text-sm exam-stem focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            placeholder="Practice makes perfect…"
          />
          <p className="mt-1 text-xs exam-mute">
            <T>词数：</T>{value.trim() ? value.trim().split(/\s+/).length : 0}
          </p>
        </div>
      )}

      {showExplanation && (
        <ExplanationBlock
          question={question}
          userAnswer={value}
          isCorrect={isCorrect}
          pendingAi={pendingAi}
        />
      )}
    </div>
  );
}
