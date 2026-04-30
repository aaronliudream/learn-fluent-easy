import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mic, MicOff, X, Phone, PhoneOff, Loader2, Volume2, Sparkles, BookOpen, ListChecks, Check, AlertCircle, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { T, useT } from "@/i18n/T";
import { getAlexVoice } from "@/lib/alexVoice";
import { getActiveLearningSlangIds } from "@/lib/slangMastery";
import { IDIOMS } from "@/data/idioms";
import { GUEST_SESSION_SECONDS, incrementGuestTrials } from "@/lib/guestTrial";
import { resolveProvider, type AIProvider } from "@/lib/aiProvider";
import { QwenRealtimeSession, QWEN_VOICE_MAP } from "@/lib/qwenRealtime";
import { recordAITalk } from "@/lib/guestProgress";

type Turn = { role: "user" | "assistant"; text: string; pending?: boolean };

export type MissionPhrase = { phrase: string; meaning_cn: string; example_en?: string };
export type Mission = {
  goal_cn: string;
  must_use: MissionPhrase[];
  success_criteria_cn: string;
};

type RecapTurn = { en: string; cn: string; tip_cn: string; better_en: string };
type QuizQ = {
  word: string;
  source_sentence: string;
  question_cn: string;
  options_cn: string[];
  answer_index: number;
  explanation_cn: string;
};
type Review = { summary_cn: string; turns: RecapTurn[] };
type Recap = { summary_cn: string; turns: RecapTurn[]; quiz: QuizQ[] };

type Props = {
  open: boolean;
  onClose: () => void;
  lessonTitle?: string;
  unitTitle?: string;
  levelName?: string;
  level?: string; // CEFR like "A1"
  isGuest?: boolean; // if true, use shorter trial session + show signup CTA
  mission?: Mission | null;
};

const SESSION_DURATION_SEC = 10 * 60; // 10 minutes hard cap

// Builds the Qwen instructions prompt (mirror of what the realtime-token
// edge function does for OpenAI, kept on the client because Qwen receives
// session.update directly from the browser via the proxy).
function buildQwenInstructions(opts: { lessonTitle?: string; unitTitle?: string; levelName?: string; level?: string; mission?: Mission | null }) {
  const { lessonTitle, unitTitle, levelName, level, mission } = opts;
  // Sprinkle in slang the learner is actively practicing so Alex naturally
  // reinforces what they're studying in the Slang module.
  const activeIds = getActiveLearningSlangIds(6);
  const activePhrases = activeIds
    .map((id) => IDIOMS.find((x) => x.id === id)?.phrase)
    .filter(Boolean) as string[];
  const slangHint = activePhrases.length
    ? `\n\nWHEN IT FEELS NATURAL, sprinkle in 1-2 of these slang phrases the learner is studying: ${activePhrases.map((p) => `"${p}"`).join(", ")}. Don't force it — only if it actually fits the conversation.`
    : "";
  const missionBlock = (mission && mission.must_use?.length)
    ? `\n\nTODAY'S MISSION (steer the chat toward this without announcing it):
- GOAL: ${mission.goal_cn}
- Within your FIRST 2-3 turns, naturally MODEL each of these 3 target expressions so the learner hears them in context:
${mission.must_use.map((m, i) => `  ${i + 1}. "${m.phrase}" — ${m.meaning_cn}${m.example_en ? ` (e.g. ${m.example_en})` : ""}`).join("\n")}
- Then set up moments where it's the learner's turn to use them. If they get it slightly wrong, recast correctly in your reply.
- When the goal is reached, naturally celebrate ("Sweet, it's a plan!") so they feel they "won".`
    : "";
  const levelHint = (() => {
    switch ((level || "").toUpperCase()) {
      case "A1": return "Use very simple short sentences (5-8 words), only the most common 1000 English words.";
      case "A2": return "Use simple sentences with basic past/future tenses, avoid idioms.";
      case "B1": return "Use natural conversational English, common idioms ok.";
      case "B2": return "Speak as you would to a native, full vocabulary including slang.";
      case "C1":
      case "C2": return "Speak as a native Californian to another native, full pace and slang.";
      default:   return "Adapt your level to the learner.";
    }
  })();
  const hook = lessonTitle
    ? `The learner just finished a lesson called "${lessonTitle}"${unitTitle ? ` in the unit "${unitTitle}"` : ""}${levelName ? ` (${levelName})` : ""}. Open by warmly bringing up that topic.`
    : `Open with a friendly hello and ask what they want to chat about (suggest 2-3 fun options).`;
  return `You are Alex, a warm twenty-something native English speaker from California chatting with an English learner.

ABSOLUTE RULES:
- ONLY speak English. Never switch to any other language. If they speak another language, gently say "Let's try that in English — give it a shot!" and wait.
- Sound like a real American friend, not a teacher. Use contractions and natural rhythm.
- Keep YOUR turns short (1-3 sentences). Ask one question, then let them talk.
- RECAST, don't lecture: if they say something off, naturally echo back the corrected version inside your reply ("Oh, you went to the park yesterday? Which one?") and move on. Never say "the right way is...".
- PUSH for output: if they give 1-3 word answers, gently nudge them ("Tell me more!", "Why's that?"). Don't let them coast.

LEVEL: ${levelHint}

CONTEXT: ${hook}${slangHint}${missionBlock}`;
}

