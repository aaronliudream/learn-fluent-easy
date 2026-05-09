import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, Send, Sparkles, X, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAIAssistant, type AssistantState } from "@/contexts/AIAssistantContext";
import xiaoyueMascot from "@/assets/xiaoyue-mascot.png";

/** Persistent random ID for guest quota tracking. */
function getGuestClientId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem("xiaoyue_client_id");
    if (!id) {
      id = "g_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
      localStorage.setItem("xiaoyue_client_id", id);
    }
    return id;
  } catch { return "g_fallback"; }
}

/**
 * Global floating AI assistant.
 *
 * - FAB at bottom-right (above the bottom tab bar on mobile).
 * - Drawer opens with chat. Hidden on a small allowlist of routes (auth, full-screen voice, etc.).
 * - Reads the active AssistantState from context: mode, unlocked, snapshot, topic, lockedHint.
 * - When `unlocked === false`, shows a lock screen instead of the input — prevents answer leakage.
 * - Talks to existing `tutor-chat` edge function:
 *     - per-question / full-test → strict tutor (snapshot mode)
 *     - free                     → general English helper for the page topic
 */

type Role = "user" | "assistant";
interface Msg { role: Role; content: string }

// Routes where the assistant should stay out of the way entirely.
const HIDE_ON = [
  /^\/auth/,
  /^\/talk/,
  /^\/ielts-speaking\/session/,
  /^\/placement/,
];

export default function GlobalAIAssistant() {
  const { pathname } = useLocation();
  const { state, open, setOpen } = useAIAssistant();
  const hide = HIDE_ON.some((r) => r.test(pathname));
  if (hide) return null;
  return (
    <>
      <FloatingButton onClick={() => setOpen(true)} unlocked={state.unlocked} />
      {open && <AssistantDrawer state={state} onClose={() => setOpen(false)} />}
    </>
  );
}

function FloatingButton({ onClick, unlocked }: { onClick: () => void; unlocked: boolean }) {
  // Show "💬 问小月" hint bubble on first ever visit, and re-show once per page topic.
  const [showHint, setShowHint] = useState(false);
  const isHome = typeof window !== "undefined" && window.location.pathname === "/";
  useEffect(() => {
    try {
      const seen = localStorage.getItem("xiaoyue_hint_seen");
      if (!seen) {
        const t = setTimeout(() => setShowHint(true), 1200);
        const t2 = setTimeout(() => {
          setShowHint(false);
          localStorage.setItem("xiaoyue_hint_seen", "1");
        }, 10000);
        return () => { clearTimeout(t); clearTimeout(t2); };
      }
    } catch { /* noop */ }
  }, []);

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-2"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
    >
      {showHint && (
        <div className="relative animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="max-w-[240px] rounded-2xl border border-primary/20 bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-lg">
            {isHome ? (
              <>
                👋 我是 <span className="text-primary">小月</span>！<br />
                <span className="text-muted-foreground font-normal">想知道我们怎么帮孩子提分？点我问问看～</span>
              </>
            ) : (
              <>💡 不懂？<span className="text-primary">点我问小月！</span></>
            )}
          </div>
          <div className="absolute -bottom-1 right-6 size-3 rotate-45 border-b border-r border-primary/20 bg-card" />
        </div>
      )}
      <button
        onClick={() => { setShowHint(false); try { localStorage.setItem("xiaoyue_hint_seen", "1"); } catch {} onClick(); }}
        aria-label="AI 学习助手 小月"
        className="group relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-violet-500 to-amber-300 p-0.5 shadow-2xl ring-2 ring-background transition-transform hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-violet-400/30 [animation-duration:2.5s]" aria-hidden />
        <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-card">
          <img
            src={xiaoyueMascot}
            alt="小月"
            width={64}
            height={64}
            loading="lazy"
            className="size-[88%] object-contain"
          />
        </span>
        <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          小月 · AI 助手
        </span>
        {!unlocked && (
          <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow">
            <Lock className="size-3" />
          </span>
        )}
      </button>
    </div>
  );
}

