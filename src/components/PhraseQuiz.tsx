import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  PencilLine,
  Loader2,
} from "lucide-react";
import { KNOWN_PHRASES } from "@/components/TappableLine";
import { stripTags } from "@/lib/richText";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { recordQuizAnswer, seedReviews, type ReviewSeed } from "@/lib/srs";

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
  /** Optional SRS seed so a correct/incorrect answer can update the review queue. */
  seed?: ReviewSeed;
};

/** One AI-extracted key expression. */
type KeyExpression = {
  en: string;
  line_index: number;
  cn: string;
  why?: string;
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

  // Candidates carry an "isMarked" flag so curated <mark> highlights from the
  // lesson are always tested before generic KNOWN_PHRASES fallbacks.
  type Cand = {
    line: DialogLine;
    phrase: string;
    score: number;
    marked: boolean;
  };
  const cands: Cand[] = [];

  // PRIORITY 1 — extract every <mark>…</mark> highlight from the lesson.
  // These are the curated "key expressions" the author wants the learner
  // to retain (the yellow-highlighted phrases shown in the dialogue UI).
  const markRe = /<mark>([\s\S]*?)<\/mark>/gi;
  for (const line of lines) {
    let m: RegExpExecArray | null;
    const seenInLine = new Set<string>();
    while ((m = markRe.exec(line.en)) !== null) {
      const raw = stripTags(m[1]).trim().toLowerCase();
      // Skip empty / punctuation-only / single-letter highlights.
      if (!raw || raw.length < 2) continue;
      if (seenInLine.has(raw)) continue;
      seenInLine.add(raw);
      // Score marked phrases very high so they always win over fallbacks.
      // Multi-word marks score higher than single-word marks.
      const wc = raw.split(/\s+/).length;
      cands.push({
        line,
        phrase: raw,
        score: 1000 + wc * 10 + raw.length,
        marked: true,
      });
    }
  }

  // PRIORITY 2 — fallback: scan plain text for KNOWN_PHRASES so that
  // lessons without <mark> highlights still produce a quiz.
  for (const line of lines) {
    const en = stripTags(line.en);
    const lower = " " + en.toLowerCase() + " ";
    for (const p of quizzable) {
      if (lower.includes(" " + p + " ")) {
        cands.push({ line, phrase: p, score: expressionScore(p), marked: false });
      }
    }
  }

  // Sort by score desc — marked phrases naturally rise to the top.
  cands.sort((a, b) => b.score - a.score);

  // Build a distractor pool that includes BOTH KNOWN_PHRASES and other
  // marked phrases from this lesson, so distractors feel topical.
  const markedPool = Array.from(
    new Set(cands.filter((c) => c.marked).map((c) => c.phrase)),
  );
  const distractorUniverse = Array.from(new Set([...markedPool, ...quizzable]));

  for (const { line, phrase: best } of cands) {
    if (used.has(best)) continue;
    used.add(best);
    const en = stripTags(line.en);

    // Build blanked sentence (case-insensitive replace, first occurrence).
    // Use a flexible boundary so phrases ending in punctuation (e.g. "Sure thing!")
    // still match cleanly.
    const escaped = best.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|\\W)${escaped}(?=\\W|$)`, "i");
    let blanked = en.replace(re, (_m, pre) => `${pre || ""}____`);
    // If the regex didn't match (rare casing / punctuation edge), fall back
    // to a simple case-insensitive substring replace.
    if (!blanked.includes("____")) {
      const idx = en.toLowerCase().indexOf(best.toLowerCase());
      if (idx >= 0) {
        blanked = en.slice(0, idx) + "____" + en.slice(idx + best.length);
      } else {
        continue; // can't blank it cleanly — skip
      }
    }

    // Pick 3 distractors similar in length so the choice isn't obvious by shape.
    const distractorPool = distractorUniverse.filter(
      (p) => p !== best && Math.abs(p.length - best.length) < 14,
    );
    const distractors = shuffle(distractorPool).slice(0, 3);
    while (distractors.length < 3) {
      const fallback =
        distractorUniverse[Math.floor(Math.random() * distractorUniverse.length)] ||
        quizzable[Math.floor(Math.random() * quizzable.length)];
      if (fallback && fallback !== best && !distractors.includes(fallback)) {
        distractors.push(fallback);
      }
      if (distractors.length >= 3) break;
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

/**
 * Build a quiz directly from AI-extracted key expressions. Each expression is
 * blanked out of its source line; distractors are pulled from other key
 * expressions in the SAME dialogue (so they feel topical), padded by
 * KNOWN_PHRASES if needed.
 */
function buildQuizFromExpressions(
  lines: DialogLine[],
  expressions: KeyExpression[],
  maxItems = 12,
): QuizItem[] {
  const items: QuizItem[] = [];
  const used = new Set<string>();

  // Distractor universe: every expression in this dialogue + safe fallbacks.
  const exprPool = Array.from(new Set(expressions.map((e) => e.en)));
  const fallback = KNOWN_PHRASES.filter((p) => p.split(" ").length >= 2);
  const universe = Array.from(new Set([...exprPool, ...fallback]));

  for (const e of expressions) {
    if (used.has(e.en)) continue;
    if (e.line_index < 0 || e.line_index >= lines.length) continue;
    const line = lines[e.line_index];
    const en = stripTags(line.en);
    const lower = en.toLowerCase();
    const idx = lower.indexOf(e.en.toLowerCase());
    if (idx < 0) continue;
    used.add(e.en);
    const blanked = en.slice(0, idx) + "____" + en.slice(idx + e.en.length);
    const answer = en.slice(idx, idx + e.en.length);

    const pool = universe.filter(
      (p) =>
        p.toLowerCase() !== e.en.toLowerCase() &&
        Math.abs(p.length - e.en.length) < 16,
    );
    const distractors = shuffle(pool).slice(0, 3);
    while (distractors.length < 3) {
      const f = universe[Math.floor(Math.random() * universe.length)];
      if (
        f &&
        f.toLowerCase() !== e.en.toLowerCase() &&
        !distractors.includes(f)
      ) {
        distractors.push(f);
      }
      if (distractors.length >= 3) break;
    }

    items.push({
      blanked,
      hint: stripTags(line.cn) + (e.cn ? `  💡 ${e.cn}` : ""),
      answer,
      options: shuffle([answer, ...distractors.slice(0, 3)]),
      seed: {
        phrase: e.en,
        phrase_cn: e.cn,
        source_line_en: stripTags(line.en),
        source_line_cn: stripTags(line.cn),
      },
    });
    if (items.length >= maxItems) break;
  }
  return items;
}

export function PhraseQuiz({
  lines,
  dialogueKey,
}: {
  lines: DialogLine[];
  /** Stable id for the dialogue (e.g. "scene:restaurant-chinese-1"). When
   *  provided, the quiz is built from AI-curated key expressions cached
   *  per-dialogue, so it tests the truly meaningful expressions rather than
   *  whatever generic phrases happen to appear. */
  dialogueKey?: string;
}) {
  const fallbackItems = useMemo(() => buildQuiz(lines), [lines]);
  const [items, setItems] = useState<QuizItem[]>(fallbackItems);
  const [loading, setLoading] = useState<boolean>(!!dialogueKey);
  const [aiExpressions, setAiExpressions] = useState<KeyExpression[] | null>(
    null,
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  // Reset state whenever the source dialogue changes.
  useEffect(() => {
    setItems(fallbackItems);
    setAiExpressions(null);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setLoading(!!dialogueKey);
  }, [fallbackItems, dialogueKey]);

  // Fetch AI-curated key expressions once per dialogue (cached server-side).
  useEffect(() => {
    if (!dialogueKey || lines.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "extract-key-phrases",
          {
            body: {
              dialogueKey,
              lines: lines.map((l) => ({
                en: stripTags(l.en),
                cn: stripTags(l.cn),
              })),
            },
          },
        );
        if (cancelled) return;
        if (error) throw error;
        const exprs: KeyExpression[] = data?.phrases?.expressions || [];
        if (exprs.length > 0) {
          setAiExpressions(exprs);
          const aiItems = buildQuizFromExpressions(lines, exprs);
          if (aiItems.length > 0) {
            setItems(aiItems);
            setIdx(0);
            setPicked(null);
            setScore(0);
            setDone(false);
          }
          // Seed every expression into the spaced-repetition queue so the
          // learner can drill them later in /review — even without finishing
          // the quiz right now.
          void seedReviews(
            exprs.map((e) => {
              const line = lines[e.line_index];
              return {
                phrase: e.en,
                phrase_cn: e.cn,
                source_key: dialogueKey,
                source_line_en: line ? stripTags(line.en) : undefined,
                source_line_cn: line ? stripTags(line.cn) : undefined,
              };
            }),
          );
        }
      } catch (e) {
        console.warn("[extract-key-phrases] failed, using local fallback", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dialogueKey, lines]);

  if (loading && items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />{" "}
          <T>正在挑选这节课的重点表达…</T>
        </div>
      </div>
    );
  }

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
    const correct = opt === current.answer;
    if (correct) setScore((s) => s + 1);
    if (current.seed && dialogueKey) {
      void recordQuizAnswer({
        seed: { ...current.seed, source_key: dialogueKey },
        correct,
      });
    }
  };

  // After picking an answer, scroll the feedback row (with the Next button)
  // into view so the user doesn't have to scroll down on small screens.
  useEffect(() => {
    if (!picked) return;
    const el = feedbackRef.current;
    if (!el) return;
    const id = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const targetTop = window.innerHeight * 0.55;
      const delta = rect.top - targetTop;
      if (Math.abs(delta) > 8) {
        window.scrollBy({ top: delta, behavior: "smooth" });
      }
    }, 60);
    return () => window.clearTimeout(id);
  }, [picked, idx]);

  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    if (aiExpressions && aiExpressions.length > 0) {
      setItems(buildQuizFromExpressions(lines, aiExpressions));
    } else {
      setItems(buildQuiz(lines));
    }
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
        <div ref={feedbackRef} className="mt-4 flex items-center justify-between gap-3 scroll-mt-24">
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