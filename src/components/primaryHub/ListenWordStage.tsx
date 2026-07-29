import { useCallback, useEffect, useRef, useState } from "react";
import { toHubTtsText } from "@/lib/primaryHub/speech";
import {
  speakKid,
  speakFromUrl,
  stopSpeaking,
  prefetchTTSBatchKid,
  unlockAudioSync,
} from "@/lib/speak";
import { isWebSpeechSupported, speakWebSpeech } from "@/lib/webSpeech";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { reportPrimaryAttempt } from "@/lib/primaryHub/reportAttempt";
import type { GradeKey } from "@/lib/primaryHub/spellingStageConfig";
import { getListenWordConfig } from "@/lib/primaryHub/listenWordStageConfig";

/** One option carries both its English text and Chinese gloss so the post-pick
 * reveal can show all four meanings at once (the core teaching moment). */
export type ListenWordOption = { en: string; cn: string };

export type ListenWordQuestion = {
  /** English word that gets spoken aloud. */
  audio: string;
  /** Pre-generated CF 音频 URL(el:lily,各年级语速)。有则秒播,缺则回退实时 TTS。 */
  audioUrl?: string;
  opts: ListenWordOption[];
  answer: number;
  point?: string;
};

type Props = {
  questions: ListenWordQuestion[];
  gradeKey: GradeKey;
  grade: number;
  /** Signed-in user id (null = guest). Reserved for future per-user state; not persisted yet. */
  userId?: string | null;
  unitId?: string;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: ListenWordQuestion) => void;
  initialIdx?: number;
  onProgress?: (percent: number) => void;
};

