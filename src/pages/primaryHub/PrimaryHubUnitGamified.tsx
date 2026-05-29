/**
 * 单元详情页 — 游戏化版 (Unit Gamified PR_3 真测打磨)
 *
 * 路由白名单 unit (GAMIFIED_UNIT_IDS) 走这个组件, 其余继续走老的
 * PrimaryHubUnit.tsx (老文件 0 改动).
 *
 * 布局 (上到下, PR_3 真测后调整):
 *   1. 顶部概览卡  — 大 emoji + 标题 + 单行 stats (无 Rex, #3 去重)
 *   2. 焦点卡      — RexMascot sm + 第一个未完成 stage, fc-pulse-glow-purple
 *   3. 闯关路径    — 7 个非 boss 节点紧凑垂直, 36px 节点 (#1 + #4 手机一屏)
 *   4. Boss 终点   — RankBadge 4 档, 文案严格按 bossCompleted (#6 BUG 修)
 *
 * PR_3 真测反馈处理:
 *   #1 + #4 (手机一屏 + 路径占空间) → 整体紧凑化, 节点 54→36, offset ±32→±4
 *   #3 (Rex 重复)                   → 概览卡 Rex 去掉, 改大 emoji 占位
 *   #5 (已完成折叠区冗余)            → 整段删除 (路径上 ✓ 已表达, 不留计数提示)
 *   #6 (Boss 状态判定错)              → 严格 bossCompleted = idx in completedSet; 文案
 *                                       未通关用 "完成 N/M · 段位 X" (不用 percent 派生)
 *
 * 设计 token: 全在 src/index.css 全局 (--fc-*), 不引新 css 文件.
 */

import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findUnit, isUnitPublished } from "@/lib/primaryHub/courseData";
import { getUnitProgress } from "@/lib/primaryHub/progress";
import { isReadWriteComingSoon } from "@/lib/primaryHub/stageCompletable";
import { readUnitState } from "@/lib/primaryHub/storage";
import RexMascot, { type RexMood } from "@/components/primaryHub/finalChallenge/RexMascot";
import RankBadge, { type RankTier } from "@/components/primaryHub/finalChallenge/RankBadge";
import type { StageDef, UnitState, UnitDef } from "@/lib/primaryHub/types";

/* ---------- 进度 → 视觉映射 (a1 完成度门控) ---------- */

function unitBossTier(percent: number): RankTier {
  if (percent >= 100) return "rainbow";
  if (percent >= 75) return "gold";
  if (percent >= 40) return "silver";
  return "bronze";
}

function focusRexMood(percent: number, allDone: boolean): RexMood {
  if (allDone) return "celebrating";
  if (percent >= 75) return "excited";
  return "encouraging";
}

/* ---------- 焦点 stage = 第一个未完成的可玩 stage (决策4) ---------- */

function findFocusStageIdx(
  unit: UnitDef,
  us: UnitState | null,
  unitId: string,
): number | null {
  const completed = new Set(us?.completedStages ?? []);
  for (let i = 0; i < unit.stages.length; i++) {
    if (completed.has(i)) continue;
    if (isReadWriteComingSoon(unitId, i, unit.stages[i])) continue;
    return i;
  }
  return null;
}

/* ---------- 公共样式 ---------- */

const SHELL_BG: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
};

/* ---------- 主组件 ---------- */

