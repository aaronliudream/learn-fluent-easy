import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { T } from "@/i18n/T";
import { useToast } from "@/hooks/use-toast";

/**
 * CohortIntakeModal — pick 10 words, self-rate them, validate "认识" with a
 * 5-second reverse quiz (en→primary_gloss 4-choice), then atomically seed
 * mastery + start the cohort via `init_cohort_with_self_rate`.
 *
 * Hypercorrection: words rated "认识" but answered wrong on the reverse quiz
 * are downgraded to "模糊" AND flagged hypercorrection=true, so their first
 * FSRS review interval gets halved (handled in the fsrs_due path).
 */

type Rating = "know" | "fuzzy" | "unknown" | null;

interface PickedWord {
  id: string;
  word: string;
  primary_gloss: string;
}

const COHORT_SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function CohortIntakeModal({
  vocabIds,
  onClose,
  stage = "gaokao",
}: {
  vocabIds: string[];
  onClose: () => void;
  stage?: "gaokao" | "junior";
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [picked, setPicked] = useState<PickedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ratings + hypercorrection per word index
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [hyperFlags, setHyperFlags] = useState<boolean[]>([]);

  // reverse-quiz state
  const [quizFor, setQuizFor] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      // Pick 10 words from the provided pool that the user hasn't deeply
      // touched yet. Simple random for P0 — theme-clustered selection is P2.
      const pool = shuffle(vocabIds).slice(0, Math.min(50, vocabIds.length));
      if (pool.length < COHORT_SIZE) {
        toast({ title: "词库不足", description: "至少需要 10 个词才能开始一批", variant: "destructive" });
        onClose();
        return;
      }
      const isJunior = stage === "junior";
      const { data, error } = await supabase
        .from(isJunior ? "junior_vocab" : "gaokao_vocab")
        .select(isJunior ? "id, word, meaning_cn" : "id, word, primary_gloss")
        .in("id", pool)
        .limit(COHORT_SIZE);
      if (error || !data || data.length < COHORT_SIZE) {
        console.error("[CohortIntakeModal] load failed", { error, dataLen: data?.length, stage, poolLen: pool.length });
        toast({ title: "加载失败", description: error?.message ?? `返回 ${data?.length ?? 0} 词（需 ${COHORT_SIZE}）`, variant: "destructive" });
        onClose();
        return;
      }
      const words = (data as any[]).slice(0, COHORT_SIZE).map((d) => ({
        id: d.id,
        word: d.word,
        primary_gloss: isJunior ? d.meaning_cn : d.primary_gloss,
      })) as PickedWord[];
      setPicked(words);
      setRatings(Array(words.length).fill(null));
      setHyperFlags(Array(words.length).fill(false));
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allRated = useMemo(() => ratings.every((r) => r !== null), [ratings]);

  function handleRate(idx: number, r: Rating) {
    if (r === "know") {
      // Trigger reverse-quiz BEFORE locking in the rating.
      setQuizFor(idx);
      return;
    }
    setRatings((prev) => prev.map((v, i) => (i === idx ? r : v)));
  }

  function handleQuizResult(idx: number, correct: boolean) {
    setRatings((prev) =>
      prev.map((v, i) => (i === idx ? (correct ? "know" : "fuzzy") : v)),
    );
    if (!correct) {
      // Hypercorrection: high-confidence wrong → flag for halved first review.
      setHyperFlags((prev) => prev.map((v, i) => (i === idx ? true : v)));
    }
    setQuizFor(null);
  }

  async function handleStart() {
    if (!allRated || submitting) return;
    setSubmitting(true);
    try {
      // Seed payload: build initial matrix per rating.
      // know  → matrix.en2cn=2, level 2
      // fuzzy → matrix.en2cn=1, level 1
      // unknown → empty
      const seeds = picked.map((w, i) => {
        const r = ratings[i];
        const matrix =
          r === "know" ? { en2cn: 2 } :
          r === "fuzzy" ? { en2cn: 1 } :
          {};
        const level = r === "know" ? 2 : r === "fuzzy" ? 1 : 0;
        return {
          vocab_id: w.id,
          matrix,
          level,
          hypercorrection: hyperFlags[i],
        };
      });

      const { error } = await supabase.rpc("init_cohort_with_self_rate", {
        p_word_ids: picked.map((w) => w.id),
        p_seeds: seeds as any,
        p_theme_tag: null,
      });
      if (error) throw error;

      toast({ title: "🚀 新批次开启", description: `${COHORT_SIZE} 词已锁定,开始 5 步走` });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cohort", "active", "self"] }),
        qc.invalidateQueries({ queryKey: ["cohort", "list", "self"] }),
      ]);
      onClose();
    } catch (e: any) {
      toast({ title: "开启失败", description: e?.message ?? "请稍后重试", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-amber-300 bg-background p-5 shadow-2xl dark:border-amber-700/40">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="关闭"
        >
          <X className="size-4" />
        </button>

        <h3 className="text-lg font-extrabold bg-gradient-to-r from-amber-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
          🚀 <T>开启今天这一批 (10 词)</T>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          <T>勾你已经熟悉的词，可以跳过认词阶段直奔练习</T>
        </p>


        {loading ? (
          <div className="my-10 flex justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : quizFor !== null ? (
          <ReverseQuiz
            target={picked[quizFor]}
            distractors={picked.filter((_, i) => i !== quizFor).map((w) => w.primary_gloss)}
            onResult={(c) => handleQuizResult(quizFor, c)}
            onSkip={() => {
              // user dismissed → treat as fuzzy (no hypercorrection)
              handleQuizResult(quizFor, false);
              setHyperFlags((prev) => prev.map((v, i) => (i === quizFor ? false : v)));
            }}
          />
        ) : (
          <>
            <ul className="mt-4 space-y-2">
              {picked.map((w, i) => (
                <li key={w.id} className="flex items-center gap-2 rounded-xl border bg-card p-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground truncate">{w.word}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {ratings[i] === "know" ? "✓ 认识" : ratings[i] === "fuzzy" ? "～ 模糊" : ratings[i] === "unknown" ? "✗ 不会" : "—"}
                      {hyperFlags[i] && <span className="ml-1 text-amber-600">· 高自信修正</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(["know", "fuzzy", "unknown"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRate(i, r)}
                        className={cn(
                          "rounded-lg px-2 py-1 text-[11px] font-bold border transition",
                          ratings[i] === r
                            ? r === "know"
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : r === "fuzzy"
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-rose-500 bg-rose-500 text-white"
                            : "border-border bg-background hover:bg-muted",
                        )}
                      >
                        {r === "know" ? "认识" : r === "fuzzy" ? "模糊" : "不会"}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={!allRated || submitting}
              onClick={handleStart}
              className={cn(
                "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition",
                allRated && !submitting
                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 hover:-translate-y-0.5"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              <T>开始这一批</T>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Reverse quiz (en → primary_gloss 4-choice) ---------- */

function ReverseQuiz({
  target,
  distractors,
  onResult,
  onSkip,
}: {
  target: PickedWord;
  distractors: string[];
  onResult: (correct: boolean) => void;
  onSkip: () => void;
}) {
  const options = useMemo(() => {
    const pool = shuffle(distractors).slice(0, 3);
    return shuffle([target.primary_gloss, ...pool]);
  }, [target.primary_gloss, distractors]);

  return (
    <div className="mt-4 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950/30 dark:border-amber-700">
      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        <T>5 秒小测 · 你确定认识吗?</T>
      </div>
      <div className="mt-1 text-2xl font-extrabold text-foreground">{target.word}</div>
      <div className="mt-3 grid gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onResult(opt === target.primary_gloss)}
            className="rounded-xl border bg-background px-3 py-2 text-left text-sm font-bold text-foreground hover:border-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full text-center text-[11px] text-muted-foreground hover:text-foreground"
      >
        <T>跳过 (按模糊处理)</T>
      </button>
    </div>
  );
}