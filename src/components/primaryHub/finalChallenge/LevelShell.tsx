/**
 * 《英语闯关》关卡通用三段式骨架
 *
 * 把"intro → play → done"这套范式集中管理:
 *   - 共享状态: phase / idx / answered / picked / correctCount
 *   - 共享时序: 选完后 1.5s 自动进入下一题 (useRef 定时器 + 卸载清理)
 *   - 共享 UX:  intro 屏 Rex(encouraging) + 「开始挑战」, done 屏 "完成 X / Y" + 「返回地图」
 *   - 共享落地: done 时按星数规则 saveLevelProgress
 *   - 共享导航: play 顶部「← 返回地图」(中途退出不损进度)
 *
 * 各题型 (#71d~h) 只负责实现"play 屏单题视觉"部分,通过 renderPlay
 * 拿到 { idx, total, answered, picked, pick(idx, isCorrect) }。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { saveLevelProgress } from "@/lib/primaryHub/finalChallenge/progress";
import { recordMistake } from "@/lib/primaryHub/finalChallenge/mistakes";
import type { FinalChallengeQuestionType } from "@/lib/primaryHub/finalChallenge/types";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";

export type LevelPhase = "intro" | "play" | "done";

/**
 * 答错时由各关卡传给 shell 的题目信息 (用于 done 屏列表 + 错题入库)。
 * 各关只在 isCorrect=false 时构造并传入。
 */
export interface LevelShellWrongInfo {
  questionId: string;
  questionType: FinalChallengeQuestionType;
  stem: string;
  userText: string;
  correctText: string;
  /** Phase 2 AI 出题标签 (从题目继承,非空)。 */
  vocab_domain: string[];
  grammar_point: string[];
}

/** play 渲染器从 shell 拿到的 API。 */
export interface LevelShellPlayApi {
  /** 当前题号 (0-based)。 */
  idx: number;
  /** 题目总数。 */
  total: number;
  /** 是否已选 (锁定 UI,等待 1.5s 后自动推进)。 */
  answered: boolean;
  /** 当前选中的选项 index (null = 尚未选)。 */
  picked: number | null;
  /**
   * 调用以提交一次选择。shell 处理对错计数 + 自动推进。
   * isCorrect 由题型自己判定 (单选用 optIdx===q.answer, T/F 用同理)。
   * 第三参 wrongInfo: isCorrect=false 时由各关构造传入,shell 用它做错题
   *   入库 + done 屏错题列表展示;isCorrect=true 时可不传。
   */
  pick: (
    optIdx: number,
    isCorrect: boolean,
    wrongInfo?: LevelShellWrongInfo,
  ) => void;
}

export interface LevelShellProps {
  levelId: number;
  /** 关卡名 (展示在 intro / done 屏顶部)。 */
  levelName: string;
  /** intro 屏副标题; 默认 "准备好了吗?"。 */
  introHint?: string;
  /** intro 屏 Rex 心情; 默认 encouraging。 */
  introMood?: "encouraging" | "happy" | "excited";
  /** 题目总数 (驱动进度条 + 星数计算)。 */
  total: number;
  /**
   * 星数规则。默认: 全对 3 / 80%+ 2 / 60%+ 1 / 其它 0。
   * #71j 之后可统一覆盖。
   */
  computeStars?: (correct: number, total: number) => number;
  /**
   * 可选: 用户点「开始挑战」时在用户手势链路内同步触发的钩子。
   * 用于音频解锁等需要 user gesture 的副作用 (Chrome autoplay policy)。
   * 若返回 Promise, shell 会 await 后才切到 play 阶段。
   */
  onBeforeStart?: () => void | Promise<void>;
  /** play 阶段视觉; 由具体题型实现。 */
  renderPlay: (api: LevelShellPlayApi) => React.ReactNode;
}

const DEFAULT_STARS = (correct: number, total: number) => {
  if (total <= 0) return 0;
  const pct = correct / total;
  if (pct >= 1) return 3;
  if (pct >= 0.8) return 2;
  if (pct >= 0.6) return 1;
  return 0;
};

/** 自动推进延时 (与 SpellingStage / ListenWordStage 节奏一致)。 */
const ADVANCE_MS = 1500;

