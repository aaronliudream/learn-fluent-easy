import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, X, Volume2, Sparkles, BookOpen, Target, RotateCw, ChevronRight, ChevronDown, Brain, Flame, Keyboard, Zap, Music, Trophy, Headphones, Loader2, BarChart3, Clock, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchGaokaoVocabPool } from "@/lib/gaokaoVocabPool";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { speak, unlockAudioSync, prefetchTTS } from "@/lib/speak";
import { bumpMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { recordCohortAttempt, pickPracticeSource } from "@/lib/cohortProgress";
import { useCohortAttemptContext } from "@/hooks/useActiveCohort";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { celebrateScore } from "@/lib/feedback";
import {
  MASTERY_LABELS,
  type MasteryLevel,
  computeMasteryScore,
  levelFromScore,
  type MasteryMatrix,
} from "@/lib/masteryScore";
import { cn } from "@/lib/utils";
import {
  awardCoins,
  evaluateMilestones,
  type BadgeDef } from
"@/lib/coinsBadges";
import { CoinPill, BadgeUnlockOverlay } from "@/components/CoinsBadgesUi";
import ModuleStageTests from "@/components/ModuleStageTests";
import MasteryDashboard from "@/components/MasteryDashboard";
import MemoryMatch from "@/components/MemoryMatch";
import VocabMasteryPath from "@/components/vocab/VocabMasteryPath";
import VocabMasteryOverview from "@/components/vocab/VocabMasteryOverview";
import NextStepHint from "@/components/vocab/NextStepHint";
import GuidedSession from "@/components/vocab/GuidedSession";
import CohortDictationSession from "@/components/vocab/CohortDictationSession";
import CohortMeaningSession from "@/components/vocab/CohortMeaningSession";
import CohortClozeSession from "@/components/vocab/CohortClozeSession";
import { useActiveCohort } from "@/hooks/useActiveCohort";
import { fetchDueReviewIds } from "@/lib/vocabMastery";
import { useI18n } from "@/i18n/I18nProvider";
import { Rocket } from "lucide-react";
import MistakeExplainer from "@/components/MistakeExplainer";
import WordBento from "@/components/WordBento";
import WordQuest from "@/components/WordQuest";
import WordDuel from "@/components/WordDuel";
import { toast } from "sonner";

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

// P2 预热:按网络预热一组词的单词(+可选例句)音频,键与 speakWord/speakExample 完全一致
// (默认音色 + 逐词 accent)。纯网络(prefetchTTS 不碰 <audio>、不置播放状态),首播命中缓存秒响。
function prewarmVocab(list: Vocab[], opts?: { examples?: boolean }) {
  for (const v of list) {
    const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
    const o = acc ? { accent: acc } : undefined;
    prefetchTTS(v.word.split("/")[0], o);
    if (opts?.examples && v.example_en) prefetchTTS(v.example_en, o);
  }
}

function AccentBadge({ accent }: {accent: Vocab["accent"];}) {
  if (accent !== "UK" && accent !== "US") return null;
  const isUS = accent === "US";
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        isUS ?
        "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400" :
        "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
      )}
      title={isUS ? "美式发音" : "英式发音"}>
      
      {isUS ? "🇺🇸 US" : "🇬🇧 UK"}
    </span>);

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
"en2cn" |
"cn2en" |
"listen" |
"cloze" |
"en2en" |
"en2word" |
"spell" |
"syn" |
"pos";
type SynPack = {correct: string;distractors: string[];};
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

