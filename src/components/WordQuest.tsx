import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Volume2, Sparkles, Loader2, Check, X, Lightbulb, Share2, Trophy, Flame, Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { speak, prefetchTTS } from "@/lib/speak";
import { awardCoins, unlockBadge, type BadgeDef } from "@/lib/coinsBadges";
import { CoinPill, BadgeUnlockOverlay } from "@/components/CoinsBadgesUi";

/* ============================================================
   Word Quest 单词奇旅
   - 每天系统从词池里基于日期 hash 选 3 个"今日单词"（全平台同款）
   - 每词打 6 关：听音/释义/例句/同义/拼写/BOSS（共 18 关）
   - 每天每位用户只能挑战 1 次
   - 通关后展示分享卡（emoji 战绩）+ streak / 排行榜
   ============================================================ */

type Vocab = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  synonyms?: any;
  accent?: "UK" | "US" | "BOTH" | null;
};

type StageResult = {stage: number;correct: boolean;latency_ms: number;};

type StreakStats = {
  current_streak: number;
  longest_streak: number;
  today_done: boolean;
  this_month_days: number;
  total_perfect: number;
};

type LeaderRow = {
  rank: number;
  alias: string;
  duration_ms: number;
  perfect: boolean;
  is_me: boolean;
};

/* ---------- Daily seed picker ---------- */
function todayKey() {
  // 4am day boundary
  const d = new Date(Date.now() - 4 * 3600_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function hashStr(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h << 5) + h ^ s.charCodeAt(i);
  return Math.abs(h);
}
function pickDailyVocabs(pool: Vocab[], n = 3): Vocab[] {
  if (!pool.length) return [];
  const eligible = pool.filter(
    (v) => v.example_en && v.example_en.length > 12 && v.word.length >= 4 && /^[a-zA-Z]+$/.test(v.word)
  );
  const candidates = eligible.length > 50 ? eligible : pool;
  if (!candidates.length) return [];
  const baseHash = hashStr(todayKey());
  const picked: Vocab[] = [];
  const used = new Set<string>();
  // Spread the 3 picks across the candidate space using prime offsets to avoid duplicates
  const offsets = [0, 7919, 15485];
  for (let i = 0; i < n; i++) {
    for (let attempt = 0; attempt < candidates.length; attempt++) {
      const idx = (baseHash + offsets[i % offsets.length] + attempt * 101) % candidates.length;
      const v = candidates[idx];
      if (!used.has(v.id)) {
        used.add(v.id);
        picked.push(v);
        break;
      }
    }
  }
  return picked;
}

function speakWord(v: Vocab) {
  const text = v.word.split("/")[0];
  const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
  return speak(text, acc ? { accent: acc } : undefined);
}

/* ---------- Stage definitions ---------- */
const STAGES = [
{ n: 1, emoji: "🔊", name: "听音猜词", hint: "听发音，输入英文单词" },
{ n: 2, emoji: "💡", name: "看义猜词", hint: "根据中文释义，输入英文单词" },
{ n: 3, emoji: "📝", name: "例句填空", hint: "在例句空白处填入正确单词" },
{ n: 4, emoji: "🎭", name: "同义辨析", hint: "选出与今日词意思最接近的选项" },
{ n: 5, emoji: "🔤", name: "字母重排", hint: "将打乱的字母拼成正确单词" },
{ n: 6, emoji: "⏱", name: "BOSS 战", hint: "30 秒内综合作答" }];

const STAGES_PER_WORD = STAGES.length;
const WORDS_PER_QUEST = 3;
const TOTAL_STAGES = STAGES_PER_WORD * WORDS_PER_QUEST; // 18

function shuffleStr(s: string) {
  const a = s.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Avoid identical shuffle
  if (a.join("") === s && s.length > 1) return shuffleStr(s);
  return a.join("");
}

function emojiSummary(results: StageResult[]) {
  return results.map((r) => r.correct ? "🟩" : "🟥").join("");
}

/* =============================================================== */
export default function WordQuest({
  pool,
  onExit,
  variant = "gaokao",
  maxStages,
  wordsPerQuest: wordsPerQuestProp,
  onComplete














}: {pool: Vocab[];onExit: () => void; /** "gaokao" 走原写库 + RPC streak 流程;"primary" 完全跳过,把结果交给 onComplete 写入小学专表。 */variant?: "gaokao" | "primary"; /** 总关卡数,默认 18(3 词 × 6 关)。小学版传 6 → 1 词 × 6 关。 */maxStages?: number; /** 当日选词数,默认 3。和 maxStages 配合,小学版传 1。 */wordsPerQuest?: number; /** 完成时回调,允许 wrapper 写入自己的统计表。 */onComplete?: (info: {score: number;perfect: boolean;passed: number;total: number;durationMs: number;hintsUsed: number;words: string[];}) => void | Promise<void>;}) {
  const totalStages = Math.max(1, maxStages ?? TOTAL_STAGES);
  const wordsPerQuest = Math.max(
    1,
    wordsPerQuestProp ?? Math.max(1, Math.ceil(totalStages / STAGES_PER_WORD))
  );
  const isPrimary = variant === "primary";
  const [phase, setPhase] = useState<"loading" | "intro" | "playing" | "done" | "already">("loading");
  const [targets, setTargets] = useState<Vocab[]>([]);
  const [stage, setStage] = useState(0); // 0..17 (=>18 关 = 3 词 × 6 关)
  const [results, setResults] = useState<StageResult[]>([]);
  const [stageStartedAt, setStageStartedAt] = useState(0);
  const [questStartedAt, setQuestStartedAt] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState<StreakStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [coinRefresh, setCoinRefresh] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeDef[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  // 当前关的 word index 和 sub-stage
  const wordIdx = Math.floor(stage / STAGES_PER_WORD);
  const subStage = stage % STAGES_PER_WORD;
  const target = targets[wordIdx] ?? null;

  // P2 预热:选定今日词即按网络预热其音频,键与 speakWord 一致(默认音色 + 逐词 accent)。
  // stage 0 自动播(:585)与点喇叭秒响,消除冷合成 1-3s;prefetchTTS 纯网络,不碰 <audio>。
  useEffect(() => {
    for (const v of targets) {
      const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
      prefetchTTS(v.word.split("/")[0], acc ? { accent: acc } : undefined);
    }
  }, [targets]);

  // --- Bootstrap: pick daily, check today's status ---
  useEffect(() => {
    (async () => {
      const vs = pickDailyVocabs(pool, wordsPerQuest);
      setTargets(vs);
      if (isPrimary) {
        // 小学版不调高考专属 RPC,today_done 由 wrapper 自己拦截。
        setStreak(null);
        setLeaderboard([]);
        setPhase("intro");
      } else {
        const { data } = await supabase.rpc("get_word_quest_streak");
        const s = (data?.[0] ?? null) as StreakStats | null;
        setStreak(s);
        const { data: lb } = await supabase.rpc("get_word_quest_daily_leaderboard");
        setLeaderboard((lb ?? []) as LeaderRow[]);
        if (s?.today_done) setPhase("already");else
        setPhase("intro");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.length]);

  function start() {
    if (!targets.length) return;
    setPhase("playing");
    setStage(0);
    setResults([]);
    setHintsUsed(0);
    const now = Date.now();
    setQuestStartedAt(now);
    setStageStartedAt(now);
  }

  async function recordStage(correct: boolean) {
    const latency = Date.now() - stageStartedAt;
    const r: StageResult = { stage: stage + 1, correct, latency_ms: latency };
    const nextResults = [...results, r];
    setResults(nextResults);

    // brief pause then advance
    setTimeout(() => {
      if (stage + 1 >= totalStages) {
        finish(nextResults);
      } else {
        setStage(stage + 1);
        setStageStartedAt(Date.now());
      }
    }, 800);
  }

  async function finish(finalResults: StageResult[]) {
    if (!targets.length) return;
    const totalDuration = Date.now() - questStartedAt;
    const passed = finalResults.filter((r) => r.correct).length;
    const perfect = passed === totalStages && hintsUsed === 0;

    // Score: 100 base/stage * combo bonus, minus hint penalty
    let score = passed * 100;
    if (perfect) score += 500;
    if (totalDuration < 240_000) score += 200;
    score -= hintsUsed * 30;
    score = Math.max(0, score);

    setPhase("done");

    if (isPrimary) {
      try {
        await onComplete?.({
          score, perfect, passed, total: totalStages,
          durationMs: totalDuration, hintsUsed,
          words: targets.map((t) => t.word)
        });
      } catch (e) {console.error("primary quest onComplete", e);}
      const coins = Math.floor(score / 5);
      if (coins > 0) {
        await awardCoins(coins);
        setCoinRefresh((k) => k + 1);
      }
      return;
    }

    try {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        await supabase.from("word_quest_attempts").insert({
          user_id: u.user.id,
          quest_date: todayKey(),
          target_word: targets.map((t) => t.word).join(", "),
          target_vocab_id: targets[0].id,
          stages_passed: passed,
          stage_results: finalResults,
          total_duration_ms: totalDuration,
          perfect,
          hints_used: hintsUsed,
          score
        });

        // Game scores aggregate
        await supabase.from("vocab_game_scores").insert({
          user_id: u.user.id,
          game_type: "word_quest",
          score,
          best_combo: passed,
          duration_ms: totalDuration,
          hits: passed,
          misses: totalStages - passed,
          metadata: { perfect, hints_used: hintsUsed, words: targets.map((t) => t.word) }
        });
      }
    } catch (e) {
      console.error("save quest", e);
    }

    // Coins
    const coins = Math.floor(score / 5);
    if (coins > 0) {
      await awardCoins(coins);
      setCoinRefresh((k) => k + 1);
    }

    // Badges
    const badges: BadgeDef[] = [];
    if (perfect) {
      const def = await unlockBadge("quest_perfect");
      if (def) badges.push(def);
    }
    // Re-fetch streak to check threshold
    const { data: s2 } = await supabase.rpc("get_word_quest_streak");
    const newStreak = (s2?.[0] ?? null) as StreakStats | null;
    setStreak(newStreak);
    if (newStreak) {
      if (newStreak.current_streak >= 3) {
        const def = await unlockBadge("quest_streak_3");
        if (def) badges.push(def);
      }
      if (newStreak.current_streak >= 7) {
        const def = await unlockBadge("quest_streak_7");
        if (def) badges.push(def);
      }
      if (newStreak.current_streak >= 30) {
        const def = await unlockBadge("quest_streak_30");
        if (def) badges.push(def);
      }
    }
    if (badges.length) setUnlockedBadges(badges);

    // Refresh leaderboard
    const { data: lb } = await supabase.rpc("get_word_quest_daily_leaderboard");
    setLeaderboard((lb ?? []) as LeaderRow[]);
  }

  function handleShare() {
    if (!targets.length) return;
    const summary = emojiSummary(results);
    const dur = (results.reduce((s, r) => s + r.latency_ms, 0) / 1000).toFixed(1);
    const wordsLine = targets.map((t) => t.word).join(" · ");
    const text = `🗺️ Word Quest ${todayKey()}\n${wordsLine}\n${summary}\n⏱ ${dur}s · 🔥 连续 ${streak?.current_streak ?? 0} 天\n${window.location.origin}/gaokao/vocab?mode=quest`;
    navigator.clipboard?.writeText(text).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }

  /* ---------- Loading ---------- */
  if (phase === "loading") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>);

  }

  if (!targets.length) {
    return (
      <main className="mx-auto max-w-xl p-8 text-center">
        <p className="text-sm text-muted-foreground"><T>词库不足，无法开启今日挑战</T></p>
        <Button variant="outline" onClick={onExit} className="mt-4"><T>返回</T></Button>
      </main>);

  }

  /* ---------- Already done today ---------- */
  if (phase === "already") {
    return (
      <main className="mx-auto max-w-xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> <T>返回</T>
          </button>
          <CoinPill refreshKey={coinRefresh} />
        </div>
        <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-teal-500/5 p-6 text-center shadow-tile">
          <div className="text-5xl">✅</div>
          <h2 className="mt-3 text-xl font-extrabold"><T>今日挑战已完成！</T></h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <T>明天 04:00 全平台解锁新词。坚持每日打卡可解锁稀有徽章。</T>
          </p>
          <StreakStrip streak={streak} className="mt-5" />
          <div className="mt-5">
            <DailyLeaderboard rows={leaderboard} />
          </div>
        </div>
      </main>);

  }

  /* ---------- Intro ---------- */
  if (phase === "intro") {
    return (
      <main className="mx-auto max-w-xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> <T>返回</T>
          </button>
          <CoinPill refreshKey={coinRefresh} />
        </div>
        <div className="rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-transparent p-6 shadow-tile">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🗺️</div>
            <div>
              <h1 className="text-2xl font-extrabold"><T>Word Quest 单词奇旅</T></h1>
              <p className="text-sm text-muted-foreground"><T>每日 3 词 · 每词 6 关 · 共 18 关</T></p>
            </div>
          </div>

          <StreakStrip streak={streak} className="mt-5" />

          <div className="mt-5 rounded-2xl border bg-card/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground"><T>每个单词将通过 6 个不同关卡考察</T></div>
            <ol className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {STAGES.map((s) =>
              <li key={s.n} className="flex items-center gap-2 rounded-lg bg-background px-2 py-1.5">
                  <span className="text-base">{s.emoji}</span>
                  <span className="font-bold"><T>{s.name}</T></span>
                </li>
              )}
            </ol>
            <div className="mt-2 text-[11px] text-muted-foreground">
              <T>📚 共</T> <b className="text-foreground"><T>3 个单词</T></b><T>，连续打完一个再切下一个 · 总</T> <b className="text-foreground"><T>18 关</T></b>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
            <T>⚠️ 每天只有</T> <b><T>1 次机会</T></b><T>。专注作答，挑战自己 + 全球玩家。</T>
          </div>

          <Button
            onClick={start}
            className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-base font-extrabold text-white hover:opacity-90">
            
            <Sparkles className="mr-2 size-5" /> <T>开始今日挑战</T>
          </Button>
        </div>

        <div className="mt-4">
          <DailyLeaderboard rows={leaderboard} />
        </div>
      </main>);

  }

  /* ---------- Done ---------- */
  if (phase === "done") {
    const totalDur = results.reduce((s, r) => s + r.latency_ms, 0);
    const passed = results.filter((r) => r.correct).length;
    return (
      <>
        <main className="mx-auto max-w-xl px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> <T>返回</T>
            </button>
            <CoinPill refreshKey={coinRefresh} />
          </div>
          <div className={cn(
            "rounded-3xl border-2 p-6 text-center shadow-tile",
            passed === totalStages ? "border-amber-500/50 bg-gradient-to-br from-amber-500/15 to-orange-500/5" : "border-indigo-500/40 bg-gradient-to-br from-indigo-500/15 to-sky-500/5"
          )}>
            <div className="text-5xl">{passed === totalStages ? "🏆" : passed >= Math.ceil(totalStages * 0.66) ? "🌟" : "📚"}</div>
            <h2 className="mt-3 text-xl font-extrabold">
              {passed === totalStages ? "完美通关！" : `通关 ${passed}/${totalStages} 关`}
            </h2>
            <div className="mt-1 text-sm text-muted-foreground">
              <T>今日</T> {wordsPerQuest} <T>词 ·</T> {targets.map((t) => t.word).join(" · ")}
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground italic">
              {targets.map((t) =>
              <span key={t.id}><b className="not-italic text-foreground">{t.word}</b> {t.meaning_cn}</span>
              )}
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-2xl tracking-widest">
              {emojiSummary(results)}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl border bg-card p-2">
                <div className="text-[10px] text-muted-foreground"><T>用时</T></div>
                <div className="text-base font-bold tabular-nums">{(totalDur / 1000).toFixed(1)}s</div>
              </div>
              <div className="rounded-xl border bg-card p-2">
                <div className="text-[10px] text-muted-foreground"><T>提示</T></div>
                <div className="text-base font-bold">{hintsUsed}</div>
              </div>
              <div className="rounded-xl border bg-card p-2">
                <div className="text-[10px] text-muted-foreground"><T>连续</T></div>
                <div className="text-base font-bold text-orange-600">🔥 {streak?.current_streak ?? 0}</div>
              </div>
            </div>

            <Button onClick={handleShare} variant="outline" className="mt-4 h-11 w-full rounded-2xl">
              <Share2 className="mr-2 size-4" /> {shareCopied ? "已复制战绩到剪贴板！" : "分享我的战绩"}
            </Button>
          </div>

          <div className="mt-4">
            <DailyLeaderboard rows={leaderboard} />
          </div>
        </main>
        {unlockedBadges.length > 0 &&
        <BadgeUnlockOverlay badges={unlockedBadges} onDismiss={() => setUnlockedBadges([])} />
        }
      </>);

  }

  /* ---------- Playing ---------- */
  if (!target) return null;
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>退出（视为放弃）</T>
        </button>
        <div className="text-xs font-bold text-muted-foreground">
          <T>📚 第</T> {wordIdx + 1}/{wordsPerQuest} <T>词 ·</T> {STAGES[subStage].emoji} <T>第</T> {subStage + 1}/{STAGES_PER_WORD} <T>关</T>
        </div>
      </div>

      {/* progress: wordsPerQuest groups of STAGES_PER_WORD */}
      <div className="mb-4 flex gap-2">
        {Array.from({ length: wordsPerQuest }).map((_, gi) =>
        <div key={gi} className="flex flex-1 gap-0.5">
            {Array.from({ length: STAGES_PER_WORD }).map((__, si) => {
            const i = gi * STAGES_PER_WORD + si;
            const r = results[i];
            return (
              <div
                key={si}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all",
                  r ? r.correct ? "bg-emerald-500" : "bg-red-500" :
                  i === stage ? "bg-indigo-500" : "bg-muted"
                )} />);


          })}
          </div>
        )}
      </div>

      <StagePlayer
        stage={subStage}
        target={target}
        pool={pool}
        onResult={recordStage}
        onHint={() => setHintsUsed((h) => h + 1)} />
      
    </main>);

}

