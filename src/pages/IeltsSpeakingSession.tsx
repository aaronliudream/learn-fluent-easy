import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { ArrowLeft, Loader2, Mic, PhoneOff, Sparkles, Trophy, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

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
  part: number; original: string; corrected: string; explanation_zh: string;
  higher_band_version: string; error_type: string; ielts_dimension: string; severity: number;
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

// Part 2 cue cards (rotated by topic_category if matched, otherwise random)
const CUE_CARDS: { topic: string; card: string }[] = [
  { topic: "people", card: "Describe a person who has had an important influence on your life.\nYou should say:\n• who this person is\n• how you know them\n• what qualities they have\n• and explain why they have influenced you." },
  { topic: "place", card: "Describe a place you have visited that you would recommend to others.\nYou should say:\n• where it is\n• when you went there\n• what you did there\n• and explain why you would recommend it." },
  { topic: "experience", card: "Describe a time when you helped someone.\nYou should say:\n• who you helped\n• when and where it happened\n• how you helped them\n• and explain how you felt about it." },
  { topic: "object", card: "Describe an object that is important to you.\nYou should say:\n• what it is\n• how long you've had it\n• how you got it\n• and explain why it is important to you." },
];

const ELEVENLABS_AGENT_ID = "agent_2801kqvhz6m2ehasqcjadep8zm25";

function pickCueCard(topicCategory: string | null) {
  const t = (topicCategory || "").toLowerCase();
  return CUE_CARDS.find((c) => t.includes(c.topic)) || CUE_CARDS[Math.floor(Math.random() * CUE_CARDS.length)];
}

// Build the system prompt that turns the ElevenLabs agent into a strict
// IELTS examiner running the full Part 1 → Part 2 → Part 3 flow.
function buildExaminerPrompt(opts: { targetBand: number; cueCard: string; topicCategory: string | null }) {
  return `You are Daniel, a certified British IELTS Speaking examiner with 15 years of experience.
You are conducting a live, full IELTS Speaking exam with this candidate.

===========================
EXAM STRUCTURE — FOLLOW STRICTLY
===========================

PART 1 (Interview, 4–5 minutes):
- Greet briefly: "Good morning. My name is Daniel, and I'll be your examiner today. Could you please tell me your full name?"
- Then: "And what shall I call you?" then "Can you tell me where you are from?"
- Then ask 8–10 short questions across 2–3 familiar topics (work/study, hometown, hobbies, food, weather, technology${opts.topicCategory ? `, ${opts.topicCategory}` : ""}).
- Keep YOUR turns SHORT (1 sentence). Do NOT comment on answers. Do NOT teach.
- After ~5 minutes of Part 1, transition: "Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes..."
- Then move to Part 2.

PART 2 (Long turn, 3–4 minutes):
- Read this exact cue card to the candidate:
"""
${opts.cueCard}
"""
- Tell them: "You'll have one minute to think about what you're going to say. You can make some notes if you wish. Then I'd like you to speak for one to two minutes. Do you understand?"
- WAIT in silence for ~60 seconds (do not interrupt during prep).
- Then say: "Alright, please start speaking now."
- Let them speak for up to 2 minutes WITHOUT interrupting.
- After they finish (or hit 2 minutes), ask 1 short rounding-off question, then move to Part 3.

PART 3 (Discussion, 4–5 minutes):
- Transition: "We've been talking about [topic]. I'd like to discuss with you one or two more general questions related to this."
- Ask 4–6 abstract/analytical questions about the broader theme of the Part 2 topic.
- Probe with "Why do you think that?" / "Could you give an example?"
- Keep your questions concise.

After Part 3 is complete (~12–14 min total), say: "Thank you. That is the end of the speaking test." and then end the session.

===========================
EXAMINER BEHAVIOUR
===========================
- Speak in a clear, neutral British English accent.
- Be POLITE but NEUTRAL — no praise ("great!"), no corrections, no teaching.
- If the candidate is silent for >5 seconds in Part 1/3, gently re-prompt or rephrase.
- Never break character. You are an examiner, not a tutor.
- The candidate's target band is ${opts.targetBand}. Calibrate question difficulty accordingly.
- Use natural fillers: "Let's move on.", "Alright.", "I see."
- This is a live oral exam — keep responses short and conversational. NEVER lecture.`;
}

export default function IeltsSpeakingSession() {
  return (
    <ConversationProvider agentId={ELEVENLABS_AGENT_ID} connectionType="webrtc">
      <IeltsSpeakingSessionContent />
    </ConversationProvider>
  );
}

function IeltsSpeakingSessionContent() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [grading, setGrading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds since connected
  const startedAtRef = useRef<number | null>(null);
  const transcriptRef = useRef<Msg[]>([]);
  const partRef = useRef<1 | 2 | 3>(1);
  useEffect(() => { partRef.current = currentPart; }, [currentPart]);
  useEffect(() => { transcriptRef.current = messages; }, [messages]);

  const cueCard = useMemo(() => pickCueCard(session?.topic_category ?? null), [session?.topic_category]);

  // ---- Persist transcript ----
  const persist = useCallback(async (next: Msg[], part: 1 | 2 | 3) => {
    if (!id) return;
    await supabase.from("ielts_sessions")
      .update({ transcript: next as any, current_part: part })
      .eq("id", id);
  }, [id]);

  // ---- Auto-detect part from examiner cues in transcript ----
  const detectPartFromText = useCallback((text: string) => {
    const t = text.toLowerCase();
    if (/(let's continue|now i'd like to discuss|more general questions)/.test(t)) return 3 as const;
    if (/(one to two minutes|here is your topic|cue card|i'd like you to talk about)/.test(t)) return 2 as const;
    return null;
  }, []);

  // ---- ElevenLabs conversation hook ----
  const conversation = useConversation({
    onConnect: () => {
      startedAtRef.current = Date.now();
      setErrorMsg(null);
      toast.success("已接通考官 🎙️");
    },
    onDisconnect: () => {
      // Auto-grade if we have a real conversation
      const msgs = transcriptRef.current;
      if (msgs.length >= 2 && session && id) {
        toast("通话结束，正在生成评分…");
        grade(msgs);
      }
    },
    onError: (err: any) => {
      console.error("EL error", err);
      setErrorMsg(typeof err === "string" ? err : (err?.message || "语音连接出错"));
    },
    onMessage: (msg: any) => {
      try {
        const role: "user" | "assistant" | null =
          msg?.source === "user" ? "user" : msg?.source === "ai" ? "assistant" : null;
        const text = typeof msg?.message === "string" ? msg.message : "";
        if (!role || !text) return;

        if (role === "assistant") {
          const detected = detectPartFromText(text);
          if (detected && detected > partRef.current) {
            partRef.current = detected;
            setCurrentPart(detected);
          }
        }
        const next = [...transcriptRef.current, { role, content: text, part: partRef.current } as Msg];
        transcriptRef.current = next;
        setMessages(next);
        persist(next, partRef.current);
      } catch (e) { console.warn(e); }
    },
  });

  // ---- Load session ----
  useEffect(() => {
    if (!id) return;
    supabase.from("ielts_sessions").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { toast.error("会话不存在"); nav("/ielts-speaking"); return; }
      const s = data as unknown as SessionRow;
      setSession(s);
      setMessages((s.transcript as Msg[]) || []);
      setCurrentPart((s.current_part as 1 | 2 | 3) || 1);
    });
  }, [id, nav]);

  // ---- Start the call as soon as we have the session ----
  const startCall = useCallback(async () => {
    if (!session) return;
    setConnecting(true);
    setErrorMsg(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrorMsg("无法访问麦克风。请在浏览器地址栏允许麦克风权限后重试。");
      setConnecting(false);
      return;
    }
    try {
      // Public agent — connect directly with agentId (no server token needed)
      await conversation.startSession({
        connectionType: "webrtc",
        overrides: {
          agent: {
            prompt: { prompt: buildExaminerPrompt({ targetBand: session.target_band, cueCard: cueCard.card, topicCategory: session.topic_category }) },
            firstMessage: "Good morning. My name is Daniel, and I'll be your examiner today. Could you please tell me your full name?",
            language: "en",
          },
        },
      });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || "无法启动语音对话");
    } finally {
      setConnecting(false);
    }
  }, [session, conversation, cueCard]);

  // Auto-start when session loaded and not already connected/graded
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!session || autoStartedRef.current) return;
    if (session.status === "graded") return;
    autoStartedRef.current = true;
    startCall();
  }, [session, startCall]);

  // ---- Elapsed timer ----
  useEffect(() => {
    if (conversation.status !== "connected") return;
    const t = setInterval(() => {
      if (startedAtRef.current) setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [conversation.status]);

  // ---- End call & grade ----
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

  const hangUp = useCallback(async () => {
    try { await conversation.endSession(); } catch { /* */ }
    // grading is triggered in onDisconnect when transcript is non-trivial
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => () => { try { conversation.endSession(); } catch { /* */ } }, []);

  // ==================== RENDER ====================
  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  if (session.status === "graded" && session.feedback) {
    return <FeedbackView session={session} onRetry={() => nav("/ielts-speaking")} />;
  }

  if (grading) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative grid size-32 place-items-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <Trophy className="relative size-16 text-primary" />
          </div>
          <div className="text-xl font-bold">考官正在评分…</div>
          <div className="text-sm text-muted-foreground">分析你的流利度、词汇、语法、发音 — 通常需要 15-30 秒</div>
        </div>
      </main>
    );
  }

  const status = conversation.status; // "connected" | "disconnected" | ...
  const isConnected = status === "connected";
  const isExaminerSpeaking = isConnected && conversation.isSpeaking;
  const isYourTurn = isConnected && !conversation.isSpeaking;
  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  // Build a "last few" transcript view
  const lastMsgs = messages.slice(-4);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-6 pt-6 md:px-6 md:pt-10">
      {/* Top bar */}
      <header className="mb-4 flex items-center justify-between">
        <button onClick={() => nav("/ielts-speaking")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 退出
        </button>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className={`inline-block size-2 rounded-full ${isConnected ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/40"}`} />
          {isConnected ? `LIVE · ${mins}:${secs}` : connecting ? "接通中…" : "未连接"}
        </div>
      </header>

      {/* Part badge + progress */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            IELTS Speaking · Part {currentPart}
          </div>
          <div className="text-[11px] font-bold text-primary">目标 Band {session.target_band.toFixed(1)}</div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((p) => (
            <div key={p} className={`h-1.5 flex-1 rounded-full transition ${
              p < currentPart ? "bg-primary" : p === currentPart ? "bg-primary/60 animate-pulse" : "bg-muted"
            }`} />
          ))}
        </div>
      </div>

      {/* Cue card (Part 2 only) */}
      {currentPart === 2 && (
        <div className="mb-4 rounded-2xl border-2 border-amber-400/60 bg-amber-50 p-4 shadow-card dark:bg-amber-950/20">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            📋 Cue Card · 你有 1 分钟思考 + 2 分钟陈述
          </div>
          <div className="whitespace-pre-line text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            {cueCard.card}
          </div>
        </div>
      )}

      {/* Big animated orb */}
      <div className="grid flex-1 place-items-center py-4">
        <div className="flex flex-col items-center gap-5">
          <div className="relative grid size-56 place-items-center">
            <div className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-500 ${
              isExaminerSpeaking ? "scale-110 animate-pulse" : isYourTurn ? "scale-100" : "scale-90"
            }`} />
            <div className={`absolute inset-6 rounded-full bg-primary/40 transition ${
              isExaminerSpeaking ? "animate-pulse" : ""
            }`} />
            <div className={`relative grid size-32 place-items-center rounded-full text-primary-foreground shadow-2xl ${
              isExaminerSpeaking
                ? "bg-gradient-to-br from-primary to-primary/70"
                : isYourTurn
                ? "bg-gradient-to-br from-rose-500 to-rose-600"
                : "bg-muted-foreground/30"
            }`}>
              {connecting ? <Loader2 className="size-14 animate-spin" /> : <Mic className="size-14" />}
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold">
              {connecting && "正在接通考官…"}
              {!connecting && isExaminerSpeaking && "🔊 考官正在说话…"}
              {!connecting && isYourTurn && "🎤 请回答（直接开口说英语）"}
              {!connecting && !isConnected && (errorMsg ? "连接失败" : "等待接通…")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              真人双工语音 · 你可以随时打断考官 · 全程英语
            </div>
          </div>
        </div>
      </div>

      {/* Live transcript tail */}
      {lastMsgs.length > 0 && (
        <div className="mb-4 max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-border bg-card/50 p-3">
          {lastMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${
                m.role === "user" ? "bg-primary/15 text-foreground" : "bg-muted text-foreground"
              }`}>
                {m.role === "assistant" && <div className="text-[9px] font-bold uppercase tracking-wider opacity-60">Examiner</div>}
                {m.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex-1">
            <div className="font-bold">{errorMsg}</div>
            <button onClick={startCall} className="mt-1 underline hover:no-underline">点击重试接通</button>
          </div>
        </div>
      )}

      {/* Hang up + grade */}
      <div className="flex justify-center">
        <button
          onClick={hangUp}
          disabled={!isConnected && !connecting}
          className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-rose-600 disabled:opacity-40"
        >
          <PhoneOff className="size-5" /> 挂断结束 · 自动评分
        </button>
      </div>
    </main>
  );
}

