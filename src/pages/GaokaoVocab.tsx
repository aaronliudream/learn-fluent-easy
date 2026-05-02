import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, X, Volume2, Sparkles, BookOpen, Target, RotateCw, ChevronRight, Brain, Flame, Keyboard, Zap, Music, Trophy, Headphones, Loader2, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { speak } from "@/lib/speak";
import { bumpMastery, bumpVocabMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { MASTERY_LABELS, type MasteryLevel } from "@/lib/masteryScore";
import { cn } from "@/lib/utils";
import {
  awardCoins,
  evaluateMilestones,
  type BadgeDef,
} from "@/lib/coinsBadges";
import { CoinPill, BadgeUnlockOverlay } from "@/components/CoinsBadgesUi";
import MasteryDashboard from "@/components/MasteryDashboard";
import { GaokaoVocabProgress } from "@/components/GaokaoVocabProgress";
import MemoryMatch from "@/components/MemoryMatch";
import MistakeExplainer from "@/components/MistakeExplainer";
import WordBento from "@/components/WordBento";
import WordQuest from "@/components/WordQuest";
import WordDuel from "@/components/WordDuel";

type Vocab = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  star_level: number | null;
  accent: "UK" | "US" | "BOTH" | null;
  theme: string | null;
  freq_rank: number | null;
  exam_frequency: number | null;
  gaokao_level: number | null;
  is_hot_topic: boolean | null;
};
/* ---------- Accent helpers ---------- */
function speakWord(v: Vocab) {
  // Some words are stored with slashes (e.g. "a/an"); only speak the first form.
  const text = v.word.split("/")[0];
  const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
  return speak(text, acc ? { accent: acc } : undefined);
}

function speakExample(v: Vocab) {
  if (!v.example_en) return Promise.resolve();
  const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
  return speak(v.example_en, acc ? { accent: acc } : undefined);
}

function AccentBadge({ accent }: { accent: Vocab["accent"] }) {
  if (accent !== "UK" && accent !== "US") return null;
  const isUS = accent === "US";
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        isUS
          ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
      )}
      title={isUS ? "美式发音" : "英式发音"}
    >
      {isUS ? "🇺🇸 US" : "🇬🇧 UK"}
    </span>
  );
}

const GROUP_SIZE = 20;
const QUESTION_TIMEOUT_SEC = 10; // for choice-type questions

/* ---------- Scoring helpers ---------- */
function comboMultiplier(streak: number): number {
  if (streak >= 10) return 5;
  if (streak >= 5) return 3;
  if (streak >= 2) return 2;
  return 1;
}
function comboLabel(streak: number): string | null {
  if (streak >= 10) return "ON FIRE ×5";
  if (streak >= 5) return "COMBO ×3";
  if (streak >= 2) return "COMBO ×2";
  return null;
}

type Phase = "flashcard" | "quiz" | "done";
type QuizKind =
  | "en2cn"
  | "cn2en"
  | "listen"
  | "cloze"
  | "en2en"
  | "en2word"
  | "spell"
  | "syn"
  | "pos";
