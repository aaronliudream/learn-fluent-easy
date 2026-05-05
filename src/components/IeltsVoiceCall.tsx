import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Phone, PhoneOff, Loader2, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string; part: 1 | 2 | 3 };

const ELEVENLABS_AGENT_ID = "agent_2801kqvhz6m2ehasqcjadep8zm25";

interface Props {
  open: boolean;
  onClose: () => void;
  targetBand: number;
  currentPart: 1 | 2 | 3;
  onTranscriptUpdate: (msgs: Msg[]) => void;
  initialTranscript: Msg[];
}

export function IeltsVoiceCall({ open, onClose, targetBand, currentPart, onTranscriptUpdate, initialTranscript }: Props) {
  return (
    <ConversationProvider agentId={ELEVENLABS_AGENT_ID} connectionType="webrtc">
      <IeltsVoiceCallContent
        open={open}
        onClose={onClose}
        targetBand={targetBand}
        currentPart={currentPart}
        onTranscriptUpdate={onTranscriptUpdate}
        initialTranscript={initialTranscript}
      />
    </ConversationProvider>
  );
}

function IeltsVoiceCallContent({ open, onClose, targetBand, currentPart, onTranscriptUpdate, initialTranscript }: Props) {
  const [connecting, setConnecting] = useState(false);
  const transcriptRef = useRef<Msg[]>(initialTranscript);
  const partRef = useRef<1 | 2 | 3>(currentPart);

  useEffect(() => { transcriptRef.current = initialTranscript; }, [initialTranscript]);
  useEffect(() => { partRef.current = currentPart; }, [currentPart]);

  const conversation = useConversation({
    onConnect: () => toast.success("已接通考官 🎙️"),
    onDisconnect: () => toast("通话已结束"),
    onError: (err) => {
      console.error("EL error", err);
      toast.error("语音连接出错");
    },
    onMessage: (msg: any) => {
      try {
        if (msg?.source === "user" && typeof msg.message === "string") {
          const next = [...transcriptRef.current, { role: "user", content: msg.message, part: partRef.current } as Msg];
          transcriptRef.current = next;
          onTranscriptUpdate(next);
        } else if (msg?.source === "ai" && typeof msg.message === "string") {
          const next = [...transcriptRef.current, { role: "assistant", content: msg.message, part: partRef.current } as Msg];
          transcriptRef.current = next;
          onTranscriptUpdate(next);
        }
      } catch (e) { console.warn(e); }
    },
  });

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      conversation.startSession({
        overrides: {
          agent: {
            firstMessage:
              partRef.current === 1
                ? "Good morning. My name is Daniel, and I'll be your examiner today. Could you please tell me your full name?"
                : "Let's continue. I'd like to ask you a few more questions.",
          },
        },
      });
    } catch (e: any) {
      console.error(e);
      toast.error("无法启动语音：" + (e?.message || "未知错误"), { duration: 8000 });
      // Auto-close the modal so the user isn't stuck on "等待接通…"
      setTimeout(() => onClose(), 100);
      setConnecting(false);
    }
  }, [conversation, onClose]);

  const stop = useCallback(async () => {
    try { await conversation.endSession(); } catch { /* */ }
  }, [conversation]);

  // Auto-start when opened
  useEffect(() => {
    if (open && conversation.status === "disconnected" && !connecting) {
      start();
    }
    if (!open && conversation.status === "connected") {
      stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cleanup on unmount
  useEffect(() => () => { try { conversation.endSession(); } catch { /* */ } }, []);

  if (!open) return null;

  const status = conversation.status;
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 backdrop-blur-md">
      <div className="flex w-full max-w-md flex-col items-center gap-6 px-6 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          IELTS Speaking · Part {currentPart} · Band {targetBand.toFixed(1)}
        </div>

        {/* Animated orb */}
        <div className="relative grid size-48 place-items-center">
          <div
            className={`absolute inset-0 rounded-full bg-primary/30 transition-transform duration-300 ${
              status === "connected" ? (isSpeaking ? "scale-110 animate-pulse" : "scale-100") : "scale-90"
            }`}
          />
          <div
            className={`absolute inset-4 rounded-full bg-primary/50 transition ${
              isSpeaking ? "animate-pulse" : ""
            }`}
          />
          <div className="relative z-10 grid size-32 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl">
            {connecting ? (
              <Loader2 className="size-12 animate-spin" />
            ) : status === "connected" ? (
              <Mic className="size-12" />
            ) : (
              <Phone className="size-12" />
            )}
          </div>
        </div>

        <div className="text-lg font-bold">
          {connecting && "正在接通…"}
          {!connecting && status === "connected" && (isSpeaking ? "考官正在说话…" : "请开始回答 🎤")}
          {!connecting && status === "disconnected" && "等待接通…"}
        </div>
        <div className="text-xs text-muted-foreground">
          双工真人语音 · 你可以随时打断考官 · 中途挂断会自动评分
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={async () => { await stop(); onClose(); }}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-rose-600"
          >
            <PhoneOff className="size-5" /> 挂断结束
          </button>
        </div>
      </div>
    </div>
  );
}