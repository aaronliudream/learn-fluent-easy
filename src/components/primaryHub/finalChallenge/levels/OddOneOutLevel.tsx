/**
 * 关 5 — 找不同类词 (odd_one_out)
 *
 * 无音频、无图，3 个单词中选出"不属于同一类"的那个。
 * 几乎完全复用关 2 (PicMatchWordLevel) 的横排 3 卡片布局,差别只在:
 *   - 没有大 emoji 图;改用顶部 🔍 思考装饰 + 题干文字
 *   - Rex 默认 "thinking" 心情 (更贴合"找不同"的思考感)
 *   - 没有音频 → 不传 onBeforeStart, 不引 speakKid
 */

import { useMemo } from "react";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { getQuestionsByType } from "@/lib/primaryHub/finalChallenge/questionBank";
import LevelShell, {
  type LevelShellPlayApi,
} from "@/components/primaryHub/finalChallenge/LevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "odd_one_out" }>;

export default function OddOneOutLevel() {
  // 读不到 → 默认 v2，安全。
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("odd_one_out", 5, vol),
    [vol],
  );

  if (questions.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 40,
          textAlign: "center",
          color: "var(--fc-ink-soft)",
        }}
      >
        题库暂无内容,请稍后再试。
      </div>
    );
  }

  return (
    <LevelShell
      levelId={5}
      levelName="找不同类词"
      introHint="3 个单词里有 1 个不属于同一类,把它找出来。"
      introMood="thinking"
      total={questions.length}
      renderPlay={(api) => <PlayCard q={questions[api.idx]} api={api} />}
    />
  );
}

function PlayCard({ q, api }: { q: Q; api: LevelShellPlayApi }) {
  const { answered, picked, pick } = api;
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

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
    onPick: (i) =>
      pick(i, i === correctIdx, i === correctIdx ? undefined : wrongInfoFor(i)),
    enabled: true,
  });

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered
    ? "看看哪个不一样"
    : isCorrect
      ? "✨ Nice!"
      : "差一点点！";

  return (
    <div>
      {/* 题干指令 */}
      <p
        style={{
          textAlign: "center",
          fontSize: 14,
          color: "var(--fc-ink-soft)",
          marginBottom: 4,
        }}
      >
        {q.prompt}
      </p>

      {/* 装饰头:思考放大镜 + 大字提示 (替代关 2 的 emoji 图位置) */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "16px 0 28px",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            fontSize: 64,
            lineHeight: 1,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))",
          }}
        >
          🔍
        </span>
        <div
          style={{
            marginTop: 10,
            fontSize: 18,
            fontWeight: 800,
            color: "var(--fc-ink)",
            fontFamily: "var(--fc-font-display)",
          }}
        >
          哪个不是同一类?
        </div>
        {isCorrect && (
          <>
            <span
              className="fc-celebrate-star"
              style={{ position: "absolute", top: 8, left: "30%", fontSize: 20 }}
              aria-hidden
            >
              ✨
            </span>
            <span
              className="fc-celebrate-star"
              style={{
                position: "absolute",
                top: 12,
                right: "30%",
                fontSize: 24,
                animationDelay: "0.15s",
              }}
              aria-hidden
            >
              ⭐
            </span>
            <span
              className="fc-celebrate-star"
              style={{
                position: "absolute",
                bottom: 4,
                left: "48%",
                fontSize: 18,
                animationDelay: "0.3s",
              }}
              aria-hidden
            >
              ✨
            </span>
          </>
        )}
      </div>

      {/* 反馈横条 */}
      {answered && (
        <div
          key={`${api.idx}-feedback`}
          className="fc-fade-in-up"
          style={{
            textAlign: "center",
            marginBottom: 16,
            fontSize: 16,
            fontWeight: 800,
            color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)",
          }}
        >
          {isCorrect ? "✨ Nice! 答对啦" : "差一点点！正确答案已为你标出 ⬇"}
        </div>
      )}

      {/* 3 张单词卡片 (复用关 2 同款横排布局) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${q.options.length}, 1fr)`,
          gap: 12,
        }}
      >
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
              bg = "var(--fc-green-bg)";
              border = "var(--fc-green)";
              textColor = "var(--fc-green-dark)";
              letterBg = "var(--fc-green)";
              letterColor = "white";
              if (isThisPicked) extraClass += " fc-pulse-correct";
            } else if (isThisPicked) {
              bg = "rgba(255, 136, 85, 0.12)";
              border = "var(--fc-soft-warn)";
              textColor = "var(--fc-soft-warn)";
              letterBg = "var(--fc-soft-warn)";
              letterColor = "white";
            } else {
              opacity = 0.5;
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() =>
                pick(i, isThisCorrect, isThisCorrect ? undefined : wrongInfoFor(i))
              }
              className={extraClass}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 110,
                padding: "16px 8px",
                borderRadius: "var(--fc-radius)",
                background: bg,
                border: `2px solid ${border}`,
                color: textColor,
                cursor: answered ? "default" : "pointer",
                opacity,
                transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  left: 8,
                  display: "grid",
                  placeItems: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: letterBg,
                  color: letterColor,
                  fontFamily: "var(--fc-font-display)",
                  fontWeight: 800,
                  fontSize: 12,
                  lineHeight: 1,
                  transition: "background 200ms, color 200ms",
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span
                style={{
                  fontFamily: "var(--fc-font-body)",
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: 1.1,
                  textAlign: "center",
                  ...(opt.length > 8 ? { fontSize: 18 } : null),
                  ...(opt.length > 11 ? { fontSize: 16 } : null),
                  wordBreak: "break-word",
                }}
              >
                {opt}
              </span>
              {answered && isThisCorrect && (
                <span
                  style={{ fontSize: 18, color: "var(--fc-green-dark)", lineHeight: 1 }}
                  aria-hidden
                >
                  ✓
                </span>
              )}
              {answered && isThisPicked && !isThisCorrect && (
                <span
                  style={{ fontSize: 18, color: "var(--fc-soft-warn)", lineHeight: 1 }}
                  aria-hidden
                >
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 左下角 Rex */}
      <div
        style={{
          position: "fixed",
          left: 12,
          bottom: 90,
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <RexMascot mood={rexMood} message={rexMessage} size="sm" />
      </div>
    </div>
  );
}

/** 暴露给 strengthen 训练页 (#72a) — 行为零改, 仅可见性扩散。 */
export { PlayCard as OddOneOutPlayCard };
