/**
 * CohortClozeSession — step ④「用」cohort 词级别完形填空。
 *
 * 每个 cohort 词出 1 题(过滤掉没有 example_en 或例句不含该词的)。
 * 题面把例句里的 cohort 词替换成 ____,4 选 1(正确词 + 同 cohort 3 干扰)。
 * 干扰项来自同 cohort 其它词,理想情况按 POS 过滤,但 POS 数据不全时
 * 接受偶尔出现「明显不通」的干扰项 — 先用,后补。
 *
 * 每题答完写 1 条 cohort_events { kind:'cloze', source:'cohort' }。
 */
import { useEffect, useMemo, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { ArrowLeft, Check, X, RotateCw, Sparkles } from "lucide-react";
import { T } from "@/i18n/T";
import { recordCohortAttempt } from "@/lib/cohortProgress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CohortClozeVocab {
  id: string;
  word: string;
  pos: string | null;
  meaning_cn: string;
  example_en: string | null;
  example_cn: string | null;
}

type Question = {
  vocabId: string;
  word: string;
  meaning_cn: string;
  example_cn: string | null;
  blanked: string;
  choices: string[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Replace whole-word occurrence(s) of `word` (and simple inflections) with ____.
 * Case-insensitive. If no match found, returns null so caller can drop the item.
 */
function blank(sentence: string, word: string): string | null {
  const head = word.split("/")[0];
  // Match the bare word + simple inflections (s/es/ed/ing/ies/ied), word-bounded.
  const re = new RegExp(
    `\\b${head.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(s|es|ed|ing|ies|ied)?\\b`,
    "ig",
  );
  if (!re.test(sentence)) return null;
  return sentence.replace(re, "____");
}

function buildQuestions(pool: CohortClozeVocab[]): Question[] {
  const out: Question[] = [];
  pool.forEach((v) => {
    if (!v.example_en) return;
    const blanked = blank(v.example_en, v.word);
    if (!blanked) return;
    const sameP = v.pos
      ? pool.filter((x) => x.id !== v.id && x.pos && x.pos === v.pos)
      : [];
    const fallback = pool.filter((x) => x.id !== v.id);
    const distractorPool = sameP.length >= 3 ? sameP : fallback;
    const distractors = shuffle(distractorPool).slice(0, 3).map((x) => x.word.split("/")[0]);
    if (distractors.length < 3) return;
    out.push({
      vocabId: v.id,
      word: v.word.split("/")[0],
      meaning_cn: v.meaning_cn,
      example_cn: v.example_cn,
      blanked,
      choices: shuffle([v.word.split("/")[0], ...distractors]),
    });
  });
  return shuffle(out);
}

export default function CohortClozeSession({
  pool,
  cohortId,
  cohortWordIds,
  onExit,
}: {
  pool: CohortClozeVocab[];
  cohortId: string;
  cohortWordIds: string[];
  onExit: () => void;
}) {
  const questions = useMemo(() => buildQuestions(pool), [pool]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // 选完答案后把操作区滚进视口(手机上它常在选项下方屏外)
  const actionRef = useRevealScroll<HTMLDivElement>(picked !== null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const total = questions.length;

  useEffect(() => {
    setPicked(null);
  }, [idx]);

  if (questions.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <T>本批词暂无可用例句,无法生成完形题。</T>
        </p>
      </main>
    );
  }

  if (!q) return null;

  function pick(choice: string) {
    if (!q || picked !== null) return;
    setPicked(choice);
    const ok = choice.toLowerCase() === q.word.toLowerCase();
    if (ok) setCorrectCount((c) => c + 1);
    else setWrongCount((c) => c + 1);
    void recordCohortAttempt({
      vocabId: q.vocabId,
      kind: "cloze",
      isCorrect: ok,
      source: "cohort",
      cohortId,
      cohortWordIds,
    });
  }

  function next() {
    if (idx + 1 >= total) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
  }

  function restart() {
    setIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setWrongCount(0);
    setDone(false);
  }

  if (done) {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 p-8 text-center shadow-md dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-sky-950/20 dark:border-emerald-600">
          <Sparkles className="mx-auto size-10 text-emerald-500" />
          <h2 className="mt-3 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
            <T>本轮完形完成</T>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <T>正确</T> {correctCount} / {total} · {pct}%
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="outline" onClick={restart}>
              <RotateCw className="mr-1 size-4" /> <T>再来一轮</T>
            </Button>
            <Button onClick={onExit}>
              <T>返回 5 步走</T>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <div className="text-xs font-bold text-muted-foreground">
          {idx + 1} / {total} · ✅ {correctCount} · ❌ {wrongCount}
        </div>
      </div>

      <div className="rounded-3xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 p-6 shadow-sm dark:from-sky-950/30 dark:via-cyan-950/20 dark:to-emerald-950/20 dark:border-sky-700/40">
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            <T>步骤 ④「用」· 完形填空</T>
          </div>
        </div>

        <p className="mt-5 text-lg leading-relaxed text-foreground md:text-xl">
          {q.blanked}
        </p>
        {q.example_cn && (
          <p className="mt-2 text-sm text-muted-foreground">{q.example_cn}</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2">
          {q.choices.map((c) => {
            const isCorrect = c.toLowerCase() === q.word.toLowerCase();
            const isPicked = picked === c;
            const showState = picked !== null;
            return (
              <button
                key={c}
                onClick={() => pick(c)}
                disabled={picked !== null}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-center text-base font-bold shadow-sm transition active:scale-[0.99]",
                  !showState && "border-border bg-card hover:border-sky-500 hover:bg-sky-500/5",
                  showState && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                  showState && !isCorrect && isPicked && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                  showState && !isCorrect && !isPicked && "border-border bg-card opacity-60",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {showState && isCorrect && <Check className="size-4" />}
                  {showState && !isCorrect && isPicked && <X className="size-4" />}
                  <span>{c}</span>
                </span>
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-5 rounded-xl bg-background/60 px-3 py-2 text-sm">
            <span className="font-bold">{q.word}</span>
            <span className="ml-2 text-muted-foreground">{q.meaning_cn}</span>
          </div>
        )}

        {picked !== null && (
          <div ref={actionRef} className="mt-3 flex justify-end">
            <Button onClick={next} className="bg-sky-500 hover:bg-sky-600">
              {idx + 1 >= total ? <T>完成</T> : <T>下一题</T>}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
