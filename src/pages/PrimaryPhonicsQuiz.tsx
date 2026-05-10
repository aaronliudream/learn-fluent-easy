import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid as speak } from "@/lib/speak";
import {
  PHONICS_GROUPS,
  PHONICS_ITEMS,
  type PhonicsItem,
} from "@/data/primaryPhonics";
import {
  bumpPhonicsMastery,
  bumpPhonicsLevel,
  ensureGroupMastery,
  getPhonicsMasteryMap,
  isDue,
} from "@/lib/phonicsMastery";
import { buildDistractorPool } from "@/lib/phonicsDistractors";
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
  // 每个 item 走 3 道题(轮换 3 种题型). retryArmed = 本题答错过 1 次,允许再答 1 次.
  const [itemIdx, setItemIdx] = useState(0);     // 当前在第几个 item
  const [subIdx, setSubIdx] = useState(0);       // 当前 item 的第几道(0..2)
  const [picked, setPicked] = useState<string | null>(null);
  const [retryArmed, setRetryArmed] = useState(false); // 本题答错可重做一次
  const [itemCorrects, setItemCorrects] = useState(0); // 当前 item 累计答对数(0..3)
  const [perfectItems, setPerfectItems] = useState(0); // 累计 3 题全对的 item 数
  const [totalCorrect, setTotalCorrect] = useState(0); // 总答对题数(用于结算)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = isReview ? "拼读复习 | FluentPath" : `挑战 ${group?.groupName ?? ""} | FluentPath`;
    (async () => {
      if (isReview) {
        const m = await getPhonicsMasteryMap();
        const due = PHONICS_ITEMS.filter((it) => isDue(m.get(it.id)));
        setItems(shuffle(due).slice(0, 6));
      } else if (group) {
        const groupItems = PHONICS_ITEMS.filter((it) => it.groupId === group.id);
        setItems(shuffle(groupItems));
      }
      setLoading(false);
    })();
  }, [isReview, group]);

  const totalItems = items.length;
  const totalQuestions = totalItems * 3;
  const cur = items[itemIdx];
  const isFinished = !loading && totalItems > 0 && itemIdx >= totalItems;

  // 当前题目: kind 由 subIdx 决定(0=听音选字, 1=看字选音, 2=听词选图)
  // 每个 item 预计算 3 道题(混 5 种题型),保持本 item 内 q 稳定.
  const itemQuestions = useMemo(() => (cur ? buildItemQuestions(cur) : []), [cur, itemIdx]);
  const q = itemQuestions[subIdx] ?? null;

  // 全部答完 → 结算 + 跳转(放 effect 里,避免 render 期副作用)
  useEffect(() => {
    if (!isFinished) return;
    let cancel = false;
    (async () => {
      const allCorrect = perfectItems === totalItems;
      if (!isReview && group && allCorrect) {
        const groupItems = PHONICS_ITEMS.filter((it) => it.groupId === group.id);
        await ensureGroupMastery(groupItems.map((it) => it.id), 2);
        if (cancel) return;
        celebratePet({
          kind: "levelup",
          emoji: "🦊",
          title: `${group.groupName} 通关!`,
          subtitle: "Spark 解锁了下一组~",
        });
      } else {
        if (cancel) return;
        celebratePet({
          kind: "levelup",
          emoji: "🦊",
          title: `做完啦!通过 ${perfectItems}/${totalItems} 个音`,
          subtitle: allCorrect ? "全部 3 题都对!太强啦" : "没全对的音明天会再考你哦",
        });
      }
      const t = setTimeout(() => nav("/primary/phonics"), 1800);
      return () => clearTimeout(t);
    })();
    return () => { cancel = true; };
  }, [isFinished, perfectItems, totalItems, isReview, group, nav]);

  useEffect(() => {
    if (!q || !cur) return;
    const t = setTimeout(() => {
      if (q.kind === "hearLetter") speak(cur.exampleWords[0]?.word ?? cur.letter);
      else if (q.kind === "matchWord") speak(q.correctWord);
      else if (q.kind === "blendCvc") {
        // 自动连读三个音: /c/ - /a/ - /t/
        const sounds = q.sounds;
        sounds.forEach((s, i) => setTimeout(() => speak(s), i * 600));
      }
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

  if (!loading && totalItems === 0) {
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

  if (isFinished || !cur || !q) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-lg font-bold">
          做完啦!{perfectItems} / {totalItems} 个音通过(共答对 {totalCorrect} 题)
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
    else if (q.kind === "blendCvc") isCorrect = opt === q.correctWord;
    else if (q.kind === "seeImagePickWord") isCorrect = opt === q.correctWord;

    // SRS 计数(用于"今日复习"到期判定)
    void bumpPhonicsMastery(
      cur.id,
      q.kind === "hearLetter" || q.kind === "matchWord" || q.kind === "blendCvc" ? "listen" : "quiz",
      isCorrect
    );

    if (isCorrect) {
      setTotalCorrect((c) => c + 1);
      const newItemCorrects = itemCorrects + 1;
      setItemCorrects(newItemCorrects);
      // 推进到下一题或下一个 item
      setTimeout(() => {
        setPicked(null);
        setRetryArmed(false);
        if (subIdx >= 2) {
          // 本 item 3 题全对 → 升级
          if (newItemCorrects === 3) {
            void bumpPhonicsLevel(cur.id, 1, 3);
            setPerfectItems((p) => p + 1);
          }
          // 进入下一个 item
          setItemCorrects(0);
          setSubIdx(0);
          setItemIdx(itemIdx + 1);
        } else {
          setSubIdx(subIdx + 1);
        }
      }, 850);
    } else {
      // 答错: 第一次错允许重做; 第二次错则跳过该题(本 item 永远 < 3 不会升级)
      setTimeout(() => {
        setPicked(null);
        if (!retryArmed) {
          setRetryArmed(true); // 同样的题再来一次
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

  // 进度数字
  const doneQuestions = itemIdx * 3 + subIdx;

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
          第 {Math.min(itemIdx + 1, totalItems)}/{totalItems} 个音 · 题 {subIdx + 1}/3
          {retryArmed && <span className="ml-1 text-rose-600">· 再来一次</span>}
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 transition-all"
          style={{ width: `${(doneQuestions / Math.max(1, totalQuestions)) * 100}%` }}
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

        {q.kind === "blendCvc" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">
              听这三个音连起来,是哪个词?
            </p>
            <div className="flex justify-center gap-2">
              {q.sounds.map((s, i) => (
                <button
                  key={i}
                  onClick={() => speak(s)}
                  className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-xl font-extrabold text-primary shadow-sm hover:bg-primary/20"
                  title="点击单独听这个音"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  q.sounds.forEach((s, i) => setTimeout(() => speak(s), i * 600));
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow"
              >
                <Volume2 className="size-4" /> 连读一遍
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => (
                <Opt key={o} label={o} mono picked={picked} correct={q.correctWord} onPick={pick} />
              ))}
            </div>
          </>
        )}

        {q.kind === "seeImagePickWord" && (
          <>
            <p className="text-center text-sm font-bold text-muted-foreground">
              这是什么?选出对应的英文词
            </p>
            <div className="flex justify-center">
              <div className="grid size-32 place-items-center rounded-3xl bg-amber-50 text-7xl shadow-sm dark:bg-amber-950/40">
                {q.emoji}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => (
                <Opt key={o} label={o} mono picked={picked} correct={q.correctWord} onPick={pick} />
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
  | { kind: "matchWord"; correctWord: string; correctEmoji: string; options: { word: string; emoji: string }[] }
  | { kind: "blendCvc"; correctWord: string; sounds: string[]; options: string[] }
  | { kind: "seeImagePickWord"; correctWord: string; emoji: string; options: string[] };

/**
 * 给一个 item 构造 3 道题: 从 5 种题型中随机挑 3 种(只用本 item 实际能出的题型).
 * 题型可用性:
 *  - hearLetter / seeLetter: 永远可用
 *  - matchWord / seeImagePickWord: 例词带 emoji 才可用
 *  - blendCvc: 例词中存在 3 字母的 CVC 词才可用
 */
function buildItemQuestions(item: PhonicsItem): Q[] {
  const candidates: Array<() => Q | null> = [
    () => buildHearLetter(item),
    () => buildSeeLetter(item),
    () => buildMatchWord(item),
    () => buildSeeImagePickWord(item),
    () => buildBlendCvc(item),
  ];
  const built = shuffle(candidates).map((f) => f()).filter((q): q is Q => q != null);
  // 至少保证前 2 种,补足 3 道
  while (built.length < 3) built.push(buildHearLetter(item));
  return built.slice(0, 3);
}

function poolDistractors(item: PhonicsItem): PhonicsItem[] {
  const allIds = PHONICS_ITEMS.map((p) => p.id);
  return buildDistractorPool(item.id, allIds, 3)
    .map((id) => PHONICS_ITEMS.find((p) => p.id === id))
    .filter(Boolean) as PhonicsItem[];
}

function buildHearLetter(item: PhonicsItem): Q {
  const d = poolDistractors(item);
  return {
    kind: "hearLetter",
    correct: item.letter,
    options: shuffle([item.letter, ...d.map((p) => p.letter)]),
  };
}
function buildSeeLetter(item: PhonicsItem): Q {
  const d = poolDistractors(item);
  return {
    kind: "seeLetter",
    letter: item.letterUpper ?? item.letter,
    correct: item.sound,
    options: shuffle([item.sound, ...d.map((p) => p.sound)]),
  };
}
function buildMatchWord(item: PhonicsItem): Q | null {
  const word0 = item.exampleWords.find((w) => w.emoji && w.word);
  if (!word0?.emoji || !word0?.word) return null;
  const d = poolDistractors(item);
  const otherWords = d.flatMap((p) => p.exampleWords.filter((w) => w.emoji && w.word));
  const fallback = PHONICS_ITEMS.flatMap((p) =>
    p.id === item.id ? [] : p.exampleWords.filter((w) => w.emoji && w.word)
  );
  const wordPool = otherWords.length >= 2 ? otherWords : fallback;
  return {
    kind: "matchWord",
    correctWord: word0.word,
    correctEmoji: word0.emoji,
    options: shuffle([
      { word: word0.word, emoji: word0.emoji },
      ...shuffle(wordPool).slice(0, 2).map((w) => ({ word: w.word, emoji: w.emoji! })),
    ]),
  };
}
function buildSeeImagePickWord(item: PhonicsItem): Q | null {
  const word0 = item.exampleWords.find((w) => w.emoji && w.word);
  if (!word0?.emoji || !word0?.word) return null;
  const d = poolDistractors(item);
  const others = d.flatMap((p) => p.exampleWords.filter((w) => w.word));
  const fallback = PHONICS_ITEMS.flatMap((p) =>
    p.id === item.id ? [] : p.exampleWords.filter((w) => w.word)
  );
  const pool = others.length >= 3 ? others : fallback;
  const distractorWords = shuffle(pool).slice(0, 3).map((w) => w.word);
  return {
    kind: "seeImagePickWord",
    correctWord: word0.word,
    emoji: word0.emoji,
    options: shuffle([word0.word, ...distractorWords]),
  };
}
/**
 * CVC 拼读: 找到本 item 例词中 3 字母 (consonant-vowel-consonant) 的真词,
 * 把单词拆成 3 个音播放,让孩子拼出来.如果本 item 没有 CVC 例词则返回 null.
 */
function buildBlendCvc(item: PhonicsItem): Q | null {
  const cvc = item.exampleWords.find((w) => /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/i.test(w.word));
  if (!cvc) return null;
  const letters = cvc.word.toLowerCase().split("");
  // 把每个字母映射回它的 phonics sound, 找不到就用字母本身
  const sounds = letters.map((ch) => {
    const it = PHONICS_ITEMS.find((p) => p.letter.toLowerCase() === ch);
    return it?.sound ?? `/${ch}/`;
  });
  // 干扰词: 同长度的其他 CVC 例词
  const allCvc = PHONICS_ITEMS.flatMap((p) =>
    p.exampleWords.filter((w) => w.word !== cvc.word && /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/i.test(w.word))
  );
  const distractors = shuffle(allCvc).slice(0, 3).map((w) => w.word.toLowerCase());
  return {
    kind: "blendCvc",
    correctWord: cvc.word.toLowerCase(),
    sounds,
    options: shuffle([cvc.word.toLowerCase(), ...distractors]),
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