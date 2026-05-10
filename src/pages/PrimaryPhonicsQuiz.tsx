import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speak } from "@/lib/speak";
import {
  PHONICS_GROUPS,
  PHONICS_ITEMS,
  type PhonicsItem,
} from "@/data/primaryPhonics";
import {
  bumpPhonicsMastery,
  ensureGroupMastery,
  getPhonicsMasteryMap,
  isDue,
} from "@/lib/phonicsMastery";
import { celebratePet } from "@/components/pet/EvolutionCelebration";

/**
 * 整组挑战 / 复习模式。
 *  /primary/phonics/quiz/g2     → 该组所有音,每个音 1 题
 *  /primary/phonics/quiz/review → SRS 到期的所有音
 */
export default function PrimaryPhonicsQuiz() {
  const { groupId } = useParams<{ groupId: string }>();
  const nav = useNavigate();
  const isReview = groupId === "review";
  const group = isReview ? null : PHONICS_GROUPS.find((g) => g.id === groupId);

  const [items, setItems] = useState<PhonicsItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = isReview ? "拼读复习 | FluentPath" : `挑战 ${group?.groupName ?? ""} | FluentPath`;
    (async () => {
      if (isReview) {
        const m = await getPhonicsMasteryMap();
        const due = PHONICS_ITEMS.filter((it) => isDue(m.get(it.id)));
        setItems(shuffle(due).slice(0, 12));
      } else if (group) {
        const groupItems = PHONICS_ITEMS.filter((it) => it.groupId === group.id);
        setItems(shuffle(groupItems));
      }
      setLoading(false);
    })();
  }, [isReview, group]);

  const total = items.length;
  const cur = items[idx];

  // 每题随机一个题型(听音选字母 / 看字母选音 / 听词选 emoji)
  const q = useMemo(() => (cur ? buildOneQuestion(cur) : null), [cur]);

  useEffect(() => {
    if (!q || !cur) return;
    const t = setTimeout(() => {
      if (q.kind === "hearLetter") speak(cur.exampleWords[0]?.word ?? cur.letter);
      else if (q.kind === "matchWord") speak(q.correctWord);
    }, 300);
    return () => clearTimeout(t);
  }, [q, cur]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">准备中…</p>
      </main>
    );
  }

  if (!loading && total === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <BackLink to="/primary/phonics" className="text-sm text-muted-foreground">
          ← 返回拼读冒险
        </BackLink>
        <p className="mt-6 text-sm text-muted-foreground">
          {isReview ? "今天没有需要复习的音~" : "这一组还没有内容。"}
        </p>
      </main>
    );
  }

  if (!cur || !q) {
    // 全部答完
    const allCorrect = correctCount === total;
    void (async () => {
      if (!isReview && group && allCorrect) {
        const groupItems = PHONICS_ITEMS.filter((it) => it.groupId === group.id);
        await ensureGroupMastery(
          groupItems.map((it) => it.id),
          2
        );
        celebratePet({
          kind: "levelup",
          emoji: "🦊",
          title: `${group.groupName} 通关!`,
          subtitle: "Spark 解锁了下一组~",
        });
      } else {
        celebratePet({
          kind: "levelup",
          emoji: "🦊",
          title: `做完啦!对 ${correctCount}/${total}`,
          subtitle: allCorrect ? "全对!" : "错题几天后会再考你哦",
        });
      }
    })();
    setTimeout(() => nav("/primary/phonics"), 1800);
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-lg font-bold">
          做完啦!{correctCount} / {total}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">回到拼读冒险…</p>
      </main>
    );
  }

  function pick(opt: string) {
    if (picked || !q || !cur) return;
    setPicked(opt);
    let isCorrect = false;
    if (q.kind === "hearLetter") isCorrect = opt === q.correct;
    else if (q.kind === "seeLetter") isCorrect = opt === q.correct;
    else if (q.kind === "matchWord") isCorrect = opt === q.correctWord;
    if (isCorrect) setCorrectCount((c) => c + 1);
    bumpPhonicsMastery(
      cur.id,
      q.kind === "hearLetter" || q.kind === "matchWord" ? "listen" : "quiz",
      isCorrect
    );
    setTimeout(() => {
      setIdx(idx + 1);
      setPicked(null);
    }, 850);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink
        to="/primary/phonics"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回拼读冒险
      </BackLink>

      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-extrabold">
          {isReview ? "🔁 今日复习" : `✨ 挑战 ${group?.groupName}`}
        </h1>
        <div className="text-xs font-mono font-bold text-muted-foreground">
          {idx + 1} / {total} · ✓ {correctCount}
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 transition-all"
          style={{ width: `${(idx / total) * 100}%` }}
        />
      </div>

      <div className="space-y-4 rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
        {q.kind === "hearLetter" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">
              听这个音,选出对应的字母
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => speak(cur.exampleWords[0]?.word ?? cur.letter)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow"
              >
                <Volume2 className="size-5" /> 再听一遍
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => (
                <Opt key={o} label={o} big picked={picked} correct={q.correct} onPick={pick} />
              ))}
            </div>
          </>
        )}

        {q.kind === "seeLetter" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">
              这个字母发什么音?
            </p>
            <div className="flex justify-center">
              <div className="text-7xl font-black text-primary">{q.letter}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => (
                <Opt key={o} label={o} mono picked={picked} correct={q.correct} onPick={pick} />
              ))}
            </div>
          </>
        )}

        {q.kind === "matchWord" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">
              听这个词,选出对应的图
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => speak(q.correctWord)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow"
              >
                <Volume2 className="size-5" /> 再听一遍
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {q.options.map((o) => (
                <button
                  key={o.word}
                  disabled={!!picked}
                  onClick={() => pick(o.word)}
                  className={
                    "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition " +
                    (picked === null
                      ? "border-border bg-card hover:border-primary/50"
                      : o.word === q.correctWord
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                      : picked === o.word
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30"
                      : "border-border bg-card opacity-60")
                  }
                >
                  <span className="text-5xl">{o.emoji}</span>
                  {picked && (
                    <span className="text-xs font-bold text-muted-foreground">{o.word}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ─── helpers ──
type Q =
  | { kind: "hearLetter"; correct: string; options: string[] }
  | { kind: "seeLetter"; correct: string; options: string[]; letter: string }
  | { kind: "matchWord"; correctWord: string; correctEmoji: string; options: { word: string; emoji: string }[] };

function buildOneQuestion(item: PhonicsItem): Q {
  const sameGroupOthers = PHONICS_ITEMS.filter(
    (p) => p.groupId === item.groupId && p.id !== item.id
  );
  const pool = sameGroupOthers.length >= 3 ? sameGroupOthers : PHONICS_ITEMS.filter((p) => p.id !== item.id);
  const distractors = shuffle(pool).slice(0, 3);

  // 三种题型轮转(按 sortOrder mod 3)
  const kindIdx = item.sortOrder % 3;

  if (kindIdx === 0) {
    return {
      kind: "hearLetter",
      correct: item.letter,
      options: shuffle([item.letter, ...distractors.map((p) => p.letter)]),
    };
  }
  if (kindIdx === 1) {
    return {
      kind: "seeLetter",
      letter: item.letterUpper ?? item.letter,
      correct: item.sound,
      options: shuffle([item.sound, ...distractors.map((p) => p.sound)]),
    };
  }
  const word0 = item.exampleWords.find((w) => w.emoji && w.word) ?? item.exampleWords[0];
  if (word0?.emoji && word0?.word) {
    const otherWords = PHONICS_ITEMS.flatMap((p) =>
      p.id === item.id ? [] : p.exampleWords.filter((w) => w.emoji && w.word)
    );
    return {
      kind: "matchWord",
      correctWord: word0.word,
      correctEmoji: word0.emoji!,
      options: shuffle([
        { word: word0.word, emoji: word0.emoji! },
        ...shuffle(otherWords).slice(0, 2).map((w) => ({ word: w.word, emoji: w.emoji! })),
      ]),
    };
  }
  // fallback
  return {
    kind: "hearLetter",
    correct: item.letter,
    options: shuffle([item.letter, ...distractors.map((p) => p.letter)]),
  };
}

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function Opt({
  label,
  big,
  mono,
  picked,
  correct,
  onPick,
}: {
  label: string;
  big?: boolean;
  mono?: boolean;
  picked: string | null;
  correct: string;
  onPick: (label: string) => void;
}) {
  const isCorrect = label === correct;
  const isPicked = picked === label;
  return (
    <button
      disabled={!!picked}
      onClick={() => onPick(label)}
      className={
        "rounded-2xl border-2 px-4 py-4 font-extrabold transition " +
        (big ? "text-3xl " : "text-base ") +
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
      <span className="inline-flex items-center gap-1.5">
        {label}
        {picked && isCorrect && <Check className="size-4" />}
        {picked && isPicked && !isCorrect && <X className="size-4" />}
      </span>
    </button>
  );
}