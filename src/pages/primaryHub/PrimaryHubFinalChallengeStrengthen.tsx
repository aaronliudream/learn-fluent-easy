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
import { getQuestionsByType } from "@/lib/primaryHub/finalChallenge/questionBank";

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

// 垫场题用的题型(都无需配图、strengthen 里渲染干净):听音辨词 / 找不同 / 听句判图
const SEED_WARMUP_TYPES = [
  "listen_and_choose_word",
  "odd_one_out",
  "listen_and_judge_picture",
] as const;

/** 从本地大题库挑 n 道"垫场热身题"(0 生成等待),跨题型、按当前年级+册别随机。
 *  作用:孩子先做这几道,后台 AI 针对题趁机生成完,接上时几乎无等待。 */
function pickSeedWarmupQuestions(grade: number, n: number): FCQuestion[] {
  const vol = (sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2") as "v1" | "v2";
  const picked: FCQuestion[] = [];
  const usedIds = new Set<string>();
  for (let i = 0; picked.length < n && i < SEED_WARMUP_TYPES.length * 4; i++) {
    const type = SEED_WARMUP_TYPES[i % SEED_WARMUP_TYPES.length];
    const pool = getQuestionsByType(type, 99, vol, grade);
    if (!pool || pool.length === 0) continue;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const q = shuffled.find((x) => !usedIds.has(x.id));
    if (!q) continue;
    usedIds.add(q.id);
    picked.push({ ...q, id: `seed_warmup_${q.id}` } as FCQuestion);
  }
  return picked;
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
  // 进度条/isLast 用的预期总题数;先乐观按 5(1 热身 + 4 针对),AI 回来后settle 成实际数。
  const [expectedTotal, setExpectedTotal] = useState(5);
  // 后台生成失败但种子题在玩 → 轻提示,不打断。
  const [bgError, setBgError] = useState<string | null>(null);
  // AI 生成是否已"落定"(成功/失败/超时都算)。用于:孩子答得比 AI 出题快、停在
  // 还没到的题位时,若生成已落定且不会再有题,就直接收尾,绝不永久卡在"马上来下一题"。
  const [settled, setSettled] = useState(false);
  // 用 nonce 触发"再来一轮" — 把 effect 重跑
  const [reloadNonce, setReloadNonce] = useState(0);

  // 拉题:第一题用现成种子题秒出,4 道针对题后台生成、回来追加(消除 Gemini 等待)
  useEffect(() => {
    let cancelled = false;
    setError(null);
    setBgError(null);
    setSettled(false);

    // 没登录:强化训练需要账号(错题/出题按用户),直接提示,不卡死。
    if (!userId) {
      setError({ kind: "ai_failed", message: "请先登录后再使用强化训练。" });
      setPhase("error");
      return;
    }

    const TOTAL = 8; // 每轮强化训练目标总题数

    // 1) 立刻放 3 道本地垫场题(跨题型、秒出),马上进入 playing(0 等待)
    const seedQs = pickSeedWarmupQuestions(grade, 3);
    setQuestions(seedQs);
    setExpectedTotal(TOTAL);
    setPhase(seedQs.length > 0 ? "playing" : "loading");

    // 2) 后台生成针对性 AI 题补足到 8 道(多取 1 道做缓冲,合并时截到 8)
    (async () => {
      const aiCount = Math.max(1, TOTAL - seedQs.length + 1);
      const result: StrengthenResult | StrengthenError | "timeout" =
        await Promise.race([
          fetchStrengthenQuestions(userId, grade, aiCount),
          new Promise<"timeout">((r) => setTimeout(() => r("timeout"), 45000)),
        ]);
      if (cancelled) return;
      // 走到这里 = 生成已落定(成功/失败/超时),之后不会再有新题进来。
      setSettled(true);
      if (result === "timeout") {
        if (seedQs.length > 0) {
          setBgError("AI 出题有点慢,先做这几道,做完可以再点一次「强化训练」。");
          setExpectedTotal(seedQs.length);
        } else {
          setError({ kind: "ai_failed", message: "AI 出题超时了,请稍后重试。" });
          setPhase("error");
        }
        return;
      }
      if (!result.ok) {
        if (seedQs.length > 0) {
          setBgError(result.message);
          setExpectedTotal(seedQs.length);
        } else {
          setError({ kind: result.kind, message: result.message });
          setPhase("error");
        }
        return;
      }
      // 追加 AI 题到垫场题后面;按 audio/id 去重,合并后截到 TOTAL 道
      const base = seedQs;
      const seen = new Set(base.map((q) => ("audio" in q ? q.audio : q.id)));
      const fresh = result.questions.filter(
        (q) => !seen.has("audio" in q ? q.audio : q.id),
      );
      const next = [...base, ...fresh].slice(0, TOTAL);
      setQuestions(next);
      setExpectedTotal(next.length);
      if (seedQs.length === 0) setPhase("playing");
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
      if (!q) {
        // 生成已落定却还没题 → 不会再有了,直接收尾到 done,绝不永久卡住。
        if (settled) return <FinishWhenNoMore api={api} />;
        // 后台题还没到(用户答得快):给轻量 loading 兜底,不白屏;到了自动渲染。
        return (
          <div style={{ padding: 48, textAlign: "center", color: "var(--fc-ink-soft)" }}>
            <div
              className="fc-pulse-glow-purple"
              style={{
                margin: "0 auto 14px",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "var(--fc-purple)",
              }}
              aria-label="loading"
            />
            马上来下一题…
          </div>
        );
      }
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
    [questions, grade, settled],
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
        total={expectedTotal}             // 预期总数(种子题秒出时 questions 只有 1,用 expectedTotal 让进度/收尾正确)
        onBeforeStart={unlockAudioSync}   // iOS 音频解锁: 给 sharedAudio 一个 gesture-triggered play(), 保证混合题型里第一道是听力时也能响 (backlog #2 follow-up audit)
        renderPlay={renderPlay}
      />
      {/* 后台生成失败但种子题在玩:顶部轻提示,不打断当前题 */}
      {bgError && (
        <div
          style={{
            position: "fixed",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            background: "var(--fc-soft-warn)",
            color: "white",
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "var(--fc-shadow-card)",
          }}
        >
          后续题加载失败,做完可「再来一轮」
        </div>
      )}
      {/* "再来一轮"由 LevelShell 的 done 屏不直接管, 这里全局监听 done 进入后插一个按钮的
        做法会很笨;改用更简单的方式: 在 done 屏返回按钮旁边由用户走"返回地图 → 再次进入 strengthen"
        循环, 已足够 MVP. */}
    </>
  );
}

/**
 * 生成已落定但当前题位没有题(孩子答得比 AI 快、AI 又没出/超时/失败)。
 * 此时再没有新题会进来,挂载即收尾到 done —— 避免永久卡在"马上来下一题"。
 * (此分支仅在 settled 时渲染,所以 expectedTotal 已 settle 成实际题数,
 *  api.advance() 命中 isLast → 进入 done。)
 */
function FinishWhenNoMore({ api }: { api: LevelShellPlayApi }) {
  useEffect(() => {
    api.advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--fc-ink-soft)" }}>
      本轮就到这儿啦,正在收尾…
    </div>
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
