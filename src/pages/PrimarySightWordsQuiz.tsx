import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid as speak } from "@/lib/speak";
import {
  SIGHT_WORD_GROUPS,
  SIGHT_WORD_ITEMS,
  type SightWordItem,
} from "@/data/primarySightWords";
import {
  bumpSightWordLevel,
  bumpSightWordMastery,
  getSightWordMasteryMap,
  isSightWordDue,
} from "@/lib/sightWordMastery";
import { buildSightWordDistractors } from "@/lib/sightWordDistractors";
import { celebratePet } from "@/components/pet/EvolutionCelebration";

/**
 * 整组 / 复习挑战 — 与 Phonics Quiz 同构: 每个词 3 道轮换, 全对升级.
 *  /primary/sight-words/quiz/sg1     → 该组所有词
 *  /primary/sight-words/quiz/review  → SRS 到期的词
 */
export default function PrimarySightWordsQuiz() {
  const { groupId } = useParams<{ groupId: string }>();
  const nav = useNavigate();
  const isReview = groupId === "review";
  const group = isReview ? null : SIGHT_WORD_GROUPS.find((g) => g.id === groupId);

  const [items, setItems] = useState<SightWordItem[]>([]);
  const [itemIdx, setItemIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [retryArmed, setRetryArmed] = useState(false);
  const [itemCorrects, setItemCorrects] = useState(0);
  const [perfectItems, setPerfectItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = isReview
      ? "常见小词复习 | FluentPath"
      : `挑战 ${group?.groupName ?? ""} | FluentPath`;
    (async () => {
      if (isReview) {
        const m = await getSightWordMasteryMap();
        const due = SIGHT_WORD_ITEMS.filter((w) => isSightWordDue(m.get(w.id)));
        setItems(shuffle(due).slice(0, 8));
      } else if (group) {
        setItems(shuffle(SIGHT_WORD_ITEMS.filter((w) => w.groupId === group.id)));
      }
      setLoading(false);
    })();
  }, [isReview, group]);

  const totalItems = items.length;
  const cur = items[itemIdx];
  const isFinished = !loading && totalItems > 0 && itemIdx >= totalItems;
  const itemQuestions = useMemo(() => (cur ? buildItemQuestions(cur) : []), [cur, itemIdx]);
  const q = itemQuestions[subIdx] ?? null;

  useEffect(() => {
    if (!isFinished) return;
    const allCorrect = perfectItems === totalItems;
    celebratePet({
      kind: "levelup",
      emoji: "📖",
      title: `做完啦!通过 ${perfectItems}/${totalItems} 个词`,
      subtitle: allCorrect ? "全部 3 题都对!太强啦" : "没全对的词明天会再考你哦",
    });
    const t = setTimeout(() => nav("/primary/sight-words"), 1800);
    return () => clearTimeout(t);
  }, [isFinished, perfectItems, totalItems, nav]);

  useEffect(() => {
    if (!q || !cur) return;
    if (q.kind === "listen") {
      const t = setTimeout(() => speak(cur.word), 250);
      return () => clearTimeout(t);
    }
  }, [q, cur]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">准备中…</p>
      </main>
    );
  }
  if (!loading && totalItems === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <BackLink to="/primary/sight-words" className="text-sm text-muted-foreground">← 返回常见小词</BackLink>
        <p className="mt-6 text-sm text-muted-foreground">
          {isReview ? "今天没有需要复习的词~" : "这一组还没有词。"}
        </p>
      </main>
    );
  }
  if (isFinished || !cur || !q) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-lg font-bold">做完啦!{perfectItems} / {totalItems} 个词通过</p>
        <p className="mt-2 text-sm text-muted-foreground">回到常见小词冒险…</p>
      </main>
    );
  }

  function pick(opt: string) {
    if (picked || !q || !cur) return;
    setPicked(opt);
    let isCorrect = false;
    if (q.kind === "recognize") isCorrect = opt === q.correct;
    else if (q.kind === "listen") isCorrect = opt === q.correct;
    else isCorrect = opt === q.correctWord;

    void bumpSightWordMastery(cur.id, q.kind, isCorrect);

    if (isCorrect) {
      const newC = itemCorrects + 1;
      setItemCorrects(newC);
      setTimeout(() => {
        setPicked(null);
        setRetryArmed(false);
        if (subIdx >= 2) {
          if (newC === 3) {
            void bumpSightWordLevel(cur.id, 1, 3);
            setPerfectItems((p) => p + 1);
          }
          setItemCorrects(0);
          setSubIdx(0);
          setItemIdx(itemIdx + 1);
        } else {
          setSubIdx(subIdx + 1);
        }
      }, 750);
    } else {
      setTimeout(() => {
        setPicked(null);
        if (!retryArmed) {
          setRetryArmed(true);
        } else {
          setRetryArmed(false);
          if (subIdx >= 2) {
            setItemCorrects(0);
            setSubIdx(0);
            setItemIdx(itemIdx + 1);
          } else {
            setSubIdx(subIdx + 1);
          }
        }
      }, 1100);
    }
  }

  const totalQuestions = totalItems * 3;
  const doneQuestions = itemIdx * 3 + subIdx;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink to="/primary/sight-words" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回常见小词冒险
      </BackLink>

      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-extrabold">
          {isReview ? "🔁 今日复习" : `✨ 挑战 ${group?.groupName}`}
        </h1>
        <div className="text-xs font-mono font-bold text-muted-foreground">
          第 {Math.min(itemIdx + 1, totalItems)}/{totalItems} 个词 · 题 {subIdx + 1}/3
          {retryArmed && <span className="ml-1 text-rose-600">· 再来</span>}
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all"
          style={{ width: `${(doneQuestions / Math.max(1, totalQuestions)) * 100}%` }}
        />
      </div>

      <div className="space-y-4 rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
        {q.kind === "recognize" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">这个词的中文是什么?</p>
            <div className="flex justify-center">
              <div className="text-5xl font-black text-sky-600 dark:text-sky-300">{cur.word}</div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {q.options.map((o) => <Opt key={o} label={o} picked={picked} correct={q.correct} onPick={pick} />)}
            </div>
          </>
        )}
        {q.kind === "listen" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">听这个词,选出正确的写法</p>
            <div className="flex justify-center">
              <button onClick={() => speak(cur.word)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow">
                <Volume2 className="size-5" /> 再听一遍
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => <Opt key={o} label={o} picked={picked} correct={q.correct} onPick={pick} big mono />)}
            </div>
          </>
        )}
        {q.kind === "context" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">选出能填进句子里的词</p>
            <div className="space-y-1 text-center">
              <div className="text-xl font-bold">
                {q.sentenceParts[0]}
                <span className="mx-1 inline-block rounded-md bg-sky-100 px-3 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">____</span>
                {q.sentenceParts[1]}
              </div>
              <div className="text-xs text-muted-foreground">{q.cn}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => <Opt key={o} label={o} picked={picked} correct={q.correctWord} onPick={pick} big mono />)}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ─── helpers ──
