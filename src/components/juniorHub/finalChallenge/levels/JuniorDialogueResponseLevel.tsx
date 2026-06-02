/**
 * 初中 — 听力理解 (dialogue_response) — Fork 自 primaryHub DialogueResponseLevel。
 * 听整段对话/短文 → 读屏上问题 → 选答案。换 useJuniorHub / junior questionBank /
 * JuniorLevelShell / 册别键 fc:jr:volume。两处 junior 改动:
 *   - safety 超时按文本长度动态(整段音频比单词长,6s 会被截断)
 *   - 文案「听对话/短文…」+ 答后「原文:{audio}」
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

type Q = Extract<FCQuestion, { type: "dialogue_response" }>;

function unlockAudio(): void {
  unlockAudioSync();
}

/** 整段音频的安全兜底超时:按文本长度估算,夹在 8s~30s 之间(单词关 6s 在此会被截断)。 */
function safetyMsFor(text: string): number {
  return Math.min(30000, Math.max(8000, text.length * 90));
}

export interface JuniorDialogueProps {
  levelId?: number;
  levelName?: string;
  introHint?: string;
}

export default function JuniorDialogueResponseLevel({
  levelId = 2,
  levelName = "听力理解",
  introHint = "听一段对话或短文,读屏上的问题,从选项里选出最合适的答案。音频会自动读两遍,也可点圆圈或按 Space 重听。",
}: JuniorDialogueProps = {}) {
  const { grade } = useJuniorHub();
  const vol = (sessionStorage.getItem("fc:jr:volume") === "v2" ? "v2" : "v1") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("dialogue_response", getDrawCount(grade), vol, grade),
    [vol, grade],
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
    (text: string): Promise<void> => {
      if (!text) return Promise.resolve();
      stopSpeaking();
      setSpeaking(true);
      return new Promise<void>((resolve) => {
        let settled = false;
        const done = () => { if (settled) return; settled = true; setSpeaking(false); resolve(); };
        speakKid(text, { grade })
          .then(done)
          .catch(() => { if (isWebSpeechSupported()) void speakWebSpeech(text, 0.85); done(); });
        const safety = window.setTimeout(done, safetyMsFor(text));
        timers.current.push(safety);
      });
    },
    [grade],
  );

  const playTwice = useCallback(
    async (text: string) => {
      await playWord(text);
      await new Promise<void>((r) => { const id = window.setTimeout(r, 300); timers.current.push(id); });
      stopSpeaking();
      await playWord(text);
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
    stem: q.prompt,
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
  const rexMessage = !answered ? "听一听,选答案" : isCorrect ? "✨ Nice!" : "差一点点！";

  return (
    <div>
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--fc-ink-soft)", marginBottom: 16 }}>
        听对话/短文,选出最合适的答案。
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 8px" }}>
        <button
          type="button"
          aria-label="播放对话/短文,自动读两遍"
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

      <div
        style={{
          margin: "16px auto 0", maxWidth: 420, padding: "12px 18px",
          background: "var(--fc-blue-bg, #eaf3ff)", borderRadius: "var(--fc-radius)",
          border: "2px solid var(--fc-blue)", textAlign: "center", fontFamily: "var(--fc-font-body)",
          fontWeight: 800, fontSize: 19, lineHeight: 1.3, color: "var(--fc-ink)",
        }}
      >
        <span aria-hidden style={{ marginRight: 6 }}>💬</span>
        {q.prompt}
      </div>

      {answered && (
        <div
          key={`${idx}-feedback`}
          className="fc-fade-in-up"
          style={{ textAlign: "center", margin: "20px 0 14px", fontSize: 16, fontWeight: 800, color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)" }}
        >
          {isCorrect ? "✨ Nice! 答对啦" : "差一点点！正确答案已为你标出 ⬇"}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: answered ? 0 : 24 }}>
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
                position: "relative", display: "flex", alignItems: "center", gap: 12, width: "100%",
                minHeight: 56, padding: "14px 16px 14px 14px", borderRadius: "var(--fc-radius)", background: bg,
                border: `2px solid ${border}`, color: textColor, textAlign: "left",
                cursor: answered ? "default" : "pointer", opacity, transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              <span style={{ flex: "0 0 auto", display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: "50%", background: letterBg, color: letterColor, fontFamily: "var(--fc-font-display)", fontWeight: 800, fontSize: 12, lineHeight: 1, transition: "background 200ms, color 200ms" }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1, fontFamily: "var(--fc-font-body)", fontWeight: 700, fontSize: 17, lineHeight: 1.3, wordBreak: "break-word" }}>
                {opt}
              </span>
              {answered && isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-green-dark)", lineHeight: 1, flex: "0 0 auto" }} aria-hidden>✓</span>}
              {answered && isThisPicked && !isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-soft-warn)", lineHeight: 1, flex: "0 0 auto" }} aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ textAlign: "center", marginTop: 16, padding: "10px 16px", background: "var(--fc-surface-soft, #f5f5f5)", borderRadius: 12, fontSize: 16, fontWeight: 700, color: "var(--fc-ink)", lineHeight: 1.5 }}>
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