export default function PrimaryHubUnitGamified() {
  const { semId, unitId } = useParams<{ semId: string; unitId: string }>();
  const { grade, state } = usePrimaryHub();
  const nav = useNavigate();

  const unit = unitId ? findUnit(unitId) : null;
  const us = unitId ? readUnitState(state, unitId) : null;
  const p = unitId
    ? getUnitProgress(state, unitId)
    : { percent: 0, completed: 0, total: 0, stageCount: 0 };
  const base = `/primary/hub/${grade}`;

  // 这两个 memo 必须在 early return 前
  const focusIdx = useMemo(
    () => (unit && unitId ? findFocusStageIdx(unit, us, unitId) : null),
    [unit, us, unitId],
  );
  const bossIdx = useMemo(
    () => unit?.stages.findIndex((s) => s.type === "finalQuiz") ?? -1,
    [unit],
  );

  if (!unit || !unitId || !semId) {
    return <div className="p-6 text-center">单元未找到</div>;
  }

  if (!isUnitPublished(unit)) {
    return <Navigate to={`${base}/semester/${semId}`} replace />;
  }

  const allDone = focusIdx === null;
  const stars = us?.stars ?? 0;
  const completedSet = new Set(us?.completedStages ?? []);
  // #6 BUG 修: bossCompleted 只看 boss 索引是否在 completedSet,
  // 严禁用 percent 等间接指标推导 (percent 可能因 partial stageProgress
  // 而四舍五入到 100, 但 boss 尚未真正完成).
  const bossCompleted: boolean = bossIdx >= 0 && completedSet.has(bossIdx);
  const bossTier = unitBossTier(p.percent);

  // 非 boss 的可玩 stages → 路径节点 (boss 单独显示)
  const pathStages = unit.stages
    .map((stage, idx) => ({ stage, idx }))
    .filter(({ idx }) => idx !== bossIdx);

  const goToStage = (idx: number) =>
    nav(`${base}/semester/${semId}/unit/${unitId}/stage/${idx}`);

  return (
    <div data-page-variant="unit-gamified" style={SHELL_BG}>
      {/* ===== 顶部 back 栏 ===== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: "rgba(255, 255, 255, 0.7)",
          borderBottom: "1px solid var(--fc-border-soft)",
        }}
      >
        <button
          type="button"
          onClick={() => nav(`${base}/semester/${semId}`)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--fc-ink)",
            padding: "2px 4px",
          }}
          aria-label="back"
        >
          ←
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fc-ink-soft)" }}>
          Unit {unit.num} · {unit.cn}
        </div>
      </div>

      {/* ===== 1. 概览卡 (无 Rex, 大 emoji + 单行 stats — #1 #3) ===== */}
      <section
        className="fc-spring-in"
        style={{
          margin: "10px 12px 0",
          padding: "12px 14px",
          borderRadius: "var(--fc-radius-xl)",
          background:
            "linear-gradient(135deg, var(--fc-primary-bg) 0%, var(--fc-purple-bg) 100%)",
          border: "2px solid var(--fc-primary)",
          boxShadow: "var(--fc-shadow-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            aria-hidden
            style={{
              fontSize: 38,
              lineHeight: 1,
              flex: "0 0 auto",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
            }}
          >
            {unit.emoji}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--fc-ink)",
                fontFamily: "var(--fc-font-display)",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {unit.title}
            </div>
            <div
              style={{
                marginTop: 3,
                fontSize: 11,
                color: "var(--fc-ink-soft)",
                fontWeight: 600,
              }}
            >
              {allDone
                ? "🎉 已通关!"
                : `完成 ${p.completed}/${p.total} · ⭐ ${stars} · ${p.percent}%`}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div
          style={{
            marginTop: 8,
            height: 6,
            borderRadius: "var(--fc-radius-pill)",
            overflow: "hidden",
            background: "rgba(42, 38, 32, 0.08)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${p.percent}%`,
              background:
                "linear-gradient(90deg, var(--fc-primary) 0%, var(--fc-yellow) 100%)",
              transition: "width 400ms ease-out",
            }}
          />
        </div>
      </section>

      {/* ===== 2. 焦点卡 (Rex sm 紧凑 — #3 仅焦点卡保留 Rex) ===== */}
      <FocusCard
        unit={unit}
        focusIdx={focusIdx}
        bossIdx={bossIdx}
        allDone={allDone}
        percent={p.percent}
        onPlay={(idx) => goToStage(idx)}
      />

      {/* ===== 3. 闯关路径 (紧凑垂直 — #1 #4 手机一屏) ===== */}
      <section style={{ padding: "8px 16px 0" }}>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--fc-ink-mute)",
            textAlign: "center",
            letterSpacing: 1.2,
          }}
        >
          ✨ 闯关路径
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {pathStages.map(({ stage, idx }, i) => {
            const done = completedSet.has(idx);
            const isFocus = idx === focusIdx;
            const comingSoon = isReadWriteComingSoon(unitId, idx, stage);
            // 微错位 (±4) — 留点游戏感但不占空间
            const offset = i % 2 === 0 ? -4 : 4;
            return (
              <PathNode
                key={stage.id}
                stage={stage}
                done={done}
                isFocus={isFocus}
                comingSoon={comingSoon}
                offset={offset}
                onClick={() => !comingSoon && goToStage(idx)}
              />
            );
          })}
        </div>
      </section>

      {/* (PR_3 #5: 已完成折叠区已删除. 路径上 ✓ 已表达, 不留计数提示.) */}

      {/* ===== 4. Boss 终点 (RankBadge 4 档, 严格 bossCompleted — #6) ===== */}
      {bossIdx >= 0 && (
        <section style={{ padding: "18px 16px 60px" }}>
          <div
            style={{
              padding: "16px 14px",
              borderRadius: "var(--fc-radius-xl)",
              background:
                "linear-gradient(135deg, var(--fc-yellow) 0%, var(--fc-primary) 100%)",
              border: "2px solid var(--fc-primary-dark)",
              boxShadow: "var(--fc-shadow-game-yellow)",
              textAlign: "center",
              color: "white",
            }}
          >
            <div
              className={bossCompleted ? "fc-medal-unlock" : ""}
              style={{ display: "inline-block" }}
            >
              <RankBadge tier={bossTier} size="md" unlock={bossCompleted} />
            </div>
            <h2
              style={{
                marginTop: 8,
                fontSize: 16,
                fontWeight: 800,
                fontFamily: "var(--fc-font-display)",
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              🏆 单元 Boss · 最终通关
            </h2>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                opacity: 0.95,
                fontWeight: 600,
              }}
            >
              {bossCompleted
                ? `已通关 · 段位 ${bossTierLabel(bossTier)}`
                : p.completed === 0
                  ? "先做完前面几关再挑战"
                  : `完成 ${p.completed}/${p.total} · 段位 ${bossTierLabel(bossTier)}`}
            </div>
            <button
              type="button"
              onClick={() => goToStage(bossIdx)}
              className="fc-btn-press fc-shadow-orange"
              style={{
                marginTop: 12,
                padding: "10px 26px",
                borderRadius: "var(--fc-radius-pill)",
                background: "white",
                color: "var(--fc-primary-dark)",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--fc-font-display)",
              }}
            >
              {bossCompleted ? "🔁 再战 Boss" : "⚔️ 挑战 Boss"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/* ============ 子组件 ============ */

function FocusCard({
  unit,
  focusIdx,
  bossIdx,
  allDone,
  percent,
  onPlay,
}: {
  unit: UnitDef;
  focusIdx: number | null;
  bossIdx: number;
  allDone: boolean;
  percent: number;
  onPlay: (idx: number) => void;
}) {
  // 全完成: 庆祝卡 (无点击, Rex 庆祝)
  if (allDone) {
    return (
      <section style={{ padding: "12px 12px 0" }}>
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "var(--fc-radius-xl)",
            background:
              "linear-gradient(135deg, var(--fc-green-bg) 0%, var(--fc-yellow) 100%)",
            border: "2px solid var(--fc-green-dark)",
            textAlign: "center",
          }}
        >
          <RexMascot mood="celebrating" size="md" showMessage={false} />
          <div
            style={{
              marginTop: 6,
              fontSize: 16,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
            }}
          >
            🎉 这单元全通了!
          </div>
        </div>
      </section>
    );
  }

  // 焦点 stage 信息
  if (focusIdx === null) return null;
  const focusStage = unit.stages[focusIdx];
  const isBossFocus = focusIdx === bossIdx;

  return (
    <section style={{ padding: "10px 12px 0" }}>
      <button
        type="button"
        onClick={() => onPlay(focusIdx)}
        className="fc-btn-press fc-pulse-glow-purple"
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "var(--fc-radius-xl)",
          border: "2px solid var(--fc-purple)",
          background:
            "linear-gradient(135deg, white 0%, var(--fc-purple-bg) 100%)",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "var(--fc-shadow-card)",
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <RexMascot mood={focusRexMood(percent, false)} size="sm" showMessage={false} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--fc-purple-dark)",
              letterSpacing: 1.2,
              marginBottom: 1,
            }}
          >
            {isBossFocus ? "🎯 准备挑战 BOSS" : "🎯 继续学"}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {focusStage.icon} {focusStage.title}
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              color: "var(--fc-ink-soft)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {focusStage.subtitle} · {focusStage.time}
          </div>
        </div>
        <div style={{ fontSize: 20, color: "var(--fc-purple)" }}>▸</div>
      </button>
    </section>
  );
}

