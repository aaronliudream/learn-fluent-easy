/**
 * 《英语闯关》关卡菜单 — Phase 1 PR #71c
 *
 * 顶部：标题 + 段位徽章 + 总星数；中部：10 关蜿蜒地图（LevelMap）。
 * 点关卡跳到 /primary/hub/:grade/final-challenge/level/:levelId。
 * 进度按用户隔离从 localStorage 读取（getStorageScope）。
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import LevelMap from "@/components/primaryHub/finalChallenge/LevelMap";
import RankBadge, { type RankTier } from "@/components/primaryHub/finalChallenge/RankBadge";
import {
  loadAllLevelProgress,
  computeLevelStates,
  getTotalStars,
  getRankTier,
} from "@/lib/primaryHub/finalChallenge/progress";
import { LEVEL_CONFIGS, MAX_STARS } from "@/lib/primaryHub/finalChallenge/levels";

const RANK_LABEL: Record<RankTier, string> = {
  bronze: "闯关学徒",
  silver: "闯关勇士",
  gold: "闯关高手",
  rainbow: "闯关大师",
};

export default function PrimaryHubFinalChallenge() {
  const { grade, userId } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;

  // 进度读一次：userId / grade 稳定就稳定。
  const progress = useMemo(
    () => loadAllLevelProgress(userId, grade),
    [userId, grade],
  );
  const levels = useMemo(() => computeLevelStates(LEVEL_CONFIGS, progress), [progress]);
  const totalStars = getTotalStars(progress, LEVEL_CONFIGS);
  const tier = getRankTier(totalStars);

  // 全 6 关都拿到至少 1 星 → 通关大成就 (头部升级为庆祝 banner)
  const playableLevels = LEVEL_CONFIGS.filter((c) => c.type !== null);
  const allCleared = playableLevels.every((c) => (progress[c.id]?.stars ?? 0) > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 80px",
        background: "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      {/* 顶部总览 — 通关后切换为庆祝 banner */}
      {allCleared ? (
        <header
          className="fc-spring-in"
          style={{
            textAlign: "center",
            marginBottom: 20,
            padding: "20px 16px",
            borderRadius: "var(--fc-radius-xl)",
            background:
              "linear-gradient(135deg, var(--fc-primary-bg) 0%, var(--fc-purple-bg) 60%, var(--fc-green-bg) 100%)",
            border: "2px solid var(--fc-primary)",
            boxShadow: "var(--fc-shadow-card)",
          }}
        >
          <div className="fc-medal-unlock" style={{ display: "inline-block" }}>
            <RankBadge tier={tier} size="lg" unlock />
          </div>
          <h1
            style={{
              marginTop: 12,
              fontSize: 22,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            🎉 全 6 关通关!{RANK_LABEL[tier]}
          </h1>
          <div
            style={{
              fontSize: 14,
              color: "var(--fc-ink-soft)",
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            总星{" "}
            <span style={{ fontWeight: 800, color: "var(--fc-primary)" }}>
              {totalStars}
            </span>{" "}
            / {MAX_STARS}
          </div>

          {/* 6 关战绩 mini-matrix */}
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {playableLevels.map((cfg) => {
              const stars = progress[cfg.id]?.stars ?? 0;
              return (
                <div
                  key={cfg.id}
                  style={{
                    padding: "8px 6px",
                    borderRadius: "var(--fc-radius-sm)",
                    background: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid var(--fc-border-soft)",
                    fontSize: 11,
                    color: "var(--fc-ink-soft)",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--fc-ink)" }}>
                    关 {cfg.id}
                  </div>
                  <div style={{ fontSize: 10, marginBottom: 2 }}>{cfg.name}</div>
                  <div style={{ fontSize: 13, color: "#FFC93C", lineHeight: 1 }}>
                    {"★".repeat(stars)}
                    <span style={{ color: "#D6CFC2" }}>
                      {"★".repeat(3 - stars)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 紫色强化训练 CTA — Phase 2 已接 AI (PR #72a)。仅四年级:AI 强化目前只支持四年级。 */}
          {[3, 4, 5].includes(grade) && (
            <button
              type="button"
              onClick={() => navigate(`${base}/final-challenge/strengthen`)}
              className="fc-btn-press fc-shadow-purple"
              style={{
                marginTop: 16,
                padding: "12px 24px",
                borderRadius: "var(--fc-radius-pill)",
                background: "var(--fc-purple)",
                color: "white",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--fc-font-display)",
              }}
            >
              🎯 来一波强化训练
            </button>
          )}
        </header>
      ) : (
        <header style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fc-ink)", marginBottom: 14 }}>
            《英语闯关》四年级最终关
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <RankBadge tier={tier} size="md" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--fc-ink)" }}>
                {RANK_LABEL[tier]}
              </div>
              <div style={{ fontSize: 13, color: "var(--fc-ink-soft)", marginTop: 2 }}>
                ⭐ 总星{" "}
                <span style={{ fontWeight: 800, color: "var(--fc-primary)" }}>
                  {totalStars}
                </span>{" "}
                / {MAX_STARS}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 关卡地图 */}
      <LevelMap
        levels={levels}
        onLevelClick={(id) =>
          navigate(`${base}/final-challenge/level/${id}`)
        }
      />
    </div>
  );
}