const STARTERS_FREE_ZH = ["这个语法点的核心规则是什么？", "再举两个生活化例句", "和类似语法点有什么区别？"];
const STARTERS_FREE_EN = ["What's the core rule here?", "Give me 2 real-life example sentences", "How is this different from a similar grammar point?"];
const STARTERS_Q_ZH = ["为什么这道题选这个？", "再给我一个类似的练习", "我还是不太懂，给我一个提示"];
const STARTERS_Q_EN = ["Why is this the right answer?", "Give me a similar practice", "I'm still confused — hint please"];
const STARTERS_CONCIERGE = [
  "你们怎么帮孩子提分？",
  "AI 是怎么诊断薄弱点的？",
  "家长能看到孩子哪些数据？",
  "为什么用艾宾浩斯遗忘曲线？",
  "和新东方/学而思有什么不一样？",
  "适合几年级的孩子使用？",
  "一天大概要练多久？",
  "免费的内容有哪些？要付费吗？",
  "口语怎么练？真的能开口吗？",
  "中考/高考真题覆盖了吗？",
];

/**
 * 立刻给用户 2–3 句"垫话"，让他们点完问题就有东西看，
 * 不必干等 1–3s 的首 token。下面文案故意写得"自包含"——
 * 即使流式还没到，也已经回答了问题的骨架。
 */
function prefaceFor(question: string, mode: "concierge" | "free" | "question"): string {
  const q = question.trim();
  const map: Record<string, string> = {
    "你们怎么帮孩子提分？":
      "我们走的是「**诊断 → 练习 → 复习**」这条闭环。\n先用 AI 找出孩子真正的薄弱点，再针对性出题，最后用艾宾浩斯曲线安排复习。\n下面我展开讲讲 👇\n\n",
    "AI 是怎么诊断薄弱点的？":
      "每一道题孩子做完，我们都会抓 **4 类信号**：错在哪个知识点、用了多久、是不是反复错、有没有蒙对。\n这些信号汇总成「能力画像」，比传统刷题精准得多。\n具体怎么算的我细讲 👇\n\n",
    "家长能看到孩子哪些数据？":
      "家长端能看到的内容比你想的多——**学习时长、正确率、薄弱点、坚持天数、单词掌握度**全都有。\n而且不是冷冰冰的数字，会自动总结成「这周孩子在 XXX 上有进步」这样的话。\n我列个完整清单 👇\n\n",
    "为什么用艾宾浩斯遗忘曲线？":
      "因为「记不住」**不是孩子笨，是大脑的科学规律**——学完 1 天就忘 70%，必须在遗忘前复习。\n我们的系统会自动在第 1、3、7、15 天把单词推回来，不用家长操心。\n背后的原理我详细说 👇\n\n",
    "和新东方/学而思有什么不一样？":
      "最大差别在 **「个性化」和「即时反馈」**。\n传统机构是同一套教材教所有孩子；我们是 AI 给每个孩子定制内容，错了立刻讲，不用等老师批改。\n下面对比给你看 👇\n\n",
    "适合几年级的孩子使用？":
      "我们覆盖 **小学（3-6 年级）、初中、高中** 三个学段，全部对应国家课标 + 中高考真题。\n每个年级都有专门的词汇、阅读、语法、写作模块。\n我按年级展开讲 👇\n\n",
    "一天大概要练多久？":
      "建议 **每天 15–25 分钟**，少而稳比一次猛刷三小时管用得多。\n这是基于记忆科学算出来的——超过 30 分钟大脑就开始抗拒了。\n具体怎么安排我说一下 👇\n\n",
    "免费的内容有哪些？要付费吗？":
      "**免费部分已经够日常用了**——单词、基础阅读、语法测试、AI 答疑都开放。\n付费解锁的是中高考真题深度训练、AI 口语陪练、家长报告这些进阶功能。\n详细清单 👇\n\n",
    "口语怎么练？真的能开口吗？":
      "可以。我们用 AI 实时对话「**逼**」孩子开口——不用怕被同学笑，错了 AI 也只会鼓励。\n实测两周后大部分孩子能主动说完整句子。\n方法我细讲 👇\n\n",
    "中考/高考真题覆盖了吗？":
      "**完全覆盖**，而且不是简单堆题。\n每道真题我们都拆成「考点 + 易错点 + 同类变式」三部分，做一题等于练一组。\n具体覆盖哪些省份和年份 👇\n\n",
  };
  if (map[q]) return map[q];
  if (mode === "concierge")
    return "好问题，我先给你一个**整体框架**，然后展开细节。\n这样你听完就能立刻判断「这是不是我要的答案」。\n开始 👇\n\n";
  if (mode === "question")
    return "好的，这道题我们**先看考点，再看陷阱，最后总结同类题怎么做**。\n这样下次遇到类似的你能自己解决。\n开始 👇\n\n";
  return "嗯，这个问题我**先讲核心规则，再举例，最后说易混点**。\n这样听一遍就能记住。\n开始 👇\n\n";
}

