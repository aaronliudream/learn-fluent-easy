import { T } from "@/i18n/T"; /**
 * GuidedSession — 5-step guided vocab progression for gaokao & junior.
 *
 * Given a pool of words, walks the user through a session that picks the
 * weakest word + step every turn, records the result via bumpVocabMastery,
 * and finishes when every word has reached step 5 (DONE) — or when the
 * user hits the per-session cap.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Trophy, Volume2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak, speakKid, stopSpeaking, prefetchTTSBatch, prefetchTTSBatchKid } from "@/lib/speak";
import { recordCohortAttempt, pickPracticeSource } from "@/lib/cohortProgress";
import { useCohortAttemptContext } from "@/hooks/useActiveCohort";
import { awardCoins } from "@/lib/coins";
import {
  fetchMasteryMap,
  stepFromMatrix,
  STEP_KIND,
  STEP_LABEL,
  type GuideStep } from
"@/lib/vocabMastery";
import type { MasteryMatrix } from "@/lib/masteryScore";
import { juniorKindFromQuizKind, recordJuniorWordMastery } from "@/lib/juniorWordMastery";
import { canonSpelling } from "@/lib/spellingVariants";

export interface GuidedVocab {
  id: string;
  word: string;
  phonetic?: string | null;
  pos?: string | null;
  meaning_cn: string;
  meaning_en?: string | null;
  example_en?: string | null;
  example_cn?: string | null;
}

interface Props {
  pool: GuidedVocab[];
  onExit: () => void;
  /** Default 8 words per session — keeps the loop short and rewarding. */
  sessionSize?: number;
  title?: string;
  /**
   * "review" mode: skip flashcard step, mix step types randomly across the
   * cards. Used by the FSRS review pool so users get tested, not re-taught.
   */
  mode?: "learn" | "review";
  /** When set with trackJuniorMastery, also writes junior_word_mastery (JuniorVocab hub / SRS). */
  grade?: number;
  trackJuniorMastery?: boolean;
  /** ★铁律★ 高中复用路径设 true → 跳过 recordCohortAttempt(写 gaokao_user_mastery),只写 junior_word_mastery。 */
  suppressGaokao?: boolean;
}

interface CardState {
  v: GuidedVocab;
  matrix: MasteryMatrix;
  step: GuideStep;
  /** This-session correct answers (for end-of-round summary). */
  correctThisSession: number;
  /** This-session wrong answers. */
  wrongThisSession: number;
}

/* ─────────────── helpers ─────────────── */
function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function pickDistractors<T extends {id: string;}>(pool: T[], excludeId: string, n = 3): T[] {
  return shuffle(pool.filter((p) => p.id !== excludeId)).slice(0, n);
}
function blankExample(sentence: string, word: string): {masked: string;answer: string;} {
  const w = word.split("/")[0].trim();
  if (!w) return { masked: sentence, answer: w };
  const re = new RegExp(`\\b(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\w*)\\b`, "i");
  const m = sentence.match(re);
  const answer = m ? m[1] : w;
  return { masked: sentence.replace(re, "_____"), answer };
}

