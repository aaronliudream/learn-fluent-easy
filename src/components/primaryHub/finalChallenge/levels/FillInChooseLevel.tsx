/**
 * 关 8 — 选词填空 (fill_in_choose) — 仅六年级
 *
 * 套路同第 7 关 dialogue_response,但是"读题填空"而非听力:
 *   - `prompt` 是含 `___` 的挖空句,屏上把 `___` 渲染成下划线空格
 *   - `options` 是候选词/词组,竖排左对齐(部分是短语)
 *   - 判答:选中下标 === answer(用全局已打散后的对象)
 *   - 朗读时机(正音):**只在选对之后**用 speakKid 朗读 `audio`(填好的完整句);
 *     选之前 / 选错都不朗读完整句,避免剧透答案。
 *   - 六年级每关抽 7 道 (getDrawCount)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import {
  speakKid,
  stopSpeaking,
  prefetchTTSBatchKid,
  unlockAudioSync,
} from "@/lib/speak";
import { isWebSpeechSupported, speakWebSpeech } from "@/lib/webSpeech";
import {
  getQuestionsByType,
  getDrawCount,
} from "@/lib/primaryHub/finalChallenge/questionBank";
import LevelShell, {
  type LevelShellPlayApi,
} from "@/components/primaryHub/finalChallenge/LevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "fill_in_choose" }>;

// iOS 解锁:同步调 unlockAudioSync(在用户手势栈内给共享音频元素 play()+resume),
// 让"选对后正音"那次 TTS 能正常出声 (Chrome/iOS autoplay policy)。
function unlockAudio(): void {
  unlockAudioSync();
}

export default function FillInChooseLevel() {
  const { grade } = usePrimaryHub();
  // 年级用路由年级(可靠,不再因 sessionStorage 缺失而误取四年级);
  // 册别 v1/v2 仅 sessionStorage 有(入口卡写入),读不到默认 v2。
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("fill_in_choose", getDrawCount(grade), vol, grade),
    [vol, grade],
  );

  // 进入关卡时预热完整句 TTS:选对后正音可立即出声,不现场卡顿。
  useEffect(() => {
    if (questions.length === 0) return;
    prefetchTTSBatchKid(
      questions.map((q) => q.audio),
      { grade },
    );
  }, [grade, questions]);

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
      levelId={8}
      levelName="选词填空"
      introHint="读一读句子,从 3 个词里选出填进空格(___)里最合适的那个。选对了会朗读完整句子。"
      introMood="encouraging"
      total={questions.length}
      onBeforeStart={unlockAudio}
      renderPlay={(api) => (
        <PlayCard q={questions[api.idx]} api={api} grade={grade} />
      )}
    />
  );
}

/** 把含 `___` 的句子渲染成"文字 + 下划线空格"交替的行内片段。 */
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

function PlayCard({
  q,
  api,
  grade,
}: {
  q: Q;
  api: LevelShellPlayApi;
  grade: number;
}) {
  const { answered, picked, pick, idx } = api;
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

  const [speaking, setSpeaking] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      stopSpeaking();
    },
    [],
  );

  // 朗读完整正确句(正音)。只在选对后调用。
  const speakAnswer = useCallback(
    (text: string) => {
      if (!text) return;
      stopSpeaking();
      setSpeaking(true);
      const done = () => setSpeaking(false);
      speakKid(text, { grade })
        .then(done)
        .catch(() => {
          if (isWebSpeechSupported()) void speakWebSpeech(text, 0.85);
          done();
        });
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

  // 选择:答对 → 提交并正音朗读;答错 → 提交并带 wrongInfo,不朗读完整句(不剧透)。
  const handlePick = useCallback(
    (i: number) => {
      if (answered) return;
      const correct = i === correctIdx;
      pick(i, correct, correct ? undefined : wrongInfoFor(i));
      if (correct) speakAnswer(q.audio);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answered, correctIdx, pick, q.audio, speakAnswer],
  );

  // 1-3 数字键选项。
  useMcKeyboard({
    optionCount: q.options.length,
    answered,
    onPick: handlePick,
    enabled: true,
  });

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered
    ? "选词填空"
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
          marginBottom: 16,
        }}
      >
        选词填空:把最合适的词填进空格。
      </p>

      {/* 挖空句(___ 渲染成下划线空格) */}
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
        <span aria-hidden style={{ marginRight: 6 }}>
          ✏️
        </span>
        <PromptWithBlanks prompt={q.prompt} />
      </div>

      {/* 反馈横条 */}
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

      {/* 候选词选项 (竖排,部分是短语,左对齐) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: answered ? 0 : 24,
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
              onClick={() => handlePick(i)}
              className={extraClass}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                minHeight: 56,
                padding: "14px 16px 14px 14px",
                borderRadius: "var(--fc-radius)",
                background: bg,
                border: `2px solid ${border}`,
                color: textColor,
                textAlign: "left",
                cursor: answered ? "default" : "pointer",
                opacity,
                transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              <span
                style={{
                  flex: "0 0 auto",
                  display: "grid",
                  placeItems: "center",
                  width: 24,
                  height: 24,
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
                  flex: 1,
                  fontFamily: "var(--fc-font-body)",
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                }}
              >
                {opt}
              </span>
              {answered && isThisCorrect && (
                <span
                  style={{ fontSize: 18, color: "var(--fc-green-dark)", lineHeight: 1, flex: "0 0 auto" }}
                  aria-hidden
                >
                  ✓
                </span>
              )}
              {answered && isThisPicked && !isThisCorrect && (
                <span
                  style={{ fontSize: 18, color: "var(--fc-soft-warn)", lineHeight: 1, flex: "0 0 auto" }}
                  aria-hidden
                >
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 选对后:显示完整正确句 + 再听(正音)。选错不显示完整句,避免剧透。 */}
      {answered && isCorrect && (
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            padding: "10px 16px",
            background: "var(--fc-surface-soft, #f5f5f5)",
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 700,
            color: "var(--fc-ink)",
          }}
        >
          🔊 {q.audio}
          <button
            type="button"
            onClick={() => {
              if (!speaking) speakAnswer(q.audio);
            }}
            disabled={speaking}
            style={{
              marginLeft: 10,
              padding: "4px 12px",
              borderRadius: 999,
              border: "none",
              background: "var(--fc-primary)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: speaking ? "default" : "pointer",
            }}
          >
            再听
          </button>
        </div>
      )}

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

/** 暴露给 strengthen 训练页 — 按 type 路由用(预留)。 */
export { PlayCard as FillInChoosePlayCard };