function buildClozeBlank(sentence: string, word: string): {masked: string;answer: string;} {
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
            { body: { ids } }
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
    v ? meaningEnCache.get(v.id) ?? v.meaning_en ?? null : null
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
            { body: { ids } }
          );
          if (error) throw error;
          const results = (data?.results ?? {}) as Record<string, SynPack>;
          for (const [id, pack] of Object.entries(results)) {
            if (
            pack &&
            typeof pack.correct === "string" &&
            Array.isArray(pack.distractors) &&
            pack.distractors.length >= 3)
            {
              synonymCache.set(id, {
                correct: pack.correct,
                distractors: pack.distractors.slice(0, 3)
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
    (p) => p.id !== target.id && normPos(p.pos) && normPos(p.pos) !== targetPos
  );
  let distractors = shuffle(differentPos).slice(0, 3);
  if (distractors.length < 3) {
    const fillers = shuffle(
      pool.filter(
        (p) => p.id !== target.id && !distractors.find((d) => d.id === p.id)
      )
    ).slice(0, 3 - distractors.length);
    distractors = [...distractors, ...fillers];
  }
  return shuffle([target, ...distractors]);
}

export default function GaokaoVocab() {
  const [params, setParams] = useSearchParams();
  const groupParam = params.get("group");
  const mode = params.get("mode"); // "srs" for smart review
  const gradeParam = params.get("grade");
  const groupIdx = groupParam ? parseInt(groupParam, 10) - 1 : -1;

  const [allVocab, setAllVocab] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        const rows = await fetchGaokaoVocabPool();
        if (!cancelled) setAllVocab(rows as Vocab[]);
      } catch (e) {
        console.error("fetchGaokaoVocabPool failed", e);
        if (!cancelled) {
          setAllVocab([]);
          setLoadError("词汇加载失败，请稍后重试");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 默认 = 高频优先组（学生一进来就在学最该学的词）
  const groups = useMemo(() => {
    const out: Vocab[][] = [];
    for (let i = 0; i < allVocab.length; i += GROUP_SIZE) out.push(allVocab.slice(i, i + GROUP_SIZE));
    return out;
  }, [allVocab]);

  if (loading) return <p className="p-8 text-sm text-muted-foreground"><T>加载中...</T></p>;
  if (loadError) {
    return <p className="p-8 text-sm text-destructive"><T>{loadError}</T></p>;
  }

  if (mode === "srs") {
    const focus = params.get("focus") === "retention" ? "retention" : undefined;
    return <SrsReviewSession pool={allVocab} onExit={() => setParams({})} focus={focus} />;
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

  if (mode === "match") {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <button
          type="button"
          onClick={() => setParams({})}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <MemoryMatch
          pool={allVocab.slice(0, 24)}
          onClose={() => setParams({})}
        />
      </main>
    );
  }

  if (mode === "cohort_dict") {
    return (
      <CohortDictRoute
        allVocab={allVocab}
        onExit={() => setParams({})}
      />
    );
  }

  if (mode === "cohort_meaning") {
    return (
      <CohortMeaningRoute
        allVocab={allVocab}
        onExit={() => setParams({})}
      />
    );
  }

  if (mode === "cohort_cloze") {
    return (
      <CohortClozeRoute
        allVocab={allVocab}
        onExit={() => setParams({})}
      />
    );
  }

  if (mode === "dash") {
    return <MasteryDashboard onExit={() => setParams({})} />;
  }

  if (mode === "guided") {
    // Use the freq-sorted top 100 so the session always has fresh material.
    return <GuidedSession pool={allVocab.slice(0, 100)} onExit={() => setParams({})} title="高考词汇 · 本关通关" />;
  }

  if (mode === "review") {
    return <GaokaoReviewLauncher pool={allVocab} onExit={() => setParams({})} />;
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
        onPickMode={(m) => setParams({ mode: m })}
        onStartGuided={() => setParams({ mode: "guided" })}
        onStartReview={() => setParams({ mode: "review" })}
        gradeNum={gradeParam ? Number(gradeParam) : null} />);


  }

  return (
    <GroupSession
      group={groups[groupIdx]}
      groupNumber={groupIdx + 1}
      pool={allVocab}
      onExit={() => setParams({})} />);


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
  onPickMode,
  onStartGuided,
  onStartReview,
  gradeNum,
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
  onPickMode: (mode: string) => void;
  onStartGuided: () => void;
  onStartReview: () => void;
  gradeNum: number | null;
}) {
  const { lang } = useI18n();
  const zh = lang === "zh" || lang === "zh-TW";
  const [loadedMastery, setLoadedMastery] = useState(false);
  const [wordListOpen, setWordListOpen] = useState(false);
  const [masteryByWord, setMasteryByWord] = useState<
    Map<string, { mastery_level: number; due_at: string | null; stability: number | null }>
  >(new Map());

  const poolIdSet = useMemo(() => new Set(pool.map((v) => v.id)), [pool]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || pool.length === 0) {
        setLoadedMastery(true);
        return;
      }
      const { data } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id, mastery_matrix, reached_master_at, next_review_at, stability")
        .eq("user_id", user.id)
        .eq("item_type", "vocab")
        .limit(5000);
      const map = new Map<
        string,
        { mastery_level: number; due_at: string | null; stability: number | null }
      >();
      (data ?? []).forEach((r: {
        item_id: string;
        mastery_matrix: MasteryMatrix | null;
        reached_master_at: string | null;
        next_review_at: string | null;
        stability: number | null;
      }) => {
        if (!poolIdSet.has(r.item_id)) return;
        const score = computeMasteryScore(r.mastery_matrix ?? {});
        const lvl = levelFromScore(score, !!r.reached_master_at);
        map.set(r.item_id, {
          mastery_level: lvl,
          due_at: r.next_review_at,
          stability: r.stability,
        });
      });
      setMasteryByWord(map);
      setLoadedMastery(true);
    })();
  }, [pool.length, poolIdSet]);

  const now = Date.now();
  let mastered = 0;
  let studied = 0;
  let dueCount = 0;
  let stabilitySum = 0;
  let stabilityN = 0;
  masteryByWord.forEach((r) => {
    studied += 1;
    if (r.mastery_level >= 4) mastered += 1;
    if (r.due_at && new Date(r.due_at).getTime() <= now) dueCount += 1;
    if (r.stability != null && r.stability > 0) {
      stabilitySum += r.stability;
      stabilityN += 1;
    }
  });
  const total = pool.length;
  const avgStability = stabilityN > 0 ? stabilitySum / stabilityN : 0;

  const games: {
    mode: string;
    icon: typeof Brain;
    title: string;
    desc: string;
    gradient: string;
    badge?: string;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      mode: "rush",
      icon: Brain,
      title: zh ? "智能选义" : "Smart meanings",
      desc: zh ? "听音辨义 · 自动接入复习曲线" : "Listen, choose meaning · feeds the review curve",
      gradient: "from-emerald-500 to-teal-500",
      badge: zh ? "推荐" : "Recommended",
      onClick: onStartRush,
      disabled: pool.length < 4,
    },
    {
      mode: "bento",
      icon: Sparkles,
      title: zh ? "单词便当" : "Word Bento",
      desc: zh ? "6×4 翻牌速配 · 训练反应力" : "6×4 fast matching · reaction training",
      gradient: "from-rose-500 to-orange-500",
      onClick: onStartBento,
      disabled: pool.length < 12,
    },
    {
      mode: "quest",
      icon: Trophy,
      title: zh ? "单词任务" : "Word Quest",
      desc: zh ? "每日 3 词 · 多关卡彻底掌握一个词" : "3 words a day · multi-stage mastery",
      gradient: "from-amber-500 to-yellow-500",
      onClick: onStartQuest,
      disabled: pool.length < 50,
    },
    {
      mode: "duel",
      icon: Zap,
      title: zh ? "单词对决" : "Word Duel",
      desc: zh ? "60 秒高速答题 · 拼连击拿高分" : "60-second speed round · build combos",
      gradient: "from-fuchsia-500 to-pink-500",
      onClick: onStartDuel,
    },
    {
      mode: "match",
      icon: Music,
      title: zh ? "记忆翻牌" : "Memory Match",
      desc: zh ? "图音中英匹配 · 经典训练法" : "Match words and meanings · classic drill",
      gradient: "from-sky-500 to-blue-500",
      onClick: () => onPickMode("match"),
    },
    {
      mode: "dict",
      icon: Keyboard,
      title: zh ? "听写挑战" : "Dictation",
      desc: zh ? "听音拼词 · 锁定拼写细节" : "Hear it, spell it · lock in spelling",
      gradient: "from-violet-500 to-indigo-500",
      onClick: onStartDict,
    },
  ];

  const backTo = gradeNum ? `/gaokao/g/${gradeNum}` : "/gaokao";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink
        to={backTo}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {zh ? "返回高考英语" : "Back"}
      </BackLink>

      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          GAO KAO VOCABULARY
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
          {zh ? "高考核心词汇" : "Gaokao core vocabulary"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {zh
            ? `高中专属词表 · 已排除小学/初中 · 共 ${pool.length} 词 · 20 词一组`
            : `Senior-only list · ${pool.length} words · 20 per group`}
        </p>
      </div>

      <GuestBanner />

      {gradeNum != null && <ModuleStageTests segment="gaokao" grade={gradeNum} module="vocab" />}

      <button
        type="button"
        onClick={onStartGuided}
        className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-4 text-left text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-700"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Rocket className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold">{zh ? "开始本关通关 · 5 步走" : "Start guided round · 5 steps"}</p>
            <p className="mt-0.5 text-[11px] text-white/85">
              {zh
                ? "看 → 认 → 想 → 拼 → 用，按级解锁，自动收进遗忘曲线"
                : "See → Recognize → Recall → Spell → Use"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold">{zh ? "推荐 ★" : "Top pick ★"}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          if (dueCount > 0) onStartSrs();
          else if (studied === 0) {
            toast.info(zh ? "还没有学过单词，先从第 1 组开始学吧 👇" : "No words learned yet — start with group 1 below 👇");
            onPick(0);
          } else {
            toast.success(
              zh
                ? `已学 ${studied} 词 · 今日没有到期单词，继续学新词巩固吧 ✨`
                : `${studied} words learned · nothing due today — keep learning new ones ✨`,
            );
          }
        }}
        className={cn(
          "mb-4 group flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left transition",
          dueCount > 0
            ? "border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-900/40"
            : "border-border bg-card hover:border-primary/40",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              dueCount > 0
                ? "bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-200"
                : "bg-muted text-muted-foreground",
            )}
          >
            {dueCount > 0 ? <Clock className="size-5" /> : <Brain className="size-5" />}
          </span>
          <div>
            <p
              className={cn(
                "text-sm font-bold",
                dueCount > 0 ? "text-amber-900 dark:text-amber-100" : "text-foreground",
              )}
            >
              {dueCount > 0
                ? zh
                  ? `今天有 ${dueCount} 个词到了复习时间`
                  : `${dueCount} words due for review today`
                : zh
                  ? "🧠 智能复习"
                  : "🧠 Smart review"}
            </p>
            <p
              className={cn(
                "mt-0.5 text-xs",
                dueCount > 0 ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground",
              )}
            >
              {!loadedMastery
                ? zh
                  ? "加载中…"
                  : "Loading…"
                : dueCount > 0
                  ? zh
                    ? "按遗忘曲线安排 · 现在复习能记得最久"
                    : "Spaced repetition · review now for best retention"
                  : studied === 0
                    ? zh
                      ? "点这里去学第一组单词，系统会按艾宾浩斯曲线安排复习"
                      : "Start group 1; reviews will be scheduled automatically"
                    : zh
                      ? `已学 ${studied} 词 · 今日没有到期单词`
                      : `${studied} words studied · nothing due today`}
            </p>
          </div>
        </div>
        {dueCount > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition group-hover:bg-amber-700">
            {zh ? "立即复习" : "Review now"} <Sparkles className="size-3.5" />
          </span>
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      <VocabMasteryPath
        stage="gaokao"
        totalWords={pool.length}
        vocabIds={pool.map((v) => v.id)}
        onPickMode={(m) => {
          const map: Record<string, () => void> = {
            srs: onStartSrs,
            dict: onStartDict,
            classic: onStartRush,
            quest: onStartQuest,
            bento: onStartBento,
            duel: onStartDuel,
          };
          (map[m] ?? (() => onPickMode(m)))();
        }}
        onBrowse={() => onPick(0)}
      />

      <VocabMasteryOverview
        total={total}
        mastered={mastered}
        studied={studied}
        dueCount={dueCount}
        avgStability={avgStability}
        loading={!loadedMastery}
      />

      <div className="mb-3 mt-2 flex items-end justify-between">
        <h2 className="text-base font-extrabold">{zh ? "辅助训练" : "Practice games"}</h2>
        <span className="text-[11px] text-muted-foreground">
          {zh ? "6 种游戏 · 全部接入复习曲线" : "6 games · all connected to the review curve"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.mode}
              type="button"
              disabled={g.disabled}
              onClick={g.onClick}
              className={cn(
                "relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5 disabled:opacity-50",
                g.gradient,
              )}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-5" />
              </div>
              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold">{g.title}</span>
                  {g.badge && (
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">{g.badge}</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs opacity-90">{g.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-6 mt-3 rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <BarChart3 className="size-4 text-primary" />{" "}
          {zh ? "全部游戏数据自动接入智能复习" : "Game results feed smart review automatically"}
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>{zh ? "答对：金币 +2，宠物经验自动累计" : "Correct answers: +2 coins and pet XP"}</li>
          <li>{zh ? "答错：自动进错题本，下次优先复习" : "Wrong answers: added to review priority"}</li>
          <li>
            {zh ? "每天通过任意 3 个游戏即可深度记住一组单词" : "Finish any 3 games to lock in one group each day"}
          </li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={() => onPickMode("cohort_dict")}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] hover:border-primary/40"
          >
            {zh ? "同期听写" : "Cohort dictation"}
          </button>
          <button
            type="button"
            onClick={() => onPickMode("cohort_meaning")}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] hover:border-primary/40"
          >
            {zh ? "同期选义" : "Cohort meanings"}
          </button>
          <button
            type="button"
            onClick={() => onPickMode("cohort_cloze")}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] hover:border-primary/40"
          >
            {zh ? "同期完形" : "Cohort cloze"}
          </button>
          <button
            type="button"
            onClick={onOpenDash}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] hover:border-primary/40"
          >
            📊 {zh ? "掌握度仪表盘" : "Mastery dashboard"}
          </button>
        </div>
      </div>

      <section className="mb-6 mt-6">
        <button
          type="button"
          onClick={() => setWordListOpen((open) => !open)}
          className="mb-3 flex w-full items-end justify-between gap-3 text-left"
          aria-expanded={wordListOpen}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold">{zh ? "单词清单" : "Word list"}</h2>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  wordListOpen && "rotate-180",
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {wordListOpen
                ? zh
                  ? "按 20 词一组逐组学习，再进入游戏强化。"
                  : "Learn each 20-word group in order, then use games to reinforce it."
                : zh
                  ? `共 ${groups.length} 组 · 点击展开逐组学习`
                  : `${groups.length} groups · tap to expand`}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
            {groups.length} {zh ? "组" : "groups"}
          </span>
        </button>
        {wordListOpen && (
          <div className="grid gap-2">
            {groups.map((group, i) => {
              let gMastered = 0;
              let gDue = 0;
              let gTouched = 0;
              group.forEach((w) => {
                const r = masteryByWord.get(w.id);
                if (!r) return;
                gTouched += 1;
                if (r.mastery_level >= 4) gMastered += 1;
                if (r.due_at && new Date(r.due_at).getTime() <= now) gDue += 1;
              });
              const allMastered = gMastered === group.length;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPick(i)}
                  className={cn(
                    "rounded-2xl border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-primary/5",
                    allMastered ? "border-fuchsia-400/60" : "border-border/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold">
                          {zh ? `第 ${i + 1} 组` : `Group ${i + 1}`}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {group.length} {zh ? "词" : "words"}
                        </span>
                        {allMastered && (
                          <span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-bold text-fuchsia-600">
                            👑 {zh ? "全部掌握" : "Mastered"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {group
                          .slice(0, 5)
                          .map((w) => w.word)
                          .join(" · ")}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-600">
                          <Crown className="size-3" /> {zh ? "已掌握" : "Mastered"} {gMastered}
                        </span>
                        {gDue > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            <Clock className="size-3" /> {zh ? "待复习" : "Due"} {gDue}
                          </span>
                        )}
                        {gTouched < group.length && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {zh ? "未学" : "New"} {group.length - gTouched}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
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

const THEME_META: Record<string, {emoji: string;cn: string;color: string;}> = {
  daily: { emoji: "🏠", cn: "日常生活", color: "amber" },
  abstract: { emoji: "💭", cn: "抽象思维", color: "violet" },
  feelings: { emoji: "💖", cn: "情感心理", color: "rose" },
  function: { emoji: "🔗", cn: "功能虚词", color: "slate" },
  work: { emoji: "💼", cn: "职场工作", color: "blue" },
  nature: { emoji: "🌿", cn: "自然环境", color: "emerald" },
  society: { emoji: "🏛️", cn: "社会公民", color: "indigo" },
  school: { emoji: "🎓", cn: "校园学习", color: "sky" },
  food: { emoji: "🍎", cn: "饮食美食", color: "orange" },
  health: { emoji: "🩺", cn: "健康医疗", color: "teal" },
  travel: { emoji: "✈️", cn: "旅行交通", color: "cyan" },
  media: { emoji: "📱", cn: "媒体科技", color: "fuchsia" },
  family: { emoji: "👨‍👩‍👧", cn: "家庭亲情", color: "pink" },
  science: { emoji: "🔬", cn: "科学研究", color: "purple" },
  tech: { emoji: "💡", cn: "前沿科技", color: "fuchsia" },
  city: { emoji: "🏙️", cn: "城市生活", color: "zinc" },
  shopping: { emoji: "🛍️", cn: "购物消费", color: "amber" },
  cross_culture: { emoji: "🌐", cn: "跨文化", color: "indigo" },
  sports: { emoji: "⚽", cn: "体育运动", color: "lime" },
  history: { emoji: "📜", cn: "历史人文", color: "stone" },
  environment: { emoji: "♻️", cn: "环境保护", color: "green" },
  chinese: { emoji: "🐉", cn: "中国文化", color: "red" }
};

/* 安全静态颜色映射（避免 Tailwind purge 动态 class） */
const COLOR_CLASSES: Record<string, {border: string;bg: string;text: string;chip: string;}> = {
  amber: { border: "border-amber-500/40", bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  sky: { border: "border-sky-500/40", bg: "bg-sky-500/15", text: "text-sky-600 dark:text-sky-400", chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  violet: { border: "border-violet-500/40", bg: "bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  rose: { border: "border-rose-500/40", bg: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400", chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  blue: { border: "border-blue-500/40", bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", chip: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  indigo: { border: "border-indigo-500/40", bg: "bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400", chip: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  orange: { border: "border-orange-500/40", bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", chip: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  teal: { border: "border-teal-500/40", bg: "bg-teal-500/15", text: "text-teal-600 dark:text-teal-400", chip: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  cyan: { border: "border-cyan-500/40", bg: "bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-400", chip: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  fuchsia: { border: "border-fuchsia-500/40", bg: "bg-fuchsia-500/15", text: "text-fuchsia-600 dark:text-fuchsia-400", chip: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300" },
  pink: { border: "border-pink-500/40", bg: "bg-pink-500/15", text: "text-pink-600 dark:text-pink-400", chip: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  purple: { border: "border-purple-500/40", bg: "bg-purple-500/15", text: "text-purple-600 dark:text-purple-400", chip: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
  zinc: { border: "border-zinc-500/40", bg: "bg-zinc-500/15", text: "text-zinc-600 dark:text-zinc-400", chip: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300" },
  lime: { border: "border-lime-500/40", bg: "bg-lime-500/15", text: "text-lime-600 dark:text-lime-400", chip: "bg-lime-500/15 text-lime-700 dark:text-lime-300" },
  stone: { border: "border-stone-500/40", bg: "bg-stone-500/15", text: "text-stone-600 dark:text-stone-400", chip: "bg-stone-500/15 text-stone-700 dark:text-stone-300" },
  green: { border: "border-green-500/40", bg: "bg-green-500/15", text: "text-green-600 dark:text-green-400", chip: "bg-green-500/15 text-green-700 dark:text-green-300" },
  red: { border: "border-red-500/40", bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", chip: "bg-red-500/15 text-red-700 dark:text-red-300" },
  slate: { border: "border-slate-500/40", bg: "bg-slate-500/15", text: "text-slate-600 dark:text-slate-400", chip: "bg-slate-500/15 text-slate-700 dark:text-slate-300" }
};
const cc = (c: string) => COLOR_CLASSES[c] || COLOR_CLASSES.slate;

type BrowseMode = "freq" | "cefr" | "theme" | "exam";

function CurriculumBrowser({
  pool,
  groups,
  onPick




}: {pool: Vocab[];groups: Vocab[][];onPick: (i: number) => void;}) {
  const [mode, setMode] = useState<BrowseMode>("freq");
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  // 🔥 高频分段（Top 1000 / 1001-2000 / 2001-3000 / 3001-4000 / 4000+）
  const freqBands = useMemo(() => {
    const bands = [
    { key: "1000", label: "Top 1000 核心词", desc: "覆盖日常 80% 用语 · 必须 100% 掌握", emoji: "🥇", color: "amber" },
    { key: "2000", label: "1001 – 2000 高频", desc: "覆盖度 ~92% · 高考阅读核心", emoji: "🥈", color: "sky" },
    { key: "3000", label: "2001 – 3000 中频", desc: "覆盖度 ~96% · 完形填空必备", emoji: "🥉", color: "emerald" },
    { key: "4000", label: "3001 – 4000 进阶", desc: "拉开分数线 · 写作亮点词", emoji: "💎", color: "violet" },
    { key: "5000", label: "4000+ 拔尖", desc: "学霸专属 · 阅读 D 级题", emoji: "👑", color: "rose" }];

    return bands.map((b) => ({
      ...b,
      words: pool.filter((v) => (v.freq_rank ?? 5000) === parseInt(b.key, 10))
    }));
  }, [pool]);

  // 📚 CEFR / 高考难度阶梯
  const cefrLevels = useMemo(() => {
    const levels = [
    { key: 1, label: "A1 入门", desc: "初中基础 · 零起点必学", emoji: "🌱", color: "emerald" },
    { key: 2, label: "A2 基础", desc: "高一上学期 · 高考保底", emoji: "🌿", color: "sky" },
    { key: 3, label: "B1 进阶", desc: "高二核心 · 高考主战场", emoji: "🌳", color: "amber" },
    { key: 4, label: "B2 高阶", desc: "高三冲刺 · 阅读高分词", emoji: "🔥", color: "rose" },
    { key: 5, label: "C1 拔尖", desc: "竞赛/留学 · 写作亮点", emoji: "👑", color: "violet" }];

    return levels.map((l) => ({
      ...l,
      words: pool.filter((v) => (v.gaokao_level ?? v.star_level ?? 3) === l.key)
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
    return Array.from(map.entries()).
    filter(([k]) => THEME_META[k]).
    sort((a, b) => b[1].length - a[1].length);
  }, [pool]);

  // 🎯 高考考点池
  const examHotPool = useMemo(
    () =>
    pool.filter(
      (v) => v.is_hot_topic === true || (v.exam_frequency ?? 0) >= 3
    ),
    [pool]
  );

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-base font-extrabold"><T>科学词库浏览</T></h2>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          CEFR · Nation · Zipf
        </span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        <T>告别字母表 — 按词频、难度、主题分类，永远在学最该学的词。</T>
      </p>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {([
        { k: "freq", label: "🔥 高频优先" },
        { k: "cefr", label: "📚 难度阶梯" },
        { k: "theme", label: "🎨 主题词群" },
        { k: "exam", label: "🎯 高考考点" }] as
        const).map((t) =>
        <button
          key={t.k}
          onClick={() => {setMode(t.k);setActiveTheme(null);}}
          className={cn(
            "shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition",
            mode === t.k ?
            "border-primary bg-primary text-primary-foreground shadow" :
            "border-border bg-card text-muted-foreground hover:border-primary/40"
          )}>
          
            <T>{t.label}</T>
          </button>
        )}
      </div>

      {/* === 🔥 Frequency mode === */}
      {mode === "freq" &&
      <div className="mt-4 space-y-3">
          {freqBands.map((b) =>
        <BandPanel
          key={b.key}
          emoji={b.emoji}
          title={b.label}
          subtitle={b.desc}
          color={b.color}
          words={b.words}
          groups={groups}
          onPick={onPick} />

        )}
        </div>
      }

      {/* === 📚 CEFR mode === */}
      {mode === "cefr" &&
      <div className="mt-4 space-y-3">
          {cefrLevels.map((l) =>
        <BandPanel
          key={l.key}
          emoji={l.emoji}
          title={l.label}
          subtitle={l.desc}
          color={l.color}
          words={l.words}
          groups={groups}
          onPick={onPick} />

        )}
        </div>
      }

      {/* === 🎨 Theme mode === */}
      {mode === "theme" && !activeTheme &&
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themeGroups.map(([key, words]) => {
          const meta = THEME_META[key];
          return (
            <button
              key={key}
              onClick={() => setActiveTheme(key)}
              className="group rounded-2xl border-2 bg-card p-4 text-left shadow-sm transition hover:border-primary hover:shadow-md">
              
                <div className="text-3xl">{meta.emoji}</div>
                <div className="mt-2 text-sm font-extrabold">{meta.cn}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{words.length} <T>词</T></span>
                  <ChevronRight className="size-3 group-hover:text-primary" />
                </div>
              </button>);

        })}
        </div>
      }
      {mode === "theme" && activeTheme &&
      <div className="mt-4">
          <button
          onClick={() => setActiveTheme(null)}
          className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          
            <ArrowLeft className="size-3" /> <T>返回主题</T>
          </button>
          <BandPanel
          emoji={THEME_META[activeTheme].emoji}
          title={THEME_META[activeTheme].cn}
          subtitle="同语义场聚类 · 记忆效率提升 ~40%"
          color={THEME_META[activeTheme].color}
          words={pool.filter((v) => v.theme === activeTheme)}
          groups={groups}
          onPick={onPick}
          defaultOpen />
        
        </div>
      }

      {/* === 🎯 Exam-hot mode === */}
      {mode === "exam" &&
      <div className="mt-4">
          <BandPanel
          emoji="🎯"
          title="高考真题高频词"
          subtitle={`${examHotPool.length} 词 · 近 5 年真题反复出现 · 必拿分`}
          color="rose"
          words={examHotPool}
          groups={groups}
          onPick={onPick}
          defaultOpen />
        
        </div>
      }
    </section>);

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
  defaultOpen = false









}: {emoji: string;title: string;subtitle: string;color: string;words: Vocab[];groups: Vocab[][];onPick: (i: number) => void;defaultOpen?: boolean;}) {
  const [open, setOpen] = useState(defaultOpen);
  // 找出这些词分散在主 groups 中的索引（以词组中第一个词的 id 为锚）
  const groupHits = useMemo(() => {
    const wordIds = new Set(words.map((w) => w.id));
    const hits: {idx: number;preview: string;matched: number;total: number;}[] = [];
    groups.forEach((g, i) => {
      const matched = g.filter((v) => wordIds.has(v.id)).length;
      if (matched === 0) return;
      hits.push({
        idx: i,
        preview: `${g[0]?.word} → ${g[g.length - 1]?.word}`,
        matched,
        total: g.length
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
        className="flex w-full items-center gap-3 p-4 text-left">
        
        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl", c.bg)}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold">{title}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", c.chip)}>
              {words.length} <T>词</T>
            </span>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
        <ChevronRight className={cn("size-4 text-muted-foreground transition", open && "rotate-90")} />
      </button>
      {open &&
      <div className="border-t bg-muted/30 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {groupHits.map((h) =>
          <button
            key={h.idx}
            onClick={() => onPick(h.idx)}
            className="group rounded-xl border bg-card p-3 text-left shadow-sm transition hover:border-primary hover:shadow">
            
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span><T>第</T> {h.idx + 1} <T>组</T></span>
                  <span className={cn("font-bold", c.text)}>
                    {h.matched}/{h.total}
                  </span>
                </div>
                <div className="mt-1 truncate text-xs font-bold">{h.preview}</div>
              </button>
          )}
          </div>
        </div>
      }
    </div>);

}

/* ---------- Single group session ---------- */
function GroupSession({
  group,
  groupNumber,
  pool,
  onExit





}: {group: Vocab[];groupNumber: number;pool: Vocab[];onExit: () => void;}) {
  const [phase, setPhase] = useState<Phase>("flashcard");
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [coinsRefreshKey, setCoinsRefreshKey] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeDef[]>([]);
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [groupLevelUps, setGroupLevelUps] = useState<{word: string;level: MasteryLevel;}[]>([]);
  const [wrongWords, setWrongWords] = useState<Vocab[]>([]);

  // P2 预热:进组即按网络预热本组(≤20)词 + 例句音频 → Flashcard 抽卡自动播/点喇叭、
  // Quiz(speakExample/speakWord)、Spell(speakWord)首播秒响,消除冷合成 1-3s。
  useEffect(() => { prewarmVocab(group, { examples: true }); }, [group]);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          
          <ArrowLeft className="size-4" /> <T>返回组列表</T>
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

      <PageHeader back="/gaokao/vocab" hideReviewBanner title={`第 ${groupNumber} 组 · ${group.length} 词`} subtitle={phaseSubtitle(phase)} />

      {phase === "flashcard" &&
      <FlashcardPhase group={group} onDone={() => setPhase("quiz")} />
      }
      {phase === "quiz" &&
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
          const pct = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;
          celebrateScore(pct);
          // Award coins and check milestone badges
          const totals = await awardCoins(s.score);
          setCoinsRefreshKey((k) => k + 1);
          const perfect = s.total > 0 && s.correct === s.total;
          const newly = await evaluateMilestones({
            bestStreak: s.bestStreak,
            spellCorrect: s.spellCorrect,
            perfectGroup: perfect,
            totalEarned: totals?.total_earned ?? 0,
            attempted: s.total
          });
          if (newly.length > 0) setUnlockedBadges(newly);
        }} />

      }
      {phase === "done" &&
      <DonePanel
        stats={stats}
        coinsAwarded={coinsAwarded}
        onExit={onExit}
        onRetry={() => setPhase("flashcard")}
        levelUps={groupLevelUps}
        group={group}
        wrongWords={wrongWords}
        poolIds={pool.map((v) => v.id)} />

      }
      {unlockedBadges.length > 0 &&
      <BadgeUnlockOverlay
        badges={unlockedBadges}
        onDismiss={() => setUnlockedBadges([])} />

      }
    </main>);

}

function phaseSubtitle(p: Phase) {
  if (p === "flashcard") return "阶段 1：先认识单词，点单词可朗读";
  if (p === "quiz") return "阶段 2：多种题型测试，答错的会重复出现";
  return "阶段 3：本组完成，已加入 SRS 复习队列";
}

function PhaseChip({ active, icon, label }: {active: boolean;icon: React.ReactNode;label: string;}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs",
        active ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground"
      )}>
      
      {icon} {label}
    </span>);

}

/* ---------- Phase 1: Flashcards ---------- */
function FlashcardPhase({ group, onDone }: {group: Vocab[];onDone: () => void;}) {
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
    if (idx + 1 >= group.length) onDone();else
    setIdx(idx + 1);
  };

  // ⌨️ 回车键：继续下一个 / 进入测试
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, group.length]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{idx + 1} / {group.length}</span>
        <button onClick={onDone} className="hover:text-foreground"><T>跳过 →</T></button>
      </div>
      <div
        className="min-h-[280px] cursor-pointer rounded-3xl border bg-card p-8 text-center shadow-tile transition hover:shadow-md"
        onClick={() => setFlipped((f) => !f)}>
        
        <button
          onClick={(e) => {e.stopPropagation();speakWord(v);}}
          className="mx-auto inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          
          {v.word} <Volume2 className="size-5 text-primary" />
        </button>
        {v.phonetic &&
        <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
            {v.phonetic}
            <AccentBadge accent={v.accent} />
          </div>
        }
        {v.pos && <div className="mt-1 text-xs text-muted-foreground">{v.pos}</div>}

        {flipped ?
        <div className="mt-6 space-y-3 text-left">
            <div className="rounded-xl bg-muted/50 p-3 text-base font-medium">{v.meaning_cn}</div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                English definition
              </div>
              {meaningEn ?
            <div className="italic">{meaningEn}</div> :

            <div className="text-muted-foreground">Loading…</div>
            }
            </div>
            {v.example_en &&
          <button
            onClick={(e) => {e.stopPropagation();speakExample(v);}}
            className="block w-full rounded-xl border p-3 text-left text-sm hover:bg-accent/30">
            
                <div className="flex items-start gap-2">
                  <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <div>{v.example_en}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{v.example_cn}</div>
                  </div>
                </div>
              </button>
          }
          </div> :

        <div className="mt-10 text-xs text-muted-foreground"><T>点卡片翻面查看释义和例句</T></div>
        }
      </div>
      <Button className="mt-4 w-full" size="lg" onClick={next}>
        {idx + 1 >= group.length ? "开始测试 →" : "下一个 →"}
      </Button>
    </div>);

}

/* ---------- Phase 2: Quiz ---------- */
export type QuizSessionResult = {
  correct: number;
  total: number;
  bestStreak: number;
  score: number;
  spellCorrect: number;
  levelUps?: {word: string;level: MasteryLevel;}[];
  wrongVocabIds?: string[];
};

function QuizPhase({
  group,
  pool,
  onDone




}: {group: Vocab[];pool: Vocab[];onDone: (s: QuizSessionResult) => void;}) {
  const [sp] = useSearchParams();
  const gradeNum = (() => {
    const raw = Number(sp.get("grade"));
    if (!raw) return 10;
    return raw >= 1 && raw <= 3 ? raw + 9 : raw;
  })();
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
  const [levelUps, setLevelUps] = useState<{word: string;level: MasteryLevel;}[]>([]);
  const wrongIdsRef = useRef<Set<string>>(new Set());
  const cohortCtx = useCohortAttemptContext();

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
    recordUnifiedAttempt({
      stage: "senior",
      grade: gradeNum,
      module: "vocab",
      item_type: "word",
      item_id: item.vocab.id,
      item_label: item.vocab.word,
      is_correct: isCorrect,
      context: { kind: item.kind, latency_ms: latencyMs }
    }).catch(() => {});
    const update = await recordCohortAttempt({
      vocabId: item.vocab.id,
      kind: item.kind,
      isCorrect,
      latencyMs,
      source: pickPracticeSource(item.vocab.id, cohortCtx),
      cohortId: cohortCtx.cohortId,
      cohortWordIds: cohortCtx.cohortWordIds,
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
        isCorrect ? streak + 1 : streak
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
        wrongVocabIds: Array.from(wrongIdsRef.current)
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
        score={score} />
      
      <div className="relative">
        <QuizQuestion
          key={`${item.vocab.id}-${pos}`}
          item={item}
          onResult={handleResult} />
        
        {floatBadge && <FloatingComboBadge label={floatBadge} />}
      </div>
    </div>);

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
function QuizQuestion({ item, onResult }: {item: QuizItem;onResult: (ok: boolean) => void;}) {
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
    item.kind === "en2en" || item.kind === "en2word" ? v : null
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
    item.kind === "spell")
    {
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
          <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>例句填空</T></div>
          <button onClick={() => speakWord(v)} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            <Volume2 className="size-3" /> <T>听单词</T>
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
          onKeyDown={(e) => {if (e.key === "Enter" && clozeChecked === null) onCheck();}}
          disabled={clozeChecked !== null}
          placeholder="输入单词"
          className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-base focus:border-primary focus:outline-none disabled:opacity-70" />
        
        {clozeChecked === null ?
        <Button className="mt-4 w-full" size="lg" onClick={onCheck} disabled={!clozeInput.trim()}>
            <T>检查</T>
          </Button> :

        <div className="mt-4 space-y-3">
            <div
            className={cn(
              "rounded-xl p-3 text-sm",
              clozeChecked ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"
            )}>
            
              {clozeChecked ? "✓ 正确！正在朗读完整例句…" : `✗ 正确答案：${answer}`}
            </div>
            <button
            onClick={() => speakExample(v)}
            className="flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm hover:bg-accent/30">
            
              <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <div>{v.example_en}</div>
                <div className="mt-1 text-xs text-muted-foreground">{v.example_cn}</div>
              </div>
            </button>
            <Button className="w-full" size="lg" onClick={() => onResult(clozeChecked)}>
              <T>继续 →</T>
            </Button>
          </div>
        }
      </div>);

  }

  // Choice-based questions
  const renderPrompt = () => {
    if (item.kind === "en2cn") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>选择中文释义</T></div>
          <button
            onClick={() => speakWord(v)}
            className="mt-2 inline-flex items-center gap-2 text-3xl font-extrabold">
            
            {v.word} <Volume2 className="size-5 text-primary" />
          </button>
          {v.phonetic &&
          <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
              {v.phonetic}
              <AccentBadge accent={v.accent} />
            </div>
          }
        </>);

    }
    if (item.kind === "cn2en") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>选择英文单词</T></div>
          <div className="mt-3 text-2xl font-bold">{v.meaning_cn}</div>
          {v.pos && <div className="mt-1 text-xs text-muted-foreground">{v.pos}</div>}
        </>);

    }
    if (item.kind === "en2en") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Choose the English definition
          </div>
          <button
            onClick={() => speakWord(v)}
            className="mt-2 inline-flex items-center gap-2 text-3xl font-extrabold">
            
            {v.word} <Volume2 className="size-5 text-primary" />
          </button>
          {v.phonetic &&
          <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
              {v.phonetic}
              <AccentBadge accent={v.accent} />
            </div>
          }
        </>);

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
        </>);

    }
    if (item.kind === "pos") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            <T>选择匹配此</T><span className="text-primary"><T>词性</T></span><T>的单词</T>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
            <T>词性：</T>{v.pos}
          </div>
          <div className="mt-3 text-2xl font-bold">{v.meaning_cn}</div>
        </>);

    }
    // listen
    return (
      <>
        <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>听例句选单词</T></div>
        <button
          onClick={() => speakExample(v)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-3 text-primary">
          
          <Volume2 className="size-5" /> <T>再听一次</T>
        </button>
        <div className="mt-3 text-xs text-muted-foreground">{v.meaning_cn}</div>
      </>);

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
          {c.pos &&
          <span className="rounded-md border border-muted-foreground/30 bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {c.pos}
            </span>
          }
        </span>);

    }
    return c.word;
  };

  const onPick = (c: Vocab) => {
    if (picked) return;
    // iOS 音频铁律:在用户点击手势内同步解锁共享 <audio>,这样下一题
    // useEffect 里 setTimeout 的自动播放(非手势)才不会被 iOS 阻塞/延迟。
    unlockAudioSync();
    setPicked(c.id);
    const ok = c.id === v.id;
    if (ok && (item.kind === "cn2en" || item.kind === "en2word")) speakWord(v);
    setTimeout(() => onResult(ok), 900);
  };

  return (
    <div className="rounded-3xl border bg-card p-6 text-center shadow-tile">
      {isTimedKind &&
      <div className="mb-4 -mx-6 -mt-6 h-1.5 overflow-hidden rounded-t-3xl bg-muted">
          <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            secondsLeft > 5 ?
            "bg-primary" :
            secondsLeft > 2 ?
            "bg-amber-500" :
            "bg-red-500 animate-pulse"
          )}
          style={{ width: `${secondsLeft / QUESTION_TIMEOUT_SEC * 100}%` }} />
        
        </div>
      }
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
              )}>
              
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {String.fromCharCode(65 + item.choices.indexOf(c))}
              </span>
              {renderChoiceLabel(c)}
              {showState && isCorrect && <Check className="ml-2 inline size-4 text-green-600" />}
              {showState && isPicked && !isCorrect && <X className="ml-2 inline size-4 text-red-600" />}
            </button>);

        })}
      </div>
    </div>);

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
  poolIds









}: {stats: {correct: number;total: number;};coinsAwarded?: number;onExit: () => void;onRetry: () => void;levelUps?: {word: string;level: MasteryLevel;}[];group?: Vocab[];wrongWords?: Vocab[];poolIds?: string[];}) {
  const pct = stats.total === 0 ? 0 : Math.round(stats.correct / stats.total * 100);
  const [showGame, setShowGame] = useState(false);
  return (
    <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
      <Sparkles className="mx-auto size-10 text-primary" />
      <div className="mt-3 text-xl font-extrabold"><T>本组完成 🎉</T></div>
      <div className="mt-2 text-sm text-muted-foreground">
        <T>正确率</T> <span className="font-bold text-foreground">{pct}%</span> · {stats.correct} / {stats.total}
      </div>
      {coinsAwarded !== undefined && coinsAwarded > 0 &&
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          🪙 +{coinsAwarded} <T>金币</T>
        </div>
      }
      {poolIds && poolIds.length > 0 &&
      <NextStepHint
        vocabIds={poolIds}
        onPickMode={(m) => {
          // navigate via URL change so the parent picks up the mode
          const url = new URL(window.location.href);
          url.searchParams.set("mode", m);
          url.searchParams.delete("group");
          window.location.assign(url.toString());
        }} />

      }
      {levelUps && levelUps.length > 0 &&
      <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-primary"><T>📈 升级单词</T></div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {levelUps.slice(0, 12).map((u, i) => {
            const l = MASTERY_LABELS[u.level];
            return (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs font-semibold",
                  l.color
                )}>
                
                  {l.emoji} {u.word}
                </span>);

          })}
            {levelUps.length > 12 &&
          <span className="text-xs text-muted-foreground">+{levelUps.length - 12} more</span>
          }
          </div>
        </div>
      }
      <div className="mt-2 text-xs text-muted-foreground"><T>答错的词已加入复习队列，将按艾宾浩斯曲线自动安排复习</T></div>
      {wrongWords && wrongWords.length > 0 &&
      <div className="mt-5 text-left">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            <T>✏️ 本次答错</T> {wrongWords.length} <T>词 · 点开查看 AI 深度讲解</T>
          </div>
          {wrongWords.slice(0, 8).map((w) =>
        <div key={w.id} className="mt-2 rounded-2xl border bg-background p-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-base font-extrabold font-mono">{w.word}</span>
                  {w.pos &&
              <span className="ml-2 rounded-md border border-muted-foreground/30 bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {w.pos}
                    </span>
              }
                </div>
                <button
              onClick={() => speakWord(w)}
              className="rounded-full bg-primary/10 p-1.5 text-primary hover:bg-primary/20"
              aria-label="朗读">
              
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
              example_cn: w.example_cn
            }} />
          
            </div>
        )}
          {wrongWords.length > 8 &&
        <div className="mt-2 text-center text-xs text-muted-foreground">
              <T>还有</T> {wrongWords.length - 8} <T>词在 SRS 队列中</T>
            </div>
        }
        </div>
      }
      {group && group.length >= 6 && !showGame &&
      <div className="mt-5">
          <button
          onClick={() => setShowGame(true)}
          className="group inline-flex items-center gap-2 rounded-full border-2 border-fuchsia-500/60 bg-gradient-to-r from-fuchsia-500/15 via-rose-500/10 to-amber-400/15 px-5 py-2.5 text-sm font-extrabold text-fuchsia-700 shadow-md transition hover:scale-105 hover:shadow-lg dark:text-fuchsia-300">
            <T>🎮 玩个配对消消乐放松一下 →</T>
          
        </button>
          <div className="mt-1 text-[11px] text-muted-foreground"><T>12 张卡 · 配对越快金币越多</T></div>
        </div>
      }
      {group && showGame &&
      <div className="mt-5 text-left">
          <MemoryMatch pool={group} onClose={() => setShowGame(false)} />
        </div>
      }
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onRetry}>
          <RotateCw className="mr-1 size-4" /> <T>再练一遍</T>
        </Button>
        <Button onClick={onExit}><T>选下一组 →</T></Button>
      </div>
    </div>);

}

