import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, Sparkles, Volume2, Play, Star, Check, Trash2, Search,
  BookOpen, AlertCircle, Filter, Trophy, MessageCircleQuestion, Wand2, X, RotateCw } from
"lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { speak as speakTTS, stopSpeaking } from "@/lib/speak";
import { getAlexVoice } from "@/lib/alexVoice";
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
  senior_grammar: { label: "语法错题", emoji: "🔤", color: "from-rose-400 to-pink-500" }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {setSignedIn(false);setLoading(false);return;}
      setSignedIn(true);
      const { data, error } = await supabase.
      from("user_mistakes").
      select("*").
      eq("is_resolved", false).
      order("next_review_at", { ascending: true }).
      limit(500);
      if (cancelled) return;
      if (error) toast.error(error.message);
      setItems(data as Mistake[] || []);
      setLoading(false);
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
    return list;
  }, [items, tab, search]);

  const toggleStar = async (m: Mistake) => {
    const next = !m.is_starred;
    setItems((prev) => prev.map((x) => x.id === m.id ? { ...x, is_starred: next } : x));
    await supabase.from("user_mistakes").update({ is_starred: next }).eq("id", m.id);
  };

  const markResolved = async (m: Mistake) => {
    const wasLast = items.length <= 1;
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    await supabase.from("user_mistakes").update({ is_resolved: true }).eq("id", m.id);
    // 攻克错题最有价值——给 3 星币 + 宠物开心反应
    try {
      const c = await import("@/lib/coins");
      await c.awardCoins(3, "mistake_resolved");
      c.petReact("happy", { coins: 3 });
    } catch {/* noop */}
    if (wasLast) {
      toast.success("🎉 错题本清空！", { description: "全部攻克，复习队列已清零！" });
      import("@/lib/feedback").then((f) => f.fireEmojiConfetti({ count: 60, vibrate: true }));
    } else {
      toast.success("已掌握 ✨", { description: "从复习队列移除" });
    }
  };

  const removeOne = async (m: Mistake) => {
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    await supabase.from("user_mistakes").delete().eq("id", m.id);
  };

  const playPhrase = async (m: Mistake) => {
    // For target words: play the example sentence with Alex voice.
    // For other mistakes: play the correct_answer (English) if it looks like English.
    const text = m.module === "ai_talk_target" ?
    m.snapshot?.alex_used_sentence || m.snapshot?.example_en || m.snapshot?.phrase || "" :
    m.snapshot?.source_sentence || m.snapshot?.phrase || "";
    if (!text) {toast.info("没有可朗读的内容");return;}
    setPlayingId(m.id);
    try {await speakTTS(text, { voiceId: getAlexVoice() });} catch {/* noop */}
    setPlayingId((cur) => cur === m.id ? null : cur);
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader title="📒 错题本" subtitle="所有错题按记忆曲线安排复习" />

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
            onResolve={() => markResolved(m)}
            onRemove={() => removeOne(m)}
            onAskTutor={() => setTutorFor(m)}
            onAskAI={() => setAiFor(m)}
            onRedo={isRedoable(m) ? () => setRedoFor(m) : undefined} />

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
      {aiFor && <SimilarQuestionsModal mistake={aiFor} onClose={() => setAiFor(null)} />}
      {redoFor &&
      <RedoQuestionModal
        mistake={redoFor}
        onResolved={() => {markResolved(redoFor);}}
        onClose={() => setRedoFor(null)} />
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
  m, playing, onPlay, onStar, onResolve, onRemove, onAskTutor, onAskAI, onRedo









}: {m: Mistake;playing: boolean;onPlay: () => void;onStar: () => void;onResolve: () => void;onRemove: () => void;onAskTutor: () => void;onAskAI: () => void;onRedo?: () => void;}) {
  const [revealed, setRevealed] = useState(false);
  const meta = moduleMeta(m.module);
  // 静态查看区「全部选项」展示(有 options 快照才有;正确标绿✓、当时错选标红划掉)。
  const revealedOptions = useMemo(() => optionPairs(m), [m]);
  const revealedCorrect = frozenCorrect(m);
  const revealedUser = String(m.user_answer ?? "").trim();
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

  const sourceSentence =
  m.snapshot?.alex_used_sentence ||
  m.snapshot?.example_en ||
  m.snapshot?.source_sentence ||
  null;

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
            {subline && !revealed &&
            <div className="mt-1 text-sm text-muted-foreground">{subline}</div>
            }
            {sourceSentence &&
            <div className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm italic leading-snug text-foreground/85">
                "{sourceSentence}"
              </div>
            }
          </div>
          <div className="flex flex-col items-end gap-2">
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

        {/* Reveal answer */}
        {!revealed ?
        <button
          onClick={() => setRevealed(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10">
          
            👆 <T>点击查看答案与解析</T>
          </button> :

        <div className="mt-3 space-y-2">
            {revealedOptions.length > 0 &&
          <ul className="space-y-1 rounded-xl border border-border bg-background/60 p-3">
                {revealedOptions.map(([L, txt]) => {
              const isCorrect = L === revealedCorrect;
              const isWrongPick = L === revealedUser && L !== revealedCorrect;
              return (
                <li key={L} className="flex items-baseline gap-1.5 text-sm">
                      <span className={`font-bold ${isCorrect ? "text-emerald-700 dark:text-emerald-300" : isWrongPick ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>{L}.</span>
                      <span className={isCorrect ? "font-semibold text-emerald-700 dark:text-emerald-300" : isWrongPick ? "text-rose-600 line-through dark:text-rose-400" : "text-foreground/80"}>{txt}</span>
                      {isCorrect && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
                      {isWrongPick && <span className="text-[11px] text-rose-500"><T>(你选的)</T></span>}
                    </li>);

            })}
              </ul>
          }
            {m.correct_answer &&
          <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">✓ <T>正确答案</T></span>
                <div className="mt-1 font-semibold">{m.correct_answer}</div>
              </div>
          }
            {m.user_answer &&
          <div className="rounded-xl border-l-4 border-rose-500 bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-500/10 dark:text-rose-300">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">✕ <T>你当时选的</T></span>
                <div className="mt-1">{m.user_answer}</div>
              </div>
          }
            {m.explanation &&
          <div className="rounded-xl bg-secondary/60 p-3 text-sm leading-relaxed text-foreground/80">
                💡 {m.explanation}
              </div>
          }
          </div>
        }

        {/* Footer actions */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
          <span className="text-muted-foreground">
            <T>错过</T> <span className="font-bold text-foreground">{m.wrong_count}</span> <T>次</T>
          </span>
          <div className="flex gap-2">
            {onRedo &&
            <button
              onClick={onRedo}
              className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-300">

              <RotateCw className="size-3" /> <T>重做</T>
            </button>
            }
            <button
              onClick={onAskAI}
              className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300">

              <Wand2 className="size-3" /> <T>AI 出 5 题</T>
            </button>
            <button
              onClick={onResolve}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300">
              
              <Check className="size-3" /> <T>已掌握</T>
            </button>
            <button
              onClick={onRemove}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-semibold text-muted-foreground hover:bg-rose-100 hover:text-rose-600">
              
              <Trash2 className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </li>);

}

export default MistakesPage;

// ── 就地重做弹窗(v1:语法选择题)────────────────────────────────────────────
// 纯新增·独立于原做题判分:用 snapshot 冻结的 correct_answer 做极简选择比对。
// 做对 → onResolved()(父组件 markResolved 移出);做错 → 亮正确项+解析、可重试。
function RedoQuestionModal({
  mistake, onResolved, onClose
}: {mistake: Mistake;onResolved: () => void;onClose: () => void;}) {
  const pairs = optionPairs(mistake);
  const correct = frozenCorrect(mistake);
  const stem = String(mistake.snapshot?.stem || mistake.question || "").replace(/\\n/g, "\n");
  const explanation = mistake.explanation || mistake.snapshot?.explanation || "";
  const [picked, setPicked] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const solved = picked === correct;
  const wrongPicked = picked !== null && picked !== correct;

  const pick = (L: string) => {
    if (solved) return; // 已答对,锁定
    setPicked(L);
    if (L === correct && !resolved) {
      setResolved(true);
      onResolved(); // 做对 → 移出错题本(父组件 markResolved)
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
                  className={`flex w-full items-baseline gap-2.5 rounded-2xl border-2 px-4 py-3 text-left text-sm transition ${cls}`}>
                  <span className={`grid size-6 flex-shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                  state === "correct" || state === "revealed" ? "bg-emerald-400 text-white" :
                  state === "wrong" ? "bg-rose-400 text-white" : "bg-secondary text-foreground"}`}>
                    {state === "correct" || state === "revealed" ? "✓" : state === "wrong" ? "✕" : L}
                  </span>
                  <span className={state === "wrong" ? "line-through" : ""}>{txt}</span>
                </button>
              </li>);

          })}
        </ul>

        {solved &&
        <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            🎉 <T>答对了!已移出错题本。</T>
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