type Q =
  | { kind: "recognize"; correct: string; options: string[] }
  | { kind: "listen"; correct: string; options: string[] }
  | { kind: "context"; correctWord: string; sentenceParts: [string, string]; cn: string; options: string[] };

function buildItemQuestions(item: SightWordItem): Q[] {
  const pool = SIGHT_WORD_ITEMS.map((w) => ({ id: w.id, word: w.word }));
  const distractors = buildSightWordDistractors(item.id, pool, 3);
  const meaningPool = SIGHT_WORD_ITEMS.filter((w) => w.id !== item.id);
  const meaningDistractors = shuffle(meaningPool).slice(0, 3).map((w) => w.meaningCn);

  const qs: Q[] = [
    { kind: "recognize", correct: item.meaningCn, options: shuffle([item.meaningCn, ...meaningDistractors]) },
    { kind: "listen", correct: item.word, options: shuffle([item.word, ...distractors]) },
  ];
  const ctx = buildContext(item, distractors);
  if (ctx) qs.push(ctx);
  while (qs.length < 3) qs.push({ kind: "listen", correct: item.word, options: shuffle([item.word, ...buildSightWordDistractors(item.id, pool, 3)]) });
  return shuffle(qs.slice(0, 3));
}

function buildContext(item: SightWordItem, distractors: string[]): Q | null {
  const sent = item.exampleSentence;
  if (!sent) return null;
  const pattern = new RegExp(`\\b${escapeRegex(item.word)}\\b`, "i");
  const m = sent.match(pattern);
  if (!m || m.index == null) return null;
  return {
    kind: "context",
    correctWord: item.word,
    sentenceParts: [sent.slice(0, m.index), sent.slice(m.index + m[0].length)],
    cn: item.exampleSentenceCn,
    options: shuffle([item.word, ...distractors]),
  };
}

function escapeRegex(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function Opt({
  label, picked, correct, onPick, big, mono,
}: { label: string; picked: string | null; correct: string; onPick: (l: string) => void; big?: boolean; mono?: boolean }) {
  const isCorrect = label === correct;
  const isPicked = picked === label;
  return (
    <button
      disabled={!!picked}
      onClick={() => onPick(label)}
      className={
        "rounded-2xl border-2 px-4 py-4 font-extrabold transition " +
        (big ? "text-2xl " : "text-base ") +
        (mono ? "font-mono " : "") +
        (picked === null
          ? "border-border bg-card hover:border-primary/50"
          : isCorrect
          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
          : isPicked
          ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
          : "border-border bg-card opacity-60")
      }
    >
      {label}
    </button>
  );
}