/* ---------- Synonym differentiation question ---------- */
function SynQuestion({
  vocab,
  onResult



}: {vocab: Vocab;onResult: (ok: boolean) => void;}) {
  const v = vocab;
  const [pack, setPack] = useState<SynPack | null>(
    () => synonymCache.get(v.id) ?? null
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
          <T>近义词辨析 · Synonym</T>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 animate-pulse text-primary" /> <T>AI 正在生成近义词…</T>
        </div>
      </div>);

  }

  return (
    <div className="rounded-3xl border bg-card p-6 text-center shadow-tile">
      <div className="-mx-6 -mt-6 mb-4 h-1.5 overflow-hidden rounded-t-3xl bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            secondsLeft > 5 ?
            "bg-primary" :
            secondsLeft > 2 ?
            "bg-amber-500" :
            "bg-red-500 animate-pulse"
          )}
          style={{ width: `${secondsLeft / QUESTION_TIMEOUT_SEC * 100}%` }} />
        
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        <T>选出</T> <span className="text-primary"><T>近义词</T></span> · Synonym
      </div>
      <button
        onClick={() => speakWord(v)}
        className="mt-2 inline-flex items-center gap-2 text-3xl font-extrabold">
        
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
                showState && !isPicked && !isCorrect && "opacity-60"
              )}>
              
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-semibold">{opt}</span>
              {showState && isCorrect &&
              <Check className="ml-2 inline size-4 text-green-600" />
              }
              {showState && isPicked && !isCorrect &&
              <X className="ml-2 inline size-4 text-red-600" />
              }
            </button>);

        })}
      </div>
    </div>);

}

