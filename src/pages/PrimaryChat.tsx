import { T } from "@/i18n/T";import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Trophy, Check, X, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { speak } from "@/lib/speak";
import { supabase } from "@/integrations/supabase/client";
import { awardForCorrect, awardForBlock, notifyWrong } from "@/lib/coins";
import { cn } from "@/lib/utils";
import { celebrateScore } from "@/lib/feedback";
import { track, bumpTurn, classifyTopic, detectLang } from "@/lib/sparkTrack";
import { bondOnChatTurn, bondOnQuizWin } from "@/lib/petGrowth";

type Msg = {role: "user" | "assistant";content: string;};

const STARTERS = [
"Hi Spark! 👋",
"What's your favorite color? 🎨",
"I like apples 🍎",
"Let's count to 10!",
"Tell me a fun fact 🐾"];


const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/primary-chat`;
const QUIZ_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-vocab-quiz`;

type QuizItem = {
  term: string;
  question_cn: string;
  options_cn: string[];
  answer_index: number;
  example_en: string;
};

export default function PrimaryChat() {
  const [messages, setMessages] = useState<Msg[]>([
  { role: "assistant", content: "Hi! I'm Spark 🐶✨ Nice to meet you! What's your favorite animal? (动物)" }]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const qStartRef = useRef<Record<number, number>>({});
  // Quiz state
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizItems, setQuizItems] = useState<QuizItem[] | null>(null);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  // Track which term Spark "remembered" this session — so we can detect
  // whether the kid emotionally engaged with it (the gold-standard signal).
  const rememberedTermRef = useRef<string | null>(null);

  // chat_opened: fires once per page load
  useEffect(() => {
    track("chat_opened", {});
    const handleUnload = () => track("session_end", {});
    window.addEventListener("pagehide", handleUnload);
    return () => window.removeEventListener("pagehide", handleUnload);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // "Spark remembers" — on mount, if the user has a due mistake from a previous
  // chat, gently weave it into the opening line. This is the "AI 个性记忆" hook:
  // Spark naturally asks "do you still remember X?" instead of showing a quiz UI,
  // so review feels like conversation, not a test.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u?.user) return;
        const { data } = await supabase.
        from("user_mistakes").
        select("snapshot, source_key").
        eq("user_id", u.user.id).
        eq("module", "primary_chat_quiz").
        eq("is_resolved", false).
        lte("next_review_at", new Date().toISOString()).
        order("next_review_at", { ascending: true }).
        limit(3);
        if (cancelled || !data?.length) return;
        // 30% chance to skip — keeps it feeling natural, not mechanical
        if (Math.random() > 0.7) return;
        const pick = data[Math.floor(Math.random() * data.length)];
        const snap = (pick.snapshot ?? {}) as {term?: string;};
        const term = snap.term;
        if (!term) return;
        rememberedTermRef.current = term.toLowerCase();
        track("remembered_shown", { term });
        setMessages([{
          role: "assistant",
          content: `Hi again! 🐶✨ I missed you! Last time we talked about "${term}". Do you still remember what it means? 💭`
        }]);
      } catch {/* silently fall back to default greeting */}
    })();
    return () => {cancelled = true;};
  }, []);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: t };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setLoading(true);
    const turnNum = bumpTurn();
    const topic = classifyTopic(t);
    const lang = detectLang(t);
    const usedStarter = STARTERS.includes(text);
    track("turn_sent", {
      topic,
      lang,
      msg_len: t.length,
      used_starter: usedStarter,
      turn_num: turnNum
    });
    // Spark grows a tiny bit every time the kid talks to it.
    bondOnChatTurn();
    // Did the kid actually engage with what Spark remembered?
    const rt = rememberedTermRef.current;
    if (rt && turnNum <= 2 && t.toLowerCase().includes(rt)) {
      track("remembered_engaged", { term: rt });
      rememberedTermRef.current = null; // only fire once
    }
    const replyStartedAt = Date.now();
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ messages: next, grade: 3 })
      });
      if (resp.status === 429) {toast.error("说慢点儿 🐾 等 5 秒再试");throw new Error("rate");}
      if (resp.status === 402) {toast.error("AI 额度用完啦 ✨");throw new Error("pay");}
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
          if (j === "[DONE]") {done = true;break;}
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
          } catch {buf = line + "\n" + buf;break;}
        }
      }
      // auto-speak Spark's reply
      if (acc) {
        const englishOnly = acc.replace(/[\u4e00-\u9fff（）()]/g, "").replace(/\s+/g, " ").trim();
        if (englishOnly) speak(englishOnly).catch(() => {});
      }
      track("spark_replied", {
        latency_ms: Date.now() - replyStartedAt,
        reply_len: acc.length
      });
      // 对话挂钩：用户输入英文越多奖励越多 (每 3 个英文单词 +1，封顶 5)
      try {
        const userEn = (t.match(/[a-zA-Z]+/g) || []).length;
        const reward = Math.min(5, Math.floor(userEn / 3) + 1);
        if (reward > 0) {
          const m = await import("@/lib/coins");
          await m.awardCoins(reward, "primary_chat_turn");
        }
      } catch {/* noop */}
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function startQuiz() {
    if (quizLoading) return;
    const turns = messages.filter((m) => m.content.trim()).length;
    if (turns < 2) {toast.info("先和 Spark 聊几句再来出题吧 🐾");return;}
    setQuizLoading(true);
    track("quiz_started", { turns_before_quiz: turns });
    try {
      const resp = await fetch(QUIZ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ messages })
      });
      if (resp.status === 429) {toast.error("AI 正忙，5 秒后再试");return;}
      if (resp.status === 402) {toast.error("AI 额度用完啦");return;}
      const data = await resp.json();
      if (!data?.items?.length) {toast.error("没有提取到可练习的单词");return;}
      setQuizItems(data.items);
      setPicks({});
      setStreak(0);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    } catch (e) {
      console.error(e);
      toast.error("出题失败，稍后再试");
    } finally {
      setQuizLoading(false);
    }
  }

  async function pickAnswer(qi: number, oi: number) {
    if (picks[qi] !== undefined || !quizItems) return;
    const ms = Date.now() - (qStartRef.current[qi] ?? Date.now());
    qStartRef.current[qi] = Date.now();
    const item = quizItems[qi];
    const ok = oi === item.answer_index;
    setPicks((p) => ({ ...p, [qi]: oi }));
    speak(item.term).catch(() => {});
    // Feed Spark vocab quiz into unified_mastery → Dashboard / SkillRadar
    try {
      const { recordUnifiedAttempt } = await import("@/lib/unifiedMastery");
      recordUnifiedAttempt({
        stage: "primary",
        grade: 3,
        module: "vocab",
        item_type: "primary_chat_quiz",
        item_id: `chat:${item.term.toLowerCase()}`,
        item_label: item.term,
        is_correct: ok,
        user_answer: item.options_cn[oi],
        correct_answer: item.options_cn[item.answer_index]
      }).catch(() => {});
    } catch {/* non-blocking */}
    if (ok) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      await awardForCorrect(newStreak, "primary_chat_quiz", undefined, "primary_chat", ms);
      const total = Object.keys(picks).length + 1;
      if (total > 0 && total % 5 === 0) await awardForBlock("primary_chat_quiz");
    } else {
      setStreak(0);
      notifyWrong();
      // 写入错题本
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user) {
          const correctText = item.options_cn[item.answer_index];
          const userText = item.options_cn[oi];
          await supabase.from("user_mistakes").upsert({
            user_id: u.user.id,
            module: "primary_chat_quiz",
            source_key: `chat:${item.term.toLowerCase()}`,
            source_label: `Spark 对话词汇 · ${item.term}`,
            question: item.question_cn,
            user_answer: userText,
            correct_answer: correctText,
            explanation: item.example_en,
            snapshot: { term: item.term, options: item.options_cn, answer_index: item.answer_index, example_en: item.example_en }
          }, { onConflict: "user_id,module,source_key" });
        }
      } catch (e) {console.warn("save mistake failed", e);}
    }
  }

  const allDone = quizItems && Object.keys(picks).length === quizItems.length;
  const correctCount = quizItems ? quizItems.filter((it, i) => picks[i] === it.answer_index).length : 0;
  const celebratedKey = useRef<string>("");
  useEffect(() => {
    if (!allDone || !quizItems) return;
    const key = `${quizItems.length}-${correctCount}`;
    if (celebratedKey.current === key) return;
    celebratedKey.current = key;
    celebrateScore(Math.round(correctCount / quizItems.length * 100));
    track("quiz_finished", { correct: correctCount, total: quizItems.length });
    if (correctCount / quizItems.length >= 0.6) bondOnQuizWin();
  }, [allDone, quizItems, correctCount]);

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
            <div className="text-xs text-muted-foreground"><T>你的英语小伙伴</T></div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl w-full mx-auto">
        {messages.map((m, i) =>
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
            className={`px-4 py-3 max-w-[80%] text-base leading-relaxed cursor-pointer ${
            m.role === "user" ?
            "bg-gradient-to-br from-sky-400 to-blue-500 text-white" :
            "bg-white"}`
            }
            onClick={() => {
              if (m.role === "assistant" && m.content) {
                const en = m.content.replace(/[\u4e00-\u9fff（）()]/g, "").replace(/\s+/g, " ").trim();
                if (en) speak(en).catch(() => {});
              }
            }}>
            
              {m.content || (loading && i === messages.length - 1 ? <span className="text-muted-foreground"><T>Spark 正在想…✨</T></span> : null)}
            </Card>
          </div>
        )}

        {/* Quiz section */}
        {quizItems &&
        <div className="mt-4 space-y-3 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 p-4 shadow">
            <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700">
              <Trophy className="size-4" /> <T>对话小测：刚才学到的单词</T>
              <span className="ml-auto text-xs text-muted-foreground">{Object.keys(picks).length}/{quizItems.length}</span>
            </div>
            {quizItems.map((it, qi) => {
            const picked = picks[qi];
            return (
              <Card key={qi} className="p-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-rose-600">{it.term}</span>
                    <button onClick={() => speak(it.term).catch(() => {})} className="rounded-full bg-rose-100 p-1 text-rose-600">
                      <Volume2 className="size-3.5" />
                    </button>
                    <span className="text-muted-foreground">· {it.question_cn}</span>
                  </div>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {it.options_cn.map((opt, oi) => {
                    const isAns = picked !== undefined && oi === it.answer_index;
                    const isWrong = picked === oi && oi !== it.answer_index;
                    return (
                      <button key={oi} disabled={picked !== undefined} onClick={() => pickAnswer(qi, oi)}
                      className={cn("flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                      picked === undefined && "border-border bg-card hover:border-rose-300",
                      isAns && "border-emerald-500 bg-emerald-50",
                      isWrong && "border-rose-500 bg-rose-50",
                      picked !== undefined && !isAns && !isWrong && "opacity-50")}>
                          <span>{opt}</span>
                          {isAns && <Check className="size-4 text-emerald-600" />}
                          {isWrong && <X className="size-4 text-rose-600" />}
                        </button>);

                  })}
                  </div>
                  {picked !== undefined && it.example_en &&
                <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">💡 {it.example_en}</div>
                }
                </Card>);

          })}
            {allDone &&
          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 p-4 text-center text-white shadow">
                <div className="text-lg font-extrabold"><T>🎉 完成！答对</T> {correctCount}/{quizItems.length}</div>
                <p className="mt-1 text-xs opacity-90">{correctCount < quizItems.length ? "做错的题已收进错题本，明天复习记得更牢哦" : "全对啦！太棒了 ✨"}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => {setQuizItems(null);setPicks({});}}><T>继续聊天</T></Button>
                  <Button size="sm" asChild className="bg-white text-rose-600 hover:bg-white/90"><Link to="/mistakes"><T>📒 错题本</T></Link></Button>
                </div>
              </div>
          }
          </div>
        }
      </div>

      <div className="p-3 border-t bg-white/80 backdrop-blur">
        <div className="max-w-2xl mx-auto space-y-2">
          {!quizItems &&
          <div className="flex justify-center">
              <Button size="sm" variant="outline" disabled={quizLoading || loading} onClick={startQuiz}
            className="rounded-full border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100">
                {quizLoading ? <><Loader2 className="mr-1 size-3.5 animate-spin" /> <T>AI 出题中…</T></> : <><Trophy className="mr-1 size-3.5" /> <T>结束对话 · 出小测</T></>}
              </Button>
            </div>
          }
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STARTERS.map((s) =>
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-sm">
              {s}</button>
            )}
          </div>
          <form
            onSubmit={(e) => {e.preventDefault();send(input);}}
            className="flex gap-2">
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="说点什么给 Spark…"
              className="text-base"
              disabled={loading} />
            
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>);

}