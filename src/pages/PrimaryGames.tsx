import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Trophy, RotateCw, Sparkles, Target, Headphones, Brain, PenLine, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak, prefetchTTSBatch } from "@/lib/speak";
import { cn } from "@/lib/utils";
import { awardCoins } from "@/lib/coins";
import { sparkOnAnswer } from "@/lib/sparkAnswerFeedback";
import { fireEmojiConfetti } from "@/lib/feedback";
import MasteryPath, { nextStepAfter } from "@/components/primary/MasteryPath";

type Word = {
  id: string;
  word: string;
  meaning_cn: string;
  example_en: string | null;
  example_cn: string | null;
  theme: string | null;
  grade: number;
};

const GAMES = [
{ key: "quiz", title: "🎯 选义大挑战", desc: "看单词 → 选意思", icon: Target, gradient: "from-rose-400 to-pink-500" },
{ key: "listen", title: "🔊 神奇耳朵", desc: "听发音 → 选单词", icon: Headphones, gradient: "from-sky-400 to-cyan-500" },
{ key: "match", title: "🧠 记忆翻翻乐", desc: "翻牌配对", icon: Brain, gradient: "from-violet-400 to-fuchsia-500" },
{ key: "spell", title: "✍️ 拼词冒险", desc: "补全缺失的字母", icon: PenLine, gradient: "from-amber-400 to-orange-500" }] as
const;

type GameKey = typeof GAMES[number]["key"];

export default function PrimaryGames() {
  const { grade: gradeParam, type: typeParam } = useParams<{grade?: string;type?: string;}>();
  const nav = useNavigate();
  const isAll = gradeParam === "all";
  const grade = isAll ? 0 : Number(gradeParam ?? localStorage.getItem("primary:lastGrade") ?? "3");
  const game = typeParam as GameKey ?? null;

  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase.from("primary_vocab").select("id,word,meaning_cn,example_en,example_cn,theme,grade");
    if (!isAll) q = q.eq("grade", grade);
    q.then(({ data }) => {
      setWords((data ?? []) as Word[]);
      setLoading(false);
    });
  }, [grade, isAll]);

  const gradeName = isAll ? "全小学 · 1008 词大测验" : `${["一", "二", "三", "四", "五", "六"][grade - 1] ?? grade} 年级`;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink
        to={game ? `/primary/games/${isAll ? "all" : grade}` : isAll ? "/primary" : `/primary/grade/${grade}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        
        <ArrowLeft className="size-4" /> {game ? "返回游戏中心" : isAll ? "返回小学专区" : `返回 ${["一", "二", "三", "四", "五", "六"][grade - 1] ?? grade}年级`}
      </BackLink>

      <GuestBanner />

      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PRIMARY · GAMES</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
          {game ? GAMES.find((g) => g.key === game)?.title : "🎮 单词游戏中心"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {gradeName} <T>· 共</T> {words.length} <T>词 · 玩中学，学中玩</T>
        </p>
      </div>

      {/* Locked to current grade — no cross-grade switching from inside a grade's game center */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-400 px-3 py-1 text-xs font-extrabold text-white">
        {isAll ? "🏆 全小学" : `G${grade} · ${gradeName}`}
      </div>

      {loading ?
      <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div> :
      !game ?
      <>
          <MasteryPath grade={grade} isAll={isAll} />
          <GameMenu grade={grade} count={words.length} isAll={isAll} />
        </> :
      words.length < 4 ?
      <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          <T>该年级单词太少，无法开始游戏</T>
        </div> :
      game === "quiz" ?
      <QuizGame words={words} grade={grade} /> :
      game === "listen" ?
      <ListenGame words={words} grade={grade} /> :
      game === "match" ?
      <MatchGame words={words} grade={grade} /> :

      <SpellGame words={words} grade={grade} />
      }
    </main>);

}

function GameMenu({ grade, count, isAll }: {grade: number;count: number;isAll?: boolean;}) {
  const base = isAll ? "all" : grade;
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {GAMES.map((g) =>
      <Link
        key={g.key}
        to={`/primary/games/${base}/${g.key}`}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${g.gradient} p-5 text-white shadow-tile transition hover:-translate-y-1`}>
        
          <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/20 blur-2xl" />
          <g.icon className="size-7" />
          <div className="mt-3 text-lg font-extrabold"><T>{g.title}</T></div>
          <div className="text-xs opacity-90"><T>{g.desc}</T></div>
          <div className="mt-3 inline-block rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
            <T>▶ 开始 · 共</T> {count} <T>词</T>
          </div>
        </Link>
      )}
    </section>);

}