/* ---------- Spelling Bee question ---------- */
function SpellQuestion({
  vocab,
  onResult



}: {vocab: Vocab;onResult: (ok: boolean) => void;}) {
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
          <Keyboard className="size-3" /> <T>Spelling Bee · 听音拼写</T>
        </div>
        <button
          onClick={() => speakWord(vocab)}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          
          <Volume2 className="size-3" /> <T>再听一次</T>
          <AccentBadge accent={vocab.accent} />
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => speakWord(vocab)}
          className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-tile transition hover:scale-105"
          aria-label="play pronunciation">
          
          <Volume2 className="size-7" />
        </button>
        <div className="mt-3 text-sm text-muted-foreground">
          {vocab.meaning_cn}{vocab.pos ? ` · ${vocab.pos}` : ""}
        </div>
        {vocab.phonetic && hintShown &&
        <div className="mt-1 text-xs text-muted-foreground">{vocab.phonetic}</div>
        }
      </div>

      {/* Letter slots */}
      <div
        className={cn(
          "mt-6 flex flex-wrap justify-center gap-1.5 transition",
          errorFlash && "animate-pulse"
        )}
        onClick={() => inputRef.current?.focus()}>
        
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
              )}>
              
              {isFilled ? ch : isFirstHint ? ch : "·"}
            </div>);

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
        aria-label="spell the word" />
      

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
        className="mt-5 w-full rounded-xl border bg-background px-4 py-3 text-center font-mono text-base focus:border-primary focus:outline-none disabled:opacity-70" />
      

      {!reveal &&
      <div className="mt-3 flex items-center justify-between text-xs">
          <button
          onClick={useHint}
          disabled={hintShown}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50">
            <T>💡 提示（首字母 + 音标）</T>
          
        </button>
          <button onClick={giveUp} className="text-muted-foreground hover:text-foreground">
            <T>放弃 · 看答案 →</T>
          </button>
        </div>
      }

      {reveal &&
      <div className="mt-5 space-y-3">
          <div
          className={cn(
            "rounded-xl p-3 text-sm font-semibold",
            reveal === "correct" ?
            "bg-green-500/10 text-green-700 dark:text-green-400" :
            "bg-red-500/10 text-red-700 dark:text-red-400"
          )}>
          
            {reveal === "correct" ?
          <span className="inline-flex items-center gap-2">
                <Zap className="size-4" /> <T>拼写正确！</T>
              </span> :

          <>
                <T>✗ 正确拼写：</T><span className="font-mono">{target}</span>
              </>
          }
          </div>
          {vocab.example_en &&
        <button
          onClick={() => speakExample(vocab)}
          className="flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm hover:bg-accent/30">
          
              <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <div>{vocab.example_en}</div>
                <div className="mt-1 text-xs text-muted-foreground">{vocab.example_cn}</div>
              </div>
            </button>
        }
          <Button className="w-full" size="lg" onClick={() => onResult(reveal === "correct")}>
            <T>继续 →</T>
          </Button>
        </div>
      }
    </div>);

}

