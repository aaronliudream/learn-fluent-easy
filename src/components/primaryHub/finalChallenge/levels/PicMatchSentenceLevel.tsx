/**
 * 关 1 — 看图选句 (picture_match_sentence)
 *
 * UI 由 <LevelShell> 提供三段式骨架, 这里只负责 play 阶段单题视觉:
 *   - 大 emoji 居中
 *   - 3 个英文句子选项 (垂直排列)
 *   - 答完: 正确项绿系 + (若被选中)绿色脉冲 + 星星; 错选项柔橙 + 鼓励语
 *
 * 键盘: 1/2/3 数字键选项 (useMcKeyboard)。
 * 错题记录: TODO #71j 统一做。
 */

import { useMemo } from "react";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { getQuestionsByType } from "@/lib/primaryHub/finalChallenge/questionBank";
import LevelShell, {
  type LevelShellPlayApi,
} from "@/components/primaryHub/finalChallenge/LevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "picture_match_sentence" }>;

export default function PicMatchSentenceLevel() {
  // 读不到 → 默认 v2，安全。
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  // 抓 5 道题; seed 不够时 getQuestionsByType 会按现有池子返回少于 5 道。
  const questions = useMemo(
    () => getQuestionsByType("picture_match_sentence", 5, vol),
    [vol],
  );

  // 题库空时给个友好提示 (Phase 1 占位题保证至少 1 道)。
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
        题库暂无内容，请稍后再试。
      </div>
    );
  }

  return (
    <LevelShell
      levelId={1}
      levelName="看图选句"
      introHint="看一看图，从 3 句话里选出与图相符的那句。"
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
  const isWrong = answered && picked !== null && picked !== correctIdx;

  // 答错时打包 wrongInfo 给 shell 入库 + done 屏回顾。
  const wrongInfoFor = (picked: number) => ({
    questionId: q.id,
    questionType: q.type,
    stem: q.prompt,
    userText: q.options[picked],
    correctText: q.options[correctIdx],
    vocab_domain: q.vocab_domain,
    grammar_point: q.grammar_point,
  });

  // 1-3 键盘挑选项。
  useMcKeyboard({
    optionCount: q.options.length,
    answered,
    onPick: (i) =>
      pick(i, i === correctIdx, i === correctIdx ? undefined : wrongInfoFor(i)),
    enabled: true,
  });

  const rexMood = !answered ? "happy" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered
    ? "看图猜句子"
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
        {q.image ? (
          <img
            src={q.image}
            alt=""
            style={{
              display: "block",
              margin: "0 auto",
              width: 160,
              height: 160,
              objectFit: "contain",
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))",
            }}
            onError={(e) => {
              // 图加载失败 → 回退 emoji
              const el = e.currentTarget;
              const fb = document.createElement("span");
              fb.textContent = q.emoji ?? "";
              fb.style.fontSize = "110px";
              fb.style.lineHeight = "1";
              el.replaceWith(fb);
            }}
          />
        ) : (
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
        )}
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
          key={`${api.idx}-feedback`} // 让动画在每题重放
          className="fc-fade-in-up"
          style={{
            textAlign: "center",
            marginBottom: 14,
            fontSize: 16,
            fontWeight: 800,
            color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)",
          }}
        >
          {isCorrect ? "✨ Nice! 答对啦" : "差一点点！正确答案已为你标出 ⬇"}
        </div>
      )}

      {/* 3 个句子选项 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {q.options.map((opt, i) => {
          const isThisCorrect = i === correctIdx;
          const isThisPicked = picked === i;

          let bg = "white";
          let border = "var(--fc-border-medium)";
          let textColor = "var(--fc-ink)";
          let opacity = 1;
          let extraClass = "fc-btn-press";

          if (answered) {
            if (isThisCorrect) {
              bg = "var(--fc-green-bg)";
              border = "var(--fc-green)";
              textColor = "var(--fc-green-dark)";
              if (isThisPicked) extraClass += " fc-pulse-correct";
            } else if (isThisPicked) {
              bg = "rgba(255, 136, 85, 0.12)";
              border = "var(--fc-soft-warn)";
              textColor = "var(--fc-soft-warn)";
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
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "16px 18px",
                borderRadius: "var(--fc-radius)",
                background: bg,
                border: `2px solid ${border}`,
                color: textColor,
                fontFamily: "var(--fc-font-body)",
                fontWeight: 600,
                fontSize: 15.5,
                lineHeight: 1.45,
                textAlign: "left",
                cursor: answered ? "default" : "pointer",
                opacity,
                transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 auto",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background:
                    answered && isThisCorrect
                      ? "var(--fc-green)"
                      : answered && isThisPicked
                        ? "var(--fc-soft-warn)"
                        : "var(--fc-paper-warm)",
                  color:
                    answered && (isThisCorrect || isThisPicked)
                      ? "white"
                      : "var(--fc-ink-soft)",
                  fontFamily: "var(--fc-font-display)",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {answered && isThisCorrect && (
                <span style={{ fontSize: 18, color: "var(--fc-green-dark)" }} aria-hidden>
                  ✓
                </span>
              )}
              {answered && isThisPicked && !isThisCorrect && (
                <span style={{ fontSize: 18, color: "var(--fc-soft-warn)" }} aria-hidden>
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 左下角 Rex (固定在 tab-bar 上方,size sm) */}
      <div
        style={{
          position: "fixed",
          left: 12,
          bottom: 90, // 让出底部 tab nav 高度
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
export { PlayCard as PicMatchSentencePlayCard };