type SynPack = { correct: string; distractors: string[] };
type QuizItem = {
  vocab: Vocab;
  kind: QuizKind;
  choices: Vocab[];
  // For "syn" only: 4 string options (correct + 3 distractors), already shuffled.
  synOptions?: string[];
  synCorrect?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickKind(v: Vocab): QuizKind {
  const kinds: QuizKind[] = ["en2cn", "cn2en", "spell"];
  if (v.example_en) kinds.push("listen", "cloze");
  if (v.meaning_en) kinds.push("en2en", "en2word");
  if (v.pos) kinds.push("pos");
  // "syn" is always allowed — synonyms are AI-generated on demand.
  kinds.push("syn");
  return kinds[Math.floor(Math.random() * kinds.length)];
}

function buildClozeBlank(sentence: string, word: string): { masked: string; answer: string } {
  // Match the word ignoring case, prefer whole word
  const re = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\w*)\\b`, "i");
  const m = sentence.match(re);
  const answer = m ? m[1] : word;
  const masked = sentence.replace(re, "_____");
  return { masked, answer };
}

/* ---------- English meaning fetcher (with cache) ---------- */
const meaningEnCache = new Map<string, string>();
const meaningEnInflight = new Map<string, Promise<void>>();

async function ensureMeaningsEn(vocabs: Vocab[]): Promise<Record<string, string>> {
  // Seed cache from already-loaded vocab rows
  for (const v of vocabs) {
    if (v.meaning_en && !meaningEnCache.has(v.id)) {
      meaningEnCache.set(v.id, v.meaning_en);
    }
  }
  const missing = vocabs.filter((v) => !meaningEnCache.has(v.id));
  if (missing.length > 0) {
    const ids = missing.map((v) => v.id);
    const key = ids.sort().join(",");
    if (!meaningEnInflight.has(key)) {
      const p = (async () => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "vocab-meaning-en",
            { body: { ids } },
          );
          if (error) throw error;
          const results = (data?.results ?? {}) as Record<string, string>;
          for (const [id, def] of Object.entries(results)) {
            meaningEnCache.set(id, def);
          }
        } catch (e) {
          console.error("ensureMeaningsEn failed", e);
        }
      })();
      meaningEnInflight.set(key, p);
    }
    await meaningEnInflight.get(key);
  }
  const out: Record<string, string> = {};
  for (const v of vocabs) {
    const def = meaningEnCache.get(v.id);
    if (def) out[v.id] = def;
  }
  return out;
}

function useMeaningEn(v: Vocab | null | undefined): string | null {
  const [val, setVal] = useState<string | null>(
    v ? meaningEnCache.get(v.id) ?? v.meaning_en ?? null : null,
  );
  useEffect(() => {
    if (!v) {
      setVal(null);
      return;
    }
    const cached = meaningEnCache.get(v.id) ?? v.meaning_en ?? null;
    if (cached) {
      setVal(cached);
      if (v.meaning_en && !meaningEnCache.has(v.id))
        meaningEnCache.set(v.id, v.meaning_en);
      return;
    }
    setVal(null);
    let cancelled = false;
    ensureMeaningsEn([v]).then((res) => {
      if (!cancelled) setVal(res[v.id] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [v?.id]);
  return val;
}

/* ---------- Synonym pack fetcher (with cache) ---------- */
const synonymCache = new Map<string, SynPack>();
const synonymInflight = new Map<string, Promise<void>>();

async function ensureSynonyms(vocabs: Vocab[]): Promise<Record<string, SynPack>> {
  const missing = vocabs.filter((v) => !synonymCache.has(v.id));
  if (missing.length > 0) {
    const ids = missing.map((v) => v.id);
    const key = ids.sort().join(",");
    if (!synonymInflight.has(key)) {
      const p = (async () => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "vocab-synonyms",
            { body: { ids } },
          );
          if (error) throw error;
          const results = (data?.results ?? {}) as Record<string, SynPack>;
          for (const [id, pack] of Object.entries(results)) {
            if (
              pack &&
              typeof pack.correct === "string" &&
              Array.isArray(pack.distractors) &&
              pack.distractors.length >= 3
            ) {
              synonymCache.set(id, {
                correct: pack.correct,
                distractors: pack.distractors.slice(0, 3),
              });
            }
          }
        } catch (e) {
          console.error("ensureSynonyms failed", e);
        }
      })();
      synonymInflight.set(key, p);
    }
    await synonymInflight.get(key);
  }
  const out: Record<string, SynPack> = {};
  for (const v of vocabs) {
    const pack = synonymCache.get(v.id);
    if (pack) out[v.id] = pack;
  }
  return out;
}

/* ---------- POS-based distractor picker ---------- */
/** Normalize POS strings like "n.", "noun", "v." to a canonical bucket. */
function normPos(p: string | null | undefined): string {
  if (!p) return "";
  const s = p.toLowerCase().replace(/[.\s]/g, "");
  if (s.startsWith("n")) return "n";
  if (s.startsWith("v")) return "v";
  if (s.startsWith("adj") || s === "a") return "adj";
  if (s.startsWith("adv")) return "adv";
  if (s.startsWith("prep")) return "prep";
  if (s.startsWith("conj")) return "conj";
  if (s.startsWith("pron")) return "pron";
  if (s.startsWith("int") || s.startsWith("interj")) return "interj";
  return s.slice(0, 4);
}

/**
 * For "pos" questions: pick 3 distractors that have a DIFFERENT part of speech
 * from the target. Falls back to random words if not enough are available.
 */
function buildPosChoices(target: Vocab, pool: Vocab[]): Vocab[] {
  const targetPos = normPos(target.pos);
  const differentPos = pool.filter(
    (p) => p.id !== target.id && normPos(p.pos) && normPos(p.pos) !== targetPos,
  );
  let distractors = shuffle(differentPos).slice(0, 3);
  if (distractors.length < 3) {
    const fillers = shuffle(
      pool.filter(
        (p) => p.id !== target.id && !distractors.find((d) => d.id === p.id),
      ),
    ).slice(0, 3 - distractors.length);
    distractors = [...distractors, ...fillers];
  }
  return shuffle([target, ...distractors]);
}

export default function GaokaoVocab() {
  const [params, setParams] = useSearchParams();
  const groupParam = params.get("group");
  const mode = params.get("mode"); // "srs" for smart review
  const groupIdx = groupParam ? parseInt(groupParam, 10) - 1 : -1;

  const [allVocab, setAllVocab] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gaokao_vocab")
        .select("*")
        // 🧠 科学排序（取代字母表）：词频↑ → 考频↓ → 难度↓
        // 依据：Zipf 定律 + Nation 2013《Learning Vocabulary in Another Language》
        .order("freq_rank", { ascending: true, nullsFirst: false })
        .order("exam_frequency", { ascending: false, nullsFirst: false })
        .order("star_level", { ascending: false, nullsFirst: false })
        .order("word", { ascending: true });
      setAllVocab((data ?? []) as Vocab[]);
      setLoading(false);
    })();
  }, []);

  // 默认 = 高频优先组（学生一进来就在学最该学的词）
  const groups = useMemo(() => {
    const out: Vocab[][] = [];
    for (let i = 0; i < allVocab.length; i += GROUP_SIZE) out.push(allVocab.slice(i, i + GROUP_SIZE));
    return out;
  }, [allVocab]);

  if (loading) return <p className="p-8 text-sm text-muted-foreground">加载中...</p>;

  if (mode === "srs") {
    return <SrsReviewSession pool={allVocab} onExit={() => setParams({})} />;
  }

  if (mode === "rush") {
    return <WordRushSession pool={allVocab} onExit={() => setParams({})} />;
  }

  if (mode === "bento") {
    return <WordBento pool={allVocab} onExit={() => setParams({})} />;
  }

  if (mode === "quest") {
    return <WordQuest pool={allVocab} onExit={() => setParams({})} />;
  }

  if (mode === "duel") {
    return <WordDuel pool={allVocab} onExit={() => setParams({})} />;
  }

  if (mode === "dict") {
    return <DictationSession pool={allVocab} onExit={() => setParams({})} />;
  }

  if (mode === "dash") {
    return <MasteryDashboard onExit={() => setParams({})} />;
  }

  if (groupIdx < 0 || groupIdx >= groups.length) {
    return (
      <GroupList
        groups={groups}
        pool={allVocab}
        onPick={(i) => setParams({ group: String(i + 1) })}
        onStartSrs={() => setParams({ mode: "srs" })}
        onStartRush={() => setParams({ mode: "rush" })}
        onStartBento={() => setParams({ mode: "bento" })}
        onStartQuest={() => setParams({ mode: "quest" })}
        onStartDuel={() => setParams({ mode: "duel" })}
        onStartDict={() => setParams({ mode: "dict" })}
        onOpenDash={() => setParams({ mode: "dash" })}
      />
    );
  }

  return (
    <GroupSession
      group={groups[groupIdx]}
      groupNumber={groupIdx + 1}
      pool={allVocab}
      onExit={() => setParams({})}
    />
  );
}

/* ---------- Group list ---------- */
function GroupList({
  groups,
  pool,
  onPick,
  onStartSrs,
  onStartRush,
  onStartBento,
  onStartQuest,
  onStartDuel,
  onStartDict,
  onOpenDash,
}: {
  groups: Vocab[][];
  pool: Vocab[];
  onPick: (i: number) => void;
  onStartSrs: () => void;
  onStartRush: () => void;
  onStartBento: () => void;
  onStartQuest: () => void;
  onStartDuel: () => void;
  onStartDict: () => void;
  onOpenDash: () => void;
}) {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [studiedCount, setStudiedCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDueCount(0);
        return;
      }
      const nowIso = new Date().toISOString();
      const { data: due } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("item_type", "vocab")
        .lte("next_review_at", nowIso);
      setDueCount(due?.length ?? 0);
      const { data: studied } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("item_type", "vocab");
      setStudiedCount(studied?.length ?? 0);
    })();
  }, [pool.length]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/gaokao"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> 返回高考英语
        </Link>
        <CoinPill />
      </div>
      <PageHeader
        title="高考词汇 3500"
        subtitle={`${pool.length} 词 · 按词频/难度/主题科学分类 · 不再字母排序`}
      />

      {/* 学习进度总览：掌握数、百分比、未完成、7 天到期、平均稳定天数 */}
      <div className="mt-6">
        <GaokaoVocabProgress />
      </div>

      {/* SRS Smart Review Card — top priority entry */}
      <button
        onClick={onStartSrs}
        disabled={dueCount === 0}
        className={cn(
          "mt-6 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          dueCount && dueCount > 0
            ? "border-primary bg-gradient-to-br from-primary/15 via-primary/5 to-transparent hover:border-primary hover:shadow-md"
            : "border-border bg-muted/30 opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-2xl",
            dueCount && dueCount > 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Brain className="size-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">🧠 智能复习</span>
              {dueCount !== null && dueCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                  <Flame className="size-3" /> 今日 {dueCount} 词待复习
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {dueCount === null
                ? "加载中…"
                : dueCount === 0
                ? studiedCount === 0
                  ? "先学一组单词，系统会按艾宾浩斯曲线安排复习"
                  : `已学 ${studiedCount} 词 · 今日没有到期单词，明天再来`
                : `已学 ${studiedCount} 词 · Anki SM-2 算法 · 答错重学，答对延后`}
            </div>
          </div>
          {dueCount && dueCount > 0 ? (
            <ChevronRight className="size-5 text-primary" />
          ) : null}
        </div>
      </button>

      {/* Word Rush — fast-paced rhythm matching */}
      <button
        onClick={onStartRush}
        disabled={pool.length < 4}
        className={cn(
          "mt-3 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          pool.length >= 4
            ? "border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-transparent hover:border-fuchsia-500 hover:shadow-md"
            : "border-border bg-muted/30 opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400">
            <Music className="size-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">⚡ Word Rush 节奏消除</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500 px-2 py-0.5 text-[11px] font-bold text-white">
                NEW
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              中文从天而降 · 60 秒内点对越多越快 · Combo 加倍 + 金币奖励
            </div>
          </div>
          <ChevronRight className="size-5 text-fuchsia-500" />
        </div>
      </button>

      {/* Word Bento — drag/tap match */}
      <button
        onClick={onStartBento}
        disabled={pool.length < 12}
        className={cn(
          "mt-3 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          pool.length >= 12
            ? "border-amber-500/60 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent hover:border-amber-500 hover:shadow-md"
            : "border-border bg-muted/30 opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <span className="text-2xl">🍱</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">🍱 Word Bento 单词便当</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                NEW
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                🏆 排行榜
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              拖拽配对消除 · 30 对单词 · 全对 + 极速双重奖励
            </div>
          </div>
          <ChevronRight className="size-5 text-amber-500" />
        </div>
      </button>

      {/* Word Quest — daily 1 word, 6 stages */}
      <button
        onClick={onStartQuest}
        disabled={pool.length < 50}
        className={cn(
          "mt-3 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          pool.length >= 50
            ? "border-indigo-500/60 bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-transparent hover:border-indigo-500 hover:shadow-md"
            : "border-border bg-muted/30 opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <span className="text-2xl">🗺️</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">🗺️ Word Quest 单词奇旅</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2 py-0.5 text-[11px] font-bold text-white">
                每日
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                🏆 速度榜
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              全球同款今日单词 · 6 关闯关 · 连续打卡解锁稀有徽章
            </div>
          </div>
          <ChevronRight className="size-5 text-indigo-500" />
        </div>
      </button>

      {/* Word Duel — PVP ELO duel */}
      <button
        onClick={onStartDuel}
        disabled={pool.length < 50}
        className={cn(
          "mt-3 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          pool.length >= 50
            ? "border-rose-500/60 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent hover:border-rose-500 hover:shadow-md"
            : "border-border bg-muted/30 opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <span className="text-2xl">⚔️</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">⚔️ Word Duel 单词决斗</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                PVP
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                👑 段位
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              真人 1v1 · 5 回合 8 秒题 · ELO 段位制 · 青铜→王者全球榜
            </div>
          </div>
          <ChevronRight className="size-5 text-rose-500" />
        </div>
      </button>

      {/* Dictation entry */}
      <button
        onClick={onStartDict}
        disabled={pool.filter((v) => v.example_en).length < 5}
        className={cn(
          "mt-3 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          pool.filter((v) => v.example_en).length >= 5
            ? "border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent hover:border-emerald-500 hover:shadow-md"
            : "border-border bg-muted/30 opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Headphones className="size-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">🎧 句子听写</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">
                NEW
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              听例句 → 输入 → AI 评分纠错 + 金币奖励
            </div>
          </div>
          <ChevronRight className="size-5 text-emerald-500" />
        </div>
      </button>

      {/* Mastery Dashboard entry */}
      <button
        onClick={onOpenDash}
        className="mt-3 group block w-full rounded-3xl border-2 border-indigo-500/60 bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-transparent p-5 text-left shadow-tile transition hover:border-indigo-500 hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="size-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">📊 掌握度仪表盘</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2 py-0.5 text-[11px] font-bold text-white">
                NEW
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              5 级分布 · 三维能力 · 易错词热区 · 大师词汇
            </div>
          </div>
          <ChevronRight className="size-5 text-indigo-500" />
        </div>
      </button>

      <CurriculumBrowser pool={pool} groups={groups} onPick={onPick} />
    </main>
  );
}

/* ============================================================
   🧠 科学浏览模式（取代字母表）
   依据：Nation 2013、CEFR、Zipf 定律、Schmitt 2010 语义场理论
   - 🔥 高频优先（默认）：Top 1000 → 4000，先学覆盖率最高的词
   - 📚 CEFR 阶梯：i+1 难度递进（Krashen 输入假说）
   - 🎨 主题词群：同语义场聚类，记忆牢固度 +40%
   - 🎯 高考考点：is_hot_topic + exam_frequency≥3，直击真题
   - 🧠 个性化：FSRS 智能复习入口（已存在于顶部"智能复习"卡片）
   ============================================================ */

const THEME_META: Record<string, { emoji: string; cn: string; color: string }> = {
  daily:        { emoji: "🏠", cn: "日常生活", color: "amber" },
  abstract:     { emoji: "💭", cn: "抽象思维", color: "violet" },
  feelings:     { emoji: "💖", cn: "情感心理", color: "rose" },
  function:     { emoji: "🔗", cn: "功能虚词", color: "slate" },
  work:         { emoji: "💼", cn: "职场工作", color: "blue" },
  nature:       { emoji: "🌿", cn: "自然环境", color: "emerald" },
  society:      { emoji: "🏛️", cn: "社会公民", color: "indigo" },
  school:       { emoji: "🎓", cn: "校园学习", color: "sky" },
  food:         { emoji: "🍎", cn: "饮食美食", color: "orange" },
  health:       { emoji: "🩺", cn: "健康医疗", color: "teal" },
  travel:       { emoji: "✈️", cn: "旅行交通", color: "cyan" },
  media:        { emoji: "📱", cn: "媒体科技", color: "fuchsia" },
  family:       { emoji: "👨‍👩‍👧", cn: "家庭亲情", color: "pink" },
  science:      { emoji: "🔬", cn: "科学研究", color: "purple" },
  tech:         { emoji: "💡", cn: "前沿科技", color: "fuchsia" },
  city:         { emoji: "🏙️", cn: "城市生活", color: "zinc" },
  shopping:     { emoji: "🛍️", cn: "购物消费", color: "amber" },
  cross_culture:{ emoji: "🌐", cn: "跨文化",   color: "indigo" },
  sports:       { emoji: "⚽", cn: "体育运动", color: "lime" },
  history:      { emoji: "📜", cn: "历史人文", color: "stone" },
  environment:  { emoji: "♻️", cn: "环境保护", color: "green" },
  chinese:      { emoji: "🐉", cn: "中国文化", color: "red" },
};

/* 安全静态颜色映射（避免 Tailwind purge 动态 class） */
const COLOR_CLASSES: Record<string, { border: string; bg: string; text: string; chip: string }> = {
  amber:   { border: "border-amber-500/40",   bg: "bg-amber-500/15",   text: "text-amber-600 dark:text-amber-400",   chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  sky:     { border: "border-sky-500/40",     bg: "bg-sky-500/15",     text: "text-sky-600 dark:text-sky-400",       chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  violet:  { border: "border-violet-500/40",  bg: "bg-violet-500/15",  text: "text-violet-600 dark:text-violet-400", chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  rose:    { border: "border-rose-500/40",    bg: "bg-rose-500/15",    text: "text-rose-600 dark:text-rose-400",     chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  blue:    { border: "border-blue-500/40",    bg: "bg-blue-500/15",    text: "text-blue-600 dark:text-blue-400",     chip: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  indigo:  { border: "border-indigo-500/40",  bg: "bg-indigo-500/15",  text: "text-indigo-600 dark:text-indigo-400", chip: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  orange:  { border: "border-orange-500/40",  bg: "bg-orange-500/15",  text: "text-orange-600 dark:text-orange-400", chip: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  teal:    { border: "border-teal-500/40",    bg: "bg-teal-500/15",    text: "text-teal-600 dark:text-teal-400",     chip: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  cyan:    { border: "border-cyan-500/40",    bg: "bg-cyan-500/15",    text: "text-cyan-600 dark:text-cyan-400",     chip: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  fuchsia: { border: "border-fuchsia-500/40", bg: "bg-fuchsia-500/15", text: "text-fuchsia-600 dark:text-fuchsia-400", chip: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300" },
  pink:    { border: "border-pink-500/40",    bg: "bg-pink-500/15",    text: "text-pink-600 dark:text-pink-400",     chip: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  purple:  { border: "border-purple-500/40",  bg: "bg-purple-500/15",  text: "text-purple-600 dark:text-purple-400", chip: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
  zinc:    { border: "border-zinc-500/40",    bg: "bg-zinc-500/15",    text: "text-zinc-600 dark:text-zinc-400",     chip: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300" },
  lime:    { border: "border-lime-500/40",    bg: "bg-lime-500/15",    text: "text-lime-600 dark:text-lime-400",     chip: "bg-lime-500/15 text-lime-700 dark:text-lime-300" },
  stone:   { border: "border-stone-500/40",   bg: "bg-stone-500/15",   text: "text-stone-600 dark:text-stone-400",   chip: "bg-stone-500/15 text-stone-700 dark:text-stone-300" },
  green:   { border: "border-green-500/40",   bg: "bg-green-500/15",   text: "text-green-600 dark:text-green-400",   chip: "bg-green-500/15 text-green-700 dark:text-green-300" },
  red:     { border: "border-red-500/40",     bg: "bg-red-500/15",     text: "text-red-600 dark:text-red-400",       chip: "bg-red-500/15 text-red-700 dark:text-red-300" },
  slate:   { border: "border-slate-500/40",   bg: "bg-slate-500/15",   text: "text-slate-600 dark:text-slate-400",   chip: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
};
const cc = (c: string) => COLOR_CLASSES[c] || COLOR_CLASSES.slate;

type BrowseMode = "freq" | "cefr" | "theme" | "exam";

function CurriculumBrowser({
  pool,
  groups,
  onPick,
}: {
  pool: Vocab[];
  groups: Vocab[][];
  onPick: (i: number) => void;
}) {
  const [mode, setMode] = useState<BrowseMode>("freq");
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  // 🔥 高频分段（Top 1000 / 1001-2000 / 2001-3000 / 3001-4000 / 4000+）
  const freqBands = useMemo(() => {
    const bands = [
      { key: "1000", label: "Top 1000 核心词", desc: "覆盖日常 80% 用语 · 必须 100% 掌握", emoji: "🥇", color: "amber" },
      { key: "2000", label: "1001 – 2000 高频", desc: "覆盖度 ~92% · 高考阅读核心", emoji: "🥈", color: "sky" },
      { key: "3000", label: "2001 – 3000 中频", desc: "覆盖度 ~96% · 完形填空必备", emoji: "🥉", color: "emerald" },
      { key: "4000", label: "3001 – 4000 进阶", desc: "拉开分数线 · 写作亮点词", emoji: "💎", color: "violet" },
      { key: "5000", label: "4000+ 拔尖", desc: "学霸专属 · 阅读 D 级题", emoji: "👑", color: "rose" },
    ];
    return bands.map((b) => ({
      ...b,
      words: pool.filter((v) => (v.freq_rank ?? 5000) === parseInt(b.key, 10)),
    }));
  }, [pool]);

  // 📚 CEFR / 高考难度阶梯
  const cefrLevels = useMemo(() => {
    const levels = [
      { key: 1, label: "A1 入门", desc: "初中基础 · 零起点必学", emoji: "🌱", color: "emerald" },
      { key: 2, label: "A2 基础", desc: "高一上学期 · 高考保底", emoji: "🌿", color: "sky" },
      { key: 3, label: "B1 进阶", desc: "高二核心 · 高考主战场", emoji: "🌳", color: "amber" },
      { key: 4, label: "B2 高阶", desc: "高三冲刺 · 阅读高分词", emoji: "🔥", color: "rose" },
      { key: 5, label: "C1 拔尖", desc: "竞赛/留学 · 写作亮点", emoji: "👑", color: "violet" },
    ];
    return levels.map((l) => ({
      ...l,
      words: pool.filter((v) => (v.gaokao_level ?? v.star_level ?? 3) === l.key),
    }));
  }, [pool]);

  // 🎨 主题语义场
  const themeGroups = useMemo(() => {
    const map = new Map<string, Vocab[]>();
    pool.forEach((v) => {
      const t = v.theme || "other";
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(v);
    });
    return Array.from(map.entries())
      .filter(([k]) => THEME_META[k])
      .sort((a, b) => b[1].length - a[1].length);
  }, [pool]);

  // 🎯 高考考点池
  const examHotPool = useMemo(
    () =>
      pool.filter(
        (v) => v.is_hot_topic === true || (v.exam_frequency ?? 0) >= 3,
      ),
    [pool],
  );

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-base font-extrabold">科学词库浏览</h2>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          CEFR · Nation · Zipf
        </span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        告别字母表 — 按词频、难度、主题分类，永远在学最该学的词。
      </p>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {([
          { k: "freq", label: "🔥 高频优先" },
          { k: "cefr", label: "📚 难度阶梯" },
          { k: "theme", label: "🎨 主题词群" },
          { k: "exam", label: "🎯 高考考点" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => { setMode(t.k); setActiveTheme(null); }}
            className={cn(
              "shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition",
              mode === t.k
                ? "border-primary bg-primary text-primary-foreground shadow"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* === 🔥 Frequency mode === */}
      {mode === "freq" && (
        <div className="mt-4 space-y-3">
          {freqBands.map((b) => (
            <BandPanel
              key={b.key}
              emoji={b.emoji}
              title={b.label}
              subtitle={b.desc}
              color={b.color}
              words={b.words}
              groups={groups}
              onPick={onPick}
            />
          ))}
        </div>
      )}

      {/* === 📚 CEFR mode === */}
      {mode === "cefr" && (
        <div className="mt-4 space-y-3">
          {cefrLevels.map((l) => (
            <BandPanel
              key={l.key}
              emoji={l.emoji}
              title={l.label}
              subtitle={l.desc}
              color={l.color}
              words={l.words}
              groups={groups}
              onPick={onPick}
            />
          ))}
        </div>
      )}

      {/* === 🎨 Theme mode === */}
      {mode === "theme" && !activeTheme && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themeGroups.map(([key, words]) => {
            const meta = THEME_META[key];
            return (
              <button
                key={key}
                onClick={() => setActiveTheme(key)}
                className="group rounded-2xl border-2 bg-card p-4 text-left shadow-sm transition hover:border-primary hover:shadow-md"
              >
                <div className="text-3xl">{meta.emoji}</div>
                <div className="mt-2 text-sm font-extrabold">{meta.cn}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{words.length} 词</span>
                  <ChevronRight className="size-3 group-hover:text-primary" />
                </div>
              </button>
            );
          })}
        </div>
      )}
      {mode === "theme" && activeTheme && (
        <div className="mt-4">
          <button
            onClick={() => setActiveTheme(null)}
            className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> 返回主题
          </button>
          <BandPanel
            emoji={THEME_META[activeTheme].emoji}
            title={THEME_META[activeTheme].cn}
            subtitle="同语义场聚类 · 记忆效率提升 ~40%"
            color={THEME_META[activeTheme].color}
            words={pool.filter((v) => v.theme === activeTheme)}
            groups={groups}
            onPick={onPick}
            defaultOpen
          />
        </div>
      )}

      {/* === 🎯 Exam-hot mode === */}
      {mode === "exam" && (
        <div className="mt-4">
          <BandPanel
            emoji="🎯"
            title="高考真题高频词"
            subtitle={`${examHotPool.length} 词 · 近 5 年真题反复出现 · 必拿分`}
            color="rose"
            words={examHotPool}
            groups={groups}
            onPick={onPick}
            defaultOpen
          />
        </div>
      )}
    </section>
  );
}

/* 词组面板（折叠展开） — 把同一波词按 GROUP_SIZE 切组，跳到主词组索引 */
function BandPanel({
  emoji,
  title,
  subtitle,
  color,
  words,
  groups,
  onPick,
  defaultOpen = false,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  words: Vocab[];
  groups: Vocab[][];
  onPick: (i: number) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // 找出这些词分散在主 groups 中的索引（以词组中第一个词的 id 为锚）
  const groupHits = useMemo(() => {
    const wordIds = new Set(words.map((w) => w.id));
    const hits: { idx: number; preview: string; matched: number; total: number }[] = [];
    groups.forEach((g, i) => {
      const matched = g.filter((v) => wordIds.has(v.id)).length;
      if (matched === 0) return;
      hits.push({
        idx: i,
        preview: `${g[0]?.word} → ${g[g.length - 1]?.word}`,
        matched,
        total: g.length,
      });
    });
    return hits;
  }, [words, groups]);

  if (words.length === 0) return null;

  const c = cc(color);
  return (
    <div className={cn("rounded-2xl border-2 bg-card", c.border)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl", c.bg)}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold">{title}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", c.chip)}>
              {words.length} 词
            </span>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
        <ChevronRight className={cn("size-4 text-muted-foreground transition", open && "rotate-90")} />
      </button>
      {open && (
        <div className="border-t bg-muted/30 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {groupHits.map((h) => (
              <button
                key={h.idx}
                onClick={() => onPick(h.idx)}
                className="group rounded-xl border bg-card p-3 text-left shadow-sm transition hover:border-primary hover:shadow"
              >
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>第 {h.idx + 1} 组</span>
                  <span className={cn("font-bold", c.text)}>
                    {h.matched}/{h.total}
                  </span>
                </div>
                <div className="mt-1 truncate text-xs font-bold">{h.preview}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Single group session ---------- */
function GroupSession({
  group,
  groupNumber,
  pool,
  onExit,
}: {
  group: Vocab[];
  groupNumber: number;
  pool: Vocab[];
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("flashcard");
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [coinsRefreshKey, setCoinsRefreshKey] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeDef[]>([]);
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [groupLevelUps, setGroupLevelUps] = useState<{ word: string; level: MasteryLevel }[]>([]);
  const [wrongWords, setWrongWords] = useState<Vocab[]>([]);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> 返回组列表
        </button>
        <CoinPill refreshKey={coinsRefreshKey} />
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs">
        <PhaseChip active={phase === "flashcard"} icon={<BookOpen className="size-3" />} label="闪卡" />
        <ChevronRight className="size-3 text-muted-foreground" />
        <PhaseChip active={phase === "quiz"} icon={<Target className="size-3" />} label="测试" />
        <ChevronRight className="size-3 text-muted-foreground" />
        <PhaseChip active={phase === "done"} icon={<Sparkles className="size-3" />} label="复习" />
      </div>

      <PageHeader title={`第 ${groupNumber} 组 · ${group.length} 词`} subtitle={phaseSubtitle(phase)} />

      {phase === "flashcard" && (
        <FlashcardPhase group={group} onDone={() => setPhase("quiz")} />
      )}
      {phase === "quiz" && (
        <QuizPhase
          group={group}
          pool={pool}
          onDone={async (s) => {
            setStats({ correct: s.correct, total: s.total });
            setCoinsAwarded(s.score);
            setGroupLevelUps(s.levelUps ?? []);
            // Resolve wrong-vocab IDs back to full vocab objects (from current group)
            const wrongSet = new Set(s.wrongVocabIds ?? []);
            setWrongWords(group.filter((v) => wrongSet.has(v.id)));
            setPhase("done");
            // Award coins and check milestone badges
            const totals = await awardCoins(s.score);
            setCoinsRefreshKey((k) => k + 1);
            const perfect = s.total > 0 && s.correct === s.total;
            const newly = await evaluateMilestones({
              bestStreak: s.bestStreak,
              spellCorrect: s.spellCorrect,
              perfectGroup: perfect,
              totalEarned: totals?.total_earned ?? 0,
              attempted: s.total,
            });
            if (newly.length > 0) setUnlockedBadges(newly);
          }}
        />
      )}
      {phase === "done" && (
        <DonePanel
          stats={stats}
          coinsAwarded={coinsAwarded}
          onExit={onExit}
          onRetry={() => setPhase("flashcard")}
          levelUps={groupLevelUps}
          group={group}
          wrongWords={wrongWords}
        />
      )}
      {unlockedBadges.length > 0 && (
        <BadgeUnlockOverlay
          badges={unlockedBadges}
          onDismiss={() => setUnlockedBadges([])}
        />
      )}
    </main>
  );
}

function phaseSubtitle(p: Phase) {
  if (p === "flashcard") return "阶段 1：先认识单词，点单词可朗读";
  if (p === "quiz") return "阶段 2：多种题型测试，答错的会重复出现";
  return "阶段 3：本组完成，已加入 SRS 复习队列";
}

function PhaseChip({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs",
        active ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground"
      )}
    >
      {icon} {label}
    </span>
  );
}

/* ---------- Phase 1: Flashcards ---------- */
function FlashcardPhase({ group, onDone }: { group: Vocab[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const v = group[idx];

  useEffect(() => {
    if (v) speakWord(v);
    setFlipped(false);
  }, [idx, v?.id]);

  // Prefetch English meanings for the whole group once
  useEffect(() => {
    if (group.length > 0) ensureMeaningsEn(group);
  }, [group]);

  const meaningEn = useMeaningEn(v);

  if (!v) return null;

  const next = () => {
    if (idx + 1 >= group.length) onDone();
    else setIdx(idx + 1);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{idx + 1} / {group.length}</span>
        <button onClick={onDone} className="hover:text-foreground">跳过 →</button>
      </div>
      <div
        className="min-h-[280px] cursor-pointer rounded-3xl border bg-card p-8 text-center shadow-tile transition hover:shadow-md"
        onClick={() => setFlipped((f) => !f)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); speakWord(v); }}
          className="mx-auto inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight"
        >
          {v.word} <Volume2 className="size-5 text-primary" />
        </button>
        {v.phonetic && (
          <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
            {v.phonetic}
            <AccentBadge accent={v.accent} />
          </div>
        )}
        {v.pos && <div className="mt-1 text-xs text-muted-foreground">{v.pos}</div>}

        {flipped ? (
          <div className="mt-6 space-y-3 text-left">
            <div className="rounded-xl bg-muted/50 p-3 text-base font-medium">{v.meaning_cn}</div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                English definition
              </div>
              {meaningEn ? (
                <div className="italic">{meaningEn}</div>
              ) : (
                <div className="text-muted-foreground">Loading…</div>
              )}
            </div>
            {v.example_en && (
              <button
                onClick={(e) => { e.stopPropagation(); speakExample(v); }}
                className="block w-full rounded-xl border p-3 text-left text-sm hover:bg-accent/30"
              >
                <div className="flex items-start gap-2">
                  <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <div>{v.example_en}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{v.example_cn}</div>
                  </div>
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-10 text-xs text-muted-foreground">点卡片翻面查看释义和例句</div>
        )}
      </div>
      <Button className="mt-4 w-full" size="lg" onClick={next}>
        {idx + 1 >= group.length ? "开始测试 →" : "下一个 →"}
      </Button>
    </div>
  );
}

/* ---------- Phase 2: Quiz ---------- */
export type QuizSessionResult = {
  correct: number;
  total: number;
  bestStreak: number;
  score: number;
  spellCorrect: number;
  levelUps?: { word: string; level: MasteryLevel }[];
  wrongVocabIds?: string[];
};

function QuizPhase({
  group,
  pool,
  onDone,
}: {
  group: Vocab[];
  pool: Vocab[];
  onDone: (s: QuizSessionResult) => void;
}) {
  // Build initial queue: each word once, random kind
  const [queue, setQueue] = useState<QuizItem[]>(() => buildInitialQueue(group, pool));
  const [pos, setPos] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [floatBadge, setFloatBadge] = useState<string | null>(null);
  const [spellCorrect, setSpellCorrect] = useState(0);
  const questionShownAtRef = useRef<number>(Date.now());
  const [levelUps, setLevelUps] = useState<{ word: string; level: MasteryLevel }[]>([]);
  const wrongIdsRef = useRef<Set<string>>(new Set());

  // Reset stopwatch every time we land on a new question
  useEffect(() => {
    questionShownAtRef.current = Date.now();
  }, [pos]);

  // Prefetch English meanings so en2en/en2word questions render instantly
  useEffect(() => {
    if (group.length > 0) ensureMeaningsEn(group);
    if (pool.length > 0) ensureMeaningsEn(pool.slice(0, 60));
  }, [group, pool]);

  // Prefetch synonym packs for "syn" questions in this group.
  useEffect(() => {
    if (group.length > 0) ensureSynonyms(group);
  }, [group]);

  const item = queue[pos];

  if (!item) {
    // shouldn't happen mid-flight; finish
    onDone({ ...stats, bestStreak, score, spellCorrect, levelUps });
    return null;
  }

  const handleResult = async (isCorrect: boolean) => {
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    const latencyMs = Date.now() - questionShownAtRef.current;
    await recordAttempt({ questionType: "vocab", questionId: item.vocab.id, isCorrect });
    const update = await bumpVocabMastery({
      vocabId: item.vocab.id,
      kind: item.kind,
      isCorrect,
      latencyMs,
    });
    if (update && update.newLevel > update.prevLevel) {
      setLevelUps((prev) => [...prev, { word: item.vocab.word, level: update.newLevel }]);
    }

    if (isCorrect && item.kind === "spell") {
      setSpellCorrect((n) => n + 1);
    }
    if (!isCorrect) {
      wrongIdsRef.current.add(item.vocab.id);
    }

    // Combo + score
    if (isCorrect) {
      const newStreak = streak + 1;
      const mult = comboMultiplier(newStreak);
      const gained = 10 * mult;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setScore((s) => s + gained);
      const label = comboLabel(newStreak);
      if (label) {
        setFloatBadge(label);
        setTimeout(() => setFloatBadge(null), 900);
      }
    } else {
      setStreak(0);
    }

    let nextQueue = queue;
    if (!isCorrect) {
      // re-insert a different kind of the same word ~3 ahead
      const reinsertIdx = Math.min(queue.length, pos + 3);
      nextQueue = [...queue];
      nextQueue.splice(reinsertIdx, 0, buildItem(item.vocab, pool));
      setQueue(nextQueue);
    }

    if (pos + 1 >= nextQueue.length) {
      const finalCorrect = stats.correct + (isCorrect ? 1 : 0);
      const finalTotal = stats.total + 1;
      const finalBestStreak = Math.max(
        bestStreak,
        isCorrect ? streak + 1 : streak,
      );
      const finalScore = score + (isCorrect ? 10 * comboMultiplier(streak + 1) : 0);
      const finalSpell =
        spellCorrect + (isCorrect && item.kind === "spell" ? 1 : 0);
      onDone({
        correct: finalCorrect,
        total: finalTotal,
        bestStreak: finalBestStreak,
        score: finalScore,
        spellCorrect: finalSpell,
        levelUps,
        wrongVocabIds: Array.from(wrongIdsRef.current),
      });
    } else {
      setPos(pos + 1);
    }
  };

  return (
    <div>
      <ComboHeader
        pos={pos + 1}
        total={queue.length}
        correct={stats.correct}
        attempted={stats.total}
        streak={streak}
        bestStreak={bestStreak}
        score={score}
      />
      <div className="relative">
        <QuizQuestion
          key={`${item.vocab.id}-${pos}`}
          item={item}
          onResult={handleResult}
        />
        {floatBadge && <FloatingComboBadge label={floatBadge} />}
      </div>
    </div>
  );
}

function buildChoices(target: Vocab, pool: Vocab[]): Vocab[] {
  const distractors = shuffle(pool.filter((p) => p.id !== target.id)).slice(0, 3);
  return shuffle([target, ...distractors]);
}

function buildItem(v: Vocab, pool: Vocab[]): QuizItem {
  const kind = pickKind(v);
  const choices =
    kind === "pos" ? buildPosChoices(v, pool) : buildChoices(v, pool);
  return { vocab: v, kind, choices };
}

function buildInitialQueue(group: Vocab[], pool: Vocab[]): QuizItem[] {
  return shuffle(group).map((v) => buildItem(v, pool));
}

/* ---------- Quiz question renderer ---------- */
function QuizQuestion({ item, onResult }: { item: QuizItem; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [clozeInput, setClozeInput] = useState("");
  const [clozeChecked, setClozeChecked] = useState<null | boolean>(null);
  const v = item.vocab;

  // Per-question countdown timer for choice-type questions.
  // Cloze and Spell are input-based and not timed (less stress, more accuracy).
  const isTimedKind =
    item.kind === "en2cn" ||
    item.kind === "cn2en" ||
    item.kind === "listen" ||
    item.kind === "en2en" ||
    item.kind === "en2word" ||
    item.kind === "pos";
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIMEOUT_SEC);
  useEffect(() => {
    if (!isTimedKind) return;
    if (picked !== null) return;
    if (secondsLeft <= 0) {
      // Time out — auto mark wrong
      setPicked("__timeout__");
      setTimeout(() => onResult(false), 700);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, picked, isTimedKind, onResult]);

  // For en2en / en2word: ensure the target's English meaning is loaded;
  // and gather English meanings for distractor choices too.
  const targetMeaningEn = useMeaningEn(
    item.kind === "en2en" || item.kind === "en2word" ? v : null,
  );
  const [choiceMeaningsEn, setChoiceMeaningsEn] = useState<Record<string, string>>({});
  useEffect(() => {
    if (item.kind !== "en2en" && item.kind !== "en2word") return;
    let cancelled = false;
    ensureMeaningsEn(item.choices).then((res) => {
      if (!cancelled) setChoiceMeaningsEn(res);
    });
    return () => {
      cancelled = true;
    };
  }, [item.kind, item.choices]);

  // Auto-play audio for "listen" type
  useEffect(() => {
    if (item.kind === "listen" && v.example_en) {
      const t = setTimeout(() => speakExample(v), 200);
      return () => clearTimeout(t);
    }
    // Auto-play the word for English→Chinese & cloze questions so the
    // student hears the pronunciation as soon as the question appears.
    if (
      item.kind === "en2cn" ||
      item.kind === "cloze" ||
      item.kind === "en2en" ||
      item.kind === "spell"
    ) {
      const t = setTimeout(() => speakWord(v), 200);
      return () => clearTimeout(t);
    }
  }, [item.kind, v.id]);

  if (item.kind === "spell") {
    return <SpellQuestion vocab={v} onResult={onResult} />;
  }

  if (item.kind === "syn") {
    return <SynQuestion vocab={v} onResult={onResult} />;
  }

  if (item.kind === "cloze" && v.example_en) {
    const { masked, answer } = buildClozeBlank(v.example_en, v.word);
    const onCheck = () => {
      const ok = clozeInput.trim().toLowerCase() === answer.toLowerCase();
      setClozeChecked(ok);
      if (ok) {
        // ✅ User-required: speak full sentence on correct
        speakExample(v);
      }
    };
    return (
      <div className="rounded-3xl border bg-card p-6 shadow-tile">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">例句填空</div>
          <button onClick={() => speakWord(v)} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            <Volume2 className="size-3" /> 听单词
            <AccentBadge accent={v.accent} />
          </button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">{v.meaning_cn} · {v.pos}</div>
        <div className="mt-4 rounded-xl bg-muted/40 p-4 text-base leading-relaxed">{masked}</div>
        <input
          type="text"
          autoFocus
          value={clozeInput}
          onChange={(e) => setClozeInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && clozeChecked === null) onCheck(); }}
          disabled={clozeChecked !== null}
          placeholder="输入单词"
          className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-base focus:border-primary focus:outline-none disabled:opacity-70"
        />
        {clozeChecked === null ? (
          <Button className="mt-4 w-full" size="lg" onClick={onCheck} disabled={!clozeInput.trim()}>
            检查
          </Button>
        ) : (
          <div className="mt-4 space-y-3">
            <div
              className={cn(
                "rounded-xl p-3 text-sm",
                clozeChecked ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"
              )}
            >
              {clozeChecked ? "✓ 正确！正在朗读完整例句…" : `✗ 正确答案：${answer}`}
            </div>
            <button
              onClick={() => speakExample(v)}
              className="flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm hover:bg-accent/30"
            >
              <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <div>{v.example_en}</div>
                <div className="mt-1 text-xs text-muted-foreground">{v.example_cn}</div>
              </div>
            </button>
            <Button className="w-full" size="lg" onClick={() => onResult(clozeChecked)}>
              继续 →
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Choice-based questions
  const renderPrompt = () => {
    if (item.kind === "en2cn") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">选择中文释义</div>
          <button
            onClick={() => speakWord(v)}
            className="mt-2 inline-flex items-center gap-2 text-3xl font-extrabold"
          >
            {v.word} <Volume2 className="size-5 text-primary" />
          </button>
          {v.phonetic && (
            <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
              {v.phonetic}
              <AccentBadge accent={v.accent} />
            </div>
          )}
        </>
      );
    }
    if (item.kind === "cn2en") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">选择英文单词</div>
          <div className="mt-3 text-2xl font-bold">{v.meaning_cn}</div>
          {v.pos && <div className="mt-1 text-xs text-muted-foreground">{v.pos}</div>}
        </>
      );
    }
    if (item.kind === "en2en") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Choose the English definition
          </div>
          <button
            onClick={() => speakWord(v)}
            className="mt-2 inline-flex items-center gap-2 text-3xl font-extrabold"
          >
            {v.word} <Volume2 className="size-5 text-primary" />
          </button>
          {v.phonetic && (
            <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
              {v.phonetic}
              <AccentBadge accent={v.accent} />
            </div>
          )}
        </>
      );
    }
    if (item.kind === "en2word") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Choose the word that matches
          </div>
          <div className="mt-3 min-h-[3rem] text-lg font-semibold italic">
            {targetMeaningEn ? `“${targetMeaningEn}”` : "Loading…"}
          </div>
          {v.pos && <div className="mt-1 text-xs text-muted-foreground">{v.pos}</div>}
        </>
      );
    }
    if (item.kind === "pos") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            选择匹配此<span className="text-primary">词性</span>的单词
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
            词性：{v.pos}
          </div>
          <div className="mt-3 text-2xl font-bold">{v.meaning_cn}</div>
        </>
      );
    }
    // listen
    return (
      <>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">听例句选单词</div>
        <button
          onClick={() => speakExample(v)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-3 text-primary"
        >
          <Volume2 className="size-5" /> 再听一次
        </button>
        <div className="mt-3 text-xs text-muted-foreground">{v.meaning_cn}</div>
      </>
    );
  };

  const renderChoiceLabel = (c: Vocab) => {
    if (item.kind === "en2cn") return c.meaning_cn;
    if (item.kind === "en2en") {
      return choiceMeaningsEn[c.id] ?? c.meaning_en ?? "…";
    }
    if (item.kind === "pos") {
      return (
        <span className="inline-flex items-baseline gap-2">
          <span className="font-semibold">{c.word}</span>
          {c.pos && (
            <span className="rounded-md border border-muted-foreground/30 bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {c.pos}
            </span>
          )}
        </span>
      );
    }
    return c.word;
  };

  const onPick = (c: Vocab) => {
    if (picked) return;
    setPicked(c.id);
    const ok = c.id === v.id;
    if (ok && (item.kind === "cn2en" || item.kind === "en2word")) speakWord(v);
    setTimeout(() => onResult(ok), 900);
  };

  return (
    <div className="rounded-3xl border bg-card p-6 text-center shadow-tile">
      {isTimedKind && (
        <div className="mb-4 -mx-6 -mt-6 h-1.5 overflow-hidden rounded-t-3xl bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              secondsLeft > 5
                ? "bg-primary"
                : secondsLeft > 2
                ? "bg-amber-500"
                : "bg-red-500 animate-pulse"
            )}
            style={{ width: `${(secondsLeft / QUESTION_TIMEOUT_SEC) * 100}%` }}
          />
        </div>
      )}
      {renderPrompt()}
      <div className="mt-6 grid grid-cols-1 gap-2">
        {item.choices.map((c) => {
          const isPicked = picked === c.id;
          const isCorrect = c.id === v.id;
          const showState = picked !== null;
          return (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              disabled={picked !== null}
              className={cn(
                "rounded-xl border bg-background px-4 py-3 text-left text-sm transition",
                !showState && "hover:border-primary hover:bg-accent/30",
                showState && isCorrect && "border-green-500 bg-green-500/10",
                showState && isPicked && !isCorrect && "border-red-500 bg-red-500/10",
                showState && !isPicked && !isCorrect && "opacity-60"
              )}
            >
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {String.fromCharCode(65 + item.choices.indexOf(c))}
              </span>
              {renderChoiceLabel(c)}
              {showState && isCorrect && <Check className="ml-2 inline size-4 text-green-600" />}
              {showState && isPicked && !isCorrect && <X className="ml-2 inline size-4 text-red-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Done panel ---------- */
function DonePanel({
  stats,
  coinsAwarded,
  onExit,
  onRetry,
  levelUps,
  group,
  wrongWords,
}: {
  stats: { correct: number; total: number };
  coinsAwarded?: number;
  onExit: () => void;
  onRetry: () => void;
  levelUps?: { word: string; level: MasteryLevel }[];
  group?: Vocab[];
  wrongWords?: Vocab[];
}) {
  const pct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
  const [showGame, setShowGame] = useState(false);
  return (
    <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
      <Sparkles className="mx-auto size-10 text-primary" />
      <div className="mt-3 text-xl font-extrabold">本组完成 🎉</div>
      <div className="mt-2 text-sm text-muted-foreground">
        正确率 <span className="font-bold text-foreground">{pct}%</span> · {stats.correct} / {stats.total}
      </div>
      {coinsAwarded !== undefined && coinsAwarded > 0 && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          🪙 +{coinsAwarded} 金币
        </div>
      )}
      {levelUps && levelUps.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">📈 升级单词</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {levelUps.slice(0, 12).map((u, i) => {
              const l = MASTERY_LABELS[u.level];
              return (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs font-semibold",
                    l.color,
                  )}
                >
                  {l.emoji} {u.word}
                </span>
              );
            })}
            {levelUps.length > 12 && (
              <span className="text-xs text-muted-foreground">+{levelUps.length - 12} more</span>
            )}
          </div>
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">答错的词已加入复习队列，将按艾宾浩斯曲线自动安排复习</div>
      {wrongWords && wrongWords.length > 0 && (
        <div className="mt-5 text-left">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            ✏️ 本次答错 {wrongWords.length} 词 · 点开查看 AI 深度讲解
          </div>
          {wrongWords.slice(0, 8).map((w) => (
            <div key={w.id} className="mt-2 rounded-2xl border bg-background p-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-base font-extrabold font-mono">{w.word}</span>
                  {w.pos && (
                    <span className="ml-2 rounded-md border border-muted-foreground/30 bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {w.pos}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => speakWord(w)}
                  className="rounded-full bg-primary/10 p-1.5 text-primary hover:bg-primary/20"
                  aria-label="朗读"
                >
                  <Volume2 className="size-3.5" />
                </button>
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">{w.meaning_cn}</div>
              <MistakeExplainer
                vocab={{
                  id: w.id,
                  word: w.word,
                  meaning_cn: w.meaning_cn,
                  pos: w.pos,
                  example_en: w.example_en,
                  example_cn: w.example_cn,
                }}
              />
            </div>
          ))}
          {wrongWords.length > 8 && (
            <div className="mt-2 text-center text-xs text-muted-foreground">
              还有 {wrongWords.length - 8} 词在 SRS 队列中
            </div>
          )}
        </div>
      )}
      {group && group.length >= 6 && !showGame && (
        <div className="mt-5">
          <button
            onClick={() => setShowGame(true)}
            className="group inline-flex items-center gap-2 rounded-full border-2 border-fuchsia-500/60 bg-gradient-to-r from-fuchsia-500/15 via-rose-500/10 to-amber-400/15 px-5 py-2.5 text-sm font-extrabold text-fuchsia-700 shadow-md transition hover:scale-105 hover:shadow-lg dark:text-fuchsia-300"
          >
            🎮 玩个配对消消乐放松一下 →
          </button>
          <div className="mt-1 text-[11px] text-muted-foreground">12 张卡 · 配对越快金币越多</div>
        </div>
      )}
      {group && showGame && (
        <div className="mt-5 text-left">
          <MemoryMatch pool={group} onClose={() => setShowGame(false)} />
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onRetry}>
          <RotateCw className="mr-1 size-4" /> 再练一遍
        </Button>
        <Button onClick={onExit}>选下一组 →</Button>
      </div>
    </div>
  );
}

/* ---------- Synonym differentiation question ---------- */
function SynQuestion({
  vocab,
  onResult,
}: {
  vocab: Vocab;
  onResult: (ok: boolean) => void;
}) {
  const v = vocab;
  const [pack, setPack] = useState<SynPack | null>(
    () => synonymCache.get(v.id) ?? null,
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIMEOUT_SEC);

  // Fetch synonyms on mount if not cached
  useEffect(() => {
    if (pack) return;
    let cancelled = false;
    ensureSynonyms([v]).then((res) => {
      if (!cancelled) setPack(res[v.id] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [v.id, pack]);

  // Build shuffled options once we have the pack
  const options = useMemo(() => {
    if (!pack) return [] as string[];
    return shuffle([pack.correct, ...pack.distractors.slice(0, 3)]);
  }, [pack]);

  // Countdown only after options are loaded
  useEffect(() => {
    if (!pack || picked !== null) return;
    if (secondsLeft <= 0) {
      setPicked("__timeout__");
      setTimeout(() => onResult(false), 700);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [pack, picked, secondsLeft, onResult]);

  const onPick = (opt: string) => {
    if (!pack || picked) return;
    setPicked(opt);
    const ok = opt === pack.correct;
    setTimeout(() => onResult(ok), 900);
  };

  if (!pack) {
    return (
      <div className="rounded-3xl border bg-card p-6 text-center shadow-tile">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          近义词辨析 · Synonym
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 animate-pulse text-primary" /> AI 正在生成近义词…
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card p-6 text-center shadow-tile">
      <div className="-mx-6 -mt-6 mb-4 h-1.5 overflow-hidden rounded-t-3xl bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            secondsLeft > 5
              ? "bg-primary"
              : secondsLeft > 2
              ? "bg-amber-500"
              : "bg-red-500 animate-pulse",
          )}
          style={{ width: `${(secondsLeft / QUESTION_TIMEOUT_SEC) * 100}%` }}
        />
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        选出 <span className="text-primary">近义词</span> · Synonym
      </div>
      <button
        onClick={() => speakWord(v)}
        className="mt-2 inline-flex items-center gap-2 text-3xl font-extrabold"
      >
        {v.word} <Volume2 className="size-5 text-primary" />
      </button>
      <div className="mt-1 text-sm text-muted-foreground">
        {v.meaning_cn}
        {v.pos ? ` · ${v.pos}` : ""}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2">
        {options.map((opt, i) => {
          const isPicked = picked === opt;
          const isCorrect = opt === pack.correct;
          const showState = picked !== null;
          return (
            <button
              key={opt}
              onClick={() => onPick(opt)}
              disabled={picked !== null}
              className={cn(
                "rounded-xl border bg-background px-4 py-3 text-left text-sm transition",
                !showState && "hover:border-primary hover:bg-accent/30",
                showState && isCorrect && "border-green-500 bg-green-500/10",
                showState && isPicked && !isCorrect && "border-red-500 bg-red-500/10",
                showState && !isPicked && !isCorrect && "opacity-60",
              )}
            >
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-semibold">{opt}</span>
              {showState && isCorrect && (
                <Check className="ml-2 inline size-4 text-green-600" />
              )}
              {showState && isPicked && !isCorrect && (
                <X className="ml-2 inline size-4 text-red-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Spelling Bee question ---------- */
function SpellQuestion({
  vocab,
  onResult,
}: {
  vocab: Vocab;
  onResult: (ok: boolean) => void;
}) {
  // Use the first form when the word stores variants like "a/an"
  const target = vocab.word.split("/")[0].trim();
  const chars = target.split("");
  const [typed, setTyped] = useState(""); // matches the prefix of `target`
  const [errorFlash, setErrorFlash] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [reveal, setReveal] = useState<null | "correct" | "wrong">(null);
  const [showFirst, setShowFirst] = useState(false); // first-letter hint
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Re-focus input on mount so mobile keyboard pops up
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  // Auto-skip whitespace / hyphen positions
  useEffect(() => {
    if (reveal) return;
    let i = typed.length;
    let next = typed;
    while (i < target.length && /[\s\-']/.test(target[i])) {
      next += target[i];
      i++;
    }
    if (next !== typed) setTyped(next);
  }, [typed, target, reveal]);

  // Detect completion
  useEffect(() => {
    if (reveal) return;
    if (typed.length === target.length && typed.toLowerCase() === target.toLowerCase()) {
      setReveal("correct");
      speakWord(vocab);
    }
  }, [typed, target, reveal, vocab]);

  const handleInput = (raw: string) => {
    if (reveal) return;
    // Take only the next character beyond what's already typed
    if (raw.length <= typed.length) {
      setTyped(raw);
      return;
    }
    const nextChar = raw[raw.length - 1];
    const expected = target[typed.length];
    if (!expected) return;
    if (nextChar.toLowerCase() === expected.toLowerCase()) {
      setTyped(typed + expected);
    } else {
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 250);
    }
  };

  const giveUp = () => {
    setReveal("wrong");
    setTyped(target);
    speakWord(vocab);
  };

  const useHint = () => {
    if (reveal) return;
    setHintShown(true);
    setShowFirst(true);
    // Auto-fill first letter if not yet typed
    if (typed.length === 0 && target.length > 0) {
      setTyped(target[0]);
    }
  };

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-tile">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          <Keyboard className="size-3" /> Spelling Bee · 听音拼写
        </div>
        <button
          onClick={() => speakWord(vocab)}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
        >
          <Volume2 className="size-3" /> 再听一次
          <AccentBadge accent={vocab.accent} />
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => speakWord(vocab)}
          className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-tile transition hover:scale-105"
          aria-label="play pronunciation"
        >
          <Volume2 className="size-7" />
        </button>
        <div className="mt-3 text-sm text-muted-foreground">
          {vocab.meaning_cn}{vocab.pos ? ` · ${vocab.pos}` : ""}
        </div>
        {vocab.phonetic && hintShown && (
          <div className="mt-1 text-xs text-muted-foreground">{vocab.phonetic}</div>
        )}
      </div>

      {/* Letter slots */}
      <div
        className={cn(
          "mt-6 flex flex-wrap justify-center gap-1.5 transition",
          errorFlash && "animate-pulse"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {chars.map((ch, i) => {
          const isSpace = /[\s]/.test(ch);
          const isFilled = i < typed.length;
          const isCursor = i === typed.length && !reveal;
          const isFirstHint = showFirst && i === 0 && !isFilled;
          if (isSpace) {
            return <div key={i} className="w-3" />;
          }
          return (
            <div
              key={i}
              className={cn(
                "flex h-11 w-8 items-center justify-center rounded-md border-2 font-mono text-lg font-bold uppercase transition",
                isFilled && reveal === "correct" && "border-green-500 bg-green-500/15 text-green-700 dark:text-green-400",
                isFilled && reveal === "wrong" && "border-red-500 bg-red-500/15 text-red-700 dark:text-red-400",
                isFilled && !reveal && "border-primary bg-primary/10 text-foreground",
                !isFilled && isCursor && "border-primary bg-background text-primary",
                !isFilled && !isCursor && !isFirstHint && "border-border bg-muted/30 text-transparent",
                !isFilled && isFirstHint && "border-amber-400 bg-amber-100/30 text-amber-700 dark:text-amber-400",
                errorFlash && isCursor && "border-red-500 bg-red-500/20"
              )}
            >
              {isFilled ? ch : isFirstHint ? ch : "·"}
            </div>
          );
        })}
      </div>

      {/* Hidden text input that drives the slots (works with mobile keyboard + IME) */}
      <input
        ref={inputRef}
        type="text"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        value={typed}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && reveal) onResult(reveal === "correct");
        }}
        disabled={reveal !== null}
        className="sr-only"
        aria-label="spell the word"
      />

      {/* Mobile fallback: visible input (since sr-only inputs sometimes don't trigger keyboard) */}
      <input
        type="text"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        value={typed}
        onChange={(e) => handleInput(e.target.value)}
        disabled={reveal !== null}
        placeholder="Type the word…"
        className="mt-5 w-full rounded-xl border bg-background px-4 py-3 text-center font-mono text-base focus:border-primary focus:outline-none disabled:opacity-70"
      />

      {!reveal && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <button
            onClick={useHint}
            disabled={hintShown}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            💡 提示（首字母 + 音标）
          </button>
          <button onClick={giveUp} className="text-muted-foreground hover:text-foreground">
            放弃 · 看答案 →
          </button>
        </div>
      )}

      {reveal && (
        <div className="mt-5 space-y-3">
          <div
            className={cn(
              "rounded-xl p-3 text-sm font-semibold",
              reveal === "correct"
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-red-500/10 text-red-700 dark:text-red-400"
            )}
          >
            {reveal === "correct" ? (
              <span className="inline-flex items-center gap-2">
                <Zap className="size-4" /> 拼写正确！
              </span>
            ) : (
              <>
                ✗ 正确拼写：<span className="font-mono">{target}</span>
              </>
            )}
          </div>
          {vocab.example_en && (
            <button
              onClick={() => speakExample(vocab)}
              className="flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm hover:bg-accent/30"
            >
              <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <div>{vocab.example_en}</div>
                <div className="mt-1 text-xs text-muted-foreground">{vocab.example_cn}</div>
              </div>
            </button>
          )}
          <Button className="w-full" size="lg" onClick={() => onResult(reveal === "correct")}>
            继续 →
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------- SRS Smart Review Session ---------- */
function SrsReviewSession({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const [loading, setLoading] = useState(true);
  const [dueWords, setDueWords] = useState<Vocab[]>([]);
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [pos, setPos] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [floatBadge, setFloatBadge] = useState<string | null>(null);
  const [spellCorrect, setSpellCorrect] = useState(0);
  const [coinsRefreshKey, setCoinsRefreshKey] = useState(0);
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeDef[]>([]);
  const [milestonesEvaluated, setMilestonesEvaluated] = useState(false);
  const [srsLevelUps, setSrsLevelUps] = useState<{ word: string; level: MasteryLevel }[]>([]);
  const srsQuestionShownAtRef = useRef<number>(Date.now());

  // reset stopwatch each question
  useEffect(() => {
    srsQuestionShownAtRef.current = Date.now();
  }, [pos]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || pool.length === 0) {
        setLoading(false);
        return;
      }
      const nowIso = new Date().toISOString();
      const { data: dueRows } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id, wrong_count")
        .eq("user_id", user.id)
        .eq("item_type", "vocab")
        .lte("next_review_at", nowIso)
        .order("wrong_count", { ascending: false })
        .limit(30);
      const idSet = new Set((dueRows ?? []).map((r) => r.item_id as string));
      const words = pool.filter((v) => idSet.has(v.id));
      const shuffled = shuffle(words);
      setDueWords(shuffled);
      // Prefetch English meanings for SRS queue
      ensureMeaningsEn(shuffled);
      ensureSynonyms(shuffled);
      setQueue(shuffled.map((v) => buildItem(v, pool)));
      setLoading(false);
    })();
  }, [pool]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <p className="text-sm text-muted-foreground">加载复习队列…</p>
      </main>
    );
  }

  if (dueWords.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
          <Sparkles className="mx-auto size-10 text-primary" />
          <div className="mt-3 text-xl font-extrabold">今日无待复习 🎉</div>
          <div className="mt-2 text-sm text-muted-foreground">回去学习新的词组吧</div>
          <Button className="mt-6" onClick={onExit}>选词组学习 →</Button>
        </div>
      </main>
    );
  }

  const item = queue[pos];

  if (done || !item) {
    // Award coins + evaluate milestones once when the session ends.
    if (!milestonesEvaluated) {
      setMilestonesEvaluated(true);
      (async () => {
        const totals = await awardCoins(score);
        setCoinsAwarded(score);
        setCoinsRefreshKey((k) => k + 1);
        const pctNum =
          stats.total === 0
            ? 0
            : Math.round((stats.correct / stats.total) * 100);
        const newly = await evaluateMilestones({
          bestStreak,
          spellCorrect,
          perfectGroup: stats.total > 0 && stats.correct === stats.total,
          srsAccuracyPct: pctNum,
          totalEarned: totals?.total_earned ?? 0,
          attempted: stats.total,
        });
        if (newly.length > 0) setUnlockedBadges(newly);
      })();
    }
    const pct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> 返回
          </button>
          <CoinPill refreshKey={coinsRefreshKey} />
        </div>
        <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
          <Brain className="mx-auto size-10 text-primary" />
          <div className="mt-3 text-xl font-extrabold">复习完成 🧠✨</div>
          <div className="mt-2 text-sm text-muted-foreground">
            正确率 <span className="font-bold text-foreground">{pct}%</span> · {stats.correct} / {stats.total}
          </div>
          {coinsAwarded > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              🪙 +{coinsAwarded} 金币
            </div>
          )}
          {srsLevelUps.length > 0 && (
            <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">📈 升级单词</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {srsLevelUps.slice(0, 12).map((u, i) => {
                  const l = MASTERY_LABELS[u.level];
                  return (
                    <span
                      key={i}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs font-semibold",
                        l.color,
                      )}
                    >
                      {l.emoji} {u.word}
                    </span>
                  );
                })}
                {srsLevelUps.length > 12 && (
                  <span className="text-xs text-muted-foreground">+{srsLevelUps.length - 12} more</span>
                )}
              </div>
            </div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">下次复习时间已自动调整</div>
          <Button className="mt-6 w-full" onClick={onExit}>返回</Button>
        </div>
        {unlockedBadges.length > 0 && (
          <BadgeUnlockOverlay
            badges={unlockedBadges}
            onDismiss={() => setUnlockedBadges([])}
          />
        )}
      </main>
    );
  }

  const handleResult = async (isCorrect: boolean) => {
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    const latencyMs = Date.now() - srsQuestionShownAtRef.current;
    await recordAttempt({ questionType: "vocab", questionId: item.vocab.id, isCorrect });
    const update = await bumpVocabMastery({
      vocabId: item.vocab.id,
      kind: item.kind,
      isCorrect,
      latencyMs,
    });
    if (update && update.newLevel > update.prevLevel) {
      setSrsLevelUps((prev) => [...prev, { word: item.vocab.word, level: update.newLevel }]);
    }

    if (isCorrect && item.kind === "spell") {
      setSpellCorrect((n) => n + 1);
    }

    if (isCorrect) {
      const newStreak = streak + 1;
      const mult = comboMultiplier(newStreak);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setScore((s) => s + 10 * mult);
      const label = comboLabel(newStreak);
      if (label) {
        setFloatBadge(label);
        setTimeout(() => setFloatBadge(null), 900);
      }
    } else {
      setStreak(0);
    }

    let nextQueue = queue;
    if (!isCorrect) {
      const reinsertIdx = Math.min(queue.length, pos + 3);
      nextQueue = [...queue];
      nextQueue.splice(reinsertIdx, 0, buildItem(item.vocab, pool));
      setQueue(nextQueue);
    }

    if (pos + 1 >= nextQueue.length) {
      setDone(true);
    } else {
      setPos(pos + 1);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> 退出复习
        </button>
        <CoinPill refreshKey={coinsRefreshKey} />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Brain className="size-3" /> 智能复习
        </div>
        <div className="text-xs text-muted-foreground">SM-2 间隔重复</div>
      </div>
      <PageHeader title="今日复习队列" subtitle="答对延后下次复习，答错明天再来" />
      <div className="mt-4">
        <ComboHeader
          pos={pos + 1}
          total={queue.length}
          correct={stats.correct}
          attempted={stats.total}
          streak={streak}
          bestStreak={bestStreak}
          score={score}
        />
        <div className="relative">
          <QuizQuestion
            key={`${item.vocab.id}-${pos}`}
            item={item}
            onResult={handleResult}
          />
          {floatBadge && <FloatingComboBadge label={floatBadge} />}
        </div>
      </div>
    </main>
  );
}

/* ---------- Combo & scoring UI ---------- */
/** Play a short ascending chime synced to combo tier. No assets needed — uses Web Audio. */
function playComboChime(streak: number) {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const tier = streak >= 10 ? 3 : streak >= 5 ? 2 : streak >= 2 ? 1 : 0;
    if (tier === 0) return;
    // Each tier: more notes, brighter
    const baseFreqs = [
      [659.25, 880],                       // E5 → A5  (×2)
      [659.25, 880, 1108.73],              // E5 → A5 → C#6 (×3)
      [659.25, 880, 1108.73, 1318.51],     // ... → E6 (×5 ON FIRE)
    ];
    const notes = baseFreqs[tier - 1];
    const stepDur = 0.09;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      const start = ctx.currentTime + i * stepDur;
      const end = start + stepDur + 0.05;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(end);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch {
    /* ignore — audio is best-effort */
  }
}

function ComboHeader({
  pos,
  total,
  correct,
  attempted,
  streak,
  bestStreak,
  score,
}: {
  pos: number;
  total: number;
  correct: number;
  attempted: number;
  streak: number;
  bestStreak: number;
  score: number;
}) {
  const mult = comboMultiplier(streak);
  const tier = streak >= 10 ? 3 : streak >= 5 ? 2 : streak >= 2 ? 1 : 0;
  const onFire = tier >= 2;
  // Bump animation + chime each time streak crosses a threshold (2/5/10).
  const [bump, setBump] = useState(0);
  const lastTierRef = useRef(0);
  useEffect(() => {
    if (tier > lastTierRef.current) {
      setBump((n) => n + 1);
      playComboChime(streak);
    }
    lastTierRef.current = tier;
  }, [tier, streak]);
  return (
    <div
      className={cn(
        "mb-3 flex items-center justify-between gap-2 rounded-xl px-2 py-1 transition-all duration-300",
        tier >= 1 && "bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-fuchsia-500/10 ring-1 ring-amber-500/30",
        tier >= 2 && "ring-2 ring-rose-500/60 shadow-[0_0_24px_rgba(244,63,94,0.45)]",
        tier >= 3 && "ring-2 ring-fuchsia-500 shadow-[0_0_36px_rgba(217,70,239,0.7)] animate-pulse"
      )}
    >
      <div className="text-xs text-muted-foreground">
        {pos} / {total} <span className="mx-1">·</span> ✓ {correct}/{attempted}
      </div>
      <div className="flex items-center gap-2">
        {streak >= 2 && (
          <span
            key={`combo-${bump}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold transition origin-center animate-scale-in",
              tier === 1 && "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md",
              tier === 2 && "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg animate-pulse",
              tier === 3 && "bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 text-white shadow-2xl animate-pulse"
            )}
          >
            <Flame className={cn("size-4", tier >= 2 && "drop-shadow-[0_0_6px_rgba(255,200,0,0.9)]")} />
            <span className="tabular-nums">{streak}</span>
            <span className="opacity-90">×{mult}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-bold">
          <Zap className="size-3 text-amber-500" /> {score}
        </span>
        {bestStreak >= 3 && (
          <span className="hidden text-[10px] text-muted-foreground sm:inline">
            最佳 {bestStreak}
          </span>
        )}
      </div>
    </div>
  );
}

