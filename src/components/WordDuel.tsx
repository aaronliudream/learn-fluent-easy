import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Swords, Trophy, Crown, Medal, Bot, Zap, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { awardCoins, unlockBadge, type BadgeDef } from "@/lib/coinsBadges";
import { CoinPill, BadgeUnlockOverlay } from "@/components/CoinsBadgesUi";

/* ============================================================
   Word Duel 单词决斗
   - PVP 1v1：5 回合 4 选 1（中文释义 → 英文单词）
   - 每题 8 秒；得分 = 100 + 速度奖励 (剩余毫秒/40)
   - 真人匹配（基于 ELO ±200）；30 秒未匹配 → 一键挑战 AI
   - 结算更新 ELO（K=32），段位：青铜/白银/黄金/钻石/大师/王者
   ============================================================ */

type Vocab = {
  id: string;
  word: string;
  meaning_cn: string;
};

type DuelStatus = "lobby" | "matching" | "playing" | "result";

type Question = {
  vocab_id: string;
  prompt_cn: string;
  correct: string;
  options: string[];
};

type RoundLog = {
  round: number;
  my_answer: string | null;
  correct: string;
  my_score: number;
  opp_score: number;
  my_ms: number;
  opp_ms: number;
};

type RatingInfo = {
  rating: number;
  peak_rating: number;
  wins: number;
  losses: number;
  draws: number;
  current_streak: number;
  best_streak: number;
  matches_played: number;
  tier: string;
};

type Opponent = {
  id: string | null;
  alias: string;
  rating: number;
  is_bot: boolean;
};

const ROUNDS = 5;
const ROUND_MS = 8000;

function tierEmoji(rating: number): string {
  if (rating >= 1800) return "👑";
  if (rating >= 1600) return "🏆";
  if (rating >= 1400) return "💎";
  if (rating >= 1200) return "🥇";
  if (rating >= 1050) return "🥈";
  return "🥉";
}

function pickQuestions(pool: Vocab[], n: number): Question[] {
  const filtered = pool.filter((v) => v.word && v.meaning_cn && !/[\/\s]/.test(v.word));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, n);
  return picks.map((v) => {
    const distractors = filtered
      .filter((d) => d.id !== v.id && d.word !== v.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((d) => d.word);
    const options = [v.word, ...distractors].sort(() => Math.random() - 0.5);
    return { vocab_id: v.id, prompt_cn: v.meaning_cn, correct: v.word, options };
  });
}

/** Bot decision: returns ms-to-answer + correctness probability based on its rating */
function botPlay(rating: number): { ms: number; correct: boolean } {
  // Higher rating → faster + more accurate
  const accuracy = Math.min(0.95, Math.max(0.45, 0.4 + (rating - 800) / 2000));
  const baseSpeed = Math.max(1500, 6500 - (rating - 800) * 2.5);
  const jitter = 1500 + Math.random() * 2500;
  const ms = Math.min(ROUND_MS - 200, baseSpeed * (0.7 + Math.random() * 0.6) + jitter * 0.3);
  return { ms: Math.round(ms), correct: Math.random() < accuracy };
}

function scoreFor(ms: number, correct: boolean): number {
  if (!correct) return 0;
  const remaining = Math.max(0, ROUND_MS - ms);
  return 100 + Math.round(remaining / 40); // up to ~300 per round
}

