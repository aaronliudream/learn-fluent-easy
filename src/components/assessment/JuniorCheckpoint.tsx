/**
 * 语法考点单元 Checkpoint：学完一个考点后 3 道 AI 小测。
 */
import { useState } from "react";
import { Loader2, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  generateJuniorAssessment,
  type JuniorAssessmentQuestion,
} from "@/lib/juniorStageAssessment";
import { MistakeLoop } from "@/components/assessment/MistakeLoop";
import { T } from "@/i18n/T";

export function JuniorCheckpoint({
  pointId,
  pointTitle,
  grade,
  onDone,
}: {
  pointId: string;
  pointTitle: string;
  grade: number;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<JuniorAssessmentQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState<JuniorAssessmentQuestion | null>(null);
  const [finished, setFinished] = useState(false);

  const g = grade >= 7 ? grade - 6 : grade;
  const q = questions[idx];

  async function start() {
    setOpen(true);
    setLoading(true);
    setIdx(0);
    setPicked(null);
    setCorrect(0);
    setWrong(null);
    setFinished(false);
    try {
      const qs = await generateJuniorAssessment({
        grade: g,
        module: "grammar",
        questionCount: 3,
        scope: "checkpoint",
        checkpointPointId: pointId,
      });
      setQuestions(qs);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "出题失败");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function pick(letter: string) {
    if (!q || picked) return;
    setPicked(letter);
    const ok = letter === q.correct;
    if (ok) setCorrect((c) => c + 1);
    else setWrong(q);
    setTimeout(() => {
      if (!ok) return;
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        setFinished(true);
        onDone?.();
      }
    }, 800);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={start}
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-extrabold text-white shadow"
      >
        <Sparkles className="size-4" />
        <T>单元小测（AI 3 题）</T>
      </button>
    );
  }

  if (wrong) {
    return (
      <div className="mt-4 text-left">
        <MistakeLoop
          wrong={wrong}
          moduleLabel={pointTitle}
          onMastered={() => {
            setWrong(null);
            setPicked(null);
            if (idx + 1 < questions.length) {
              setIdx(idx + 1);
            } else {
              setFinished(true);
              onDone?.();
            }
          }}
          onSkip={() => {
            setWrong(null);
            setPicked(null);
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <T>AI 出题中…</T>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
        <p className="font-extrabold text-emerald-800 dark:text-emerald-300">
          <T>单元小测完成！</T> {correct}/{questions.length}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 text-xs font-bold text-emerald-700 underline"
        >
          <T>关闭</T>
        </button>
      </div>
    );
  }

  if (!q) return null;

  const opts = q.options
    ? (["A", "B", "C", "D"] as const).map((k) => ({ k, text: q.options![k] }))
    : [];

  return (
    <div className="mt-4 rounded-2xl border-2 border-violet-300 bg-violet-50/50 p-4 text-left dark:bg-violet-950/20">
      <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-3">
        <T>单元小测</T> {idx + 1}/{questions.length} · {pointTitle}
      </p>
      {q.stem && <p className="text-sm font-semibold mb-3">{q.stem}</p>}
      <ul className="space-y-2 list-none p-0">
        {opts.map(({ k, text }) => (
          <li key={k}>
            <button
              type="button"
              disabled={!!picked}
              onClick={() => pick(k)}
              className={cn(
                "w-full rounded-xl border px-3 py-2 text-left text-sm font-medium",
                picked === k && k === q.correct && "border-emerald-500 bg-emerald-50",
                picked === k && k !== q.correct && "border-rose-500 bg-rose-50",
              )}
            >
              {k}. {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