/* ---------- SRS Smart Review Session ---------- */
function SrsReviewSession({ pool, onExit, focus }: {pool: Vocab[];onExit: () => void;focus?: "retention";}) {
  const [sp] = useSearchParams();
  const gradeNum = (() => {
    const raw = Number(sp.get("grade"));
    if (!raw) return 10;
    return raw >= 1 && raw <= 3 ? raw + 9 : raw;
  })();
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
  const [srsLevelUps, setSrsLevelUps] = useState<{word: string;level: MasteryLevel;}[]>([]);
  const srsQuestionShownAtRef = useRef<number>(Date.now());
  const cohortCtx = useCohortAttemptContext();

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
      let idSet: Set<string>;
      if (focus === "retention") {
        // 21 天保留测试：score≥0.85 + last_seen_at 21 天前 + 还没有 reached_master_at
        const cutoff = new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString();
        const { data: rows } = await supabase.
        from("gaokao_user_mastery").
        select("item_id, mastery_matrix, reached_master_at, last_seen_at").
        eq("user_id", user.id).
        eq("item_type", "vocab").
        lte("last_seen_at", cutoff).
        is("reached_master_at", null).
        limit(200);
        idSet = new Set(
          (rows ?? []).
          filter((r: any) => computeMasteryScore((r.mastery_matrix ?? {}) as MasteryMatrix) >= 0.85).
          slice(0, 30).
          map((r: any) => r.item_id as string)
        );
      } else {
        const { data: dueRows } = await supabase.
        from("gaokao_user_mastery").
        select("item_id, wrong_count").
        eq("user_id", user.id).
        eq("item_type", "vocab").
        lte("next_review_at", nowIso).
        order("wrong_count", { ascending: false }).
        limit(30);
        idSet = new Set((dueRows ?? []).map((r) => r.item_id as string));
      }
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
        <p className="text-sm text-muted-foreground"><T>加载复习队列…</T></p>
      </main>);

  }

  if (dueWords.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
          <Sparkles className="mx-auto size-10 text-primary" />
          <div className="mt-3 text-xl font-extrabold"><T>今日无待复习 🎉</T></div>
          <div className="mt-2 text-sm text-muted-foreground"><T>回去学习新的词组吧</T></div>
          <Button className="mt-6" onClick={onExit}><T>选词组学习 →</T></Button>
        </div>
      </main>);

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
        stats.total === 0 ?
        0 :
        Math.round(stats.correct / stats.total * 100);
        const newly = await evaluateMilestones({
          bestStreak,
          spellCorrect,
          perfectGroup: stats.total > 0 && stats.correct === stats.total,
          srsAccuracyPct: pctNum,
          totalEarned: totals?.total_earned ?? 0,
          attempted: stats.total
        });
        if (newly.length > 0) setUnlockedBadges(newly);
      })();
    }
    const pct = stats.total === 0 ? 0 : Math.round(stats.correct / stats.total * 100);
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            
            <ArrowLeft className="size-4" /> <T>返回</T>
          </button>
          <CoinPill refreshKey={coinsRefreshKey} />
        </div>
        <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
          <Brain className="mx-auto size-10 text-primary" />
          <div className="mt-3 text-xl font-extrabold"><T>复习完成 🧠✨</T></div>
          <div className="mt-2 text-sm text-muted-foreground">
            <T>正确率</T> <span className="font-bold text-foreground">{pct}%</span> · {stats.correct} / {stats.total}
          </div>
          {coinsAwarded > 0 &&
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              🪙 +{coinsAwarded} <T>金币</T>
            </div>
          }
          {srsLevelUps.length > 0 &&
          <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-primary"><T>📈 升级单词</T></div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {srsLevelUps.slice(0, 12).map((u, i) => {
                const l = MASTERY_LABELS[u.level];
                return (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs font-semibold",
                      l.color
                    )}>
                    
                      {l.emoji} {u.word}
                    </span>);

              })}
                {srsLevelUps.length > 12 &&
              <span className="text-xs text-muted-foreground">+{srsLevelUps.length - 12} more</span>
              }
              </div>
            </div>
          }
          <div className="mt-1 text-xs text-muted-foreground"><T>下次复习时间已自动调整</T></div>
          <Button className="mt-6 w-full" onClick={onExit}><T>返回</T></Button>
        </div>
        {unlockedBadges.length > 0 &&
        <BadgeUnlockOverlay
          badges={unlockedBadges}
          onDismiss={() => setUnlockedBadges([])} />

        }
      </main>);

  }

  const handleResult = async (isCorrect: boolean) => {
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    const latencyMs = Date.now() - srsQuestionShownAtRef.current;
    await recordAttempt({ questionType: "vocab", questionId: item.vocab.id, isCorrect });
    recordUnifiedAttempt({
      stage: "senior",
      grade: gradeNum,
      module: "vocab",
      item_type: "word",
      item_id: item.vocab.id,
      item_label: item.vocab.word,
      is_correct: isCorrect,
      context: { kind: item.kind, mode: "srs", latency_ms: latencyMs }
    }).catch(() => {});
    const update = await recordCohortAttempt({
      vocabId: item.vocab.id,
      kind: item.kind,
      isCorrect,
      latencyMs,
      // SRS review session = words pulled from the FSRS due queue
      // (`due_at <= now()`). Always `fsrs_due`, regardless of cohort.
      source: "fsrs_due",
      cohortId: cohortCtx.cohortId,
      cohortWordIds: cohortCtx.cohortWordIds,
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
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          
          <ArrowLeft className="size-4" /> <T>退出复习</T>
        </button>
        <CoinPill refreshKey={coinsRefreshKey} />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Brain className="size-3" /> <T>智能复习</T>
        </div>
        <div className="text-xs text-muted-foreground"><T>SM-2 间隔重复</T></div>
      </div>
      <PageHeader back="/gaokao/vocab" hideReviewBanner title="今日复习队列" subtitle="答对延后下次复习，答错明天再来" />
      <div className="mt-4">
        <ComboHeader
          pos={pos + 1}
          total={queue.length}
          correct={stats.correct}
          attempted={stats.total}
          streak={streak}
          bestStreak={bestStreak}
          score={score} />
        
        <div className="relative">
          <QuizQuestion
            key={`${item.vocab.id}-${pos}`}
            item={item}
            onResult={handleResult} />
          
          {floatBadge && <FloatingComboBadge label={floatBadge} />}
        </div>
      </div>
    </main>);

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
    [659.25, 880], // E5 → A5  (×2)
    [659.25, 880, 1108.73], // E5 → A5 → C#6 (×3)
    [659.25, 880, 1108.73, 1318.51] // ... → E6 (×5 ON FIRE)
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

    /* ignore — audio is best-effort */}
}

