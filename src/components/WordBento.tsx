import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCw, Trophy, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { awardCoins, unlockBadge, BADGE_CATALOG, type BadgeDef } from "@/lib/coinsBadges";
import { CoinPill, BadgeUnlockOverlay } from "@/components/CoinsBadgesUi";
import GameLeaderboard from "@/components/GameLeaderboard";

/* ============================================================
   Word Bento 单词便当
   - 12 张英文 + 12 张中文 = 24 张卡随机排列在 6×4 网格
   - 玩家先点一张英文，再点对应中文（或反过来）
   - 配对成功 → 双卡变绿溶解；新一对自动从池中补位
   - 配对失败 → 双卡闪红 0.4s，扣 combo
   - 60 词 / 局；每对正确 +10 分 ×combo 倍率
   - 全对触发 perfect 奖励；总用时排行
   ============================================================ */

type Vocab = {
  id: string;
  word: string;
  meaning_cn: string;
};

type Card = {
  key: string;        // unique render key
  pairId: string;     // vocab.id
  side: "en" | "cn";
  text: string;
};

const TOTAL_PAIRS = 30;       // 一局共配对数
const VISIBLE_PAIRS = 6;      // 屏幕上同时显示的 pair 数（=12 张卡）
const BASE_POINT = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

/* -------- 零延迟英文发音 (浏览器原生 SpeechSynthesis) -------- */
let _enVoice: SpeechSynthesisVoice | null = null;
function pickEnVoice(): SpeechSynthesisVoice | null {
  if (_enVoice) return _enVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // 优先 en-US > en-GB > en-*；优先 Google/Samantha 等高质量声音
  const preferred =
    voices.find((v) => /en[-_]US/i.test(v.lang) && /google|samantha|natural/i.test(v.name)) ||
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /en[-_]GB/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
  _enVoice = preferred;
  return preferred;
}
function speakInstant(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    // 立即打断上一段（避免排队 → 延迟）
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickEnVoice();
    if (v) u.voice = v;
    u.lang = v?.lang || "en-US";
    u.rate = 1.0;
    u.pitch = 1.0;
    u.volume = 1.0;
    synth.speak(u);
  } catch {
    /* ignore */
  }
}

