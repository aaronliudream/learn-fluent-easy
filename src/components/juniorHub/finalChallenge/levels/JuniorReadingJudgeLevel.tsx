/**
 * 初中 — 阅读判断 (reading_judge_TF) — Fork 自 primaryHub ReadingJudgeLevel。
 * 1 篇短文 + N 道 T/F 子题,subQuestions 映射成 shell 眼里的 N 道题。
 * 换:useJuniorHub / junior questionBank / JuniorLevelShell / 册别键 fc:jr:volume。
 */
import { useMemo } from "react";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { getQuestionsByType } from "@/lib/juniorHub/finalChallenge/questionBank";
import JuniorLevelShell, { type LevelShellPlayApi } from "@/components/juniorHub/finalChallenge/JuniorLevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion, FCSubQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "reading_judge_TF" }>;

export interface JuniorReadingProps {
  levelId?: number;
  levelName?: string;
}

export default function JuniorReadingJudgeLevel({
  levelId = 3,
  levelName = "阅读判断",
}: JuniorReadingProps = {}) {
  const { grade } = useJuniorHub();
  const vol = (sessionStorage.getItem("fc:jr:volume") === "v2" ? "v2" : "v1") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("reading_judge_TF", 1, vol, grade),
    [vol, grade],
  );

  if (questions.length === 0 || questions[0].subQuestions.length === 0) {
    return (
      <div style={{ minHeight: "100vh", padding: 40, textAlign: "center", color: "var(--fc-ink-soft)" }}>
        题库暂无内容,请稍后再试。
      </div>
    );
  }

  const q = questions[0];
  const subTotal = q.subQuestions.length;

  return (
    <JuniorLevelShell
      levelId={levelId}
      levelName={levelName}
      introHint={`先读短文,然后判断每句话是否与短文相符 (共 ${subTotal} 题)。`}
      introMood="thinking"
      total={subTotal}
      renderPlay={(api) => (
        <PlayCard
          parentId={q.id}
          parentType={q.type}
          vocab_domain={q.vocab_domain}
          grammar_point={q.grammar_point}
          passage={q.passage}
          sub={q.subQuestions[api.idx]}
          api={api}
        />
      )}
    />
  );
}