// ---------- helpers ----------
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function saveScore(gameType: string, grade: number, score: number, accuracy: number, durationMs: number) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  await supabase.from("primary_game_scores").insert({
    user_id: uid, game_type: gameType, grade, score, accuracy, duration_ms: durationMs
  });
}

/** Update per-word mastery matrix (FSRS-lite). gameType ∈ quiz|listen|spell|match */
async function recordWordResult(word: Word, gameType: "quiz" | "listen" | "spell" | "match", correct: boolean) {
  // Phase 3 — Spark visibly reacts to every word result.
  sparkOnAnswer(correct);
  // Unified mastery tracking — fire and forget
  import("@/hooks/useRecordAttempt").then(({ recordUnifiedAttempt }) => {
    recordUnifiedAttempt({
      stage: "primary", grade: word.grade, module: "vocab",
      item_type: `game_${gameType}`, item_id: word.id, item_label: word.word,
      is_correct: correct
    }).catch(() => {});
  }).catch(() => {});
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;
  // Try fetch existing
  const { data: row } = await supabase.
  from("primary_word_mastery").
  select("*").eq("user_id", uid).eq("word_id", word.id).maybeSingle();
  const c = correct ? 1 : 0,w = correct ? 0 : 1;
  const next = {
    user_id: uid,
    word_id: word.id,
    grade: word.grade,
    quiz_correct: (row?.quiz_correct ?? 0) + (gameType === "quiz" ? c : 0),
    quiz_wrong: (row?.quiz_wrong ?? 0) + (gameType === "quiz" ? w : 0),
    listen_correct: (row?.listen_correct ?? 0) + (gameType === "listen" ? c : 0),
    listen_wrong: (row?.listen_wrong ?? 0) + (gameType === "listen" ? w : 0),
    spell_correct: (row?.spell_correct ?? 0) + (gameType === "spell" ? c : 0),
    spell_wrong: (row?.spell_wrong ?? 0) + (gameType === "spell" ? w : 0),
    match_correct: (row?.match_correct ?? 0) + (gameType === "match" ? c : 0),
    match_wrong: (row?.match_wrong ?? 0) + (gameType === "match" ? w : 0),
    last_seen_at: new Date().toISOString()
  } as any;
  // mastery: 0 new, 1 learning (≥1 correct), 2 familiar (≥2 different skills correct), 3 mastered (3+ skills correct & accuracy ≥ 80%)
  const skills = [
  [next.quiz_correct, next.quiz_wrong],
  [next.listen_correct, next.listen_wrong],
  [next.spell_correct, next.spell_wrong],
  [next.match_correct, next.match_wrong]] as
  const;
  const totalCorrect = skills.reduce((s, [a]) => s + a, 0);
  const totalAttempts = skills.reduce((s, [a, b]) => s + a + b, 0);
  const skillsWithCorrect = skills.filter(([a]) => a > 0).length;
  const acc = totalAttempts ? totalCorrect / totalAttempts : 0;
  let level = 0;
  if (totalCorrect >= 1) level = 1;
  if (skillsWithCorrect >= 2 && acc >= 0.7) level = 2;
  if (skillsWithCorrect >= 3 && acc >= 0.85) level = 3;
  next.mastery_level = level;
  if (row) {
    await supabase.from("primary_word_mastery").update(next).eq("user_id", uid).eq("word_id", word.id);
  } else {
    await supabase.from("primary_word_mastery").insert(next);
  }
}

