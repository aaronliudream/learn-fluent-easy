import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid as speak, prefetchTTSBatchKid as prefetchTTSBatch } from "@/lib/speak";
import {
  PHONICS_ITEMS,
  PHONICS_GROUPS,
  type PhonicsItem } from
"@/data/primaryPhonics";
import { PHONICS_ITEMS_G2, PHONICS_GROUPS_G2 } from "@/data/primaryPhonicsG2";
import {
  bumpPhonicsLevel,
  bumpPhonicsMastery } from
"@/lib/phonicsMastery";
import { celebratePet } from "@/components/pet/EvolutionCelebration";
import { bondOnSparkEcho, bondOnPhonicsLearnPass } from "@/lib/petGrowth";
import {
  nextActionAfterPhonicsLearn,
  recordNewSoundLearned,
  type NextAction,
} from "@/lib/phonicsJourney";
import { getPhonicsMasteryMap } from "@/lib/phonicsMastery";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles as SparklesIcon, Target } from "lucide-react";

/** 学单个音 → 复习字母名/拼读音/口型/笔顺/儿歌/例词/小知识 → mini-quiz 3 题。 */
export default function PrimaryPhonicsLearn() {
  const { phonicsId } = useParams<{phonicsId: string;}>();
  const [search] = useSearchParams();
  const nav = useNavigate();
  const item = useMemo(
    () =>
    PHONICS_ITEMS.find((it) => it.id === phonicsId) ??
    PHONICS_ITEMS_G2.find((it) => it.id === phonicsId) ??
    null,
    [phonicsId]
  );
  const group = useMemo(
    () =>
    item ?
    PHONICS_GROUPS.find((g) => g.id === item.groupId) ??
    PHONICS_GROUPS_G2.find((g) => g.id === item.groupId) :
    null,
    [item]
  );
  const isG2 = search.get("grade") === "2" || PHONICS_ITEMS_G2.some((it) => it.id === phonicsId);
  const phonicsHref = isG2 ? "/primary/phonics?grade=2" : "/primary/phonics";
  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [nextAction, setNextAction] = useState<NextAction | null>(null);

  useEffect(() => {
    if (!item) return;
    document.title = `学拼读 ${item.letter} | FluentPath`;
    const t = window.setTimeout(() => {
      prefetchTTSBatch(
        [
        item.letterUpper ?? item.letter,
        item.chantEn,
        ...item.exampleWords.slice(0, 2).map((w) => w.word)].
        filter(Boolean) as string[]
      );
    }, 600);
    return () => window.clearTimeout(t);
  }, [item]);

  if (!item) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <BackLink to={phonicsHref} className="text-sm text-muted-foreground">
          <T>← 返回拼读冒险</T>
        </BackLink>
        <p className="mt-6 text-sm text-muted-foreground"><T>没找到这个音。</T></p>
      </main>);

  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink
        to={phonicsHref}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        
        <ArrowLeft className="size-4" /> <T>返回拼读冒险</T>
      </BackLink>
      {group &&
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {group.groupName} · {item.letter}
        </div>
      }

      {phase === "learn" &&
      <>
          <LetterDetail item={item} />
          <SparkEchoCard item={item} />
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
            onClick={() => setPhase("quiz")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-8 py-4 text-lg font-extrabold text-white shadow-tile transition hover:-translate-y-0.5">
            
              <Check className="size-5" /> <T>我学会了,开始测试</T>
            </button>
            <button
            onClick={() =>
            speak(item.exampleWords[0]?.word ?? item.letterUpper ?? item.letter)
            }
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
            await bumpPhonicsLevel(item.id, 1, 3);
            try {bondOnPhonicsLearnPass();} catch {/* noop */}
            try { recordNewSoundLearned(item.id); } catch {/* noop */}
          }
          celebratePet({
            kind: "levelup",
            emoji: "🦊",
            title: allCorrect ? "全对!Spark 学会啦~" : "练完啦,继续加油!",
            subtitle: allCorrect ? `${item.letter} +1 掌握度 · Spark +15 亲密度` : "下次再考一遍"
          });
          // 计算"下一步"卡片(用最新 mastery)
          try {
            const m = await getPhonicsMasteryMap();
            const grade = isG2 ? 2 : 1;
            const action = nextActionAfterPhonicsLearn({ item, mastery: m, grade });
            setNextAction(action);
          } catch {/* noop */}
          setPhase("done");
        }} />

      }

      {phase === "done" &&
      <NextStepCard action={nextAction} fallbackHref={phonicsHref} letterLabel={item.letter} />
      }
    </main>);

}

