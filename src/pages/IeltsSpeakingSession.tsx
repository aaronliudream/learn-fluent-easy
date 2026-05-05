import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mic, Send, Square, Loader2, ArrowLeft, AlertCircle, Trophy, RefreshCw, Sparkles, Volume2, VolumeX, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { IeltsVoiceCall } from "@/components/IeltsVoiceCall";
type Msg = { role: "user" | "assistant"; content: string; part: 1 | 2 | 3 };
type SessionRow = {
  id: string;
  target_band: number;
  mode: string;
  topic_category: string | null;
  current_part: 1 | 2 | 3;
  status: string;
  transcript: Msg[];
  feedback: Feedback | null;
  overall_band: number | null;
};

type FeedbackError = {
  part: number;
  original: string;
  corrected: string;
  explanation_zh: string;
  higher_band_version: string;
  error_type: string;
  ielts_dimension: string;
  severity: number;
};
type Feedback = {
  overall_band: number;
  scores: Record<string, { band: number | null; comment: string; evidence: string[] }>;
  errors: FeedbackError[];
  missed_opportunities: { context: string; what_you_said: string; higher_band_version: string; why_better: string }[];
  strengths: string[];
  next_session_plan: { focus_areas: string[]; micro_task: string; suggested_topics: string[] };
  summary_zh: string;
};