// Map our 6 OpenAI TTS voices onto the 8 Realtime voices (closest match).
const REALTIME_VOICE_MAP: Record<string, string> = {
  nova: "shimmer",
  shimmer: "shimmer",
  alloy: "alloy",
  echo: "echo",
  onyx: "ash",
  fable: "verse",
};

export function AITalkDialog({ open, onClose, lessonTitle, unitTitle, levelName, level, isGuest, mission }: Props) {
  const tt = useT();
  const sessionLen = isGuest ? GUEST_SESSION_SECONDS : SESSION_DURATION_SEC;
  const [phase, setPhase] = useState<"idle" | "connecting" | "live" | "ending" | "recap">("idle");
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(sessionLen);
  const [muted, setMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapError, setRecapError] = useState<string | null>(null);
  // Quiz arrives a few seconds after the review so it gets its own
  // loading flag — the review can render immediately while the quiz spins.
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [provider, setProvider] = useState<AIProvider | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const qwenSessionRef = useRef<QwenRealtimeSession | null>(null);
  // Stable id buckets so streamed deltas land on the right turn
  const userTurnByItemId = useRef<Map<string, number>>(new Map());
  const assistantTurnByRespId = useRef<Map<string, number>>(new Map());
  const transcriptSnapshot = useRef<Turn[]>([]);

  // Always keep a ref of latest transcript so the recap call (which fires
  // after teardown) can read it even if React state has moved on.
  useEffect(() => { transcriptSnapshot.current = transcript; }, [transcript]);

  const cleanup = useCallback(() => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    try { dataChannelRef.current?.close(); } catch { /* noop */ }
    try { pcRef.current?.getSenders().forEach(s => s.track?.stop()); } catch { /* noop */ }
    try { pcRef.current?.close(); } catch { /* noop */ }
    try { localStreamRef.current?.getTracks().forEach(t => t.stop()); } catch { /* noop */ }
    if (audioElRef.current) {
      try { audioElRef.current.pause(); audioElRef.current.srcObject = null; } catch { /* noop */ }
    }
    try { qwenSessionRef.current?.close(); } catch { /* noop */ }
    qwenSessionRef.current = null;
    pcRef.current = null;
    localStreamRef.current = null;
    dataChannelRef.current = null;
    setAiSpeaking(false);
  }, []);

  // Reset everything when dialog closes
  useEffect(() => {
    if (!open) {
      cleanup();
      setPhase("idle");
      setTranscript([]);
      setSecondsLeft(sessionLen);
      setMuted(false);
      setRecap(null);
      setRecapLoading(false);
      setRecapError(null);
      setQuizLoading(false);
      setQuizError(null);
      setQuizAnswers({});
      setQuizSubmitted(false);
      userTurnByItemId.current.clear();
      assistantTurnByRespId.current.clear();
    }
  }, [open, cleanup, sessionLen]);

  const requestRecap = useCallback(async () => {
    const turns = transcriptSnapshot.current.filter(t => t.text && !t.pending);
    if (turns.length < 2) {
      setRecapError("对话太短，没有足够内容可以复盘。");
      setPhase("recap");
      return;
    }
    setPhase("recap");
    setRecapLoading(true);
    setQuizLoading(true);
    setRecapError(null);
    setQuizError(null);

    // Fire BOTH calls in parallel. The review (translations + tips) is
    // small and comes back in ~3-6s — render it immediately so the user
    // can start reading. The quiz takes longer (~10-20s) and lands later;
    // by the time the user finishes reading the review, the quiz is ready.
    const reviewPromise = supabase.functions
      .invoke("chat-recap", { body: { transcript: turns, lessonTitle, part: "review" } })
      .then(({ data, error }) => {
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        const review = data.recap as Review;
        setRecap((prev) => ({
          summary_cn: review.summary_cn,
          turns: review.turns,
          quiz: prev?.quiz ?? [],
        }));
      })
      .catch((e: any) => {
        console.error("review failed", e);
        setRecapError(e?.message || "复盘生成失败");
      })
      .finally(() => setRecapLoading(false));

    const quizPromise = supabase.functions
      .invoke("chat-recap", { body: { transcript: turns, lessonTitle, part: "quiz" } })
      .then(({ data, error }) => {
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        const quiz = (data.recap?.quiz ?? []) as QuizQ[];
        setRecap((prev) => ({
          summary_cn: prev?.summary_cn ?? "",
          turns: prev?.turns ?? [],
          quiz,
        }));
      })
      .catch((e: any) => {
        console.error("quiz failed", e);
        setQuizError(e?.message || "测试题生成失败");
      })
      .finally(() => setQuizLoading(false));

    await Promise.allSettled([reviewPromise, quizPromise]);
  }, [lessonTitle]);

  const endCall = useCallback(async () => {
    if (phase === "recap" || phase === "ending") return;
    setPhase("ending");
    // Log session length for streak / progress.
    const elapsed = Math.max(0, sessionLen - secondsLeft);
    if (elapsed >= 30) recordAITalk(elapsed); // ignore <30s aborts
    cleanup();
    await requestRecap();
  }, [phase, cleanup, requestRecap, sessionLen, secondsLeft]);

  // Countdown
  useEffect(() => {
    if (phase !== "live") return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.setTimeout(() => endCall(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } };
  }, [phase, endCall]);

  const upsertTurn = useCallback((idx: number, patch: Partial<Turn>) => {
    setTranscript((prev) => {
      const next = [...prev];
      if (!next[idx]) return prev;
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }, []);

  const appendTurn = useCallback((turn: Turn): number => {
    let idx = -1;
    setTranscript((prev) => {
      idx = prev.length;
      return [...prev, turn];
    });
    return idx;
  }, []);

  const handleRealtimeEvent = useCallback((evt: any) => {
    // Server VAD signals + partial / final transcripts
    switch (evt.type) {
      case "input_audio_buffer.speech_started":
        // user starts talking — we don't add a turn yet (we have no text)
        break;
      case "conversation.item.input_audio_transcription.completed": {
        // Final user transcript
        const itemId: string = evt.item_id;
        const text: string = evt.transcript || "";
        if (!text.trim()) return;
        const existing = userTurnByItemId.current.get(itemId);
        if (existing !== undefined) {
          upsertTurn(existing, { text, pending: false });
        } else {
          setTranscript((prev) => {
            const next = [...prev, { role: "user" as const, text, pending: false }];
            userTurnByItemId.current.set(itemId, next.length - 1);
            return next;
          });
        }
        break;
      }
      case "response.audio_transcript.delta": {
        const respId: string = evt.response_id;
        const delta: string = evt.delta || "";
        let idx = assistantTurnByRespId.current.get(respId);
        if (idx === undefined) {
          setTranscript((prev) => {
            const newIdx = prev.length;
            assistantTurnByRespId.current.set(respId, newIdx);
            return [...prev, { role: "assistant" as const, text: delta, pending: true }];
          });
        } else {
          setTranscript((prev) => {
            const next = [...prev];
            if (next[idx!]) next[idx!] = { ...next[idx!], text: (next[idx!].text || "") + delta };
            return next;
          });
        }
        setAiSpeaking(true);
        break;
      }
      case "response.audio_transcript.done": {
        const respId: string = evt.response_id;
        const idx = assistantTurnByRespId.current.get(respId);
        if (idx !== undefined && evt.transcript) {
          upsertTurn(idx, { text: evt.transcript, pending: false });
        } else if (idx !== undefined) {
          upsertTurn(idx, { pending: false });
        }
        break;
      }
      case "output_audio_buffer.stopped":
      case "response.done":
        setAiSpeaking(false);
        break;
      case "error":
        console.error("realtime error", evt);
        toast.error(evt.error?.message || "Realtime error");
        break;
    }
  }, [upsertTurn]);

  const startCall = useCallback(async () => {
    setPhase("connecting");
    try {
      // 0. Decide which provider works on this network. Cached for 6h.
      const chosen = await resolveProvider();
      setProvider(chosen);
      console.log(`[AITalk] using provider: ${chosen}`);

      // 1. Get mic — turn ON browser-side noise suppression, echo cancel,
      // and auto-gain so background noise (fan, traffic, kids) doesn't get
      // sent to OpenAI's VAD and cause Alex to cut in or get triggered.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as MediaTrackConstraints,
      });
      localStreamRef.current = stream;

      // === Qwen path (mainland China) ===
      if (chosen === "qwen") {
        // Alex's voice is auto-assigned (random male/female), independent of
        // the global TTS settings used for lessons. Stable across sessions.
        const voicePref = getAlexVoice();
        const qwenVoice = QWEN_VOICE_MAP[voicePref] || "Cherry";
        const instructions = buildQwenInstructions({ lessonTitle, unitTitle, levelName, level });
        const session = new QwenRealtimeSession({
          cfg: { instructions, voice: qwenVoice, inputSampleRate: 16000, outputSampleRate: 24000 },
          onEvent: (evt) => handleRealtimeEvent(evt),
          onSpeakingChange: (s) => setAiSpeaking(s),
          onConnected: () => {
            setPhase("live");
            setSecondsLeft(sessionLen);
            if (isGuest) { try { incrementGuestTrials(); } catch { /* noop */ } }
          },
          onError: (msg) => toast.error(msg),
        });
        qwenSessionRef.current = session;
        await session.start(stream);
        return;
      }

      // 2. Mint ephemeral key — Alex uses an auto-assigned random voice so
      // each user gets a distinct buddy without having to pick one.
      const voicePref = getAlexVoice();
      const mappedVoice = REALTIME_VOICE_MAP[voicePref] || "shimmer";
      const { data, error } = await supabase.functions.invoke("realtime-token", {
        body: { lessonTitle, unitTitle, levelName, level, voice: mappedVoice },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const ephemeralKey = data?.client_secret?.value;
      const model = data?.model || "gpt-4o-realtime-preview-2024-12-17";
      if (!ephemeralKey) throw new Error("No ephemeral key returned");

      // 3. Open peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Remote audio playback
      const audioEl = audioElRef.current ?? new Audio();
      audioEl.autoplay = true;
      audioElRef.current = audioEl;
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };

      // Send mic
      stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));

      // Data channel for events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      dc.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data);
          handleRealtimeEvent(evt);
        } catch (err) {
          console.error("bad event", err);
        }
      };
      dc.onopen = () => {
        // Tell the model to greet first
        try {
          dc.send(JSON.stringify({
            type: "response.create",
            response: { modalities: ["audio", "text"] },
          }));
        } catch { /* noop */ }
      };

      // 4. SDP offer/answer with OpenAI
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResp = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });
      if (!sdpResp.ok) {
        const t = await sdpResp.text();
        throw new Error(`OpenAI SDP error: ${sdpResp.status} ${t}`);
      }
      const answerSdp = await sdpResp.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      setPhase("live");
      setSecondsLeft(sessionLen);
      // Count this as a used trial for guests (only on successful connect)
      if (isGuest) {
        try { incrementGuestTrials(); } catch { /* noop */ }
      }
    } catch (e: any) {
      console.error("startCall failed", e);
      toast.error(e?.message || "Failed to connect to AI");
      cleanup();
      setPhase("idle");
    }
  }, [lessonTitle, unitTitle, levelName, level, handleRealtimeEvent, cleanup, sessionLen, isGuest]);

  // Mute toggle needs to inform the Qwen session too (it gates uploads).
  useEffect(() => {
    qwenSessionRef.current?.setMuted(muted);
  }, [muted]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }, [muted]);

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  const quizScore = useMemo(() => {
    if (!recap) return { correct: 0, total: 0 };
    let correct = 0;
    recap.quiz.forEach((q, i) => { if (quizAnswers[i] === q.answer_index) correct++; });
    return { correct, total: recap.quiz.length };
  }, [recap, quizAnswers]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-card shadow-2xl md:h-[90vh] md:rounded-3xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/60 bg-gradient-to-br from-primary/10 to-primary/0 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg">
              {phase === "live" && aiSpeaking
                ? <Volume2 className="size-5 animate-pulse" />
                : <Sparkles className="size-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {phase === "recap"
                  ? <T>对话复盘 + 词汇测试</T>
                  : <T>Alex · 美式英语对话</T>}
              </h2>
              <p className="text-xs text-muted-foreground">
                {phase === "live" && (<><T>剩余时间</T> {mmss} · {aiSpeaking ? <T>Alex 在说话</T> : muted ? <T>麦克风已静音</T> : <T>请说英语</T>}</>)}
                {phase === "connecting" && <T>正在连接 AI…</T>}
                {phase === "ending" && <T>结束通话…</T>}
                {phase === "recap" && (
                  recapLoading
                    ? <T>AI 正在生成讲解…</T>
                    : quizLoading
                      ? <T>讲解已就绪 · 测试题马上来</T>
                      : <T>查看每句翻译并完成测试</T>
                )}
                {phase === "idle" && <T>10 分钟全英语真人对话练习</T>}
              </p>
            </div>
          </div>
          <button
            onClick={() => { if (phase === "live") endCall(); else onClose(); }}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold shadow-md ring-1 transition ${
              phase === "live"
                ? "bg-rose-500 text-white ring-rose-600 hover:bg-rose-600"
                : "bg-card text-foreground ring-border hover:bg-secondary"
            }`}
            aria-label={phase === "live" ? "End call" : "Close"}
          >
            {phase === "live" ? <PhoneOff className="size-4" /> : <X className="size-4" />}
            <span>{phase === "live" ? <T>结束</T> : <T>退出</T>}</span>
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {phase === "idle" && (
            <IdleSplash lessonTitle={lessonTitle} levelName={levelName} onStart={startCall} isGuest={isGuest} />
          )}

          {(phase === "connecting" || phase === "live" || phase === "ending") && (
            <LiveTranscript transcript={transcript} aiSpeaking={aiSpeaking} phase={phase} />
          )}

          {phase === "recap" && (
            <>
            {isGuest && <GuestSignupCTA />}
            <RecapView
              recap={recap}
              loading={recapLoading}
              error={recapError}
              quizLoading={quizLoading}
              quizError={quizError}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizSubmitted={quizSubmitted}
              setQuizSubmitted={setQuizSubmitted}
              quizScore={quizScore}
            />
            </>
          )}
        </div>

        {/* Footer controls */}
        {(phase === "live" || phase === "connecting") && (
          <footer className="flex items-center justify-center gap-3 border-t border-border/60 bg-secondary/30 p-4">
            <button
              onClick={toggleMute}
              disabled={phase !== "live"}
              className={`grid size-14 place-items-center rounded-full shadow-lg transition disabled:opacity-50 ${
                muted ? "bg-rose-500 text-white" : "bg-card text-foreground hover:bg-secondary"
              }`}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            </button>
            <button
              onClick={endCall}
              className="flex h-14 items-center gap-2 rounded-full bg-rose-500 px-6 font-semibold text-white shadow-lg transition hover:bg-rose-600"
            >
              <PhoneOff className="size-5" />
              <T>结束并复盘</T>
            </button>
          </footer>
        )}
        {phase === "recap" && (
          <footer className="flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/30 p-4">
            <button
              onClick={onClose}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              <T>关闭</T>
            </button>
            <button
              onClick={() => {
                setPhase("idle");
                setTranscript([]);
                setRecap(null);
                setQuizAnswers({});
                setQuizSubmitted(false);
                setSecondsLeft(SESSION_DURATION_SEC);
                userTurnByItemId.current.clear();
                assistantTurnByRespId.current.clear();
              }}
              className="rounded-full bg-grad-title px-5 py-2.5 text-sm font-semibold text-white shadow-tile hover:opacity-95"
            >
              🎙️ <T>再来一次</T>
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

function IdleSplash({ lessonTitle, levelName, onStart, isGuest }: { lessonTitle?: string; levelName?: string; onStart: () => void; isGuest?: boolean }) {
  const minutes = isGuest ? 3 : 10;
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-5 grid size-24 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5">
        <Phone className="size-10 text-primary" />
      </div>
      <h3 className="text-xl font-extrabold">
        {isGuest
          ? <T>免费试用 · 和 Alex 聊 3 分钟</T>
          : <T>和 Alex 来一段 10 分钟美式英语对话</T>}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        <T>Alex 是一位地道的加州年轻人。他只会用英语和你聊天，结束后会逐句翻译你的回答，给出地道说法和小测验。</T>
      </p>
      {isGuest && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">
          ✨ <T>无需注册即可体验</T> · <T>登录后可享 10 分钟完整对话</T>
        </div>
      )}
      {lessonTitle && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <BookOpen className="size-3.5" />
          <T>话题</T>: {lessonTitle}
        </div>
      )}
      {levelName && (
        <div className="mt-2 text-xs text-muted-foreground">
          <T>难度自动匹配</T>: {levelName}
        </div>
      )}
      <button
        onClick={onStart}
        className="mt-7 flex items-center gap-2 rounded-full bg-grad-title px-7 py-3.5 text-base font-bold text-white shadow-tile transition hover:opacity-95"
      >
        <Mic className="size-5" /> {isGuest ? <T>免费试一下</T> : <T>开始对话</T>}
      </button>
      <p className="mt-3 text-[11px] text-muted-foreground">
        <T>需要麦克风权限 · 强烈建议戴耳机</T>
      </p>
    </div>
  );
}

function GuestSignupCTA() {
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <Sparkles className="size-4 text-primary" />
            <T>感觉怎么样？</T>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            <T>登录账号即可解锁完整 10 分钟对话、保存复盘记录、跨设备同步学习进度。</T>
          </p>
        </div>
        <Link
          to="/auth"
          className="rounded-full bg-grad-title px-4 py-2 text-xs font-bold text-white shadow-tile transition hover:opacity-95"
        >
          <T>登录解锁完整版</T> →
        </Link>
      </div>
    </div>
  );
}
function LiveTranscript({ transcript, aiSpeaking, phase }: { transcript: Turn[]; aiSpeaking: boolean; phase: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

  if (transcript.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        {phase === "connecting" ? (
          <>
            <Loader2 className="mb-3 size-7 animate-spin text-primary" />
            <p className="text-sm"><T>正在连接，请稍候…</T></p>
          </>
        ) : (
          <>
            <div className={`mb-3 grid size-14 place-items-center rounded-full bg-primary/10 ${aiSpeaking ? "animate-pulse" : ""}`}>
              <Mic className="size-6 text-primary" />
            </div>
            <p className="text-sm"><T>对话已开始，Alex 一会儿就会和你打招呼…</T></p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transcript.map((t, i) => (
        <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-lg leading-relaxed shadow-sm ${
            t.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground"
          }`}>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider opacity-70">
              {t.role === "user" ? "You" : "Alex"}
            </div>
            {t.text || <span className="opacity-60 italic">…</span>}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function RecapView({
  recap, loading, error, quizLoading, quizError, quizAnswers, setQuizAnswers, quizSubmitted, setQuizSubmitted, quizScore,
}: {
  recap: Recap | null;
  loading: boolean;
  error: string | null;
  quizLoading: boolean;
  quizError: string | null;
  quizAnswers: Record<number, number>;
  setQuizAnswers: (v: Record<number, number>) => void;
  quizSubmitted: boolean;
  setQuizSubmitted: (v: boolean) => void;
  quizScore: { correct: number; total: number };
}) {
  // Only show the full-screen loader when neither part has arrived yet.
  // As soon as the (faster) review lands, we render it and the quiz block
  // gets its own inline loader below.
  const reviewReady = !!recap && (recap.turns.length > 0 || !!recap.summary_cn);
  if (loading && !reviewReady) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Loader2 className="mb-3 size-8 animate-spin text-primary" />
        <p className="text-sm font-medium"><T>AI 正在分析你刚才的对话…</T></p>
        <p className="mt-1 text-xs text-muted-foreground"><T>几秒钟就好，先出讲解再出测试</T></p>
      </div>
    );
  }

  if (error && !reviewReady) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <AlertCircle className="mb-3 size-8 text-rose-500" />
        <p className="text-sm font-medium text-rose-600">{error}</p>
      </div>
    );
  }

  if (!recap) return null;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-1 flex items-center gap-1.5 text-base font-bold text-primary">
          <Sparkles className="size-4" /> <T>整体点评</T>
        </div>
        <p className="text-base leading-relaxed">{recap.summary_cn}</p>
      </div>

      {/* Bilingual review */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <BookOpen className="size-4 text-primary" /> <T>逐句翻译与改进建议</T>
        </h3>
        {recap.turns.length === 0 ? (
          <p className="text-sm text-muted-foreground"><T>没有捕捉到你的话语。下次记得多开口！</T></p>
        ) : (
          <ul className="space-y-3">
            {recap.turns.map((t, i) => (
              <li key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="rounded-xl border-l-4 border-sky-500 bg-sky-50 p-2.5 text-base font-semibold text-sky-900">
                  <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-sky-600">You said</span>
                  <div className="mt-1">"{t.en}"</div>
                </div>
                <div className="mt-2 text-base text-muted-foreground">{t.cn}</div>
                {t.better_en && t.better_en.trim() && (
                  <div className="mt-2 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-2.5 text-base text-emerald-800">
                    <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">✨ <T>更地道</T></span>
                    <div className="mt-1 font-semibold">{t.better_en}</div>
                  </div>
                )}
                <div className="mt-2 text-sm leading-relaxed text-foreground/70">{t.tip_cn}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quiz */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <ListChecks className="size-4 text-primary" /> <T>词汇短语测试</T>
          {recap.quiz.length > 0 && Object.keys(quizAnswers).length > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-700">
              <Trophy className="size-3.5" /> {quizScore.correct} / {recap.quiz.length}
            </span>
          )}
        </h3>

        {recap.quiz.length === 0 && quizLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
            <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
            <div>
              <p className="text-sm font-semibold"><T>正在出 10 道词汇测试题…</T></p>
              <p className="mt-0.5 text-xs text-muted-foreground"><T>你可以先看上面的讲解，测试很快就好</T></p>
            </div>
          </div>
        )}

        {recap.quiz.length === 0 && !quizLoading && quizError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <T>测试题生成失败：</T>{quizError}
          </div>
        )}

        <ol className="space-y-4">
          {recap.quiz.map((q, i) => {
            const picked = quizAnswers[i];
            const answered = picked !== undefined;
            const isCorrect = picked === q.answer_index;
            return (
              <li key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Q{i + 1} · <span className="font-mono">{q.word}</span>
                </div>
                <div className="mb-2 rounded-xl bg-secondary/50 p-2.5 text-base italic text-foreground/85">
                  "{q.source_sentence}"
                </div>
                <p className="mb-3 text-base font-semibold">{q.question_cn}</p>
                <div className="space-y-2">
                  {q.options_cn.map((opt, j) => {
                    const chosen = picked === j;
                    // Reveal answer as soon as this question is answered
                    const showCorrect = answered && j === q.answer_index;
                    const showWrong = answered && chosen && j !== q.answer_index;
                    return (
                      <button
                        key={j}
                        onClick={() => {
                          if (answered) return; // lock after first pick
                          setQuizAnswers({ ...quizAnswers, [i]: j });
                        }}
                        disabled={answered}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-base font-medium transition ${
                          showCorrect
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                            : showWrong
                              ? "border-rose-600 bg-rose-600 text-white shadow-md"
                              : chosen
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50 hover:bg-secondary/50"
                        }`}
                      >
                        <span className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${
                          showCorrect ? "border-white bg-white text-emerald-700"
                          : showWrong ? "border-white bg-white text-rose-700"
                          : chosen ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                        }`}>
                          {showCorrect ? <Check className="size-4" /> : showWrong ? "✕" : String.fromCharCode(65 + j)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className={`mt-3 rounded-xl border-l-4 p-3 text-sm leading-relaxed ${
                    isCorrect
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-rose-600 bg-rose-50 text-rose-800"
                  }`}>
                    <div className="mb-1 font-bold">
                      {isCorrect ? <T>✓ 回答正确</T> : <T>✕ 回答错误</T>}
                    </div>
                    💡 {q.explanation_cn}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {Object.keys(quizAnswers).length > 0 && (
          <button
            onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary bg-primary/10 py-3 font-semibold text-primary"
          >
            <T>重新测试</T>
          </button>
        )}
      </section>
    </div>
  );
}
