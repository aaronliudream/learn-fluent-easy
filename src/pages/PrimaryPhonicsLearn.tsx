import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Music, Sparkles, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid as speak, prefetchTTSBatchKid as prefetchTTSBatch } from "@/lib/speak";
import {
  PHONICS_ITEMS,
  PHONICS_GROUPS,
  type PhonicsItem,
} from "@/data/primaryPhonics";
import {
  bumpPhonicsLevel,
  bumpPhonicsMastery,
} from "@/lib/phonicsMastery";
import { celebratePet } from "@/components/pet/EvolutionCelebration";

/** 学单个音 → 复习字母名/拼读音/口型/笔顺/儿歌/例词/小知识 → mini-quiz 3 题。 */
export default function PrimaryPhonicsLearn() {
  const { phonicsId } = useParams<{ phonicsId: string }>();
  const nav = useNavigate();
  const item = useMemo(
    () => PHONICS_ITEMS.find((it) => it.id === phonicsId) ?? null,
    [phonicsId]
  );
  const group = useMemo(
    () => (item ? PHONICS_GROUPS.find((g) => g.id === item.groupId) : null),
    [item]
  );
  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");

  useEffect(() => {
    if (!item) return;
    document.title = `学拼读 ${item.letter} | FluentPath`;
    const t = window.setTimeout(() => {
      prefetchTTSBatch(
        [
          item.letterUpper ?? item.letter,
          item.chantEn,
          ...item.exampleWords.slice(0, 2).map((w) => w.word),
        ].filter(Boolean) as string[]
      );
    }, 600);
    return () => window.clearTimeout(t);
  }, [item]);

  if (!item) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <BackLink to="/primary/phonics" className="text-sm text-muted-foreground">
          ← 返回拼读冒险
        </BackLink>
        <p className="mt-6 text-sm text-muted-foreground">没找到这个音。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink
        to="/primary/phonics"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回拼读冒险
      </BackLink>
      {group && (
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {group.groupName} · {item.letter}
        </div>
      )}

      {phase === "learn" && (
        <>
          <LetterDetail item={item} />
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              onClick={() => setPhase("quiz")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-8 py-4 text-lg font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
            >
              <Check className="size-5" /> 我学会了 ✓
            </button>
            <button
              onClick={() =>
                speak(item.exampleWords[0]?.word ?? item.letterUpper ?? item.letter)
              }
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              再听一遍 🔊
            </button>
          </div>
        </>
      )}

      {phase === "quiz" && (
        <MiniQuiz
          item={item}
          onDone={async (allCorrect) => {
            if (allCorrect) await bumpPhonicsLevel(item.id, 1, 3);
            celebratePet({
              kind: "levelup",
              emoji: "🦊",
              title: allCorrect ? "全对!Spark 学会啦~" : "练完啦,继续加油!",
              subtitle: allCorrect ? `${item.letter} +1 掌握度` : "下次再考一遍",
            });
            setPhase("done");
            setTimeout(() => nav("/primary/phonics"), 1600);
          }}
        />
      )}

      {phase === "done" && (
        <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          回到拼读冒险…
        </div>
      )}
    </main>
  );
}

