/**
 * 关 4 — 听句判断 (listen_and_judge_picture)
 *
 * 与关 3「听音辨词」(#71f) 共用音频范式:
 *   - LevelShell + onBeforeStart 音频解锁 (Chrome autoplay policy)
 *   - speakKid + playTwice (读两遍, 中间停 300ms)
 *   - 每题展示 250ms 自动 playTwice; 点圆按钮 / 空格键重播
 *   - prefetchTTSBatchKid 进入时预热
 *   - fc-pulse-glow-blue 蓝色光圈 + 🔈/🔊 切换
 *
 * play 布局 (与关 3 不同):
 *   1. 大 emoji 居中 (图)
 *   2. 130px 蓝色播放按钮 (听句子)
 *   3. 2 个大 T/F 按钮 (横排各占一半)
 *      ✓ 相符 → 绿色系 (积极)
 *      ✗ 不相符 → 紫色系 (避免预先红色失败情绪)
 *
 * 答完后, "正确答案"高亮绿、"选错的"柔橙 (与关 1-3 反馈语义统一)。
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
import { getQuestionsByType } from "@/lib/primaryHub/finalChallenge/questionBank";
import LevelShell, {
  type LevelShellPlayApi,
} from "@/components/primaryHub/finalChallenge/LevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

type Q = Extract<FCQuestion, { type: "listen_and_judge_picture" }>;

// iOS 解锁:同步调 unlockAudioSync(在用户手势栈内给共享音频元素 play()+resume)。
// 不可用 async/await ctx.resume()/silent.play():iOS Safari 上可能不 resolve,
// 既卡住后续状态切换,又因脱离手势栈而解锁失效。
function unlockAudio(): void {
  unlockAudioSync();
}

export default function ListenJudgePictureLevel() {
  const { grade } = usePrimaryHub();
  // 读不到 → 默认 v2，安全。
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("listen_and_judge_picture", 5, vol),
    [vol],
  );

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
      levelId={4}
      levelName="听句判断"
      introHint="听一句话,看一看图,判断这句话和图是不是相符。"
      introMood="encouraging"
      total={questions.length}
      onBeforeStart={unlockAudio}
      renderPlay={(api) => (
        <PlayCard q={questions[api.idx]} api={api} grade={grade} />
      )}
    />
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
  const correctIdx = q.answer; // 0 = T (相符), 1 = F (不相符)
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

  const playWord = useCallback(
    (word: string): Promise<void> => {
      if (!word) return Promise.resolve();
      stopSpeaking();
      setSpeaking(true);
      return new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          setSpeaking(false);
          resolve();
        };
        speakKid(word, { grade })
          .then(done)
          .catch(() => {
            if (isWebSpeechSupported()) {
              void speakWebSpeech(word, 0.85);
            }
            done();
          });
        const safety = window.setTimeout(done, 3500); // 句子比单词长, 安全 timer 放宽
        timers.current.push(safety);
      });
    },
    [grade],
  );

  const playTwice = useCallback(
    async (word: string) => {
      await playWord(word);
      await new Promise<void>((r) => {
        const id = window.setTimeout(r, 300);
        timers.current.push(id);
      });
      await playWord(word);
    },
    [playWord],
  );

  // 每题展示 250ms 后自动 playTwice。
  useEffect(() => {
    const id = window.setTimeout(() => {
      void playTwice(q.audio);
    }, 250);
    timers.current.push(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, q.audio]);

  const wrongInfoFor = (picked: number) => ({
    questionId: q.id,
    questionType: q.type,
    stem: q.prompt + ` (听: "${q.audio}", 图: ${q.emoji})`,
    userText: q.options[picked],
    correctText: q.options[correctIdx],
    vocab_domain: q.vocab_domain,
    grammar_point: q.grammar_point,
  });

  // 1 = 相符, 2 = 不相符 (optionCount=2)。
  useMcKeyboard({
    optionCount: 2,
    answered,
    onPick: (i) =>
      pick(i, i === correctIdx, i === correctIdx ? undefined : wrongInfoFor(i)),
    enabled: true,
  });

  // 空格键重播。
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (answered) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))
        return;
      e.preventDefault();
      void playTwice(q.audio);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [q.audio, answered, playTwice]);

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered
    ? "图和句子,对得上吗?"
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

      {/* 大 emoji 图 */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "12px 0 4px",
        }}
      >
        {q.image ? (
          <img
            src={q.image}
            alt=""
            style={{
              display: "block",
              margin: "0 auto",
              width: 150,
              height: 150,
              objectFit: "contain",
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))",
            }}
            onError={(e) => {
              // 图加载失败 → 回退 emoji
              const el = e.currentTarget;
              const fb = document.createElement("span");
              fb.textContent = q.emoji ?? "";
              fb.style.fontSize = "96px";
              fb.style.lineHeight = "1";
              el.replaceWith(fb);
            }}
          />
        ) : (
          <span
            style={{
              display: "inline-block",
              fontSize: 96,
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
              style={{ position: "absolute", top: 4, left: "30%", fontSize: 22 }}
              aria-hidden
            >
              ✨
            </span>
            <span
              className="fc-celebrate-star"
              style={{
                position: "absolute",
                top: 8,
                right: "30%",
                fontSize: 26,
                animationDelay: "0.15s",
              }}
              aria-hidden
            >
              ⭐
            </span>
          </>
        )}
      </div>

      {/* 130px 蓝色播放按钮 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 0",
        }}
      >
        <button
          type="button"
          aria-label="播放句子,自动读两遍"
          onClick={() => {
            if (!speaking) void playTwice(q.audio);
          }}
          disabled={speaking}
          className={
            speaking ? "fc-pulse-glow-blue" : "fc-btn-press fc-shadow-blue"
          }
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            border: "5px solid white",
            background: "var(--fc-blue)",
            color: "white",
            fontSize: 56,
            lineHeight: 1,
            display: "grid",
            placeItems: "center",
            cursor: speaking ? "default" : "pointer",
            transition: "transform 200ms",
          }}
        >
          <span aria-hidden style={{ marginTop: -4 }}>
            {speaking ? "🔈" : "🔊"}
          </span>
        </button>
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "var(--fc-ink-mute)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          点圆圈再听一次 ·
          <kbd
            style={{
              padding: "2px 8px",
              borderRadius: 4,
              background: "var(--fc-paper-warm)",
              border: "1px solid var(--fc-border-medium)",
              fontFamily: "var(--fc-font-body)",
              fontSize: 11,
              color: "var(--fc-ink-soft)",
            }}
          >
            Space
          </kbd>{" "}
          也行
        </div>
      </div>

      {/* 反馈横条 */}
      {answered && (
        <div
          key={`${idx}-feedback`}
          className="fc-fade-in-up"
          style={{
            textAlign: "center",
            margin: "16px 0 12px",
            fontSize: 16,
            fontWeight: 800,
            color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)",
          }}
        >
          {isCorrect ? "✨ Nice! 答对啦" : "差一点点！正确答案已为你标出 ⬇"}
        </div>
      )}

      {/* 2 个 T/F 按钮 (50/50 横排) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: answered ? 0 : 18,
        }}
      >
        {q.options.map((label, i) => {
          const isT = i === 0;
          const isThisCorrect = i === correctIdx;
          const isThisPicked = picked === i;

          // —— 默认配色: T 绿色系 (积极),  F 紫色系 (避免红色失败情绪) ——
          let bg = isT ? "var(--fc-green-bg)" : "var(--fc-purple-bg)";
          let border = isT ? "var(--fc-green)" : "var(--fc-purple)";
          let textColor = isT ? "var(--fc-green-dark)" : "var(--fc-purple-dark)";
          let iconColor = isT ? "var(--fc-green)" : "var(--fc-purple)";
          let opacity = 1;
          let extraClass = "fc-btn-press";

          if (answered) {
            if (isThisCorrect) {
              // 正确答案: 不管选没选,统一更醒目的绿色
              bg = "var(--fc-green-bg)";
              border = "var(--fc-green)";
              textColor = "var(--fc-green-dark)";
              iconColor = "var(--fc-green)";
              if (isThisPicked) extraClass += " fc-pulse-correct";
            } else if (isThisPicked) {
              // 选错的: 柔橙覆盖
              bg = "rgba(255, 136, 85, 0.12)";
              border = "var(--fc-soft-warn)";
              textColor = "var(--fc-soft-warn)";
              iconColor = "var(--fc-soft-warn)";
            } else {
              // 既不是正确也不是选中的 (实际上 2 选 1 不会进这分支,保留兜底)
              opacity = 0.4;
            }
          }

          // 把 "T (相符)" / "F (不相符)" 拆出副标 (圆括号里的中文)
          const m = label.match(/^[A-Z]\s*\((.+)\)$/);
          const subtext = m ? m[1] : label;

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
                gap: 6,
                minHeight: 110,
                padding: "12px 8px",
                borderRadius: "var(--fc-radius)",
                background: bg,
                border: `2px solid ${border}`,
                color: textColor,
                cursor: answered ? "default" : "pointer",
                opacity,
                transition: "background 200ms, border-color 200ms, opacity 200ms",
              }}
            >
              {/* 大图标 (T 用 ✓, F 用 ✗) */}
              <span
                aria-hidden
                style={{
                  fontFamily: "var(--fc-font-display)",
                  fontWeight: 900,
                  fontSize: 44,
                  lineHeight: 1,
                  color: iconColor,
                  transition: "color 200ms",
                }}
              >
                {isT ? "✓" : "✗"}
              </span>
              <span
                style={{
                  fontFamily: "var(--fc-font-body)",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {subtext}
              </span>
              {/* 键盘提示 */}
              {!answered && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 8,
                    fontSize: 10,
                    color: "var(--fc-ink-mute)",
                    fontFamily: "var(--fc-font-body)",
                  }}
                  aria-hidden
                >
                  {i + 1}
                </span>
              )}
              {/* 该选项是否被识别为"被选" / "正确" */}
              {answered && isThisCorrect && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 8,
                    fontSize: 16,
                    color: "var(--fc-green-dark)",
                  }}
                  aria-hidden
                >
                  ✓ 答案
                </span>
              )}
              {answered && isThisPicked && !isThisCorrect && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 8,
                    fontSize: 14,
                    color: "var(--fc-soft-warn)",
                    fontWeight: 700,
                  }}
                  aria-hidden
                >
                  你选的
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 答完显示英文原文 + 再听(让孩子看到刚才听的是什么) */}
      {answered && (
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
          🔊 原文:{q.audio}
          <button
            type="button"
            onClick={() => void playWord(q.audio)}
            style={{
              marginLeft: 10,
              padding: "4px 12px",
              borderRadius: 999,
              border: "none",
              background: "var(--fc-primary)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
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

/** 暴露给 strengthen 训练页 (#72a) — 行为零改, 仅可见性扩散。 */
export { PlayCard as ListenJudgePicturePlayCard };