const DIMENSION_LABEL: Record<string, string> = {
  fluency_coherence: "流利度与连贯性",
  lexical_resource: "词汇丰富度",
  grammar: "语法准确性",
  pronunciation: "发音",
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ielts-examiner-chat`;

export default function IeltsSpeakingSession() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [grading, setGrading] = useState(false);
  const [retryHint, setRetryHint] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const voiceOnRef = useRef(true);
  const speakingRef = useRef(false);
  const [callOpen, setCallOpen] = useState(false);
  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);

  const speak = useCallback((text: string) => {
    if (!voiceOnRef.current || !text) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB";
      u.rate = 0.95;
      u.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const pref = voices.find((v) => /en-GB/i.test(v.lang)) || voices.find((v) => /en[-_]/i.test(v.lang));
      if (pref) u.voice = pref;
      speakingRef.current = true;
      u.onend = () => { speakingRef.current = false; };
      u.onerror = () => { speakingRef.current = false; };
      window.speechSynthesis.speak(u);
    } catch (e) { console.warn("tts err", e); }
  }, []);

  // Stop any speech when leaving the page
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* */ } }, []);

  // Load session
  useEffect(() => {
    if (!id) return;
    supabase.from("ielts_sessions").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { toast.error("会话不存在"); nav("/ielts-speaking"); return; }
      const s = data as unknown as SessionRow;
      setSession(s);
      setMessages((s.transcript as Msg[]) || []);
      setCurrentPart((s.current_part as 1 | 2 | 3) || 1);

      // If no messages yet, kick off the examiner's first turn
      if (!s.transcript || (s.transcript as any[]).length === 0) {
        setTimeout(() => sendToExaminer([], 1, s), 300);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Persist transcript on every update
  const persist = useCallback(async (next: Msg[], part: 1 | 2 | 3) => {
    if (!id) return;
    await supabase.from("ielts_sessions")
      .update({ transcript: next as any, current_part: part })
      .eq("id", id);
  }, [id]);

  const sendToExaminer = useCallback(async (history: Msg[], part: 1 | 2 | 3, ctx?: SessionRow) => {
    const s = ctx || session;
    if (!s) return;
    setStreaming(true);
    setRetryHint(null);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          part,
          targetBand: s.target_band,
          topicCategory: s.topic_category,
          mode: s.mode,
        }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("AI 请求过频，稍后重试");
        else if (resp.status === 402) toast.error("AI 额度已用完");
        else toast.error("考官响应失败");
        setStreaming(false);
        return;
      }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      // Insert pending assistant turn
      const startIdx = history.length;
      setMessages([...history, { role: "assistant", content: "", part }]);
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const ch = p.choices?.[0]?.delta?.content as string | undefined;
            if (ch) {
              acc += ch;
              setMessages((prev) => {
                const next = [...prev];
                next[startIdx] = { role: "assistant", content: acc, part };
                return next;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      // Detect part-advance tokens
      let nextPart: 1 | 2 | 3 = part;
      let endNow = false;
      let cleaned = acc;
      if (acc.includes("[[ADVANCE_TO_PART_2]]")) { nextPart = 2; cleaned = cleaned.replace("[[ADVANCE_TO_PART_2]]", "").trim(); }
      if (acc.includes("[[ADVANCE_TO_PART_3]]")) { nextPart = 3; cleaned = cleaned.replace("[[ADVANCE_TO_PART_3]]", "").trim(); }
      if (acc.includes("[[END_OF_TEST]]")) { endNow = true; cleaned = cleaned.replace("[[END_OF_TEST]]", "").trim(); }

      const finalMsgs: Msg[] = [...history, { role: "assistant", content: cleaned, part }];
      setMessages(finalMsgs);
      setCurrentPart(nextPart);
      await persist(finalMsgs, nextPart);

      // Speak the examiner's reply aloud
      if (cleaned) speak(cleaned);

      if (endNow) {
        setTimeout(() => grade(finalMsgs), 500);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("考官响应失败");
    } finally {
      setStreaming(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, persist]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming || !session) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text, part: currentPart }];
    setMessages(next);
    await persist(next, currentPart);

    // Training mode: short answer warning to push retry mindset
    if (session.mode === "training" && text.split(/\s+/).length < 12) {
      setRetryHint("回答太短了 — 雅思 6+ 通常需要 25 词以上 + 1 个理由 + 1 个例子。试着扩展再说一次。");
    } else {
      setRetryHint(null);
    }

    await sendToExaminer(next, currentPart);
  }, [input, streaming, session, messages, currentPart, persist, sendToExaminer]);

  // Voice input via Web Speech API
  const toggleRecord = useCallback(() => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { toast.error("浏览器不支持语音输入，请用 Chrome 或 Edge"); return; }
    if (recording) {
      try { recognitionRef.current?.stop(); } catch { /* */ }
      setRecording(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
      }
      if (final) setInput((prev) => (prev ? prev + " " : "") + final.trim());
    };
    rec.onerror = (e: any) => { console.error("speech err", e); setRecording(false); };
    rec.onend = () => setRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
  }, [recording]);

  const grade = useCallback(async (transcript: Msg[]) => {
    if (!session || !id) return;
    setGrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("grade-ielts-speaking", {
        body: {
          sessionId: id,
          transcript: transcript.map((m) => ({ role: m.role, text: m.content, part: m.part })),
          targetBand: session.target_band,
          mode: session.mode,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Reload full session
      const { data: fresh } = await supabase.from("ielts_sessions").select("*").eq("id", id).maybeSingle();
      if (fresh) setSession(fresh as unknown as SessionRow);
      toast.success("评分完成 🎯");
    } catch (e: any) {
      console.error(e);
      toast.error("评分失败：" + (e?.message || ""));
    } finally {
      setGrading(false);
    }
  }, [session, id]);

  const endNow = useCallback(() => {
    if (messages.length < 4) {
      toast("对话太短，请至少完成 Part 1 后再结束");
      return;
    }
    if (confirm("确定结束并生成评分吗？")) grade(messages);
  }, [messages, grade]);

  // ==================== RENDER ====================
  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  // Show feedback view if graded
  if (session.status === "graded" && session.feedback) {
    return <FeedbackView session={session} onRetry={() => nav("/ielts-speaking")} />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-4 pt-6 md:px-6 md:pt-10">
      <header className="mb-3 flex items-center justify-between">
        <button onClick={() => nav("/ielts-speaking")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Part {currentPart} · 目标 Band {session.target_band.toFixed(1)}
          </span>
          <button
            onClick={() => {
              setVoiceOn((v) => {
                if (v) { try { window.speechSynthesis.cancel(); } catch { /* */ } }
                return !v;
              });
            }}
            className="grid size-8 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
            title={voiceOn ? "关闭考官语音" : "开启考官语音"}
            aria-label={voiceOn ? "关闭考官语音" : "开启考官语音"}
          >
            {voiceOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button
            onClick={() => setCallOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-600"
            title="开启真人语音对话（ElevenLabs）"
          >
            <Phone className="size-3.5" /> 真人语音
          </button>
          <button
            onClick={endNow}
            disabled={grading}
            className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            {grading ? <Loader2 className="size-3.5 animate-spin" /> : "结束并评分"}
          </button>
        </div>
      </header>

      {/* Part progress indicator */}
      <div className="mb-3 flex gap-1">
        {[1, 2, 3].map((p) => (
          <div
            key={p}
            className={`h-1.5 flex-1 rounded-full transition ${
              p < currentPart ? "bg-primary" : p === currentPart ? "bg-primary/50" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-card">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              考官准备中…
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {m.role === "assistant" && (
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Examiner · Part {m.part}
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.content || (streaming && i === messages.length - 1 ? "…" : "")}</div>
            </div>
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-secondary px-4 py-2.5">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {retryHint && (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>{retryHint}</div>
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex items-end gap-2">
        <button
          onClick={toggleRecord}
          disabled={streaming}
          className={`grid size-12 shrink-0 place-items-center rounded-2xl shadow-md transition disabled:opacity-50 ${
            recording ? "bg-rose-500 text-white animate-pulse" : "bg-card text-foreground ring-1 ring-border hover:bg-secondary"
          }`}
          aria-label={recording ? "停止录音" : "语音输入"}
        >
          {recording ? <Square className="size-5" /> : <Mic className="size-5" />}
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={recording ? "正在听你说英语…说完按方块停止" : "用英语回答（Enter 发送 · Shift+Enter 换行）"}
          rows={2}
          disabled={streaming}
          className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!input.trim() || streaming}
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-50"
        >
          <Send className="size-5" />
        </button>
      </div>

      {/* Mount IeltsVoiceCall ONLY when the user opens the voice call.
          The ElevenLabs `useConversation` hook touches navigator.mediaDevices /
          AudioContext / WebRTC at init time and can throw in iOS private mode,
          Capacitor WebView, or restricted networks — bringing the whole page
          down (no global ErrorBoundary). Lazy mounting eliminates that risk. */}
      {callOpen && (
        <IeltsVoiceCall
          open={callOpen}
          onClose={() => { setCallOpen(false); persist(messages, currentPart); }}
          targetBand={session.target_band}
          currentPart={currentPart}
          initialTranscript={messages}
          onTranscriptUpdate={(next) => setMessages(next)}
        />
      )}
    </main>
  );
}

