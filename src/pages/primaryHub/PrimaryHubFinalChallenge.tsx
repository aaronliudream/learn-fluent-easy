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
  type LevelConfig,
} from "@/lib/primaryHub/finalChallenge/progress";

/** Phase 1：前 6 关对应 #71b 6 个题型，关 7–10 留作 Phase 3。 */
const LEVEL_CONFIGS: LevelConfig[] = [
  { id: 1, name: "看图选句", type: "picture_match_sentence" },
  { id: 2, name: "看图选词", type: "picture_match_word" },
  { id: 3, name: "听音辨词", type: "listen_and_choose_word" },
  { id: 4, name: "听句判断", type: "listen_and_judge_picture" },
  { id: 5, name: "找不同类词", type: "odd_one_out" },
  { id: 6, name: "阅读理解", type: "reading_judge_TF" },
  { id: 7, name: "敬请期待", type: null },
  { id: 8, name: "敬请期待", type: null },
  { id: 9, name: "敬请期待", type: null },
  { id: 10, name: "敬请期待", type: null },
];

const MAX_STARS = LEVEL_CONFIGS.filter((c) => c.type !== null).length * 3; // 18

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
