import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, Send, Sparkles, X, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
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

function AssistantDrawer({ state, onClose }: { state: AssistantState; onClose: () => void }) {
  const { lang } = useI18n();
  const tutorLang: "zh" | "en" = lang.startsWith("zh") ? "zh" : "en";

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

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending || !state.unlocked) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;
      const body: Record<string, unknown> = {
        context: state.context,
        user_message: trimmed,
        language: tutorLang,
        mode: isFree ? "free" : "question",
        topic: state.topic,
      };
      if (!isFree) {
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
      let acc = "";
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

  const starters = isFree
    ? (tutorLang === "zh" ? STARTERS_FREE_ZH : STARTERS_FREE_EN)
    : (tutorLang === "zh" ? STARTERS_Q_ZH : STARTERS_Q_EN);

  const headerTitle = state.pageTitle ?? (tutorLang === "zh" ? "💬 小月 · AI 学习助手" : "💬 Luna · AI Tutor");
  const sub = isFree
    ? (tutorLang === "zh"
        ? `当前话题：${state.topic}（只聊英语学习）`
        : `Topic: ${state.topic} (English study only)`)
    : (tutorLang === "zh"
        ? "我只针对你已经做完的这道题答疑。"
        : "I only discuss the question you've already answered.");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl md:h-[80vh] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <img src={xiaoyueMascot} alt="小月" width={40} height={40} className="size-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-amber-100 object-contain p-0.5" />
            <div className="min-w-0">
              <div className="text-base font-extrabold leading-tight">{headerTitle}</div>
              <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{sub}</div>
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
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="size-4" />
                    {tutorLang === "zh" ? "试试这样问我：" : "Try asking:"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {starters.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-primary/30 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10"
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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      m.content ? (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 dark:prose-invert">
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

            <div className="border-t border-border bg-card px-3 py-3">
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
                  rows={1}
                  placeholder={tutorLang === "zh" ? "输入你的英语问题…" : "Ask any English question…"}
                  className="min-h-[42px] max-h-32 flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !input.trim()}
                  className="size-10 shrink-0 rounded-full"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
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
