import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid } from "@/lib/speak";
import { SIGHT_WORDS, type SightWord } from "@/data/sightWords";
import {
  bumpSightWordLevel,
  bumpSightWordMastery,
  getSightWordMasteryMap,
  isSightWordDue,
} from "@/lib/sightWordMastery";
import { celebratePet } from "@/components/pet/EvolutionCelebration";

/**
 * Sight Words 测试 — 路由:
 *  /primary/sightwords/quiz/review     → SRS 到期
 *  /primary/sightwords/quiz/word/:id   → 单个词小测(学完立即测,3 题)
 *  /primary/sightwords/quiz/:level     → 整级挑战
 *
 * 题型:
 *  T1 听音选词:播放词,4 个写法选 1
 *  T2 看词选音:大字显示词,4 个音频按钮选 1
 */
export default function PrimarySightWordsQuiz() {
  const params = useParams();
  const nav = useNavigate();
  const mode: "review" | "word" | "level" = params.wordId
    ? "word"
    : params.groupId === "review"
    ? "review"
    : "level";
  const levelId = params.groupId as "K" | "G1" | "G2" | undefined;

  const [items, setItems] = useState<SightWord[]>([]);
  const [itemIdx, setItemIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [retryArmed, setRetryArmed] = useState(false);
  const [itemCorrects, setItemCorrects] = useState(0);
  const [perfectItems, setPerfectItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "高频词测试 | FluentPath";
    (async () => {
      if (mode === "word") {
        const w = SIGHT_WORDS.find((x) => x.id === params.wordId);
        if (w) setItems([w]);
      } else if (mode === "review") {
        const m = await getSightWordMasteryMap();
        const due = SIGHT_WORDS.filter((w) => isSightWordDue(m.get(w.id)));
        setItems(shuffle(due).slice(0, 8));
      } else if (mode === "level" && levelId) {
        setItems(shuffle(SIGHT_WORDS.filter((w) => w.level === levelId)));
      }
      setLoading(false);
    })();
  }, [mode, levelId, params.wordId]);

  const totalItems = items.length;
  const cur = items[itemIdx];
  const isFinished = !loading && totalItems > 0 && itemIdx >= totalItems;
  // word 模式 = 3 题, 其余 = 2 题/词
  const subsPerItem = mode === "word" ? 3 : 2;

  const q = useMemo(() => (cur ? buildQuestion(cur, subIdx) : null), [cur, subIdx]);

  useEffect(() => {
    if (!isFinished) return;
    let cancel = false;
    (async () => {
      const allCorrect = perfectItems === totalItems;
      celebratePet({
        kind: "levelup",
        emoji: "📖",
        title: `完成!通过 ${perfectItems}/${totalItems}`,
        subtitle: allCorrect ? "全部全对!太棒了" : "没全对的词明天再考你哦",
      });
      if (cancel) return;
      const t = setTimeout(() => nav("/primary/sightwords"), 1600);
      return () => clearTimeout(t);
    })();
    return () => { cancel = true; };
  }, [isFinished, perfectItems, totalItems, nav]);

  useEffect(() => {
    if (!q || !cur) return;
    if (q.kind === "hearWord") {
      const t = setTimeout(() => speakKid(cur.word), 300);
      return () => clearTimeout(t);
    }
  }, [q, cur]);

  if (loading) {
    return <main className="mx-auto max-w-2xl px-5 py-10 text-center"><p className="text-sm text-muted-foreground">准备中…</p></main>;
  }
  if (!loading && totalItems === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <BackLink to="/primary/sightwords" className="text-sm text-muted-foreground">← 返回高频词</BackLink>
        <p className="mt-6 text-sm text-muted-foreground">{mode === "review" ? "今天没有需要复习的词~" : "这一级还没有词。"}</p>
      </main>
    );
  }
  if (isFinished || !cur || !q) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-lg font-bold">完成!{perfectItems} / {totalItems} 个词通过</p>
        <p className="mt-2 text-sm text-muted-foreground">回到高频词…</p>
      </main>
    );
  }

  function pick(opt: string) {
    if (picked || !q || !cur) return;
    setPicked(opt);
    const isCorrect = opt === q.correct;
    void bumpSightWordMastery(cur.id, q.kind === "hearWord" ? "spell" : "recognize", isCorrect);

    if (isCorrect) {
      const newC = itemCorrects + 1;
      setItemCorrects(newC);
      setTimeout(() => {
        setPicked(null);
        setRetryArmed(false);
        if (subIdx >= subsPerItem - 1) {
          if (newC === subsPerItem) {
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
          if (subIdx >= subsPerItem - 1) {
            setItemCorrects(0);
            setSubIdx(0);
            setItemIdx(itemIdx + 1);
          } else {
            setSubIdx(subIdx + 1);
          }
        }
      }, 1000);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink to="/primary/sightwords" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高频词
      </BackLink>

      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-extrabold">📖 高频词测试</h1>
        <div className="text-xs font-mono font-bold text-muted-foreground">
          第 {Math.min(itemIdx + 1, totalItems)}/{totalItems} 个 · 题 {subIdx + 1}/{subsPerItem}
          {retryArmed && <span className="ml-1 text-rose-600">· 再来</span>}
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all"
          style={{ width: `${((itemIdx * subsPerItem + subIdx) / Math.max(1, totalItems * subsPerItem)) * 100}%` }}
        />
      </div>

      <div className="space-y-4 rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
        {q.kind === "hearWord" ? (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">听这个词,选出对应的写法</p>
            <div className="flex justify-center">
              <button onClick={() => speakKid(cur.word)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-bold text-primary-foreground shadow">
                <Volume2 className="size-5" /> 再听一遍
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => (
                <Opt key={o} label={o} picked={picked} correct={q.correct} onPick={pick} big />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">这个词怎么读?点试听后选正确的</p>
            <div className="flex justify-center">
              <div className="text-6xl font-black text-sky-600 dark:text-sky-300">{cur.word}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => (
                <button
                  key={o}
                  disabled={!!picked}
                  onClick={() => { speakKid(o); }}
                  onDoubleClick={() => pick(o)}
                  className="rounded-2xl border-2 border-border bg-card px-3 py-3 text-left transition hover:border-primary/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">🔊 试听 "{o}"</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); pick(o); }}
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-extrabold transition " +
                        (picked === o
                          ? o === q.correct
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                          : "bg-muted hover:bg-primary/20")
                      }
                    >
                      选这个
                    </button>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              先点卡片试听,再点"选这个"提交
            </p>
          </>
        )}
      </div>
    </main>
  );
}

