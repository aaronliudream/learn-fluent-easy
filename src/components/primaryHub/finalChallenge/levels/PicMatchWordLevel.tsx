/**
 * 关 2 — 看图选词 (picture_match_word)
 *
 * 与关 1「看图选句」(#71d) 共用 <LevelShell> 三段式骨架,只是 play 阶段
 * 选项是【单词】(2-6 字母短文本),改用横排 3 张卡片更紧凑,适配 9:16 竖屏。
 *
 * 答对/答错反馈与关 1 同款:
 *   - 答对: 绿系卡片 + 一次性绿色脉冲 (fc-pulse-correct) + 撒星 + Rex(excited)
 *   - 答错: 柔橙卡片 (不用红) + 正确答案同步绿色高亮 + Rex(encouraging)
 *
 * 错题入库 TODO #71j 统一做。
 */

import { useMemo } from "react";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { getQuestionsByType } from "@/lib/primaryHub/finalChallenge/questionBank";
import LevelShell, {
  type LevelShellPlayApi,
} from "@/components/primaryHub/finalChallenge/LevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "picture_match_word" }>;

export default function PicMatchWordLevel() {
  const questions = useMemo(
    () => getQuestionsByType("picture_match_word", 5),
    [],
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
      levelId={2}
      levelName="看图选词"
      introHint="看一看图,从 3 个单词里选出对应的那个。"
      introMood="encouraging"
      total={questions.length}
      renderPlay={(api) => <PlayCard q={questions[api.idx]} api={api} />}
    />
  );
}

function PlayCard({ q, api }: { q: Q; api: LevelShellPlayApi }) {
  const { answered, picked, pick } = api;
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

  // 1-3 键盘挑选项。
  useMcKeyboard({
    optionCount: q.options.length,
    answered,
    onPick: (i) => pick(i, i === correctIdx),
    enabled: true,
  });

  const rexMood = !answered ? "happy" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered
    ? "看图选单词"
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
          marginBottom: 8,
        }}
      >
        {q.prompt}
      </p>

      {/* 大 emoji + 答对时撒星 */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "16px 0 24px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 110,
            lineHeight: 1,
            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))",
          }}
          aria-hidden
        >
          {q.emoji}
        </span>
        {isCorrect && (
          <>
            <span
              className="fc-celebrate-star"
              style={{ position: "absolute", top: 8, left: "32%", fontSize: 22 }}
              aria-hidden
            >
              ✨
            </span>
            <span
              className="fc-celebrate-star"
              style={{
                position: "absolute",
                top: 16,
                right: "30%",
                fontSize: 26,
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
                bottom: 10,
                left: "44%",
                fontSize: 20,
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

      {/* 3 张单词卡片(横排,适配短文本) */}
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
              onClick={() => pick(i, isThisCorrect)}
              className={extraClass}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 96,
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
              {/* 左上角字母标签 */}
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

              {/* 单词 */}
              <span
                style={{
                  fontFamily: "var(--fc-font-body)",
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: 1.1,
                  textAlign: "center",
                  // 长单词缩字号避免溢出
                  ...(opt.length > 8 ? { fontSize: 18 } : null),
                  ...(opt.length > 11 ? { fontSize: 16 } : null),
                  wordBreak: "break-word",
                }}
              >
                {opt}
              </span>

              {/* 结果图标 */}
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