/* ─────────────── component ─────────────── */
export default function GuidedSession({
  pool,
  onExit,
  sessionSize = 8,
  title = "本关通关",
  mode = "learn",
  grade,
  trackJuniorMastery = false,
  suppressGaokao = false,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardState[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [done, setDone] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const questionShownAt = useRef<number>(Date.now());
  const cohortCtx = useCohortAttemptContext();

  // Initial pick: load mastery, sort by lowest step, take first N.
  useEffect(() => {
    if (pool.length === 0) {
      setLoading(false);
      setDone(true);
      return;
    }
    (async () => {
      const mmap = await fetchMasteryMap(pool.map((p) => p.id));
      const enriched = pool.map((v) => {
        const row = mmap.get(v.id);
        const matrix = row?.matrix ?? {};
        let step = stepFromMatrix(matrix);
        // In review mode: jump straight to review-style steps (2..4), pick one randomly
        if (mode === "review" && step < 5) {
          step = 2 + Math.floor(Math.random() * 3) as GuideStep;
        }
        return { v, matrix, step, correctThisSession: 0, wrongThisSession: 0 };
      });
      // Push step-5 (already-mastered) words to the back so they don't take up space.
      enriched.sort((a, b) => a.step - b.step);
      const chosen = enriched.slice(0, sessionSize);
      setCards(chosen);
      // P2 预热:进关即按网络预热本关词音频,首点喇叭秒响(消除冷合成 1-3s)。
      // 键须与播放一致:默认音色 speak(word)(Flashcard/Spell/非junior En2Cn);
      // junior 的 En2Cn 走 speakKid(el:lily/0.85) → 另预热一份童声键。纯网络,不碰 <audio>。
      const chosenWords = chosen.map((c) => c.v.word.split("/")[0]);
      prefetchTTSBatch(chosenWords);
      if (trackJuniorMastery) prefetchTTSBatchKid(chosenWords, { grade, speed: 0.85 });
      setActiveIdx(0);
      setLoading(false);
      questionShownAt.current = Date.now();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const active = cards[activeIdx];

  // When the active card changes, reset the "shown at" timestamp.
  useEffect(() => {
    questionShownAt.current = Date.now();
  }, [activeIdx, active?.step]);

  function advanceQueue(updated: CardState) {
    // Replace current card with updated copy.
    const newCards = cards.map((c, i) => i === activeIdx ? updated : c);
    // Find the next unfinished card (step < 5), starting AFTER active idx.
    const total = newCards.length;
    let nextIdx = -1;
    for (let off = 1; off <= total; off++) {
      const i = (activeIdx + off) % total;
      if (newCards[i].step < 5) {
        nextIdx = i;
        break;
      }
    }
    setCards(newCards);
    if (nextIdx === -1) {
      setDone(true);
    } else {
      setActiveIdx(nextIdx);
    }
  }

  function handleAnswer(isCorrect: boolean) {
    if (!active) return;
    const stepNow = active.step;
    if (stepNow === 0 || stepNow === 5) {
      // Step 0 (flashcard) doesn't record — just advance to step 1.
      const updated = { ...active, step: 1 as GuideStep };
      advanceQueue(updated);
      return;
    }
    const kind = STEP_KIND[stepNow as 1 | 2 | 3 | 4];
    const latency = Date.now() - questionShownAt.current;
    const source =
      mode === "review"
        ? "fsrs_due"
        : pickPracticeSource(active.v.id, cohortCtx);
    if (!suppressGaokao) {
      recordCohortAttempt({
        vocabId: active.v.id,
        kind,
        isCorrect,
        latencyMs: latency,
        source,
        cohortId: cohortCtx.cohortId,
        cohortWordIds: cohortCtx.cohortWordIds,
      }).catch((e) => console.error("[GuidedSession] recordCohortAttempt", e));
    }
    if (trackJuniorMastery && grade != null) {
      void recordJuniorWordMastery({
        wordId: active.v.id,
        grade,
        kind: juniorKindFromQuizKind(kind),
        isCorrect,
      });
    }
    if (isCorrect) {
      awardCoins(2, `vocab_guided_${kind}`).catch(() => {});
      const newMatrix: MasteryMatrix = { ...active.matrix, [kind]: Math.min(4, (active.matrix[kind] ?? 0) + 1) };
      const nextStep = stepFromMatrix(newMatrix);
      advanceQueue({ ...active, matrix: newMatrix, step: nextStep, correctThisSession: active.correctThisSession + 1 });
    } else {
      // Wrong: stay on same step, but rotate to next card so user gets variety.
      const updated = { ...active, wrongThisSession: active.wrongThisSession + 1 };
      const newCards = cards.map((c, i) => i === activeIdx ? updated : c);
      const total = newCards.length;
      let nextIdx = activeIdx;
      for (let off = 1; off <= total; off++) {
        const i = (activeIdx + off) % total;
        if (newCards[i].step < 5) {
          nextIdx = i;
          break;
        }
      }
      setCards(newCards);
      setActiveIdx(nextIdx);
    }
  }

  /* ─────────────── render branches ─────────────── */
  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-2xl items-center justify-center px-5 py-10 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> <T>准备本关单词…</T>
      </main>);

  }

  if (done || !active) {
    return <SessionComplete cards={cards} startedAt={startedAt.current} onExit={onExit} />;
  }

  const totalCards = cards.length;
  const finishedCards = cards.filter((c) => c.step === 5).length;
  const progressPct = Math.round(finishedCards / totalCards * 100);

  return (
    <main className="mx-auto min-h-[80dvh] max-w-2xl px-5 py-6">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
          
          <ArrowLeft className="size-4" /> <T>退出</T>
        </button>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {title} · {finishedCards}/{totalCards}
        </div>
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
          style={{ width: `${progressPct}%` }} />
        
      </div>

      <StepBadge step={active.step} />

      <StepRunner
        card={active}
        pool={cards.map((c) => c.v)}
        onAnswer={handleAnswer}
        junior={trackJuniorMastery}
        grade={grade} />

    </main>);

}

/* ─────────────── step badge ─────────────── */
function StepBadge({ step }: {step: GuideStep;}) {
  const colors: Record<GuideStep, string> = {
    0: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600",
    1: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
    2: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
    3: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
    4: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-800",
    5: "bg-emerald-100 text-emerald-700 border-emerald-300"
  };
  return (
    <div className="mb-4 flex items-center gap-2">
      {([1, 2, 3, 4] as GuideStep[]).map((s) =>
      <div
        key={s}
        className={cn(
          "h-2 flex-1 rounded-full transition-all",
          s < step ? "bg-emerald-500" : s === step ? "bg-emerald-300" : "bg-muted"
        )} />

      )}
      <span className={cn("ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold", colors[step])}>
        Step {step}/4 · {STEP_LABEL[step]}
      </span>
    </div>);

}

/* ─────────────── per-step runners ─────────────── */
function StepRunner({
  card,
  pool,
  onAnswer,
  junior,
  grade
}: {card: CardState;pool: GuidedVocab[];onAnswer: (correct: boolean) => void;junior?: boolean;grade?: number;}) {
  const { v, step } = card;
  if (step === 0) return <FlashcardStep v={v} onNext={() => onAnswer(true)} />;
  if (step === 1) return <En2CnStep v={v} pool={pool} onAnswer={onAnswer} junior={junior} grade={grade} />;
  if (step === 2) return <Cn2EnStep v={v} pool={pool} onAnswer={onAnswer} />;
  if (step === 3) return <SpellStep v={v} onAnswer={onAnswer} />;
  if (step === 4) return <ClozeStep v={v} onAnswer={onAnswer} />;
  return null;
}

function FlashcardStep({ v, onNext }: {v: GuidedVocab;onNext: () => void;}) {
  useEffect(() => {
    speak(v.word.split("/")[0]).catch(() => {});
  }, [v.id]);
  return (
    <section className="rounded-3xl border border-border bg-card p-7">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground"><T>看一眼 · 不计分</T></p>
      <h2 className="mt-2 text-4xl font-extrabold tracking-tight">{v.word}</h2>
      {v.phonetic && <p className="mt-1 text-sm text-muted-foreground">{v.phonetic}</p>}
      <p className="mt-4 text-lg">{v.meaning_cn}</p>
      {v.example_en &&
      <div className="mt-5 rounded-xl bg-muted/50 p-4 text-sm">
          <p className="leading-relaxed">{v.example_en}</p>
          {v.example_cn && <p className="mt-1 text-muted-foreground">{v.example_cn}</p>}
        </div>
      }
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => speak(v.word.split("/")[0]).catch(() => {})}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
          
          <Volume2 className="size-4" /> <T>再听一次</T>
        </button>
        <button
          onClick={onNext}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <T>知道了</T> 
          <Sparkles className="size-4" />
        </button>
      </div>
    </section>);

}

function ChoiceCard({
  prompt,
  subPrompt,
  options,
  correct,
  onAnswer,
  audio,
  juniorManualNext
}: {prompt: string;subPrompt?: string;options: string[];correct: string;onAnswer: (isCorrect: boolean) => void;audio?: () => void;juniorManualNext?: boolean;}) {
  const [picked, setPicked] = useState<string | null>(null);
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answered = useRef(false);
  // Reset when prompt changes
  useEffect(() => {
    setPicked(null);
    answered.current = false;
    if (nextTimer.current) {clearTimeout(nextTimer.current);nextTimer.current = null;}
  }, [prompt]);
  useEffect(() => () => {if (nextTimer.current) clearTimeout(nextTimer.current);}, []);

  function finish(ok: boolean) {
    if (answered.current) return;
    answered.current = true;
    onAnswer(ok);
  }

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    const ok = opt === correct;
    // junior 答对:不秒跳,显示「下一个」按钮 + 2s 兜底自动跳。其余(高考 / junior答错)维持原节奏。
    if (juniorManualNext && ok) {
      nextTimer.current = setTimeout(() => finish(true), 2000);
      return;
    }
    setTimeout(() => finish(ok), ok ? 500 : 1100);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-7">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold tracking-tight">{prompt}</h2>
          {subPrompt && <p className="mt-1 text-sm text-muted-foreground">{subPrompt}</p>}
        </div>
        {audio &&
        <button
          onClick={audio}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
          
            <Volume2 className="size-3.5" /> <T>听</T>
          </button>
        }
      </div>
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === correct;
          const showState = picked !== null;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={!!picked}
              className={cn(
                "rounded-xl border-2 px-4 py-3.5 text-left text-base transition",
                showState && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
                showState && isPicked && !isCorrect && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
                !showState && "border-border hover:border-primary hover:bg-muted/50",
                showState && !isPicked && !isCorrect && "border-border opacity-60"
              )}>
              
              <span className="flex items-center justify-between gap-2">
                <span>{opt}</span>
                {showState && isCorrect && <Check className="size-4 text-emerald-600" />}
                {showState && isPicked && !isCorrect && <X className="size-4 text-rose-600" />}
              </span>
            </button>);

        })}
      </div>
      {juniorManualNext && picked && picked === correct &&
      <div className="mt-4 flex justify-end">
          <button
          onClick={() => {if (nextTimer.current) clearTimeout(nextTimer.current);finish(true);}}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <T>下一个</T> →
          </button>
        </div>
      }
    </section>);

}