// ─── 字母详情(精简版,从 PrimaryLetters.tsx 的 LetterCard 提炼) ──
function LetterDetail({ item: l }: { item: PhonicsItem }) {
  const upper = l.letterUpper ?? l.letter.toUpperCase();
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-white shadow-tile">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[80px] font-black leading-none">
              {upper}
              <span className="text-white/80">{l.letter}</span>
            </div>
            {l.letterNameIpa && (
              <div className="mt-1 font-mono text-sm opacity-90">字母名 {l.letterNameIpa}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {l.letterUpper && (
              <button
                onClick={() => speak(upper)}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30"
              >
                <Volume2 className="size-4" /> 字母名
              </button>
            )}
            <button
              onClick={() => speak(l.exampleWords[0]?.word ?? upper)}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30"
            >
              <Sparkles className="size-4" /> 拼读音
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/25 px-3 py-1 font-mono">短音 {l.sound}</span>
          {l.longSound && (
            <span className="rounded-full bg-white/25 px-3 py-1 font-mono">长音 {l.longSound}</span>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {l.soundDesc && (
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground">👄 发音口型</div>
            <p className="mt-1 text-sm">{l.soundDesc}</p>
          </div>
        )}
        {l.strokeOrder && (
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground">✍️ 书写笔顺</div>
            <p className="mt-1 text-sm">{l.strokeOrder}</p>
          </div>
        )}
      </div>

      {(l.chantCn || l.chantEn) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Music className="size-4" /> 字母儿歌
            </div>
            {l.chantEn && (
              <button
                onClick={() => speak(l.chantEn!)}
                className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[11px] font-bold text-white hover:bg-amber-600"
              >
                <Volume2 className="size-3" /> 听
              </button>
            )}
          </div>
          {l.chantEn && <p className="mt-1.5 text-sm font-bold">{l.chantEn}</p>}
          {l.chantCn && <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">{l.chantCn}</p>}
        </div>
      )}

      <div>
        <div className="mb-2 text-xs font-bold text-muted-foreground">🎴 拼读例词</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {l.exampleWords.map((w, i) => (
            <button
              key={i}
              onClick={() => speak(w.word)}
              className="group flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <div className="text-3xl">{w.emoji}</div>
              <div className="text-sm font-extrabold">{w.word}</div>
              {w.ipa && <div className="text-[10px] font-mono text-muted-foreground">{w.ipa}</div>}
              {w.meaningCn && <div className="text-xs text-muted-foreground">{w.meaningCn}</div>}
            </button>
          ))}
        </div>
      </div>

      {l.funFact && (
        <div className="rounded-2xl bg-violet-50 p-3 text-xs text-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
          💡 <span className="font-bold">小知识：</span>{l.funFact}
        </div>
      )}
    </div>
  );
}

// ─── Mini Quiz(3 题:听音选字母 / 看字母选音 / 选例词) ──
type Q =
  | { kind: "hearLetter"; correct: string; options: string[] }    // 播 sound,选 letter
  | { kind: "seeLetter"; correct: string; options: string[]; letter: string } // 显示字母,选 IPA
  | { kind: "matchWord"; correctWord: string; correctEmoji: string; options: { word: string; emoji: string }[] };

function buildQuiz(item: PhonicsItem): Q[] {
  const sameGroupOthers = PHONICS_ITEMS.filter(
    (p) => p.groupId === item.groupId && p.id !== item.id
  );
  const distractorPool = sameGroupOthers.length >= 3
    ? sameGroupOthers
    : PHONICS_ITEMS.filter((p) => p.id !== item.id);

  const pickN = <T,>(arr: T[], n: number): T[] => {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c.slice(0, n);
  };

  const qs: Q[] = [];

  // Q1 听音选字母
  qs.push({
    kind: "hearLetter",
    correct: item.letter,
    options: shuffle([
      item.letter,
      ...pickN(distractorPool, 3).map((p) => p.letter),
    ]),
  });

  // Q2 看字母选 IPA(只对单字母 / 有 sound 的都行)
  qs.push({
    kind: "seeLetter",
    letter: item.letterUpper ?? item.letter,
    correct: item.sound,
    options: shuffle([
      item.sound,
      ...pickN(distractorPool, 3).map((p) => p.sound),
    ]),
  });

  // Q3 选例词(听 word,选 emoji)
  const word0 = item.exampleWords[0];
  if (word0?.emoji && word0?.word) {
    const otherWords = PHONICS_ITEMS.flatMap((p) =>
      p.id === item.id ? [] : p.exampleWords.filter((w) => w.emoji && w.word)
    );
    qs.push({
      kind: "matchWord",
      correctWord: word0.word,
      correctEmoji: word0.emoji,
      options: shuffle([
        { word: word0.word, emoji: word0.emoji },
        ...pickN(otherWords, 2).map((w) => ({ word: w.word, emoji: w.emoji! })),
      ]),
    });
  }

  return qs;
}

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function MiniQuiz({ item, onDone }: { item: PhonicsItem; onDone: (allCorrect: boolean) => void }) {
  const questions = useMemo(() => buildQuiz(item), [item]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[idx];

  // 自动播放(听音题)
  useEffect(() => {
    if (!q) return;
    const t = setTimeout(() => {
      if (q.kind === "hearLetter") speak(item.exampleWords[0]?.word ?? item.letter);
      else if (q.kind === "matchWord") speak(q.correctWord);
    }, 250);
    return () => clearTimeout(t);
  }, [idx, q, item]);

  if (!q) return null;

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    let isCorrect = false;
    if (q.kind === "hearLetter") isCorrect = opt === q.correct;
    else if (q.kind === "seeLetter") isCorrect = opt === q.correct;
    else if (q.kind === "matchWord") isCorrect = opt === q.correctWord;
    if (isCorrect) setCorrectCount((c) => c + 1);
    bumpPhonicsMastery(
      item.id,
      q.kind === "hearLetter" || q.kind === "matchWord" ? "listen" : "quiz",
      isCorrect
    );
    setTimeout(() => {
      if (idx < questions.length - 1) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        onDone(correctCount + (isCorrect ? 1 : 0) === questions.length);
      }
    }, 900);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>第 {idx + 1} 题 / {questions.length}</span>
        <span>✓ {correctCount}</span>
      </div>

      {q.kind === "hearLetter" && (
        <QuizFrame
          prompt="听这个音,选出对应的字母"
          aux={
            <button
              onClick={() => speak(item.exampleWords[0]?.word ?? item.letter)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow"
            >
              <Volume2 className="size-5" /> 再听一遍
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o) => (
              <OptionBtn key={o} label={o} big picked={picked} correct={q.correct} onPick={pick} />
            ))}
          </div>
        </QuizFrame>
      )}

      {q.kind === "seeLetter" && (
        <QuizFrame
          prompt="这个字母发什么音?"
          aux={
            <div className="text-7xl font-black text-primary">{q.letter}</div>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o) => (
              <OptionBtn key={o} label={o} mono picked={picked} correct={q.correct} onPick={pick} />
            ))}
          </div>
        </QuizFrame>
      )}

      {q.kind === "matchWord" && (
        <QuizFrame
          prompt="听这个词,选出对应的图"
          aux={
            <button
              onClick={() => speak(q.correctWord)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow"
            >
              <Volume2 className="size-5" /> 再听一遍
            </button>
          }
        >
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
        </QuizFrame>
      )}
    </div>
  );
}

function QuizFrame({
  prompt,
  aux,
  children,
}: {
  prompt: string;
  aux?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
      <p className="text-center text-sm font-bold text-muted-foreground">{prompt}</p>
      {aux && <div className="flex justify-center">{aux}</div>}
      {children}
    </div>
  );
}

function OptionBtn({
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