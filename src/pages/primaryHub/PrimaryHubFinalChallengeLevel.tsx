/**
 * 《英语闯关》关卡分发器
 *
 * 路由 /primary/hub/:grade/final-challenge/level/:levelId 命中此页:
 *   - 用 LEVEL_CONFIGS (#71c 的单一真相源) 查到关卡 config
 *   - 用 config.type → LEVEL_COMPONENT_MAP 找到对应题型组件
 *   - 命中则懒加载具体组件; 未命中 (敬请期待 / 未实现) 则显示占位页
 *
 * 后续 #71e ~ #71i 各题型 PR 只往 LEVEL_COMPONENT_MAP 加一行 (lazy + entry)。
 */

import { Suspense, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findLevelConfig } from "@/lib/primaryHub/finalChallenge/levels";
import type { FinalChallengeQuestionType } from "@/lib/primaryHub/finalChallenge/types";

const PicMatchSentenceLevel = lazy(
  () =>
    import(
      "@/components/primaryHub/finalChallenge/levels/PicMatchSentenceLevel"
    ),
);
const PicMatchWordLevel = lazy(
  () =>
    import("@/components/primaryHub/finalChallenge/levels/PicMatchWordLevel"),
);

/**
 * 题型 → 具体关卡组件的映射。
 * Phase 1 已接入 picture_match_sentence (关 1) + picture_match_word (关 2);
 * 其余题型在 #71f~i 接入前 fallback 到占位。
 */
const LEVEL_COMPONENT_MAP: Partial<
  Record<FinalChallengeQuestionType, React.ComponentType>
> = {
  picture_match_sentence: PicMatchSentenceLevel,
  picture_match_word: PicMatchWordLevel,
};

export default function PrimaryHubFinalChallengeLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const id = Number(levelId);
  const cfg = Number.isFinite(id) ? findLevelConfig(id) : null;

  if (!cfg) return <PlaceholderPage title="关卡未找到" />;
  if (cfg.type === null) {
    return <PlaceholderPage title={`关 ${cfg.id}:${cfg.name}`} subtitle="敬请期待…" />;
  }

  const Component = LEVEL_COMPONENT_MAP[cfg.type as FinalChallengeQuestionType];
  if (!Component) {
    return (
      <PlaceholderPage title={`关 ${cfg.id}:${cfg.name}`} subtitle="开发中…" />
    );
  }

  return (
    <Suspense fallback={<PlaceholderPage title={cfg.name} subtitle="加载中…" />}>
      <Component />
    </Suspense>
  );
}

function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 80px",
        background:
          "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/primary/hub/${grade}/final-challenge`)}
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
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fc-ink)" }}>
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              marginTop: 16,
              color: "var(--fc-ink-soft)",
              fontSize: 14,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