// ==================== FEEDBACK VIEW ====================
function FeedbackView({ session, onRetry }: { session: SessionRow; onRetry: () => void }) {
  const fb = session.feedback!;
  // Defensive: AI output (Gemini/GPT) can be malformed or truncated. Coerce
  // every field we read to a safe shape so a missing key never blanks the
  // whole report page.
  const overallBand = typeof fb?.overall_band === "number" ? fb.overall_band : 0;
  const summary = fb?.summary_zh || "评分已完成";
  const scoresEntries = fb?.scores && typeof fb.scores === "object"
    ? Object.entries(fb.scores)
    : [];
  const errors = Array.isArray(fb?.errors) ? fb.errors : [];
  const missed = Array.isArray(fb?.missed_opportunities) ? fb.missed_opportunities : [];
  const strengths = Array.isArray(fb?.strengths) ? fb.strengths : [];
  const plan = fb?.next_session_plan || {};
  const focusAreas = Array.isArray((plan as any).focus_areas) ? (plan as any).focus_areas : [];
  const suggestedTopics = Array.isArray((plan as any).suggested_topics) ? (plan as any).suggested_topics : [];
  const microTask = (plan as any).micro_task || "";
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader title="雅思口语评分报告" subtitle={summary} back="/ielts-speaking" />

      {/* Overall band */}
      <section className="mb-5 rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 text-center shadow-card dark:from-amber-950/30 dark:to-amber-900/10">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Overall Band Score</div>
        <div className="text-6xl font-black text-amber-600 dark:text-amber-400">{overallBand.toFixed(1)}</div>
        <div className="mt-1 text-xs text-muted-foreground">目标 Band {session.target_band.toFixed(1)} · {overallBand >= session.target_band ? "✅ 已达标" : `差 ${(session.target_band - overallBand).toFixed(1)} 分`}</div>
      </section>

      {/* 4 dimension scores */}
      {scoresEntries.length > 0 && (
        <section className="mb-5 grid grid-cols-2 gap-3">
          {scoresEntries.map(([key, raw]) => {
            const s = (raw || {}) as { band?: number | null; comment?: string; evidence?: string[] };
            const bandText = typeof s.band === "number" ? s.band.toFixed(1) : "N/A";
            const evidence = Array.isArray(s.evidence) ? s.evidence : [];
            return (
              <div key={key} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="text-xs font-semibold text-muted-foreground">{DIMENSION_LABEL[key] || key}</div>
                <div className="mt-1 text-2xl font-extrabold text-primary">{bandText}</div>
                {s.comment && <div className="mt-1.5 text-xs leading-relaxed text-foreground/80">{s.comment}</div>}
                {evidence.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {evidence.map((ev, i) => (
                      <div key={i} className="text-[11px] italic text-muted-foreground">"{ev}"</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Top errors */}
      {errors.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-2 text-sm font-bold">⚠️ 优先改进的 {errors.length} 个错误</h3>
          <div className="space-y-2">
            {errors.map((e: any, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                    Part {e?.part ?? "?"} · {DIMENSION_LABEL[e?.ielts_dimension] || e?.ielts_dimension || ""}
                  </span>
                  {e?.error_type && <span className="text-[10px] text-muted-foreground">{e.error_type}</span>}
                </div>
                <div className="space-y-1.5 text-sm">
                  {e?.original && <div><span className="font-bold text-rose-600">❌ </span><span className="line-through opacity-70">{e.original}</span></div>}
                  {e?.corrected && <div><span className="font-bold text-emerald-600">✅ </span>{e.corrected}</div>}
                  {e?.explanation_zh && <div className="text-xs text-muted-foreground">💡 {e.explanation_zh}</div>}
                  {e?.higher_band_version && (
                    <div className="mt-1.5 rounded-lg bg-amber-500/10 p-2 text-xs">
                      <span className="font-bold text-amber-700">Band 7+ 升级：</span> {e.higher_band_version}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Missed opportunities */}
      {missed.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-2 text-sm font-bold">✨ 错过的高分表达</h3>
          <div className="space-y-2">
            {missed.map((m: any, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                {m?.context && <div className="text-xs text-muted-foreground">{m.context}</div>}
                {m?.what_you_said && <div className="mt-1.5 text-sm">你说的: <span className="text-muted-foreground">"{m.what_you_said}"</span></div>}
                {m?.higher_band_version && <div className="mt-1 text-sm font-semibold text-primary">高分版: "{m.higher_band_version}"</div>}
                {m?.why_better && <div className="mt-1 text-xs text-muted-foreground">📈 {m.why_better}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <section className="mb-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/5 p-4">
          <h3 className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">👍 你做得好的地方</h3>
          <ul className="space-y-1 text-sm">
            {strengths.map((s: string, i: number) => <li key={i} className="text-foreground/90">• {s}</li>)}
          </ul>
        </section>
      )}

      {/* Next session plan */}
      {(focusAreas.length > 0 || microTask || suggestedTopics.length > 0) && (
        <section className="mb-5 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-primary">
            <Sparkles className="size-4" /> 下次练习计划（教练建议）
          </h3>
          <div className="space-y-2 text-sm">
            {focusAreas.length > 0 && (
              <div>
                <span className="font-semibold">重点突破：</span>
                {focusAreas.join("、")}
              </div>
            )}
            {microTask && (
              <div className="rounded-xl bg-card p-3">
                <span className="font-semibold text-primary">🎯 微练习任务：</span>
                <div className="mt-1 text-foreground/90">{microTask}</div>
              </div>
            )}
            {suggestedTopics.length > 0 && (
              <div className="text-xs text-muted-foreground">
                建议下次话题：{suggestedTopics.join(" · ")}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="flex gap-2">
        <button onClick={onRetry} className="flex-1 rounded-2xl bg-grad-title px-5 py-3 text-sm font-bold text-white shadow-tile">
          <RefreshCw className="mr-1.5 inline size-4" /> 再练一套
        </button>
      </div>
    </main>
  );
}