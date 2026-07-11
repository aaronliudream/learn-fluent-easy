import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, Sparkles, Volume2, Play, Star, Search,
  BookOpen, AlertCircle, Filter, Trophy, MessageCircleQuestion, Wand2, X, RotateCw } from
"lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { speak as speakTTS, speakFromUrl, stopSpeaking } from "@/lib/speak";
import { getAlexVoice } from "@/lib/alexVoice";
import { bumpMistakeCorrect, bjToday, bjDateTime, type StreakResult } from "@/lib/mistakeStreak";
import { toast } from "sonner";
import TutorChat from "@/components/tutor/TutorChat";

type Mistake = {
  id: string;
  module: string;
  source_key: string;
  source_label: string | null;
  question: string;
  user_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  snapshot: any;
  wrong_count: number;
  is_resolved: boolean;
  is_starred: boolean;
  correct_streak?: number;
  last_correct_date?: string | null;
  last_wrong_at: string;
  next_review_at: string;
};

type ModuleKey = "all" | "due" | "starred" | "topics" | "ai_talk_target" | "ai_talk";

const MODULE_META: Record<string, {label: string;emoji: string;color: string;}> = {
  ai_talk_target: { label: "Alex 教你的", emoji: "✨", color: "from-amber-400 to-orange-500" },
  ai_talk: { label: "对话错题", emoji: "💬", color: "from-sky-400 to-blue-500" },
  vocab: { label: "词汇错题", emoji: "📚", color: "from-violet-400 to-purple-500" },
  reading: { label: "阅读错题", emoji: "📖", color: "from-emerald-400 to-green-500" },
  grammar: { label: "语法错题", emoji: "🔤", color: "from-rose-400 to-pink-500" },
  senior_grammar: { label: "语法错题", emoji: "🔤", color: "from-rose-400 to-pink-500" },
  hub_reading: { label: "闯关阅读", emoji: "📖", color: "from-emerald-400 to-green-500" },
  hub_listening: { label: "听力错题", emoji: "🎧", color: "from-sky-400 to-blue-500" },
  senior_cloze: { label: "完形错题", emoji: "🧩", color: "from-amber-400 to-orange-500" },
  junior_cloze: { label: "完形错题", emoji: "🧩", color: "from-amber-400 to-orange-500" },
  american_scenario: { label: "情景应答", emoji: "💬", color: "from-teal-400 to-cyan-500" }
};

const moduleMeta = (m: string) =>
MODULE_META[m] || { label: m, emoji: "📌", color: "from-slate-400 to-slate-600" };

// 从错题 snapshot 取「全部选项」(A/B/C/D):语法单题 = snapshot.options{A..D}。
// 返回按字母序、过滤空项的 [字母, 文本] 列表;无则空数组。静态展示与重做弹窗共用。
type OptionPair = [string, string];
function optionPairs(m: Mistake): OptionPair[] {
  const opts = m.snapshot?.options;
  if (!opts || typeof opts !== "object") return [];
  return (Object.entries(opts) as [string, unknown][]).
  filter(([, v]) => v != null && String(v).trim() !== "").
  map(([k, v]) => [k, String(v)] as OptionPair).
  sort(([a], [b]) => a.localeCompare(b));
}

// 冻结的正确答案(顶层优先,兼容 snapshot.correct_answer)。
function frozenCorrect(m: Mistake): string {
  return String(m.correct_answer ?? m.snapshot?.correct_answer ?? "").trim();
}

// v1「就地重做」仅支持:有 ≥2 个确定选项、且正确答案命中某选项字母的语法选择题。
// 开放/AI 批改题(无唯一字母答案)、薄行(词汇/听力,无 options)自动排除 → 置灰不显示重做。
function isRedoable(m: Mistake): boolean {
  const pairs = optionPairs(m);
  if (pairs.length < 2) return false;
  const ca = frozenCorrect(m);
  return pairs.some(([L]) => L === ca);
}

// 开放题(美语情景应答/句型转换):snapshot.question_type==="open" —— 无选项、靠自评,
// 重做 = 看参考答案后自评「我会了」1 次即移出(豁免跨3天连对)。
function isOpen(m: Mistake): boolean {
  return m.snapshot?.question_type === "open";
}

