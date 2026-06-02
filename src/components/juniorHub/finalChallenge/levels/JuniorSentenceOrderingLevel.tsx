/**
 * 初中 — 连词成句·点击式 (sentence_ordering) — Fork 自 primaryHub SentenceOrderingLevel。
 * 点乱序词块按顺序组句 → 检查;判对朗读完整句正音。
 * 换:useJuniorHub / junior questionBank / JuniorLevelShell / 册别键 fc:jr:volume。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { speakKid, stopSpeaking, prefetchTTSBatchKid, unlockAudioSync } from "@/lib/speak";
import { isWebSpeechSupported, speakWebSpeech } from "@/lib/webSpeech";
import { getQuestionsByType, getDrawCount } from "@/lib/juniorHub/finalChallenge/questionBank";
import JuniorLevelShell, { type LevelShellPlayApi } from "@/components/juniorHub/finalChallenge/JuniorLevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "sentence_ordering" }>;

function unlockAudio(): void {
  unlockAudioSync();
}

export interface JuniorSentenceOrderingProps {
  levelId?: number;
  levelName?: string;
  introHint?: string;
}

export default function JuniorSentenceOrderingLevel({
  levelId = 4,
  levelName = "连词成句",
  introHint = "点一点下面的词块,按顺序排成一句通顺的话。排完点「检查」。",
}: JuniorSentenceOrderingProps = {}) {
  const { grade } = useJuniorHub();
  const vol = (sessionStorage.getItem("fc:jr:volume") === "v2" ? "v2" : "v1") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("sentence_ordering", getDrawCount(grade), vol, grade),
    [vol, grade],
  );

  useEffect(() => {
    if (questions.length === 0) return;
    prefetchTTSBatchKid(questions.map((q) => q.display), { grade });
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
      renderPlay={(api) => (
        <PlayCard key={questions[api.idx].id} q={questions[api.idx]} api={api} grade={grade} />
      )}
    />
  );
}

function PlayCard({ q, api, grade }: { q: Q; api: LevelShellPlayApi; grade: number }) {
  const { answered, pick } = api;
  const [placed, setPlaced] = useState<number[]>([]);

  const [speaking, setSpeaking] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); stopSpeaking(); }, []);

  const speakDisplay = useCallback(
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

  const builtTokens = placed.map((i) => q.tokens[i]);
  const isComplete = placed.length === q.tokens.length;
  const isRight = isComplete && q.answer.every((tok, i) => builtTokens[i] === tok);
  const isCorrect = answered && isRight;

  const addToken = (i: number) => {
    if (answered) return;
    if (placed.includes(i)) return;
    setPlaced((p) => [...p, i]);
  };
  const removeAt = (posInPlaced: number) => {
    if (answered) return;
    setPlaced((p) => p.filter((_, k) => k !== posInPlaced));
  };
  const undo = () => {
    if (answered) return;
    setPlaced((p) => p.slice(0, -1));
  };

  const check = () => {
    if (answered || !isComplete) return;
    const right = q.answer.every((tok, i) => builtTokens[i] === tok);
    const wrongInfo = right
      ? undefined
      : {
          questionId: q.id,
          questionType: q.type,
          stem: `连词成句:${q.tokens.join(" / ")}`,
          userText: builtTokens.join(" "),
          correctText: q.display,
          vocab_domain: q.vocab_domain,
          grammar_point: q.grammar_point,
        };
    pick(0, right, wrongInfo);
    if (right) speakDisplay(q.display);
  };

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered ? "连词成句" : isCorrect ? "✨ Nice!" : "差一点点！";

  return (
    <div>
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--fc-ink-soft)", marginBottom: 14 }}>
        🧩 点词块,按顺序排成一句话
      </p>

      <div
        style={{
          minHeight: 64, margin: "0 auto", maxWidth: 460, padding: "12px 14px",
          background: "var(--fc-blue-bg, #eaf3ff)", borderRadius: "var(--fc-radius)",
          border: "2px solid var(--fc-blue)", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
        }}
      >
        {placed.length === 0 ? (
          <span style={{ color: "var(--fc-ink-mute, #9a948a)", fontSize: 14 }}>点下面的词块,从这里开始组句…</span>
        ) : (
          placed.map((tokenIdx, pos) => (
            <button
              key={`${tokenIdx}-${pos}`}
              type="button"
              disabled={answered}
              onClick={() => removeAt(pos)}
              className={answered ? undefined : "fc-btn-press"}
              style={{
                padding: "8px 12px", borderRadius: 10,
                border: `2px solid ${answered ? (isRight ? "var(--fc-green)" : "var(--fc-soft-warn)") : "var(--fc-blue)"}`,
                background: answered ? (isRight ? "var(--fc-green-bg)" : "rgba(255, 136, 85, 0.12)") : "white",
                color: answered ? (isRight ? "var(--fc-green-dark)" : "var(--fc-soft-warn)") : "var(--fc-ink)",
                fontFamily: "var(--fc-font-body)", fontWeight: 700, fontSize: 16,
                cursor: answered ? "default" : "pointer",
              }}
            >
              {q.tokens[tokenIdx]}
            </button>
          ))
        )}
      </div>

      {!answered && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14 }}>
          <button
            type="button"
            onClick={undo}
            disabled={placed.length === 0}
            className="fc-btn-press"
            style={{
              padding: "8px 18px", borderRadius: "var(--fc-radius-pill)", border: "2px solid var(--fc-border-medium)",
              background: "white", color: "var(--fc-ink-soft)", fontWeight: 700, fontSize: 14,
              cursor: placed.length === 0 ? "default" : "pointer", opacity: placed.length === 0 ? 0.5 : 1,
            }}
          >
            ↩ 撤销
          </button>
          <button
            type="button"
            onClick={check}
            disabled={!isComplete}
            className="fc-btn-press fc-shadow-green"
            style={{
              padding: "8px 24px", borderRadius: "var(--fc-radius-pill)", border: "none",
              background: isComplete ? "var(--fc-green)" : "var(--fc-border-medium)", color: "white",
              fontWeight: 800, fontSize: 15, cursor: isComplete ? "pointer" : "default", fontFamily: "var(--fc-font-display)",
            }}
          >
            ✓ 检查
          </button>
        </div>
      )}

      <div style={{ margin: "18px auto 0", maxWidth: 460, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {q.tokens.map((tok, i) => {
          const used = placed.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={answered || used}
              onClick={() => addToken(i)}
              className={answered || used ? undefined : "fc-btn-press"}
              style={{
                padding: "10px 14px", borderRadius: 12, border: "2px solid var(--fc-border-medium)",
                background: used ? "var(--fc-paper-warm)" : "white",
                color: used ? "var(--fc-ink-mute, #b8b2a8)" : "var(--fc-ink)",
                fontFamily: "var(--fc-font-body)", fontWeight: 700, fontSize: 16,
                cursor: answered || used ? "default" : "pointer", opacity: used ? 0.45 : 1, transition: "opacity 150ms",
              }}
            >
              {tok}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          key={`${api.idx}-feedback`}
          className="fc-fade-in-up"
          style={{ textAlign: "center", margin: "20px 0 12px", fontSize: 16, fontWeight: 800, color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)" }}
        >
          {isCorrect ? "✨ Nice! 排对啦" : "差一点点！正确顺序在下面 ⬇"}
        </div>
      )}

      {answered && (
        <div
          style={{
            textAlign: "center", margin: "0 auto", maxWidth: 460, padding: "12px 16px",
            background: "var(--fc-surface-soft, #f5f5f5)", borderRadius: 12, fontSize: 18, fontWeight: 700, color: "var(--fc-ink)",
          }}
        >
          🔊 {q.display}
          <button
            type="button"
            onClick={() => { if (!speaking) speakDisplay(q.display); }}
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
