/**
 * 《英语闯关》AI 强化训练 — Phase 2 PR #72a
 *
 * 三段式: loading → playing (LevelShell mode="strengthen") → done
 * 错误屏: rate_limited / no_mistakes / ai_failed / network
 *
 * 题目从 fc-strengthen-questions edge function 取 (Gemini 出题, 按错题
 * 标签命中弱项). 每道题按 q.type 路由到对应 PlayCard (5 个 PlayCard
 * 来自 PR #72a 的纯加法 export, 跳过 reading_judge_TF MVP 不出阅读题).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { unlockAudioSync, prefetchTTSBatchKid } from "@/lib/speak";
import LevelShell, {
  type LevelShellPlayApi,
} from "@/components/primaryHub/finalChallenge/LevelShell";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";
import {
  fetchStrengthenQuestions,
  type StrengthenResult,
  type StrengthenError,
} from "@/lib/primaryHub/finalChallenge/strengthen";
import type { FCQuestion } from "@/lib/primaryHub/finalChallenge/types";

// 5 个 PlayCard (按 type 路由, 排除 reading_judge_TF)
import { PicMatchSentencePlayCard } from "@/components/primaryHub/finalChallenge/levels/PicMatchSentenceLevel";
import { ListenChooseWordPlayCard } from "@/components/primaryHub/finalChallenge/levels/ListenChooseWordLevel";
import { ListenChooseAnswerPlayCard } from "@/components/primaryHub/finalChallenge/levels/ListenChooseAnswerLevel";
import { ListenJudgePicturePlayCard } from "@/components/primaryHub/finalChallenge/levels/ListenJudgePictureLevel";
import { OddOneOutPlayCard } from "@/components/primaryHub/finalChallenge/levels/OddOneOutLevel";

type Phase = "loading" | "playing" | "error";

interface ErrorState {
  kind: StrengthenError["kind"];
  message: string;
}

export default function PrimaryHubFinalChallengeStrengthen() {
  const { grade, userId } = usePrimaryHub();
  const navigate = useNavigate();
  const backToMap = useCallback(
    () => navigate(`/primary/hub/${grade}/final-challenge`),
    [navigate, grade],
  );

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<FCQuestion[]>([]);
  const [error, setError] = useState<ErrorState | null>(null);
  // 用 nonce 触发"再来一轮" — 把 effect 重跑
  const [reloadNonce, setReloadNonce] = useState(0);

  // 拉题
  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setError(null);
    setQuestions([]);

    (async () => {
      const result: StrengthenResult | StrengthenError =
        await fetchStrengthenQuestions(userId, grade, 5);
      if (cancelled) return;
      if (!result.ok) {
        setError({ kind: result.kind, message: result.message });
        setPhase("error");
        return;
      }
      setQuestions(result.questions);
      setPhase("playing");
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, grade, reloadNonce]);

  // 题目就绪后预热所有听力题的 TTS:strengthen 直接渲染 PlayCard,绕过了关卡组件的
  // 批量预热,导致每道 AI 新句子首次播放需现场生成(延迟/结巴)。这里提前 warm 缓存。
  useEffect(() => {
    if (questions.length === 0) return;
    const audios = questions
      .map((q) => ("audio" in q ? q.audio : undefined))
      .filter((a): a is string => typeof a === "string" && a.length > 0);
    if (audios.length > 0) prefetchTTSBatchKid(audios, { grade });
  }, [questions, grade]);

  // 按 type 路由到对应 PlayCard
  const renderPlay = useCallback(
    (api: LevelShellPlayApi) => {
      const q = questions[api.idx];
      if (!q) return null;
      switch (q.type) {
        case "picture_match_sentence":
          return <PicMatchSentencePlayCard q={q} api={api} />;
        case "listen_and_choose_word":
          return <ListenChooseWordPlayCard q={q} api={api} grade={grade} />;
        case "listen_and_choose_answer":
          return <ListenChooseAnswerPlayCard q={q} api={api} grade={grade} />;
        case "listen_and_judge_picture":
          return <ListenJudgePicturePlayCard q={q} api={api} grade={grade} />;
        case "odd_one_out":
          return <OddOneOutPlayCard q={q} api={api} />;
        // reading_judge_TF: MVP 不在 strengthen 出阅读题, 兜底友好渲染
        default:
          return (
            <div style={{ padding: 40, textAlign: "center", color: "var(--fc-ink-soft)" }}>
              这道题型暂不在强化训练支持范围,跳过。
            </div>
          );
      }
    },
    [questions, grade],
  );

  // ============ LOADING ============
  if (phase === "loading") {
    return (
      <ScreenShell>
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <RexMascot mood="thinking" size="lg" showMessage={false} />
          <h2
            style={{
              marginTop: 16,
              fontSize: 22,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            Rex 正在出题…
          </h2>
          <p
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "var(--fc-ink-soft)",
            }}
          >
            按你的错题考点定制 5 道针对性强化题
          </p>
          <div
            className="fc-pulse-glow-purple"
            style={{
              margin: "32px auto 0",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--fc-purple)",
            }}
            aria-label="loading"
          />
        </div>
      </ScreenShell>
    );
  }

  // ============ ERROR ============
  if (phase === "error" && error) {
    const retryable = error.kind !== "no_mistakes";
    return (
      <ScreenShell>
        <button type="button" onClick={backToMap} style={backLinkStyle}>
          ← 返回关卡地图
        </button>
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <RexMascot
            mood={error.kind === "no_mistakes" ? "thinking" : "encouraging"}
            size="lg"
            showMessage={false}
          />
          <h2
            style={{
              marginTop: 16,
              fontSize: 20,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            {error.kind === "no_mistakes" ? "先去答几道题" : "出了点小问题"}
          </h2>
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: "var(--fc-ink-soft)",
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            {error.message}
          </p>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {retryable && (
              <button
                type="button"
                onClick={() => setReloadNonce((n) => n + 1)}
                className="fc-btn-press fc-shadow-purple"
                style={ctaStyle("var(--fc-purple)")}
              >
                🔄 再试一次
              </button>
            )}
            <button
              type="button"
              onClick={backToMap}
              className="fc-btn-press fc-shadow-orange"
              style={ctaStyle("var(--fc-primary)")}
            >
              🗺️ 返回关卡地图
            </button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  // ============ PLAYING ============
  // LevelShell 渲染 intro/play/done 三段, 我们在 done 末尾再补一个"再来一轮"按钮.
  return (
    <>
      <LevelShell
        levelId={0}                       // strengthen mode 占位; 不写 progress
        mode="strengthen"
        levelName="AI 强化训练"
        introHint="Rex 按你的错题考点出了 5 道针对性强化题, 准备好了吗?"
        introMood="excited"
        total={questions.length}
        onBeforeStart={unlockAudioSync}   // iOS 音频解锁: 给 sharedAudio 一个 gesture-triggered play(), 保证混合题型里第一道是听力时也能响 (backlog #2 follow-up audit)
        renderPlay={renderPlay}
      />
      {/* "再来一轮"由 LevelShell 的 done 屏不直接管, 这里全局监听 done 进入后插一个按钮的
        做法会很笨;改用更简单的方式: 在 done 屏返回按钮旁边由用户走"返回地图 → 再次进入 strengthen"
        循环, 已足够 MVP. */}
    </>
  );
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 80px",
        background:
          "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      {children}
    </div>
  );
}

const backLinkStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--fc-ink-soft)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
};

function ctaStyle(bg: string): React.CSSProperties {
  return {
    padding: "12px 28px",
    borderRadius: "var(--fc-radius-pill)",
    background: bg,
    color: "white",
    fontWeight: 800,
    fontSize: 15,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--fc-font-display)",
  };
}