function FloatingComboBadge({ label }: { label: string }) {
  // Burst sparkles arranged radially around the badge.
  const sparks = Array.from({ length: 10 });
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center">
      <div className="relative">
        {/* Halo */}
        <div className="absolute inset-0 -m-6 animate-ping rounded-full bg-rose-500/30" />
        {/* Sparks */}
        {sparks.map((_, i) => {
          const angle = (i / sparks.length) * Math.PI * 2;
          const dx = Math.cos(angle) * 80;
          const dy = Math.sin(angle) * 80;
          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 size-2 rounded-full bg-amber-300 opacity-0"
              style={{
                animation: `combo-spark 700ms ease-out forwards`,
                animationDelay: `${i * 20}ms`,
                ["--dx" as any]: `${dx}px`,
                ["--dy" as any]: `${dy}px`,
              }}
            />
          );
        })}
        {/* Main badge */}
        <div className="relative animate-scale-in rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 px-6 py-3 text-2xl font-black uppercase tracking-wider text-white shadow-[0_10px_40px_rgba(244,63,94,0.6)] ring-2 ring-white/40">
          🔥 {label}
        </div>
      </div>
      <style>{`
        @keyframes combo-spark {
          0%   { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.3); }
        }
      `}</style>
    </div>
  );
}

/* ====================================================================== */
/* ============ Word Rush — falling-meaning rhythm matching =============== */
/* ====================================================================== */

