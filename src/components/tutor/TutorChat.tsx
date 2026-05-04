import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, X, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { useT } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Role = "user" | "assistant";
interface Msg { role: Role; content: string }

export interface TutorChatProps {
  /** Logical bucket: 'junior_grammar' | 'gaokao_grammar' | 'mistakes' | 'gaokao_mistakes' | 'lesson' | 'workplace' */
  context: string;
  /** Stable per-question id (string) */
  questionRef: string;
  /** Snapshot the AI may use as the ONLY reference. Keep small. */
  questionSnapshot: Record<string, unknown>;
  /** Only show after the student has answered (gating happens at parent). */
  open: boolean;
  onClose: () => void;
  /** Optional title override */
  title?: string;
}

const STARTER_PROMPTS_ZH = [
  "为什么我错了？",
  "再举一个类似的例子",
  "我还是不太懂，给我一个提示",
];
const STARTER_PROMPTS_EN = [
  "Why was I wrong?",
  "Give me another example",
  "I'm still confused — hint please",
];

export function TutorChat({ context, questionRef, questionSnapshot, open, onClose, title }: TutorChatProps) {
  const { lang } = useI18n();
  const tt = useT();
  // The tutor speaks in user's language (zh family => zh, otherwise en)
  const tutorLang: "zh" | "en" = lang.startsWith("zh") ? "zh" : "en";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // Reset when target question changes
  useEffect(() => {
    setMessages([]);
    setHintLevel(0);
    setInput("");
  }, [questionRef, context]);

  if (!open) return null;

  const send = async (text: string, levelOverride?: 0 | 1 | 2 | 3) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const lvl = levelOverride ?? hintLevel;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      if (!token) {
        toast.error(tt(tutorLang === "zh" ? "请先登录再使用 AI 答疑" : "Please sign in to use the tutor"));
        setSending(false);
        return;
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          context,
          question_ref: questionRef,
          question_snapshot: questionSnapshot,
          user_message: trimmed,
          language: tutorLang,
          hint_level: lvl,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          let msg = tutorLang === "zh" ? "今天的答疑次数已用完，明天再来吧 🌙" : "Daily limit reached. Try again tomorrow ✨";
          try { const j = await resp.json(); if (j?.message) msg = j.message; } catch { /* */ }
          toast.error(msg);
        } else if (resp.status === 402) {
          toast.error(tutorLang === "zh" ? "AI 额度不足，请稍后再试" : "AI credits exhausted, please try later");
        } else {
          toast.error(tutorLang === "zh" ? "AI 暂时无法回复，请稍后再试" : "Tutor unavailable, please retry");
        }
        // Remove the empty assistant placeholder
        setMessages((prev) => prev.slice(0, -1));
        setSending(false);
        return;
      }

      // Stream parser (SSE)
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
      console.error("tutor send", e);
      toast.error(tutorLang === "zh" ? "网络异常，请稍后再试" : "Network error, please retry");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const askHint = () => {
    const next = (Math.min(3, (hintLevel + 1)) as 0 | 1 | 2 | 3);
    setHintLevel(next);
    const text = tutorLang === "zh"
      ? (next === 1 ? "给我一个方向性提示" : next === 2 ? "再具体一点的提示" : "请详细解释一下")
      : (next === 1 ? "Give me a small hint" : next === 2 ? "A bit more specific please" : "Please explain in detail");
    void send(text, next);
  };

  const starters = tutorLang === "zh" ? STARTER_PROMPTS_ZH : STARTER_PROMPTS_EN;
  const headerTitle = title ?? (tutorLang === "zh" ? "💬 问小月（AI 答疑）" : "💬 Ask Luna (AI tutor)");
  const sub = tutorLang === "zh"
    ? "我只聊这道题哦～用反问帮你想明白，不会直接告诉你答案。"
    : "I only discuss this question — and I guide you to the answer rather than just telling it.";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl md:h-[80vh] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <div className="text-base font-extrabold leading-tight">{headerTitle}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Messages */}
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
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
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

        {/* Input */}
        <div className="border-t border-border bg-card px-3 py-3">
          <div className="mb-2 flex items-center gap-2">
            <button
              onClick={askHint}
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-300"
            >
              <Lightbulb className="size-3.5" />
              {tutorLang === "zh" ? `提示 (Lv ${hintLevel}/3)` : `Hint (Lv ${hintLevel}/3)`}
            </button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder={tutorLang === "zh" ? "对这道题有什么疑问？" : "Any question about this problem?"}
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
      </div>
    </div>
  );
}

export default TutorChat;