// ─── 学完之后的"下一步"卡片 ──────────────────────────────
function NextStepCard({
  action,
  fallbackHref,
  letterLabel,
}: {
  action: NextAction | null;
  fallbackHref: string;
  letterLabel: string;
}) {
  if (!action) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        <T>正在为你挑下一步…</T>
      </div>
    );
  }

  const cards: Record<NextAction["kind"], { emoji: string; title: string; sub: string; cta: string; gradient: string; icon: React.ReactNode }> = {
    useIt: {
      emoji: "✨",
      title: `用一下 ${letterLabel}`,
      sub: "把刚学的音用到一个真词里,你就真的会啦!",
      cta: "去用一下",
      gradient: "from-amber-500 via-orange-500 to-rose-500",
      icon: <SparklesIcon className="size-5" />,
    },
    readBook: {
      emoji: "📖",
      title: "去读今天的小绘本",
      sub: `这本绘本里就藏着 ${letterLabel} 的音,我们一起把它找出来!`,
      cta: "和 Spark 读绘本",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      icon: <BookOpen className="size-5" />,
    },
    challenge: {
      emoji: "🏆",
      title: "整组挑战开始!",
      sub: "本组每个音你都见过啦,来一次小挑战吧!",
      cta: "开始挑战",
      gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
      icon: <Target className="size-5" />,
    },
    review: {
      emoji: "🔁",
      title: "老朋友找你啦",
      sub: "之前学过的音想再见你一面!",
      cta: "去复习",
      gradient: "from-sky-500 via-cyan-500 to-emerald-500",
      icon: <Target className="size-5" />,
    },
    newSound: {
      emoji: "🔤",
      title: "继续学下一个新音",
      sub: "Spark 想再教你一个~",
      cta: "学新音",
      gradient: "from-rose-500 via-pink-500 to-amber-500",
      icon: <ArrowRight className="size-5" />,
    },
  };

  const c = cards[action.kind];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-3 text-center text-sm font-bold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
        🌟 <T>太棒啦!这个音收下啦~</T>
      </div>
      <Link
        to={action.href}
        className={`block rounded-3xl bg-gradient-to-r ${c.gradient} p-5 text-left text-white shadow-tile transition hover:-translate-y-0.5`}
      >
        <div className="text-[11px] font-bold uppercase tracking-wider opacity-90"><T>下一步</T></div>
        <div className="mt-1 flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/25 text-2xl backdrop-blur-sm">
            {c.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold"><T>{c.title}</T></div>
            <div className="text-xs opacity-90"><T>{c.sub}</T></div>
          </div>
          {c.icon}
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-sm font-extrabold backdrop-blur-sm">
          <T>{c.cta}</T> →
        </div>
      </Link>
      <div className="text-center">
        <Link to={fallbackHref} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          <T>← 返回拼读冒险</T>
        </Link>
      </div>
    </div>
  );
}

// ─── 字母详情(精简版,从 PrimaryLetters.tsx 的 LetterCard 提炼) ──
function LetterDetail({ item: l }: {item: PhonicsItem;}) {
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
            {l.letterNameIpa &&
            <div className="mt-1 font-mono text-sm opacity-90"><T>字母名</T> {l.letterNameIpa}</div>
            }
          </div>
          <div className="flex flex-col gap-2">
            {l.letterUpper &&
            <button
              onClick={() => speak(upper)}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30">
              
                <Volume2 className="size-4" /> <T>字母名</T>
              </button>
            }
            <button
              onClick={() => speak(l.exampleWords[0]?.word ?? upper)}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30">
              
              <Sparkles className="size-4" /> <T>拼读音</T>
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/25 px-3 py-1 font-mono"><T>短音</T> {l.sound}</span>
          {l.longSound &&
          <span className="rounded-full bg-white/25 px-3 py-1 font-mono"><T>长音</T> {l.longSound}</span>
          }
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {l.soundDesc &&
        <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground"><T>👄 发音口型</T></div>
            <p className="mt-1 text-sm">{l.soundDesc}</p>
          </div>
        }
        {l.strokeOrder &&
        <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground"><T>✍️ 书写笔顺</T></div>
            <p className="mt-1 text-sm">{l.strokeOrder}</p>
          </div>
        }
      </div>

      <div>
        <div className="mb-2 text-xs font-bold text-muted-foreground"><T>🎴 拼读例词</T></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {l.exampleWords.map((w, i) =>
          <button
            key={i}
            onClick={() => speak(w.word)}
            className="group flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            
              <div className="text-3xl">{w.emoji}</div>
              <div className="text-sm font-extrabold">{w.word}</div>
              {w.ipa && <div className="text-[10px] font-mono text-muted-foreground">{w.ipa}</div>}
              {w.meaningCn && <div className="text-xs text-muted-foreground">{w.meaningCn}</div>}
            </button>
          )}
        </div>
      </div>

      {l.funFact &&
      <div className="rounded-2xl bg-violet-50 p-3 text-xs text-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
          💡 <span className="font-bold"><T>小知识：</T></span>{l.funFact}
        </div>
      }
    </div>);

}