const MistakesPage = () => {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [items, setItems] = useState<Mistake[]>([]);
  const [tab, setTab] = useState<ModuleKey>("all");
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [tutorFor, setTutorFor] = useState<Mistake | null>(null);
  const [aiFor, setAiFor] = useState<Mistake | null>(null);
  const [redoFor, setRedoFor] = useState<Mistake | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) { setSignedIn(false); return; }
        setSignedIn(true);
        // ⚠️ 顺序铁律:.select() 必须在过滤器(.not/.eq/...)之前——.not 在 FilterBuilder 上,
        // 放到 .from() 后、.select() 前会运行时报错(from() 返回的 QueryBuilder 无 .not),
        // 且本段若抛错会卡住 loading。故 select 先行 + 整段 try/catch/finally 兜底。
        const { data, error } = await supabase.
        from("user_mistakes").
        select("*").
        eq("is_resolved", false).
        // 隐藏 edge 写的薄记录(听力/高中完形):已被 hub_listening / senior_cloze 完整快照取代。
        // vocab:词汇任何学段都不进错题本(全局铁律)→ DB 层先滤掉。
        not("module", "in", "(listening,cloze,vocab)").
        order("next_review_at", { ascending: true }).
        limit(500);
        if (cancelled) return;
        if (error) toast.error(error.message);
        // 阅读:同一篇会同时产生两类行——① pick() 每错一题经 edge 写的「薄行」
        // (module=reading、无 snapshot、source_label=篇名,题干/选项全空);② handleSubmit
        // 直写的「整篇完整快照行」(source_key ..._reading_passage_...,snapshot.questions[] 全)。
        // 薄行会让一篇冒出一堆题干/选项空白、只剩"正确答案/你选的"的重复卡片。此处按内容过滤,
        // 只保留有 snapshot.questions 的整篇行——与老师端 get_student_mistakes 源3A 同口径
        // (source_key like '%_reading_passage_%')。非阅读模块不受影响。
        const rows = (data as Mistake[] || []).filter((m) => {
          // ④ 小学错题不进统一错题本:module 前缀 primary_(primary_lesson/chat_quiz/reading)全滤掉。
          //   (vocab 已在 DB 层滤;小学听力走 module=listening 也已滤。)
          if (m.module.startsWith("primary_")) return false;
          // 阅读:只留有 snapshot.questions 的整篇行,edge 写的薄行滤掉(镜像老师端源3A)。
          return m.module === "reading" ?
          Array.isArray(m.snapshot?.questions) && m.snapshot.questions.length > 0 :
          true;
        });
        setItems(rows);
      } catch (e) {
        if (!cancelled) console.warn("[mistakes] load failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {cancelled = true;stopSpeaking();};
  }, []);

  // Counts per tab
  const counts = useMemo(() => {
    const now = Date.now();
    return {
      all: items.length,
      due: items.filter((i) => new Date(i.next_review_at).getTime() <= now).length,
      starred: items.filter((i) => i.is_starred).length
    };
  }, [items]);

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = items;
    if (tab === "due") list = list.filter((i) => new Date(i.next_review_at).getTime() <= now);else
    if (tab === "starred") list = list.filter((i) => i.is_starred);else
    if (tab !== "all") list = list.filter((i) => i.module === tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
      (i.question + " " + (i.correct_answer || "") + " " + (i.source_label || "")).
      toLowerCase().
      includes(q)
      );
    }
    // 显示层排序:未攻克(correct_streak=0,含无 streak 的开放题)浮顶、巩固中(≥1)沉底;
    // 同档内维持现有次序(last_wrong_at 新→旧)——JS sort 稳定,只按"是否≥1"分两档。
    const bucket = (m: Mistake) => ((m.correct_streak ?? 0) >= 1 ? 1 : 0);
    return [...list].sort((a, b) => bucket(a) - bucket(b));
  }, [items, tab, search]);

  const toggleStar = async (m: Mistake) => {
    const next = !m.is_starred;
    setItems((prev) => prev.map((x) => x.id === m.id ? { ...x, is_starred: next } : x));
    await supabase.from("user_mistakes").update({ is_starred: next }).eq("id", m.id);
  };

  // MCQ 重做做对 → 跨3天连对累计。streak>=3 才移出;返回结果供弹窗显示。
  // (开放题走 handleOpenResolve:自评「我会了」1 次直接移出,豁免 streak。)
  const handleRedoCorrect = async (m: Mistake): Promise<StreakResult | null> => {
    const res = await bumpMistakeCorrect(m.module, m.source_key);
    if (!res) return null;
    if (res.is_resolved) {
      const wasLast = items.length <= 1;
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      // 彻底攻克(跨3天连对)——给 3 星币 + 宠物开心反应 + 撒花
      try {
        const c = await import("@/lib/coins");
        await c.awardCoins(3, "mistake_resolved");
        c.petReact("happy", { coins: 3 });
      } catch {/* noop */}
      import("@/lib/feedback").then((f) => f.fireEmojiConfetti({ count: 60, vibrate: true }));
      if (wasLast) toast.success("🎉 错题本清空！", { description: "跨 3 天连对，全部攻克！" });
    } else if (!res.already_today) {
      // 连对 +1(未满 3)→ 更新卡片进度
      setItems((prev) => prev.map((x) => x.id === m.id
        ? { ...x, correct_streak: res.correct_streak, last_correct_date: bjToday() }
        : x));
    }
    return res;
  };

  // 开放题重做「我会了」→ 1 次直接移出(is_resolved=true,不走 streak)。
  const handleOpenResolve = async (m: Mistake) => {
    const wasLast = items.length <= 1;
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    await supabase.from("user_mistakes")
      .update({ is_resolved: true, updated_at: new Date().toISOString() }).eq("id", m.id);
    try {
      const c = await import("@/lib/coins");
      await c.awardCoins(3, "mistake_resolved");
      c.petReact("happy", { coins: 3 });
    } catch {/* noop */}
    import("@/lib/feedback").then((f) => f.fireEmojiConfetti({ count: 60, vibrate: true }));
    if (wasLast) toast.success("🎉 错题本清空！", { description: "已全部攻克!" });
    else toast.success("已掌握 ✨", { description: "情景应答攻克,移出错题本" });
  };

  const playPhrase = async (m: Mistake) => {
    // For target words: play the example sentence with Alex voice.
    // For other mistakes: play the correct_answer (English) if it looks like English.
    // 听力优先播真音频文件(snapshot.audio_url,如初中听力);无则朗读文本(TTS 现场合成)。
    const audioUrl = m.snapshot?.audio_url as string | undefined;
    const text = m.module === "ai_talk_target" ?
    m.snapshot?.alex_used_sentence || m.snapshot?.example_en || m.snapshot?.phrase || "" :
    m.snapshot?.audio || m.snapshot?.source_sentence || m.snapshot?.phrase || "";
    if (!audioUrl && !text) {toast.info("没有可朗读的内容");return;}
    setPlayingId(m.id);
    try {
      if (audioUrl) await speakFromUrl(audioUrl);
      else await speakTTS(text, { voiceId: getAlexVoice() });
    } catch {/* noop */}
    setPlayingId((cur) => cur === m.id ? null : cur);
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader title="📒 错题本" subtitle="所有错题按记忆曲线安排复习" back />

      {loading &&
      <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> <T>加载中…</T>
        </div>
      }

      {!loading && signedIn === false &&
      <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="size-7" />
          </div>
          <p className="text-sm text-muted-foreground"><T>登录后即可同步你的错题本</T></p>
          <Link to="/auth" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
            <T>去登录</T>
          </Link>
        </div>
      }

      {!loading && signedIn &&
      <>
          {/* Stats strip */}
          <section className="mb-5 grid grid-cols-3 gap-3 md:grid-cols-5">
            <StatCard label="待复习" value={counts.due} emoji="⏰" highlight />
            <StatCard label="全部" value={counts.all} emoji="📒" />
            <StatCard label="已收藏" value={counts.starred} emoji="⭐" />
          </section>

          {/* Tabs */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {[
          { k: "all" as const, label: "全部", n: counts.all },
          { k: "due" as const, label: "今日复习", n: counts.due },
          { k: "topics" as const, label: "📂 专题分组", n: counts.all },
          { k: "starred" as const, label: "⭐ 收藏", n: counts.starred }].
          map(({ k, label, n }) =>
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            tab === k ?
            "bg-primary text-primary-foreground shadow" :
            "bg-card text-foreground/70 ring-1 ring-border hover:bg-secondary"}`
            }>
            
                <T>{label}</T>
                <span className={`rounded-full px-1.5 text-[11px] font-bold ${tab === k ? "bg-white/25" : "bg-secondary text-foreground/60"}`}>
                  {n}
                </span>
              </button>
          )}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索单词、句子、话题…"
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-2.5 text-sm outline-none ring-primary/30 transition focus:ring-2" />
          
          </div>

          {tab === "topics" ?
        <TopicGroups items={items} onPick={(m) => setTab(m as ModuleKey)} /> :
        filtered.length === 0 ?
        <EmptyState tab={tab} /> :

        <ul className="space-y-3">
              {filtered.map((m) =>
          <MistakeCard
            key={m.id}
            m={m}
            playing={playingId === m.id}
            onPlay={() => playPhrase(m)}
            onStar={() => toggleStar(m)}
            onAskTutor={() => setTutorFor(m)}
            onRedo={(isRedoable(m) || isOpen(m)) ? () => setRedoFor(m) : undefined} />

          )}
            </ul>
        }
        </>
      }

      {tutorFor &&
      <TutorChat
        context="mistakes"
        questionRef={tutorFor.id}
        questionSnapshot={{
          module: tutorFor.module,
          source: tutorFor.source_label,
          question: tutorFor.question,
          user_answer: tutorFor.user_answer,
          correct_answer: tutorFor.correct_answer,
          explanation: tutorFor.explanation,
          extra: tutorFor.snapshot
        }}
        open={!!tutorFor}
        onClose={() => setTutorFor(null)} />

      }
      {/* 「AI 出 5 题」入口按钮已下线(大陆出题慢、体验差,且已有跨3天连对复习机制);
          SimilarQuestionsModal + generate-similar-questions edge 保留不删,以后加回按钮即可恢复。 */}
      {aiFor && <SimilarQuestionsModal mistake={aiFor} onClose={() => setAiFor(null)} />}
      {redoFor && (isOpen(redoFor) ?
      <RedoOpenModal
        mistake={redoFor}
        onOpenResolved={() => { void handleOpenResolve(redoFor); stopSpeaking(); setRedoFor(null); }}
        onClose={() => { stopSpeaking(); setRedoFor(null); }} /> :
      <RedoQuestionModal
        mistake={redoFor}
        onResolved={() => handleRedoCorrect(redoFor)}
        onClose={() => { stopSpeaking(); setRedoFor(null); }} />)
      }
    </main>);

};

function StatCard({ label, value, emoji, highlight }: {label: string;value: number;emoji: string;highlight?: boolean;}) {
  return (
    <div className={`rounded-2xl p-3 text-center shadow-sm transition ${
    highlight ?
    "bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/30" :
    "bg-card ring-1 ring-border"}`
    }>
      <div className="text-lg">{emoji}</div>
      <div className="mt-0.5 text-xl font-extrabold leading-tight text-foreground">{value}</div>
      <div className="text-[11px] font-medium text-muted-foreground"><T>{label}</T></div>
    </div>);

}

function EmptyState({ tab }: {tab: ModuleKey;}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
        <Trophy className="size-7" />
      </div>
      <p className="text-base font-semibold">
        {tab === "due" ? <T>今天没有要复习的，明天再来！</T> : <T>这里还是空的</T>}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        <T>去做题吧，错题会自动收进这里，按记忆曲线帮你复习。</T>
      </p>
    </div>);

}

function MistakeCard({
  m, playing, onPlay, onStar, onAskTutor, onRedo
}: {m: Mistake;playing: boolean;onPlay: () => void;onStar: () => void;onAskTutor: () => void;onRedo?: () => void;}) {
  const meta = moduleMeta(m.module);
  // 错题本永远藏答案:未掌握(还在册)只显示题干 + 纯选项,不含任何正确/你选标记/解析。
  // 答案仅在「重做答对」那一刻由 RedoQuestionModal 揭晓;卡片刷新/下次再看又藏回去。
  const plainOptions = useMemo(() => optionPairs(m), [m]);
  const dueIn = useMemo(() => {
    const ms = new Date(m.next_review_at).getTime() - Date.now();
    if (ms <= 0) return { text: "待复习", urgent: true };
    const days = Math.round(ms / 86_400_000);
    return { text: days === 0 ? "今天" : `${days} 天后`, urgent: false };
  }, [m.next_review_at]);

  // Headline phrase for the card
  const headline =
  m.module === "ai_talk_target" ?
  m.snapshot?.phrase as string || m.question :
  m.snapshot?.word as string || m.question.split("——")[0]?.trim() || m.question;

  const subline =
  m.module === "ai_talk_target" ?
  m.correct_answer :
  m.snapshot?.question_cn || null;

  // 🔊 只在真有可朗读内容时显示——镜像 playPhrase 实际会播的来源(真音频/TTS文本/例句/短语)。
  // 语法错题等无 audio 的条目不再画按钮(此前无差别显示,点了报「没有可朗读的内容」)。
  const playable = Boolean(
    m.snapshot?.audio_url ||
    m.snapshot?.audio ||
    m.snapshot?.source_sentence ||
    m.snapshot?.phrase,
  );

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* Module strip */}
      <div className={`flex items-center gap-2 bg-gradient-to-r ${meta.color} px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/95`}>
        <span>{meta.emoji}</span>
        <span><T>{meta.label}</T></span>
        {m.source_label && <span className="ml-1 truncate font-normal opacity-80">· {m.source_label}</span>}
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${dueIn.urgent ? "bg-white text-rose-600" : "bg-white/20"}`}>
          <T>{dueIn.text}</T>
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xl font-extrabold leading-snug text-foreground">{headline}</div>
            {/* subline:仅显示题目本身的中文提问;target-word 的 subline=正确释义(答案)→ 藏。 */}
            {subline && m.module !== "ai_talk_target" &&
            <div className="mt-1 text-sm text-muted-foreground">{subline}</div>
            }
            {/* 例句/原文对应句会泄漏答案 → 藏(🔊 仍可听,听力/朗读本就是重做检验的一部分)。 */}
          </div>
          <div className="flex flex-col items-end gap-2">
            {playable &&
            <button
              onClick={onPlay}
              className={`grid size-10 place-items-center rounded-full shadow transition ${
              playing ?
              "bg-gradient-to-br from-amber-500 to-orange-500 text-white" :
              "bg-secondary text-foreground hover:bg-primary/15"}`
              }
              aria-label="朗读">

              {playing ? <Volume2 className="size-4 animate-pulse" /> : <Play className="size-4" />}
            </button>
            }
            <button
              onClick={onStar}
              className={`grid size-10 place-items-center rounded-full transition ${
              m.is_starred ? "bg-amber-100 text-amber-600" : "bg-secondary text-muted-foreground hover:text-amber-600"}`
              }
              aria-label="收藏">
              
              <Star className={`size-4 ${m.is_starred ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* 未掌握错题:永远只显示题干 + 纯选项(无正确/你选标记、无解析、无原文)。
            答案只在「重做答对」瞬间由 RedoQuestionModal 揭晓;卡片平时/刷新后始终是藏答案态,
            防止学生看过答案后照抄绕过「跨 3 天连对」。老师端不受影响(照旧显示完整快照)。 */}
        <div className="mt-3 space-y-2">
          {/* 整篇型(阅读/完形):逐题只显示题干 + 纯选项 */}
          {Array.isArray(m.snapshot?.questions) && m.snapshot.questions.length > 0 &&
          <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3">
              {m.snapshot.questions.map((q: {no?: number;stem?: string;options?: Record<string, unknown>;}, qi: number) => {
              const qOpts = q?.options && typeof q.options === "object" ?
              Object.entries(q.options).
              filter(([, v]) => v != null && String(v).trim() !== "").
              sort(([a], [b]) => a.localeCompare(b)) : [];
              return (
                <div key={qi} className="border-t border-border/60 pt-2 first:border-t-0 first:pt-0">
                    <div className="text-sm font-semibold text-foreground">{q?.no ? `${q.no}. ` : ""}{q?.stem}</div>
                    {qOpts.length > 0 &&
                <ul className="mt-1 space-y-1">
                        {qOpts.map(([L, txt]) =>
                  <li key={L} className="flex items-baseline gap-1.5 text-base text-foreground/80">
                            <span className="font-bold text-muted-foreground">{L}.</span>
                            <span>{String(txt)}</span>
                          </li>
                  )}
                      </ul>
                }
                  </div>);

            })}
            </div>
          }
          {/* 普通单题:纯选项 */}
          {plainOptions.length > 0 &&
          <ul className="space-y-1 rounded-xl border border-border bg-background/60 p-3">
              {plainOptions.map(([L, txt]) =>
            <li key={L} className="flex items-baseline gap-1.5 text-base text-foreground/80">
                  <span className="font-bold text-muted-foreground">{L}.</span>
                  <span>{txt}</span>
                </li>
            )}
            </ul>
          }
        </div>

        {/* 来源:单元名 · 做错时间(北京时间 UTC+8);字号大一档 + 颜色加深,一眼看清 */}
        <div className="mt-3 text-[13px] text-foreground/70">
          {m.source_label ? <span>{m.source_label} · </span> : null}
          <span className="tabular-nums">{bjDateTime(m.last_wrong_at)}</span>
        </div>

        {/* Footer actions */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span><T>错过</T> <span className="font-bold text-foreground">{m.wrong_count}</span> <T>次</T></span>
            {isOpen(m) ?
            <span className="text-teal-600 dark:text-teal-400">· <T>自评题 · 会了即移出</T></span> :
            <span className="text-emerald-600 dark:text-emerald-400">
              · <T>巩固</T> <span className="font-bold">{m.correct_streak ?? 0}</span>/3
              {(m.last_correct_date && m.last_correct_date === bjToday()) &&
                <span className="ml-1 text-emerald-500">· <T>今天已完成</T></span>}
            </span>}
          </span>
          <div className="flex gap-2">
            {onRedo &&
            <button
              onClick={onRedo}
              className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-300">

              <RotateCw className="size-3" /> <T>重做</T>
            </button>
            }
          </div>
        </div>
      </div>
    </li>);

}

export default MistakesPage;

// ── 就地重做弹窗(v1:语法选择题)────────────────────────────────────────────
// 纯新增·独立于原做题判分:用 snapshot 冻结的 correct_answer 做极简选择比对。
// 做对 → onResolved() 走跨3天连对累计(父组件),返回本次 streak 结果供弹窗显示;
// 做错 → 亮正确项+解析、可重试。
function RedoQuestionModal({
  mistake, onResolved, onClose
}: {mistake: Mistake;onResolved: () => Promise<StreakResult | null>;onClose: () => void;}) {
  const pairs = optionPairs(mistake);
  const correct = frozenCorrect(mistake);
  const stem = String(mistake.snapshot?.stem || mistake.question || "").replace(/\\n/g, "\n");
  const explanation = mistake.explanation || mistake.snapshot?.explanation || "";
  const audio = mistake.snapshot?.audio ? String(mistake.snapshot.audio) : "";
  const audioUrl = mistake.snapshot?.audio_url ? String(mistake.snapshot.audio_url) : "";
  const [picked, setPicked] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [streakRes, setStreakRes] = useState<StreakResult | null>(null);
  const solved = picked === correct;
  const wrongPicked = picked !== null && picked !== correct;

  const pick = async (L: string) => {
    if (solved) return; // 已答对,锁定
    stopSpeaking(); // 听力题:选完立即停止播放
    setPicked(L);
    if (L === correct && !resolved) {
      setResolved(true);
      const r = await onResolved(); // 做对 → 跨3天连对累计
      setStreakRes(r);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 dark:text-sky-300">
            <RotateCw className="size-4" /> <T>重做这道题</T>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="关闭">
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 whitespace-pre-wrap text-base font-semibold leading-relaxed text-foreground">{stem}</div>

        {(audioUrl || audio) &&
        <button
          type="button"
          onClick={() => void (audioUrl ? speakFromUrl(audioUrl) : speakTTS(audio, { voiceId: getAlexVoice() }))}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-300">
          <Volume2 className="size-4" /> <T>🔊 重听录音</T>
        </button>
        }

        <ul className="space-y-2">
          {pairs.map(([L, txt]) => {
            const isCorrect = L === correct;
            const isPicked = picked === L;
            const state =
            solved && isCorrect ? "correct" :
            isPicked && !isCorrect ? "wrong" :
            wrongPicked && isCorrect ? "revealed" : "idle";
            const cls =
            state === "correct" ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" :
            state === "wrong" ? "border-rose-300 bg-rose-50 opacity-80 dark:bg-rose-500/10" :
            state === "revealed" ? "border-emerald-300 bg-emerald-50/70 dark:bg-emerald-500/5" :
            "border-border bg-background hover:border-sky-300";
            return (
              <li key={L}>
                <button
                  onClick={() => pick(L)}
                  disabled={solved}
                  className={`flex w-full items-baseline gap-2.5 rounded-2xl border-2 px-4 py-3 text-left text-base transition ${cls}`}>
                  <span className={`grid size-6 flex-shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                  state === "correct" || state === "revealed" ? "bg-emerald-400 text-white" :
                  state === "wrong" ? "bg-rose-400 text-white" : "bg-secondary text-foreground"}`}>
                    {state === "correct" || state === "revealed" ? "✓" : state === "wrong" ? "✕" : L}
                  </span>
                  <span className={`min-w-0 break-words ${state === "wrong" ? "line-through" : ""}`}>{txt}</span>
                </button>
              </li>);

          })}
        </ul>

        {solved &&
        <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            {streakRes?.is_resolved ?
              <span>🎉 <T>跨 3 天连对达成,已彻底掌握,移出错题本!</T></span> :
            streakRes?.already_today ?
              <span>✅ <T>答对了!今天已巩固过,明天再来一次 +1。</T></span> :
            streakRes ?
              <span>✅ 答对了!巩固 {streakRes.correct_streak}/3 · 跨 3 天各做对 1 次即彻底掌握</span> :
              <span>✅ <T>答对了!</T></span>}
          </div>
        }
        {wrongPicked && explanation &&
        <div className="mt-4 rounded-2xl bg-secondary/60 p-3 text-sm leading-relaxed text-foreground/80">
            💡 {explanation}
          </div>
        }

        <div className="mt-4 flex justify-end gap-2">
          {wrongPicked && !solved &&
          <button
            onClick={() => setPicked(null)}
            className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-300">
              <RotateCw className="size-3.5" /> <T>再试一次</T>
            </button>
          }
          <button
            onClick={onClose}
            className="rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-primary/15">
            <T>{solved ? "完成" : "关闭"}</T>
          </button>
        </div>
      </div>
    </div>);

}

// ── 开放题重做弹窗(美语情景应答/句型转换)──────────────────────────────────
// 藏答案一致:未揭晓前只显题干;点「看参考答案」才揭晓参考答案(带 TTS 朗读,美语口语)。
// 自评「我会了」→ onOpenResolved()(父组件 1 次 is_resolved=true 移出,豁免跨3天连对);
// 「还不会」→ 关闭、留在错题本。
function RedoOpenModal({
  mistake, onOpenResolved, onClose
}: {mistake: Mistake;onOpenResolved?: () => void;onClose: () => void;}) {
  const stem = String(mistake.snapshot?.stem || mistake.question || "").replace(/\\n/g, "\n");
  const reference = String(mistake.snapshot?.reference_answer ?? mistake.correct_answer ?? "").trim();
  const explanation = mistake.explanation || mistake.snapshot?.explanation || "";
  const [revealed, setRevealed] = useState(false);

  const reveal = () => {
    setRevealed(true);
    if (reference) void speakTTS(reference, { voiceId: getAlexVoice() }); // 参考答案 TTS 朗读
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => { stopSpeaking(); onClose(); }}>
      <div className="w-full max-w-lg rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 dark:text-teal-300">
            <MessageCircleQuestion className="size-4" /> <T>情景应答 · 自评重做</T>
          </div>
          <button onClick={() => { stopSpeaking(); onClose(); }} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="关闭">
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 whitespace-pre-wrap text-base font-semibold leading-relaxed text-foreground">{stem}</div>

        {!revealed &&
        <div className="mb-2 rounded-2xl bg-secondary/50 p-3 text-sm leading-relaxed text-muted-foreground">
          <T>先自己想一想怎么回应,再看参考答案。</T>
        </div>
        }

        {revealed &&
        <div className="mb-2 rounded-2xl border border-teal-300 bg-teal-50 p-3 dark:border-teal-500/40 dark:bg-teal-500/10">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-300"><T>参考答案</T></div>
            {reference &&
            <button
              type="button"
              onClick={() => void speakTTS(reference, { voiceId: getAlexVoice() })}
              className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-200 dark:bg-teal-500/20 dark:text-teal-200">
              <Volume2 className="size-3.5" /> <T>朗读</T>
            </button>
            }
          </div>
          <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">{reference || "（无参考答案)"}</div>
          {explanation &&
          <div className="mt-2 border-t border-teal-200 pt-2 text-xs leading-relaxed text-foreground/70 dark:border-teal-500/30">💡 {explanation}</div>
          }
        </div>
        }

        <div className="mt-4 flex justify-end gap-2">
          {!revealed ?
          <button
            onClick={reveal}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white hover:bg-teal-600">
            <Volume2 className="size-4" /> <T>看参考答案</T>
          </button> :
          <>
            <button
              onClick={() => { stopSpeaking(); onClose(); }}
              className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary/15">
              <T>还不会</T>
            </button>
            <button
              onClick={() => { stopSpeaking(); onOpenResolved?.(); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-600">
              <T>我会了 ✨</T>
            </button>
          </>
          }
        </div>
      </div>
    </div>);

}

function TopicGroups({ items, onPick }: {items: Mistake[];onPick: (moduleKey: string) => void;}) {
  const groups = useMemo(() => {
    const map = new Map<string, {module: string;label: string;items: Mistake[];}>();
    for (const m of items) {
      const label = m.source_label || moduleMeta(m.module).label;
      const key = `${m.module}::${label}`;
      if (!map.has(key)) map.set(key, { module: m.module, label, items: [] });
      map.get(key)!.items.push(m);
    }
    return Array.from(map.entries()).
    map(([key, g]) => {
      const total = g.items.length;
      const avgWrong = g.items.reduce((s, x) => s + (x.wrong_count || 1), 0) / Math.max(1, total);
      // Mastery heuristic: lower avg wrong_count => higher mastery
      const mastery = Math.max(0, Math.min(100, Math.round(100 - (avgWrong - 1) * 25)));
      return { key, ...g, total, mastery };
    }).
    sort((a, b) => b.total - a.total);
  }, [items]);

  if (groups.length === 0) return <EmptyState tab={"topics" as ModuleKey} />;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {groups.map((g) => {
        const meta = moduleMeta(g.module);
        const tone =
        g.mastery >= 80 ? "text-emerald-600 dark:text-emerald-400" :
        g.mastery >= 50 ? "text-amber-600 dark:text-amber-400" :
        "text-rose-600 dark:text-rose-400";
        return (
          <button
            key={g.key}
            onClick={() => onPick(g.module)}
            className="group rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            
            <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${meta.color} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/95`}>
              <span>{meta.emoji}</span><span><T>{meta.label}</T></span>
            </div>
            <div className="text-base font-extrabold leading-snug"><T>{g.label}</T></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all" style={{ width: `${g.mastery}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{g.total} <T>道错题</T></span>
              <span className={`font-bold ${tone}`}><T>掌握度</T> {g.mastery}%</span>
            </div>
          </button>);

      })}
    </div>);

}

