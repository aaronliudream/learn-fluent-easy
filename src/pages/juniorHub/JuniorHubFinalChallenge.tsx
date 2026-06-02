/**
 * 初中《期中/期末综合挑战》关卡菜单 — Fork 自 pages/primaryHub/PrimaryHubFinalChallenge。
 *
 * 顶部:标题(按册别「期中/期末」)+ 段位徽章 + 总星;中部:关卡大卡片地图。
 * 点关卡跳 /junior/hub/:grade/final-challenge/level/:levelId。
 *
 * 与小学版差异:
 *   - useJuniorHub(无 userId → 进度传 null,localStorage 访客作用域)
 *   - 关卡配置/题库取 junior 版;进度按「册别编码 grade」隔离期中/期末(见 progress.ts)
 *   - 复用共享的 LevelCards / RankBadge / progress 计算 / 地图背景图(纯展示,不分学段)
 *   - 删除小学的「强化训练」CTA(初中暂不接 AI 强化)
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import LevelCards from "@/components/primaryHub/finalChallenge/LevelCards";
import RankBadge, { type RankTier } from "@/components/primaryHub/finalChallenge/RankBadge";
import {
  loadAllLevelProgress,
  computeLevelStates,
  getTotalStars,
  getRankTier,
} from "@/lib/primaryHub/finalChallenge/progress";
import { getLevelConfigs, iconForLevel } from "@/lib/juniorHub/finalChallenge/levels";
import {
  getQuestionTypeCounts,
  getQuestionsByType,
} from "@/lib/juniorHub/finalChallenge/questionBank";
import { fcProgressGrade, readJuniorVolume } from "@/lib/juniorHub/finalChallenge/progress";
import type { FinalChallengeQuestionType } from "@/lib/primaryHub/finalChallenge/types";
import levelMapBg from "@/assets/finalChallenge/level-map-bg.png";

const RANK_LABEL: Record<RankTier, string> = {
  bronze: "闯关学徒",
  silver: "闯关勇士",
  gold: "闯关高手",
  rainbow: "闯关大师",
};

/** 初中年级中文名(标题用);范围外回退数字。 */
const GRADE_CN: Record<number, string> = { 7: "七", 8: "八", 9: "九" };
const gradeLabel = (grade: number) => `${GRADE_CN[grade] ?? grade}年级`;

/** 关卡地图背景:底层插画 + 暖色 scrim(保证标题/卡片清晰)。 */
const MAP_BG: React.CSSProperties = {
  backgroundColor: "var(--fc-paper)",
  backgroundImage: `linear-gradient(180deg, rgba(255,248,231,0.74) 0%, rgba(255,239,201,0.82) 100%), url(${levelMapBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center top",
  backgroundRepeat: "no-repeat",
};

export default function JuniorHubFinalChallenge() {
  const { grade } = useJuniorHub();
  const navigate = useNavigate();
  const base = `/junior/hub/${grade}`;

  // 册别:入口卡进关前写入 sessionStorage,读不到默认 v1(期中)。
  const vol = readJuniorVolume();
  const volLabel = vol === "v2" ? "期末" : "期中";
  // 进度按「册别编码 grade」读,期中/期末互不串(见 progress.ts)。
  const progressGrade = fcProgressGrade(grade, vol);
  const progress = useMemo(
    () => loadAllLevelProgress(null, progressGrade),
    [progressGrade],
  );

  // 只保留「该册该题型有题」的可玩关(占位关 type===null 与无数据关一律不画)。
  const levelConfigs = useMemo(() => {
    const counts = getQuestionTypeCounts(vol, grade);
    return getLevelConfigs(grade, vol).filter((c) => {
      if (c.type === null) return false;
      const t = c.type as FinalChallengeQuestionType;
      if (c.vocabFilter) {
        return getQuestionsByType(t, 1, vol, grade, c.vocabFilter).length > 0;
      }
      return (counts[t] ?? 0) > 0;
    });
  }, [grade, vol]);

  const levels = useMemo(
    () =>
      computeLevelStates(levelConfigs, progress).map((ld, i) => ({
        ...ld,
        icon: iconForLevel(levelConfigs[i]),
      })),
    [levelConfigs, progress],
  );

  const totalStars = getTotalStars(progress, levelConfigs);
  const tier = getRankTier(totalStars);

  const playableLevels = levelConfigs.filter((c) => c.type !== null);
  const maxStars = playableLevels.length * 3;
  const allCleared =
    playableLevels.length > 0 &&
    playableLevels.every((c) => (progress[c.id]?.stars ?? 0) > 0);

  return (
    <div style={{ minHeight: "100vh", padding: "20px 16px 80px", ...MAP_BG }}>
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
            🎉 全 {playableLevels.length} 关通关!{RANK_LABEL[tier]}
          </h1>
          <div style={{ fontSize: 14, color: "var(--fc-ink-soft)", marginTop: 4, fontWeight: 600 }}>
            总星{" "}
            <span style={{ fontWeight: 800, color: "var(--fc-primary)" }}>{totalStars}</span>{" "}
            / {maxStars}
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
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
                  <div style={{ fontWeight: 700, color: "var(--fc-ink)" }}>关 {cfg.id}</div>
                  <div style={{ fontSize: 10, marginBottom: 2 }}>{cfg.name}</div>
                  <div style={{ fontSize: 13, color: "#FFC93C", lineHeight: 1 }}>
                    {"★".repeat(stars)}
                    <span style={{ color: "#D6CFC2" }}>{"★".repeat(3 - stars)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </header>
      ) : (
        <header style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fc-ink)", marginBottom: 14 }}>
            {gradeLabel(grade)}{volLabel}综合挑战
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <RankBadge tier={tier} size="md" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--fc-ink)" }}>{RANK_LABEL[tier]}</div>
              <div style={{ fontSize: 13, color: "var(--fc-ink-soft)", marginTop: 2 }}>
                ⭐ 总星{" "}
                <span style={{ fontWeight: 800, color: "var(--fc-primary)" }}>{totalStars}</span>{" "}
                / {maxStars}
              </div>
            </div>
          </div>
        </header>
      )}

      <LevelCards
        levels={levels}
        onLevelClick={(id) => navigate(`${base}/final-challenge/level/${id}`)}
      />
    </div>
  );
}