// ─── Spark 想听你念 ── 让孩子模仿 Spark 念音 + 例词,+5 亲密度 ──
function SparkEchoCard({ item }: {item: PhonicsItem;}) {
  const [echoed, setEchoed] = useState(false);
  const sound = item.sound.replace(/[\/\[\]]/g, "");
  const chant = `${sound}... ${sound}... ${sound}...`;
  const wordsLine = item.exampleWords.slice(0, 4).map((w) => w.word).join(", ");

  function playSparkChant() {
    // 念三次音 + 例词,中间稍作停顿,模拟 Spark 在示范。
    speak(`${chant}. ${wordsLine}`);
  }

  function handleEcho() {
    if (echoed) return;
    setEchoed(true);
    try {bondOnSparkEcho();} catch {/* noop */}
  }

  return (
    <div className="mt-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 shadow-tile dark:border-amber-900/40 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30">
      <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700 dark:text-amber-300">
        <span className="text-xl">🦊</span> <T>Spark 想听你念</T>
      </div>

      <button
        onClick={playSparkChant}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600">
        
        <Volume2 className="size-4" /> <T>听 Spark 念</T>
      </button>

      <div className="mt-3 space-y-1 rounded-2xl bg-white/70 px-4 py-3 text-center dark:bg-background/40">
        <div className="font-mono text-xl font-extrabold tracking-wider text-amber-700 dark:text-amber-300">
          {chant}
        </div>
        <div className="text-sm font-bold text-foreground/80">{wordsLine}</div>
      </div>

      <p className="mt-3 text-sm italic text-muted-foreground">
        <T>“现在你跟着我念一遍好不好?”</T>
      </p>

      <button
        onClick={handleEcho}
        disabled={echoed}
        className={
        "mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition " + (
        echoed ?
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
        "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow hover:-translate-y-0.5")
        }>
        
        {echoed ?
        <>
            <Check className="size-4" /> <T>已跟读 · Spark +5 亲密度 💖</T>
          </> :

        <>
            <Sparkles className="size-4" /> <T>我跟着 Spark 念了</T>
          </>
        }
      </button>
    </div>);

}

// ─── Mini Quiz(3 题:听音选字母 / 看字母选音 / 选例词) ──
type Q =
{kind: "hearLetter";correct: string;options: string[];} // 播 sound,选 letter
| {kind: "seeLetter";correct: string;options: string[];letter: string;} // 显示字母,选 IPA
| {kind: "matchWord";correctWord: string;correctEmoji: string;options: {word: string;emoji: string;}[];};

