import { T } from "@/i18n/T";import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCw, SkipForward } from "lucide-react";
import { speak, stopSpeaking, prefetchTTS } from "@/lib/speak";
import { cn } from "@/lib/utils";

/**
 * Teacher-narration lesson player.
 *
 * Mirrors the standalone-HTML "老师讲解" experience but written in React/TS
 * so it works inside the main app. Each segment has:
 *   - text: Chinese narration (TTS spoken + subtitle typewriter)
 *   - show: blackboard formula/example (static)
 *   - highlight: optional substring of `show` to color-emphasize
 *   - duration: seconds before auto-advance (used for typewriter pacing too)
 *
 * Typewriter spends 80% of duration → reading-out-loud-pace.
 * Remaining 20% = comprehension buffer.
 *
 * Controls: ⏸/▶ pause · ↻ replay · ⏭ next · → key next · space pause.
 *
 * If the segments array is empty, this component renders nothing. The parent
 * page should detect that and skip the stage.
 */

export type LessonSegment = {
  text: string;
  show: string;
  highlight?: string | null;
  duration: number;
};

interface Props {
  segments: LessonSegment[];
  pointTitle: string;
  onContinue: () => void;
  /** Optional: skip the whole stage. Shown as a small underline link below the main button. */
  onSkip?: () => void;
}

