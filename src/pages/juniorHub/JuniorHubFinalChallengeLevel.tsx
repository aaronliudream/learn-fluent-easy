/**
 * 初中《期中/期末综合挑战》关卡分发器 — Fork 自
 * pages/primaryHub/PrimaryHubFinalChallengeLevel。
 *
 * 路由 /junior/hub/:grade/final-challenge/level/:levelId 命中此页:
 *   - 按当前册别(sessionStorage fc:jr:volume)用 findLevelConfig 查关卡 config
 *   - config.type → LEVEL_COMPONENT_MAP 找 junior 题型渲染器
 *   - 把 cfg.id / cfg.name 注入渲染器 props(junior 关号随册别不同,不能写死在渲染器里)
 */

import { Suspense, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { findLevelConfig } from "@/lib/juniorHub/finalChallenge/levels";
import { readJuniorVolume } from "@/lib/juniorHub/finalChallenge/progress";
import type { FinalChallengeQuestionType } from "@/lib/primaryHub/finalChallenge/types";

const JuniorFillInChooseLevel = lazy(
  () => import("@/components/juniorHub/finalChallenge/levels/JuniorFillInChooseLevel"),
);
const JuniorDialogueResponseLevel = lazy(
  () => import("@/components/juniorHub/finalChallenge/levels/JuniorDialogueResponseLevel"),
);
const JuniorReadingJudgeLevel = lazy(
  () => import("@/components/juniorHub/finalChallenge/levels/JuniorReadingJudgeLevel"),
);
const JuniorListenChooseWordLevel = lazy(
  () => import("@/components/juniorHub/finalChallenge/levels/JuniorListenChooseWordLevel"),
);
const JuniorSentenceOrderingLevel = lazy(
  () => import("@/components/juniorHub/finalChallenge/levels/JuniorSentenceOrderingLevel"),
);
const JuniorSentenceTransformLevel = lazy(
  () => import("@/components/juniorHub/finalChallenge/levels/JuniorSentenceTransformLevel"),
);

/** 题型 → junior 渲染器。渲染器都接受 {levelId?, levelName?},由本页注入真实关号/关名。 */
const LEVEL_COMPONENT_MAP: Partial<
  Record<FinalChallengeQuestionType, React.ComponentType<{ levelId?: number; levelName?: string }>>
> = {
  fill_in_choose: JuniorFillInChooseLevel,
  dialogue_response: JuniorDialogueResponseLevel,
  reading_judge_TF: JuniorReadingJudgeLevel,
  listen_and_choose_word: JuniorListenChooseWordLevel,
  sentence_ordering: JuniorSentenceOrderingLevel,
  sentence_transform: JuniorSentenceTransformLevel,
};

export default function JuniorHubFinalChallengeLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const { grade } = useJuniorHub();
  const vol = readJuniorVolume();
  const id = Number(levelId);
  const cfg = Number.isFinite(id) ? findLevelConfig(id, grade, vol) : null;

  if (!cfg) return <PlaceholderPage title="关卡未找到" />;
  if (cfg.type === null) {
    return <PlaceholderPage title={`关 ${cfg.id}:${cfg.name}`} subtitle="敬请期待…" />;
  }

  const Component = LEVEL_COMPONENT_MAP[cfg.type as FinalChallengeQuestionType];
  if (!Component) {
    return <PlaceholderPage title={`关 ${cfg.id}:${cfg.name}`} subtitle="开发中…" />;
  }

  return (
    <Suspense fallback={<PlaceholderPage title={cfg.name} subtitle="加载中…" />}>
      <Component levelId={cfg.id} levelName={cfg.name} />
    </Suspense>
  );
}

function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  const { grade } = useJuniorHub();
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 80px",
        background: "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/junior/hub/${grade}/final-challenge`)}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--fc-ink-soft)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
        }}
      >
        ← 返回关卡地图
      </button>
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fc-ink)" }}>{title}</h1>
        {subtitle && (
          <p style={{ marginTop: 16, color: "var(--fc-ink-soft)", fontSize: 14 }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
