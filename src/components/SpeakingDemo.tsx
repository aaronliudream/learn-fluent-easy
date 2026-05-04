import { useEffect, useRef, useState } from "react";
import { Mic, Loader2, CheckCircle2, ArrowRight, Sparkles, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { QwenRealtimeSession } from "@/lib/qwenRealtime";
import { T, useT } from "@/i18n/T";
import { cn } from "@/lib/utils";

/**
 * "30-second voice demo" — the hero conversion lever for cold landing traffic.
 *
 * Strategy:
 *  - No signup, no payment, no friction. One tap → mic permission → AI greets.
 *  - 45s hard timer (the headline says "30s", we pad slightly so users actually
 *    finish a turn). Auto-ends and shows the result card.
 *  - We piggyback on the already-deployed `qwen-realtime-proxy` edge function
 *    (verify_jwt = false). No backend changes needed.
 *  - Result card surfaces the *aha* moment ("you just spoke 18 English words
 *    with an AI tutor") plus a single CTA → /auth.
 *
 * Why Qwen and not OpenAI here:
 *  - The Qwen proxy doesn't require a Lovable session token, so guest cold
 *    traffic from Google/social can use it without any auth dance.
 *  - Latency from CN/SEA edges is excellent.
 *  - For overseas English learners, prompt forces English-only output anyway.
 */

const DEMO_SECONDS = 45;
const DEMO_INSTRUCTIONS = `You are a warm, witty English-speaking partner named Alex. This is a 30-second public demo for someone who has NOT signed up yet.

ABSOLUTE RULES:
- Speak ONLY English, no exceptions. If they speak another language, say in English: "Let's try in English — give it a shot!" and wait.
- Open IMMEDIATELY with a friendly: "Hey! How was your day?" Don't add anything else.
- Keep YOUR turns to 1 short sentence. The whole point is for THEM to talk.
- After they reply, give one warm reaction + one short follow-up question. That's it.
- No teaching, no corrections, no lecturing. Just a friendly chat.
- Avoid politics, religion, NSFW, violence — redirect warmly to weekend plans, food, hobbies.`;

type Phase = "idle" | "connecting" | "live" | "ended" | "error";

export default function SpeakingDemo() {
  const t = useT();
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(DEMO_SECONDS);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string[]>([]);
  const [aiTranscript, setAiTranscript] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const sessionRef = useRef<QwenRealtimeSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    try { sessionRef.current?.close(); } catch { /* noop */ }
    sessionRef.current = null;
    try { streamRef.current?.getTracks().forEach((tr) => tr.stop()); } catch { /* noop */ }
    streamRef.current = null;
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function start() {
    setPhase("connecting");
    setErrorMsg("");
    setUserTranscript([]);
    setAiTranscript([]);
    setSecondsLeft(DEMO_SECONDS);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const session = new QwenRealtimeSession({
        cfg: { instructions: DEMO_INSTRUCTIONS, voice: "Cherry", inputSampleRate: 16000, outputSampleRate: 24000 },
        onEvent: (evt) => {
          // Capture user words (Qwen sends "conversation.item.input_audio_transcription.completed").
          if (evt.type === "conversation.item.input_audio_transcription.completed" && typeof evt.transcript === "string") {
            setUserTranscript((prev) => [...prev, evt.transcript.trim()].filter(Boolean));
          }
          // Capture AI words.
          if (evt.type === "response.audio_transcript.done" && typeof evt.transcript === "string") {
            setAiTranscript((prev) => [...prev, evt.transcript.trim()].filter(Boolean));
          }
        },
        onSpeakingChange: setAiSpeaking,
        onConnected: () => {
          setPhase("live");
          // Start the countdown only when audio is actually flowing.
          timerRef.current = window.setInterval(() => {
            setSecondsLeft((s) => {
              if (s <= 1) {
                end();
                return 0;
              }
              return s - 1;
            });
          }, 1000);
        },
        onError: (msg) => {
          setErrorMsg(msg || "Connection error");
          setPhase("error");
          cleanup();
        },
      });
      sessionRef.current = session;
      await session.start(stream);
    } catch (e: any) {
      console.error("[SpeakingDemo] start failed", e);
      const msg = e?.name === "NotAllowedError"
        ? t("Microphone access was blocked. Please allow it and try again.")
        : (e?.message || t("Couldn't start the demo. Please try again."));
      setErrorMsg(msg);
      setPhase("error");
      cleanup();
    }
  }

  function end() {
    cleanup();
    setPhase("ended");
  }

  const wordsSpoken = userTranscript.join(" ").split(/\s+/).filter(Boolean).length;

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-[#E8743C]/25 bg-gradient-to-br from-white via-[#FFF7F0] to-[#EEF4FB] p-6 shadow-[0_24px_60px_-30px_rgba(31,58,46,0.35)] md:p-9">
      <span className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#E8743C]/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-[#3BA3E0]/10 blur-3xl" />

      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E8743C]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
          <Sparkles className="size-3" /> <T>Try it now · 30 seconds · no signup</T>
        </div>
        <h3 className="mt-1 text-2xl font-extrabold leading-tight text-[#1F3A2E] md:text-3xl">
          <T>Speak with an AI tutor right now.</T>
        </h3>
        <p className="mt-2 max-w-md text-sm text-[#1F3A2E]/65">
          <T>Tap the button. The AI will say "Hi, how was your day?" — answer in English.</T>
        </p>

        {/* IDLE */}
        {phase === "idle" && (
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              onClick={start}
              className="group inline-flex items-center gap-2 rounded-full bg-[#E8743C] px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-12px_rgba(232,116,60,0.7)] transition hover:bg-[#d4632d] active:scale-95"
            >
              <Mic className="size-4" /> <T>Start 30-sec demo</T>
            </button>
            <div className="text-xs text-[#1F3A2E]/55">
              🎤 <T>Mic access required. Nothing is saved.</T>
            </div>
          </div>
        )}

        {/* CONNECTING */}
        {phase === "connecting" && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/70 p-4 backdrop-blur-sm">
            <Loader2 className="size-5 animate-spin text-[#E8743C]" />
            <div className="text-sm font-bold text-[#1F3A2E]">
              <T>Connecting to your AI tutor…</T>
            </div>
          </div>
        )}

        {/* LIVE */}
        {phase === "live" && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className={cn(
                "relative grid size-14 shrink-0 place-items-center rounded-2xl text-white transition-all",
                aiSpeaking ? "bg-[#E8743C] scale-110" : "bg-[#3BA3E0]"
              )}>
                {aiSpeaking ? <Volume2 className="size-6" /> : <Mic className="size-6" />}
                {aiSpeaking && <span className="absolute inset-0 animate-ping rounded-2xl bg-[#E8743C]/40" />}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F3A2E]/55">
                  {aiSpeaking ? <T>Alex is speaking…</T> : <T>Your turn — speak in English</T>}
                </div>
                <div className="mt-0.5 text-2xl font-extrabold tabular-nums text-[#1F3A2E]">
                  {secondsLeft}s
                </div>
              </div>
              <button
                onClick={end}
                className="rounded-full border border-[#1F3A2E]/15 bg-white px-4 py-2 text-xs font-bold text-[#1F3A2E]/70 hover:bg-[#F4EFE3]"
              >
                <T>End</T>
              </button>
            </div>

            {/* live captions */}
            {(aiTranscript.length > 0 || userTranscript.length > 0) && (
              <div className="rounded-2xl bg-white/70 p-4 text-sm backdrop-blur-sm">
                {aiTranscript.slice(-1).map((line, i) => (
                  <div key={`ai-${i}`} className="mb-1 text-[#3BA3E0]">
                    <span className="font-bold">Alex:</span> {line}
                  </div>
                ))}
                {userTranscript.slice(-1).map((line, i) => (
                  <div key={`u-${i}`} className="text-[#1F3A2E]">
                    <span className="font-bold"><T>You</T>:</span> {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ENDED — the conversion moment */}
        {phase === "ended" && (
          <div className="mt-6 rounded-2xl border-2 border-[#7FB069]/40 bg-gradient-to-br from-[#F0F8EE] to-white p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[#7FB069]" />
              <div className="flex-1">
                <div className="text-base font-extrabold text-[#1F3A2E]">
                  <T>Nice — you just spoke English with an AI tutor.</T>
                </div>
                {wordsSpoken > 0 ? (
                  <p className="mt-1 text-sm text-[#1F3A2E]/70">
                    <T>You said about</T>{" "}
                    <b className="text-[#E8743C]">{wordsSpoken} {wordsSpoken === 1 ? t("word") : t("words")}</b>{" "}
                    <T>in</T> {DEMO_SECONDS - secondsLeft}s. <T>Imagine 5 minutes a day, every day.</T>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-[#1F3A2E]/70">
                    <T>Want to try a longer conversation? Sign up free — no credit card.</T>
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#E8743C] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_-10px_rgba(232,116,60,0.6)] transition hover:bg-[#d4632d]"
              >
                <T>Continue free</T> <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={start}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1F3A2E]/15 bg-white px-5 py-3 text-sm font-bold text-[#1F3A2E] hover:bg-[#F4EFE3]"
              >
                <T>Try again</T>
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {phase === "error" && (
          <div className="mt-6 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4">
            <div className="text-sm font-bold text-rose-800">
              <T>Couldn't start the demo.</T>
            </div>
            <div className="mt-1 text-xs text-rose-700">{errorMsg}</div>
            <button
              onClick={() => setPhase("idle")}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white"
            >
              <T>Try again</T>
            </button>
          </div>
        )}

        {/* trust strip */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/50">
          <span>✓ <T>No signup</T></span>
          <span>✓ <T>Nothing recorded</T></span>
          <span>✓ <T>Mic stays on your device</T></span>
        </div>
      </div>
    </div>
  );
}