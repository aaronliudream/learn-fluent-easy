/**
 * 初中 — 听音辨词 (listen_and_choose_word) — Fork 自 primaryHub ListenChooseWordLevel。
 * 大圆播放按钮 + 读两遍 + 自动播 + Space 重播;选项为单词/emoji。
 * 换:useJuniorHub / junior questionBank / JuniorLevelShell / 册别键 fc:jr:volume。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { speakKid, stopSpeaking, prefetchTTSBatchKid, unlockAudioSync } from "@/lib/speak";
import { isWebSpeechSupported, speakWebSpeech } from "@/lib/webSpeech";
import { getQuestionsByType, getDrawCount } from "@/lib/juniorHub/finalChallenge/questionBank";
import JuniorLevelShell, { type LevelShellPlayApi } from "@/components/juniorHub/finalChallenge/JuniorLevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "listen_and_choose_word" }>;

function unlockAudio(): void {
  unlockAudioSync();
}

export interface JuniorListenChooseWordProps {
  levelId?: number;
  levelName?: string;
  introHint?: string;
  vocabFilter?: string;
}

export default function JuniorListenChooseWordLevel({
  levelId = 2,
  levelName = "听音辨词",
  introHint = "听一听单词,从 3 个选项里选出听到的那个。每个单词会自动读两遍。",
  vocabFilter,
}: JuniorListenChooseWordProps = {}) {
  const { grade } = useJuniorHub();
  const vol = (sessionStorage.getItem("fc:jr:volume") === "v2" ? "v2" : "v1") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("listen_and_choose_word", getDrawCount(grade), vol, grade, vocabFilter),
    [vol, grade, vocabFilter],
  );

  useEffect(() => {
    if (questions.length === 0) return;
    prefetchTTSBatchKid(questions.map((q) => q.audio), { grade });
  }, [grade, questions]);

  if (questions.length === 0) {
    return (
      <div style={{ minHeight: "100vh", padding: 40, textAlign: "center", color: "var(--fc-ink-soft)" }}>
        题库暂无内容,请稍后再试。
      </div>
    );
  }

  return (
    <JuniorLevelShell
      levelId={levelId}
      levelName={levelName}
      introHint={introHint}
      introMood="encouraging"
      total={questions.length}
      onBeforeStart={unlockAudio}
      renderPlay={(api) => <PlayCard q={questions[api.idx]} api={api} grade={grade} />}
    />
  );
}

function PlayCard({ q, api, grade }: { q: Q; api: LevelShellPlayApi; grade: number }) {
  const { answered, picked, pick, idx } = api;
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

  const [speaking, setSpeaking] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); stopSpeaking(); }, []);

  const playWord = useCallback(
    (word: string): Promise<void> => {
      if (!word) return Promise.resolve();
      stopSpeaking();
      setSpeaking(true);
      return new Promise<void>((resolve) => {
        let settled = false;
        const done = () => { if (settled) return; settled = true; setSpeaking(false); resolve(); };
        speakKid(word, { grade })
          .then(done)
          .catch(() => { if (isWebSpeechSupported()) void speakWebSpeech(word, 0.85); done(); });
        const safety = window.setTimeout(done, 6000);
        timers.current.push(safety);
      });
    },
    [grade],
  );

  const playTwice = useCallback(
    async (word: string) => {
      await playWord(word);
      await new Promise<void>((r) => { const id = window.setTimeout(r, 300); timers.current.push(id); });
      stopSpeaking();
      await playWord(word);
    },
    [playWord],
  );

  useEffect(() => {
    const id = window.setTimeout(() => { void playTwice(q.audio); }, 250);
    timers.current.push(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, q.audio]);

  const wrongInfoFor = (picked: number) => ({
    questionId: q.id,
    questionType: q.type,
    stem: q.prompt + ` (听: ${q.audio})`,
    userText: q.options[picked],
    correctText: q.options[correctIdx],
    vocab_domain: q.vocab_domain,
    grammar_point: q.grammar_point,
  });

  useMcKeyboard({
    optionCount: q.options.length,
    answered,
    onPick: (i) => pick(i, i === correctIdx, i === correctIdx ? undefined : wrongInfoFor(i)),
    enabled: true,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (answered) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      void playTwice(q.audio);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [q.audio, answered, playTwice]);

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered ? "竖起耳朵" : isCorrect ? "✨ Nice!" : "差一点点！";

  return (
    <div>
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--fc-ink-soft)", marginBottom: 16 }}>{q.prompt}</p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 8px" }}>
        <button
          type="button"
          aria-label="播放单词,自动读两遍"
          onClick={() => { if (!speaking) void playTwice(q.audio); }}
          disabled={speaking}
          className={speaking ? "fc-pulse-glow-blue" : "fc-btn-press fc-shadow-blue"}
          style={{
            width: 130, height: 130, borderRadius: "50%", border: "5px solid white",
            background: "var(--fc-blue)", color: "white", fontSize: 56, lineHeight: 1,
            display: "grid", placeItems: "center", cursor: speaking ? "default" : "pointer", transition: "transform 200ms",
          }}
        >
          <span aria-hidden style={{ marginTop: -4 }}>{speaking ? "🔈" : "🔊"}</span>
        </button>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--fc-ink-mute)", display: "flex", alignItems: "center", gap: 6 }}>
          点圆圈再听一次 ·
          <kbd style={{ padding: "2px 8px", borderRadius: 4, background: "var(--fc-paper-warm)", border: "1px solid var(--fc-border-medium)", fontFamily: "var(--fc-font-body)", fontSize: 11, color: "var(--fc-ink-soft)" }}>Space</kbd>{" "}
          也行
        </div>
      </div>

      {isCorrect && (
        <div style={{ position: "relative", height: 0, textAlign: "center", marginTop: -20, pointerEvents: "none" }} aria-hidden>
          <span className="fc-celebrate-star" style={{ position: "absolute", top: -80, left: "30%", fontSize: 22 }}>✨</span>
          <span className="fc-celebrate-star" style={{ position: "absolute", top: -70, right: "32%", fontSize: 26, animationDelay: "0.15s" }}>⭐</span>
          <span className="fc-celebrate-star" style={{ position: "absolute", top: -40, left: "48%", fontSize: 20, animationDelay: "0.3s" }}>✨</span>
        </div>
      )}

      {answered && (
        <div
          key={`${idx}-feedback`}
          className="fc-fade-in-up"
          style={{ textAlign: "center", margin: "20px 0 14px", fontSize: 16, fontWeight: 800, color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)" }}
        >
          {isCorrect ? "✨ Nice! 答对啦" : "差一点点！正确答案已为你标出 ⬇"}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${q.options.length}, 1fr)`, gap: 12, marginTop: answered ? 0 : 24 }}>
        {q.options.map((opt, i) => {
          const isThisCorrect = i === correctIdx;
          const isThisPicked = picked === i;
          let bg = "white";
          let border = "var(--fc-border-medium)";
          let textColor = "var(--fc-ink)";
          let letterBg = "var(--fc-paper-warm)";
          let letterColor = "var(--fc-ink-soft)";
          let opacity = 1;
          let extraClass = "fc-btn-press";
          if (answered) {
            if (isThisCorrect) {
              bg = "var(--fc-green-bg)"; border = "var(--fc-green)"; textColor = "var(--fc-green-dark)"; letterBg = "var(--fc-green)"; letterColor = "white";
              if (isThisPicked) extraClass += " fc-pulse-correct";
            } else if (isThisPicked) {
              bg = "rgba(255, 136, 85, 0.12)"; border = "var(--fc-soft-warn)"; textColor = "var(--fc-soft-warn)"; letterBg = "var(--fc-soft-warn)"; letterColor = "white";
            } else { opacity = 0.5; }
          }
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => pick(i, isThisCorrect, isThisCorrect ? undefined : wrongInfoFor(i))}
              className={extraClass}
              style={{
                position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, minHeight: 96, padding: "16px 8px", borderRadius: "var(--fc-radius)", background: bg,
                border: `2px solid ${border}`, color: textColor, cursor: answered ? "default" : "pointer", opacity,
                transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              <span style={{ position: "absolute", top: 6, left: 8, display: "grid", placeItems: "center", width: 22, height: 22, borderRadius: "50%", background: letterBg, color: letterColor, fontFamily: "var(--fc-font-display)", fontWeight: 800, fontSize: 12, lineHeight: 1, transition: "background 200ms, color 200ms" }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ fontFamily: "var(--fc-font-body)", fontWeight: 800, fontSize: 22, lineHeight: 1.1, textAlign: "center", ...(opt.length > 8 ? { fontSize: 18 } : null), ...(opt.length > 11 ? { fontSize: 16 } : null), wordBreak: "break-word" }}>
                {opt}
              </span>
              {answered && isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-green-dark)", lineHeight: 1 }} aria-hidden>✓</span>}
              {answered && isThisPicked && !isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-soft-warn)", lineHeight: 1 }} aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ textAlign: "center", marginTop: 16, padding: "10px 16px", background: "var(--fc-surface-soft, #f5f5f5)", borderRadius: 12, fontSize: 18, fontWeight: 700, color: "var(--fc-ink)" }}>
          🔊 原文:{q.audio}
          <button
            type="button"
            onClick={() => void playWord(q.audio)}
            style={{ marginLeft: 10, padding: "4px 12px", borderRadius: 999, border: "none", background: "var(--fc-primary)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            再听
          </button>
        </div>
      )}

      <div style={{ position: "fixed", left: 12, bottom: 90, zIndex: 5, pointerEvents: "none" }}>
        <RexMascot mood={rexMood} message={rexMessage} size="sm" />
      </div>
    </div>
  );
}