/* ============================================================
   Stage player — renders different UI per stage
   ============================================================ */
function StagePlayer({
  stage,
  target,
  pool,
  onResult,
  onHint






}: {stage: number;target: Vocab;pool: Vocab[];onResult: (correct: boolean) => void;onHint: () => void;}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<null | "ok" | "bad">(null);
  const [showHint, setShowHint] = useState(false);
  const [bossLeft, setBossLeft] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on stage change
  useEffect(() => {
    setInput("");
    setSubmitted(null);
    setShowHint(false);
    setBossLeft(30);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [stage]);

  // BOSS countdown
  useEffect(() => {
    if (stage !== 5 || submitted) return;
    if (bossLeft <= 0) {
      submit("");
      return;
    }
    const t = setTimeout(() => setBossLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, bossLeft, submitted]);

  // Auto-play audio for stage 1
  useEffect(() => {
    if (stage === 0) {
      setTimeout(() => speakWord(target), 300);
    }
  }, [stage, target]);

  function judgeText(value: string) {
    return value.trim().toLowerCase() === target.word.trim().toLowerCase();
  }

  function submit(value: string) {
    if (submitted) return;
    let ok = false;
    if (stage === 3) {
      // multi-choice: value is the chosen option text
      ok = value === target.meaning_cn;
    } else {
      ok = judgeText(value);
    }
    setSubmitted(ok ? "ok" : "bad");
    onResult(ok);
  }

  function pickHint() {
    if (showHint) return;
    setShowHint(true);
    onHint();
  }

  // Build distractors for stage 4 (synonym discrimination)
  const choices4 = useMemo(() => {
    if (stage !== 3) return [];
    const distractors = pool.filter((v) => v.id !== target.id && v.meaning_cn).slice(0, 200);
    const shuffled = distractors.sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [...shuffled.map((v) => v.meaning_cn), target.meaning_cn];
    return all.sort(() => Math.random() - 0.5);
  }, [stage, target.id, pool]);

  // Stage 5 letters
  const scrambled = useMemo(() => {
    if (stage !== 4) return "";
    return shuffleStr(target.word);
  }, [stage, target.word]);

  /* -------- Render per stage -------- */
  const stageMeta = STAGES[stage];

  return (
    <div className="flex flex-1 flex-col rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-transparent p-5 shadow-tile">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{stageMeta.emoji}</span>
        <div>
          <div className="text-base font-extrabold"><T>{stageMeta.name}</T></div>
          <div className="text-[11px] text-muted-foreground"><T>{stageMeta.hint}</T></div>
        </div>
        {stage === 5 &&
        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-extrabold text-white tabular-nums">
            {bossLeft}s
          </span>
        }
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        {/* Stage 1: 听音 */}
        {stage === 0 &&
        <>
            <button
            onClick={() => speakWord(target)}
            className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg active:scale-95">
            
              <Volume2 className="size-12" />
            </button>
            <div className="text-center text-xs text-muted-foreground"><T>点击重听 · 输入英文单词</T></div>
            {showHint &&
          <div className="text-center text-sm">
                <T>💡 释义：</T><b>{target.meaning_cn}</b>
                {target.phonetic && <div className="text-xs text-muted-foreground">{target.phonetic}</div>}
              </div>
          }
          </>
        }

        {/* Stage 2: 看义 */}
        {stage === 1 &&
        <>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>中文释义</T></div>
              <div className="mt-2 text-3xl font-extrabold">{target.meaning_cn}</div>
              {target.pos && <div className="mt-1 text-sm text-muted-foreground">{target.pos}</div>}
            </div>
            {showHint &&
          <div className="text-sm"><T>💡 首字母：</T><b className="text-indigo-600">{target.word[0].toUpperCase()}</b> <T>· 共</T> {target.word.length} <T>个字母</T></div>
          }
          </>
        }

        {/* Stage 3: 例句填空 */}
        {stage === 2 &&
        <>
            <div className="text-center text-base leading-relaxed">
              {(() => {
              const ex = target.example_en || `Please use the word in a sentence.`;
              const re = new RegExp(`\\b${target.word}\\b`, "gi");
              const blanked = ex.replace(re, "_____");
              return <span>{blanked}</span>;
            })()}
            </div>
            {target.example_cn && <div className="text-xs text-muted-foreground">{target.example_cn}</div>}
            {showHint &&
          <div className="text-sm"><T>💡 释义：</T><b>{target.meaning_cn}</b> <T>· 首字母</T> <b>{target.word[0]}</b></div>
          }
          </>
        }

        {/* Stage 4: 同义辨析 */}
        {stage === 3 &&
        <>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>今日词</T></div>
              <div className="mt-1 text-3xl font-extrabold">{target.word}</div>
              {target.phonetic && <div className="text-xs text-muted-foreground">{target.phonetic}</div>}
            </div>
            <div className="grid w-full grid-cols-1 gap-2">
              {choices4.map((c) =>
            <button
              key={c}
              disabled={!!submitted}
              onClick={() => submit(c)}
              className={cn(
                "rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition active:scale-95",
                !submitted && "border-border bg-card hover:border-indigo-500 hover:bg-indigo-500/5",
                submitted && c === target.meaning_cn && "border-emerald-500 bg-emerald-500/15",
                submitted === "bad" && c !== target.meaning_cn && "opacity-50"
              )}>
              
                  {c}
                </button>
            )}
            </div>
          </>
        }

        {/* Stage 5: 字母重排 */}
        {stage === 4 &&
        <>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>字母乱序</T></div>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {scrambled.split("").map((ch, i) =>
              <span key={i} className="inline-flex size-9 items-center justify-center rounded-lg border-2 border-indigo-500/40 bg-indigo-500/10 text-lg font-extrabold text-indigo-700 dark:text-indigo-300">
                    {ch}
                  </span>
              )}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{target.meaning_cn}</div>
            </div>
            {showHint &&
          <div className="text-sm"><T>💡 首字母：</T><b>{target.word[0]}</b></div>
          }
          </>
        }

        {/* Stage 6: BOSS — 同时给 audio + 释义 + 例句填空 */}
        {stage === 5 &&
        <>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-red-600 font-bold animate-pulse"><T>⚠ BOSS 综合题</T></div>
              <button
              onClick={() => speakWord(target)}
              className="mt-2 inline-flex size-14 items-center justify-center rounded-full bg-red-500 text-white shadow-md active:scale-95">
              
                <Volume2 className="size-6" />
              </button>
              <div className="mt-2 text-base font-bold">{target.meaning_cn}</div>
              {target.example_en &&
            <div className="mt-2 text-xs text-muted-foreground">
                  {target.example_en.replace(new RegExp(`\\b${target.word}\\b`, "gi"), "_____")}
                </div>
            }
            </div>
          </>
        }
      </div>

      {/* Input + actions (stage != 4) */}
      {stage !== 3 &&
      <div className="mt-4 space-y-3">
          <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!!submitted}
          placeholder="输入英文单词…"
          onKeyDown={(e) => {if (e.key === "Enter" && input.trim()) submit(input);}}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "h-12 w-full rounded-2xl border-2 bg-background px-4 text-center text-lg font-bold tracking-wide outline-none",
            !submitted && "border-border focus:border-indigo-500",
            submitted === "ok" && "border-emerald-500 bg-emerald-500/10 text-emerald-700",
            submitted === "bad" && "border-red-500 bg-red-500/10 text-red-700"
          )} />
        
          <div className="flex gap-2">
            <Button
            variant="outline"
            onClick={pickHint}
            disabled={showHint || !!submitted}
            className="h-11 flex-1 rounded-2xl">
            
              <Lightbulb className="mr-2 size-4" /> <T>提示 (-30 分)</T>
            </Button>
            <Button
            onClick={() => submit(input)}
            disabled={!input.trim() || !!submitted}
            className="h-11 flex-[2] rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 font-extrabold text-white hover:opacity-90">
            
              {submitted === "ok" ? <><Check className="mr-2 size-4" /> <T>正确！</T></> :
            submitted === "bad" ? <><X className="mr-2 size-4" /> <T>答案：</T>{target.word}</> :
            <><T>提交</T></>}
            </Button>
          </div>
        </div>
      }
    </div>);

}