const RUSH_DURATION_SEC = 60;
const RUSH_FALL_BASE_MS = 10000;  // initial fall duration (slower start)
const RUSH_FALL_MIN_MS = 4500;    // fastest fall duration (still readable)
const RUSH_SPAWN_BASE_MS = 2800;  // initial spawn interval
const RUSH_SPAWN_MIN_MS = 1300;   // fastest spawn interval
const RUSH_MAX_ACTIVE = 3;        // max simultaneous falling tiles

type RushTile = {
  id: number;
  vocab: Vocab;
  // 0..1 horizontal position
  x: number;
  spawnedAt: number;
  fallMs: number;
};

function WordRushSession({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const playable = useMemo(
    () => pool.filter((v) => v.meaning_cn && v.meaning_cn.trim().length > 0),
    [pool],
  );

  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [tiles, setTiles] = useState<RushTile[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(RUSH_DURATION_SEC);
  const [choices, setChoices] = useState<Vocab[]>([]);
  const [activeTileId, setActiveTileId] = useState<number | null>(null);
  const [floatPop, setFloatPop] = useState<{ id: number; text: string; ok: boolean } | null>(null);

  const [coinRefresh, setCoinRefresh] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeDef[]>([]);

  const tileSeqRef = useRef(1);
  const startedAtRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Pick the active tile (lowest one) and refresh choice buttons. */
  function pickActive(currentTiles: RushTile[]) {
    if (currentTiles.length === 0) {
      setActiveTileId(null);
      setChoices([]);
      return;
    }
    // active = the tile that has been alive the longest (closest to ground)
    const active = [...currentTiles].sort((a, b) => a.spawnedAt - b.spawnedAt)[0];
    // Only rebuild/shuffle choices when the active tile actually changes,
    // so newly spawned tiles don't reshuffle the buttons under the user's finger.
    setActiveTileId((prevId) => {
      if (prevId === active.id) return prevId;
      const distractors = shuffle(playable.filter((p) => p.id !== active.vocab.id)).slice(0, 3);
      setChoices(shuffle([active.vocab, ...distractors]));
      return active.id;
    });
  }

  /* Start the game. */
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
    setUnlockedBadges([]);
    tileSeqRef.current = 1;
    startedAtRef.current = Date.now();
  }

  /* Countdown timer */
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

  /* End game when time expires */
  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  /* Spawner — accelerates with elapsed time */
  useEffect(() => {
    if (phase !== "playing") return;
    let stopped = false;
    function schedule() {
      if (stopped) return;
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const t = elapsed / RUSH_DURATION_SEC; // 0..1
      const interval =
        RUSH_SPAWN_BASE_MS - (RUSH_SPAWN_BASE_MS - RUSH_SPAWN_MIN_MS) * Math.min(1, t);
      setTimeout(() => {
        if (stopped) return;
        spawn();
        schedule();
      }, interval);
    }
    schedule();
    // Initial spawn immediately
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
      // Avoid duplicate active words
      if (prev.some((p) => p.vocab.id === v.id)) return prev;
      const tile: RushTile = {
        id: tileSeqRef.current++,
        vocab: v,
        x: 0.1 + Math.random() * 0.8,
        spawnedAt: Date.now(),
        fallMs,
      };
      const next = [...prev, tile];
      // If no active tile, set this one
      setTimeout(() => pickActive(next), 0);
      return next;
    });
  }

  /* Sweep: remove tiles that fell off-screen (miss) */
  useEffect(() => {
    if (phase !== "playing") return;
    const i = setInterval(() => {
      const now = Date.now();
      setTiles((prev) => {
        const stillAlive: RushTile[] = [];
        let missed = 0;
        for (const t of prev) {
          if (now - t.spawnedAt >= t.fallMs) {
            missed++;
          } else {
            stillAlive.push(t);
          }
        }
        if (missed > 0) {
          setMisses((m) => m + missed);
          setStreak(0);
          // re-pick active
          setTimeout(() => pickActive(stillAlive), 0);
        }
        return stillAlive;
      });
    }, 200);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function answer(choice: Vocab) {
    if (phase !== "playing") return;
    if (activeTileId == null) return;
    setTiles((prev) => {
      const active = prev.find((p) => p.id === activeTileId);
      if (!active) return prev;
      const correct = choice.id === active.vocab.id;
      if (correct) {
        setHits((h) => h + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          // Score: 10 base * combo multiplier
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
        setFloatPop({ id: Date.now(), text: `${active.vocab.word}`, ok: false });
        return prev;
      }
    });
  }

  // Auto-clear float pop
  useEffect(() => {
    if (!floatPop) return;
    const t = setTimeout(() => setFloatPop(null), 700);
    return () => clearTimeout(t);
  }, [floatPop]);

  async function finish() {
    setPhase("done");
    // Award coins: 1 coin per 10 score points, min 5 if any hits
    const coins = Math.max(hits > 0 ? 5 : 0, Math.floor(score / 10));
    if (coins > 0) {
      const totals = await awardCoins(coins);
      setCoinRefresh((k) => k + 1);
      const attempted = hits + misses;
      const accuracy = attempted > 0 ? Math.round((hits / attempted) * 100) : 0;
      const milestones: BadgeDef[] = [];
      // Standard milestones
      const m = await evaluateMilestones({
        bestStreak,
        spellCorrect: 0,
        perfectGroup: false,
        totalEarned: totals?.total_earned ?? 0,
        attempted,
      });
      milestones.push(...m);
      // WordRush-specific
      if (score >= 300) {
        const def = (await import("@/lib/coinsBadges")).BADGE_CATALOG.wordrush_master;
        const { unlockBadge } = await import("@/lib/coinsBadges");
        const got = await unlockBadge("wordrush_master");
        if (got) milestones.push(got);
        void def;
      }
      setUnlockedBadges(milestones);
      // Side-effect to silence unused
      void accuracy;
    }
  }

  /* ============ Render ============ */
  if (phase === "intro") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> 返回
          </button>
          <CoinPill />
        </div>
        <div className="rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-transparent p-8 text-center shadow-tile">
          <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-3xl bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400">
            <Music className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold">⚡ Word Rush</h1>
          <p className="mt-2 text-sm text-muted-foreground">节奏消除 · 60 秒挑战</p>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">🎯 玩法</div>
              <div className="text-xs text-muted-foreground mt-1">中文释义从顶部下落，从底部 4 个英文单词中选出对应词。</div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">🔥 Combo</div>
              <div className="text-xs text-muted-foreground mt-1">连对触发 ×2 / ×3 / ×5 倍率，分数飞涨。</div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">⏱ 越来越快</div>
              <div className="text-xs text-muted-foreground mt-1">下落速度和出现频率会随时间递增。</div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">🪙 奖励</div>
              <div className="text-xs text-muted-foreground mt-1">每 10 分换 1 金币，得分 ≥ 300 解锁徽章。</div>
            </div>
          </div>

          <Button
            onClick={start}
            disabled={playable.length < 4}
            className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-base font-bold text-white hover:opacity-90"
          >
            <Zap className="mr-2 size-5" /> 开始挑战
          </Button>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    const attempted = hits + misses;
    const accuracy = attempted > 0 ? Math.round((hits / attempted) * 100) : 0;
    const coins = Math.max(hits > 0 ? 5 : 0, Math.floor(score / 10));
    return (
      <>
        <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> 返回
            </button>
            <CoinPill refreshKey={coinRefresh} />
          </div>
          <div className="rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/10 to-transparent p-8 text-center shadow-tile">
            <Trophy className="mx-auto size-14 text-amber-500" />
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">Final Score</div>
            <div className="text-6xl font-extrabold tabular-nums">{score}</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground">命中</div>
                <div className="text-xl font-bold text-emerald-600">{hits}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground">最高连击</div>
                <div className="text-xl font-bold text-fuchsia-600">{bestStreak}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground">准确率</div>
                <div className="text-xl font-bold">{accuracy}%</div>
              </div>
            </div>
            {coins > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                +{coins} 🪙 金币入账
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Button onClick={start} className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 font-bold text-white hover:opacity-90">
                <RotateCw className="mr-2 size-4" /> 再来一局
              </Button>
              <Button variant="outline" onClick={onExit} className="h-12 flex-1 rounded-2xl">
                返回词组
              </Button>
            </div>
          </div>
        </main>
        {unlockedBadges.length > 0 && (
          <BadgeUnlockOverlay badges={unlockedBadges} onDismiss={() => setUnlockedBadges([])} />
        )}
      </>
    );
  }

  /* Playing */
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-4">
      {/* Top bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 退出
        </button>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">
            ⏱ {timeLeft}s
          </span>
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">
            🎯 {score}
          </span>
          {streak >= 2 && (
            <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 px-3 py-1 text-white tabular-nums shadow-sm">
              🔥 ×{comboMultiplier(streak)}
            </span>
          )}
        </div>
      </div>

      {/* Time progress bar */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            timeLeft > 20 ? "bg-emerald-500" : timeLeft > 10 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${(timeLeft / RUSH_DURATION_SEC) * 100}%` }}
        />
      </div>

      {/* Falling area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-2xl border-2 border-fuchsia-500/30 bg-gradient-to-b from-purple-500/5 via-background to-fuchsia-500/5"
        style={{ minHeight: "50vh" }}
      >
        {/* Ground line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

        {tiles.map((t) => {
          const isActive = t.id === activeTileId;
          return (
            <div
              key={t.id}
              className={cn(
                "absolute -translate-x-1/2 rounded-2xl border-2 px-3 py-2 text-center text-sm font-bold shadow-md whitespace-nowrap max-w-[80%] truncate",
                isActive
                  ? "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 ring-2 ring-fuchsia-500/40"
                  : "border-muted-foreground/30 bg-card/80 text-muted-foreground"
              )}
              style={{
                left: `${t.x * 100}%`,
                top: 0,
                animation: `rush-fall ${t.fallMs}ms linear forwards`,
              }}
            >
              {t.vocab.meaning_cn}
            </div>
          );
        })}

        {/* Floating feedback */}
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
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            准备…
          </div>
        )}
      </div>

      {/* Choice buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {choices.map((c) => (
          <button
            key={c.id}
            onClick={() => answer(c)}
            className="rounded-2xl border-2 border-border bg-card px-3 py-3 text-base font-bold shadow-sm transition active:scale-95 hover:border-fuchsia-500 hover:bg-fuchsia-500/5"
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

      {/* Inline keyframes */}
      <style>{`
        @keyframes rush-fall {
          from { transform: translate(-50%, 0); }
          to { transform: translate(-50%, calc(50vh - 3rem)); }
        }
      `}</style>
    </main>
  );
}

/* ====================================================================== */
/* ============ Dictation — listen & type the full sentence =============== */
/* ====================================================================== */

const DICT_QUESTION_COUNT = 5;

type DictResult = {
  score: number;
  comment: string;
  mistakes: { expected: string; got: string; hint: string }[];
  corrected: string;
};

function DictationSession({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const playable = useMemo(
    () =>
      pool.filter(
        (v) =>
          v.example_en &&
          v.example_en.trim().split(/\s+/).length >= 4 &&
          v.example_en.trim().split(/\s+/).length <= 18,
      ),
    [pool],
  );

  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [items, setItems] = useState<Vocab[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<DictResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [coinRefresh, setCoinRefresh] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeDef[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function start() {
    if (playable.length < DICT_QUESTION_COUNT) return;
    const shuffled = shuffle(playable).slice(0, DICT_QUESTION_COUNT);
    setItems(shuffled);
    setIdx(0);
    setInput("");
    setResult(null);
    setScores([]);
    setStreak(0);
    setBestStreak(0);
    setRevealed(false);
    setUnlockedBadges([]);
    setPhase("playing");
    // Auto-play first sentence shortly after mount
    setTimeout(() => {
      void speakExample(shuffled[0]);
      inputRef.current?.focus();
    }, 400);
  }

  const current = items[idx];

  async function submit() {
    if (!current?.example_en || !input.trim() || grading) return;
    setGrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("grade-dictation", {
        body: { reference: current.example_en, attempt: input },
      });
      if (error) throw error;
      const r = data as DictResult;
      setResult(r);
      setScores((prev) => [...prev, r.score]);
      if (r.score >= 80) {
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
      } else {
        setStreak(0);
      }
    } catch (e) {
      console.error(e);
      setResult({
        score: 0,
        comment: "评分失败，请重试",
        mistakes: [],
        corrected: current.example_en,
      });
    } finally {
      setGrading(false);
    }
  }

  function nextItem() {
    if (idx + 1 >= items.length) {
      void finish();
      return;
    }
    const ni = idx + 1;
    setIdx(ni);
    setInput("");
    setResult(null);
    setRevealed(false);
    setTimeout(() => {
      void speakExample(items[ni]);
      inputRef.current?.focus();
    }, 300);
  }

  async function finish() {
    setPhase("done");
    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    // Coins: half of avg score, +5 per streak ≥3
    const coins = Math.max(0, Math.floor(avg / 2)) + (bestStreak >= 3 ? 10 : 0);
    if (coins > 0) {
      const totals = await awardCoins(coins);
      setCoinRefresh((k) => k + 1);
      const milestones = await evaluateMilestones({
        bestStreak,
        spellCorrect: 0,
        perfectGroup: avg === 100,
        totalEarned: totals?.total_earned ?? 0,
        attempted: scores.length,
      });
      const extra: BadgeDef[] = [];
      if (avg >= 80 && scores.length >= DICT_QUESTION_COUNT) {
        const { unlockBadge } = await import("@/lib/coinsBadges");
        const got = await unlockBadge("dictation_pro");
        if (got) extra.push(got);
      }
      setUnlockedBadges([...milestones, ...extra]);
    }
  }

  /* ============ Render ============ */
  if (phase === "intro") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> 返回
          </button>
          <CoinPill />
        </div>
        <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-8 text-center shadow-tile">
          <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Headphones className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold">🎧 句子听写</h1>
          <p className="mt-2 text-sm text-muted-foreground">5 句英文例句 · AI 智能评分</p>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">🔊 播放</div>
              <div className="text-xs text-muted-foreground mt-1">点击喇叭可重复听，没有听清没关系。</div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">⌨️ 输入</div>
              <div className="text-xs text-muted-foreground mt-1">写下你听到的句子（不需逐字一致，意思接近也算）。</div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">🤖 AI 评分</div>
              <div className="text-xs text-muted-foreground mt-1">0-100 分 · 自动指出拼写/漏词错误。</div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">🪙 奖励</div>
              <div className="text-xs text-muted-foreground mt-1">平均分 ≥ 80 解锁 🎧 听写达人徽章。</div>
            </div>
          </div>

          <Button
            onClick={start}
            disabled={playable.length < DICT_QUESTION_COUNT}
            className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-bold text-white hover:opacity-90"
          >
            <Headphones className="mr-2 size-5" /> 开始听写
          </Button>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const coins = Math.max(0, Math.floor(avg / 2)) + (bestStreak >= 3 ? 10 : 0);
    return (
      <>
        <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> 返回
            </button>
            <CoinPill refreshKey={coinRefresh} />
          </div>
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent p-8 text-center shadow-tile">
            <Trophy className="mx-auto size-14 text-amber-500" />
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">平均分</div>
            <div className="text-6xl font-extrabold tabular-nums">{avg}</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground">完成</div>
                <div className="text-xl font-bold">{scores.length}/{DICT_QUESTION_COUNT}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground">最佳连击</div>
                <div className="text-xl font-bold text-emerald-600">{bestStreak}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground">最高单题</div>
                <div className="text-xl font-bold">{Math.max(0, ...scores)}</div>
              </div>
            </div>
            {coins > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                +{coins} 🪙 金币入账
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Button onClick={start} className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:opacity-90">
                <RotateCw className="mr-2 size-4" /> 再来一组
              </Button>
              <Button variant="outline" onClick={onExit} className="h-12 flex-1 rounded-2xl">
                返回
              </Button>
            </div>
          </div>
        </main>
        {unlockedBadges.length > 0 && (
          <BadgeUnlockOverlay badges={unlockedBadges} onDismiss={() => setUnlockedBadges([])} />
        )}
      </>
    );
  }

  /* Playing */
  if (!current) return null;
  const showResult = !!result;
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 退出
        </button>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">
            {idx + 1}/{items.length}
          </span>
          {streak >= 2 && (
            <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-white tabular-nums shadow-sm">
              🔥 ×{comboMultiplier(streak)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${((idx + (showResult ? 1 : 0)) / items.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border-2 border-emerald-500/30 bg-card p-6 shadow-tile">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">听音听写</div>
          <button
            onClick={() => speakExample(current)}
            className="mt-3 inline-flex size-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 transition hover:bg-emerald-500/25 dark:text-emerald-400"
            title="重听"
          >
            <Volume2 className="size-10" />
          </button>
          <div className="mt-2 text-xs text-muted-foreground">点击重听</div>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={showResult}
          placeholder="在此输入你听到的英文句子..."
          rows={3}
          className="mt-5 w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base focus:border-emerald-500 focus:outline-none disabled:opacity-70"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (!showResult) submit();
            }
          }}
        />
        <div className="mt-1 text-right text-[11px] text-muted-foreground">
          ⌘/Ctrl + Enter 提交
        </div>

        {!showResult && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-2xl"
              onClick={() => setRevealed(true)}
              disabled={revealed}
            >
              我不会，看答案
            </Button>
            <Button
              onClick={submit}
              disabled={grading || !input.trim()}
              className="h-11 flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:opacity-90"
            >
              {grading ? <><Loader2 className="mr-2 size-4 animate-spin" /> 评分中…</> : "提交"}
            </Button>
          </div>
        )}

        {revealed && !showResult && (
          <div className="mt-3 rounded-2xl border bg-muted/40 p-3 text-sm">
            <div className="text-xs text-muted-foreground">参考答案</div>
            <div className="mt-1 font-bold">{current.example_en}</div>
            {current.example_cn && (
              <div className="mt-1 text-xs text-muted-foreground">{current.example_cn}</div>
            )}
          </div>
        )}

        {showResult && result && (
          <div className="mt-4 space-y-3">
            <div
              className={cn(
                "rounded-2xl border-2 p-4 text-center",
                result.score >= 80
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : result.score >= 50
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-red-500/40 bg-red-500/10"
              )}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">得分</div>
              <div className="text-4xl font-extrabold tabular-nums">{result.score}</div>
              <div className="mt-1 text-xs">{result.comment}</div>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
              <div className="text-xs text-muted-foreground">参考答案</div>
              <div className="mt-1 font-bold">{current.example_en}</div>
              {current.example_cn && (
                <div className="mt-1 text-xs text-muted-foreground">{current.example_cn}</div>
              )}
            </div>

            {result.mistakes.length > 0 && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3 text-sm">
                <div className="mb-2 text-xs font-bold text-red-600 dark:text-red-400">错误点</div>
                <ul className="space-y-1.5">
                  {result.mistakes.map((m, i) => (
                    <li key={i} className="text-xs">
                      <span className="font-bold text-red-600 dark:text-red-400 line-through">
                        {m.got || "(漏)"}
                      </span>
                      <span className="mx-1">→</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {m.expected}
                      </span>
                      <span className="ml-2 text-muted-foreground">{m.hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={nextItem}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:opacity-90"
            >
              {idx + 1 >= items.length ? "查看结果" : "下一题"}
              <ChevronRight className="ml-1 size-5" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}