type SimQ = {question: string;options?: string[];correct_answer: string;explanation?: string;};

function SimilarQuestionsModal({ mistake, onClose }: {mistake: Mistake;onClose: () => void;}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qs, setQs] = useState<SimQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-similar-questions", {
          body: {
            module: mistake.module,
            source_label: mistake.source_label,
            question: mistake.question,
            correct_answer: mistake.correct_answer,
            explanation: mistake.explanation,
            snapshot: mistake.snapshot
          }
        });
        if (cancelled) return;
        if (error) throw error;
        const arr: SimQ[] = (data as any)?.questions || [];
        if (arr.length === 0) throw new Error("AI 没有返回相似题，稍后再试");
        setQs(arr);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "生成失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {cancelled = true;};
  }, [mistake]);

  const cur = qs[idx];
  const done = !loading && qs.length > 0 && idx >= qs.length;

  const grade = (choice: string) => {
    if (!cur || picked) return;
    setPicked(choice);
    const ok = (cur.correct_answer || "").trim().toLowerCase().startsWith(choice.trim().toLowerCase().slice(0, 1));
    if (ok) setRight((n) => n + 1);else setWrong((n) => n + 1);
  };

  const next = () => {setPicked(null);setIdx((i) => i + 1);};

  // After done, log a summary mistake row tagged to original (if user got any wrong)
  useEffect(() => {
    if (!done || logged) return;
    setLogged(true);
    if (wrong === 0) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("user_mistakes").insert({
        user_id: user.id,
        module: mistake.module,
        source_key: `ai_similar:${mistake.id}:${Date.now()}`,
        source_label: `AI 相似题 · ${mistake.source_label || moduleMeta(mistake.module).label}`,
        question: `（来自 AI 出题）相似题 ${qs.length} 道，答错 ${wrong} 道`,
        correct_answer: null,
        explanation: `源自错题：${mistake.question.slice(0, 80)}`,
        snapshot: { source_mistake_id: mistake.id, original_question: mistake.question, similar_total: qs.length, wrong, right }
      } as any);
    })();
  }, [done, logged, wrong, right, qs.length, mistake]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-2 sm:items-center sm:p-6" onClick={onClose}>
      <div className="relative w-full max-w-xl rounded-3xl bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
        <div className="mb-3 flex items-center gap-2">
          <Wand2 className="size-4 text-violet-600" />
          <div className="text-sm font-bold"><T>AI 出 5 道同考点相似题</T></div>
        </div>

        {loading &&
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> <T>AI 正在出题…</T>
          </div>
        }
        {!loading && error &&
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>
        }

        {!loading && !error && cur &&
        <>
            <div className="mb-2 text-xs font-semibold text-muted-foreground"><T>第</T> {idx + 1} / {qs.length} <T>题 · ✓</T> {right} ✕ {wrong}</div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-base font-extrabold leading-snug">{cur.question}</div>
              {cur.options && cur.options.length > 0 &&
            <div className="mt-3 grid gap-2">
                  {cur.options.map((opt, i) => {
                const isCorrect = (cur.correct_answer || "").trim().toLowerCase().startsWith(opt.trim().toLowerCase().slice(0, 1));
                const chosen = picked === opt;
                let cls = "border-border bg-card hover:border-primary/40";
                if (picked) {
                  if (isCorrect) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";else
                  if (chosen) cls = "border-rose-500 bg-rose-50 dark:bg-rose-500/10";else
                  cls = "border-border bg-card opacity-60";
                }
                return (
                  <button
                    key={i}
                    disabled={!!picked}
                    onClick={() => grade(opt)}
                    className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-medium transition ${cls}`}>
                    
                        {opt}
                      </button>);

              })}
                </div>
            }
              {(!cur.options || cur.options.length === 0) &&
            <div className="mt-3 grid gap-2">
                  {!picked ?
              <button onClick={() => setPicked("__reveal__")} className="rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 text-sm font-semibold text-primary">
                      <T>点击查看答案</T>
                    </button> :

              <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <div className="text-[10px] font-bold uppercase opacity-70"><T>✓ 参考答案</T></div>
                      <div className="mt-1 font-semibold">{cur.correct_answer}</div>
                    </div>
              }
                </div>
            }

              {picked &&
            <>
                  {cur.explanation &&
              <div className="mt-3 rounded-xl bg-secondary/60 p-3 text-xs leading-relaxed text-foreground/80">💡 {cur.explanation}</div>
              }
                  {(!cur.options || cur.options.length === 0) && picked === "__reveal__" &&
              <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => {setWrong((n) => n + 1);next();}} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white"><T>还不会</T></button>
                      <button onClick={() => {setRight((n) => n + 1);next();}} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white"><T>我会了</T></button>
                    </div>
              }
                  {cur.options && cur.options.length > 0 &&
              <button onClick={next} className="mt-3 w-full rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                      {idx + 1 < qs.length ? "下一题 →" : "查看结果"}
                    </button>
              }
                </>
            }
            </div>
          </>
        }

        {done &&
        <div className="mt-4 rounded-2xl bg-secondary/40 p-4 text-center">
            <div className="text-lg font-extrabold"><T>完成 ✨</T></div>
            <div className="mt-1 text-sm text-muted-foreground"><T>答对</T> {right} <T>· 答错</T> {wrong}{wrong > 0 ? "（已加入错题本）" : ""}</div>
            <button onClick={onClose} className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"><T>关闭</T></button>
          </div>
        }
      </div>
    </div>);

}