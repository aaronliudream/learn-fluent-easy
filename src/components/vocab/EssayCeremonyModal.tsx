import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, Sparkles, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useInvalidateCohortRelated } from "@/hooks/useActiveCohort";

/**
 * EssayCeremonyModal — P2.1 step 3 graduation ceremony UI.
 *
 * Lets the learner pick ≥1 cohort target word(s), write a 10–200 char English
 * sentence, and submit to `grade-cohort-essay` for a 1–5 score + targeted
 * strength/refinement feedback (cohort flips to graduated atomically RPC-side).
 * Skip path uses the `graduate_cohort_without_essay` RPC with a confirm toast.
 */

interface VocabRow {
  id: string;
  word: string;
  primary_gloss: string;
}

interface GradeResponse {
  strength: string;
  refinement: string;
  score: number;
  essay_id: string;
  graduated: true;
}

type Phase = "compose" | "grading" | "result" | "skipping" | "grade_error";

interface GradeError {
  status: number;
  message: string;
}

interface Props {
  cohortId: string;
  sequenceNo: number;
  cohortWordIds: string[];
  onClose: () => void;
  onStartNext: () => void;
}

export default function EssayCeremonyModal({
  cohortId,
  sequenceNo,
  cohortWordIds,
  onClose,
  onStartNext,
}: Props) {
  const qc = useQueryClient();
  const invalidate = useInvalidateCohortRelated();

  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [loadingVocab, setLoadingVocab] = useState(true);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [sentence, setSentence] = useState("");
  const [phase, setPhase] = useState<Phase>("compose");
  const [result, setResult] = useState<GradeResponse | null>(null);
  const [gradeError, setGradeError] = useState<GradeError | null>(null);
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("gaokao_vocab")
        .select("id, word, primary_gloss")
        .in("id", cohortWordIds);
      if (!alive) return;
      if (error) {
        toast.error("加载本批词汇失败,请关掉重试");
      } else {
        // preserve cohort order
        const map = new Map((data ?? []).map((r) => [r.id, r as VocabRow]));
        setVocab(cohortWordIds.map((id) => map.get(id)).filter(Boolean) as VocabRow[]);
      }
      setLoadingVocab(false);
    })();
    return () => {
      alive = false;
    };
  }, [cohortWordIds]);

  const len = sentence.trim().length;
  const canSubmit = picked.size >= 1 && len >= 10 && len <= 200 && phase === "compose";

  const togglePick = (id: string) => {
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const submit = async () => {
    if (!canSubmit && phase !== "grade_error") return;
    setPhase("grading");
    setGradeError(null);
    try {
      const { data, error } = await supabase.functions.invoke<GradeResponse | { error: string }>(
        "grade-cohort-essay",
        {
          body: {
            cohort_id: cohortId,
            sentence: sentence.trim(),
            words_used: Array.from(picked),
          },
        },
      );
      if (error) {
        // FunctionsHttpError carries the underlying Response on `context`.
        const ctx = (error as { context?: Response }).context;
        const status = ctx?.status ?? 0;
        const rawMsg = (error as Error).message ?? "grading_failed";
        handleGradeFailure(status, rawMsg);
        return;
      }
      if (!data || (data as { error?: string }).error) {
        handleGradeFailure(500, (data as { error?: string })?.error ?? "grading_failed");
        return;
      }
      setResult(data as GradeResponse);
      setPhase("result");
      await invalidate(undefined);
    } catch (e) {
      handleGradeFailure(0, e instanceof Error ? e.message : "unknown");
    }
  };

  const handleGradeFailure = (status: number, message: string) => {
    let toastMsg: string;
    if (status === 401 || status === 403) {
      toastMsg = "登录状态异常,请刷新页面";
    } else if (status === 502) {
      toastMsg = "AI 评分服务繁忙,可以重试或选择跳过仪式直接毕业";
    } else if (status === 500) {
      toastMsg = "保存失败,请重试";
    } else {
      toastMsg = "未知错误,请截图反馈";
    }
    toast.error(toastMsg);
    setGradeError({ status, message });
    setPhase("grade_error");
  };

  const askSkip = () => setConfirmSkipOpen(true);

  const confirmSkip = async () => {
    setConfirmSkipOpen(false);
    setPhase("skipping");
    const { error } = await supabase.rpc("graduate_cohort_without_essay", {
      p_cohort_id: cohortId,
    });
    if (error) {
      toast.error("跳过失败:" + error.message);
      setPhase("compose");
      return;
    }
    await invalidate(undefined);
    await qc.invalidateQueries({ queryKey: ["cohort", "active", "self"] });
    await qc.invalidateQueries({ queryKey: ["cohort", "list", "self"] });
    toast.success(`第 ${sequenceNo} 批已毕业`);
    onClose();
    onStartNext();
  };

  return (
    <>
    <Dialog open onOpenChange={(o) => !o && phase !== "grading" && phase !== "skipping" && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {phase !== "result" ? (
          <ComposeView
            sequenceNo={sequenceNo}
            vocab={vocab}
            loadingVocab={loadingVocab}
            picked={picked}
            togglePick={togglePick}
            sentence={sentence}
            setSentence={setSentence}
            len={len}
            phase={phase}
            canSubmit={canSubmit}
            onSubmit={submit}
            onSkip={askSkip}
            gradeError={gradeError}
          />
        ) : (
          <ResultView
            sequenceNo={sequenceNo}
            result={result!}
            onStartNext={async () => {
              await qc.invalidateQueries({ queryKey: ["cohort", "active", "self"] });
              await qc.invalidateQueries({ queryKey: ["cohort", "list", "self"] });
              onStartNext();
            }}
            onHome={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
    <AlertDialog open={confirmSkipOpen} onOpenChange={setConfirmSkipOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定跳过毕业仪式?</AlertDialogTitle>
          <AlertDialogDescription>
            跳过后第 {sequenceNo} 批将被标记为未完成造句,且无法补做。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={confirmSkip}>确认跳过</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

/* ---------- Compose view ---------- */

function ComposeView({
  sequenceNo, vocab, loadingVocab, picked, togglePick,
  sentence, setSentence, len, phase, canSubmit, onSubmit, onSkip, gradeError,
}: {
  sequenceNo: number;
  vocab: VocabRow[];
  loadingVocab: boolean;
  picked: Set<string>;
  togglePick: (id: string) => void;
  sentence: string;
  setSentence: (s: string) => void;
  len: number;
  phase: Phase;
  canSubmit: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  gradeError: GradeError | null;
}) {
  const grading = phase === "grading";
  const skipping = phase === "skipping";
  const errored = phase === "grade_error" && gradeError !== null;
  const canRetry = errored && (gradeError!.status === 502 || gradeError!.status === 500);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">🎓 第 {sequenceNo} 批毕业仪式</DialogTitle>
        <DialogDescription>
          用本批的 1 个或多个词,写 1 个英文句子。建议 3 个左右,在意你真的用过。
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">本批 10 词</span>
            <span className="text-muted-foreground">已选 {picked.size} 个</span>
          </div>
          {loadingVocab ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              加载中
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {vocab.map((v) => {
                const on = picked.has(v.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => togglePick(v.id)}
                    disabled={grading || skipping}
                    aria-pressed={on}
                    className={cn(
                      "rounded-lg border-2 p-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                      on
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold truncate">{v.word}</span>
                      {on && <Check className="size-3.5 shrink-0 text-primary" />}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">
                      {v.primary_gloss}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="essay-sentence" className="mb-1 block text-sm font-semibold">
            写 1 个英文句子
          </label>
          <textarea
            id="essay-sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value.slice(0, 200))}
            disabled={grading || skipping}
            placeholder="In English. 10–200 字符。"
            rows={3}
            className={cn(
              "w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm",
              "focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={cn(
              len > 0 && len < 10 && "text-destructive",
              len > 200 && "text-destructive",
              len >= 10 && len <= 200 && "text-muted-foreground",
              len === 0 && "text-muted-foreground",
            )}>
              {len}/200{len > 0 && len < 10 ? " · 还差 " + (10 - len) + " 字符" : ""}
            </span>
          </div>
        </div>

        {grading && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            老师在认真看你的句子...
          </div>
        )}
        {errored && (
          <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-4" />
              评分失败({gradeError!.status || "?"})
            </div>
            <div className="mt-0.5 text-xs opacity-80 break-all">{gradeError!.message}</div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between pt-2">
          <button
            type="button"
            onClick={onSkip}
            disabled={grading || skipping}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-border px-4 py-2 text-sm font-semibold",
              "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {skipping && <Loader2 className="size-4 animate-spin" />}
            <AlertTriangle className="size-4" />
            跳过仪式直接毕业
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={(!canSubmit && !canRetry) || grading || skipping}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {grading && <Loader2 className="size-4 animate-spin" />}
            {canRetry ? "重试" : "提交并毕业"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- Result view ---------- */

function ResultView({
  sequenceNo, result, onStartNext, onHome,
}: {
  sequenceNo: number;
  result: GradeResponse;
  onStartNext: () => void;
  onHome: () => void;
}) {
  const dots = useMemo(() => [1, 2, 3, 4, 5], []);
  const score = result.score;
  const tone =
    score <= 2
      ? { fill: "bg-red-400", border: "border-red-500" }
      : score === 3
        ? { fill: "bg-amber-400", border: "border-amber-500" }
        : { fill: "bg-emerald-400", border: "border-emerald-500" };
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          <Sparkles className="size-5 text-amber-500" />
          老师批改完了
        </DialogTitle>
        <DialogDescription>
          第 {sequenceNo} 批的句子分数与点评如下。
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 py-3">
          {dots.map((d) => (
            <div
              key={d}
              className={cn(
                "size-7 rounded-full border-2 transition-colors",
                d <= score
                  ? cn(tone.fill, tone.border)
                  : "bg-transparent border-muted-foreground/30",
              )}
              aria-label={d <= score ? "得分点" : "未得分"}
            />
          ))}
          <span className="ml-2 text-2xl font-extrabold">{score}<span className="text-sm font-normal text-muted-foreground">/5</span></span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700 p-3">
            <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              做得好的地方
            </div>
            <div className="text-sm leading-relaxed text-foreground">{result.strength}</div>
          </div>
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-3">
            <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              可以更好的地方
            </div>
            <div className="text-sm leading-relaxed text-foreground">{result.refinement}</div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between pt-2">
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center justify-center rounded-lg border-2 border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            回主页
          </button>
          <button
            type="button"
            onClick={onStartNext}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            🎓 第 {sequenceNo} 批毕业 → 开始第 {sequenceNo + 1} 批
          </button>
        </div>
      </div>
    </>
  );
}
