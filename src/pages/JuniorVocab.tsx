import { T } from "@/i18n/T";import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Sparkles, Trophy, RotateCw, Brain, Headphones, Music, Keyboard, BookOpen, BarChart3, Crown, Clock, Flame, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak, prefetchTTSBatch } from "@/lib/speak";
import { recordAttempt } from "@/lib/gaokaoMastery";
import { recordCohortAttempt } from "@/lib/cohortProgress";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { awardCoins, notifyWrong } from "@/lib/coins";
import { celebrateScore } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import WordBento from "@/components/WordBento";
import MemoryMatch from "@/components/MemoryMatch";
import { useI18n } from "@/i18n/I18nProvider";
import ModuleStageTests from "@/components/ModuleStageTests";
import { toast } from "sonner";
import VocabMasteryOverview from "@/components/vocab/VocabMasteryOverview";
import GuidedSession from "@/components/vocab/GuidedSession";
import VocabGameLauncher from "@/components/vocab/VocabGameLauncher";
import { recordJuniorWordMastery } from "@/lib/juniorWordMastery";
import { useJuniorVocabMastery, MASTER_STREAK } from "@/hooks/useJuniorVocabMastery";
import { canonSpelling } from "@/lib/spellingVariants";
import { unlockAudioSync } from "@/lib/speak";
import { Rocket } from "lucide-react";
import { dbPublisherFor, readJuniorPublisherParam } from "@/lib/juniorHub/publisher";

export type Vocab = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  star_level: number | null;
  theme: string | null;
  freq_rank: number | null;
};

type Mode = null | "classic" | "bento" | "match" | "dict" | "context" | "srs" | "guided";
const GROUP_SIZE = 20;

const isChineseUi = (lang: string) => lang === "zh" || lang === "zh-TW";
const gradeLabel = (grade: number, zh: boolean) => zh ? `初${grade}` : `Grade ${grade + 6}`;
const meaningForUi = (word: Vocab, zh: boolean) => zh ? word.meaning_cn : word.meaning_en || word.meaning_cn;
const secondaryMeaningForUi = (word: Vocab, zh: boolean) => zh ? word.meaning_en : word.meaning_cn;

