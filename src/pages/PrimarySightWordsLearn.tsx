import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid as speak } from "@/lib/speak";
import {
  SIGHT_WORD_GROUPS,
  SIGHT_WORD_ITEMS,
  type SightWordItem } from
"@/data/primarySightWords";
import {
  SIGHT_WORD_GROUPS_G2,
  SIGHT_WORD_ITEMS_G2 } from
"@/data/primarySightWordsG2";
import {
  bumpSightWordLevel,
  bumpSightWordMastery } from
"@/lib/sightWordMastery";
import { buildSightWordDistractors } from "@/lib/sightWordDistractors";
import { celebratePet } from "@/components/pet/EvolutionCelebration";
import { bondOnSparkEcho, bondOnPhonicsLearnPass } from "@/lib/petGrowth";

// 一些功能词在孤立朗读时,TTS 会读成强读音(如 "the" → /ðiː/)。
// 在小学英语启蒙阶段我们想让孩子先听到自然语流里的弱读形式,
// 所以这里用一个近似的拼写让 TTS 读出弱音 schwa。
function speakWordKid(word: string) {
  const w = word.trim().toLowerCase();
  if (w === "the") return speak("thuh");
  return speak(word);
}

/**
 * 单个 Sight Word 学习页 — 复用 Phonics 单音学习页的形态:
 *  大字 + IPA + 词性 + 中文 + 例句 + Spark 小知识 → "我学会了" → MiniQuiz 3 题轮换.
 */
export default function PrimarySightWordsLearn() {
  const { wordId } = useParams<{wordId: string;}>();
  const [search] = useSearchParams();
  const nav = useNavigate();
  const item = useMemo(
    () =>
    SIGHT_WORD_ITEMS.find((w) => w.id === wordId) ??
    SIGHT_WORD_ITEMS_G2.find((w) => w.id === wordId) ??
    null,
    [wordId]
  );
  const group = useMemo(
    () =>
    item ?
    SIGHT_WORD_GROUPS.find((g) => g.id === item.groupId) ??
    SIGHT_WORD_GROUPS_G2.find((g) => g.id === item.groupId) ??
    null :
    null,
    [item]
  );
  const isG2 = search.get("grade") === "2" || SIGHT_WORD_ITEMS_G2.some((w) => w.id === wordId);
  const sightWordsHref = isG2 ? "/primary/sight-words?grade=2" : "/primary/sight-words";
  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");

  useEffect(() => {
    if (!item) return;
    document.title = `学常见小词 ${item.word} | FluentPath`;
    const t = window.setTimeout(() => speakWordKid(item.word), 350);
    return () => clearTimeout(t);
  }, [item]);

  if (!item) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <BackLink to={sightWordsHref} className="text-sm text-muted-foreground">
          <T>← 返回常见小词冒险</T>
        </BackLink>
        <p className="mt-6 text-sm text-muted-foreground"><T>没找到这个词。</T></p>
      </main>);

  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink
        to={sightWordsHref}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        
        <ArrowLeft className="size-4" /> <T>返回常见小词冒险</T>
      </BackLink>
      {group &&
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {group.groupName} · {item.word}
        </div>
      }

      {phase === "learn" &&
      <>
          <WordDetail item={item} />
          {item.sparkLine && <SparkLineCard line={item.sparkLine} />}
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
            onClick={() => setPhase("quiz")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-8 py-4 text-lg font-extrabold text-white shadow-tile transition hover:-translate-y-0.5">
            
              <Check className="size-5" /> <T>我学会了,开始测试</T>
            </button>
            <button
            onClick={() => speakWordKid(item.word)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline">
              <T>再听一遍 🔊</T>
            
          </button>
          </div>
        </>
      }

      {phase === "quiz" &&
      <MiniQuiz
        item={item}
        onDone={async (allCorrect) => {
          if (allCorrect) {
            await bumpSightWordLevel(item.id, 1, 3);
            try {bondOnPhonicsLearnPass();} catch {/* noop */}
          }
          celebratePet({
            kind: "levelup",
            emoji: "📖",
            title: allCorrect ? "全对!Spark 学会啦~" : "练完啦,继续加油!",
            subtitle: allCorrect ?
            `${item.word} +1 掌握度 · Spark +15 亲密度` :
            "下次再考一遍"
          });
          setPhase("done");
          setTimeout(() => nav(sightWordsHref), 1600);
        }} />

      }

      {phase === "done" &&
      <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <T>回到常见小词冒险…</T>
        </div>
      }
    </main>);

}

