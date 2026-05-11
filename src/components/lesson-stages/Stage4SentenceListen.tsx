import { useEffect, useRef, useState } from "react";
import { Volume2, Check } from "lucide-react";
import type { Stage4Sentence } from "@/data/g2LessonStages";
import { speak, stopSpeaking } from "@/lib/speak";

/** Approximate per-word duration for Karaoke highlight when using MP3 TTS. */
const MS_PER_WORD = 360;

export default function Stage4SentenceListen({ sentences, onComplete }: { sentences: Stage4Sentence[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [activeWord, setActiveWord] = useState(-1);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const playedRef = useRef(false);
  const s = sentences[i];
  const words = s.en.split(/(\s+)/);

  function play() {
    setActiveWord(0);
    speakWithBoundary(
      s.en,
      (idx) => setActiveWord(idx),
      () => setActiveWord(-1),
    );
  }

  useEffect(() => {
    setSeen((prev) => new Set(prev).add(i));
    setActiveWord(-1);
    playedRef.current = false;
    const t = setTimeout(() => {
      if (!playedRef.current) {
        playedRef.current = true;
        play();
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  let wordIdx = -1;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">{i + 1} / {sentences.length}</div>
      {s.scene_hint && (
        <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
          · {s.scene_hint}
        </div>
      )}
      <div className="w-full rounded-3xl border-2 border-border bg-card p-6 text-center shadow-tile">
        <div className="text-2xl font-extrabold leading-relaxed md:text-3xl">
          {words.map((w, k) => {
            if (/^\s+$/.test(w)) return <span key={k}>{w}</span>;
            wordIdx += 1;
            const isActive = wordIdx === activeWord;
            const isPast = activeWord >= 0 && wordIdx < activeWord;
            return (
              <span
                key={k}
                className={`inline-block transition-all ${
                  isActive
                    ? "scale-110 text-orange-500"
                    : isPast
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div className="mt-3 text-base text-muted-foreground">{s.cn}</div>
        <button
          onClick={play}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-tile"
        >
          <Volume2 className="size-4" /> 重听
        </button>
      </div>

      {i < sentences.length - 1 ? (
        <button
          onClick={() => setI(i + 1)}
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-extrabold"
        >
          <Check className="size-4" /> 听完了 · 下一句
        </button>
      ) : (
        <button
          onClick={onComplete}
          disabled={seen.size < sentences.length}
          className="rounded-full bg-gradient-to-r from-pink-500 to-amber-500 px-6 py-3 text-base font-extrabold text-white shadow-tile disabled:opacity-50"
        >
          进入下一关 →
        </button>
      )}
    </div>
  );
}