export default function ListenWordStage({
  questions,
  gradeKey,
  grade,
  userId: _userId,
  unitId: _unitId,
  onFinish,
  onCorrect,
  onWrong,
  initialIdx = 0,
  onProgress,
}: Props) {
  const cfg = getListenWordConfig(gradeKey);

  const [started, setStarted] = useState(false); // intro screen until the kid taps 开始挑战 (unlocks audio)
  const [idx, setIdx] = useState(initialIdx);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const timers = useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  // ---- Speech: ElevenLabs (kid voice, content-addressed cache → no repeat cost),
  // with Web Speech fallback so a TTS error never blocks the kid. ----
  const playWord = useCallback(
    (word: string, audioUrl?: string) => {
      if (!word) return;
      stopSpeaking();
      setSpeaking(true);
      const spoken = toHubTtsText(word);
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          setSpeaking(false);
        }
      };
      // 优先:预生成 CF 音频(固定文件、秒播,走解锁元素绕开实时 TTS 抽风)。
      if (audioUrl) {
        // speakFromUrl 现在返回"是否真的播出来了"。原来这里写的是 .then(done).catch(done),
        // 而它**永不 reject** → catch 分支是死代码,预生成文件 404 时就是静默无声。
        // 现在按返回值回落实时 TTS(与下面无 URL 的分支同一条路)。
        void speakFromUrl(audioUrl).then((played) => {
          if (played) { done(); return; }
          console.warn("[listenWord] 预生成音频播放失败,回落实时 TTS:", audioUrl);
          void speakKid(spoken, { grade, speed: cfg.speechRate }).then(done).catch(done);
        });
        after(2500, done);
        return;
      }
      // 回退:无预生成 URL(如后加的词)→ 实时 ElevenLabs,失败再 Web Speech。
      speakKid(spoken, { grade, speed: cfg.speechRate })
        .then(done)
        .catch((err) => {
          console.error("[listenWord] ElevenLabs speak failed, falling back:", err);
          if (isWebSpeechSupported()) {
            void speakWebSpeech(spoken, cfg.speechRate);
          }
          done();
        });
      after(2500, done); // safety: never leave the 🔊 button stuck in loading
    },
    [cfg.speechRate, grade],
  );

  // Warm the ElevenLabs cache only for words WITHOUT a pre-generated URL (those play
  // straight from CF). url-backed words need no runtime synthesis, so skip them.
  useEffect(() => {
    const needWarm = questions.filter((item) => !item.audioUrl).map((item) => toHubTtsText(item.audio));
    if (needWarm.length) prefetchTTSBatchKid(needWarm, { grade, speed: cfg.speechRate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The start tap is the user gesture that unlocks audio (Chrome autoplay policy),
  // so the first question's auto-play works.
  //
  // iOS Safari 修 (backlog #2): 关键是 unlockAudioSync() 必须在所有 await 之前
  // 同步执行 — 它给 speak.ts 单例的 sharedAudio 一个 gesture-triggered play(),
  // 后续 speakKid → speak → unlockAudioSync 复用同一元素就不会被静默拦截.
  // 原先用 new Audio(SILENT_WAV) 解锁的是 throwaway 元素, sharedAudio 一直没
  // 在手势栈内被 play 过, iOS 250ms 后 auto-play 必拦截 = 听音辨词没声.
  const handleStart = async () => {
    unlockAudioSync();
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        await ctx.resume();
      }
    } catch {
      /* ignore */
    }
    setStarted(true);
  };

  // Auto-play the prompt 250ms after each question shows (only once started, per
  // Chrome autoplay policy). No re-play on a wrong pick — there is nothing to retype.
  useEffect(() => {
    if (!started || !q) return;
    const id = window.setTimeout(() => playWord(q.audio, q.audioUrl), 250);
    timers.current.push(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started]);

  useEffect(() => {
    if (!questions.length || !onProgress) return;
    onProgress(((idx + (answered ? 1 : 0)) / questions.length) * 100);
  }, [idx, answered, questions.length, onProgress]);

  const next = useCallback(() => {
    if (isLast) {
      onFinish();
      return;
    }
    setIdx((i) => i + 1);
    setAnswered(false);
    setPicked(null);
  }, [isLast, onFinish]);

  const handlePick = (optIdx: number) => {
    if (answered || !q) return;
    setAnswered(true);
    setPicked(optIdx);
    const isCorrect = optIdx === q.answer;
    reportPrimaryAttempt({ grade, module: "vocab", itemType: "listen_word", itemId: q.audio, itemLabel: q.audio, isCorrect });
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      onCorrect();
    } else {
      onWrong(q);
    }
    // Hold the Chinese reveal for the configured dwell, then auto-advance — no button.
    after(cfg.revealMs, next);
  };

  // Number keys 1–4 still pick; no Enter-to-advance (the reveal auto-advances).
  useMcKeyboard({
    optionCount: q?.opts.length ?? 0,
    answered,
    onPick: handlePick,
    enabled: started && !!q,
  });

  if (!q) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
        <div className="text-sm text-[#888780]">暂无听力题目</div>
      </div>
    );
  }

  // ---------- INTRO (start gesture unlocks audio) ----------
  if (!started) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="text-5xl" aria-hidden>
          🎧
        </div>
        <h2 className="mt-3 text-lg font-bold text-[#333]">听音辨词</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#888780]">
          共 {questions.length} 题。仔细听发音，从 4 个单词里选出听到的那个。
          <br />
          选完会显示每个单词的中文，记一记它们的意思。
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="mt-5 w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#E55A28]"
        >
          ▶️ 开始挑战
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex justify-between text-sm">
        <span className="text-[#888780]">
          第 {idx + 1} / {questions.length} 题
        </span>
        <span>✓ {correctCount}</span>
      </div>

      <div className="mb-4 rounded-xl bg-[#E6F1FB] p-5 text-center">
        <div className="mb-3 text-sm font-medium text-[#185FA5]">🎧 听一听，是哪个单词？</div>
        <button
          type="button"
          className="mx-auto grid size-16 place-items-center rounded-full bg-[#378ADD] text-2xl text-white shadow-md disabled:opacity-60"
          onClick={() => playWord(q.audio, q.audioUrl)}
          disabled={speaking}
        >
          {speaking ? "🔈" : "🔊"}
        </button>
        <div className="mt-2 text-xs text-[#185FA5]">可多次点击重复听</div>
      </div>

      <div className="flex flex-col gap-2">
        {q.opts.map((opt, j) => {
          let cls =
            "quiz-opt flex w-full items-center gap-3 rounded-xl border-2 border-[#EEEAE0] bg-white p-3 text-left text-sm font-medium transition disabled:cursor-not-allowed";
          let mark: string | null = null;
          if (answered) {
            if (j === q.answer) {
              cls += " correct";
              mark = j === picked ? "✅ 你选的" : "✅";
            } else if (j === picked) {
              cls += " wrong";
              mark = "❌ 你选的";
            }
            // other options stay neutral — just reveal their Chinese
          }
          return (
            <button
              key={j}
              type="button"
              disabled={answered}
              className={cls}
              onClick={() => handlePick(j)}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#F4F0E6] text-xs font-bold text-[#888780]">
                {String.fromCharCode(65 + j)}
              </span>
              <span className="flex-1">
                <span className="font-semibold">{opt.en}</span>
                {answered && <span className="ml-1.5 text-[#888780]">（{opt.cn}）</span>}
              </span>
              {mark && <span className="shrink-0 text-xs font-semibold text-[#555]">{mark}</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 text-center text-sm text-[#888780]">
          记住这些单词的意思，马上进入下一题…
        </div>
      )}
    </div>
  );
}
