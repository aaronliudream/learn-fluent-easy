import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReportAIButton from "@/components/pet/ReportAIButton";
import { T, useT } from "@/i18n/T";

/**
 * PetChat — short, safe conversations with the learner's companion.
 *
 * Calls the `pet-chat` edge function which already enforces:
 *  - daily quota (30 turns/day)
 *  - input PII redaction
 *  - output keyword post-filter + audit log
 *
 * UI is intentionally minimal: 1-tap send, no history sidebar (kids get
 * overwhelmed). Last 10 turns persist server-side and are auto-loaded.
 */

type Msg = { role: "user" | "assistant"; content: string; id?: string };

export default function PetChat({ petName = "小伙伴" }: { petName?: string }) {
  const t = useT();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quotaHit, setQuotaHit] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const { data } = await (supabase as any)
        .from("pet_chat_messages")
        .select("id,role,content")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setMsgs([...data].reverse() as Msg[]);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy || quotaHit) return;
    setMsgs(m => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-chat", { body: { message: text } });
      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 429) {
          setQuotaHit(true);
          setMsgs(m => [...m, { role: "assistant", content: t("今天和我聊天的次数用完啦，明天再来吧 🌙") }]);
        } else {
          setMsgs(m => [...m, { role: "assistant", content: t("我有点累了，等会儿再聊好吗？") }]);
        }
        return;
      }
      const reply = (data as any)?.reply || "…";
      const rem = (data as any)?.remaining_calls;
      if (typeof rem === "number") setRemaining(rem);
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: t("网络好像断了，再试一次吧。") }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[420px] flex-col rounded-2xl border-2 border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-3 py-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold">
          <Sparkles className="size-3.5 text-violet-500" />
          <T>和</T> {petName} <T>聊天</T>
        </div>
        {remaining !== null && (
          <span className="text-[10px] text-muted-foreground"><T>今日剩余</T> {remaining} <T>轮</T></span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {msgs.length === 0 && (
          <div className="rounded-xl bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            <T>打个招呼吧！比如 "今天我学了 5 个新单词"</T>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              {m.content}
              {m.role === "assistant" && (
                <div className="mt-1 flex justify-end">
                  <ReportAIButton feature="pet_chat" contentSnippet={m.content} />
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="inline size-3 animate-spin" /> {petName} <T>在想…</T>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-background p-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          disabled={busy || quotaHit}
          maxLength={300}
          placeholder={quotaHit ? t("今日额度用完了") : t("说点什么…")}
          className="flex-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={busy || quotaHit || !input.trim()}
          className="rounded-full bg-primary p-2 text-primary-foreground shadow disabled:opacity-50"
          aria-label={t("发送")}
        >
          <Send className="size-4" />
        </button>
      </div>
      <p className="px-3 py-1 text-center text-[9px] text-muted-foreground">
        🛡️ <T>不要分享真实姓名、住址或电话。AI 回复仅供参考。</T>
      </p>
    </div>
  );
}