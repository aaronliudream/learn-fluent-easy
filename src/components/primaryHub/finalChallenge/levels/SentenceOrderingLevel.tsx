/**
 * 关 10 — 连词成句·点击式 (sentence_ordering) — 仅六年级 · 最后一关
 *
 * 非选择题:数据是 tokens(乱序词块) / answer(正确顺序 string[]) / display(完整句)。
 * 交互(点击式,不用拖拽):
 *   - 下方:乱序 tokens 渲染成一排可点词块。
 *   - 上方:答题区,初始空。点下方词块 → 移到上方末尾;点上方词块 → 退回下方。
 *   - 「撤销」退回最后一个;全部词块就位后「检查」判定。
 * 判答:上方词块顺序数组逐位与 answer 全等(tokens/answer 已带好大小写+标点,直接字符串比,
 *   重复词块按位置比,不去标点/不改大小写)。
 * 判对:显示 display 完整句并用 TTS 朗读正音(同第 8 关选对朗读);判错:亮正确句 + 入错题。
 *
 * 抽题数 getDrawCount(grade)(六年级 7),年级用路由 usePrimaryHub().grade。
 * 不参与选项配额(没有 options,getQuestionsByType 的 applyAnswerQuota 对它是 no-op)。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Q = Extract<FCQuestion, { type: "sentence_ordering" }>;

// iOS 解锁:同步调 unlockAudioSync(用户手势栈内),让"选对后正音"那次 TTS 能出声。
function unlockAudio(): void {
  unlockAudioSync();
}

export default function SentenceOrderingLevel() {
  const { grade } = usePrimaryHub();
  // 年级用路由年级(可靠);册别 v1/v2 仅 sessionStorage 有(入口卡写入),读不到默认 v2。
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  const questions = useMemo(
    () => getQuestionsByType("sentence_ordering", getDrawCount(grade), vol, grade),
    [vol, grade],
  );

  // 进入关卡时预热完整句 TTS:选对后正音可立即出声。
  useEffect(() => {
    if (questions.length === 0) return;
    prefetchTTSBatchKid(
      questions.map((q) => q.display),
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
      levelId={10}
      levelName="连词成句"
      introHint="点一点下面的词块,按顺序排成一句通顺的话。排完点「检查」。"
      introMood="encouraging"
      total={questions.length}
      onBeforeStart={unlockAudio}
      // key 绑定到题目:换题时重挂,组句状态(placed)自动清空。
      renderPlay={(api) => (
        <PlayCard key={questions[api.idx].id} q={questions[api.idx]} api={api} grade={grade} />
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
  const { answered, pick } = api;
  // placed: tokens 下标按选择顺序排列;available = 未选的下标(保持 tokens 原序)。
  const [placed, setPlaced] = useState<number[]>([]);

  const [speaking, setSpeaking] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      stopSpeaking();
    },
    [],
  );

  const speakDisplay = useCallback(
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

  const builtTokens = placed.map((i) => q.tokens[i]);
  const isComplete = placed.length === q.tokens.length;
  // 逐位全等(answer 是 string[],词块字符串直接比;重复词块按位置自然区分)。
  const isRight =
    isComplete && q.answer.every((tok, i) => builtTokens[i] === tok);

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
    // SO 没有 optIdx,传 0 占位;判对/错与计分由 right 驱动。
    pick(0, right, wrongInfo);
    if (right) speakDisplay(q.display);
  };

  const rexMood = !answered ? "thinking" : isCorrect ? "excited" : "encouraging";
  const rexMessage = !answered
    ? "连词成句"
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
          marginBottom: 14,
        }}
      >
        🧩 点词块,按顺序排成一句话
      </p>

      {/* 上方:答题区(已选词块,可点退回) */}
      <div
        style={{
          minHeight: 64,
          margin: "0 auto",
          maxWidth: 460,
          padding: "12px 14px",
          background: "var(--fc-blue-bg, #eaf3ff)",
          borderRadius: "var(--fc-radius)",
          border: "2px solid var(--fc-blue)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        {placed.length === 0 ? (
          <span style={{ color: "var(--fc-ink-mute, #9a948a)", fontSize: 14 }}>
            点下面的词块,从这里开始组句…
          </span>
        ) : (
          placed.map((tokenIdx, pos) => (
            <button
              key={`${tokenIdx}-${pos}`}
              type="button"
              disabled={answered}
              onClick={() => removeAt(pos)}
              className={answered ? undefined : "fc-btn-press"}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `2px solid ${answered ? (isRight ? "var(--fc-green)" : "var(--fc-soft-warn)") : "var(--fc-blue)"}`,
                background: answered
                  ? isRight
                    ? "var(--fc-green-bg)"
                    : "rgba(255, 136, 85, 0.12)"
                  : "white",
                color: answered
                  ? isRight
                    ? "var(--fc-green-dark)"
                    : "var(--fc-soft-warn)"
                  : "var(--fc-ink)",
                fontFamily: "var(--fc-font-body)",
                fontWeight: 700,
                fontSize: 16,
                cursor: answered ? "default" : "pointer",
              }}
            >
              {q.tokens[tokenIdx]}
            </button>
          ))
        )}
      </div>

      {/* 控制区:撤销 + 检查 */}
      {!answered && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 14,
          }}
        >
          <button
            type="button"
            onClick={undo}
            disabled={placed.length === 0}
            className="fc-btn-press"
            style={{
              padding: "8px 18px",
              borderRadius: "var(--fc-radius-pill)",
              border: "2px solid var(--fc-border-medium)",
              background: "white",
              color: "var(--fc-ink-soft)",
              fontWeight: 700,
              fontSize: 14,
              cursor: placed.length === 0 ? "default" : "pointer",
              opacity: placed.length === 0 ? 0.5 : 1,
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
              padding: "8px 24px",
              borderRadius: "var(--fc-radius-pill)",
              border: "none",
              background: isComplete ? "var(--fc-green)" : "var(--fc-border-medium)",
              color: "white",
              fontWeight: 800,
              fontSize: 15,
              cursor: isComplete ? "pointer" : "default",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            ✓ 检查
          </button>
        </div>
      )}

      {/* 下方:可选词块池(未选的) */}
      <div
        style={{
          margin: "18px auto 0",
          maxWidth: 460,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
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
                padding: "10px 14px",
                borderRadius: 12,
                border: "2px solid var(--fc-border-medium)",
                background: used ? "var(--fc-paper-warm)" : "white",
                color: used ? "var(--fc-ink-mute, #b8b2a8)" : "var(--fc-ink)",
                fontFamily: "var(--fc-font-body)",
                fontWeight: 700,
                fontSize: 16,
                cursor: answered || used ? "default" : "pointer",
                opacity: used ? 0.45 : 1,
                transition: "opacity 150ms",
              }}
            >
              {tok}
            </button>
          );
        })}
      </div>

      {/* 反馈横条 */}
      {answered && (
        <div
          key={`${api.idx}-feedback`}
          className="fc-fade-in-up"
          style={{
            textAlign: "center",
            margin: "20px 0 12px",
            fontSize: 16,
            fontWeight: 800,
            color: isCorrect ? "var(--fc-green-dark)" : "var(--fc-soft-warn)",
          }}
        >
          {isCorrect ? "✨ Nice! 排对啦" : "差一点点！正确顺序在下面 ⬇"}
        </div>
      )}

      {/* 答完:显示完整正确句 + 朗读(判对自动朗读;判错也给正确句 + 可点再听) */}
      {answered && (
        <div
          style={{
            textAlign: "center",
            margin: "0 auto",
            maxWidth: 460,
            padding: "12px 16px",
            background: "var(--fc-surface-soft, #f5f5f5)",
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 700,
            color: "var(--fc-ink)",
          }}
        >
          🔊 {q.display}
          <button
            type="button"
            onClick={() => {
              if (!speaking) speakDisplay(q.display);
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
export { PlayCard as SentenceOrderingPlayCard };