function PlayCard({
  parentId,
  parentType,
  vocab_domain,
  grammar_point,
  passage,
  sub,
  api,
}: {
  parentId: string;
  parentType: Q["type"];
  vocab_domain: string[];
  grammar_point: string[];
  passage: string;
  sub: FCSubQuestion;
  api: LevelShellPlayApi;
}) {
  const { idx, total, answered, picked, pick } = api;
  const correctIdx = sub.answer;
  const isCorrect = answered && picked === correctIdx;

  const wrongInfoFor = (picked: number) => ({
    questionId: `${parentId}_sub${idx}`,
    questionType: parentType,
    stem: sub.stem,
    userText: sub.options[picked],
    correctText: sub.options[correctIdx],
    vocab_domain,
    grammar_point,
  });

  useMcKeyboard({
    optionCount: 2,
    answered,
    onPick: (i) => pick(i, i === correctIdx, i === correctIdx ? undefined : wrongInfoFor(i)),
    enabled: true,
  });

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered ? "回到短文里找" : isCorrect ? "✨ Nice!" : "差一点点！";

  return (
    <div>
      <div
        style={{
          background: "white",
          border: "2px solid var(--fc-border-medium)",
          borderRadius: "var(--fc-radius)",
          padding: "14px 16px",
          marginBottom: 16,
          boxShadow: "var(--fc-shadow-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--fc-ink-soft)", fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>
          <span aria-hidden style={{ fontSize: 18 }}>📖</span>
          短文 · 反复看也行
        </div>
        <div style={{ maxHeight: "38vh", overflowY: "auto", paddingRight: 4, fontFamily: "var(--fc-font-body)", fontSize: 14.5, lineHeight: 1.7, color: "var(--fc-ink)" }}>
          {passage}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--fc-ink-mute)", marginBottom: 6, textAlign: "center" }}>
        问题 {idx + 1} / {total}
      </div>

      <div style={{ position: "relative" }}>
        {isCorrect && (
          <>
            <span className="fc-celebrate-star" style={{ position: "absolute", top: -8, left: "25%", fontSize: 20 }} aria-hidden>✨</span>
            <span className="fc-celebrate-star" style={{ position: "absolute", top: -4, right: "25%", fontSize: 24, animationDelay: "0.15s" }} aria-hidden>⭐</span>
          </>
        )}
        <div style={{ textAlign: "center", fontFamily: "var(--fc-font-body)", fontWeight: 700, fontSize: 17, color: "var(--fc-ink)", padding: "10px 8px 14px", lineHeight: 1.5 }}>
          {sub.stem}
        </div>
      </div>

      {answered && (
        <div
          key={`${idx}-feedback`}
          className="fc-fade-in-up"
          style={{ textAlign: "center", marginBottom: 12, fontSize: 16, fontWeight: 800, color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)" }}
        >
          {isCorrect ? "✨ Nice! 答对啦" : "差一点点！正确答案已为你标出 ⬇"}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {sub.options.map((label, i) => {
          const isT = i === 0;
          const isThisCorrect = i === correctIdx;
          const isThisPicked = picked === i;
          let bg = isT ? "var(--fc-green-bg)" : "var(--fc-purple-bg)";
          let border = isT ? "var(--fc-green)" : "var(--fc-purple)";
          let textColor = isT ? "var(--fc-green-dark)" : "var(--fc-purple-dark)";
          let iconColor = isT ? "var(--fc-green)" : "var(--fc-purple)";
          let opacity = 1;
          let extraClass = "fc-btn-press";
          if (answered) {
            if (isThisCorrect) {
              bg = "var(--fc-green-bg)"; border = "var(--fc-green)"; textColor = "var(--fc-green-dark)"; iconColor = "var(--fc-green)";
              if (isThisPicked) extraClass += " fc-pulse-correct";
            } else if (isThisPicked) {
              bg = "rgba(255, 136, 85, 0.12)"; border = "var(--fc-soft-warn)"; textColor = "var(--fc-soft-warn)"; iconColor = "var(--fc-soft-warn)";
            } else { opacity = 0.4; }
          }
          const m = label.match(/^[A-Z]\s*\((.+)\)$/);
          const subtext = m ? m[1] : label;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => pick(i, isThisCorrect, isThisCorrect ? undefined : wrongInfoFor(i))}
              className={extraClass}
              style={{
                position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6, minHeight: 100, padding: "12px 8px", borderRadius: "var(--fc-radius)", background: bg,
                border: `2px solid ${border}`, color: textColor, cursor: answered ? "default" : "pointer", opacity,
                transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              <span aria-hidden style={{ fontFamily: "var(--fc-font-display)", fontWeight: 900, fontSize: 40, lineHeight: 1, color: iconColor, transition: "color 200ms" }}>
                {isT ? "✓" : "✗"}
              </span>
              <span style={{ fontFamily: "var(--fc-font-body)", fontWeight: 700, fontSize: 14 }}>{subtext}</span>
              {!answered && <span aria-hidden style={{ position: "absolute", top: 6, right: 8, fontSize: 10, color: "var(--fc-ink-mute)", fontFamily: "var(--fc-font-body)" }}>{i + 1}</span>}
              {answered && isThisCorrect && <span aria-hidden style={{ position: "absolute", top: 6, right: 8, fontSize: 14, color: "var(--fc-green-dark)", fontWeight: 700 }}>✓ 答案</span>}
              {answered && isThisPicked && !isThisCorrect && <span aria-hidden style={{ position: "absolute", top: 6, right: 8, fontSize: 13, color: "var(--fc-soft-warn)", fontWeight: 700 }}>你选的</span>}
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