export default function WordBento({
  pool,
  onExit,
}: {
  pool: Vocab[];
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");

  // Game state
  const [queue, setQueue] = useState<Vocab[]>([]);   // 剩余还没上场的词
  const [board, setBoard] = useState<Card[]>([]);    // 当前棋盘 12 张卡（视觉位置 = index）
  const [picked, setPicked] = useState<Card | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [coinRefresh, setCoinRefresh] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeDef[]>([]);
  const lockRef = useRef(false);   // 错误反馈期间的输入锁

  // -------- Helpers --------
  function makeCardsFromVocab(v: Vocab): [Card, Card] {
    return [
      { key: `${v.id}-en-${Math.random().toString(36).slice(2, 8)}`, pairId: v.id, side: "en", text: v.word },
      { key: `${v.id}-cn-${Math.random().toString(36).slice(2, 8)}`, pairId: v.id, side: "cn", text: v.meaning_cn },
    ];
  }

  // -------- Game lifecycle --------
  function start() {
    const usable = pool.filter((v) => v.word && v.meaning_cn);
    if (usable.length < VISIBLE_PAIRS + 1) return;
    const sequence = shuffle(usable).slice(0, TOTAL_PAIRS);
    const initialPairs = sequence.slice(0, VISIBLE_PAIRS);
    const remainder = sequence.slice(VISIBLE_PAIRS);
    const initialCards = shuffle(initialPairs.flatMap(makeCardsFromVocab));
    setQueue(remainder);
    setBoard(initialCards);
    setPicked(null);
    setWrongPair(null);
    setMatchedPairs(new Set());
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setMistakes(0);
    setStartedAt(Date.now());
    setElapsed(0);
    setUnlockedBadges([]);
    setPhase("playing");
  }

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setElapsed(Date.now() - startedAt), 200);
    return () => clearInterval(t);
  }, [phase, startedAt]);

  function comboMultiplier(c: number) {
    if (c >= 10) return 3;
    if (c >= 5) return 2;
    if (c >= 3) return 1.5;
    return 1;
  }

  // -------- Click handler --------
  function onCardClick(card: Card) {
    if (lockRef.current) return;
    if (matchedPairs.has(card.pairId)) return;
    if (picked && picked.key === card.key) {
      setPicked(null);
      return;
    }
    if (!picked) {
      setPicked(card);
      return;
    }
    // Has a picked card → judge
    if (picked.pairId === card.pairId && picked.side !== card.side) {
      // ✅ Match
      // 立即发音英文（picked 或 card 中 side==='en' 的那张）—— 零延迟
      const enText = picked.side === "en" ? picked.text : card.text;
      speakInstant(enText);
      const newMatched = new Set(matchedPairs);
      newMatched.add(card.pairId);
      setMatchedPairs(newMatched);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      const gained = Math.round(BASE_POINT * comboMultiplier(newCombo));
      setScore((s) => s + gained);
      setPicked(null);

      // After 350ms, replace the two matched cards with a new pair from the queue (or remove if queue empty)
      setTimeout(() => {
        setBoard((prev) => {
          // Filter out the two matched cards
          const remaining = prev.filter((c) => c.pairId !== card.pairId);
          // If queue still has words, push a new pair into freed slots (random positions among remaining)
          let nextQueue: Vocab[] = [];
          let pairToInsert: Vocab | null = null;
          setQueue((q) => {
            if (q.length === 0) {
              nextQueue = q;
              return q;
            }
            pairToInsert = q[0];
            nextQueue = q.slice(1);
            return nextQueue;
          });
          if (!pairToInsert) {
            // No more new pairs → game continues until board empty
            if (remaining.length === 0) {
              // Done!
              finish(true);
            }
            return remaining;
          }
          const [enCard, cnCard] = makeCardsFromVocab(pairToInsert);
          // Insert into 2 random positions to avoid the user's eyes tracking
          const out = [...remaining];
          const pos1 = Math.floor(Math.random() * (out.length + 1));
          out.splice(pos1, 0, enCard);
          const pos2 = Math.floor(Math.random() * (out.length + 1));
          out.splice(pos2, 0, cnCard);
          return out;
        });
      }, 350);
    } else {
      // ❌ Wrong
      setMistakes((m) => m + 1);
      setCombo(0);
      setWrongPair([picked.key, card.key]);
      lockRef.current = true;
      setTimeout(() => {
        setWrongPair(null);
        setPicked(null);
        lockRef.current = false;
      }, 450);
    }
  }

  // -------- Finish --------
  async function finish(natural: boolean) {
    if (phase === "done") return;
    setPhase("done");
    const finalElapsed = Date.now() - startedAt;
    setElapsed(finalElapsed);

    // Score bonuses
    let coins = Math.floor(score / 5);
    const perfect = mistakes === 0 && natural;
    const sub60 = finalElapsed < 60_000 && natural;
    if (perfect) coins += 30;
    if (sub60) coins += 20;

    if (coins > 0) {
      await awardCoins(coins);
      setCoinRefresh((k) => k + 1);
    }

    // Save score
    try {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        await supabase.from("vocab_game_scores").insert({
          user_id: u.user.id,
          game_type: "word_bento",
          score,
          best_combo: bestCombo,
          duration_ms: finalElapsed,
          hits: matchedPairs.size,
          misses: mistakes,
          metadata: { perfect, sub60 },
        });
      }
    } catch (e) {
      console.error("save score", e);
    }

    // Badges
    const badges: BadgeDef[] = [];
    if (perfect) {
      const def = await unlockBadge("bento_master");
      if (def) badges.push(def);
    }
    if (sub60) {
      const def = await unlockBadge("bento_speedster");
      if (def) badges.push(def);
    }
    if (badges.length) setUnlockedBadges(badges);
  }

  // ============ Render ============
  if (phase === "intro") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> 返回
          </button>
          <CoinPill refreshKey={coinRefresh} />
        </div>

        <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent p-6 shadow-tile">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🍱</div>
            <div>
              <h1 className="text-2xl font-extrabold">Word Bento 单词便当</h1>
              <p className="text-sm text-muted-foreground">拖拽配对消除 · 主动检索 + 双重编码</p>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            <li>🎯 屏幕上 12 张卡：6 个英文 + 6 个中文</li>
            <li>👆 点一张英文 → 再点对应中文，配对成功消除</li>
            <li>🔥 连击 3+ 倍率 ×1.5，5+ ×2，10+ ×3</li>
            <li>💯 全程零失误：徽章 🍱 + 30 金币</li>
            <li>⏱ 60 秒内通关：徽章 🏎️ + 20 金币</li>
            <li>📊 共 {TOTAL_PAIRS} 对单词，配完即胜</li>
          </ul>

          <Button
            onClick={start}
            disabled={pool.length < VISIBLE_PAIRS + 1}
            className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-base font-extrabold text-white hover:opacity-90"
          >
            <Sparkles className="mr-2 size-5" /> 开始游戏
          </Button>
        </div>

        <div className="mt-4">
          <GameLeaderboard gameType="word_bento" title="单词便当" accent="amber" />
        </div>
      </main>
    );
  }

  if (phase === "done") {
    const accuracy = matchedPairs.size + mistakes > 0
      ? Math.round((matchedPairs.size / (matchedPairs.size + mistakes)) * 100)
      : 0;
    return (
      <>
        <main className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> 返回
            </button>
            <CoinPill refreshKey={coinRefresh} />
          </div>
          <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center shadow-tile">
            <Trophy className="mx-auto size-14 text-amber-500" />
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">Final Score</div>
            <div className="text-6xl font-extrabold tabular-nums">{score}</div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
              <div className="rounded-xl border bg-card p-2">
                <div className="text-[10px] text-muted-foreground">配对</div>
                <div className="text-lg font-bold text-emerald-600">{matchedPairs.size}</div>
              </div>
              <div className="rounded-xl border bg-card p-2">
                <div className="text-[10px] text-muted-foreground">错误</div>
                <div className="text-lg font-bold text-red-500">{mistakes}</div>
              </div>
              <div className="rounded-xl border bg-card p-2">
                <div className="text-[10px] text-muted-foreground">最高连击</div>
                <div className="text-lg font-bold text-amber-600">{bestCombo}</div>
              </div>
              <div className="rounded-xl border bg-card p-2">
                <div className="text-[10px] text-muted-foreground">用时</div>
                <div className="text-lg font-bold tabular-nums">{formatMs(elapsed)}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">准确率 {accuracy}%</div>

            {(mistakes === 0 || elapsed < 60_000) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {mistakes === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    💯 完美零失误 +30
                  </span>
                )}
                {elapsed < 60_000 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/50 bg-fuchsia-500/10 px-3 py-1 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">
                    🏎️ 极速通关 +20
                  </span>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button onClick={start} className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white hover:opacity-90">
                <RotateCw className="mr-2 size-4" /> 再来一局
              </Button>
              <Button variant="outline" onClick={onExit} className="h-12 flex-1 rounded-2xl">
                返回
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <GameLeaderboard gameType="word_bento" title="单词便当" accent="amber" />
          </div>
        </main>
        {unlockedBadges.length > 0 && (
          <BadgeUnlockOverlay badges={unlockedBadges} onDismiss={() => setUnlockedBadges([])} />
        )}
      </>
    );
  }

  /* Playing */
  const totalLeft = TOTAL_PAIRS - matchedPairs.size;
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-4">
      {/* Top bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 退出
        </button>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">⏱ {formatMs(elapsed)}</span>
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">🎯 {score}</span>
          {combo >= 2 && (
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-white tabular-nums shadow-sm">
              🔥 ×{comboMultiplier(combo)}
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${(matchedPairs.size / TOTAL_PAIRS) * 100}%` }}
          />
        </div>
        <span className="tabular-nums">{matchedPairs.size}/{TOTAL_PAIRS}</span>
      </div>

      {/* Bento grid 4 columns × 3 rows = 12 cards */}
      <div className="grid flex-1 grid-cols-4 gap-2 sm:gap-3" style={{ minHeight: "60vh" }}>
        {board.map((c) => {
          const isPicked = picked?.key === c.key;
          const isWrong = wrongPair?.includes(c.key);
          const isMatched = matchedPairs.has(c.pairId);
          const isEn = c.side === "en";
          return (
            <button
              key={c.key}
              onClick={() => onCardClick(c)}
              disabled={isMatched}
              className={cn(
                "relative flex items-center justify-center rounded-2xl border-2 px-2 py-3 text-center text-sm font-bold shadow-sm transition-all duration-200",
                "min-h-[68px] sm:min-h-[80px]",
                isMatched && "opacity-0 scale-90 pointer-events-none",
                !isMatched && isPicked && "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/50 scale-105 shadow-md",
                !isMatched && isWrong && "border-red-500 bg-red-500/15 animate-pulse",
                !isMatched && !isPicked && !isWrong && (
                  isEn
                    ? "border-sky-300/60 bg-gradient-to-br from-sky-500/10 to-blue-500/5 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                    : "border-rose-300/60 bg-gradient-to-br from-rose-500/10 to-pink-500/5 text-rose-700 dark:text-rose-300 hover:border-rose-500"
                ),
                "active:scale-95"
              )}
            >
              <span className="break-words leading-tight">
                {c.text}
              </span>
              <span className="absolute right-1 top-1 text-[9px] font-normal opacity-50">
                {isEn ? "EN" : "中"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Combo banner */}
      {combo >= 5 && (
        <div className="mt-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-extrabold text-white shadow-md animate-pulse">
            <Zap className="size-4" /> COMBO ×{combo} ON FIRE
          </div>
        </div>
      )}

      <div className="mt-3 text-center text-[11px] text-muted-foreground">
        剩余 {totalLeft} 对 · 错误 {mistakes} · 最佳连击 {bestCombo}
      </div>
    </main>
  );
}