export default function JuniorVocab() {
  const [params, setParams] = useSearchParams();
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const grade = params.get("grade") ?? "1";
  const mode = params.get("mode") as Mode ?? null;
  const groupParam = Number(params.get("group") ?? "0");
  const dbPub = dbPublisherFor(readJuniorPublisherParam(params)); // 出版社过滤:人教='junior'(结果等价),外研社='junior_fltrp'

  const [words, setWords] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 入口可能传 1/2/3（初一/二/三 序号）或 7/8/9（Grade 7/8/9），统一映射到 7/8/9。
    const raw = Number(grade);
    const gradeNum = raw <= 3 ? raw + 6 : raw;
    // 双表统一后：junior_vocab 已覆盖初一(7)、初二(8)、初三(9)，统一从此读取。
    const COLS = "id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,theme,freq_rank";
    const PAGE = 1000;
    (async () => {
      const all: Vocab[] = [];
      for (let from = 0; from < 5000; from += PAGE) {
        const { data, error } = await supabase.
        from("junior_vocab").
        select(COLS).
        eq("grade", gradeNum).
        eq("publisher", dbPub).
        order("freq_rank", { ascending: true, nullsFirst: false }).
        range(from, from + PAGE - 1);
        if (error || !data || data.length === 0) break;
        all.push(...(data as Vocab[]));
        if (data.length < PAGE) break;
      }
      setWords(all);
      setLoading(false);
    })();
  }, [grade, dbPub]);

  const rawGrade = Number(grade);
  const absGrade = rawGrade <= 3 ? rawGrade + 6 : rawGrade;
  const displayGrade = rawGrade <= 3 ? rawGrade : rawGrade - 6;
  const groups = useMemo(() => {
    const out: Vocab[][] = [];
    for (let i = 0; i < words.length; i += GROUP_SIZE) out.push(words.slice(i, i + GROUP_SIZE));
    return out;
  }, [words]);
  const groupIdx = Number.isFinite(groupParam) ? groupParam - 1 : -1;
  const activePool = groupIdx >= 0 && groupIdx < groups.length ? groups[groupIdx] : words;

  // For SRS mode we filter the pool to only words that are due now (per junior_word_mastery)
  const [srsPool, setSrsPool] = useState<Vocab[] | null>(null);
  useEffect(() => {
    if (mode !== "srs") {setSrsPool(null);return;}
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {setSrsPool([]);return;}
      const { data } = await supabase.
      from("junior_word_mastery").
      select("word_id,due_at").
      eq("user_id", user.id).
      lte("due_at", new Date().toISOString()).
      limit(200);
      const dueIds = new Set((data ?? []).map((r: any) => r.word_id));
      setSrsPool(words.filter((w) => dueIds.has(w.id)));
    })();
  }, [mode, words]);

  const exit = () => {
    const np = new URLSearchParams(params);
    np.delete("mode");
    np.delete("group");
    setParams(np, { replace: true });
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (mode === "srs") {
    if (srsPool === null) {
      return <main className="mx-auto min-h-screen max-w-3xl px-5 py-8"><div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载到期单词…" : "Loading due words…"}</div></main>;
    }
    if (srsPool.length === 0) {
      return (
        <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
          <button onClick={exit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {zh ? "返回" : "Back"}</button>
          <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
            <Trophy className="mx-auto size-12 text-amber-500" />
            <h3 className="mt-2 text-xl font-extrabold">{zh ? "今日没有到期单词 🎉" : "No words are due today 🎉"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{zh ? "先去清单里学一组新词，系统会按艾宾浩斯曲线自动安排复习。" : "Study a new group first, then the system will schedule reviews automatically."}</p>
          </div>
        </main>);

    }
    return <ClassicQuiz pool={srsPool} onExit={exit} gradeNum={rawGrade <= 3 ? rawGrade + 6 : rawGrade} />;
  }
  if (mode === "guided") {
    // Take the current group (or first 100) so we have a focused pool.
    const focused = activePool.slice(0, 100);
    return (
      <GuidedSession
        pool={focused}
        onExit={exit}
        title={zh ? `初${displayGrade} · 本关通关` : `Guided round`}
        grade={absGrade}
        trackJuniorMastery
      />
    );
  }
  if (mode === "bento") return <WordBento pool={activePool} onExit={exit} gradeNum={absGrade} />;
  if (mode === "match") return <MemoryMatchWrapper pool={activePool} onExit={exit} gradeNum={absGrade} />;
  if (mode === "dict") return <DictationSession pool={activePool} onExit={exit} gradeNum={absGrade} />;
  if (mode === "context") return <ContextQuiz pool={activePool} onExit={exit} gradeNum={absGrade} />;
  if (mode === "classic") return <ClassicQuiz pool={activePool} onExit={exit} gradeNum={absGrade} />;

  if (groupIdx >= 0 && groupIdx < groups.length) {
    return <JuniorWordGroup group={groups[groupIdx]} groupNumber={groupIdx + 1} grade={displayGrade} onExit={() => setParams({ grade }, { replace: true })} onPractice={(m) => {const np = new URLSearchParams(params);np.set("mode", m);setParams(np);}} />;
  }

  return <JuniorVocabHub words={words} groups={groups} grade={displayGrade} gradeNum={rawGrade <= 3 ? rawGrade + 6 : rawGrade} onPick={(m) => {const np = new URLSearchParams(params);np.set("mode", m);setParams(np);}} onPickGroup={(i) => setParams({ grade, group: String(i + 1) })} />;
}

/* -------------------- HUB -------------------- */
type WordMasteryRow = {word_id: string;mastery_level: number | null;due_at: string | null;interval_days: number | null;};
function JuniorVocabHub({ words, groups, grade, gradeNum, onPick, onPickGroup }: {words: Vocab[];groups: Vocab[][];grade: number;gradeNum: number;onPick: (m: Exclude<Mode, null>) => void;onPickGroup: (i: number) => void;}) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const levelName = gradeLabel(grade, zh);
  const [masteryMap, setMasteryMap] = useState<Map<string, WordMasteryRow>>(new Map());
  const [loadedMastery, setLoadedMastery] = useState(false);
  const [wordListOpen, setWordListOpen] = useState(false);


  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || words.length === 0) {setLoadedMastery(true);return;}
      const { data } = await supabase.
      from("junior_word_mastery").
      select("word_id,mastery_level,due_at,interval_days").
      eq("user_id", user.id).
      eq("grade", gradeNum).
      limit(5000);
      const map = new Map<string, WordMasteryRow>();
      (data ?? []).forEach((r: any) => map.set(r.word_id, r));
      setMasteryMap(map);
      setLoadedMastery(true);
    })();
  }, [words, gradeNum]);

  // Aggregate stats
  const now = Date.now();
  let mastered = 0,studied = 0,dueCount = 0,intervalSum = 0,intervalN = 0;
  masteryMap.forEach((r) => {
    studied += 1;
    if ((r.mastery_level ?? 0) >= 4) mastered += 1;
    if (r.due_at && new Date(r.due_at).getTime() <= now) dueCount += 1;
    if (r.interval_days && r.interval_days > 0) {intervalSum += r.interval_days;intervalN += 1;}
  });
  const total = words.length;
  const avgStability = intervalN > 0 ? intervalSum / intervalN : 0;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {zh ? "返回初中专区" : "Back to Junior"}
      </BackLink>

      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">CORE VOCABULARY · {levelName}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">{zh ? `初${grade}核心词汇` : `${levelName} Core Vocabulary`}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{zh ? `中考新课标 · 共 ${words.length} 词 · 按 20 词一组系统学习` : `Junior curriculum · ${words.length} words · 20 words per group`}</p>
      </div>

      <GuestBanner />

      <ModuleStageTests segment="junior" grade={grade} module="vocab" />

      {/* 🚀 引导通关入口（5 步走 + FSRS） */}
      <button
        onClick={() => { unlockAudioSync(); onPick("guided"); }}
        className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-4 text-left text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-700">
        
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20"><Rocket className="size-5" /></span>
          <div>
            <p className="text-sm font-bold">{zh ? "开始本组通关 · 5 步走" : "Start guided round · 5 steps"}</p>
            <p className="mt-0.5 text-[11px] text-white/85">{zh ? "看 → 认 → 想 → 拼 → 用，按级解锁，自动收进遗忘曲线" : "See → Recognize → Recall → Spell → Use"}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold">{zh ? "推荐 ★" : "Top pick ★"}</span>
      </button>

      {/* 智能复习 — 读本年级 junior_word_mastery，与下方掌握度统计同源 */}
      <button
        onClick={() => {
          if (dueCount > 0) {
            onPick("srs");
          } else if (studied === 0) {
            toast.info(zh ? "还没有学过单词，先从第 1 组开始学吧 👇" : "No words learned yet — start with group 1 below 👇");
            onPickGroup(0);
          } else {
            toast.success(zh ? `已学 ${studied} 词 · 今日没有到期单词，继续学新词巩固吧 ✨` : `${studied} words learned · nothing due today — keep learning new ones ✨`);
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
              dueCount > 0 ? "bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-200" : "bg-muted text-muted-foreground",
            )}
          >
            {dueCount > 0 ? <Clock className="size-5" /> : <Brain className="size-5" />}
          </span>
          <div>
            <p className={cn("text-sm font-bold", dueCount > 0 ? "text-amber-900 dark:text-amber-100" : "text-foreground")}>
              {dueCount > 0
                ? zh
                  ? `今天有 ${dueCount} 个词到了复习时间`
                  : `${dueCount} words due for review today`
                : zh
                  ? "🧠 智能复习"
                  : "🧠 Smart review"}
            </p>
            <p className={cn("mt-0.5 text-xs", dueCount > 0 ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground")}>
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

      <VocabMasteryOverview
        total={total}
        mastered={mastered}
        studied={studied}
        dueCount={dueCount}
        avgStability={avgStability}
        loading={!loadedMastery}
      />

      {/* 辅助训练（5 游戏启动卡 + 复习说明,抽成共享 VocabGameLauncher,高中同款复用） */}
      <VocabGameLauncher onPick={(m) => onPick(m)} />

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
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform", wordListOpen && "rotate-180")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {wordListOpen
                ? zh
                  ? "和高中一样，先按清单逐组学习，再进入游戏强化。"
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
            let gMastered = 0,gDue = 0,gTouched = 0;
            group.forEach((w) => {
              const r = masteryMap.get(w.id);
              if (!r) return;
              gTouched += 1;
              if ((r.mastery_level ?? 0) >= 4) gMastered += 1;
              if (r.due_at && new Date(r.due_at).getTime() <= now) gDue += 1;
            });
            const allMastered = gMastered === group.length;
            return (
              <button key={i} onClick={() => onPickGroup(i)} className={cn(
                "rounded-2xl border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-primary/5",
                allMastered ? "border-fuchsia-400/60" : "border-border/60"
              )}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold">{zh ? `第 ${i + 1} 组` : `Group ${i + 1}`}</span>
                      <span className="text-[11px] text-muted-foreground">{group.length} {zh ? "词" : "words"}</span>
                      {allMastered && <span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-bold text-fuchsia-600">👑 {zh ? "全部掌握" : "Mastered"}</span>}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{group.slice(0, 5).map((w) => w.word).join(" · ")}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-600">
                        <Crown className="size-3" /> {zh ? "已掌握" : "Mastered"} {gMastered}
                      </span>
                      {gDue > 0 &&
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                          <Clock className="size-3" /> {zh ? "待复习" : "Due"} {gDue}
                        </span>
                      }
                      {gTouched < group.length &&
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {zh ? "未学" : "New"} {group.length - gTouched}
                        </span>
                      }
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </button>);

          })}
        </div>
        )}
      </section>

    </main>);

}