export default function WordDuel({
  pool,
  onExit,
}: {
  pool: Vocab[];
  onExit: () => void;
}) {
  const [status, setStatus] = useState<DuelStatus>("lobby");
  const [me, setMe] = useState<RatingInfo | null>(null);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [logs, setLogs] = useState<RoundLog[]>([]);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [myAnswerMs, setMyAnswerMs] = useState<number | null>(null);
  const [oppPlanned, setOppPlanned] = useState<{ ms: number; correct: boolean } | null>(null);
  const [oppAnswered, setOppAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [matchStartedAt, setMatchStartedAt] = useState(0);
  const [matchSearchSec, setMatchSearchSec] = useState(0);
  const [unlocked, setUnlocked] = useState<BadgeDef | null>(null);
  const [resultBanner, setResultBanner] = useState<{ won: boolean; draw: boolean; delta: number; newRating: number } | null>(null);

  const roundStartRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const queueRef = useRef<number | null>(null);

  /* --------- Load my rating --------- */
  const refreshMe = async () => {
    const { data } = await supabase.rpc("get_or_init_duel_rating");
    const row = Array.isArray(data) ? data[0] : data;
    if (row) setMe(row as RatingInfo);
  };
  useEffect(() => {
    refreshMe();
  }, []);

  /* --------- Matchmaking --------- */
  const startMatching = async () => {
    setStatus("matching");
    setMatchSearchSec(0);
    let elapsed = 0;
    const tick = async () => {
      elapsed += 2;
      setMatchSearchSec(elapsed);
      const range = 100 + elapsed * 30;
      const { data, error } = await supabase.rpc("find_duel_opponent", { _rating_range: range });
      if (error) {
        console.error(error);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.opponent_alias) {
        if (queueRef.current) window.clearTimeout(queueRef.current);
        startMatch({
          id: row.opponent_id,
          alias: row.opponent_alias,
          rating: row.opponent_rating,
          is_bot: false,
        });
        return;
      }
      if (elapsed >= 30) {
        // auto fallback to bot
        await challengeBot();
        return;
      }
      queueRef.current = window.setTimeout(tick, 2000);
    };
    queueRef.current = window.setTimeout(tick, 1500);
    // 也立即尝试一次
    const { data } = await supabase.rpc("find_duel_opponent", { _rating_range: 200 });
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.opponent_alias) {
      if (queueRef.current) window.clearTimeout(queueRef.current);
      startMatch({
        id: row.opponent_id,
        alias: row.opponent_alias,
        rating: row.opponent_rating,
        is_bot: false,
      });
    }
  };

  const cancelMatching = async () => {
    if (queueRef.current) window.clearTimeout(queueRef.current);
    queueRef.current = null;
    await supabase.rpc("cancel_duel_queue");
    setStatus("lobby");
  };

  const challengeBot = async () => {
    if (queueRef.current) window.clearTimeout(queueRef.current);
    await supabase.rpc("cancel_duel_queue");
    const { data } = await supabase.rpc("match_duel_bot");
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      startMatch({
        id: null,
        alias: row.opponent_alias || "AI 小智",
        rating: row.opponent_rating || 1000,
        is_bot: true,
      });
    }
  };

  const startMatch = (opp: Opponent) => {
    const qs = pickQuestions(pool, ROUNDS);
    setOpponent(opp);
    setQuestions(qs);
    setRoundIdx(0);
    setLogs([]);
    setStatus("playing");
    setMatchStartedAt(Date.now());
    setupRound(0, opp);
  };

  const setupRound = (idx: number, opp: Opponent) => {
    setMyAnswer(null);
    setMyAnswerMs(null);
    setOppAnswered(false);
    setRevealed(false);
    setTimeLeft(ROUND_MS);
    roundStartRef.current = Date.now();
    // Plan opponent: bot decided locally; real player simulated similarly for now
    // (Real-time PVP would use a Realtime channel; we simulate to keep round moving.)
    const planned = botPlay(opp.rating);
    setOppPlanned(planned);

    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      const elapsed = Date.now() - roundStartRef.current;
      const left = Math.max(0, ROUND_MS - elapsed);
      setTimeLeft(left);
      if (!oppAnsweredRef.current && elapsed >= planned.ms) {
        oppAnsweredRef.current = true;
        setOppAnswered(true);
      }
      if (left <= 0) {
        if (tickRef.current) window.clearInterval(tickRef.current);
        finishRound();
      }
    }, 100);
  };

  // Mirror oppAnswered into a ref for the interval closure
  const oppAnsweredRef = useRef(false);
  useEffect(() => {
    oppAnsweredRef.current = oppAnswered;
  }, [oppAnswered]);

  const handleAnswer = (choice: string) => {
    if (myAnswer !== null || revealed) return;
    const ms = Date.now() - roundStartRef.current;
    setMyAnswer(choice);
    setMyAnswerMs(ms);
  };

  // Auto-finish when both sides have answered (or time out via ticker)
  useEffect(() => {
    if (status !== "playing") return;
    if (myAnswer !== null && oppAnswered) {
      const t = window.setTimeout(finishRound, 600);
      return () => window.clearTimeout(t);
    }
  }, [myAnswer, oppAnswered, status]);

  const finishRoundRef = useRef(false);
  const finishRound = () => {
    if (finishRoundRef.current) return;
    finishRoundRef.current = true;
    if (tickRef.current) window.clearInterval(tickRef.current);

    const q = questions[roundIdx];
    const planned = oppPlanned || { ms: ROUND_MS, correct: false };
    const myMs = myAnswerMs ?? ROUND_MS;
    const myCorrect = myAnswer === q.correct;
    const myScore = scoreFor(myMs, myCorrect);
    const oppMs = planned.ms;
    const oppScore = scoreFor(oppMs, planned.correct);

    const log: RoundLog = {
      round: roundIdx + 1,
      my_answer: myAnswer,
      correct: q.correct,
      my_score: myScore,
      opp_score: oppScore,
      my_ms: myMs,
      opp_ms: oppMs,
    };
    const newLogs = [...logs, log];
    setLogs(newLogs);
    setRevealed(true);

    window.setTimeout(() => {
      finishRoundRef.current = false;
      const next = roundIdx + 1;
      if (next >= ROUNDS) {
        finalize(newLogs);
      } else {
        setRoundIdx(next);
        setupRound(next, opponent!);
      }
    }, 1400);
  };

  const finalize = async (allLogs: RoundLog[]) => {
    const myTotal = allLogs.reduce((s, l) => s + l.my_score, 0);
    const oppTotal = allLogs.reduce((s, l) => s + l.opp_score, 0);
    const duration = Date.now() - matchStartedAt;

    const { data, error } = await supabase.rpc("submit_duel_result", {
      _opponent_id: opponent?.id ?? null,
      _is_bot: !!opponent?.is_bot,
      _opponent_rating: opponent?.rating ?? 1000,
      _my_score: myTotal,
      _opp_score: oppTotal,
      _duration_ms: duration,
      _rounds: ROUNDS,
      _questions: allLogs as unknown as never,
    });
    if (error) console.error(error);
    const row = Array.isArray(data) ? data[0] : data;
    const newRating = row?.my_new_rating ?? me?.rating ?? 1000;
    const delta = row?.my_delta ?? 0;
    const won = !!row?.won;
    const draw = !!row?.is_draw;
    const streak = row?.current_streak ?? 0;

    setResultBanner({ won, draw, delta, newRating });
    setStatus("result");

    // Coin reward
    if (won) await awardCoins(50);
    else if (draw) await awardCoins(20);
    else await awardCoins(10);

    // Badges
    const codes: string[] = [];
    if (won) codes.push("duel_first_blood");
    if (streak >= 3) codes.push("duel_streak_3");
    if (streak >= 5) codes.push("duel_streak_5");
    if (newRating >= 1050) codes.push("duel_silver");
    if (newRating >= 1200) codes.push("duel_gold");
    if (newRating >= 1400) codes.push("duel_diamond");
    if (newRating >= 1800) codes.push("duel_legend");
    for (const c of codes) {
      const def = await unlockBadge(c);
      if (def && !unlocked) {
        setUnlocked(def);
        break;
      }
    }

    // also write to vocab_game_scores so cross-game leaderboards see duel scores
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("vocab_game_scores").insert({
        user_id: u.user.id,
        game_type: "word_duel",
        score: myTotal,
        hits: allLogs.filter((l) => l.my_answer === l.correct).length,
        misses: allLogs.filter((l) => l.my_answer !== l.correct).length,
        duration_ms: duration,
        metadata: { won, draw, opponent: opponent?.alias, opponent_rating: opponent?.rating },
      });
    }

    refreshMe();
  };

  const playAgain = () => {
    setStatus("lobby");
    setOpponent(null);
    setQuestions([]);
    setLogs([]);
    setRoundIdx(0);
    setResultBanner(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (queueRef.current) window.clearTimeout(queueRef.current);
      supabase.rpc("cancel_duel_queue");
    };
  }, []);

  /* ======================== RENDER ======================== */
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <CoinPill />
      </div>

      {status === "lobby" && (
        <LobbyView me={me} onMatch={startMatching} onBot={challengeBot} />
      )}

      {status === "matching" && (
        <MatchingView seconds={matchSearchSec} onCancel={cancelMatching} onBot={challengeBot} />
      )}

      {status === "playing" && opponent && questions[roundIdx] && (
        <PlayView
          me={me}
          opponent={opponent}
          question={questions[roundIdx]}
          roundIdx={roundIdx}
          totalRounds={ROUNDS}
          timeLeft={timeLeft}
          myAnswer={myAnswer}
          oppAnswered={oppAnswered}
          revealed={revealed}
          logs={logs}
          onAnswer={handleAnswer}
        />
      )}

      {status === "result" && resultBanner && opponent && (
        <ResultView
          banner={resultBanner}
          opponent={opponent}
          me={me}
          logs={logs}
          onPlayAgain={playAgain}
          onExit={onExit}
        />
      )}

      {unlocked && <BadgeUnlockOverlay badges={[unlocked]} onDismiss={() => setUnlocked(null)} />}
    </main>
  );
}

