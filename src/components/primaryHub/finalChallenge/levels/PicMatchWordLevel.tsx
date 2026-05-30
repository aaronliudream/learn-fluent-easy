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
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { speakKid } from "@/lib/speak";
import LevelShell, {
  type LevelShellPlayApi,
} from "@/components/primaryHub/finalChallenge/LevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "picture_match_word" }>;

export default function PicMatchWordLevel() {
  const { grade } = usePrimaryHub();
  // 读不到 → 默认 v2，安全。
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("picture_match_word", 5, vol),
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
      levelId={2}
      levelName="看图选词"
      introHint="看一看图,从 3 个单词里选出对应的那个。"
      introMood="encouraging"
      total={questions.length}
      renderPlay={(api) => <PlayCard q={questions[api.idx]} api={api} grade={grade} />}
    />
  );
}

function PlayCard({ q, api, grade }: { q: Q; api: LevelShellPlayApi; grade: number }) {
  const { answered, picked, pick } = api;
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

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
    ? "看图选单词"
    : isCorrect
      ? "✨ Nice!"
      : "差一点点！";

  return (
    <div>
      {/* 题干指令:本题型是「听词/读词 → 选图」,故文案覆盖为听词选图 */}
      <p
        style={{
          textAlign: "center",
          fontSize: 14,
          color: "var(--fc-ink-soft)",
          marginBottom: 8,
        }}
      >
        听一听,选出对应的图片
      </p>

      {/* 题干:显示要找的英文单词 + 朗读 (替代 emoji,避免题干图与选项图撞脸);答对时撒星 */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "16px 0 24px",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: "var(--fc-ink)",
            letterSpacing: 0.5,
          }}
        >
          {q.options[q.answer]}
        </div>
        <button
          type="button"
          onClick={() => void speakKid(q.options[q.answer], { grade })}
          className="fc-btn-press"
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
            borderRadius: 999,
            border: "none",
            background: "var(--fc-primary)",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔊 听一听
        </button>
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

              {/* 选项图;无图或加载失败回退单词文字 */}
              {q.optionImages?.[i] ? (
                <img
                  src={q.optionImages[i]}
                  alt={opt}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "contain",
                    pointerEvents: "none",
                  }}
                  onError={(e) => {
                    // 图加载失败 → 回退文字
                    const el = e.currentTarget;
                    const s = document.createElement("span");
                    s.textContent = opt;
                    s.style.fontFamily = "var(--fc-font-body)";
                    s.style.fontWeight = "800";
                    s.style.fontSize = opt.length > 11 ? "16px" : opt.length > 8 ? "18px" : "22px";
                    s.style.textAlign = "center";
                    s.style.wordBreak = "break-word";
                    el.replaceWith(s);
                  }}
                />
              ) : (
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
              )}

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

/** 暴露给 strengthen 训练页 (#72a) — 行为零改, 仅可见性扩散。 */
export { PlayCard as PicMatchWordPlayCard };