export default function LevelShell({
  levelId,
  levelName,
  introHint = "准备好了吗?",
  introMood = "encouraging",
  total,
  computeStars = DEFAULT_STARS,
  onBeforeStart,
  renderPlay,
}: LevelShellProps) {
  const { grade, userId } = usePrimaryHub();
  const navigate = useNavigate();
  const backToMap = () => navigate(`/primary/hub/${grade}/final-challenge`);

  const [phase, setPhase] = useState<LevelPhase>("intro");
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  // 本场答错列表 (供 done 屏回顾;每条已同步落到 LS mistakes 入库)。
  const [wrongList, setWrongList] = useState<LevelShellWrongInfo[]>([]);

  // ---- 定时器管理 (与 ListenWordStage 同款) ----
  const timers = useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const isLast = idx >= total - 1;

  const advance = useCallback(() => {
    if (isLast) {
      setPhase("done");
    } else {
      setIdx((i) => i + 1);
      setAnswered(false);
      setPicked(null);
    }
  }, [isLast]);

  const pick = useCallback<LevelShellPlayApi["pick"]>(
    (optIdx, isCorrect, wrongInfo) => {
      if (answered) return; // 守门: 防止重复点击
      setAnswered(true);
      setPicked(optIdx);
      if (isCorrect) {
        setCorrectCount((c) => c + 1);
      } else if (wrongInfo) {
        // 1) 落地到 LS mistakes (Phase 2 AI 出题输入)
        recordMistake(userId, grade, {
          questionId: wrongInfo.questionId,
          questionType: wrongInfo.questionType,
          levelId,
          stem: wrongInfo.stem,
          userText: wrongInfo.userText,
          correctText: wrongInfo.correctText,
          vocab_domain: wrongInfo.vocab_domain,
          grammar_point: wrongInfo.grammar_point,
          attemptedAt: Date.now(),
        });
        // 2) 累加到本场 wrongList,done 屏供孩子/家长回顾
        setWrongList((prev) => [...prev, wrongInfo]);
      }
      after(ADVANCE_MS, advance);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answered, advance, userId, grade, levelId],
  );

  // ---- done 落地: 算星 + 写 LS (TODO: 错题入库由 #71j 统一做) ----
  useEffect(() => {
    if (phase !== "done") return;
    const stars = computeStars(correctCount, total);
    saveLevelProgress(userId, grade, {
      levelId,
      stars,
      attempts: 1, // TODO #71j: 累计 attempts (现有逻辑直接覆盖,简单起见 Phase 1)
      bestScore: total > 0 ? correctCount / total : 0,
      lastAttemptAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ============ INTRO ============
  if (phase === "intro") {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "20px 16px 80px",
          background:
            "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
        }}
      >
        <button type="button" onClick={backToMap} style={backLinkStyle}>
          ← 返回关卡地图
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            marginTop: 40,
          }}
        >
          <RexMascot mood={introMood} size="lg" showMessage={false} />
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--fc-ink)",
              marginTop: 4,
            }}
          >
            关 {levelId}:{levelName}
          </h1>
          <p style={{ fontSize: 15, color: "var(--fc-ink-soft)", textAlign: "center" }}>
            {introHint}
          </p>
          <button
            type="button"
            onClick={async () => {
              // 在用户手势链路内同步触发 (如音频解锁)。失败也继续 (永远不卡住孩子)。
              if (onBeforeStart) {
                try {
                  await onBeforeStart();
                } catch (e) {
                  console.warn("[LevelShell] onBeforeStart failed:", e);
                }
              }
              setPhase("play");
            }}
            className="fc-btn-press fc-shadow-orange"
            style={{
              marginTop: 16,
              padding: "14px 48px",
              borderRadius: "var(--fc-radius-pill)",
              background: "var(--fc-primary)",
              color: "white",
              fontWeight: 800,
              fontSize: 18,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            ▶️ 开始挑战
          </button>
        </div>
      </div>
    );
  }

  // ============ DONE ============
  if (phase === "done") {
    const stars = computeStars(correctCount, total);
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "20px 16px 80px",
          background:
            "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ alignSelf: "stretch" }}>
          <button type="button" onClick={backToMap} style={backLinkStyle}>
            ← 返回关卡地图
          </button>
        </div>
        <div className="fc-spring-in" style={{ marginTop: 40, textAlign: "center" }}>
          <RexMascot
            mood={stars >= 3 ? "celebrating" : stars >= 1 ? "happy" : "encouraging"}
            size="lg"
            showMessage={false}
          />
          <h1
            style={{
              marginTop: 16,
              fontSize: 28,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            {stars >= 3 ? "🏆 满分!" : stars >= 1 ? "🎉 完成!" : "继续努力!"}
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 16,
              color: "var(--fc-ink-soft)",
            }}
          >
            答对{" "}
            <span style={{ fontWeight: 800, color: "var(--fc-primary)" }}>
              {correctCount}
            </span>{" "}
            / {total} 题
          </p>
          <div style={{ marginTop: 16, fontSize: 32, lineHeight: 1 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={i < stars ? "fc-star-pop" : undefined}
                style={{
                  display: "inline-block",
                  color: i < stars ? "#FFC93C" : "#D6CFC2",
                  filter:
                    i < stars
                      ? "drop-shadow(0 2px 4px rgba(255, 201, 60, 0.6))"
                      : "none",
                  margin: "0 4px",
                  animationDelay: i < stars ? `${i * 0.2}s` : undefined,
                  opacity: i < stars ? 0 : 1,
                  animationFillMode: "forwards",
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        {/* 本关错题列表 (有错才显示) */}
        {wrongList.length > 0 && (
          <div
            style={{
              marginTop: 28,
              width: "100%",
              maxWidth: 420,
              padding: "14px 16px",
              borderRadius: "var(--fc-radius)",
              background: "rgba(255, 136, 85, 0.08)",
              border: "1.5px solid var(--fc-soft-warn)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--fc-soft-warn)",
                marginBottom: 10,
                letterSpacing: 0.4,
              }}
            >
              📝 本关错题回顾 ({wrongList.length} 道)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {wrongList.map((w, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--fc-ink-soft)",
                  }}
                >
                  <div
                    style={{
                      color: "var(--fc-ink)",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {i + 1}. {w.stem}
                  </div>
                  <div style={{ fontSize: 12 }}>
                    你选了:{" "}
                    <span style={{ color: "var(--fc-soft-warn)", fontWeight: 600 }}>
                      {w.userText}
                    </span>{" "}
                    · 正确:{" "}
                    <span style={{ color: "var(--fc-green-dark)", fontWeight: 600 }}>
                      {w.correctText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 紫色强化训练 CTA — Phase 1 占位,Phase 2 接 AI */}
        <button
          type="button"
          onClick={() => {
            alert("🎯 强化训练即将上线! AI 会根据你的错题出针对性新题。");
          }}
          className="fc-btn-press fc-shadow-purple"
          style={{
            marginTop: wrongList.length > 0 ? 20 : 40,
            padding: "13px 28px",
            borderRadius: "var(--fc-radius-pill)",
            background: "var(--fc-purple)",
            color: "white",
            fontWeight: 800,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--fc-font-display)",
          }}
        >
          🎯 来一波强化训练
        </button>

        <button
          type="button"
          onClick={backToMap}
          className="fc-btn-press fc-shadow-orange"
          style={{
            marginTop: 14,
            padding: "14px 48px",
            borderRadius: "var(--fc-radius-pill)",
            background: "var(--fc-primary)",
            color: "white",
            fontWeight: 800,
            fontSize: 18,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--fc-font-display)",
          }}
        >
          🗺️ 返回关卡地图
        </button>
      </div>
    );
  }

  // ============ PLAY ============
  const progressPct =
    total > 0 ? Math.min(100, ((idx + (answered ? 1 : 0)) / total) * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "16px 16px 80px",
        background:
          "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      {/* 顶部: 返回 + 进度条 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button
          type="button"
          onClick={backToMap}
          aria-label="返回关卡地图"
          style={{
            ...backLinkStyle,
            margin: 0,
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <div
          style={{
            flex: 1,
            height: 10,
            background: "rgba(42, 38, 32, 0.10)",
            borderRadius: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--fc-primary) 0%, var(--fc-yellow) 100%)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--fc-ink-soft)",
            minWidth: 38,
            textAlign: "right",
          }}
        >
          {idx + 1}/{total}
        </span>
      </div>

      {/* 题目视觉 (由题型实现) */}
      {renderPlay({ idx, total, answered, picked, pick })}
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
  marginBottom: 8,
  alignSelf: "flex-start",
};