function ScoreCard({ correct, total, onRetry, gameType, grade, durationMs

}: {correct: number;total: number;onRetry: () => void;gameType: string;grade: number;durationMs: number;}) {
  const pct = Math.round(correct / Math.max(1, total) * 100);
  const score = correct * 10 + (pct === 100 ? 50 : 0);
  // 奖励星币：答对 1 题 = 2 星币；满分额外 +20；封顶在后端按日 500 控制
  const coinReward = correct * 2 + (pct === 100 ? 20 : 0);
  const [coinResult, setCoinResult] = useState<{awarded: number;balance: number;capped: boolean;} | null>(null);
  const passed = pct >= 80;
  const nextStep = nextStepAfter(gameType as any);
  useEffect(() => {
    saveScore(gameType, grade, score, pct / 100, durationMs);
    awardCoins(coinReward, `primary_${gameType}`).then((r) => {if (r) setCoinResult(r);});
    // v2 Spark bond: mini-game completion (≥60% accuracy).
    import("@/lib/petGrowth").then(({ bondOnGameComplete }) => bondOnGameComplete(pct)).catch(() => {});
    if (pct >= 70) {
      fireEmojiConfetti({
        vibrate: pct === 100,
        count: pct === 100 ? 60 : 36
      });
    }
  }, []);
  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 p-8 text-center shadow-tile">
      <Trophy className="mx-auto size-14 text-amber-500" />
      <h3 className="mt-2 text-2xl font-extrabold">
        {pct >= 90 ? "🌟 你太厉害啦,Spark 都跳起来了!" : pct >= 70 ? "👍 不错哦,Spark 在为你鼓掌!" : "💪 没事,陪 Spark 再来一次!"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        <T>答对</T> {correct} / {total} <T>· 得分</T> <span className="font-extrabold text-amber-600">+{score}</span>
      </p>
      {coinResult && coinResult.awarded > 0 &&
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-1.5 text-sm font-extrabold text-white shadow-tile animate-bounce-slow">
          <Coins className="size-4" /> +{coinResult.awarded} <T>星币 · 余额</T> {coinResult.balance}
        </div>
      }
      {coinResult?.capped &&
      <div className="mt-2 text-[11px] text-amber-700"><T>今日星币已达上限，继续加油明天再来 🌙</T></div>
      }
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 text-sm font-extrabold text-white shadow">
        
        <RotateCw className="size-4" /> <T>再玩一局</T>
      </button>
      {passed && nextStep &&
      <div className="mt-3">
          <Link
          to={`/primary/games/${grade || "all"}/${nextStep.key}`}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-extrabold text-white shadow hover:-translate-y-0.5">
          
            {nextStep.emoji} <T>进入下一步：</T>{nextStep.label} <ArrowLeft className="size-4 rotate-180" />
          </Link>
        </div>
      }
      {passed && !nextStep &&
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-2 text-sm font-extrabold text-white shadow">
          <T>🏆 五步完成！本词包已彻底掌握 ⭐</T>
        </div>
      }
      {!passed &&
      <div className="mt-3 text-xs font-bold text-rose-600">
          <T>⚠️ 正确率需 ≥ 80% 才解锁下一步，再来一局加把劲！</T>
        </div>
      }
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <BackLink
          to={`/primary/games/${grade || "all"}`}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-white px-5 py-2 text-sm font-extrabold text-rose-600 shadow-sm hover:bg-rose-50">
          
          <ArrowLeft className="size-4" /> <T>返回游戏中心</T>
        </BackLink>
        <Link
          to={grade && grade !== 1 ? `/primary/adventure/${grade}` : "/primary"}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-white px-5 py-2 text-sm font-extrabold text-amber-700 shadow-sm hover:bg-amber-50">
          
          🏠 {grade && grade !== 1 ? `${grade}年级冒险` : "小学首页"}
        </Link>
        <Link
          to="/pets"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-purple-300 bg-white px-5 py-2 text-sm font-extrabold text-purple-600 shadow-sm hover:bg-purple-50">
          <T>🐾 我的宠物</T>
        
        </Link>
      </div>
    </div>);

}

