import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, PencilLine } from "lucide-react";
import { KNOWN_PHRASES } from "@/components/TappableLine";
import { stripTags } from "@/lib/richText";
import { T } from "@/i18n/T";

type DialogLine = { en: string; cn: string };

type QuizItem = {
  /** Sentence with the target phrase replaced by ____ */
  blanked: string;
  /** Translation shown as a hint */
  hint: string;
  /** Correct answer */
  answer: string;
  /** 4 options including the correct one, randomized */
  options: string[];
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
 * Phrases too trivial to quiz on — common single words, basic greetings,
 * filler particles. We want the quiz to focus on meaningful, idiomatic,
 * "feels-native" expressions that learners actually need to drill.
 */
const TRIVIAL_PHRASES = new Set<string>([
  "thank you",
  "let me",
  "let's",
  "i see",
  "got it",
  "right now",
  "right here",
  "over there",
  "all right",
  "going to",
  "for sure",
  "of course",
  "no problem",
  "hold on",
  "hang on",
  "go ahead",
]);

/**
 * Score a phrase by how "worth quizzing" it is. Higher = more idiomatic /
 * expression-like. Multi-word phrases beat single words; idioms beat
 * grammar fillers.
 */
function expressionScore(p: string): number {
  if (TRIVIAL_PHRASES.has(p)) return -1;
  const wordCount = p.split(" ").length;
  if (wordCount === 1) return -1; // single-word "phrases" are usually too easy
  let score = wordCount * 10 + p.length;
  // Bonus for clearly idiomatic / fixed expressions worth memorizing.
  const idiomatic = [
    "a side of",
    "on the side",
    "right this way",
    "would you mind",
    "do you mind",
    "would you like",
    "looking forward to",
    "look forward to",
    "by the way",
    "in case",
    "instead of",
    "as well as",
    "have you ever",
    "used to",
    "supposed to",
    "make sense",
    "makes sense",
    "sounds good",
    "sounds great",
    "no worries",
    "you bet",
    "check please",
    "to go",
    "for here",
  ];
  if (idiomatic.includes(p)) score += 30;
  return score;
}

/**
 * Build quiz items by scanning each line for the longest known phrase that
 * appears in it. Distractors are pulled from other phrases used elsewhere in
 * KNOWN_PHRASES (preferring ones similar in length).
 */
function buildQuiz(lines: DialogLine[], maxItems = 10): QuizItem[] {
  const items: QuizItem[] = [];
  const used = new Set<string>();

  // Pool of phrases we consider "worth quizzing" — only meaningful expressions.
  const quizzable = KNOWN_PHRASES.filter((p) => expressionScore(p) > 0);

  // Collect candidates: for each line, pick the highest-scoring quizzable
  // phrase present in it. Then sort across the whole dialogue and take the
  // top N — so a 10-line lesson surfaces its best 5 expressions, not the
  // first 5 trivial matches.
  type Cand = { line: DialogLine; phrase: string; score: number };
  const cands: Cand[] = [];
  for (const line of lines) {
    const en = stripTags(line.en);
    const lower = " " + en.toLowerCase() + " ";
    // Collect ALL quizzable phrases present in this line (not just the best),
    // so a rich line can contribute multiple questions.
    const found: { p: string; s: number }[] = [];
    for (const p of quizzable) {
      if (lower.includes(" " + p + " ")) {
        found.push({ p, s: expressionScore(p) });
      }
    }
    for (const f of found) cands.push({ line, phrase: f.p, score: f.s });
  }
  // Sort by score desc, but de-prioritize duplicate phrases by keeping the
  // first occurrence highest.
  cands.sort((a, b) => b.score - a.score);

  for (const { line, phrase: best } of cands) {
    if (used.has(best)) continue;
    used.add(best);
    const en = stripTags(line.en);

    // Build blanked sentence (case-insensitive replace, first occurrence).
    const re = new RegExp(`\\b${best.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const blanked = en.replace(re, "____");

    // Pick 3 distractors from other meaningful expressions, similar in
    // length so the choice isn't obvious by shape alone.
    const distractorPool = quizzable.filter(
      (p) => p !== best && Math.abs(p.length - best.length) < 14,
    );
    const distractors = shuffle(distractorPool).slice(0, 3);
    while (distractors.length < 3) {
      const fallback = quizzable[Math.floor(Math.random() * quizzable.length)];
      if (fallback !== best && !distractors.includes(fallback)) distractors.push(fallback);
    }

    items.push({
      blanked,
      hint: stripTags(line.cn),
      answer: best,
      options: shuffle([best, ...distractors.slice(0, 3)]),
    });
    if (items.length >= maxItems) break;
  }
  return items;
}

export function PhraseQuiz({ lines }: { lines: DialogLine[] }) {
  const initialItems = useMemo(() => buildQuiz(lines), [lines]);
  const [items, setItems] = useState(initialItems);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setItems(initialItems);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }, [initialItems]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
        <div className="text-sm text-muted-foreground">
          <T>这段对话暂时没有可练习的固定短语,继续学习其它对话吧。</T>
        </div>
      </div>
    );
  }

  const current = items[idx];
  const isCorrect = picked === current.answer;

  const onPick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === current.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setItems(buildQuiz(lines));
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const ratio = Math.round((score / items.length) * 100);
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
        <div className="text-3xl font-extrabold text-primary">
          {score} / {items.length}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {ratio >= 80 ? <T>掌握得不错!</T> : ratio >= 50 ? <T>还行,再练一次会更熟。</T> : <T>多练几次就会熟悉了。</T>}
        </div>
        <button
          onClick={restart}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          <RefreshCw className="size-4" /> <T>再练一次</T>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <PencilLine className="size-4" /> <T>巩固一下</T>
        </div>
        <div className="text-xs text-muted-foreground">
          {idx + 1} / {items.length}
        </div>
      </div>

      <div className="mb-3 text-base font-medium leading-relaxed text-foreground md:text-lg">
        {current.blanked.split("____").map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 ? (
              <span className="mx-1 inline-block min-w-[80px] rounded-md border-b-2 border-primary/60 bg-primary/5 px-2 align-middle text-center font-bold text-primary">
                {picked ? current.answer : "____"}
              </span>
            ) : null}
          </span>
        ))}
      </div>
      <div className="mb-4 text-xs text-muted-foreground">
        <T>提示</T>: {current.hint}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {current.options.map((opt) => {
          const isPicked = picked === opt;
          const isAnswer = opt === current.answer;
          let cls =
            "rounded-xl border border-border bg-secondary/50 px-3 py-2 text-left text-sm font-medium transition hover:bg-primary/10";
          if (picked) {
            if (isAnswer) cls = "rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-left text-sm font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
            else if (isPicked) cls = "rounded-xl border-2 border-destructive bg-destructive/10 px-3 py-2 text-left text-sm font-bold text-destructive";
            else cls = "rounded-xl border border-border bg-secondary/30 px-3 py-2 text-left text-sm text-muted-foreground";
          }
          return (
            <button key={opt} onClick={() => onPick(opt)} className={cls} disabled={!!picked}>
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className={`flex items-center gap-1.5 text-sm font-bold ${isCorrect ? "text-emerald-600" : "text-destructive"}`}>
            {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {isCorrect ? <T>答对了!</T> : <T>正确答案如上</T>}
          </div>
          <button
            onClick={next}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            {idx + 1 < items.length ? <T>下一题</T> : <T>查看成绩</T>}
          </button>
        </div>
      )}
    </div>
  );
}