// ==================== FEEDBACK VIEW ====================
function FeedbackView({ session, onRetry }: { session: SessionRow; onRetry: () => void }) {
  const fb = session.feedback!;
  const overallBand = typeof fb?.overall_band === "number" ? fb.overall_band : 0;
  const summary = fb?.summary_zh || "评分已完成";
  const scoresEntries = fb?.scores && typeof fb.scores === "object" ? Object.entries(fb.scores) : [];
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
      <section className="mb-5 rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 text-center shadow-card dark:from-amber-950/30 dark:to-amber-900/10">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Overall Band Score</div>
        <div className="text-6xl font-black text-amber-600 dark:text-amber-400">{overallBand.toFixed(1)}</div>
        <div className="mt-1 text-xs text-muted-foreground">目标 Band {session.target_band.toFixed(1)} · {overallBand >= session.target_band ? "✅ 已达标" : `差 ${(session.target_band - overallBand).toFixed(1)} 分`}</div>
      </section>
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
                    {evidence.map((ev, i) => <div key={i} className="text-[11px] italic text-muted-foreground">"{ev}"</div>)}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
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
      {strengths.length > 0 && (
        <section className="mb-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/5 p-4">
          <h3 className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">👍 你做得好的地方</h3>
          <ul className="space-y-1 text-sm">
            {strengths.map((s: string, i: number) => <li key={i} className="text-foreground/90">• {s}</li>)}
          </ul>
        </section>
      )}
      {(focusAreas.length > 0 || microTask || suggestedTopics.length > 0) && (
        <section className="mb-5 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-primary">
            <Sparkles className="size-4" /> 下次练习计划
          </h3>
          <div className="space-y-2 text-sm">
            {focusAreas.length > 0 && <div><span className="font-semibold">重点突破：</span>{focusAreas.join("、")}</div>}
            {microTask && (
              <div className="rounded-xl bg-card p-3">
                <span className="font-semibold text-primary">🎯 微练习任务：</span>
                <div className="mt-1 text-foreground/90">{microTask}</div>
              </div>
            )}
            {suggestedTopics.length > 0 && (
              <div className="text-xs text-muted-foreground">建议下次话题：{suggestedTopics.join(" · ")}</div>
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