// ---------- 1. Quiz: word -> meaning ----------
function QuizGame({ words, grade }: {words: Word[];grade: number;}) {
  const [t0] = useState(Date.now());
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ c: 0, t: 0 });
  const queue = useMemo(() => shuffle(words).slice(0, Math.min(15, words.length)), [words]);
  const cur = queue[idx];
  // 预取整局所有单词的发音，避免选择后才发起网络请求导致延迟
  useEffect(() => {prefetchTTSBatch(queue.map((w) => w.word));}, [queue]);
  // 同时提前预热下一题，进一步保证瞬时播放
  useEffect(() => {
    const next = queue[idx + 1];
    if (next) prefetchTTSBatch([next.word]);
  }, [idx, queue]);
  const options = useMemo(() => {
    if (!cur) return [];
    // 排除与正确答案中文相同的干扰项，避免出现两个相同选项
    const distract = shuffle(
      words.filter((w) => w.id !== cur.id && w.meaning_cn !== cur.meaning_cn)
    ).slice(0, 3).map((w) => w.meaning_cn);
    return shuffle([cur.meaning_cn, ...distract]);
  }, [cur, words]);

  if (idx >= queue.length) return <ScoreCard correct={score.c} total={score.t} gameType="quiz" grade={grade} durationMs={Date.now() - t0}
  onRetry={() => {setIdx(0);setPicked(null);setScore({ c: 0, t: 0 });}} />;

  const pick = (m: string) => {
    if (picked) return;
    setPicked(m);
    const ok = m === cur.meaning_cn;
    setScore((s) => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    // 立即在用户手势内同步发起播放（缓存命中即瞬时出声）
    void speak(cur.word);
    recordWordResult(cur, "quiz", ok);
    setTimeout(() => {setPicked(null);setIdx((i) => i + 1);}, 850);
  };

  return (
    <div className="space-y-4">
      <ProgressBar idx={idx} total={queue.length} score={score} />
      <div className="rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-white to-rose-50 p-6 text-center shadow-tile">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><T>这个单词什么意思？</T></div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-4xl font-black md:text-5xl">{cur.word}</span>
          <button onClick={() => speak(cur.word)} className="grid size-11 place-items-center rounded-full bg-rose-500 text-white shadow">
            <Volume2 className="size-5" />
          </button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((m) => {
          const right = m === cur.meaning_cn;
          const showR = picked && right;
          const showW = picked === m && !right;
          return (
            <button key={m} onClick={() => pick(m)} disabled={!!picked} className={cn(
              "flex items-center justify-between rounded-2xl border-2 p-4 text-left text-sm font-bold transition",
              showR && "border-emerald-500 bg-emerald-50",
              showW && "border-rose-500 bg-rose-50",
              !picked && "border-border bg-card hover:border-rose-300",
              picked && !showR && !showW && "opacity-50"
            )}>
              <span>{m}</span>
              {showR && <Check className="size-5 text-emerald-600" />}
              {showW && <X className="size-5 text-rose-600" />}
            </button>);

        })}
      </div>
    </div>);

}

