import { T } from "@/i18n/T"; /**
 * ReviewPool — surfaces words whose FSRS due_at has passed.
 * Renders as a top-of-page card with a count + "复习 N 词" button.
 */
import { useEffect, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { fetchDueReviewIds } from "@/lib/vocabMastery";
import { cn } from "@/lib/utils";

interface Vocab {
  id: string;
  word: string;
}

interface Props {
  /** All vocab in the current scope (page / unit). */
  pool: Vocab[];
  /** Called with the subset of pool that's due now. */
  onStart: (dueWords: Vocab[]) => void;
}

export default function ReviewPool({ pool, onStart }: Props) {
  const [dueIds, setDueIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const ids = await fetchDueReviewIds(pool.map((p) => p.id));
      if (!cancel) setDueIds(new Set(ids));
    })();
    return () => {cancel = true;};
  }, [pool]);

  if (dueIds === null) {
    return (
      <div className="rounded-2xl border border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground">
        <T>正在统计今天到期的词…</T>
      </div>);

  }
  if (dueIds.size === 0) return null;
  const due = pool.filter((p) => dueIds.has(p.id));

  return (
    <button
      onClick={() => onStart(due)}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-left transition hover:bg-amber-100",
        "dark:border-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-900/40"
      )}>
      
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-200">
          <Clock className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
            <T>今天有</T> {due.length} <T>个词到了复习时间</T>
          </p>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
            <T>按遗忘曲线安排 · 现在复习能记得最久</T>
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition group-hover:bg-amber-700">
        <T>立即复习</T> <Sparkles className="size-3.5" />
      </span>
    </button>);

}