function En2CnStep({ v, pool, onAnswer, junior, grade }: {v: GuidedVocab;pool: GuidedVocab[];onAnswer: (c: boolean) => void;junior?: boolean;grade?: number;}) {
  const opts = useMemo(() => {
    const distractors = pickDistractors(pool, v.id, 3).map((d) => d.meaning_cn);
    return shuffle([v.meaning_cn, ...distractors]);
  }, [v.id]);
  // junior: 进词自动读一遍(童声慢速);卸载时停掉,避免退出后还在响。
  useEffect(() => {
    if (!junior) return;
    speakKid(v.word.split("/")[0], { grade, speed: 0.85 }).catch(() => {});
    return () => stopSpeaking();
  }, [v.id]);
  return (
    <ChoiceCard
      prompt={v.word}
      subPrompt={v.phonetic || undefined}
      options={opts}
      correct={v.meaning_cn}
      onAnswer={onAnswer}
      audio={() => (junior ? speakKid(v.word.split("/")[0], { grade, speed: 0.85 }) : speak(v.word.split("/")[0])).catch(() => {})}
      juniorManualNext={junior} />);


}

function Cn2EnStep({ v, pool, onAnswer }: {v: GuidedVocab;pool: GuidedVocab[];onAnswer: (c: boolean) => void;}) {
  const opts = useMemo(() => {
    const distractors = pickDistractors(pool, v.id, 3).map((d) => d.word);
    return shuffle([v.word, ...distractors]);
  }, [v.id]);
  return (
    <ChoiceCard
      prompt={v.meaning_cn}
      subPrompt="选出对应的英文"
      options={opts}
      correct={v.word}
      onAnswer={onAnswer} />);


}