// ---------- 2. Listen: audio -> pick word ----------
function ListenGame({ words, grade }: {words: Word[];grade: number;}) {
  const [t0] = useState(Date.now());
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ c: 0, t: 0 });
  const queue = useMemo(() => shuffle(words).slice(0, Math.min(12, words.length)), [words]);
  const cur = queue[idx];
  const options = useMemo(() => {
    if (!cur) return [];
    // 听辨题：避免出现拼写不同但中文相同的干扰项（如 child/kid 都是"孩子"会让用户无所适从）
    const distract = shuffle(
      words.filter((w) => w.id !== cur.id && w.word !== cur.word && w.meaning_cn !== cur.meaning_cn)
    ).slice(0, 3).map((w) => w.word);
    return shuffle([cur.word, ...distract]);
  }, [cur, words]);

  useEffect(() => {if (cur) speak(cur.word);}, [cur?.id]);

  if (idx >= queue.length) return <ScoreCard correct={score.c} total={score.t} gameType="listen" grade={grade} durationMs={Date.now() - t0}
  onRetry={() => {setIdx(0);setPicked(null);setScore({ c: 0, t: 0 });}} />;

  const pick = (w: string) => {
    if (picked) return;
    setPicked(w);
    const ok = w === cur.word;
    setScore((s) => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    recordWordResult(cur, "listen", ok);
    setTimeout(() => {setPicked(null);setIdx((i) => i + 1);}, 800);
  };

  return (
    <div className="space-y-4">
      <ProgressBar idx={idx} total={queue.length} score={score} />
      <div className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50 p-8 text-center shadow-tile">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><T>听到了什么？再听一次 👇</T></div>
        <button onClick={() => speak(cur.word)} className="mx-auto mt-4 grid size-20 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg transition hover:scale-105">
          <Volume2 className="size-10" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((w) => {
          const right = w === cur.word;
          const showR = picked && right;
          const showW = picked === w && !right;
          const meaning = words.find((x) => x.word === w)?.meaning_cn ?? "";
          return (
            <button key={w} onClick={() => pick(w)} disabled={!!picked} className={cn(
              "rounded-2xl border-2 p-4 text-lg font-extrabold transition",
              showR && "border-emerald-500 bg-emerald-50 text-emerald-700",
              showW && "border-rose-500 bg-rose-50 text-rose-700",
              !picked && "border-border bg-card hover:border-sky-300",
              picked && !showR && !showW && "opacity-50"
            )}>
              <div>{w}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">{meaning}</div>
            </button>);

        })}
      </div>
    </div>);

}

// ---------- 3. Memory match ----------
type Card = {key: string;pairId: string;text: string;isWord: boolean;flipped: boolean;matched: boolean;};
function MatchGame({ words, grade }: {words: Word[];grade: number;}) {
  const [t0] = useState(Date.now());
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => shuffle(words).slice(0, 6), [words, round]);
  const [cards, setCards] = useState<Card[]>(() => makeCards(pairs));
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  function makeCards(ws: Word[]): Card[] {
    const arr: Card[] = [];
    ws.forEach((w) => {
      arr.push({ key: w.id + "_w", pairId: w.id, text: w.word, isWord: true, flipped: false, matched: false });
      arr.push({ key: w.id + "_m", pairId: w.id, text: w.meaning_cn, isWord: false, flipped: false, matched: false });
    });
    return shuffle(arr);
  }

  useEffect(() => {setCards(makeCards(pairs));setOpen([]);setMoves(0);}, [round]);

  const allMatched = cards.length > 0 && cards.every((c) => c.matched);

  const flip = (i: number) => {
    if (cards[i].flipped || cards[i].matched || open.length >= 2) return;
    const next = cards.slice();
    next[i] = { ...next[i], flipped: true };
    setCards(next);
    const newOpen = [...open, i];
    setOpen(newOpen);
    if (newOpen.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newOpen;
      if (next[a].pairId === next[b].pairId && next[a].isWord !== next[b].isWord) {
        setTimeout(() => {
          setCards((cs) => cs.map((c, idx) => idx === a || idx === b ? { ...c, matched: true } : c));
          setOpen([]);
          if (next[a].isWord) speak(next[a].text);else speak(next[b].text);
          const w = words.find((x) => x.id === next[a].pairId);
          if (w) recordWordResult(w, "match", true);
        }, 400);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((c, idx) => idx === a || idx === b ? { ...c, flipped: false } : c));
          setOpen([]);
          const w = words.find((x) => x.id === next[a].pairId);
          if (w) recordWordResult(w, "match", false);
        }, 900);
      }
    } else if (newOpen.length === 1 && cards[i].isWord) {
      speak(cards[i].text);
    }
  };

  if (allMatched) {
    const acc = pairs.length / Math.max(1, moves);
    return <ScoreCard correct={pairs.length} total={moves} gameType="match" grade={grade} durationMs={Date.now() - t0}
    onRetry={() => setRound((r) => r + 1)} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span><T>步数：</T><b>{moves}</b></span>
        <span><T>已配对：</T><b>{cards.filter((c) => c.matched).length / 2} / {pairs.length}</b></span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c, i) =>
        <button
          key={c.key}
          onClick={() => flip(i)}
          className={cn(
            "aspect-[3/4] rounded-2xl border-2 p-2 text-center text-sm font-extrabold transition",
            c.matched ? "border-emerald-400 bg-emerald-100 text-emerald-700 opacity-60" :
            c.flipped ? c.isWord ? "border-violet-400 bg-violet-50 text-violet-800" : "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-800" :
            "border-border bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white"
          )}>
          
            {c.flipped || c.matched ? c.text : "❓"}
          </button>
        )}
      </div>
    </div>);

}

