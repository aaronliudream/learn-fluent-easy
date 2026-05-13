import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, Sparkles, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

type Phase = "compose" | "grading" | "result" | "skipping";

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
    if (!canSubmit) return;
    setPhase("grading");
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
      if (error) throw error;
      if (!data || (data as { error?: string }).error) {
        throw new Error((data as { error?: string })?.error ?? "grading_failed");
      }
      setResult(data as GradeResponse);
      setPhase("result");
      await invalidate(undefined);
    } catch (e) {
      toast.error("批改失败:" + (e instanceof Error ? e.message : "未知错误"));
      setPhase("compose");
    }
  };

  const skip = () => {
    toast("跳过后无法回头补做,确认吗?", {
      action: {
        label: "确认跳过",
        onClick: async () => {
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
          onStartNext();
        },
      },
      duration: 6000,
    });
  };

  return (
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
            onSkip={skip}
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
  );
}

/* ---------- Compose view ---------- */

function ComposeView({
  sequenceNo, vocab, loadingVocab, picked, togglePick,
  sentence, setSentence, len, phase, canSubmit, onSubmit, onSkip,
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
}) {
  const grading = phase === "grading";
  const skipping = phase === "skipping";

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
            disabled={!canSubmit || grading || skipping}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {grading && <Loader2 className="size-4 animate-spin" />}
            提交并毕业
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
                d <= result.score
                  ? "bg-amber-400 border-amber-500"
                  : "bg-transparent border-muted-foreground/30",
              )}
              aria-label={d <= result.score ? "得分点" : "未得分"}
            />
          ))}
          <span className="ml-2 text-2xl font-extrabold">{result.score}<span className="text-sm font-normal text-muted-foreground">/5</span></span>
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