type Q = { kind: "hearWord" | "seeWord"; correct: string; options: string[] };

function buildQuestion(item: SightWord, subIdx: number): Q {
  const others = SIGHT_WORDS.filter((w) => w.id !== item.id);
  // 优先取同级或长度相近的词作为干扰项,降低难度差
  const sameLv = others.filter((w) => w.level === item.level);
  const closeLen = (sameLv.length >= 6 ? sameLv : others).filter(
    (w) => Math.abs(w.word.length - item.word.length) <= 2
  );
  const pool = closeLen.length >= 3 ? closeLen : others;
  const distractors = shuffle(pool).slice(0, 3).map((w) => w.word);
  const options = shuffle([item.word, ...distractors]);
  return {
    kind: subIdx % 2 === 0 ? "hearWord" : "seeWord",
    correct: item.word,
    options,
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
  label, picked, correct, onPick, big,
}: { label: string; picked: string | null; correct: string; onPick: (l: string) => void; big?: boolean }) {
  const isCorrect = label === correct;
  const isPicked = picked === label;
  return (
    <button
      disabled={!!picked}
      onClick={() => onPick(label)}
      className={
        "rounded-2xl border-2 px-4 py-4 font-extrabold transition " +
        (big ? "text-2xl " : "text-base ") +
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