function SpellStep({ v, onAnswer }: {v: GuidedVocab;onAnswer: (c: boolean) => void;}) {
  const target = v.word.split("/")[0].trim();
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    setChecked(null);
    speak(target).catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [v.id]);

  function submit() {
    if (checked !== null || !input.trim()) return;
    const ok = canonSpelling(input) === canonSpelling(target);
    setChecked(ok);
    setTimeout(() => onAnswer(ok), ok ? 600 : 1300);
  }

  const hint = `${target[0]} ${"_ ".repeat(Math.max(0, target.length - 1)).trim()}`;
  return (
    <section className="rounded-3xl border border-border bg-card p-7">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground"><T>听音 · 拼出来</T></p>
      <h2 className="mt-2 text-3xl font-extrabold">{v.meaning_cn}</h2>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => speak(target).catch(() => {})}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
          
          <Volume2 className="size-4" /> <T>重听</T>
        </button>
        <span className="font-mono text-sm text-muted-foreground"><T>提示：</T>{hint}</span>
      </div>
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            submit();
          }
        }}
        disabled={checked !== null}
        placeholder="在这里拼写"
        className={cn(
          "mt-5 w-full rounded-xl border-2 bg-background px-4 py-3 text-lg outline-none transition",
          checked === null && "border-border focus:border-primary",
          checked === true && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
          checked === false && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40"
        )}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false} />
      
      {checked === false &&
      <p className="mt-2 text-sm text-rose-600"><T>正确：</T><span className="font-mono">{target}</span></p>
      }
      <div className="mt-5 flex justify-end">
        <button
          onClick={submit}
          disabled={checked !== null || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
          <T>提交</T>
        
        </button>
      </div>
    </section>);

}

