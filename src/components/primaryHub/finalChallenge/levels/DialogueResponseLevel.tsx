/**
 * 关 7 — 情景答语 (dialogue_response) — 仅六年级
 *
 * 以「听句选答」(ListenChooseAnswerLevel) 为模板:听 audio(问句) → 从 3 个
 * 答语里选最合适的回答。差异:
 *   - 答前只放音频、不显英文原文(和第3/4关一致,防"看着读答案")
 *   - 选错重选(A 方案):标红试错项、不锁不记错题,选对才 pick() 推进;
 *     答对后揭示英文原文 + 中文翻译
 *   - audio 是问句、options 是完整答语句子,选项竖排左对齐
 *   - 六年级每关抽 7 道 (getDrawCount)
 *
 * 音频解锁用同步 unlockAudioSync(iOS 安全),朗读走 speakKid。
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

type Q = Extract<FCQuestion, { type: "dialogue_response" }>;

// iOS 解锁:同步调 unlockAudioSync(在用户手势栈内给共享音频元素 play()+resume)。
function unlockAudio(): void {
  unlockAudioSync();
}

export default function DialogueResponseLevel() {
  const { grade } = usePrimaryHub();
  // 年级用路由年级(可靠,不再因 sessionStorage 缺失而误取四年级);
  // 册别 v1/v2 仅 sessionStorage 有(入口卡写入),读不到默认 v2。
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("dialogue_response", getDrawCount(grade), vol, grade),
    [vol, grade],
  );

  // 进入关卡时一次性预热所有题的 TTS 缓存。
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
      levelId={7}
      levelName="情景答语"
      introHint="听一句问话,从 3 个答语里选出最合适的回答。问句会自动读两遍,仔细听哦。"
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
  const correctIdx = q.answer;
  const isCorrect = answered && picked === correctIdx;

  const [speaking, setSpeaking] = useState(false);
  // 关7-A:选错不锁,记录本题已试错的选项(标红+禁用),只有选对才 pick() 锁定推进。
  const [wrongPicks, setWrongPicks] = useState<Set<number>>(new Set());
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      stopSpeaking();
    },
    [],
  );

  // 单次播放: speakKid Promise resolve = 播完,fallback 到 WebSpeech。
  const playWord = useCallback(
    (text: string): Promise<void> => {
      if (!text) return Promise.resolve();
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
        speakKid(text, { grade })
          .then(done)
          .catch(() => {
            if (isWebSpeechSupported()) {
              void speakWebSpeech(text, 0.85);
            }
            done();
          });
        // safety 仅防 loading 永久卡死,不应短到把正常(含 CDN 加载)的播放截断 → 6s。
        const safety = window.setTimeout(done, 6000);
        timers.current.push(safety);
      });
    },
    [grade],
  );

  // 读两遍:首遍完 → 300ms 停顿 → 二遍。
  const playTwice = useCallback(
    async (text: string) => {
      await playWord(text);
      await new Promise<void>((r) => {
        const id = window.setTimeout(r, 300);
        timers.current.push(id);
      });
      stopSpeaking(); // 掐掉第一遍任何残留(即使被 safety 提前 resolve),再播第二遍,防重叠
      await playWord(text);
    },
    [playWord],
  );

  // 每题展示后 250ms 自动 playTwice。
  useEffect(() => {
    const id = window.setTimeout(() => {
      void playTwice(q.audio);
    }, 250);
    timers.current.push(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, q.audio]);

  // 换题时清空「已试错」标记(A 方案:每题独立重选)。
  useEffect(() => {
    setWrongPicks(new Set());
  }, [idx]);

  // A 方案(选错重选):选对才 pick() 锁定并推进;选错只标红本项、不锁、不记错题,
  // 让孩子继续选到对为止(接受副作用:第7关星数恒满、不进错题回顾)。
  const handlePick = useCallback(
    (i: number) => {
      if (answered) return;
      if (i === correctIdx) {
        pick(i, true);
        return;
      }
      setWrongPicks((prev) => {
        if (prev.has(i)) return prev;
        const next = new Set(prev);
        next.add(i);
        return next;
      });
    },
    [answered, correctIdx, pick],
  );

  // 1-3 数字键选项。
  useMcKeyboard({
    optionCount: q.options.length,
    answered,
    onPick: handlePick,
    enabled: true,
  });

  // 空格键: 未答题时重播两遍。
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
    ? "听问句,选答语"
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
        听问句,选出最合适的回答。
      </p>

      {/* 大圆播放按钮 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 0 8px",
        }}
      >
        <button
          type="button"
          aria-label="播放问句,自动读两遍"
          onClick={() => {
            if (!speaking) void playTwice(q.audio);
          }}
          disabled={speaking}
          className={speaking ? "fc-pulse-glow-blue" : "fc-btn-press fc-shadow-blue"}
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
            marginTop: 12,
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
            margin: "20px 0 14px",
            fontSize: 16,
            fontWeight: 800,
            color: "var(--fc-green-dark)",
          }}
        >
          ✨ Nice! 答对啦
        </div>
      )}

      {/* 答语选项 (竖排,句子较长,左对齐) */}
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
          const isWrongTried = wrongPicks.has(i);

          let bg = "white";
          let border = "var(--fc-border-medium)";
          let textColor = "var(--fc-ink)";
          let letterBg = "var(--fc-paper-warm)";
          let letterColor = "var(--fc-ink-soft)";
          let opacity = 1;
          let extraClass = "fc-btn-press";

          if (answered && isThisCorrect) {
            // 选对后揭示正确项(绿色)。
            bg = "var(--fc-green-bg)";
            border = "var(--fc-green)";
            textColor = "var(--fc-green-dark)";
            letterBg = "var(--fc-green)";
            letterColor = "white";
            if (isThisPicked) extraClass += " fc-pulse-correct";
          } else if (isWrongTried) {
            // 已试错的选项:标红 + 禁用,但不揭示正确答案(A 方案:继续重选)。
            bg = "rgba(255, 136, 85, 0.12)";
            border = "var(--fc-soft-warn)";
            textColor = "var(--fc-soft-warn)";
            letterBg = "var(--fc-soft-warn)";
            letterColor = "white";
            opacity = answered ? 0.6 : 1;
          } else if (answered) {
            // 选对后,其余未试选项淡出。
            opacity = 0.5;
          }

          return (
            <button
              key={i}
              type="button"
              disabled={answered || isWrongTried}
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
                cursor: answered || isWrongTried ? "default" : "pointer",
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
                  fontSize: 17,
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
              {isWrongTried && (
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

      {/* 答完显示问句原文 + 再听 */}
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
          🔊 问句:{q.audio}
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
          {q.cn && (
            <div
              style={{
                marginTop: 8,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--fc-ink-soft)",
              }}
            >
              {q.cn}
            </div>
          )}
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
export { PlayCard as DialogueResponsePlayCard };