function ComboHeader({
  pos,
  total,
  correct,
  attempted,
  streak,
  bestStreak,
  score








}: {pos: number;total: number;correct: number;attempted: number;streak: number;bestStreak: number;score: number;}) {
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
      )}>
      
      <div className="text-xs text-muted-foreground">
        {pos} / {total} <span className="mx-1">·</span> ✓ {correct}/{attempted}
      </div>
      <div className="flex items-center gap-2">
        {streak >= 2 &&
        <span
          key={`combo-${bump}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold transition origin-center animate-scale-in",
            tier === 1 && "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md",
            tier === 2 && "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg animate-pulse",
            tier === 3 && "bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 text-white shadow-2xl animate-pulse"
          )}>
          
            <Flame className={cn("size-4", tier >= 2 && "drop-shadow-[0_0_6px_rgba(255,200,0,0.9)]")} />
            <span className="tabular-nums">{streak}</span>
            <span className="opacity-90">×{mult}</span>
          </span>
        }
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-bold">
          <Zap className="size-3 text-amber-500" /> {score}
        </span>
        {bestStreak >= 3 &&
        <span className="hidden text-[10px] text-muted-foreground sm:inline">
            <T>最佳</T> {bestStreak}
          </span>
        }
      </div>
    </div>);

}

function FloatingComboBadge({ label }: {label: string;}) {
  // Burst sparkles arranged radially around the badge.
  const sparks = Array.from({ length: 10 });
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center">
      <div className="relative">
        {/* Halo */}
        <div className="absolute inset-0 -m-6 animate-ping rounded-full bg-rose-500/30" />
        {/* Sparks */}
        {sparks.map((_, i) => {
          const angle = i / sparks.length * Math.PI * 2;
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
                ["--dy" as any]: `${dy}px`
              }} />);


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
    </div>);

}

/* ====================================================================== */
/* ============ Word Rush — falling-meaning rhythm matching =============== */
/* ====================================================================== */

const RUSH_DURATION_SEC = 60;
const RUSH_FALL_BASE_MS = 10000; // initial fall duration (slower start)
const RUSH_FALL_MIN_MS = 4500; // fastest fall duration (still readable)
const RUSH_SPAWN_BASE_MS = 2800; // initial spawn interval
const RUSH_SPAWN_MIN_MS = 1300; // fastest spawn interval
const RUSH_MAX_ACTIVE = 3; // max simultaneous falling tiles

type RushTile = {
  id: number;
  vocab: Vocab;
  // 0..1 horizontal position
  x: number;
  spawnedAt: number;
  fallMs: number;
};

function WordRushSession({ pool, onExit }: {pool: Vocab[];onExit: () => void;}) {
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
  const [choices, setChoices] = useState<Vocab[]>([]);
  const [activeTileId, setActiveTileId] = useState<number | null>(null);
  const [floatPop, setFloatPop] = useState<{id: number;text: string;ok: boolean;} | null>(null);

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
        fallMs
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
    // 立即朗读用户选中的单词（不等 setState 回调，确保零延迟）
    const active = tiles.find((p) => p.id === activeTileId);
    if (active && choice.id === active.vocab.id) {
      void speakWord(choice);
    }
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
      const accuracy = attempted > 0 ? Math.round(hits / attempted * 100) : 0;
      const milestones: BadgeDef[] = [];
      // Standard milestones
      const m = await evaluateMilestones({
        bestStreak,
        spellCorrect: 0,
        perfectGroup: false,
        totalEarned: totals?.total_earned ?? 0,
        attempted
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
            <ArrowLeft className="size-4" /> <T>返回</T>
          </button>
          <CoinPill />
        </div>
        <div className="rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-transparent p-8 text-center shadow-tile">
          <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-3xl bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400">
            <Music className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold">⚡ Word Rush</h1>
          <p className="mt-2 text-sm text-muted-foreground"><T>节奏消除 · 60 秒挑战</T></p>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold"><T>🎯 玩法</T></div>
              <div className="text-xs text-muted-foreground mt-1"><T>中文释义从顶部下落，从底部 4 个英文单词中选出对应词。</T></div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold">🔥 Combo</div>
              <div className="text-xs text-muted-foreground mt-1"><T>连对触发 ×2 / ×3 / ×5 倍率，分数飞涨。</T></div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold"><T>⏱ 越来越快</T></div>
              <div className="text-xs text-muted-foreground mt-1"><T>下落速度和出现频率会随时间递增。</T></div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold"><T>🪙 奖励</T></div>
              <div className="text-xs text-muted-foreground mt-1"><T>每 10 分换 1 金币，得分 ≥ 300 解锁徽章。</T></div>
            </div>
          </div>

          <Button
            onClick={start}
            disabled={playable.length < 4}
            className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-base font-bold text-white hover:opacity-90">
            
            <Zap className="mr-2 size-5" /> <T>开始挑战</T>
          </Button>
        </div>
      </main>);

  }

  if (phase === "done") {
    const attempted = hits + misses;
    const accuracy = attempted > 0 ? Math.round(hits / attempted * 100) : 0;
    const coins = Math.max(hits > 0 ? 5 : 0, Math.floor(score / 10));
    return (
      <>
        <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> <T>返回</T>
            </button>
            <CoinPill refreshKey={coinRefresh} />
          </div>
          <div className="rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/10 to-transparent p-8 text-center shadow-tile">
            <Trophy className="mx-auto size-14 text-amber-500" />
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">Final Score</div>
            <div className="text-6xl font-extrabold tabular-nums">{score}</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground"><T>命中</T></div>
                <div className="text-xl font-bold text-emerald-600">{hits}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground"><T>最高连击</T></div>
                <div className="text-xl font-bold text-fuchsia-600">{bestStreak}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground"><T>准确率</T></div>
                <div className="text-xl font-bold">{accuracy}%</div>
              </div>
            </div>
            {coins > 0 &&
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                +{coins} <T>🪙 金币入账</T>
              </div>
            }
            <div className="mt-6 flex gap-2">
              <Button onClick={start} className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 font-bold text-white hover:opacity-90">
                <RotateCw className="mr-2 size-4" /> <T>再来一局</T>
              </Button>
              <Button variant="outline" onClick={onExit} className="h-12 flex-1 rounded-2xl">
                <T>返回词组</T>
              </Button>
            </div>
          </div>
        </main>
        {unlockedBadges.length > 0 &&
        <BadgeUnlockOverlay badges={unlockedBadges} onDismiss={() => setUnlockedBadges([])} />
        }
      </>);

  }

  /* Playing */
  return (
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-4 pt-2 pb-3 overflow-hidden">
      {/* Top bar */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>退出</T>
        </button>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">
            ⏱ {timeLeft}s
          </span>
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">
            🎯 {score}
          </span>
          {streak >= 2 &&
          <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 px-3 py-1 text-white tabular-nums shadow-sm">
              🔥 ×{comboMultiplier(streak)}
            </span>
          }
        </div>
      </div>

      {/* Time progress bar */}
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            timeLeft > 20 ? "bg-emerald-500" : timeLeft > 10 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${timeLeft / RUSH_DURATION_SEC * 100}%` }} />
        
      </div>

      {/* Falling area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-2xl border-2 border-fuchsia-500/30 bg-gradient-to-b from-purple-500/5 via-background to-fuchsia-500/5"
        style={{ minHeight: "40vh" }}>
        
        {/* Ground line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

        {tiles.map((t) => {
          const isActive = t.id === activeTileId;
          return (
            <div
              key={t.id}
              className={cn(
                "absolute -translate-x-1/2 rounded-2xl border-2 px-4 py-2.5 text-center text-lg font-extrabold shadow-md whitespace-nowrap max-w-[85%] truncate",
                isActive ?
                "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 ring-2 ring-fuchsia-500/40" :
                "border-muted-foreground/30 bg-card/80 text-muted-foreground"
              )}
              style={{
                left: `${t.x * 100}%`,
                top: 0,
                animation: `rush-fall ${t.fallMs}ms linear forwards`
              }}>
              
              {t.vocab.meaning_cn}
            </div>);

        })}

        {/* Floating feedback */}
        {floatPop &&
        <div
          key={floatPop.id}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 animate-fade-in text-2xl font-extrabold",
            floatPop.ok ? "text-emerald-500" : "text-red-500"
          )}>
          
            {floatPop.ok ? floatPop.text : `❌ ${floatPop.text}`}
          </div>
        }

        {tiles.length === 0 &&
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            <T>准备…</T>
          </div>
        }
      </div>

      {/* Choice buttons */}
      <div className="mt-2 grid grid-cols-2 gap-2 shrink-0">
        {choices.map((c) =>
        <button
          key={c.id}
          onClick={() => answer(c)}
          className="rounded-2xl border-2 border-border bg-card px-3 py-4 text-xl font-extrabold shadow-sm transition active:scale-95 hover:border-fuchsia-500 hover:bg-fuchsia-500/5">
          
            {c.word}
          </button>
        )}
        {choices.length === 0 &&
        <div className="col-span-2 rounded-2xl border-2 border-dashed border-muted bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
            <T>等待第一个单词…</T>
          </div>
        }
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes rush-fall {
          from { transform: translate(-50%, 0); }
          to { transform: translate(-50%, calc(50vh - 3rem)); }
        }
      `}</style>
    </main>);

}

/* ====================================================================== */
/* ============ Dictation — listen & type the full sentence =============== */
/* ====================================================================== */

const DICT_QUESTION_COUNT = 5;

/* ---------- Cohort word-level dictation route wrapper ---------- */
function CohortDictRoute({
  allVocab,
  onExit,
}: {
  allVocab: Vocab[];
  onExit: () => void;
}) {
  const { active: cohort, activeLoading } = useActiveCohort();
  const slice = useMemo(() => {
    if (!cohort) return [];
    const idSet = new Set(cohort.cohort_word_ids);
    return allVocab.filter((v) => idSet.has(v.id));
  }, [allVocab, cohort?.cohort_word_ids.join(",")]);

  if (activeLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10 text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }
  if (!cohort) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10 text-center">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <p className="mt-8 text-sm text-muted-foreground">
          <T>请先在「5 步走」开启一批，再来听写。</T>
        </p>
      </main>
    );
  }
  return (
    <CohortDictationSession
      pool={slice}
      cohortId={cohort.id}
      cohortWordIds={cohort.cohort_word_ids}
      onExit={onExit}
    />
  );
}

/* ---------- Cohort meaning (step ③) route wrapper ---------- */
function CohortMeaningRoute({
  allVocab,
  onExit,
}: {
  allVocab: Vocab[];
  onExit: () => void;
}) {
  const { active: cohort, activeLoading } = useActiveCohort();
  const slice = useMemo(() => {
    if (!cohort) return [];
    const idSet = new Set(cohort.cohort_word_ids);
    return allVocab.filter((v) => idSet.has(v.id));
  }, [allVocab, cohort?.cohort_word_ids.join(",")]);

  if (activeLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10 text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }
  if (!cohort) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10 text-center">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <p className="mt-8 text-sm text-muted-foreground">
          <T>请先在「5 步走」开启一批，再来做中英互选。</T>
        </p>
      </main>
    );
  }
  return (
    <CohortMeaningSession
      pool={slice}
      cohortId={cohort.id}
      cohortWordIds={cohort.cohort_word_ids}
      onExit={onExit}
    />
  );
}

/* ---------- Cohort cloze (step ④) route wrapper ---------- */
function CohortClozeRoute({
  allVocab,
  onExit,
}: {
  allVocab: Vocab[];
  onExit: () => void;
}) {
  const { active: cohort, activeLoading } = useActiveCohort();
  const slice = useMemo(() => {
    if (!cohort) return [];
    const idSet = new Set(cohort.cohort_word_ids);
    return allVocab.filter((v) => idSet.has(v.id));
  }, [allVocab, cohort?.cohort_word_ids.join(",")]);

  if (activeLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10 text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }
  if (!cohort) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10 text-center">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回</T>
        </button>
        <p className="mt-8 text-sm text-muted-foreground">
          <T>请先在「5 步走」开启一批，再来做完形。</T>
        </p>
      </main>
    );
  }
  return (
    <CohortClozeSession
      pool={slice}
      cohortId={cohort.id}
      cohortWordIds={cohort.cohort_word_ids}
      onExit={onExit}
    />
  );
}

type DictResult = {
  score: number;
  comment: string;
  mistakes: {expected: string;got: string;hint: string;}[];
  corrected: string;
};

function DictationSession({ pool, onExit }: {pool: Vocab[];onExit: () => void;}) {
  const [sp] = useSearchParams();
  const gradeNum = (() => {
    const raw = Number(sp.get("grade"));
    if (!raw) return 10;
    return raw >= 1 && raw <= 3 ? raw + 9 : raw;
  })();
  const playable = useMemo(
    () =>
    pool.filter(
      (v) =>
      v.example_en &&
      v.example_en.trim().split(/\s+/).length >= 4 &&
      v.example_en.trim().split(/\s+/).length <= 18
    ),
    [pool]
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

  // P2 预热:本轮听写题目定下后即按网络预热其例句音频,键与 speakExample 一致 →
  // start()/nextItem() 的自动播(:3664/:3725)首播秒响,消除整句冷合成 1-3s。
  useEffect(() => { if (items.length) prewarmVocab(items, { examples: true }); }, [items]);

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
        body: { reference: current.example_en, attempt: input }
      });
      if (error) throw error;
      const r = data as DictResult;
      setResult(r);
      setScores((prev) => [...prev, r.score]);
      recordUnifiedAttempt({
        stage: "senior",
        grade: gradeNum,
        module: "vocab",
        item_type: "dictation",
        item_id: current.id,
        item_label: (current.example_en || current.word).slice(0, 60),
        is_correct: r.score >= 60,
        context: { score: r.score, mode: "dictation" }
      }).catch(() => {});
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
        corrected: current.example_en
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
    const avg = scores.length > 0 ?
    Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) :
    0;
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
        attempted: scores.length
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
            <ArrowLeft className="size-4" /> <T>返回</T>
          </button>
          <CoinPill />
        </div>
        <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-8 text-center shadow-tile">
          <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Headphones className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold"><T>🎧 句子听写</T></h1>
          <p className="mt-2 text-sm text-muted-foreground"><T>5 句英文例句 · AI 智能评分</T></p>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold"><T>🔊 播放</T></div>
              <div className="text-xs text-muted-foreground mt-1"><T>点击喇叭可重复听，没有听清没关系。</T></div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold"><T>⌨️ 输入</T></div>
              <div className="text-xs text-muted-foreground mt-1"><T>写下你听到的句子（不需逐字一致，意思接近也算）。</T></div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold"><T>🤖 AI 评分</T></div>
              <div className="text-xs text-muted-foreground mt-1"><T>0-100 分 · 自动指出拼写/漏词错误。</T></div>
            </div>
            <div className="rounded-2xl border bg-card p-3">
              <div className="font-bold"><T>🪙 奖励</T></div>
              <div className="text-xs text-muted-foreground mt-1"><T>平均分 ≥ 80 解锁 🎧 听写达人徽章。</T></div>
            </div>
          </div>

          <Button
            onClick={start}
            disabled={playable.length < DICT_QUESTION_COUNT}
            className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-bold text-white hover:opacity-90">
            
            <Headphones className="mr-2 size-5" /> <T>开始听写</T>
          </Button>
        </div>
      </main>);

  }

  if (phase === "done") {
    const avg = scores.length > 0 ?
    Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) :
    0;
    const coins = Math.max(0, Math.floor(avg / 2)) + (bestStreak >= 3 ? 10 : 0);
    return (
      <>
        <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> <T>返回</T>
            </button>
            <CoinPill refreshKey={coinRefresh} />
          </div>
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent p-8 text-center shadow-tile">
            <Trophy className="mx-auto size-14 text-amber-500" />
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground"><T>平均分</T></div>
            <div className="text-6xl font-extrabold tabular-nums">{avg}</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground"><T>完成</T></div>
                <div className="text-xl font-bold">{scores.length}/{DICT_QUESTION_COUNT}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground"><T>最佳连击</T></div>
                <div className="text-xl font-bold text-emerald-600">{bestStreak}</div>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="text-xs text-muted-foreground"><T>最高单题</T></div>
                <div className="text-xl font-bold">{Math.max(0, ...scores)}</div>
              </div>
            </div>
            {coins > 0 &&
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                +{coins} <T>🪙 金币入账</T>
              </div>
            }
            <div className="mt-6 flex gap-2">
              <Button onClick={start} className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:opacity-90">
                <RotateCw className="mr-2 size-4" /> <T>再来一组</T>
              </Button>
              <Button variant="outline" onClick={onExit} className="h-12 flex-1 rounded-2xl">
                <T>返回</T>
              </Button>
            </div>
          </div>
        </main>
        {unlockedBadges.length > 0 &&
        <BadgeUnlockOverlay badges={unlockedBadges} onDismiss={() => setUnlockedBadges([])} />
        }
      </>);

  }

  /* Playing */
  if (!current) return null;
  const showResult = !!result;
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>退出</T>
        </button>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-card px-3 py-1 tabular-nums shadow-sm border">
            {idx + 1}/{items.length}
          </span>
          {streak >= 2 &&
          <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-white tabular-nums shadow-sm">
              🔥 ×{comboMultiplier(streak)}
            </span>
          }
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${(idx + (showResult ? 1 : 0)) / items.length * 100}%` }} />
        
      </div>

      <div className="rounded-3xl border-2 border-emerald-500/30 bg-card p-6 shadow-tile">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>听音听写</T></div>
          <button
            onClick={() => speakExample(current)}
            className="mt-3 inline-flex size-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 transition hover:bg-emerald-500/25 dark:text-emerald-400"
            title="重听">
            
            <Volume2 className="size-10" />
          </button>
          <div className="mt-2 text-xs text-muted-foreground"><T>点击重听</T></div>
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
          }} />
        
        <div className="mt-1 text-right text-[11px] text-muted-foreground">
          <T>⌘/Ctrl + Enter 提交</T>
        </div>

        {!showResult &&
        <div className="mt-3 flex gap-2">
            <Button
            variant="outline"
            className="h-11 flex-1 rounded-2xl"
            onClick={() => setRevealed(true)}
            disabled={revealed}>
              <T>我不会，看答案</T>
            
          </Button>
            <Button
            onClick={submit}
            disabled={grading || !input.trim()}
            className="h-11 flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:opacity-90">
            
              {grading ? <><Loader2 className="mr-2 size-4 animate-spin" /> <T>评分中…</T></> : "提交"}
            </Button>
          </div>
        }

        {revealed && !showResult &&
        <div className="mt-3 rounded-2xl border bg-muted/40 p-3 text-sm">
            <div className="text-xs text-muted-foreground"><T>参考答案</T></div>
            <div className="mt-1 font-bold">{current.example_en}</div>
            {current.example_cn &&
          <div className="mt-1 text-xs text-muted-foreground">{current.example_cn}</div>
          }
          </div>
        }

        {showResult && result &&
        <div className="mt-4 space-y-3">
            <div
            className={cn(
              "rounded-2xl border-2 p-4 text-center",
              result.score >= 80 ?
              "border-emerald-500/40 bg-emerald-500/10" :
              result.score >= 50 ?
              "border-amber-500/40 bg-amber-500/10" :
              "border-red-500/40 bg-red-500/10"
            )}>
            
              <div className="text-xs uppercase tracking-wider text-muted-foreground"><T>得分</T></div>
              <div className="text-4xl font-extrabold tabular-nums">{result.score}</div>
              <div className="mt-1 text-xs">{result.comment}</div>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
              <div className="text-xs text-muted-foreground"><T>参考答案</T></div>
              <div className="mt-1 font-bold">{current.example_en}</div>
              {current.example_cn &&
            <div className="mt-1 text-xs text-muted-foreground">{current.example_cn}</div>
            }
            </div>

            {result.mistakes.length > 0 &&
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3 text-sm">
                <div className="mb-2 text-xs font-bold text-red-600 dark:text-red-400"><T>错误点</T></div>
                <ul className="space-y-1.5">
                  {result.mistakes.map((m, i) =>
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
              )}
                </ul>
              </div>
          }

            <Button
            onClick={nextItem}
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:opacity-90">
            
              {idx + 1 >= items.length ? "查看结果" : "下一题"}
              <ChevronRight className="ml-1 size-5" />
            </Button>
          </div>
        }
      </div>
    </main>);

}
/* -------- FSRS review launcher: filters pool to due words, then runs GuidedSession in review mode -------- */
function GaokaoReviewLauncher({ pool, onExit }: {pool: Vocab[];onExit: () => void;}) {
  const [duePool, setDuePool] = useState<Vocab[] | null>(null);
  useEffect(() => {
    (async () => {
      const ids = await fetchDueReviewIds(pool.map((p) => p.id));
      const set = new Set(ids);
      setDuePool(pool.filter((p) => set.has(p.id)));
    })();
  }, [pool]);
  if (duePool === null) {
    return <main className="mx-auto flex min-h-[60dvh] max-w-2xl items-center justify-center text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" /> <T>加载到期单词…</T></main>;
  }
  if (duePool.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> <T>返回</T></button>
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold"><T>今天没有到期复习的词 🎉</T></h3>
          <p className="mt-1 text-sm text-muted-foreground"><T>先去开启一关通关，复习池会按遗忘曲线自动安排。</T></p>
        </div>
      </main>);

  }
  return <GuidedSession pool={duePool} onExit={onExit} title="高考词汇 · 到期复习" mode="review" />;
}
