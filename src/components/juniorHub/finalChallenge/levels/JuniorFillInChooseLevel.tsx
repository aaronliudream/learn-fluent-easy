/**
 * 初中 — 选词填空 (fill_in_choose) — Fork 自 primaryHub FillInChooseLevel。
 * 换:useJuniorHub / junior questionBank / JuniorLevelShell / 册别键 fc:jr:volume。
 * levelId/levelName 由分发器按 v1/v2 关号注入(junior 关号≠固定题型)。
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

type Q = Extract<FCQuestion, { type: "fill_in_choose" }>;

function unlockAudio(): void {
  unlockAudioSync();
}

export interface JuniorLevelProps {
  levelId?: number;
  levelName?: string;
  introHint?: string;
}

export default function JuniorFillInChooseLevel({
  levelId = 1,
  levelName = "选词填空",
  introHint = "读一读句子,从选项里选出填进空格(___)里最合适的那个。选对了会朗读完整句子。",
}: JuniorLevelProps = {}) {
  const { grade } = useJuniorHub();
  const vol = (sessionStorage.getItem("fc:jr:volume") === "v2" ? "v2" : "v1") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("fill_in_choose", getDrawCount(grade), vol, grade),
    [vol, grade],
  );

  useEffect(() => {
    if (questions.length === 0) return;
    prefetchTTSBatchKid(questions.map((q) => q.audio).filter(Boolean) as string[], { grade });
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

function PromptWithBlanks({ prompt }: { prompt: string }) {
  const parts = prompt.split("___");
  return (
    <span style={{ lineHeight: 1.6 }}>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span
              aria-label="空格"
              style={{
                display: "inline-block",
                minWidth: 56,
                borderBottom: "3px solid var(--fc-primary)",
                margin: "0 6px",
                verticalAlign: "middle",
                height: "1.1em",
              }}
            />
          )}
        </span>
      ))}
    </span>
  );
}

function PlayCard({ q, api, grade }: { q: Q; api: LevelShellPlayApi; grade: number }) {
  const { answered, picked, pick, idx } = api;
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

  const [speaking, setSpeaking] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); stopSpeaking(); }, []);

  const speakAnswer = useCallback(
    (text: string) => {
      if (!text) return;
      stopSpeaking();
      setSpeaking(true);
      const done = () => setSpeaking(false);
      speakKid(text, { grade })
        .then(done)
        .catch(() => { if (isWebSpeechSupported()) void speakWebSpeech(text, 0.85); done(); });
      const safety = window.setTimeout(done, 6000);
      timers.current.push(safety);
    },
    [grade],
  );

  const wrongInfoFor = (pickedIdx: number) => ({
    questionId: q.id,
    questionType: q.type,
    stem: q.prompt,
    userText: q.options[pickedIdx],
    correctText: q.options[correctIdx],
    vocab_domain: q.vocab_domain,
    grammar_point: q.grammar_point,
  });

  const handlePick = useCallback(
    (i: number) => {
      if (answered) return;
      const correct = i === correctIdx;
      pick(i, correct, correct ? undefined : wrongInfoFor(i));
      if (correct && q.audio) speakAnswer(q.audio);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answered, correctIdx, pick, q.audio, speakAnswer],
  );

  useMcKeyboard({ optionCount: q.options.length, answered, onPick: handlePick, enabled: true });

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered ? "选词填空" : isCorrect ? "✨ Nice!" : "差一点点！";

  return (
    <div>
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--fc-ink-soft)", marginBottom: 16 }}>
        选词填空:把最合适的词填进空格。
      </p>
      <div
        style={{
          margin: "8px auto 0",
          maxWidth: 440,
          padding: "18px 20px",
          background: "var(--fc-blue-bg, #eaf3ff)",
          borderRadius: "var(--fc-radius)",
          border: "2px solid var(--fc-blue)",
          textAlign: "center",
          fontFamily: "var(--fc-font-body)",
          fontWeight: 800,
          fontSize: 20,
          color: "var(--fc-ink)",
        }}
      >
        <span aria-hidden style={{ marginRight: 6 }}>✏️</span>
        <PromptWithBlanks prompt={q.prompt} />
      </div>

      {answered && (
        <div
          key={`${idx}-feedback`}
          className="fc-fade-in-up"
          style={{
            textAlign: "center",
            margin: "20px 0 14px",
            fontSize: 16,
            fontWeight: 800,
            color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)",
          }}
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
              bg = "var(--fc-green-bg)"; border = "var(--fc-green)"; textColor = "var(--fc-green-dark)";
              letterBg = "var(--fc-green)"; letterColor = "white";
              if (isThisPicked) extraClass += " fc-pulse-correct";
            } else if (isThisPicked) {
              bg = "rgba(255, 136, 85, 0.12)"; border = "var(--fc-soft-warn)"; textColor = "var(--fc-soft-warn)";
              letterBg = "var(--fc-soft-warn)"; letterColor = "white";
            } else { opacity = 0.5; }
          }
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => handlePick(i)}
              className={extraClass}
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: 12,
                width: "100%", minHeight: 56, padding: "14px 16px 14px 14px",
                borderRadius: "var(--fc-radius)", background: bg, border: `2px solid ${border}`,
                color: textColor, textAlign: "left", cursor: answered ? "default" : "pointer",
                opacity, transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              <span style={{ flex: "0 0 auto", display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: "50%", background: letterBg, color: letterColor, fontFamily: "var(--fc-font-display)", fontWeight: 800, fontSize: 12, lineHeight: 1, transition: "background 200ms, color 200ms" }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1, fontFamily: "var(--fc-font-body)", fontWeight: 700, fontSize: 18, lineHeight: 1.3, wordBreak: "break-word" }}>
                {opt}
              </span>
              {answered && isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-green-dark)", lineHeight: 1, flex: "0 0 auto" }} aria-hidden>✓</span>}
              {answered && isThisPicked && !isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-soft-warn)", lineHeight: 1, flex: "0 0 auto" }} aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      {answered && isCorrect && q.audio && (
        <div style={{ textAlign: "center", marginTop: 16, padding: "10px 16px", background: "var(--fc-surface-soft, #f5f5f5)", borderRadius: 12, fontSize: 18, fontWeight: 700, color: "var(--fc-ink)" }}>
          🔊 {q.audio}
          <button
            type="button"
            onClick={() => { if (!speaking) speakAnswer(q.audio!); }}
            disabled={speaking}
            style={{ marginLeft: 10, padding: "4px 12px", borderRadius: 999, border: "none", background: "var(--fc-primary)", color: "white", fontSize: 13, fontWeight: 700, cursor: speaking ? "default" : "pointer" }}
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
