import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Sparkles, Trophy, RotateCw, Zap, Brain, Headphones, Music, Keyboard, BarChart3, Crown, Clock, Flame, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { bumpVocabMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { awardCoins, notifyWrong } from "@/lib/coins";
import { cn } from "@/lib/utils";
import WordBento from "@/components/WordBento";
import WordQuest from "@/components/WordQuest";
import WordDuel from "@/components/WordDuel";
import MemoryMatch from "@/components/MemoryMatch";
import { useI18n } from "@/i18n/I18nProvider";

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
  theme: string | null;
  freq_rank: number | null;
};

type Mode = null | "classic" | "bento" | "quest" | "duel" | "match" | "dict" | "srs";
const GROUP_SIZE = 20;

const isChineseUi = (lang: string) => lang === "zh" || lang === "zh-TW";
const gradeLabel = (grade: number, zh: boolean) => zh ? `初${grade}` : `Grade ${grade + 6}`;
const meaningForUi = (word: Vocab, zh: boolean) => zh ? word.meaning_cn : (word.meaning_en || word.meaning_cn);
const secondaryMeaningForUi = (word: Vocab, zh: boolean) => zh ? word.meaning_en : word.meaning_cn;

export default function JuniorVocab() {
  const [params, setParams] = useSearchParams();
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const grade = params.get("grade") ?? "1";
  const mode = (params.get("mode") as Mode) ?? null;
  const groupParam = Number(params.get("group") ?? "0");

  const [words, setWords] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 入口可能传 1/2/3（初一/二/三 序号）或 7/8/9（Grade 7/8/9），统一映射到 7/8/9。
    const raw = Number(grade);
    const gradeNum = raw <= 3 ? raw + 6 : raw;
    // Grade 7 (初一) 使用专门导入的 junior_vocab 词库；其他年级暂时回退到 gaokao_vocab(stage=junior)
    const loader = gradeNum === 7
      ? supabase
          .from("junior_vocab")
          .select("id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,theme,freq_rank")
          .eq("grade", 7)
          .order("freq_rank", { ascending: true, nullsFirst: false })
          .limit(2000)
      : supabase
          .from("gaokao_vocab")
          .select("id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,theme,freq_rank")
          .eq("stage", "junior")
          .order("freq_rank", { ascending: true, nullsFirst: false })
          .limit(500);
    loader.then(({ data }) => {
      setWords((data ?? []) as Vocab[]);
      setLoading(false);
    });
  }, [grade]);

  const rawGrade = Number(grade);
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
    if (mode !== "srs") { setSrsPool(null); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSrsPool([]); return; }
      const { data } = await supabase
        .from("junior_word_mastery")
        .select("word_id,due_at")
        .eq("user_id", user.id)
        .lte("due_at", new Date().toISOString())
        .limit(200);
      const dueIds = new Set((data ?? []).map((r: any) => r.word_id));
      setSrsPool(words.filter((w) => dueIds.has(w.id)));
    })();
  }, [mode, words]);

  const exit = () => {
    const np = new URLSearchParams(params);
    np.delete("mode");
    setParams(np);
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> {zh ? "加载中…" : "Loading…"}
        </div>
      </main>
    );
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
        </main>
      );
    }
    return <ClassicQuiz pool={srsPool} onExit={exit} />;
  }
  if (mode === "bento") return <WordBento pool={activePool} onExit={exit} />;
  if (mode === "quest") return <WordQuest pool={activePool} onExit={exit} />;
  if (mode === "duel") return <WordDuel pool={activePool} onExit={exit} />;
  if (mode === "match") return <MemoryMatchWrapper pool={activePool} onExit={exit} />;
  if (mode === "dict") return <DictationSession pool={activePool} onExit={exit} />;
  if (mode === "classic") return <ClassicQuiz pool={activePool} onExit={exit} />;

  if (groupIdx >= 0 && groupIdx < groups.length) {
    return <JuniorWordGroup group={groups[groupIdx]} groupNumber={groupIdx + 1} grade={displayGrade} onExit={() => setParams({ grade })} onPractice={(m) => { const np = new URLSearchParams(params); np.set("mode", m); setParams(np); }} />;
  }

  return <JuniorVocabHub words={words} groups={groups} grade={displayGrade} gradeNum={rawGrade <= 3 ? rawGrade + 6 : rawGrade} onPick={(m) => { const np = new URLSearchParams(params); np.set("mode", m); setParams(np); }} onPickGroup={(i) => setParams({ grade, group: String(i + 1) })} />;
}