/* ============================================================
   Streak strip
   ============================================================ */
function StreakStrip({ streak, className }: {streak: StreakStats | null;className?: string;}) {
  if (!streak) return null;
  return (
    <div className={cn("grid grid-cols-4 gap-2 text-center", className)}>
      <div className="rounded-xl border bg-card p-2">
        <div className="text-xl font-extrabold text-orange-600">🔥 {streak.current_streak}</div>
        <div className="text-[10px] text-muted-foreground"><T>连续天数</T></div>
      </div>
      <div className="rounded-xl border bg-card p-2">
        <div className="text-xl font-extrabold">{streak.longest_streak}</div>
        <div className="text-[10px] text-muted-foreground"><T>历史最长</T></div>
      </div>
      <div className="rounded-xl border bg-card p-2">
        <div className="text-xl font-extrabold">{streak.this_month_days}</div>
        <div className="text-[10px] text-muted-foreground"><T>本月天数</T></div>
      </div>
      <div className="rounded-xl border bg-card p-2">
        <div className="text-xl font-extrabold text-amber-600">💎 {streak.total_perfect}</div>
        <div className="text-[10px] text-muted-foreground"><T>完美次数</T></div>
      </div>
    </div>);

}

/* ============================================================
   Today's daily leaderboard
   ============================================================ */