export function TeacherLessonPlayer({ segments, pointTitle, onContinue, onSkip }: Props) {
  const [segIdx, setSegIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);

  const totalDuration = segments.reduce((s, x) => s + x.duration, 0);
  const minRequired = totalDuration * 0.6; // gate "可继续" until 60% watched
  const currentSeg = segments[segIdx] || segments[segments.length - 1];

  const stopTTS = useCallback(() => {
    try {stopSpeaking();} catch {/* noop */}
  }, []);

  // P2 预热:进课即按网络预热全部段落旁白音频,键与 speak(seg.text,{shimmer,0.95}) 一致 →
  // 每段落 mount 自动播首播秒响,消除冷合成 1-3s(旁白为中文,voiceId=shimmer/speed=0.95)。
  // prefetchTTS 纯网络,不碰 <audio>、不置播放状态。
  useEffect(() => {
    for (const s of segments) prefetchTTS(s.text, { voiceId: "shimmer", speed: 0.95 });
  }, [segments]);

  // Speak current segment text whenever it changes (and not paused).
  useEffect(() => {
    if (paused || allDone || !currentSeg) return;
    speak(currentSeg.text, { voiceId: "shimmer", speed: 0.95 }).catch(() => {/* network errors are fine */});
    return () => {stopTTS();};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segIdx, paused]);

  // Typewriter — reveal text char-by-char over 80% of duration.
  useEffect(() => {
    if (paused || !currentSeg) return;
    if (charIdx >= currentSeg.text.length) return;
    const charTimePerSeg = currentSeg.duration * 1000 * 0.8 / currentSeg.text.length;
    const t = window.setTimeout(() => setCharIdx((c) => c + 1), Math.max(20, charTimePerSeg));
    return () => window.clearTimeout(t);
  }, [charIdx, paused, segIdx, currentSeg]);

  // Auto-advance.
  useEffect(() => {
    if (paused || allDone || !currentSeg) return;
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(() => {
      if (segIdx + 1 >= segments.length) {
        setAllDone(true);
        stopTTS();
      } else {
        setSegIdx((i) => i + 1);
        setCharIdx(0);
      }
    }, currentSeg.duration * 1000);
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, [segIdx, paused, allDone, currentSeg, segments.length, stopTTS]);

  // Elapsed counter (for the gate).
  useEffect(() => {
    if (paused || allDone) return;
    const t = window.setInterval(() => setElapsed((e) => Math.min(totalDuration, e + 0.1)), 100);
    return () => window.clearInterval(t);
  }, [paused, allDone, totalDuration]);

  // Cleanup TTS on unmount.
  useEffect(() => {
    return () => stopTTS();
  }, [stopTTS]);

  // Keyboard: → next, space pause.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        setPaused((p) => !p);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        nextSegment();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segIdx, segments.length]);

  const canContinue = allDone || elapsed >= minRequired;
  const remaining = Math.max(0, Math.ceil(minRequired - elapsed));

  const nextSegment = () => {
    stopTTS();
    if (segIdx + 1 >= segments.length) {
      setAllDone(true);
    } else {
      setSegIdx((i) => i + 1);
      setCharIdx(0);
    }
  };

  const replaySegment = () => {
    stopTTS();
    setCharIdx(0);
    setPaused(true);
    window.setTimeout(() => setPaused(false), 50);
  };

  if (!segments || segments.length === 0) return null;

  // Render `show` with optional highlight.
  const renderShow = (text: string, highlight?: string | null) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(highlight);
    return (
      <span>
        {parts.map((part, i) =>
        <span key={i}>
            {part}
            {i < parts.length - 1 &&
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{highlight}</span>
          }
          </span>
        )}
      </span>);

  };

  return (
    <section className="w-full max-w-2xl mx-auto pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-emerald-600 dark:text-emerald-400 tracking-widest"><T>🎓 老师讲解</T></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{pointTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
          <span>{Math.floor(elapsed)}s / {Math.ceil(totalDuration)}s</span>
          <span>·</span>
          <span>{segIdx + 1} / {segments.length}</span>
        </div>
      </div>

      {/* Speech bubble (current segment text, typewriter) */}
      <div className="mb-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 px-5 py-4 min-h-[80px] flex items-center">
        <p className="text-sm sm:text-base leading-relaxed">
          {currentSeg.text.slice(0, charIdx).split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={i} className="text-emerald-700 dark:text-emerald-300 font-bold">
                  {part.slice(2, -2)}
                </strong>);

            }
            return <span key={i}>{part}</span>;
          })}
          {!paused && charIdx < currentSeg.text.length &&
          <span className="inline-block w-0.5 h-5 bg-emerald-500 ml-0.5 align-middle animate-pulse" />
          }
        </p>
      </div>

      {/* Blackboard — formula / example with highlight */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/20 dark:border-emerald-800 p-6 mb-4 min-h-[100px] flex items-center justify-center">
        <p className="text-lg sm:text-xl italic text-center break-words leading-relaxed text-emerald-700 dark:text-emerald-300">
          {renderShow(currentSeg.show, currentSeg.highlight)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setPaused((p) => !p)}
          className="w-10 h-10 rounded-full border-2 border-border hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition flex items-center justify-center"
          title={paused ? "继续" : "暂停"}
          aria-label={paused ? "继续" : "暂停"}>
          
          {paused ? <Play className="size-4 text-emerald-600" /> : <Pause className="size-4 text-emerald-600" />}
        </button>
        <button
          onClick={replaySegment}
          className="w-10 h-10 rounded-full border-2 border-border hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition flex items-center justify-center"
          title="重听本段"
          aria-label="重听本段">
          
          <RotateCw className="size-4 text-amber-600" />
        </button>
        <button
          onClick={nextSegment}
          className="w-10 h-10 rounded-full border-2 border-border hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition flex items-center justify-center"
          title="下一段"
          aria-label="下一段">
          
          <SkipForward className="size-4 text-emerald-600" />
        </button>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${elapsed / totalDuration * 100}%` }} />
          
        </div>
      </div>

      {/* Continue */}
      <div className="text-center">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "px-6 py-3 rounded-full text-sm font-extrabold transition inline-flex items-center gap-2",
            canContinue ?
            "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md" :
            "bg-muted text-muted-foreground cursor-not-allowed"
          )}>
          
          {allDone ? "✓ 听完了，开始练习" : canContinue ? "听够了，开始练习 →" : `还需 ${remaining}s · 继续听`}
        </button>
        {onSkip &&
        <div className="mt-2">
            <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground underline">
              <T>跳过讲解</T>
            </button>
          </div>
        }
        <p className="text-[11px] text-muted-foreground mt-2 italic"><T>⌨ 空格暂停 · ↻ 重听本段 · → 下一段</T></p>
      </div>
    </section>);

}