function AssistantDrawer({ state, onClose }: { state: AssistantState; onClose: () => void }) {
  const { pathname } = useLocation();
  // 面向中国学生 / 家长 — 小月始终用中文回复，无论 UI 语言是什么
  const tutorLang: "zh" | "en" = "zh";
  // 首页 = 顾问/讲解员模式（介绍网站、教育理念、AI 能力）；其他页面延用既有逻辑
  const isHomeConcierge = pathname === "/";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [meta, setMeta] = useState<{ tier?: string; used?: number; limit?: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset when target changes (page / question).
  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [state.context, state.ref, state.unlocked]);

  // Autofocus when opened & unlocked.
  useEffect(() => {
    if (state.unlocked) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [state.unlocked]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const isFree = state.mode === "free";
  const effectiveMode: "concierge" | "free" | "question" = isHomeConcierge
    ? "concierge"
    : isFree
      ? "free"
      : "question";

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending || !state.unlocked) return;

    const preface = prefaceFor(trimmed, effectiveMode);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: preface }]);
    setInput("");
    setSending(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;
      const body: Record<string, unknown> = {
        context: isHomeConcierge ? "homepage" : state.context,
        user_message: trimmed,
        language: tutorLang,
        mode: effectiveMode,
        topic: isHomeConcierge ? "Big Moon English 网站介绍" : state.topic,
      };
      if (effectiveMode === "question") {
        body.question_ref = state.ref;
        body.question_snapshot = state.snapshot ?? {};
      }
      if (!token) {
        body.client_id = getGuestClientId();
      }

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          let msg = tutorLang === "zh" ? "今天的对话次数已用完，明天再来吧 🌙" : "Daily limit reached. Try again tomorrow ✨";
          try { const j = await resp.json(); if (j?.message) msg = j.message; } catch { /* */ }
          toast.error(msg);
        } else if (resp.status === 402) {
          toast.error(tutorLang === "zh" ? "AI 额度不足，请稍后再试" : "AI credits exhausted, please try later");
        } else {
          toast.error(tutorLang === "zh" ? "AI 暂时无法回复，请稍后再试" : "Assistant unavailable, please retry");
        }
        setMessages((prev) => prev.slice(0, -1));
        setSending(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = preface;
      let done = false;
      while (!done) {
        const { value, done: rdDone } = await reader.read();
        if (rdDone) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith("data: ") && /^data: \{"conversation_id"|"tier"/.test(line)) {
            // meta event payload (we sent on its own data line)
            try {
              const j = JSON.parse(line.slice(6).trim());
              if (j && (j.tier || j.limit !== undefined)) {
                setMeta({ tier: j.tier, used: j.used, limit: j.limit });
                continue;
              }
            } catch { /* fall through */ }
          }
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(j);
            const c = parsed.choices?.[0]?.delta?.content;
            if (typeof c === "string") {
              acc += c;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") next[next.length - 1] = { ...last, content: acc };
                return next;
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      console.error("assistant send", e);
      toast.error(tutorLang === "zh" ? "网络异常，请稍后再试" : "Network error, please retry");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  };

  const starters = isHomeConcierge
    ? STARTERS_CONCIERGE
    : isFree
      ? (tutorLang === "zh" ? STARTERS_FREE_ZH : STARTERS_FREE_EN)
      : (tutorLang === "zh" ? STARTERS_Q_ZH : STARTERS_Q_EN);

  const headerTitle = isHomeConcierge
    ? "💬 小月 · AI 学习顾问"
    : (state.pageTitle ?? "💬 小月 · AI 学习助手");
  const sub = isHomeConcierge
    ? "网站讲解 · 学习方法 · 家长答疑 — 我都可以聊"
    : isFree
      ? `当前话题：${state.topic}（只聊英语学习）`
      : "我只针对你已经做完的这道题答疑。";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl md:h-[88vh] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <img src={xiaoyueMascot} alt="小月" width={44} height={44} className="size-11 shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-amber-100 object-contain p-0.5" />
            <div className="min-w-0">
              <div className="text-lg font-extrabold leading-tight">{headerTitle}</div>
              <div className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{sub}</div>
              {meta?.limit && (
                <div className="mt-1 text-[11px] font-semibold text-muted-foreground">
                  {tutorLang === "zh" ? "今日已用" : "Today"} {meta.used}/{meta.limit}
                  {meta.tier === "guest" && (
                    <Link to="/auth" className="ml-2 text-primary underline">
                      {tutorLang === "zh" ? "登录解锁更多" : "Sign in for more"}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        {!state.unlocked ? (
          <LockedState hint={state.lockedHint} mode={state.mode} lang={tutorLang} onClose={onClose} />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 md:px-6">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-base">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="size-5" />
                    {tutorLang === "zh" ? "试试这样问我：" : "Try asking:"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {starters.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-primary/30 bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-primary/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15.5px] leading-[1.7] md:text-base ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      m.content ? (
                        <div className="prose prose-base max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-foreground dark:prose-invert">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <Loader2 className="size-4 animate-spin opacity-70" />
                      )
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border bg-card px-4 py-3 md:px-6 md:py-4">
              <form
                onSubmit={(e) => { e.preventDefault(); void send(input); }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  rows={2}
                  placeholder={tutorLang === "zh" ? "输入你的英语问题…" : "Ask any English question…"}
                  className="min-h-[56px] max-h-40 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base leading-relaxed outline-none focus:ring-2 focus:ring-primary/40"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !input.trim()}
                  className="size-12 shrink-0 rounded-full"
                >
                  {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LockedState({
  hint, mode, lang, onClose,
}: { hint?: string; mode: AssistantState["mode"]; lang: "zh" | "en"; onClose: () => void }) {
  const defaultHintZh = mode === "full-test"
    ? "请先完成本组测试的所有题目，并提交查看结果后，我才能和你讨论。\n这样可以避免提前泄露答案 ✨"
    : "请先作答当前这道题，提交后我再帮你讲解。\n避免提前看到答案哦 ✨";
  const defaultHintEn = mode === "full-test"
    ? "Please finish all questions in this test and view the results first.\nThis prevents me from leaking answers ✨"
    : "Please answer the current question first.\nThen I can explain it without leaking the answer ✨";
  const text = hint ?? (lang === "zh" ? defaultHintZh : defaultHintEn);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300">
        <Lock className="size-8" />
      </div>
      <div className="text-base font-bold">
        {lang === "zh" ? "答完题再来问我吧" : "Finish the question first"}
      </div>
      <p className="max-w-md whitespace-pre-line text-sm text-muted-foreground">{text}</p>
      <Button onClick={onClose} variant="outline" className="rounded-full">
        {lang === "zh" ? "去做题" : "Back to question"}
      </Button>
    </div>
  );
}
