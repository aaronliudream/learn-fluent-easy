/**
 * 初中《期中/期末闯关》关卡通用三段式骨架 —— Fork 自
 * `components/primaryHub/finalChallenge/LevelShell.tsx`。
 *
 * 与小学版差异(去掉小学专属、改 junior 接线):
 *   - usePrimaryHub → useJuniorHub;返回地图跳 /junior/hub/:grade/final-challenge
 *   - 进度/错题复用 primary 的按 grade 键存储(junior 传 grade=7/8/9,与小学 g3-6 天然隔离);
 *     junior context 无 userId → 传 null(localStorage 访客作用域,Phase 1 足够)
 *   - 删除:setResume/clearResume(小学「继续闯关」FAB 专属)、strengthen CTA、
 *     "下一关"按钮(初中关卡导航由菜单页驱动)
 *   - 其余(intro/play/done、pick、advance、星数、错题回顾)保持一致
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { saveLevelProgress } from "@/lib/primaryHub/finalChallenge/progress";
import { recordMistake } from "@/lib/primaryHub/finalChallenge/mistakes";
import { fcProgressGrade, readJuniorVolume } from "@/lib/juniorHub/finalChallenge/progress";
import type { FinalChallengeQuestionType } from "@/lib/primaryHub/finalChallenge/types";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";

export type LevelPhase = "intro" | "play" | "done";

/** 答错时由各关卡传给 shell 的题目信息(done 屏列表 + 错题入库)。 */
export interface LevelShellWrongInfo {
  questionId: string;
  questionType: FinalChallengeQuestionType;
  stem: string;
  userText: string;
  correctText: string;
  vocab_domain: string[];
  grammar_point: string[];
}

/** play 渲染器从 shell 拿到的 API(与小学版同形,junior 渲染器复用)。 */
export interface LevelShellPlayApi {
  idx: number;
  total: number;
  answered: boolean;
  picked: number | null;
  pick: (
    optIdx: number,
    isCorrect: boolean,
    wrongInfo?: LevelShellWrongInfo,
  ) => void;
  advance: () => void;
}

export interface LevelShellProps {
  levelId: number;
  levelName: string;
  introHint?: string;
  introMood?: "encouraging" | "happy" | "excited";
  total: number;
  computeStars?: (correct: number, total: number) => number;
  onBeforeStart?: () => void | Promise<void>;
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

export default function JuniorLevelShell({
  levelId,
  levelName,
  introHint = "准备好了吗?",
  introMood = "encouraging",
  total,
  computeStars = DEFAULT_STARS,
  onBeforeStart,
  renderPlay,
}: LevelShellProps) {
  const { grade } = useJuniorHub();
  const navigate = useNavigate();
  // 路由/显示用真实 grade;进度与错题用「册别编码 grade」,让期中(v1)/期末(v2)
  // 在同一年级下各存各的星,不串号(见 lib/juniorHub/finalChallenge/progress.ts)。
  const progressGrade = fcProgressGrade(grade, readJuniorVolume());
  const backToMap = () => navigate(`/junior/hub/${grade}/final-challenge`);

  const [phase, setPhase] = useState<LevelPhase>("intro");
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongList, setWrongList] = useState<LevelShellWrongInfo[]>([]);
  const playRef = useRef<HTMLDivElement>(null);

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
      if (answered) return;
      setAnswered(true);
      setPicked(optIdx);
      if (isCorrect) {
        setCorrectCount((c) => c + 1);
      } else if (wrongInfo) {
        recordMistake(null, progressGrade, {
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
        setWrongList((prev) => [...prev, wrongInfo]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answered, progressGrade, levelId],
  );

  useEffect(() => {
    if (phase !== "done") return;
    const stars = computeStars(correctCount, total);
    saveLevelProgress(null, progressGrade, {
      levelId,
      stars,
      attempts: 1,
      bestScore: total > 0 ? correctCount / total : 0,
      lastAttemptAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    playRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [idx, phase]);

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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--fc-ink)", marginTop: 4 }}>
            关 {levelId}:{levelName}
          </h1>
          <p style={{ fontSize: 15, color: "var(--fc-ink-soft)", textAlign: "center" }}>
            {introHint}
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                onBeforeStart?.();
              } catch (e) {
                console.warn("[JuniorLevelShell] onBeforeStart failed:", e);
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
          <p style={{ marginTop: 8, fontSize: 16, color: "var(--fc-ink-soft)" }}>
            答对{" "}
            <span style={{ fontWeight: 800, color: "var(--fc-primary)" }}>{correctCount}</span>{" "}
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
                  filter: i < stars ? "drop-shadow(0 2px 4px rgba(255, 201, 60, 0.6))" : "none",
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
                <div key={i} style={{ fontSize: 13, lineHeight: 1.5, color: "var(--fc-ink-soft)" }}>
                  <div style={{ color: "var(--fc-ink)", fontWeight: 600, marginBottom: 2 }}>
                    {i + 1}. {w.stem}
                  </div>
                  <div style={{ fontSize: 12 }}>
                    你选了:{" "}
                    <span style={{ color: "var(--fc-soft-warn)", fontWeight: 600 }}>{w.userText}</span>{" "}
                    · 正确:{" "}
                    <span style={{ color: "var(--fc-green-dark)", fontWeight: 600 }}>{w.correctText}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={backToMap}
          className="fc-btn-press fc-shadow-orange"
          style={{
            marginTop: wrongList.length > 0 ? 20 : 40,
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button
          type="button"
          onClick={backToMap}
          aria-label="返回关卡地图"
          style={{ ...backLinkStyle, margin: 0, fontSize: 18, lineHeight: 1 }}
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

      <div ref={playRef} style={{ scrollMarginTop: 64 }}>
        {renderPlay({ idx, total, answered, picked, pick, advance })}
      </div>

      {answered && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            type="button"
            onClick={advance}
            className="fc-btn-press"
            style={{
              padding: "12px 40px",
              borderRadius: "var(--fc-radius-pill)",
              background: "var(--fc-primary)",
              color: "white",
              fontWeight: 800,
              fontSize: 17,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            {isLast ? "完成 →" : "下一题 →"}
          </button>
        </div>
      )}
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