function PathNode({
  stage,
  done,
  isFocus,
  comingSoon,
  offset,
  onClick,
}: {
  stage: StageDef;
  done: boolean;
  isFocus: boolean;
  comingSoon: boolean;
  offset: number;
  onClick: () => void;
}) {
  // 三态视觉
  let bg = "white";
  let border = "2px solid var(--fc-border-medium)";
  let iconColor = "var(--fc-ink-mute)";
  let opacity = 1;
  if (comingSoon) {
    bg = "var(--fc-paper)";
    border = "2px dashed var(--fc-border-medium)";
    opacity = 0.7;
  } else if (done) {
    bg = "var(--fc-green)";
    border = "2px solid var(--fc-green-dark)";
    iconColor = "white";
  } else if (isFocus) {
    bg = "var(--fc-primary-bg)";
    border = "2.5px solid var(--fc-primary)";
    iconColor = "var(--fc-primary-dark)";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={comingSoon}
      className={comingSoon ? "" : "fc-btn-press"}
      style={{
        transform: `translateX(${offset}px)`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "1px 0",
        background: "transparent",
        border: "none",
        cursor: comingSoon ? "not-allowed" : "pointer",
        opacity,
        width: "100%",
        maxWidth: 280,
      }}
      aria-label={stage.title}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: bg,
          border,
          display: "grid",
          placeItems: "center",
          fontSize: 16,
          color: iconColor,
          flex: "0 0 auto",
          boxShadow: done || isFocus ? "var(--fc-shadow-card)" : "none",
        }}
      >
        {done ? "✓" : comingSoon ? "🚧" : stage.icon}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: done
            ? "var(--fc-green-dark)"
            : isFocus
              ? "var(--fc-primary-dark)"
              : "var(--fc-ink-mute)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {stage.title}
      </div>
    </button>
  );
}

function bossTierLabel(t: RankTier): string {
  return t === "rainbow" ? "彩虹" : t === "gold" ? "金" : t === "silver" ? "银" : "铜";
}