function JuniorWordGroup({ group, groupNumber, grade, onExit, onPractice }: {group: Vocab[];groupNumber: number;grade: number;onExit: () => void;onPractice: (m: Exclude<Mode, null>) => void;}) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const levelName = gradeLabel(grade, zh);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {zh ? `返回初${grade}单词清单` : `Back to ${levelName} word list`}
      </button>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">CORE VOCABULARY · GROUP {groupNumber}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">{zh ? `第 ${groupNumber} 组单词` : `Group ${groupNumber} words`}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{zh ? "先看清单理解词义，再选择练习模式强化记忆。" : "Review the list first, then choose a practice mode to reinforce it."}</p>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["classic", "bento", "match", "dict"] as Exclude<Mode, null>[]).map((m) =>
        <button key={m} onClick={() => onPractice(m)} className="rounded-2xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90">
            {m === "classic" ? zh ? "智能选义" : "Smart meanings" : m === "bento" ? zh ? "单词便当" : "Word Bento" : m === "match" ? zh ? "记忆翻牌" : "Memory Match" : zh ? "听写挑战" : "Dictation"}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {group.map((w, i) =>
        <article key={w.id} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">{(groupNumber - 1) * GROUP_SIZE + i + 1}</span>
                  <h2 className="text-xl font-black text-foreground">{w.word}</h2>
                  {w.phonetic && <span className="font-mono text-xs text-muted-foreground">{w.phonetic}</span>}
                  {w.pos && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{w.pos}</span>}
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{meaningForUi(w, zh)}</p>
                {secondaryMeaningForUi(w, zh) && <p className="mt-0.5 text-xs text-muted-foreground">{secondaryMeaningForUi(w, zh)}</p>}
              </div>
              <button onClick={() => speak(w.word)} className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-label={zh ? `播放 ${w.word}` : `Play ${w.word}`}>
                <Volume2 className="size-4" />
              </button>
            </div>
            {w.example_en && <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground">{w.example_en}</p>}
            {zh && w.example_cn && <p className="mt-1 px-3 text-xs text-muted-foreground">{w.example_cn}</p>}
          </article>
        )}
      </div>
    </main>);

}

