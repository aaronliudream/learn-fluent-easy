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

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 80px",
        background: "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      {/* 顶部总览 */}
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
