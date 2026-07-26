/**
 * CohortMeaningSession — step ③「义」cohort 词级别中英互选。
 *
 * 每个 cohort 词出 2 题(en2cn + cn2en 交替),共 pool.length * 2 题。
 * 4 选 1,干扰项从同 cohort 其余词的 meaning_cn / word 抽取。
 *
 * 每题答完写 1 条 cohort_events { kind: 'en2cn'|'cn2en', source:'cohort' }。
 * Pool 必须是 cohort 切片,不会自己拉 allVocab,保证 step ③ 进度只在
 * cohort 词上推进。
 */
import { useEffect, useMemo, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { ArrowLeft, Check, X, RotateCw, Sparkles, Volume2 } from "lucide-react";
import { T } from "@/i18n/T";
import { speak } from "@/lib/speak";
import { recordCohortAttempt } from "@/lib/cohortProgress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CohortMeaningVocab {
  id: string;
  word: string;
  meaning_cn: string;
  accent: "UK" | "US" | "BOTH" | null;
}

type Question = {
  vocabId: string;
  kind: "en2cn" | "cn2en";
  prompt: string;
  correct: string;
  choices: string[];
  /** Original vocab — used for the 🔊 affordance on en2cn questions. */
  vocab: CohortMeaningVocab;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakWord(v: CohortMeaningVocab) {
  const text = v.word.split("/")[0];
  const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
  return speak(text, acc ? { accent: acc } : undefined);
}

function buildQuestions(pool: CohortMeaningVocab[]): Question[] {
  const out: Question[] = [];
  pool.forEach((v) => {
    const others = pool.filter((x) => x.id !== v.id);
    const enDistr = shuffle(others).slice(0, 3).map((x) => x.word);
    const cnDistr = shuffle(others).slice(0, 3).map((x) => x.meaning_cn);
    out.push({
      vocabId: v.id,
      kind: "en2cn",
      prompt: v.word,
      correct: v.meaning_cn,
      choices: shuffle([v.meaning_cn, ...cnDistr]),
      vocab: v,
    });
    out.push({
      vocabId: v.id,
      kind: "cn2en",
      prompt: v.meaning_cn,
      correct: v.word,
      choices: shuffle([v.word, ...enDistr]),
      vocab: v,
    });
  });
  return shuffle(out);
}

export default function CohortMeaningSession({
  pool,
  cohortId,
  cohortWordIds,
  onExit,
}: {
  pool: CohortMeaningVocab[];
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

  if (pool.length < 4) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <T>本批词数太少,无法生成 4 选 1 干扰项。</T>
        </p>
      </main>
    );
  }

  if (!q) {
    return null;
  }

  function pick(choice: string) {
    if (!q || picked !== null) return;
    setPicked(choice);
    const ok = choice === q.correct;
    if (ok) setCorrectCount((c) => c + 1);
    else setWrongCount((c) => c + 1);
    void recordCohortAttempt({
      vocabId: q.vocabId,
      kind: q.kind,
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
            <T>本轮中英互选完成</T>
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

      <div className="rounded-3xl border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 via-rose-50 to-amber-50 p-6 shadow-sm dark:from-fuchsia-950/30 dark:via-rose-950/20 dark:to-amber-950/20 dark:border-fuchsia-700/40">
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-600 dark:text-fuchsia-400">
            <T>步骤 ③「义」</T> · {q.kind === "en2cn" ? <T>英 → 中</T> : <T>中 → 英</T>}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <p className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              {q.prompt}
            </p>
            {q.kind === "en2cn" && (
              <button
                type="button"
                onClick={() => speakWord(q.vocab)}
                className="inline-flex size-9 items-center justify-center rounded-full bg-fuchsia-500 text-white shadow-md transition hover:scale-105 active:scale-95"
                aria-label="播放发音"
              >
                <Volume2 className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2">
          {q.choices.map((c) => {
            const isCorrect = c === q.correct;
            const isPicked = picked === c;
            const showState = picked !== null;
            return (
              <button
                key={c}
                onClick={() => pick(c)}
                disabled={picked !== null}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-left text-base font-bold shadow-sm transition active:scale-[0.99]",
                  !showState && "border-border bg-card hover:border-fuchsia-500 hover:bg-fuchsia-500/5",
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
          <div ref={actionRef} className="mt-5 flex justify-end">
            <Button onClick={next} className="bg-fuchsia-500 hover:bg-fuchsia-600">
              {idx + 1 >= total ? <T>完成</T> : <T>下一题</T>}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