function WordDetail({ item }: {item: SightWordItem;}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 p-6 text-white shadow-tile">
        <div className="text-center">
          <div className="text-7xl font-black leading-none">{item.word}</div>
          <div className="mt-2 font-mono text-sm opacity-90">{item.ipa}</div>
          <div className="mt-2 inline-flex gap-2 text-xs">
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 font-mono">{item.pos}</span>
            <span className="rounded-full bg-white/25 px-2.5 py-0.5">{item.posCn}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => speakWordKid(item.word)}
            className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30">
            
            <Volume2 className="size-4" /> <T>听 Spark 念</T>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="text-xs font-bold text-muted-foreground"><T>💡 这个词的意思</T></div>
        <p className="mt-1 text-base font-bold">{item.meaningCn}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="text-xs font-bold text-muted-foreground"><T>📖 例句</T></div>
        <button
          onClick={() => speak(item.exampleSentence)}
          className="mt-1 inline-flex items-center gap-1.5 text-base font-bold hover:underline">
          
          <Volume2 className="size-4 text-sky-600" /> {item.exampleSentence}
        </button>
        <p className="mt-1 text-sm text-muted-foreground">{item.exampleSentenceCn}</p>
        {item.exampleSentenceEmoji &&
        <div className="mt-1 text-2xl">{item.exampleSentenceEmoji}</div>
        }
      </div>
    </div>);

}

function SparkLineCard({ line }: {line: string;}) {
  return (
    <div className="mt-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 shadow-tile dark:border-amber-900/40 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30">
      <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700 dark:text-amber-300">
        <span className="text-xl">🦊</span> <T>Spark 想告诉你一个秘密</T>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{line}</p>
    </div>);

}

// ─── Mini Quiz: 3 道题轮换(recognize / listen / context) ──
type Q =
{kind: "recognize";correct: string;options: string[];} // 看词选中文
| {kind: "listen";correct: string;options: string[];} // 听词选写法
| {kind: "context";correctWord: string;sentenceParts: [string, string];cn: string;options: string[];}; // 看句子选词

function buildQuiz(item: SightWordItem): Q[] {
  const allItems = [...SIGHT_WORD_ITEMS, ...SIGHT_WORD_ITEMS_G2];
  const pool = allItems.map((w) => ({ id: w.id, word: w.word }));
  const distractors = buildSightWordDistractors(item.id, pool, 3);
  const meaningPool = allItems.filter((w) => w.id !== item.id);
  const meaningDistractors = shuffle(meaningPool).slice(0, 3).map((w) => w.meaningCn);

  const qs: Q[] = [];
  // 1) recognize: 看词选中文
  qs.push({
    kind: "recognize",
    correct: item.meaningCn,
    options: shuffle([item.meaningCn, ...meaningDistractors])
  });
  // 2) listen: 听词选写法
  qs.push({
    kind: "listen",
    correct: item.word,
    options: shuffle([item.word, ...distractors])
  });
  // 3) context: 完形填空(把例句中的词挖掉)
  const ctxQ = buildContext(item, distractors);
  if (ctxQ) qs.push(ctxQ);
  while (qs.length < 3) {
    qs.push({
      kind: "listen",
      correct: item.word,
      options: shuffle([item.word, ...buildSightWordDistractors(item.id, pool, 3)])
    });
  }
  return qs.slice(0, 3);
}