/* -------------------- HUB -------------------- */
type WordMasteryRow = { word_id: string; mastery_level: number | null; due_at: string | null; interval_days: number | null };
function JuniorVocabHub({ words, groups, grade, gradeNum, onPick, onPickGroup }: { words: Vocab[]; groups: Vocab[][]; grade: number; gradeNum: number; onPick: (m: Exclude<Mode, null>) => void; onPickGroup: (i: number) => void }) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);
  const levelName = gradeLabel(grade, zh);
  const [masteryMap, setMasteryMap] = useState<Map<string, WordMasteryRow>>(new Map());
  const [loadedMastery, setLoadedMastery] = useState(false);
  const games: { mode: Exclude<Mode, null>; icon: any; title: string; desc: string; gradient: string; badge?: string }[] = [
    { mode: "classic", icon: Brain, title: zh ? "智能选义" : "Smart meanings", desc: zh ? "听音辨义 · 自动接入复习曲线" : "Listen, choose meaning · feeds the review curve", gradient: "from-emerald-500 to-teal-500", badge: zh ? "推荐" : "Recommended" },
    { mode: "bento", icon: Sparkles, title: zh ? "单词便当" : "Word Bento", desc: zh ? "6×4 翻牌速配 · 训练反应力" : "6×4 fast matching · reaction training", gradient: "from-rose-500 to-orange-500" },
    { mode: "quest", icon: Trophy, title: zh ? "单词任务" : "Word Quest", desc: zh ? "每日 3 词 · 多关卡彻底掌握一个词" : "3 words a day · multi-stage mastery", gradient: "from-amber-500 to-yellow-500" },
    { mode: "duel", icon: Zap, title: zh ? "单词对决" : "Word Duel", desc: zh ? "60 秒高速答题 · 拼连击拿高分" : "60-second speed round · build combos", gradient: "from-fuchsia-500 to-pink-500" },
    { mode: "match", icon: Music, title: zh ? "记忆翻牌" : "Memory Match", desc: zh ? "图音中英匹配 · 经典训练法" : "Match words and meanings · classic drill", gradient: "from-sky-500 to-blue-500" },
    { mode: "dict", icon: Keyboard, title: zh ? "听写挑战" : "Dictation", desc: zh ? "听音拼词 · 锁定拼写细节" : "Hear it, spell it · lock in spelling", gradient: "from-violet-500 to-indigo-500" },
  ];

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || words.length === 0) { setLoadedMastery(true); return; }
      const { data } = await supabase
        .from("junior_word_mastery")
        .select("word_id,mastery_level,due_at,interval_days")
        .eq("user_id", user.id)
        .eq("grade", gradeNum)
        .limit(5000);
      const map = new Map<string, WordMasteryRow>();
      (data ?? []).forEach((r: any) => map.set(r.word_id, r));
      setMasteryMap(map);
      setLoadedMastery(true);
    })();
  }, [words, gradeNum]);

  // Aggregate stats
  const now = Date.now();
  let mastered = 0, studied = 0, dueCount = 0, intervalSum = 0, intervalN = 0;
  masteryMap.forEach((r) => {
    studied += 1;
    if ((r.mastery_level ?? 0) >= 4) mastered += 1;
    if (r.due_at && new Date(r.due_at).getTime() <= now) dueCount += 1;
    if (r.interval_days && r.interval_days > 0) { intervalSum += r.interval_days; intervalN += 1; }
  });
  const total = words.length;
  const masteredPct = total > 0 ? Math.round((mastered / total) * 1000) / 10 : 0;
  const studiedPct = total > 0 ? Math.round((studied / total) * 1000) / 10 : 0;
  const avgStability = intervalN > 0 ? intervalSum / intervalN : 0;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={`/junior/g/${grade}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {zh ? `返回初${grade}` : `Back to ${levelName}`}
      </BackLink>

      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">CORE VOCABULARY · {levelName}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">{zh ? `初${grade}核心词汇` : `${levelName} Core Vocabulary`}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{zh ? `中考新课标 · 共 ${words.length} 词 · 按 20 词一组系统学习` : `Junior curriculum · ${words.length} words · 20 words per group`}</p>
      </div>

      {/* 学习进度总览（高考同款风格，复用 junior_word_mastery） */}
      <section className="mb-5 rounded-2xl bg-card p-4 shadow-tile">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-fuchsia-600" />
            <h3 className="text-sm font-bold text-foreground">{zh ? "我的词汇掌握度" : "My vocabulary mastery"}</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">{zh ? "FSRS 遗忘曲线 · 多维评判" : "FSRS review curve · multi-signal scoring"}</span>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <div className="text-3xl font-extrabold leading-none text-fuchsia-600">{mastered.toLocaleString()}</div>
          <div className="pb-1 text-xs text-muted-foreground">/ {total.toLocaleString()} {zh ? `词彻底掌握 (${masteredPct}%)` : `words mastered (${masteredPct}%)`}</div>
        </div>
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500" style={{ width: `${total ? (mastered / total) * 100 : 0}%` }} />
          <div className="bg-gradient-to-r from-amber-400 to-orange-400" style={{ width: `${total ? (Math.max(0, studied - mastered) / total) * 100 : 0}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-fuchsia-500" /> {zh ? "掌握" : "Mastered"} {masteredPct}%</span>
          <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-amber-400" /> {zh ? "学习中" : "Learning"} {Math.max(0, Math.round((studiedPct - masteredPct) * 10) / 10)}%</span>
          <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-muted-foreground/30" /> {zh ? "未开始" : "Not started"} {Math.max(0, Math.round((100 - studiedPct) * 10) / 10)}%</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <MiniStat icon={<Crown className="size-3.5" />} label={zh ? "👑 掌握" : "👑 Mastered"} value={mastered} tone="from-fuchsia-500 to-pink-500" />
          <MiniStat icon={<Sparkles className="size-3.5" />} label={zh ? "🌟 学习中" : "🌟 Learning"} value={Math.max(0, studied - mastered)} tone="from-amber-400 to-orange-500" />
          <MiniStat icon={<Clock className="size-3.5" />} label={zh ? "⏰ 待复习" : "⏰ Due"} value={dueCount} tone="from-blue-500 to-indigo-600" />
          <MiniStat icon={<Flame className="size-3.5" />} label={zh ? "📈 平均稳定" : "📈 Avg stability"} value={Math.round(avgStability * 10) / 10} tone="from-emerald-500 to-teal-500" hint={zh ? "天" : "d"} />
        </div>
      </section>

      {/* SRS 智能复习入口（高考同款） */}
      <button
        onClick={() => onPick("srs")}
        disabled={dueCount === 0}
        className={cn(
          "mb-5 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          dueCount > 0 ? "border-primary bg-gradient-to-br from-primary/15 via-primary/5 to-transparent hover:border-primary"
                       : "border-border bg-muted/30 opacity-70 cursor-not-allowed",
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", dueCount > 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
            <Brain className="size-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">🧠 {zh ? "智能复习" : "Smart review"}</span>
              {dueCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                  <Flame className="size-3" /> {zh ? `今日 ${dueCount} 词待复习` : `${dueCount} due today`}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {!loadedMastery ? (zh ? "加载中…" : "Loading…") : dueCount === 0
                ? studied === 0 ? (zh ? "先学一组单词，系统会按艾宾浩斯曲线安排复习" : "Study one group first; reviews will be scheduled automatically")
                                : (zh ? `已学 ${studied} 词 · 今日没有到期单词，明天再来` : `${studied} words studied · nothing due today`)
                : (zh ? `已学 ${studied} 词 · SM-2 算法 · 答错重学，答对延后` : `${studied} words studied · SM-2 schedule · wrong answers come back sooner`)}
            </div>
          </div>
          {dueCount > 0 && <ChevronRight className="size-5 text-primary" />}
        </div>
      </button>

      <section className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold">单词清单</h2>
            <p className="text-xs text-muted-foreground">和高中一样，先按清单逐组学习，再进入游戏强化。</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">{groups.length} 组</span>
        </div>
        <div className="grid gap-2">
          {groups.map((group, i) => {
            let gMastered = 0, gDue = 0, gTouched = 0;
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
                allMastered ? "border-fuchsia-400/60" : "border-border/60",
              )}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold">第 {i + 1} 组</span>
                      <span className="text-[11px] text-muted-foreground">{group.length} 词</span>
                      {allMastered && <span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-bold text-fuchsia-600">👑 全部掌握</span>}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">{group.slice(0, 5).map((w) => w.word).join(" · ")}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-600">
                        <Crown className="size-3" /> 已掌握 {gMastered}
                      </span>
                      {gDue > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                          <Clock className="size-3" /> 待复习 {gDue}
                        </span>
                      )}
                      {gTouched < group.length && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          未学 {group.length - gTouched}
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
      </section>

      <div className="mb-3 mt-4 flex items-end justify-between">
        <h2 className="text-base font-extrabold">辅助训练</h2>
        <span className="text-[11px] text-muted-foreground">6 种游戏 · 全部接入复习曲线</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.mode}
              onClick={() => onPick(g.mode)}
              className={cn(
                "relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5",
                g.gradient,
              )}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-5" />
              </div>
              <div className="relative flex-1 min-w-0">
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

      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <BarChart3 className="size-4 text-primary" /> 全部游戏数据自动接入智能复习
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>答对：金币 +2，宠物经验自动累计</li>
          <li>答错：自动进错题本，下次优先复习</li>
          <li>每天通过任意 3 个游戏即可深度记住一组单词</li>
        </ul>
      </div>
    </main>
  );
}

function MiniStat({ icon, label, value, tone, hint }: { icon: React.ReactNode; label: string; value: number; tone: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-2 text-center">
      <div className={`mx-auto flex size-7 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white`}>{icon}</div>
      <div className="mt-1 text-base font-extrabold leading-none text-foreground">{value.toLocaleString()}{hint && <span className="ml-0.5 text-[9px] font-bold text-muted-foreground">{hint}</span>}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function JuniorWordGroup({ group, groupNumber, grade, onExit, onPractice }: { group: Vocab[]; groupNumber: number; grade: number; onExit: () => void; onPractice: (m: Exclude<Mode, null>) => void }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回初{grade}单词清单
      </button>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">CORE VOCABULARY · GROUP {groupNumber}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">第 {groupNumber} 组单词</h1>
        <p className="mt-1 text-xs text-muted-foreground">先看清单理解词义，再选择练习模式强化记忆。</p>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["classic", "bento", "match", "dict"] as Exclude<Mode, null>[]).map((m) => (
          <button key={m} onClick={() => onPractice(m)} className="rounded-2xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90">
            {m === "classic" ? "智能选义" : m === "bento" ? "单词便当" : m === "match" ? "记忆翻牌" : "听写挑战"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {group.map((w, i) => (
          <article key={w.id} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">{(groupNumber - 1) * GROUP_SIZE + i + 1}</span>
                  <h2 className="text-xl font-black text-foreground">{w.word}</h2>
                  {w.phonetic && <span className="font-mono text-xs text-muted-foreground">{w.phonetic}</span>}
                  {w.pos && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{w.pos}</span>}
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{w.meaning_cn}</p>
                {w.meaning_en && <p className="mt-0.5 text-xs text-muted-foreground">{w.meaning_en}</p>}
              </div>
              <button onClick={() => speak(w.word)} className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-label={`播放 ${w.word}`}>
                <Volume2 className="size-4" />
              </button>
            </div>
            {w.example_en && <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground">{w.example_en}</p>}
            {w.example_cn && <p className="mt-1 px-3 text-xs text-muted-foreground">{w.example_cn}</p>}
          </article>
        ))}
      </div>
    </main>
  );
}

/* -------------------- CLASSIC QUIZ -------------------- */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ClassicQuiz({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const queue = useMemo(() => shuffle(pool).slice(0, 20), [pool]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const cur = queue[idx];

  const options = useMemo(() => {
    if (!cur) return [];
    const distractors = shuffle(pool.filter((w) => w.id !== cur.id))
      .slice(0, 3)
      .map((w) => w.meaning_cn);
    return shuffle([cur.meaning_cn, ...distractors]);
  }, [cur, pool]);

  if (!cur) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <p className="text-sm text-muted-foreground">暂无可用单词</p>
      </main>
    );
  }

  if (idx >= queue.length) {
    const pct = Math.round((score.correct / Math.max(1, score.total)) * 100);
    if (typeof window !== "undefined" && !(queue as any).__rewarded) {
      (queue as any).__rewarded = true;
      const bonus = pct === 100 ? 20 : 5;
      awardCoins(bonus, "junior_vocab_finish").catch(() => {});
    }
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">{pct >= 90 ? "🌟 太棒了！" : pct >= 70 ? "👍 不错！" : "💪 继续加油！"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">答对 {score.correct} / {score.total}（{pct}%）</p>
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={onExit} className="rounded-full border border-border px-5 py-2 text-sm font-bold">返回中心</button>
            <button
              onClick={() => { (queue as any).__rewarded = false; setIdx(0); setPicked(null); setScore({ correct: 0, total: 0 }); }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
            >
              <RotateCw className="size-4" /> 再来一组
            </button>
          </div>
        </div>
      </main>
    );
  }

  const onPickAns = async (m: string) => {
    if (picked) return;
    setPicked(m);
    const correct = m === cur.meaning_cn;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    speak(cur.word);
    if (correct) awardCoins(2, "junior_vocab_correct").catch(() => {});
    else notifyWrong();
    await Promise.all([
      bumpVocabMastery({ vocabId: cur.id, isCorrect: correct, kind: "en2cn" }).catch(() => {}),
      recordAttempt({ questionType: "vocab", questionId: cur.id, userAnswer: m, isCorrect: correct }).catch(() => {}),
    ]);
    setTimeout(() => { setPicked(null); setIdx((i) => i + 1); }, 900);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回游戏中心
      </button>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>第 {idx + 1} / {queue.length} 题</span>
          <span className="font-bold">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">请选择正确的中文意思</div>
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
            const isCorrect = m === cur.meaning_cn;
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
                  picked && !showRight && !showWrong && "opacity-60",
                )}
              >
                <span>{m}</span>
                {showRight && <Check className="size-5" />}
                {showWrong && <X className="size-5" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="size-3" /> 答题数据已自动接入智能复习系统
        </div>
      </div>
    </main>
  );
}

/* -------------------- MEMORY MATCH WRAPPER --------------------
   MemoryMatch 组件签名可能不同；用一个简化的本地实现保证可用 */
function MemoryMatchWrapper({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const PAIRS = 8;
  const initial = useMemo(() => {
    const sample = shuffle(pool.filter((v) => v.word && v.meaning_cn)).slice(0, PAIRS);
    const cards = sample.flatMap((v, i) => [
      { key: `${i}-en`, pairId: v.id, side: "en" as const, text: v.word },
      { key: `${i}-cn`, pairId: v.id, side: "cn" as const, text: v.meaning_cn },
    ]);
    return shuffle(cards);
  }, [pool]);

  const [cards] = useState(initial);
  const [opened, setOpened] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);

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
        awardCoins(3, "junior_match").catch(() => {});
      } else {
        lock.current = true;
        setTimeout(() => { setOpened([]); lock.current = false; }, 700);
      }
    }
    if (cards.find((c) => c.key === key)?.side === "en") {
      speak(cards.find((c) => c.key === key)!.text);
    }
  };

  const done = matched.size === PAIRS;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回游戏中心
      </button>
      <h2 className="text-xl font-extrabold">🃏 记忆翻牌</h2>
      <p className="mt-1 text-xs text-muted-foreground">配对 {PAIRS} 对单词与中文 · 已配对 {matched.size}/{PAIRS} · 步数 {moves}</p>

      {done ? (
        <div className="mt-6 rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">完美通关！</h3>
          <p className="mt-1 text-sm text-muted-foreground">用了 {moves} 步</p>
          <button onClick={onExit} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">返回</button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {cards.map((c) => {
            const isOpen = opened.includes(c.key) || matched.has(c.pairId);
            return (
              <button
                key={c.key}
                onClick={() => onClick(c.key, c.pairId)}
                className={cn(
                  "aspect-[3/4] rounded-xl border-2 p-2 text-center text-xs font-bold transition",
                  matched.has(c.pairId) ? "border-emerald-400 bg-emerald-50 text-emerald-700 opacity-70 dark:bg-emerald-950/40"
                    : isOpen ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-gradient-to-br from-violet-500 to-indigo-600 text-transparent hover:from-violet-400 hover:to-indigo-500",
                )}
              >
                {isOpen ? c.text : "?"}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}

/* -------------------- DICTATION -------------------- */
function DictationSession({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const queue = useMemo(() => shuffle(pool.filter((v) => v.word && !/[\/\s]/.test(v.word))).slice(0, 15), [pool]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"" | "right" | "wrong">("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const cur = queue[idx];

  useEffect(() => { if (cur) speak(cur.word); }, [cur?.id]);

  if (!cur) return <main className="p-8"><p className="text-sm text-muted-foreground">暂无可用单词</p></main>;

  if (idx >= queue.length) {
    const pct = Math.round((score.correct / Math.max(1, score.total)) * 100);
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Headphones className="mx-auto size-12 text-primary" />
          <h3 className="mt-2 text-xl font-extrabold">听写完成</h3>
          <p className="mt-1 text-sm text-muted-foreground">{score.correct} / {score.total}（{pct}%）</p>
          <button onClick={onExit} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">返回中心</button>
        </div>
      </main>
    );
  }

  const submit = async () => {
    if (feedback) return;
    const ok = input.trim().toLowerCase() === cur.word.trim().toLowerCase();
    setFeedback(ok ? "right" : "wrong");
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) awardCoins(3, "junior_vocab_dict").catch(() => {});
    else notifyWrong();
    await Promise.all([
      bumpVocabMastery({ vocabId: cur.id, isCorrect: ok, kind: "spell" }).catch(() => {}),
      recordAttempt({ questionType: "vocab", questionId: cur.id, userAnswer: input, isCorrect: ok }).catch(() => {}),
    ]);
    setTimeout(() => { setInput(""); setFeedback(""); setIdx((i) => i + 1); }, 1200);
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回游戏中心
      </button>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>第 {idx + 1} / {queue.length}</span>
          <span className="font-bold">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
          <button onClick={() => speak(cur.word)} className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">
            <Volume2 className="size-7" />
          </button>
          <p className="mt-3 text-sm text-muted-foreground">中文：{cur.meaning_cn}</p>
        </div>
        <div className="space-y-2">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            disabled={!!feedback}
            placeholder="拼写单词后回车"
            className={cn(
              "w-full rounded-2xl border-2 px-4 py-3 text-center text-lg font-extrabold tracking-wide outline-none transition",
              feedback === "right" && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
              feedback === "wrong" && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
              !feedback && "border-border bg-card focus:border-primary",
            )}
          />
          {feedback === "wrong" && (
            <p className="text-center text-xs font-bold text-rose-600">正确拼写：{cur.word}</p>
          )}
          <button onClick={submit} disabled={!!feedback || !input.trim()} className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
            提交
          </button>
        </div>
      </div>
    </main>
  );
}
