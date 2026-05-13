/**
 * CohortDictationSession — step ②「形」cohort 词级别听音拼写。
 *
 * 区别于句子听写 (DictationSession):此组件每题播放一个 cohort 词的发音,
 * 用户拼写出该单词。答对时写 2 条 cohort_events:
 *   kind='listen' (听对了)+ kind='spell' (拼对了),source='cohort'。
 * 答错只播放正确答案,不写事件,避免污染 cohort 进度。
 *
 * Pool 必须是 cohort 切片(由调用方传入),组件不会自己拉 allVocab,从而
 * 保证 step ② 的进度只在 cohort 词上推进。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Volume2, Check, X, RotateCw, Sparkles } from "lucide-react";
import { T } from "@/i18n/T";
import { speak } from "@/lib/speak";
import { recordCohortAttempt } from "@/lib/cohortProgress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CohortDictationVocab {
  id: string;
  word: string;
  meaning_cn: string;
  phonetic: string | null;
  accent: "UK" | "US" | "BOTH" | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakWord(v: CohortDictationVocab) {
  const text = v.word.split("/")[0];
  const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
  return speak(text, acc ? { accent: acc } : undefined);
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function CohortDictationSession({
  pool,
  cohortId,
  cohortWordIds,
  onExit,
}: {
  pool: CohortDictationVocab[];
  cohortId: string;
  cohortWordIds: string[];
  onExit: () => void;
}) {
  const items = useMemo(() => shuffle(pool), [pool]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = items[idx];
  const total = items.length;

  // Auto play & focus on each new item.
  useEffect(() => {
    if (!current || done) return;
    setInput("");
    setRevealed(false);
    setLastResult(null);
    const t = setTimeout(() => {
      void speakWord(current);
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(t);
  }, [idx, current, done]);

  if (!current) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <T>本批没有可用于听写的单词。</T>
        </p>
      </main>
    );
  }

  async function submit() {
    if (!current || revealed) return;
    const ok = normalize(input) === normalize(current.word);
    setRevealed(true);
    setLastResult(ok ? "correct" : "wrong");
    if (ok) {
      setCorrectCount((c) => c + 1);
      // 答对 → 写 listen + spell 两条 cohort_events
      void recordCohortAttempt({
        vocabId: current.id,
        kind: "listen",
        isCorrect: true,
        source: "cohort",
        cohortId,
        cohortWordIds,
      });
      void recordCohortAttempt({
        vocabId: current.id,
        kind: "spell",
        isCorrect: true,
        source: "cohort",
        cohortId,
        cohortWordIds,
      });
    } else {
      setWrongCount((c) => c + 1);
      // 答错 → 写一条 spell=false,记录尝试但不计 step ② 进度
      void recordCohortAttempt({
        vocabId: current.id,
        kind: "spell",
        isCorrect: false,
        source: "cohort",
        cohortId,
        cohortWordIds,
      });
    }
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
            <T>本轮听写完成</T>
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

      <div className="rounded-3xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 via-amber-50 to-yellow-50 p-6 shadow-sm dark:from-rose-950/30 dark:via-amber-950/20 dark:to-yellow-950/20 dark:border-rose-700/40">
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            <T>步骤 ②「形」· 听音拼写</T>
          </div>
          <button
            type="button"
            onClick={() => speakWord(current)}
            className="mx-auto mt-4 inline-flex size-20 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition hover:scale-105 active:scale-95"
            aria-label="播放发音"
          >
            <Volume2 className="size-9" />
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            <T>点击播放·拼出你听到的单词</T>
          </p>
        </div>

        <div className="mt-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={revealed}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (revealed) next();
                else submit();
              }
            }}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="type the word…"
            className={cn(
              "w-full rounded-2xl border-2 bg-background px-4 py-3 text-center text-xl font-mono tracking-wide outline-none transition",
              revealed && lastResult === "correct" && "border-emerald-500 text-emerald-700 dark:text-emerald-300",
              revealed && lastResult === "wrong" && "border-rose-500 text-rose-700 dark:text-rose-300",
              !revealed && "border-rose-300 focus:border-rose-500",
            )}
          />

          {revealed && (
            <div
              className={cn(
                "mt-3 rounded-xl px-3 py-2 text-center text-sm",
                lastResult === "correct"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
              )}
            >
              {lastResult === "correct" ? (
                <span className="inline-flex items-center gap-1 font-bold">
                  <Check className="size-4" /> {current.word}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 font-bold">
                  <X className="size-4" /> {current.word}
                  {current.phonetic && <span className="ml-1 text-xs opacity-70">{current.phonetic}</span>}
                </span>
              )}
              <div className="mt-1 text-xs opacity-80">{current.meaning_cn}</div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {!revealed ? (
            <Button onClick={submit} disabled={!input.trim()} className="bg-rose-500 hover:bg-rose-600">
              <T>提交</T>
            </Button>
          ) : (
            <Button onClick={next} className="bg-rose-500 hover:bg-rose-600">
              {idx + 1 >= total ? <T>完成</T> : <T>下一题</T>}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}