function buildContext(item: SightWordItem, distractors: string[]): Q | null {
  const sent = item.exampleSentence;
  if (!sent) return null;
  // 大小写不敏感的整词替换,只挖第一个出现位置
  const pattern = new RegExp(`\\b${escapeRegex(item.word)}\\b`, "i");
  const match = sent.match(pattern);
  if (!match || match.index == null) return null;
  const before = sent.slice(0, match.index);
  const after = sent.slice(match.index + match[0].length);
  return {
    kind: "context",
    correctWord: item.word,
    sentenceParts: [before, after],
    cn: item.exampleSentenceCn,
    options: shuffle([item.word, ...distractors])
  };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function MiniQuiz({ item, onDone }: {item: SightWordItem;onDone: (allCorrect: boolean) => void;}) {
  const questions = useMemo(() => buildQuiz(item), [item]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [retryArmed, setRetryArmed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[idx];

  useEffect(() => {
    if (!q) return;
    if (q.kind === "listen") {
      const t = setTimeout(() => speakWordKid(item.word), 250);
      return () => clearTimeout(t);
    }
  }, [q, item]);

  if (!q) return null;

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    let isCorrect = false;
    if (q.kind === "recognize") isCorrect = opt === q.correct;else
    if (q.kind === "listen") isCorrect = opt === q.correct;else
    isCorrect = opt === q.correctWord;

    void bumpSightWordMastery(item.id, q.kind, isCorrect);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setTimeout(() => {
        setPicked(null);
        setRetryArmed(false);
        if (idx < questions.length - 1) setIdx(idx + 1);else
        onDone(correctCount + 1 === questions.length);
      }, 800);
    } else {
      setTimeout(() => {
        setPicked(null);
        if (!retryArmed) {
          setRetryArmed(true); // 同题再来一次
        } else {
          setRetryArmed(false);
          if (idx < questions.length - 1) setIdx(idx + 1);else
          onDone(correctCount === questions.length);
        }
      }, 1100);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span><T>第</T> {idx + 1} <T>题 /</T> {questions.length}{retryArmed && <span className="ml-1 text-rose-600"><T>· 再来一次</T></span>}</span>
        <span>✓ {correctCount}</span>
      </div>

      {q.kind === "recognize" &&
      <QuizFrame
        prompt="这个词的中文是什么?"
        aux={<div className="text-6xl font-black text-sky-600 dark:text-sky-300">{item.word}</div>}>
        
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {q.options.map((o) =>
          <OptionBtn key={o} label={o} picked={picked} correct={q.correct} onPick={pick} />
          )}
          </div>
        </QuizFrame>
      }

      {q.kind === "listen" &&
      <QuizFrame
        prompt="听这个词,选出正确的写法"
        aux={
        <button
          onClick={() => speakWordKid(item.word)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow">
          
              <Volume2 className="size-5" /> <T>再听一遍</T>
            </button>
        }>
        
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o) =>
          <OptionBtn key={o} label={o} picked={picked} correct={q.correct} onPick={pick} big mono />
          )}
          </div>
        </QuizFrame>
      }

      {q.kind === "context" &&
      <QuizFrame
        prompt="选出能填进句子里的词"
        aux={
        <div className="space-y-1 text-center">
              <div className="text-xl font-bold">
                {q.sentenceParts[0]}
                <span className="mx-1 inline-block rounded-md bg-sky-100 px-3 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">____</span>
                {q.sentenceParts[1]}
              </div>
              <div className="text-xs text-muted-foreground">{q.cn}</div>
            </div>
        }>
        
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o) =>
          <OptionBtn key={o} label={o} picked={picked} correct={q.correctWord} onPick={pick} big mono />
          )}
          </div>
        </QuizFrame>
      }
    </div>);

}

function QuizFrame({
  prompt, aux, children
}: {prompt: string;aux?: React.ReactNode;children: React.ReactNode;}) {
  return (
    <div className="space-y-4 rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
      <p className="text-center text-sm font-bold text-muted-foreground">{prompt}</p>
      {aux && <div className="flex justify-center">{aux}</div>}
      {children}
    </div>);

}

function OptionBtn({
  label, picked, correct, onPick, big, mono
}: {label: string;picked: string | null;correct: string;onPick: (l: string) => void;big?: boolean;mono?: boolean;}) {
  const isCorrect = label === correct;
  const isPicked = picked === label;
  return (
    <button
      disabled={!!picked}
      onClick={() => onPick(label)}
      className={
      "rounded-2xl border-2 px-4 py-4 font-extrabold transition " + (
      big ? "text-2xl " : "text-base ") + (
      mono ? "font-mono " : "") + (
      picked === null ?
      "border-border bg-card hover:border-primary/50" :
      isCorrect ?
      "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" :
      isPicked ?
      "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" :
      "border-border bg-card opacity-60")
      }>
      
      {label}
    </button>);

}