/* -------------------- CLASSIC QUIZ -------------------- */
function logJuniorVocabSideEffect(label: string, err: unknown) {
  console.error(`[JuniorVocab] ${label}`, err);
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ClassicQuiz({ pool, onExit, gradeNum, suppressGaokao = false }: {pool: Vocab[];onExit: () => void;gradeNum: number;suppressGaokao?: boolean;}) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const BATCH = 20;

  // 掌握度(智能选义 quiz 连对2次=掌握,独立);登录加载,游客为空。
  const { loading: masteryLoading, authed, consec } = useJuniorVocabMastery(gradeNum);
  const valid = useMemo(() => pool.filter((w) => w.word && meaningForUi(w, zh)), [pool, zh]);
  const total = valid.length;

  // 本会话本地连对(镜像 DB,答题即时刷新进度)
  const [localQuiz, setLocalQuiz] = useState<Map<string, number>>(new Map());
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (masteryLoading) return;
    const m = new Map<string, number>();
    consec.forEach((c, id) => { if (c.quiz) m.set(id, c.quiz); });
    setLocalQuiz(m);
    setSeeded(true);
  }, [masteryLoading, consec]);

  const masteredCount = useMemo(
    () => valid.reduce((n, w) => n + (((localQuiz.get(w.id) ?? 0) >= MASTER_STREAK) ? 1 : 0), 0),
    [valid, localQuiz],
  );

  const buildBatch = useCallback((mastery: Map<string, number>): Vocab[] => {
    const pri = (w: Vocab) => mastery.get(w.id) ?? 0;
    // 差一次就掌握的(consec 高)优先出,确保下一轮再现 → 能凑齐连对2次
    const unmastered = shuffle(valid.filter((w) => pri(w) < MASTER_STREAK)).sort((a, b) => pri(b) - pri(a));
    if (unmastered.length >= BATCH) return unmastered.slice(0, BATCH);
    const mastered = valid.filter((w) => pri(w) >= MASTER_STREAK);
    return [...unmastered, ...shuffle(mastered).slice(0, BATCH - unmastered.length)];
  }, [valid]);

  const [queue, setQueue] = useState<Vocab[]>([]);
  const [batchStartMastered, setBatchStartMastered] = useState(0);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const startedRef = useRef(false);

  // 首批:掌握度就绪后只构建一次(优先未掌握词)
  useEffect(() => {
    if (!seeded || startedRef.current || valid.length === 0) return;
    startedRef.current = true;
    setBatchStartMastered(masteredCount);
    setQueue(buildBatch(localQuiz));
  }, [seeded, valid.length, buildBatch, localQuiz, masteredCount]);

  // P2 预热:本批(≤20)词音频,键与 speak(cur.word) 一致(默认音色)。点喇叭/答后自动读秒响。
  useEffect(() => { if (queue.length) prefetchTTSBatch(queue.map((w) => w.word)); }, [queue]);

  const cur = queue[idx];

  const options = useMemo(() => {
    if (!cur) return [];
    const distractors = shuffle(pool.filter((w) => w.id !== cur.id)).
    slice(0, 3).
    map((w) => meaningForUi(w, zh));
    return shuffle([meaningForUi(cur, zh), ...distractors]);
  }, [cur, pool, zh]);

  const nextRound = () => {
    setBatchStartMastered(masteredCount);
    setQueue(buildBatch(localQuiz));
    setIdx(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
  };

  if (masteryLoading || !seeded) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (valid.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {zh ? "返回" : "Back"}
        </button>
        <p className="text-sm text-muted-foreground">{zh ? "暂无可用单词" : "No words available"}</p>
      </main>);

  }

  if (queue.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (queue.length > 0 && idx >= queue.length) {
    const pct = Math.round(score.correct / Math.max(1, score.total) * 100);
    if (typeof window !== "undefined" && !(queue as any).__rewarded) {
      (queue as any).__rewarded = true;
      const bonus = pct === 100 ? 20 : 5;
      awardCoins(bonus, "junior_vocab_finish").catch(() => {});
      celebrateScore(pct);
    }
    const justMastered = Math.max(0, masteredCount - batchStartMastered);
    const remaining = Math.max(0, total - masteredCount);
    const allMastered = authed && remaining === 0;
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">{pct >= 90 ? zh ? "🌟 太棒了！" : "🌟 Great work!" : pct >= 70 ? zh ? "👍 不错！" : "👍 Nice job!" : zh ? "💪 继续加油！" : "💪 Keep going!"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{zh ? `答对 ${score.correct} / ${score.total}（${pct}%）` : `${score.correct} / ${score.total} correct (${pct}%)`}</p>
          {authed && (
            <p className="mt-1 text-sm font-bold text-emerald-600">{zh ? `本轮又掌握 ${justMastered} 个 · 还剩 ${remaining} / ${total}` : `+${justMastered} mastered · ${remaining} / ${total} left`}</p>
          )}
          {allMastered && (
            <p className="mt-2 text-sm font-bold text-amber-600">{zh ? `🎉 全部 ${total} 词已掌握一遍！` : `🎉 All ${total} words mastered!`}</p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={onExit} className="rounded-full border border-border px-5 py-2 text-sm font-bold">{zh ? "返回中心" : "Back to center"}</button>
            <button
              onClick={nextRound}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">

              <RotateCw className="size-4" /> {allMastered ? zh ? "再复习一组" : "Review again" : zh ? "继续下一轮" : "Next round"}
            </button>
          </div>
        </div>
      </main>);

  }

  const onPickAns = async (m: string) => {
    if (picked) return;
    setPicked(m);
    const correct = m === meaningForUi(cur, zh);
    // 本地连对镜像:答对 +1 / 答错清零(进度即时刷新,与 DB 写入一致)
    setLocalQuiz((prev) => {
      const next = new Map(prev);
      next.set(cur.id, correct ? (prev.get(cur.id) ?? 0) + 1 : 0);
      return next;
    });
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    speak(cur.word);
    if (correct) awardCoins(2, "junior_vocab_correct").catch(() => {});else
    notifyWrong();
    // ★铁律★ suppressGaokao(高中复用路径)→ 跳过 gaokao_user_mastery / cohort / unified,只写权威 junior_word_mastery。
    const [, , unifiedRes] = await Promise.all([
      suppressGaokao ? Promise.resolve() : recordCohortAttempt({
        vocabId: cur.id,
        isCorrect: correct,
        kind: "en2cn",
        source: "free_practice",
      }).catch((e) => logJuniorVocabSideEffect("recordCohortAttempt", e)),
      suppressGaokao ? Promise.resolve() : recordAttempt({
        questionType: "vocab",
        questionId: cur.id,
        userAnswer: m,
        isCorrect: correct,
      }).catch((e) => logJuniorVocabSideEffect("recordAttempt", e)),
      suppressGaokao ? Promise.resolve(null) : recordUnifiedAttempt({
        stage: "junior",
        grade: gradeNum,
        module: "vocab",
        item_type: "word",
        item_id: cur.id,
        item_label: cur.word,
        is_correct: correct,
        user_answer: m,
        correct_answer: meaningForUi(cur, zh),
      }),
      recordJuniorWordMastery({
        wordId: cur.id,
        grade: gradeNum,
        kind: "quiz",
        isCorrect: correct,
      }),
    ]);
    if (unifiedRes && !unifiedRes.success) {
      logJuniorVocabSideEffect("recordUnifiedAttempt", unifiedRes.reason ?? "failed");
    }
    setTimeout(() => {setPicked(null);setIdx((i) => i + 1);}, 900);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {zh ? "返回游戏中心" : "Back to games"}
      </button>
      {authed ? (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{zh ? `本游戏已掌握 ${masteredCount} / ${total}` : `Mastered ${masteredCount} / ${total}`}</span>
            <span>{zh ? `还剩 ${Math.max(0, total - masteredCount)}` : `${Math.max(0, total - masteredCount)} left`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${total ? Math.round((masteredCount / total) * 100) : 0}%` }} />
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          {zh ? "登录后可追踪掌握进度（连对 2 次掌握 · 已掌握的词不再重复出）" : "Log in to track mastery progress"}
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{zh ? `第 ${idx + 1} / ${queue.length} 题` : `Question ${idx + 1} / ${queue.length}`}</span>
          <span className="font-bold">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{zh ? "请选择正确的中文意思" : "Choose the correct meaning"}</div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-3xl font-black md:text-4xl">{cur.word}</span>
            <button onClick={() => speak(cur.word)} className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <Volume2 className="size-5" />
            </button>
          </div>
          {cur.phonetic && <div className="mt-1 font-mono text-sm text-muted-foreground">{cur.phonetic}</div>}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((m) => {
            const isCorrect = m === meaningForUi(cur, zh);
            const showRight = picked && isCorrect;
            const showWrong = picked === m && !isCorrect;
            return (
              <button
                key={m}
                onClick={() => onPickAns(m)}
                disabled={!!picked}
                className={cn(
                  "flex items-center justify-between rounded-2xl border-2 p-4 text-left text-sm font-bold transition",
                  showRight && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
                  showWrong && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
                  !picked && "border-border bg-card hover:border-primary/40",
                  picked && !showRight && !showWrong && "opacity-60"
                )}>
                
                <span>{m}</span>
                {showRight && <Check className="size-5" />}
                {showWrong && <X className="size-5" />}
              </button>);

          })}
        </div>
        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="size-3" /> {zh ? "答题数据已自动接入智能复习系统" : "Answers automatically feed the smart review system"}
        </div>
      </div>
    </main>);

}

/* -------------------- CONTEXT QUIZ 单词情景闯关 --------------------
   读句子(挖空)4 选 1。题库 context_questions(DB);掌握记在 word 原形上(context_consec)。 */
type CtxQ = { id: string; word: string; sentence: string; options: string[]; answer: string };

export function ContextQuiz({ pool, onExit, gradeNum, volume, publisher }: {pool: Vocab[];onExit: () => void;gradeNum: number;volume?: string;publisher?: string;}) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const BATCH = 10;

  const { loading: masteryLoading, authed, consec } = useJuniorVocabMastery(gradeNum);

  // 题库(DB)
  const [questions, setQuestions] = useState<CtxQ[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 高中按 grade+volume 过滤(防必修一/二/三同 grade 串库);初中不传 volume → 只按 grade(行为不变)。
      let q = supabase
        .from("context_questions")
        .select("id,word,sentence,options,answer")
        .eq("grade", gradeNum);
      if (volume) q = q.eq("volume", volume);
      if (publisher) q = q.eq("publisher", publisher); // 高中传 pep;初中不传 → 行为不变
      const { data } = await q.limit(2000);
      if (cancelled) return;
      const qs = (data ?? [])
        .map((r: any) => ({
          id: String(r.id), word: String(r.word), sentence: String(r.sentence),
          options: Array.isArray(r.options) ? r.options.map(String) : [],
          answer: String(r.answer),
        }))
        .filter((q) => q.options.length >= 2 && q.sentence && q.word);
      setQuestions(qs);
    })();
    return () => { cancelled = true; };
  }, [gradeNum, volume, publisher]);

  // word 原形(小写)→ junior_vocab id(记掌握用)
  const idByWord = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of pool) if (v.word) m.set(v.word.trim().toLowerCase(), v.id);
    return m;
  }, [pool]);

  // word 原形(小写)→ 中文释义(答题后展示)
  const meaningByWord = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of pool) if (v.word) m.set(v.word.trim().toLowerCase(), v.meaning_cn);
    return m;
  }, [pool]);

  // 题按 wid 分组(仅保留能映射到词表的题);universe = 有题的词
  const { byWid, universeWids } = useMemo(() => {
    const byWid = new Map<string, CtxQ[]>();
    for (const q of questions ?? []) {
      const wid = idByWord.get(q.word.trim().toLowerCase());
      if (!wid) continue;
      if (!byWid.has(wid)) byWid.set(wid, []);
      byWid.get(wid)!.push(q);
    }
    return { byWid, universeWids: [...byWid.keys()] };
  }, [questions, idByWord]);
  const total = universeWids.length;

  // 本地连对(wid → context_consec)
  const [localCtx, setLocalCtx] = useState<Map<string, number>>(new Map());
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (masteryLoading || questions === null) return;
    const m = new Map<string, number>();
    consec.forEach((c, id) => { if (c.context) m.set(id, c.context); });
    setLocalCtx(m);
    setSeeded(true);
  }, [masteryLoading, questions, consec]);

  const masteredCount = useMemo(
    () => universeWids.reduce((n, wid) => n + (((localCtx.get(wid) ?? 0) >= MASTER_STREAK) ? 1 : 0), 0),
    [universeWids, localCtx],
  );

  const buildBatch = useCallback((mastery: Map<string, number>): CtxQ[] => {
    const pri = (wid: string) => mastery.get(wid) ?? 0;
    // 差一次就掌握的(consec 高)优先出
    const unmastered = shuffle(universeWids.filter((wid) => pri(wid) < MASTER_STREAK)).sort((a, b) => pri(b) - pri(a));
    const mastered = universeWids.filter((wid) => pri(wid) >= MASTER_STREAK);
    const picked = unmastered.slice(0, BATCH);
    if (picked.length < BATCH) picked.push(...shuffle(mastered).slice(0, BATCH - picked.length));
    // 每个词随机取一题(同一词可能有多句)
    return picked.map((wid) => { const qs = byWid.get(wid)!; return qs[Math.floor(Math.random() * qs.length)]; });
  }, [universeWids, byWid]);

  const [queue, setQueue] = useState<CtxQ[]>([]);
  const [batchStartMastered, setBatchStartMastered] = useState(0);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!seeded || startedRef.current || universeWids.length === 0) return;
    startedRef.current = true;
    setBatchStartMastered(masteredCount);
    setQueue(buildBatch(localCtx));
  }, [seeded, universeWids.length, buildBatch, localCtx, masteredCount]);

  const cur = queue[idx];
  // P2 预热:本批答案词音频,键与 speak(cur.answer) 一致(默认音色)。答后自动读秒响。
  useEffect(() => { if (queue.length) prefetchTTSBatch(queue.map((q) => q.answer)); }, [queue]);
  const shownOptions = useMemo(() => (cur ? shuffle(cur.options) : []), [cur]);

  const nextRound = () => {
    setBatchStartMastered(masteredCount);
    setQueue(buildBatch(localCtx));
    setIdx(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
  };

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advance = () => {
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
    setPicked(null);
    setIdx((i) => i + 1);
  };
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  const onPickAns = async (opt: string) => {
    if (picked || !cur) return;
    setPicked(opt);
    const correct = opt === cur.answer;
    speak(cur.answer);
    const wid = idByWord.get(cur.word.trim().toLowerCase());
    if (wid) {
      setLocalCtx((prev) => { const m = new Map(prev); m.set(wid, correct ? (prev.get(wid) ?? 0) + 1 : 0); return m; });
    }
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) awardCoins(2, "junior_vocab_context").catch(() => {}); else notifyWrong();
    if (wid) void recordJuniorWordMastery({ wordId: wid, grade: gradeNum, kind: "context", isCorrect: correct });
    // 不立即跳:停留看反馈+释义,6 秒后自动进入(或点「下一个」手动进入)
    advanceTimer.current = setTimeout(advance, 6000);
  };

  if (masteryLoading || questions === null || !seeded) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (universeWids.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {zh ? "返回" : "Back"}
        </button>
        <p className="text-sm text-muted-foreground">{zh ? "暂无情景题" : "No context questions yet"}</p>
      </main>);

  }

  if (queue.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (queue.length > 0 && idx >= queue.length) {
    const pct = Math.round(score.correct / Math.max(1, score.total) * 100);
    if (typeof window !== "undefined" && !(queue as any).__rewarded) {
      (queue as any).__rewarded = true;
      awardCoins(pct === 100 ? 20 : 5, "junior_vocab_finish").catch(() => {});
      celebrateScore(pct);
    }
    const justMastered = Math.max(0, masteredCount - batchStartMastered);
    const remaining = Math.max(0, total - masteredCount);
    const allMastered = authed && remaining === 0;
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">{pct >= 90 ? zh ? "🌟 太棒了！" : "🌟 Great work!" : pct >= 70 ? zh ? "👍 不错！" : "👍 Nice job!" : zh ? "💪 继续加油！" : "💪 Keep going!"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{zh ? `答对 ${score.correct} / ${score.total}（${pct}%）` : `${score.correct} / ${score.total} correct (${pct}%)`}</p>
          {authed && (
            <p className="mt-1 text-sm font-bold text-emerald-600">{zh ? `本轮又掌握 ${justMastered} 个 · 还剩 ${remaining} / ${total}` : `+${justMastered} mastered · ${remaining} / ${total} left`}</p>
          )}
          {allMastered && (
            <p className="mt-2 text-sm font-bold text-amber-600">{zh ? `🎉 全部 ${total} 词已掌握一遍！` : `🎉 All ${total} words mastered!`}</p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={onExit} className="rounded-full border border-border px-5 py-2 text-sm font-bold">{zh ? "返回中心" : "Back to center"}</button>
            <button onClick={nextRound} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              <RotateCw className="size-4" /> {allMastered ? zh ? "再复习一组" : "Review again" : zh ? "继续下一轮" : "Next round"}
            </button>
          </div>
        </div>
      </main>);

  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {zh ? "返回游戏中心" : "Back to games"}
      </button>
      {authed ? (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{zh ? `本游戏已掌握 ${masteredCount} / ${total}` : `Mastered ${masteredCount} / ${total}`}</span>
            <span>{zh ? `还剩 ${Math.max(0, total - masteredCount)}` : `${Math.max(0, total - masteredCount)} left`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${total ? Math.round((masteredCount / total) * 100) : 0}%` }} />
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          {zh ? "登录后可追踪掌握进度（连对 2 次掌握 · 已掌握的词不再重复出）" : "Log in to track mastery progress"}
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{zh ? `第 ${idx + 1} / ${queue.length} 题` : `Question ${idx + 1} / ${queue.length}`}</span>
          <span className="font-bold">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6">
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{zh ? "读句子,选最合适的词" : "Pick the best word for the sentence"}</div>
          <p className="mt-3 text-base leading-relaxed text-foreground">{cur.sentence}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {shownOptions.map((opt) => {
            const isCorrect = opt === cur.answer;
            const showRight = picked && isCorrect;
            const showWrong = picked === opt && !isCorrect;
            return (
              <button
                key={opt}
                onClick={() => onPickAns(opt)}
                disabled={!!picked}
                className={cn(
                  "flex items-center justify-between rounded-2xl border-2 p-4 text-left text-base font-bold transition",
                  showRight && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
                  showWrong && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
                  !picked && "border-border bg-card hover:border-primary/40",
                  picked && !showRight && !showWrong && "opacity-60"
                )}>

                <span>{opt}</span>
                {showRight && <Check className="size-5" />}
                {showWrong && <X className="size-5" />}
              </button>);

          })}
        </div>
        {picked &&
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              {zh ? "正确答案:" : "Answer: "}{cur.answer}
              {meaningByWord.get(cur.word.trim().toLowerCase()) &&
                <span className="ml-1 font-normal text-muted-foreground">— {meaningByWord.get(cur.word.trim().toLowerCase())}</span>
              }
            </p>
            <button onClick={advance} className="mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground">
              {zh ? "下一个 →" : "Next →"}
            </button>
          </div>
        }
        {!picked &&
          <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <Sparkles className="size-3" /> {zh ? "连对 2 次即掌握该词,自动接入复习" : "Master a word with 2 correct in a row"}
          </div>
        }
      </div>
    </main>);

}

/* -------------------- MEMORY MATCH WRAPPER --------------------
   MemoryMatch 组件签名可能不同；用一个简化的本地实现保证可用 */
export function MemoryMatchWrapper({ pool, onExit, gradeNum }: {pool: Vocab[];onExit: () => void;gradeNum: number;}) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const PAIRS = 8;

  // 掌握度(记忆翻牌 match 连对2次=掌握,独立);登录加载,游客为空。
  const { loading: masteryLoading, authed, consec } = useJuniorVocabMastery(gradeNum);
  const valid = useMemo(() => pool.filter((v) => v.word && meaningForUi(v, zh)), [pool, zh]);
  const total = valid.length;

  // 本会话本地连对(镜像 DB,配对成功即时刷新进度)
  const [localMatch, setLocalMatch] = useState<Map<string, number>>(new Map());
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (masteryLoading) return;
    const m = new Map<string, number>();
    consec.forEach((c, id) => { if (c.match) m.set(id, c.match); });
    setLocalMatch(m);
    setSeeded(true);
  }, [masteryLoading, consec]);

  const masteredCount = useMemo(
    () => valid.reduce((n, w) => n + (((localMatch.get(w.id) ?? 0) >= MASTER_STREAK) ? 1 : 0), 0),
    [valid, localMatch],
  );

  const buildSample = useCallback((mastery: Map<string, number>): Vocab[] => {
    const pri = (w: Vocab) => mastery.get(w.id) ?? 0;
    // 差一次就掌握的(consec 高)优先出
    const unmastered = shuffle(valid.filter((w) => pri(w) < MASTER_STREAK)).sort((a, b) => pri(b) - pri(a));
    if (unmastered.length >= PAIRS) return unmastered.slice(0, PAIRS);
    const mastered = valid.filter((w) => pri(w) >= MASTER_STREAK);
    return [...unmastered, ...shuffle(mastered).slice(0, PAIRS - unmastered.length)];
  }, [valid]);

  const [sample, setSample] = useState<Vocab[]>([]);
  const [batchStartMastered, setBatchStartMastered] = useState(0);
  const [opened, setOpened] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);
  const startedRef = useRef(false);
  // P2 预热:本批(≤8对)词音频,键与 speak(卡面英文=word)一致(默认音色)。翻牌配对读音秒响。
  useEffect(() => { if (sample.length) prefetchTTSBatch(sample.map((v) => v.word)); }, [sample]);

  // 首批:掌握度就绪后只构建一次(优先未掌握词)
  useEffect(() => {
    if (!seeded || startedRef.current || valid.length === 0) return;
    startedRef.current = true;
    setBatchStartMastered(masteredCount);
    setSample(buildSample(localMatch));
  }, [seeded, valid.length, buildSample, localMatch, masteredCount]);

  const cards = useMemo(() => {
    const cs = sample.flatMap((v, i) => [
      { key: `${i}-en`, pairId: v.id, side: "en" as const, text: v.word },
      { key: `${i}-meaning`, pairId: v.id, side: "meaning" as const, text: meaningForUi(v, zh) },
    ]);
    return shuffle(cs);
  }, [sample, zh]);

  const onClick = (key: string, pairId: string) => {
    if (lock.current || matched.has(pairId) || opened.includes(key)) return;
    const next = [...opened, key];
    setOpened(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => cards.find((c) => c.key === k)!);
      if (a.pairId === b.pairId) {
        setMatched((s) => new Set(s).add(a.pairId));
        setOpened([]);
        speak(cards.find((c) => c.pairId === a.pairId && c.side === "en")!.text);
        awardCoins(3, "junior_match").catch((e) => logJuniorVocabSideEffect("awardCoins", e));
        // 本地连对镜像:配对成功 +1(记忆翻牌只在成功时计,不清零)
        setLocalMatch((prev) => {
          const nm = new Map(prev);
          nm.set(a.pairId, (prev.get(a.pairId) ?? 0) + 1);
          return nm;
        });
        void recordJuniorWordMastery({
          wordId: a.pairId,
          grade: gradeNum,
          kind: "match",
          isCorrect: true,
        });
      } else {
        lock.current = true;
        setTimeout(() => {setOpened([]);lock.current = false;}, 700);
      }
    }
    if (cards.find((c) => c.key === key)?.side === "en") {
      speak(cards.find((c) => c.key === key)!.text);
    }
  };

  const nextRound = () => {
    setBatchStartMastered(masteredCount);
    setSample(buildSample(localMatch));
    setOpened([]);
    setMatched(new Set());
    setMoves(0);
    lock.current = false;
  };

  if (masteryLoading || !seeded) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (valid.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {zh ? "返回" : "Back"}
        </button>
        <p className="text-sm text-muted-foreground">{zh ? "暂无可用单词" : "No words available"}</p>
      </main>);

  }

  if (sample.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  const done = matched.size === sample.length;
  const justMastered = Math.max(0, masteredCount - batchStartMastered);
  const remaining = Math.max(0, total - masteredCount);
  const allMastered = authed && remaining === 0;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {zh ? "返回游戏中心" : "Back to games"}
      </button>
      {authed ? (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{zh ? `本游戏已掌握 ${masteredCount} / ${total}` : `Mastered ${masteredCount} / ${total}`}</span>
            <span>{zh ? `还剩 ${remaining}` : `${remaining} left`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${total ? Math.round((masteredCount / total) * 100) : 0}%` }} />
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          {zh ? "登录后可追踪掌握进度（连对 2 次掌握 · 已掌握的词不再重复出）" : "Log in to track mastery progress"}
        </div>
      )}
      <h2 className="text-xl font-extrabold">🃏 {zh ? "记忆翻牌" : "Memory Match"}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{zh ? `配对 ${sample.length} 对单词与中文 · 已配对 ${matched.size}/${sample.length} · 步数 ${moves}` : `Match ${sample.length} word pairs · matched ${matched.size}/${sample.length} · moves ${moves}`}</p>
      <p className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm bg-gradient-to-br from-sky-500 to-blue-600" /> {zh ? "蓝 = 英文" : "Blue = English"}</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm bg-gradient-to-br from-amber-500 to-orange-600" /> {zh ? "橙 = 中文" : "Orange = Chinese"}</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm bg-emerald-400" /> {zh ? "绿 = 已配对" : "Green = matched"}</span>
      </p>

      {done ?
      <div className="mt-6 rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">{zh ? "完美通关！" : "Perfect clear!"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{zh ? `用了 ${moves} 步` : `${moves} moves`}</p>
          {authed && (
            <p className="mt-1 text-sm font-bold text-emerald-600">{zh ? `本轮又掌握 ${justMastered} 个 · 还剩 ${remaining} / ${total}` : `+${justMastered} mastered · ${remaining} / ${total} left`}</p>
          )}
          {allMastered && (
            <p className="mt-2 text-sm font-bold text-amber-600">{zh ? `🎉 全部 ${total} 词已掌握一遍！` : `🎉 All ${total} words mastered!`}</p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={onExit} className="rounded-full border border-border px-5 py-2 text-sm font-bold">{zh ? "返回中心" : "Back to center"}</button>
            <button onClick={nextRound} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              <RotateCw className="size-4" /> {allMastered ? zh ? "再复习一组" : "Review again" : zh ? "继续下一轮" : "Next round"}
            </button>
          </div>
        </div> :

      <div className="mt-4 grid grid-cols-4 gap-2">
          {cards.map((c) => {
          const isOpen = opened.includes(c.key) || matched.has(c.pairId);
          // 英文卡=蓝色系、中文卡=橙色系（盖着时也分色+标 EN/中），方便区分、避免瞎点同类卡
          const isEn = c.side === "en";
          return (
            <button
              key={c.key}
              onClick={() => onClick(c.key, c.pairId)}
              className={cn(
                "aspect-[3/4] rounded-xl border-2 p-2 text-center text-xs font-bold transition",
                matched.has(c.pairId) ? "border-emerald-400 bg-emerald-50 text-emerald-700 opacity-70 dark:bg-emerald-950/40" :
                isOpen ? (isEn
                  ? "border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-950/40"
                  : "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40") :
                isEn
                  ? "border-border bg-gradient-to-br from-sky-500 to-blue-600 text-white/90 hover:from-sky-400 hover:to-blue-500"
                  : "border-border bg-gradient-to-br from-amber-500 to-orange-600 text-white/90 hover:from-amber-400 hover:to-orange-500"
              )}>

                {isOpen ? c.text : (isEn ? "EN" : "中")}
              </button>);

        })}
        </div>
      }
    </main>);

}

/* -------------------- DICTATION -------------------- */
export function DictationSession({ pool, onExit, gradeNum, suppressGaokao = false }: {pool: Vocab[];onExit: () => void;gradeNum: number;suppressGaokao?: boolean;}) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const BATCH = 15;

  // 掌握度(听写 spell 连对2次=掌握,独立);登录加载,游客为空。
  const { loading: masteryLoading, authed, consec } = useJuniorVocabMastery(gradeNum);
  // 听写只测单个可拼写的词(排除含空格/斜杠的词组)
  const valid = useMemo(() => pool.filter((v) => v.word && !/[\/\s]/.test(v.word) && meaningForUi(v, zh)), [pool, zh]);
  const total = valid.length;

  // 本会话本地连对(镜像 DB,答对+1/答错清零,即时刷新进度)
  const [localSpell, setLocalSpell] = useState<Map<string, number>>(new Map());
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (masteryLoading) return;
    const m = new Map<string, number>();
    consec.forEach((c, id) => { if (c.spell) m.set(id, c.spell); });
    setLocalSpell(m);
    setSeeded(true);
  }, [masteryLoading, consec]);

  const masteredCount = useMemo(
    () => valid.reduce((n, w) => n + (((localSpell.get(w.id) ?? 0) >= MASTER_STREAK) ? 1 : 0), 0),
    [valid, localSpell],
  );

  const buildBatch = useCallback((mastery: Map<string, number>): Vocab[] => {
    const pri = (w: Vocab) => mastery.get(w.id) ?? 0;
    // 差一次就掌握的(consec 高)优先出,确保下一轮再现 → 能凑齐连对2次
    const unmastered = shuffle(valid.filter((w) => pri(w) < MASTER_STREAK)).sort((a, b) => pri(b) - pri(a));
    if (unmastered.length >= BATCH) return unmastered.slice(0, BATCH);
    const mastered = valid.filter((w) => pri(w) >= MASTER_STREAK);
    return [...unmastered, ...shuffle(mastered).slice(0, BATCH - unmastered.length)];
  }, [valid]);

  const [queue, setQueue] = useState<Vocab[]>([]);
  const [batchStartMastered, setBatchStartMastered] = useState(0);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"" | "right" | "wrong">("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);

  // 首批:掌握度就绪后只构建一次(优先未掌握词)
  useEffect(() => {
    if (!seeded || startedRef.current || valid.length === 0) return;
    startedRef.current = true;
    setBatchStartMastered(masteredCount);
    setQueue(buildBatch(localSpell));
  }, [seeded, valid.length, buildBatch, localSpell, masteredCount]);

  const cur = queue[idx];

  useEffect(() => {if (cur) speak(cur.word);}, [cur?.id]);
  // 预取整批音频(与 speak 同 voice/speed key)→ 后续每词秒播,消除发音延迟
  useEffect(() => { if (queue.length) prefetchTTSBatch(queue.map((w) => w.word)); }, [queue]);
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [idx]);

  const nextRound = () => {
    setBatchStartMastered(masteredCount);
    setQueue(buildBatch(localSpell));
    setIdx(0);
    setInput("");
    setFeedback("");
    setScore({ correct: 0, total: 0 });
  };

  if (masteryLoading || !seeded) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (valid.length === 0) return <main className="p-8"><p className="text-sm text-muted-foreground">{zh ? "暂无可用单词" : "No words available"}</p></main>;

  if (queue.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>);

  }

  if (queue.length > 0 && idx >= queue.length) {
    const pct = Math.round(score.correct / Math.max(1, score.total) * 100);
    if (typeof window !== "undefined" && !(queue as any).__rewarded) {
      (queue as any).__rewarded = true;
      celebrateScore(pct);
    }
    const justMastered = Math.max(0, masteredCount - batchStartMastered);
    const remaining = Math.max(0, total - masteredCount);
    const allMastered = authed && remaining === 0;
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Headphones className="mx-auto size-12 text-primary" />
          <h3 className="mt-2 text-xl font-extrabold">{zh ? "听写完成" : "Dictation complete"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{zh ? `${score.correct} / ${score.total}（${pct}%）` : `${score.correct} / ${score.total} correct (${pct}%)`}</p>
          {authed && (
            <p className="mt-1 text-sm font-bold text-emerald-600">{zh ? `本轮又掌握 ${justMastered} 个 · 还剩 ${remaining} / ${total}` : `+${justMastered} mastered · ${remaining} / ${total} left`}</p>
          )}
          {allMastered && (
            <p className="mt-2 text-sm font-bold text-amber-600">{zh ? `🎉 全部 ${total} 词已掌握一遍！` : `🎉 All ${total} words mastered!`}</p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={onExit} className="rounded-full border border-border px-5 py-2 text-sm font-bold">{zh ? "返回中心" : "Back to center"}</button>
            <button onClick={nextRound} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              <RotateCw className="size-4" /> {allMastered ? zh ? "再复习一组" : "Review again" : zh ? "继续下一轮" : "Next round"}
            </button>
          </div>
        </div>
      </main>);

  }

  const submit = async () => {
    if (feedback) return;
    const ok = canonSpelling(input) === canonSpelling(cur.word);
    setFeedback(ok ? "right" : "wrong");
    // 本地连对镜像:答对 +1 / 答错清零
    setLocalSpell((prev) => {
      const next = new Map(prev);
      next.set(cur.id, ok ? (prev.get(cur.id) ?? 0) + 1 : 0);
      return next;
    });
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) awardCoins(3, "junior_vocab_dict").catch(() => {});else
    notifyWrong();
    // ★铁律★ suppressGaokao(高中)→ 只写权威 junior_word_mastery,不碰 gaokao_user_mastery / cohort / unified。
    const [, , unifiedRes] = await Promise.all([
      suppressGaokao ? Promise.resolve() : recordCohortAttempt({
        vocabId: cur.id,
        isCorrect: ok,
        kind: "spell",
        source: "free_practice",
      }).catch((e) => logJuniorVocabSideEffect("recordCohortAttempt", e)),
      suppressGaokao ? Promise.resolve() : recordAttempt({
        questionType: "vocab",
        questionId: cur.id,
        userAnswer: input,
        isCorrect: ok,
      }).catch((e) => logJuniorVocabSideEffect("recordAttempt", e)),
      suppressGaokao ? Promise.resolve(null) : recordUnifiedAttempt({
        stage: "junior",
        grade: gradeNum,
        module: "vocab",
        item_type: "word",
        item_id: cur.id,
        item_label: cur.word,
        is_correct: ok,
        user_answer: input,
        correct_answer: cur.word,
      }),
      recordJuniorWordMastery({
        wordId: cur.id,
        grade: gradeNum,
        kind: "spell",
        isCorrect: ok,
      }),
    ]);
    if (unifiedRes && !unifiedRes.success) {
      logJuniorVocabSideEffect("recordUnifiedAttempt", unifiedRes.reason ?? "failed");
    }
    setTimeout(() => {setInput("");setFeedback("");setIdx((i) => i + 1);}, 1200);
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {zh ? "返回游戏中心" : "Back to games"}
      </button>
      {authed ? (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{zh ? `本游戏已掌握 ${masteredCount} / ${total}` : `Mastered ${masteredCount} / ${total}`}</span>
            <span>{zh ? `还剩 ${Math.max(0, total - masteredCount)}` : `${Math.max(0, total - masteredCount)} left`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${total ? Math.round((masteredCount / total) * 100) : 0}%` }} />
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          {zh ? "登录后可追踪掌握进度（连对 2 次掌握 · 已掌握的词不再重复出）" : "Log in to track mastery progress"}
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{zh ? `第 ${idx + 1} / ${queue.length}` : `${idx + 1} / ${queue.length}`}</span>
          <span className="font-bold">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
          <button onClick={() => speak(cur.word)} className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">
            <Volume2 className="size-7" />
          </button>
          <p className="mt-3 text-sm text-muted-foreground">{zh ? `中文：${cur.meaning_cn}` : meaningForUi(cur, zh)}</p>
        </div>
        <div className="space-y-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                submit();
              }
            }}
            disabled={!!feedback}
            placeholder={zh ? "拼写单词后回车" : "Type the spelling, then press Enter"}
            className={cn(
              "w-full rounded-2xl border-2 px-4 py-3 text-center text-lg font-extrabold tracking-wide outline-none transition",
              feedback === "right" && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
              feedback === "wrong" && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
              !feedback && "border-border bg-card focus:border-primary"
            )} />
          
          {feedback === "wrong" &&
          <p className="text-center text-xs font-bold text-rose-600">{zh ? `正确拼写：${cur.word}` : `Correct spelling: ${cur.word}`}</p>
          }
          <button onClick={submit} disabled={!!feedback || !input.trim()} className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {zh ? "提交" : "Submit"}
          </button>
        </div>
      </div>
    </main>);

}