/* ============= Lobby ============= */
function LobbyView({
  me,
  onMatch,
  onBot,
}: {
  me: RatingInfo | null;
  onMatch: () => void;
  onBot: () => void;
}) {
  return (
    <div>
      <div className="rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent p-6 shadow-tile">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <Swords className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">⚔️ Word Duel 单词决斗</h1>
            <p className="text-xs text-muted-foreground mt-0.5">5 回合 · 8 秒/题 · 速度 + 准确度双重加分 · 实时 ELO 段位</p>
          </div>
        </div>

        {/* Rating card */}
        {me && (
          <div className="mt-5 rounded-2xl border bg-card/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">我的段位</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl">{tierEmoji(me.rating)}</span>
                  <span className="text-2xl font-extrabold">{me.tier}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">ELO</div>
                <div className="text-3xl font-extrabold tabular-nums">{me.rating}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <Stat label="胜" value={me.wins} tone="emerald" />
              <Stat label="负" value={me.losses} tone="rose" />
              <Stat label="连胜" value={me.current_streak} tone="amber" />
              <Stat label="最高" value={me.peak_rating} tone="indigo" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          onClick={onMatch}
          className="h-16 rounded-2xl bg-rose-600 text-base font-extrabold hover:bg-rose-700"
        >
          <Swords className="mr-2 size-5" /> 真人匹配
        </Button>
        <Button
          onClick={onBot}
          variant="outline"
          className="h-16 rounded-2xl border-2 text-base font-extrabold"
        >
          <Bot className="mr-2 size-5" /> 挑战 AI
        </Button>
      </div>

      <DuelLeaderboard />

      <div className="mt-4 rounded-2xl border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
        <div className="mb-1 font-bold text-foreground">📖 段位规则</div>
        🥉 青铜 &lt; 1050 · 🥈 白银 1050+ · 🥇 黄金 1200+ · 💎 钻石 1400+ · 🏆 大师 1600+ · 👑 王者 1800+
        <br />
        ELO K 值 32：胜负影响 ±16~32 分；与高分对手交手胜利获得更多分。
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "rose" | "amber" | "indigo" }) {
  const tones = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  }[tone];
  return (
    <div className="rounded-xl bg-background/60 py-2">
      <div className={cn("text-lg font-extrabold tabular-nums", tones)}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

/* ============= Matching ============= */
function MatchingView({ seconds, onCancel, onBot }: { seconds: number; onCancel: () => void; onBot: () => void }) {
  return (
    <div className="rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/10 to-transparent p-8 text-center shadow-tile">
      <div className="mx-auto flex size-20 animate-pulse items-center justify-center rounded-full bg-rose-500/20">
        <Swords className="size-10 text-rose-600 dark:text-rose-400" />
      </div>
      <h2 className="mt-4 text-2xl font-extrabold">正在为你匹配对手…</h2>
      <p className="mt-1 text-sm text-muted-foreground">已搜索 {seconds}s · 范围正在扩大</p>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Button onClick={onBot} className="rounded-full bg-foreground px-6 text-background">
          <Bot className="mr-2 size-4" /> 等不及？立即挑战 AI
        </Button>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">取消匹配</button>
      </div>
    </div>
  );
}

/* ============= Play ============= */
function PlayView({
  me,
  opponent,
  question,
  roundIdx,
  totalRounds,
  timeLeft,
  myAnswer,
  oppAnswered,
  revealed,
  logs,
  onAnswer,
}: {
  me: RatingInfo | null;
  opponent: Opponent;
  question: Question;
  roundIdx: number;
  totalRounds: number;
  timeLeft: number;
  myAnswer: string | null;
  oppAnswered: boolean;
  revealed: boolean;
  logs: RoundLog[];
  onAnswer: (c: string) => void;
}) {
  const myTotal = logs.reduce((s, l) => s + l.my_score, 0);
  const oppTotal = logs.reduce((s, l) => s + l.opp_score, 0);
  const pct = (timeLeft / ROUND_MS) * 100;

  return (
    <div>
      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-rose-500/30 bg-card p-3">
        <PlayerCard
          name="我"
          rating={me?.rating ?? 1000}
          score={myTotal}
          answered={myAnswer !== null}
          isMe
        />
        <PlayerCard
          name={opponent.alias}
          rating={opponent.rating}
          score={oppTotal}
          answered={oppAnswered}
          isBot={opponent.is_bot}
        />
      </div>

      {/* Round + timer */}
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>Round {roundIdx + 1} / {totalRounds}</span>
        <span className="tabular-nums">{(timeLeft / 1000).toFixed(1)}s</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-[width] duration-100", pct > 40 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-rose-500")}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Question */}
      <div className="mt-5 rounded-3xl border-2 bg-card p-6 shadow-tile">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">选出对应英文单词</div>
        <div className="mt-2 text-2xl font-extrabold leading-snug">{question.prompt_cn}</div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options.map((opt) => {
            const isMine = myAnswer === opt;
            const isCorrect = revealed && opt === question.correct;
            const isWrong = revealed && isMine && opt !== question.correct;
            return (
              <button
                key={opt}
                disabled={myAnswer !== null || revealed}
                onClick={() => onAnswer(opt)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition",
                  "disabled:cursor-default",
                  isCorrect ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
                  isWrong ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300" :
                  isMine ? "border-primary bg-primary/10" :
                  "border-border hover:border-primary/60 hover:bg-muted/50"
                )}
              >
                <span>{opt}</span>
                {isCorrect && <Check className="size-5" />}
                {isWrong && <X className="size-5" />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-4 rounded-xl bg-muted/60 p-3 text-sm">
            正确答案：<b>{question.correct}</b>
            <span className="ml-3 text-muted-foreground">
              你 +{logs[logs.length - 1]?.my_score || 0} · {opponent.alias} +{logs[logs.length - 1]?.opp_score || 0}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCard({
  name,
  rating,
  score,
  answered,
  isMe,
  isBot,
}: {
  name: string;
  rating: number;
  score: number;
  answered: boolean;
  isMe?: boolean;
  isBot?: boolean;
}) {
  return (
    <div className={cn("rounded-xl p-3", isMe ? "bg-primary/10 ring-2 ring-primary/40" : "bg-muted/40")}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{tierEmoji(rating)}</span>
        <div className="flex-1 truncate">
          <div className="truncate text-sm font-extrabold">
            {isBot && <Bot className="mr-1 inline size-3" />}
            {name}
          </div>
          <div className="text-[10px] tabular-nums text-muted-foreground">ELO {rating}</div>
        </div>
        {answered && <Check className="size-4 text-emerald-500" />}
      </div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums">{score}</div>
    </div>
  );
}

/* ============= Result ============= */
function ResultView({
  banner,
  opponent,
  me,
  logs,
  onPlayAgain,
  onExit,
}: {
  banner: { won: boolean; draw: boolean; delta: number; newRating: number };
  opponent: Opponent;
  me: RatingInfo | null;
  logs: RoundLog[];
  onPlayAgain: () => void;
  onExit: () => void;
}) {
  const myTotal = logs.reduce((s, l) => s + l.my_score, 0);
  const oppTotal = logs.reduce((s, l) => s + l.opp_score, 0);
  const tone = banner.draw
    ? "from-amber-500/20 to-amber-500/5 border-amber-500/40"
    : banner.won
    ? "from-emerald-500/20 to-emerald-500/5 border-emerald-500/40"
    : "from-rose-500/20 to-rose-500/5 border-rose-500/40";

  const share = () => {
    const blocks = logs.map((l) => (l.my_answer === l.correct ? "🟩" : "🟥")).join("");
    const txt = `⚔️ Word Duel\n${banner.won ? "🏆 胜" : banner.draw ? "🤝 平" : "💀 负"}  ${myTotal} : ${oppTotal}\n${blocks}\nELO ${banner.delta >= 0 ? "+" : ""}${banner.delta} → ${banner.newRating}`;
    if (navigator.share) navigator.share({ text: txt }).catch(() => navigator.clipboard.writeText(txt));
    else navigator.clipboard.writeText(txt);
  };

  return (
    <div>
      <div className={cn("rounded-3xl border-2 bg-gradient-to-br p-6 text-center shadow-tile", tone)}>
        <div className="text-5xl">
          {banner.draw ? "🤝" : banner.won ? "🏆" : "💀"}
        </div>
        <h2 className="mt-2 text-3xl font-extrabold">
          {banner.draw ? "平局" : banner.won ? "胜利！" : "失败"}
        </h2>
        <div className="mt-1 text-sm text-muted-foreground">
          对手：{opponent.is_bot && <Bot className="inline size-3" />} {opponent.alias} · ELO {opponent.rating}
        </div>

        <div className="mt-4 inline-flex items-baseline gap-3 rounded-2xl bg-card/80 px-5 py-3">
          <span className="text-3xl font-extrabold tabular-nums">{myTotal}</span>
          <span className="text-xl text-muted-foreground">:</span>
          <span className="text-3xl font-extrabold tabular-nums">{oppTotal}</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm font-bold">
          <span>
            ELO{" "}
            <span className={cn("tabular-nums", banner.delta >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {banner.delta >= 0 ? "+" : ""}{banner.delta}
            </span>
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="inline-flex items-center gap-1">
            <span>{tierEmoji(banner.newRating)}</span>
            <span className="tabular-nums">{banner.newRating}</span>
          </span>
        </div>
      </div>

      {/* Round breakdown */}
      <div className="mt-4 rounded-2xl border bg-card p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">逐回合战报</div>
        <ol className="space-y-1.5 text-sm">
          {logs.map((l) => (
            <li key={l.round} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="font-bold">R{l.round}</span>
              <span className="font-mono text-xs">{l.correct}</span>
              <span className={cn("inline-flex items-center gap-1 text-xs", l.my_answer === l.correct ? "text-emerald-600" : "text-rose-600")}>
                {l.my_answer === l.correct ? <Check className="size-3" /> : <X className="size-3" />}
                +{l.my_score}
              </span>
              <span className="text-xs text-muted-foreground">vs +{l.opp_score}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button onClick={onPlayAgain} className="rounded-2xl bg-rose-600 font-extrabold hover:bg-rose-700">
          <Swords className="mr-1 size-4" /> 再战
        </Button>
        <Button onClick={share} variant="outline" className="rounded-2xl border-2 font-extrabold">
          <Zap className="mr-1 size-4" /> 分享
        </Button>
        <Button onClick={onExit} variant="outline" className="rounded-2xl border-2 font-extrabold">
          <Trophy className="mr-1 size-4" /> 返回
        </Button>
      </div>
    </div>
  );
}

/* ============= Duel Leaderboard (ELO + Tier) ============= */
type DuelRow = {
  rank: number;
  alias: string;
  rating: number;
  wins: number;
  losses: number;
  best_streak: number;
  tier: string;
  is_me: boolean;
};

function DuelLeaderboard() {
  const [rows, setRows] = useState<DuelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase.rpc("get_duel_leaderboard", { _scope: "all" });
      if (cancel) return;
      setRows((data ?? []) as DuelRow[]);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="mt-4 rounded-3xl border-2 border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-orange-500/5 p-5 shadow-tile">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="size-5 text-rose-600 dark:text-rose-400" />
        <h3 className="text-base font-extrabold">段位排行榜</h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> 加载中…
        </div>
      ) : rows.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">还没有人上榜，去打第一场吧！</div>
      ) : (
        <ol className="space-y-1.5">
          {rows.slice(0, 20).map((r) => (
            <li
              key={r.rank + r.alias}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                r.is_me ? "bg-primary/15 ring-2 ring-primary/40" : "bg-card/60"
              )}
            >
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-extrabold tabular-nums">
                {r.rank === 1 ? <Crown className="size-4 text-amber-500" /> :
                 r.rank === 2 ? <Medal className="size-4 text-slate-400" /> :
                 r.rank === 3 ? <Medal className="size-4 text-amber-700" /> :
                 r.rank}
              </span>
              <span className="text-base">{tierEmoji(r.rating)}</span>
              <span className="flex-1 truncate font-bold">
                {r.alias} {r.is_me && <span className="text-xs text-primary">(我)</span>}
                <span className="ml-2 text-[10px] text-muted-foreground">{r.tier}</span>
              </span>
              <span className="text-xs text-muted-foreground">{r.wins}W·{r.losses}L</span>
              <span className="font-extrabold tabular-nums">{r.rating}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}