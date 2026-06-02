/**
 * 初中 — 句型转换 (sentence_transform) — Fork 自 primaryHub SentenceTransformLevel。
 * 纯文字选择,无朗读:prompt=原句+括号要求,options=3 个改写句,选 answer。
 * 换:useJuniorHub / junior questionBank / JuniorLevelShell / 册别键 fc:jr:volume。
 * levelId/levelName 由分发器按 v1/v2 关号注入。
 */
import { useMemo } from "react";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { getQuestionsByType, getDrawCount } from "@/lib/juniorHub/finalChallenge/questionBank";
import JuniorLevelShell, { type LevelShellPlayApi } from "@/components/juniorHub/finalChallenge/JuniorLevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "sentence_transform" }>;

export interface JuniorSentenceTransformProps {
  levelId?: number;
  levelName?: string;
  introHint?: string;
}

export default function JuniorSentenceTransformLevel({
  levelId = 3,
  levelName = "句型转换",
  introHint = "读一读原句和括号里的要求,从 3 个改写句里选出正确的那句。",
}: JuniorSentenceTransformProps = {}) {
  const { grade } = useJuniorHub();
  const vol = (sessionStorage.getItem("fc:jr:volume") === "v2" ? "v2" : "v1") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("sentence_transform", getDrawCount(grade), vol, grade),
    [vol, grade],
  );

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
      renderPlay={(api) => <PlayCard q={questions[api.idx]} api={api} />}
    />
  );
}

function PlayCard({ q, api }: { q: Q; api: LevelShellPlayApi }) {
  const { answered, picked, pick, idx } = api;
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

  const wrongInfoFor = (pickedIdx: number) => ({
    questionId: q.id,
    questionType: q.type,
    stem: q.prompt,
    userText: q.options[pickedIdx],
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

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered ? "句型转换" : isCorrect ? "✨ Nice!" : "差一点点！";

  return (
    <div>
      <p style={{ textAlign: "center", fontSize: 14, color: "var(--fc-ink-soft)", marginBottom: 16 }}>
        按括号里的要求,选出正确的改写句。
      </p>

      <div
        style={{
          margin: "8px auto 0", maxWidth: 440, padding: "18px 20px",
          background: "var(--fc-blue-bg, #eaf3ff)", borderRadius: "var(--fc-radius)",
          border: "2px solid var(--fc-blue)", textAlign: "center", fontFamily: "var(--fc-font-body)",
          fontWeight: 800, fontSize: 19, lineHeight: 1.5, color: "var(--fc-ink)",
        }}
      >
        <span aria-hidden style={{ marginRight: 6 }}>🔄</span>
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
              <span style={{ flex: 1, fontFamily: "var(--fc-font-body)", fontWeight: 700, fontSize: 16, lineHeight: 1.4, wordBreak: "break-word" }}>
                {opt}
              </span>
              {answered && isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-green-dark)", lineHeight: 1, flex: "0 0 auto" }} aria-hidden>✓</span>}
              {answered && isThisPicked && !isThisCorrect && <span style={{ fontSize: 18, color: "var(--fc-soft-warn)", lineHeight: 1, flex: "0 0 auto" }} aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      <div style={{ position: "fixed", left: 12, bottom: 90, zIndex: 5, pointerEvents: "none" }}>
        <RexMascot mood={rexMood} message={rexMessage} size="sm" />
      </div>
    </div>
  );
}