function buildQuiz(item: PhonicsItem): Q[] {
  const itemPool = PHONICS_ITEMS_G2.some((it) => it.id === item.id) ? PHONICS_ITEMS_G2 : PHONICS_ITEMS;
  const sameGroupOthers = itemPool.filter(
    (p) => p.groupId === item.groupId && p.id !== item.id
  );
  const distractorPool = sameGroupOthers.length >= 3 ?
  sameGroupOthers :
  itemPool.filter((p) => p.id !== item.id);

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
    ...pickN(distractorPool, 3).map((p) => p.letter)]
    )
  });

  // Q2 看字母选 IPA(只对单字母 / 有 sound 的都行)
  qs.push({
    kind: "seeLetter",
    letter: item.letterUpper ?? item.letter,
    correct: item.sound,
    options: shuffle([
    item.sound,
    ...pickN(distractorPool, 3).map((p) => p.sound)]
    )
  });

  // Q3 选例词(听 word,选 emoji)
  const word0 = item.exampleWords[0];
  if (word0?.emoji && word0?.word) {
    const otherWords = itemPool.flatMap((p) =>
    p.id === item.id ? [] : p.exampleWords.filter((w) => w.emoji && w.word)
    );
    qs.push({
      kind: "matchWord",
      correctWord: word0.word,
      correctEmoji: word0.emoji,
      options: shuffle([
      { word: word0.word, emoji: word0.emoji },
      ...pickN(otherWords, 2).map((w) => ({ word: w.word, emoji: w.emoji! }))]
      )
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

function MiniQuiz({ item, onDone }: {item: PhonicsItem;onDone: (allCorrect: boolean) => void;}) {
  const questions = useMemo(() => buildQuiz(item), [item]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[idx];

  // 自动播放(听音题)
  useEffect(() => {
    if (!q) return;
    const t = setTimeout(() => {
      if (q.kind === "hearLetter") speak(item.exampleWords[0]?.word ?? item.letter);else
      if (q.kind === "matchWord") speak(q.correctWord);
    }, 250);
    return () => clearTimeout(t);
  }, [idx, q, item]);

  if (!q) return null;

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    let isCorrect = false;
    if (q.kind === "hearLetter") isCorrect = opt === q.correct;else
    if (q.kind === "seeLetter") isCorrect = opt === q.correct;else
    if (q.kind === "matchWord") isCorrect = opt === q.correctWord;
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
        <span><T>第</T> {idx + 1} <T>题 /</T> {questions.length}</span>
        <span>✓ {correctCount}</span>
      </div>

      {q.kind === "hearLetter" &&
      <QuizFrame
        prompt="听这个音,选出对应的字母"
        aux={
        <button
          onClick={() => speak(item.exampleWords[0]?.word ?? item.letter)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow">
          
              <Volume2 className="size-5" /> <T>再听一遍</T>
            </button>
        }>
        
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o) =>
          <OptionBtn key={o} label={o} big picked={picked} correct={q.correct} onPick={pick} />
          )}
          </div>
        </QuizFrame>
      }

      {q.kind === "seeLetter" &&
      <QuizFrame
        prompt="这个字母发什么音?"
        aux={
        <div className="text-7xl font-black text-primary">{q.letter}</div>
        }>
        
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o) =>
          <OptionBtn key={o} label={o} mono picked={picked} correct={q.correct} onPick={pick} />
          )}
          </div>
        </QuizFrame>
      }

      {q.kind === "matchWord" &&
      <QuizFrame
        prompt="听这个词,选出对应的图"
        aux={
        <button
          onClick={() => speak(q.correctWord)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow">
          
              <Volume2 className="size-5" /> <T>再听一遍</T>
            </button>
        }>
        
          <div className="grid grid-cols-3 gap-3">
            {q.options.map((o) =>
          <button
            key={o.word}
            disabled={!!picked}
            onClick={() => pick(o.word)}
            className={
            "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition " + (
            picked === null ?
            "border-border bg-card hover:border-primary/50" :
            o.word === q.correctWord ?
            "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" :
            picked === o.word ?
            "border-rose-400 bg-rose-50 dark:bg-rose-950/30" :
            "border-border bg-card opacity-60")
            }>
            
                <span className="text-5xl">{o.emoji}</span>
                {picked &&
            <span className="text-xs font-bold text-muted-foreground">{o.word}</span>
            }
              </button>
          )}
          </div>
        </QuizFrame>
      }
    </div>);

}

function QuizFrame({
  prompt,
  aux,
  children




}: {prompt: string;aux?: React.ReactNode;children: React.ReactNode;}) {
  return (
    <div className="space-y-4 rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
      <p className="text-center text-sm font-bold text-muted-foreground">{prompt}</p>
      {aux && <div className="flex justify-center">{aux}</div>}
      {children}
    </div>);

}

function OptionBtn({
  label,
  big,
  mono,
  picked,
  correct,
  onPick







}: {label: string;big?: boolean;mono?: boolean;picked: string | null;correct: string;onPick: (label: string) => void;}) {
  const isCorrect = label === correct;
  const isPicked = picked === label;
  return (
    <button
      disabled={!!picked}
      onClick={() => onPick(label)}
      className={
      "rounded-2xl border-2 px-4 py-4 font-extrabold transition " + (
      big ? "text-3xl " : "text-base ") + (
      mono ? "font-mono " : "") + (
      picked === null ?
      "border-border bg-card hover:border-primary/50" :
      isCorrect ?
      "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" :
      isPicked ?
      "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" :
      "border-border bg-card opacity-60")
      }>
      
      <span className="inline-flex items-center gap-1.5">
        {label}
        {picked && isCorrect && <Check className="size-4" />}
        {picked && isPicked && !isCorrect && <X className="size-4" />}
      </span>
    </button>);

}