// ---------- 4. Spell missing letters ----------
function SpellGame({ words, grade }: {words: Word[];grade: number;}) {
  const [t0] = useState(Date.now());
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState({ c: 0, t: 0 });
  const queue = useMemo(() => shuffle(words.filter((w) => /^[a-zA-Z]+$/.test(w.word) && w.word.length >= 3)).slice(0, 10), [words]);
  const cur = queue[idx];
  const blanks = useMemo(() => {
    if (!cur) return [];
    const w = cur.word;
    const n = Math.max(1, Math.min(2, Math.floor(w.length / 3)));
    const idxs = shuffle([...Array(w.length).keys()].filter((i) => i > 0)).slice(0, n).sort((a, b) => a - b);
    return idxs;
  }, [cur?.id]);
  const [vals, setVals] = useState<string[]>([]);
  useEffect(() => {setVals(blanks.map(() => ""));}, [cur?.id]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, [cur?.id]);

  if (idx >= queue.length) return <ScoreCard correct={score.c} total={score.t} gameType="spell" grade={grade} durationMs={Date.now() - t0}
  onRetry={() => {setIdx(0);setScore({ c: 0, t: 0 });}} />;

  const submit = () => {
    if (vals.some((v) => !v)) return;
    // Case-sensitive: kids learn proper capitalization (Apple, London, I)
    const ok = blanks.every((bi, k) => (vals[k] || "") === cur.word[bi]);
    setScore((s) => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    speak(cur.word);
    recordWordResult(cur, "spell", ok);
    setTimeout(() => setIdx((i) => i + 1), 900);
  };

  return (
    <div className="space-y-4">
      <ProgressBar idx={idx} total={queue.length} score={score} />
      <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 text-center shadow-tile">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><T>填一填，让单词完整 ✨</T></div>
        <div className="mt-2 text-sm font-bold text-amber-700">{cur.meaning_cn}</div>
        <button onClick={() => speak(cur.word)} className="mx-auto my-3 grid size-12 place-items-center rounded-full bg-amber-500 text-white shadow">
          <Volume2 className="size-5" />
        </button>
        <div className="flex items-center justify-center gap-1.5">
          {cur.word.split("").map((ch, i) => {
            const k = blanks.indexOf(i);
            if (k === -1) return <span key={i} className="text-3xl font-black">{ch}</span>;
            return (
              <input
                key={i}
                ref={(el) => {inputRefs.current[k] = el;}}
                value={vals[k] ?? ""}
                onChange={(e) => {
                  const ch = e.target.value.slice(-1);
                  setVals((v) => {const n = v.slice();n[k] = ch;return n;});
                  if (ch && k < blanks.length - 1) inputRefs.current[k + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {e.preventDefault();submit();} else
                  if (e.key === "Backspace" && !vals[k] && k > 0) {
                    inputRefs.current[k - 1]?.focus();
                  }
                }}
                maxLength={1}
                className="size-11 rounded-lg border-2 border-amber-400 bg-white text-center text-2xl font-black text-amber-600 outline-none focus:border-amber-600" />);


          })}
        </div>
      </div>
      <button
        onClick={submit}
        disabled={vals.some((v) => !v)}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-base font-extrabold text-white shadow disabled:opacity-50">
        <T>✅ 提交</T>
      
      </button>
    </div>);

}

function ProgressBar({ idx, total, score }: {idx: number;total: number;score: {c: number;t: number;};}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span><T>第</T> {idx + 1} / {total} <T>题</T></span>
        <span className="font-bold">✅ {score.c} / {score.t}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-gradient-to-r from-amber-400 to-pink-500 transition-all" style={{ width: `${idx / total * 100}%` }} />
      </div>
    </div>);

}