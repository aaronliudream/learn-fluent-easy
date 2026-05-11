import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, RotateCw, Sparkles, Trophy, Zap } from "lucide-react";
import BackLink from "@/components/BackLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  getMasteredSightWordsAsVocab,
  getMasteredSightWordsCount,
} from "@/lib/masteredSightWords";
import type { GameVocab } from "@/lib/wordGameAdapter";
import { speak } from "@/lib/speak";

/* ---------- 小学 Word Rush 简化版本(自包含,不依赖高考组件) ---------- */

const MIN_WORDS = 8;
const RUSH_DURATION_SEC = 45; // 比高考的 60s 短一点
const RUSH_FALL_BASE_MS = 12000; // 起步更慢
const RUSH_FALL_MIN_MS = 6500;
const RUSH_SPAWN_BASE_MS = 3200;
const RUSH_SPAWN_MIN_MS = 1800;
const RUSH_MAX_ACTIVE = 2; // 同时下落最多 2 个,小朋友不慌

function comboMultiplier(streak: number): number {
  if (streak >= 8) return 5;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type RushTile = {
  id: number;
  vocab: GameVocab;
  x: number;
  spawnedAt: number;
  fallMs: number;
};

function todayDate(): string {
  const d = new Date(Date.now() - 4 * 3600_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default function PrimaryWordRush() {
  const [params] = useSearchParams();
  const grade = (Number(params.get("grade") || "1") === 2 ? 2 : 1) as 1 | 2;
  const nav = useNavigate();
  const back = `/primary/adventure/${grade}`;

  const [bootPhase, setBootPhase] = useState<"loading" | "empty" | "already" | "ready">("loading");
  const [pool, setPool] = useState<GameVocab[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    document.title = `⚡ 单词节奏 · G${grade} | FluentPath`;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      setUid(userId);
      if (!userId) {
        setBootPhase("empty");
        return;
      }
      const cnt = await getMasteredSightWordsCount(userId, grade);
      setMasteredCount(cnt);
      if (cnt < MIN_WORDS) {
        setBootPhase("empty");
        return;
      }
      const { data: today } = await supabase
        .from("primary_word_rush_attempts")
        .select("id,score,best_streak")
        .eq("user_id", userId)
        .eq("grade", grade)
        .eq("date", todayDate())
        .maybeSingle();
      if (today) {
        setBootPhase("already");
        return;
      }
      const vocab = await getMasteredSightWordsAsVocab(userId, grade, 80);
      setPool(vocab);
      setBootPhase("ready");
    })();
  }, [grade]);

  if (bootPhase === "loading") {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (bootPhase === "empty") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
        <BackLink to={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回今天的冒险
        </BackLink>
        <div className="rounded-3xl border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 via-purple-50 to-rose-50 p-6 text-center shadow-tile dark:border-fuchsia-700 dark:from-fuchsia-950/30 dark:via-purple-950/30 dark:to-rose-950/30">
          <div className="text-5xl">⚡</div>
          <h1 className="mt-3 text-xl font-extrabold">单词节奏准备中</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            节奏游戏更紧张,需要先掌握至少 <b>{MIN_WORDS}</b> 个单词。
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-fuchsia-700 shadow-sm dark:bg-fuchsia-950/30 dark:text-fuchsia-200">
            🌟 当前已掌握:{masteredCount} 个
          </div>
          <div className="mt-5">
            <Link
              to={`/primary/sight-words${grade === 2 ? "?grade=2" : ""}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-rose-500 px-5 py-3 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
            >
              <BookOpen className="size-4" /> 去学单词 →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (bootPhase === "already") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
        <BackLink to={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回今天的冒险
        </BackLink>
        <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-tile dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="text-5xl">🏁</div>
          <h1 className="mt-3 text-xl font-extrabold">今天的节奏挑战已完成!</h1>
          <p className="mt-2 text-sm text-muted-foreground">明天继续来打分吧 🌙</p>
          <Link
            to={back}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
          >
            <Sparkles className="size-4" /> 回去做今天的冒险
          </Link>
        </div>
      </main>
    );
  }

  return (
    <RushSession
      pool={pool}
      onExit={() => nav(back)}
      onComplete={async (info) => {
        if (!uid) return;
        await supabase.from("primary_word_rush_attempts").upsert(
          {
            user_id: uid,
            grade,
            date: todayDate(),
            score: info.score,
            hits: info.hits,
            misses: info.misses,
            best_streak: info.bestStreak,
            duration_seconds: info.durationSeconds,
            words: info.words,
          },
          { onConflict: "user_id,grade,date" }
        );
      }}
    />
  );
}

/* ---------- 真正的游戏循环 ---------- */

type RushDoneInfo = {
  score: number;
  hits: number;
  misses: number;
  bestStreak: number;
  durationSeconds: number;
  words: string[];
};

function RushSession({
  pool,
  onExit,
  onComplete,
}: {
  pool: GameVocab[];
  onExit: () => void;
  onComplete: (info: RushDoneInfo) => void;
}) {
  const playable = useMemo(
    () => pool.filter((v) => v.meaning_cn && v.meaning_cn.trim().length > 0),
    [pool]
  );

  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [tiles, setTiles] = useState<RushTile[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(RUSH_DURATION_SEC);
  const [choices, setChoices] = useState<GameVocab[]>([]);
  const [activeTileId, setActiveTileId] = useState<number | null>(null);
  const [floatPop, setFloatPop] = useState<{ id: number; text: string; ok: boolean } | null>(null);

  const tileSeqRef = useRef(1);
  const startedAtRef = useRef<number>(0);
  const usedWordsRef = useRef<Set<string>>(new Set());

  function pickActive(currentTiles: RushTile[]) {
    if (currentTiles.length === 0) {
      setActiveTileId(null);
      setChoices([]);
      return;
    }
    const active = [...currentTiles].sort((a, b) => a.spawnedAt - b.spawnedAt)[0];
    setActiveTileId((prevId) => {
      if (prevId === active.id) return prevId;
      const distractors = shuffle(playable.filter((p) => p.id !== active.vocab.id)).slice(0, 3);
      setChoices(shuffle([active.vocab, ...distractors]));
      return active.id;
    });
  }

  function start() {
    if (playable.length < 4) return;
    setPhase("playing");
    setTiles([]);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(RUSH_DURATION_SEC);
    setActiveTileId(null);
    setChoices([]);
    setFloatPop(null);
    tileSeqRef.current = 1;
    usedWordsRef.current = new Set();
    startedAtRef.current = Date.now();
  }

  // Countdown
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Finish on time-out
  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      setPhase("done");
      onComplete({
        score,
        hits,
        misses,
        bestStreak,
        durationSeconds: RUSH_DURATION_SEC,
        words: Array.from(usedWordsRef.current),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // Spawner
  useEffect(() => {
    if (phase !== "playing") return;
    let stopped = false;
    function schedule() {
      if (stopped) return;
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const t = elapsed / RUSH_DURATION_SEC;
      const interval =
        RUSH_SPAWN_BASE_MS - (RUSH_SPAWN_BASE_MS - RUSH_SPAWN_MIN_MS) * Math.min(1, t);
      setTimeout(() => {
        if (stopped) return;
        spawn();
        schedule();
      }, interval);
    }
    schedule();
    spawn();
    return () => {
      stopped = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function spawn() {
    setTiles((prev) => {
      if (prev.length >= RUSH_MAX_ACTIVE) return prev;
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const t = elapsed / RUSH_DURATION_SEC;
      const fallMs =
        RUSH_FALL_BASE_MS - (RUSH_FALL_BASE_MS - RUSH_FALL_MIN_MS) * Math.min(1, t);
      const v = playable[Math.floor(Math.random() * playable.length)];
      if (prev.some((p) => p.vocab.id === v.id)) return prev;
      usedWordsRef.current.add(v.word);
      const tile: RushTile = {
        id: tileSeqRef.current++,
        vocab: v,
        x: 0.15 + Math.random() * 0.7,
        spawnedAt: Date.now(),
        fallMs,
      };
      const next = [...prev, tile];
      setTimeout(() => pickActive(next), 0);
      return next;
    });
  }

  // Sweep misses
  useEffect(() => {
    if (phase !== "playing") return;
    const i = setInterval(() => {
      const now = Date.now();
      setTiles((prev) => {
        const stillAlive: RushTile[] = [];
        let missed = 0;
        for (const t of prev) {
          if (now - t.spawnedAt >= t.fallMs) missed++;
          else stillAlive.push(t);
        }
        if (missed > 0) {
          setMisses((m) => m + missed);
          setStreak(0);
          setTimeout(() => pickActive(stillAlive), 0);
        }
        return stillAlive;
      });
    }, 200);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function answer(choice: GameVocab) {
    if (phase !== "playing" || activeTileId == null) return;
    const active = tiles.find((p) => p.id === activeTileId);
    if (active && choice.id === active.vocab.id) {
      try { void speak(choice.word); } catch {}
    }
    setTiles((prev) => {
      const a = prev.find((p) => p.id === activeTileId);
      if (!a) return prev;
      const correct = choice.id === a.vocab.id;
      if (correct) {
        setHits((h) => h + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          const mult = comboMultiplier(ns);
          setScore((sc) => sc + 10 * mult);
          return ns;
        });
        setFloatPop({ id: Date.now(), text: `+${10 * comboMultiplier(streak + 1)}`, ok: true });
        const remaining = prev.filter((p) => p.id !== activeTileId);
        setTimeout(() => pickActive(remaining), 0);
        return remaining;
      } else {
        setMisses((m) => m + 1);
        setStreak(0);
        setFloatPop({ id: Date.now(), text: a.vocab.word, ok: false });
        return prev;
      }
    });
  }

  useEffect(() => {
    if (!floatPop) return;
    const t = setTimeout(() => setFloatPop(null), 700);
    return () => clearTimeout(t);
  }, [floatPop]);

  if (phase === "intro") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <div className="rounded-3xl border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 via-purple-50 to-rose-50 p-8 text-center shadow-tile dark:border-fuchsia-700 dark:from-fuchsia-950/30 dark:via-purple-950/30 dark:to-rose-950/30">
          <div className="text-5xl">⚡</div>
          <h1 className="mt-2 text-3xl font-extrabold">单词节奏</h1>
          <p className="mt-2 text-sm text-muted-foreground">中文从天上掉下来,选对应的英文 · 45 秒</p>
          <div className="mt-5 grid grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-3"><div className="font-bold">🎯 玩法</div><div className="mt-1 text-xs text-muted-foreground">中文释义会从顶部下落,从 4 个英文里点出对应的那个。</div></div>
            <div className="rounded-2xl border bg-card p-3"><div className="font-bold">🔥 连对加倍</div><div className="mt-1 text-xs text-muted-foreground">连对越多分越高:×2 / ×3 / ×5。</div></div>
          </div>
          <Button onClick={start} disabled={playable.length < 4} className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-base font-bold text-white hover:opacity-90">
            <Zap className="mr-2 size-5" /> 开始挑战
          </Button>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    const attempted = hits + misses;
    const accuracy = attempted > 0 ? Math.round((hits / attempted) * 100) : 0;
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <div className="rounded-3xl border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-purple-50 p-8 text-center shadow-tile dark:border-fuchsia-700 dark:from-fuchsia-950/30 dark:to-purple-950/30">
          <Trophy className="mx-auto size-14 text-amber-500" />
          <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">Final Score</div>
          <div className="text-6xl font-extrabold tabular-nums">{score}</div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border bg-card p-3"><div className="text-xs text-muted-foreground">命中</div><div className="text-xl font-bold text-emerald-600">{hits}</div></div>
            <div className="rounded-xl border bg-card p-3"><div className="text-xs text-muted-foreground">最高连击</div><div className="text-xl font-bold text-fuchsia-600">{bestStreak}</div></div>
            <div className="rounded-xl border bg-card p-3"><div className="text-xs text-muted-foreground">准确率</div><div className="text-xl font-bold">{accuracy}%</div></div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={start} className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 font-bold text-white hover:opacity-90">
              <RotateCw className="mr-2 size-4" /> 再来一局
            </Button>
            <Button variant="outline" onClick={onExit} className="h-12 flex-1 rounded-2xl">回今天的冒险</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-4 pt-2 pb-3 overflow-hidden">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 退出
        </button>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="rounded-full border bg-card px-3 py-1 tabular-nums shadow-sm">⏱ {timeLeft}s</span>
          <span className="rounded-full border bg-card px-3 py-1 tabular-nums shadow-sm">🎯 {score}</span>
          {streak >= 2 && (
            <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 px-3 py-1 text-white tabular-nums shadow-sm">
              🔥 ×{comboMultiplier(streak)}
            </span>
          )}
        </div>
      </div>
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            timeLeft > 20 ? "bg-emerald-500" : timeLeft > 10 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${(timeLeft / RUSH_DURATION_SEC) * 100}%` }}
        />
      </div>
      <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-fuchsia-500/30 bg-gradient-to-b from-purple-500/5 via-background to-fuchsia-500/5" style={{ minHeight: "40vh" }}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        {tiles.map((t) => {
          const isActive = t.id === activeTileId;
          return (
            <div
              key={t.id}
              className={cn(
                "absolute -translate-x-1/2 rounded-2xl border-2 px-4 py-2.5 text-center text-lg font-extrabold shadow-md whitespace-nowrap max-w-[85%] truncate",
                isActive
                  ? "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 ring-2 ring-fuchsia-500/40"
                  : "border-muted-foreground/30 bg-card/80 text-muted-foreground"
              )}
              style={{ left: `${t.x * 100}%`, top: 0, animation: `pwr-fall ${t.fallMs}ms linear forwards` }}
            >
              {t.vocab.meaning_cn}
            </div>
          );
        })}
        {floatPop && (
          <div
            key={floatPop.id}
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 animate-fade-in text-2xl font-extrabold",
              floatPop.ok ? "text-emerald-500" : "text-red-500"
            )}
          >
            {floatPop.ok ? floatPop.text : `❌ ${floatPop.text}`}
          </div>
        )}
        {tiles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">准备…</div>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 shrink-0">
        {choices.map((c) => (
          <button
            key={c.id}
            onClick={() => answer(c)}
            className="rounded-2xl border-2 border-border bg-card px-3 py-4 text-xl font-extrabold shadow-sm transition active:scale-95 hover:border-fuchsia-500 hover:bg-fuchsia-500/5"
          >
            {c.word}
          </button>
        ))}
        {choices.length === 0 && (
          <div className="col-span-2 rounded-2xl border-2 border-dashed border-muted bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
            等待第一个单词…
          </div>
        )}
      </div>
      <style>{`
        @keyframes pwr-fall {
          from { transform: translate(-50%, 0); }
          to { transform: translate(-50%, calc(50vh - 3rem)); }
        }
      `}</style>
    </main>
  );
}