function DailyLeaderboard({ rows }: {rows: LeaderRow[];}) {
  return (
    <div className="rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-sky-500/5 p-5 shadow-tile">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="size-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-base font-extrabold"><T>今日通关速度榜</T></h3>
      </div>
      {rows.length === 0 ?
      <div className="py-4 text-center text-sm text-muted-foreground"><T>还没有人通关，争夺榜首！</T></div> :

      <ol className="space-y-1.5">
          {rows.slice(0, 10).map((r) =>
        <li
          key={r.rank + r.alias}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
            r.is_me ? "bg-primary/10 ring-2 ring-primary/40" : "bg-card/60"
          )}>
          
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-extrabold tabular-nums">
                {r.rank === 1 ? <Crown className="size-4 text-amber-500" /> :
            r.rank === 2 ? <Medal className="size-4 text-slate-400" /> :
            r.rank === 3 ? <Medal className="size-4 text-amber-700" /> :
            r.rank}
              </span>
              <span className="flex-1 truncate font-bold">
                {r.alias} {r.is_me && <span className="text-xs text-primary"><T>(我)</T></span>}
                {r.perfect && <span className="ml-1">💎</span>}
              </span>
              <span className="font-extrabold tabular-nums">{(r.duration_ms / 1000).toFixed(1)}s</span>
            </li>
        )}
        </ol>
      }
    </div>);

}