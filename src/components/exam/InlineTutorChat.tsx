import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * 试卷主题的内嵌「译老师」苏格拉底式 AI 辅导组件。
 * 复用现有 tutor-chat 边缘函数（streaming SSE）。
 * 多轮对话本地持久化（按 sessionKey）。
 */

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
}

export interface InlineTutorChatProps {
  /** 唯一会话 key，用于 localStorage 持久化（建议 `${context}:${ref}`）。 */
  sessionKey: string;
  /** tutor-chat 的 context 桶 */
  context: string;
  /** 题目 / 文章 ref（稳定 ID） */
  questionRef: string;
  /** 提交给 AI 的全部上下文（文章+题目+用户答案+解析）。保持紧凑。 */
  questionSnapshot: Record<string, unknown>;
  /** 顶部主标题，例如 "译老师" */
  title?: string;
  /** 副标题（一行） */
  subtitle?: string;
  /** 起始建议追问 */
  starters?: string[];
  /** 预填问题（首次进入时自动展示在输入框里） */
  prefill?: string;
  /** "free" | "question"，默认 free（讨论整篇文章/题目都行） */
  mode?: "free" | "question";
}

const DEFAULT_STARTERS = [
  "我不明白第 1 题为什么不选我那个答案",
  "帮我梳理一下文章的主旨脉络",
  "文章里有哪个长难句？带我拆解一下",
];

export function InlineTutorChat({
  sessionKey,
  context,
  questionRef,
  questionSnapshot,
  title = "译老师",
  subtitle = "苏格拉底式 AI 主教 · 不会直接给答案，会引导你看到原文证据",
  starters = DEFAULT_STARTERS,
  prefill,
  mode = "free",
}: InlineTutorChatProps) {
  const storageKey = `tutor-chat:${sessionKey}`;

  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState(prefill ?? "");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      /* quota */
    }
  }, [messages, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setSending(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      if (!token) {
        toast.error("请先登录后再使用 AI 答疑");
        setSending(false);
        setMessages((prev) => prev.slice(0, -2));
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
          language: "zh",
          hint_level: 1,
          mode,
          topic:
            (questionSnapshot?.title as string) ||
            (questionSnapshot?.topic as string) ||
            "当前阅读文章",
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          let msg = "今天的答疑次数已用完，明天再来吧 🌙";
          try {
            const j = await resp.json();
            if (j?.message) msg = j.message;
          } catch {
            /* */
          }
          toast.error(msg);
        } else if (resp.status === 402) {
          toast.error("AI 额度不足，请稍后再试");
        } else {
          toast.error("AI 暂时无法回复，请稍后再试");
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
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(j);
            const c = parsed.choices?.[0]?.delta?.content;
            if (typeof c === "string") {
              acc += c;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant")
                  next[next.length - 1] = { ...last, content: acc };
                return next;
              });
            }
          } catch {
            /* partial */
          }
        }
      }
    } catch (e) {
      console.error("inline tutor send", e);
      toast.error("网络异常，请稍后再试");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    if (!confirm("清空当前对话？")) return;
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* */
    }
  };

  return (
    <div className="exam-card flex h-[calc(100vh-12rem)] min-h-[520px] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b exam-divider px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="grid size-11 place-items-center rounded-full text-[18px] exam-display"
            style={{
              background: "hsl(var(--exam-ink))",
              color: "hsl(var(--exam-paper))",
            }}
          >
            译
          </div>
          <div className="min-w-0">
            <div className="exam-display text-[17px] truncate">{title}</div>
            <div className="exam-mute text-[12px] truncate">{subtitle}</div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="text-[11px] exam-mute hover:text-[hsl(var(--exam-accent))]"
          >
            清空对话
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md text-center py-6">
            <div className="text-4xl mb-3">📜</div>
            <div className="exam-display text-[16px] mb-1">从这道阅读开始你的提问</div>
            <div className="exam-mute text-[13px] mb-5">
              我读过你刚刚做的这篇文章和题目。直接问我："第 N 题为什么不选 X？" — 我会带你回到原文找证据。
            </div>
            <div className="flex flex-col gap-2 items-stretch">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border px-4 py-2.5 text-[13px] text-left hover:bg-[hsl(var(--exam-paper-soft))] transition exam-divider"
                >
                  <Sparkles className="inline size-3.5 mr-1.5 opacity-60" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            {m.role === "assistant" ? (
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-[hsl(var(--exam-paper-soft))] border exam-divider">
                <div className="exam-eyebrow mb-1.5">译老师</div>
                {m.content ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-strong:text-[hsl(var(--exam-accent))] text-[14.5px] leading-relaxed">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <Loader2 className="size-4 animate-spin opacity-70" />
                )}
              </div>
            ) : (
              <div
                className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap"
                style={{
                  background: "hsl(var(--exam-ink))",
                  color: "hsl(var(--exam-paper))",
                }}
              >
                {m.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t exam-divider px-3 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
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
            placeholder="对这篇阅读、这些题、或某个长难句…有什么疑问？"
            className="min-h-[44px] max-h-32 flex-1 resize-none rounded-2xl border exam-divider bg-[hsl(var(--exam-paper))] px-3 py-2.5 text-[14px] outline-none focus:border-[hsl(var(--exam-ink))]"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="exam-btn exam-btn-primary !h-11 !w-11 !p-0 shrink-0 rounded-full"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InlineTutorChat;