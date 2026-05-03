import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { speak } from "@/lib/speak";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Hi Spark! 👋",
  "What's your favorite color? 🎨",
  "I like apples 🍎",
  "Let's count to 10!",
  "Tell me a fun fact 🐾",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/primary-chat`;

export default function PrimaryChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm Spark 🐶✨ Nice to meet you! What's your favorite animal? (动物)" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: t };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, grade: 3 }),
      });
      if (resp.status === 429) { toast.error("说慢点儿 🐾 等 5 秒再试"); throw new Error("rate"); }
      if (resp.status === 402) { toast.error("AI 额度用完啦 ✨"); throw new Error("pay"); }
      if (!resp.ok || !resp.body) throw new Error("stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((prev) => {
                const copy = prev.slice();
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      // auto-speak Spark's reply
      if (acc) {
        const englishOnly = acc.replace(/[\u4e00-\u9fff（）()]/g, "").replace(/\s+/g, " ").trim();
        if (englishOnly) speak(englishOnly).catch(() => {});
      }
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-sky-50 flex flex-col">
      <header className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/primary"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-pink-400 flex items-center justify-center text-xl">🐶</div>
          <div>
            <div className="font-bold flex items-center gap-1">Spark <Sparkles className="h-4 w-4 text-amber-500" /></div>
            <div className="text-xs text-muted-foreground">你的英语小伙伴</div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`px-4 py-3 max-w-[80%] text-base leading-relaxed cursor-pointer ${
                m.role === "user"
                  ? "bg-gradient-to-br from-sky-400 to-blue-500 text-white"
                  : "bg-white"
              }`}
              onClick={() => {
                if (m.role === "assistant" && m.content) {
                  const en = m.content.replace(/[\u4e00-\u9fff（）()]/g, "").replace(/\s+/g, " ").trim();
                  if (en) speak(en).catch(() => {});
                }
              }}
            >
              {m.content || (loading && i === messages.length - 1 ? <span className="text-muted-foreground">Spark 正在想…✨</span> : null)}
            </Card>
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-white/80 backdrop-blur">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="shrink-0 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-sm"
              >{s}</button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="说点什么给 Spark…"
              className="text-base"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}