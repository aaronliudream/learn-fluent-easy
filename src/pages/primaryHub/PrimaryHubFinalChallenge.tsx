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
import LevelCards from "@/components/primaryHub/finalChallenge/LevelCards";
import RankBadge, { type RankTier } from "@/components/primaryHub/finalChallenge/RankBadge";
import {
  loadAllLevelProgress,
  computeLevelStates,
  getTotalStars,
  getRankTier,
} from "@/lib/primaryHub/finalChallenge/progress";
import { getLevelConfigs, iconForLevel } from "@/lib/primaryHub/finalChallenge/levels";
import {
  getQuestionTypeCounts,
  getQuestionsByType,
} from "@/lib/primaryHub/finalChallenge/questionBank";
import type { FinalChallengeQuestionType } from "@/lib/primaryHub/finalChallenge/types";
import levelMapBg from "@/assets/finalChallenge/level-map-bg.png";

const RANK_LABEL: Record<RankTier, string> = {
  bronze: "闯关学徒",
  silver: "闯关勇士",
  gold: "闯关高手",
  rainbow: "闯关大师",
};

/** 年级中文名（标题用）。映射范围外回退到数字,保证任何年级都不再写死"四年级"。 */
const GRADE_CN: Record<number, string> = { 3: "三", 4: "四", 5: "五", 6: "六" };
const gradeLabel = (grade: number) => `${GRADE_CN[grade] ?? grade}年级`;

/** 关卡地图整块的背景：底层 level-map-bg 插画 + 上层柔和暖色 scrim(保证标题/卡片清晰可读)。 */
const MAP_BG: React.CSSProperties = {
  backgroundColor: "var(--fc-paper)",
  backgroundImage: `linear-gradient(180deg, rgba(255,248,231,0.74) 0%, rgba(255,239,201,0.82) 100%), url(${levelMapBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center top",
  backgroundRepeat: "no-repeat",
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
  // 册别决定关卡配置（六下把听词拆比较级/过去式）。读不到 → v2,安全。
  const vol = sessionStorage.getItem("fc:volume") === "v1" ? "v1" : "v2";
  // 关卡配置按 (年级+册别) 取（六年级含第 7、8 关）。
  // 通用兜底：只保留"该册该题型有题"的可玩关；占位关 (type===null,敬请期待)
  // 与无数据的关一律不显示（大卡片菜单不再画空关）。
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

  // 全部可玩关都拿到至少 1 星 → 通关大成就 (头部升级为庆祝 banner)
  const playableLevels = levelConfigs.filter((c) => c.type !== null);
  // 星数上限按"实际有数据的可玩关"算（过滤空关后更准）。
  const maxStars = playableLevels.length * 3;
  const allCleared = playableLevels.every((c) => (progress[c.id]?.stars ?? 0) > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 80px",
        ...MAP_BG,
      }}
    >
      <button
        type="button"
        onClick={() => navigate(base)}
        aria-label="返回"
        className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 text-sm font-bold text-[#854F0B] shadow-sm backdrop-blur transition hover:bg-white"
      >
        ← 返回
      </button>
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
            🎉 全 {playableLevels.length} 关通关!{RANK_LABEL[tier]}
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
            / {maxStars}
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

          {/* 紫色强化训练 CTA — Phase 2 已接 AI (PR #72a)。 */}
          {[3, 4, 5, 6].includes(grade) && (
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
            《英语闯关》{gradeLabel(grade)}最终关
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
                / {maxStars}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 关卡入口 — 大卡片 */}
      <LevelCards
        levels={levels}
        onLevelClick={(id) =>
          navigate(`${base}/final-challenge/level/${id}`)
        }
      />
    </div>
  );
}