function ClozeStep({ v, onAnswer }: {v: GuidedVocab;onAnswer: (c: boolean) => void;}) {
  const target = v.word.split("/")[0].trim();
  const sentence = v.example_en || `Please use the word ${target} in a sentence.`;
  const { masked, answer } = useMemo(() => blankExample(sentence, target), [v.id]);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    setChecked(null);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [v.id]);

  function submit() {
    if (checked !== null || !input.trim()) return;
    // 放宽:命中例句变形(answer)或原形(target)任一即算对,叠英美变体容错
    const got = canonSpelling(input);
    const ok = got === canonSpelling(answer) || got === canonSpelling(target);
    setChecked(ok);
    setTimeout(() => onAnswer(ok), ok ? 700 : 1500);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-7">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground"><T>用起来 · 例句填空</T></p>
      <p className="mt-3 text-lg leading-relaxed">{masked}</p>
      {v.example_cn && <p className="mt-1 text-sm text-muted-foreground">{v.example_cn}</p>}
      <div className="mt-3 text-xs text-muted-foreground"><T>提示：</T>{v.meaning_cn} <T>· 首字母</T> <span className="font-mono">{target[0]}</span></div>
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            submit();
          }
        }}
        disabled={checked !== null}
        placeholder="填入正确单词形式"
        className={cn(
          "mt-5 w-full rounded-xl border-2 bg-background px-4 py-3 text-lg outline-none transition",
          checked === null && "border-border focus:border-primary",
          checked === true && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
          checked === false && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40"
        )}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false} />
      
      {checked === false &&
      <p className="mt-2 text-sm text-rose-600"><T>正确：</T><span className="font-mono">{answer}</span></p>
      }
      <div className="mt-5 flex justify-end">
        <button
          onClick={submit}
          disabled={checked !== null || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
          <T>提交</T>
        
        </button>
      </div>
    </section>);

}

/* ─────────────── completion screen ─────────────── */
function SessionComplete({
  cards,
  startedAt,
  onExit




}: {cards: CardState[];startedAt: number;onExit: () => void;}) {
  const totalCorrect = cards.reduce((s, c) => s + c.correctThisSession, 0);
  const totalWrong = cards.reduce((s, c) => s + c.wrongThisSession, 0);
  const masteredCount = cards.filter((c) => c.step === 5).length;
  const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

  useEffect(() => {
    if (masteredCount > 0) awardCoins(masteredCount * 5, "vocab_guided_complete").catch(() => {});
  }, []);

  return (
    <main className="mx-auto min-h-[80dvh] max-w-2xl px-5 py-10">
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <Trophy className="mx-auto size-14 text-amber-500" />
        <h2 className="mt-3 text-2xl font-extrabold"><T>本关结束 🎉</T></h2>
        <p className="mt-1 text-sm text-muted-foreground"><T>用时</T> {minutes} <T>分钟 · 答对</T> {totalCorrect} <T>/ 答错</T> {totalWrong}</p>
        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <Stat label="本关词" value={cards.length} />
          <Stat label="完全掌握" value={masteredCount} accent />
          <Stat label="待复习" value={cards.length - masteredCount} />
        </div>
        <div className="mt-6 max-h-60 overflow-auto rounded-xl border border-border/60">
          {cards.map((c) =>
          <div key={c.v.id} className="flex items-center justify-between border-b border-border/40 px-4 py-2 text-sm last:border-b-0">
              <span className="font-medium">{c.v.word}</span>
              <span className="text-xs text-muted-foreground">
                {c.step === 5 ? "✅ 已掌握" : `进度 ${c.step}/4`}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onExit}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <T>完成</T>
        
        </button>
      </div>
    </main>);

}
function Stat({ label, value, accent }: {label: string;value: number;accent?: boolean;}) {
  return (
    <div className={cn("rounded-xl border border-border bg-background p-3", accent && "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold">{value}</p>
    </div>);

}