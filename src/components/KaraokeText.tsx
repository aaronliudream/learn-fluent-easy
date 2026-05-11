import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, Gauge } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speak";

/**
 * KaraokeText — read-only karaoke-style highlight for an English sentence.
 * - Renders the sentence as static text (works everywhere, even when TTS fails)
 * - Optional per-word highlight while speaking, paced by a configurable speed
 * - Speed picker (0.7x / 0.85x / 1.0x) persisted in localStorage
 *
 * Explicitly NOT a microphone / scoring / upload component.
 */

const SPEED_KEY = "karaoke.speed.v1";
const SPEED_EVENT = "karaoke-speed-changed";
const SPEED_OPTIONS = [0.7, 0.85, 1.0] as const;
const DEFAULT_SPEED: number = 0.85;

/** Per-word ms at 1.0x speed. Higher = slower highlight progression. */
const MS_PER_WORD_BASE = 340;

function loadSpeed(): number {
  if (typeof window === "undefined") return DEFAULT_SPEED;
  try {
    const raw = localStorage.getItem(SPEED_KEY);
    const v = raw ? Number(raw) : DEFAULT_SPEED;
    return SPEED_OPTIONS.includes(v as typeof SPEED_OPTIONS[number]) ? v : DEFAULT_SPEED;
  } catch {
    return DEFAULT_SPEED;
  }
}

function saveSpeed(v: number) {
  try {
    localStorage.setItem(SPEED_KEY, String(v));
    window.dispatchEvent(new CustomEvent(SPEED_EVENT, { detail: v }));
  } catch { /* ignore */ }
}

export default function KaraokeText({
  text,
  cn,
  autoPlay = false,
  className = "",
  size = "md",
  showSpeed = true,
}: {
  text: string;
  cn?: string;
  autoPlay?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  showSpeed?: boolean;
}) {
  const [speed, setSpeed] = useState<number>(loadSpeed);
  const [activeWord, setActiveWord] = useState(-1);
  const [supported, setSupported] = useState(true);
  const timersRef = useRef<number[]>([]);
  const playedRef = useRef(false);

  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  // Detect TTS / Web Audio support once.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasAudio = typeof window.Audio !== "undefined";
    const hasSpeech = "speechSynthesis" in window;
    setSupported(hasAudio || hasSpeech);
  }, []);

  // Cross-instance speed sync.
  useEffect(() => {
    const handler = (e: Event) => {
      const v = (e as CustomEvent<number>).detail;
      if (typeof v === "number") setSpeed(v);
    };
    window.addEventListener(SPEED_EVENT, handler);
    return () => window.removeEventListener(SPEED_EVENT, handler);
  }, []);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  function play() {
    clearTimers();
    stopSpeaking();
    if (!supported || wordCount === 0) {
      // Still attempt speak — the fallback inside speak() handles browsers
      // that only have speechSynthesis.
      void speak(text, { speed });
      return;
    }
    setActiveWord(0);
    const stepMs = Math.max(180, Math.round(MS_PER_WORD_BASE / speed));
    for (let w = 1; w < wordCount; w++) {
      const id = window.setTimeout(() => setActiveWord(w), w * stepMs);
      timersRef.current.push(id);
    }
    const endId = window.setTimeout(() => setActiveWord(-1), wordCount * stepMs + 400);
    timersRef.current.push(endId);
    void speak(text, { speed });
  }

  // Auto-play on first mount if requested.
  useEffect(() => {
    if (!autoPlay || playedRef.current) return;
    playedRef.current = true;
    const t = setTimeout(play, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-pace if speed changes mid-play.
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const sizeCls = size === "lg" ? "text-2xl md:text-3xl" : size === "sm" ? "text-base md:text-lg" : "text-xl md:text-2xl";

  let wordIdx = -1;
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`text-center font-extrabold leading-relaxed ${sizeCls}`}>
        {tokens.map((tok, k) => {
          if (/^\s+$/.test(tok)) return <span key={k}>{tok}</span>;
          wordIdx += 1;
          const isActive = wordIdx === activeWord;
          const isPast = activeWord >= 0 && wordIdx < activeWord;
          return (
            <span
              key={k}
              className={`inline-block transition-all duration-150 ${
                isActive
                  ? "scale-110 text-orange-500"
                  : isPast
                  ? "text-foreground"
                  : activeWord >= 0
                  ? "text-muted-foreground/60"
                  : "text-foreground"
              }`}
            >
              {tok}
            </span>
          );
        })}
      </div>
      {cn && <div className="text-sm text-muted-foreground">{cn}</div>}
      <div className="flex items-center gap-2">
        <button
          onClick={play}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-tile"
        >
          <Volume2 className="size-3.5" /> 跟读
        </button>
        {showSpeed && (
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[11px] font-bold text-muted-foreground">
            <Gauge className="size-3" />
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  saveSpeed(s);
                }}
                className={`rounded-full px-2 py-0.5 transition ${
                  speed === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                aria-label={`朗读速度 ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}