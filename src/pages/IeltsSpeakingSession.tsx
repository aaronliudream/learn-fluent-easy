import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const SILENT_WAV =
  "data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function pickCueCard(topicCategory: string | null) {
  const t = (topicCategory || "").toLowerCase();
  return CUE_CARDS.find((c) => t.includes(c.topic)) || CUE_CARDS[Math.floor(Math.random() * CUE_CARDS.length)];
}

function friendlyVoiceError(err: unknown) {
  const msg = typeof err === "string" ? err : err instanceof Error ? err.message : String((err as any)?.message || "");
  if (/requested device not found|notfounderror/i.test(msg)) return "未检测到可用麦克风。请换到有麦克风的设备，或在系统设置中启用麦克风后重试。";
  if (/notallowederror|permission|denied/i.test(msg)) return "麦克风权限被拒绝。请在浏览器地址栏/系统设置中允许麦克风后重试。";
  return msg || "语音连接出错，请稍后重试。";
}

const blobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || "").split(",").pop() || "");
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

function preferredRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
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
  return <IeltsSpeakingSessionContent />;
}

function IeltsSpeakingSessionContent() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [grading, setGrading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processingTurn, setProcessingTurn] = useState(false);
  const [examinerSpeaking, setExaminerSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds since connected
  const startedAtRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<Msg[]>([]);
  const partRef = useRef<1 | 2 | 3>(1);
  // VAD (auto recording) refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadRafRef = useRef<number | null>(null);
  const speechStartedAtRef = useRef<number | null>(null);
  const lastVoiceAtRef = useRef<number | null>(null);
  const recordingRef = useRef(false);
  useEffect(() => { recordingRef.current = recording; }, [recording]);
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

  const appendTranscript = useCallback((items: Msg[]) => {
    const next = [...transcriptRef.current, ...items];
    transcriptRef.current = next;
    setMessages(next);
    persist(next, partRef.current);
  }, [persist]);

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

  const playExaminerAudio = useCallback(async (audioContent: string, mimeType = "audio/mpeg") => {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.setAttribute("playsinline", "true");
    audio.src = `data:${mimeType};base64,${audioContent}`;
    setExaminerSpeaking(true);
    try { await audio.play(); } finally {
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
      });
      setExaminerSpeaking(false);
    }
  }, []);

  const requestExaminerTurn = useCallback(async (opts: { startOnly?: boolean; audioBlob?: Blob }) => {
    if (!session) return;
    setProcessingTurn(true);
    setErrorMsg(null);
    try {
      const audioBase64 = opts.audioBlob ? await blobToBase64(opts.audioBlob) : undefined;
      const { data, error } = await supabase.functions.invoke("ielts-voice-turn", {
        body: {
          startOnly: Boolean(opts.startOnly),
          audioBase64,
          mimeType: opts.audioBlob?.type || "audio/webm",
          messages: transcriptRef.current,
          part: partRef.current,
          targetBand: session.target_band,
          topicCategory: session.topic_category,
          cueCard: cueCard.card,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newItems: Msg[] = [];
      const userText = String(data?.userText || "").trim();
      const assistantText = String(data?.assistantText || "").trim();
      if (userText) newItems.push({ role: "user", content: userText, part: partRef.current });
      if (assistantText) {
        const detected = detectPartFromText(assistantText);
        if (detected && detected > partRef.current) {
          partRef.current = detected;
          setCurrentPart(detected);
        }
        newItems.push({ role: "assistant", content: assistantText, part: partRef.current });
      }
      if (newItems.length) appendTranscript(newItems);
      if (data?.audioContent) await playExaminerAudio(String(data.audioContent), String(data.mimeType || "audio/mpeg"));
    } catch (e: any) {
      console.error(e);
      setErrorMsg(friendlyVoiceError(e));
    } finally {
      setProcessingTurn(false);
    }
  }, [appendTranscript, cueCard.card, detectPartFromText, playExaminerAudio, session]);

  const startCall = useCallback(async () => {
    if (!session) return;
    setVoiceConnected(false);
    setConnecting(true);
    setErrorMsg(null);
    try {
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.setAttribute("playsinline", "true");
      audio.src = SILENT_WAV;
      audio.play().catch(() => {});
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } as MediaTrackConstraints,
      });
      mediaStreamRef.current = stream;
      startedAtRef.current = Date.now();
      setVoiceConnected(true);
      setConnecting(false);
      toast.success("已接通考官 🎙️");
      // Nudge the viewport up so the orb + transcript are centered nicely
      // (especially helpful on mobile where the start button sits low).
      setTimeout(() => {
        try {
          window.scrollTo({ top: 120, behavior: "smooth" });
        } catch { /* noop */ }
      }, 200);
      await requestExaminerTurn({ startOnly: true });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(friendlyVoiceError(e));
      setConnecting(false);
      setVoiceConnected(false);
    }
  }, [requestExaminerTurn, session]);

  // Do not auto-start here: iOS/mobile browsers require microphone access to be
  // requested directly from a user tap on this page.

  // ---- Elapsed timer ----
  useEffect(() => {
    if (!voiceConnected) return;
    const t = setInterval(() => {
      if (startedAtRef.current) setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [voiceConnected]);

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
      toast.error("评分失败：" + (e?.message || "未知错误，请稍后在历史里重试"));
      setErrorMsg("评分失败：" + (e?.message || "请稍后再试"));
    } finally {
      setGrading(false);
    }
  }, [session, id]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
    setRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const stream = mediaStreamRef.current;
    if (!stream || recording || processingTurn || examinerSpeaking) return;
    chunksRef.current = [];
    const mimeType = preferredRecordingMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
      chunksRef.current = [];
      if (blob.size > 800 && speechStartedAtRef.current) {
        void requestExaminerTurn({ audioBlob: blob });
      }
      // else: silently discard — auto-VAD will try again
      speechStartedAtRef.current = null;
      lastVoiceAtRef.current = null;
    };
    recorder.start();
    setRecording(true);
  }, [examinerSpeaking, processingTurn, recording, requestExaminerTurn]);

  // ---- Voice Activity Detection: auto start/stop recording ----
  // When connected and it's the candidate's turn, continuously listen to the
  // mic. As soon as voice energy passes a threshold we start recording. After
  // ~1.5s of silence we stop and send. Mirrors the hands-free feel of the
  // Alex chat without needing a full WebRTC realtime connection.
  useEffect(() => {
    if (!voiceConnected) return;
    const stream = mediaStreamRef.current;
    if (!stream) return;
    const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);
    analyserRef.current = analyser;
    const buf = new Uint8Array(analyser.fftSize);

    // Tunable thresholds
    const VOICE_RMS = 0.025;          // start speaking threshold
    const SILENCE_RMS = 0.018;        // below this counts as silence
    const MIN_SPEECH_MS = 600;        // ignore blips
    const SILENCE_HANG_MS = 1400;     // stop after this much silence
    const MAX_RECORD_MS = 60_000;     // hard cap per turn

    const tick = () => {
      vadRafRef.current = requestAnimationFrame(tick);
      // Don't listen while examiner is speaking or we're processing — avoid
      // capturing the examiner's own audio leaking through speakers.
      if (examinerSpeaking || processingTurn) return;
      analyser.getByteTimeDomainData(buf);
      // RMS over the buffer (centered around 128)
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      const now = performance.now();

      if (!recordingRef.current) {
        if (rms > VOICE_RMS) {
          speechStartedAtRef.current = now;
          lastVoiceAtRef.current = now;
          startRecording();
        }
      } else {
        if (rms > SILENCE_RMS) {
          lastVoiceAtRef.current = now;
        }
        const startedAt = speechStartedAtRef.current ?? now;
        const lastVoice = lastVoiceAtRef.current ?? now;
        const speechDur = now - startedAt;
        const silenceDur = now - lastVoice;
        if (
          (speechDur > MIN_SPEECH_MS && silenceDur > SILENCE_HANG_MS) ||
          speechDur > MAX_RECORD_MS
        ) {
          stopRecording();
        }
      }
    };
    vadRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (vadRafRef.current) cancelAnimationFrame(vadRafRef.current);
      vadRafRef.current = null;
      try { source.disconnect(); } catch { /* */ }
      try { analyser.disconnect(); } catch { /* */ }
      try { ctx.close(); } catch { /* */ }
      audioCtxRef.current = null;
      analyserRef.current = null;
    };
  }, [voiceConnected, examinerSpeaking, processingTurn, startRecording, stopRecording]);

  const hangUp = useCallback(async () => {
    try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch { /* */ }
    try { audioRef.current?.pause(); } catch { /* */ }
    try { mediaStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* */ }
    setRecording(false);
    setVoiceConnected(false);
    setExaminerSpeaking(false);
    const msgs = transcriptRef.current;
    if (msgs.length >= 2) {
      toast("通话结束，正在生成评分…");
      await grade(msgs);
    }
  }, [grade]);

  // Cleanup on unmount
  useEffect(() => () => {
    try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch { /* */ }
    try { audioRef.current?.pause(); } catch { /* */ }
    try { mediaStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* */ }
  }, []);

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

  const isConnected = voiceConnected;
  const isExaminerSpeaking = isConnected && examinerSpeaking;
  const isYourTurn = isConnected && !examinerSpeaking && !processingTurn;
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
              {connecting || processingTurn ? <Loader2 className="size-14 animate-spin" /> : <Mic className="size-14" />}
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold">
              {connecting && "正在接通考官…"}
              {!connecting && isExaminerSpeaking && "🔊 考官正在说话…"}
              {!connecting && recording && "🎙️ 正在听你说…说完停顿一下即可"}
              {!connecting && processingTurn && "正在识别并生成考官回复…"}
              {!connecting && isYourTurn && !recording && "🎤 请直接说话，无需按键"}
              {!connecting && !isConnected && (errorMsg ? "连接失败" : "等待接通…")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              全双工自动对话 · 全程英语 · 结束后自动评分
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
      <div className="flex flex-col items-center gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        {isConnected || connecting ? (
          <button
              onClick={hangUp}
              disabled={!isConnected && !connecting}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-rose-600 disabled:opacity-40"
            >
              <PhoneOff className="size-5" /> 挂断结束 · 自动评分
            </button>
        ) : (
          <button
            onClick={startCall}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90"
          >
            <Mic className="size-5" /> 接通 AI 考官
          </button>
        )}
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
            const bandText = typeof s.band === "number" && s.band > 0 ? s.band.toFixed(1) : "N/A";
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
