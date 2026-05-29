/**
 * 单元详情页 — 游戏化版 (Unit Gamified PR_2 布局)
 *
 * 路由白名单 unit (GAMIFIED_UNIT_IDS) 走这个组件, 其余继续走老的
 * PrimaryHubUnit.tsx (老文件 0 改动).
 *
 * 布局 (上到下):
 *   1. 顶部概览卡   — RexMascot + 标题 + 进度环 + 总星
 *   2. 焦点卡       — 第一个未完成 stage, 放大 + fc-pulse-glow-purple
 *   3. 闯关路径     — 非 boss 的 7 个 stage 节点, 垂直交错
 *   4. 已完成折叠   — 默认收起, 点 ▼ 展开
 *   5. Boss 终点    — RankBadge 4 档 (a1 完成度门控)
 *
 * 设计决策:
 *   - 所有 stage 节点可点 (沿用老组件行为, 不强制线性解锁)
 *   - 路径 current 节点只显示橙色 ring, 不发光 (b1: 只焦点卡发光)
 *   - 已完成小卡只显示 ✓ (星级在概览卡总星显示)
 *   - 进度算法借鉴 finalChallenge progress.ts 思路, 数据走单元页自己的
 *     PrimaryHubPersist (两套不通用 — 决策3 现实约束)
 *
 * 设计 token: 全在 src/index.css 全局 (--fc-*), 不引新 css 文件.
 */

import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findUnit, isUnitPublished } from "@/lib/primaryHub/courseData";
import { getUnitProgress, getStagePercent } from "@/lib/primaryHub/progress";
import { isReadWriteComingSoon } from "@/lib/primaryHub/stageCompletable";
import { readUnitState } from "@/lib/primaryHub/storage";
import RexMascot, { type RexMood } from "@/components/primaryHub/finalChallenge/RexMascot";
import RankBadge, { type RankTier } from "@/components/primaryHub/finalChallenge/RankBadge";
import type { StageDef, UnitState, UnitDef } from "@/lib/primaryHub/types";

/* ---------- 进度 → 视觉映射 (a1 完成度门控 / Rex 心情) ---------- */

function unitBossTier(percent: number): RankTier {
  if (percent >= 100) return "rainbow";
  if (percent >= 75) return "gold";
  if (percent >= 40) return "silver";
  return "bronze";
}

function overviewRexMood(percent: number): RexMood {
  if (percent >= 100) return "celebrating";
  if (percent >= 51) return "excited";
  if (percent >= 1) return "encouraging";
  return "thinking";
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
  const [completedOpen, setCompletedOpen] = useState(false);

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
  const bossDone = bossIdx >= 0 && completedSet.has(bossIdx);
  const bossTier = unitBossTier(p.percent);

  // 非 boss 的可玩 stages → 路径节点 (boss 单独显示)
  const pathStages = unit.stages
    .map((stage, idx) => ({ stage, idx }))
    .filter(({ idx }) => idx !== bossIdx);

  // 已完成 stages (用于折叠区, 不含 boss — boss 在 Boss section)
  const doneStages = pathStages.filter(({ idx }) => completedSet.has(idx));
  const goToStage = (idx: number) =>
    nav(`${base}/semester/${semId}/unit/${unitId}/stage/${idx}`);

  return (
    <div data-page-variant="unit-gamified" style={SHELL_BG}>
      {/* ===== 顶部 back 栏 ===== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
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
            fontSize: 22,
            cursor: "pointer",
            color: "var(--fc-ink)",
          }}
          aria-label="back"
        >
          ←
        </button>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fc-ink-soft)" }}>
          Unit {unit.num} · {unit.cn}
        </div>
      </div>

      {/* ===== 1. 顶部概览卡 ===== */}
      <section
        className="fc-spring-in"
        style={{
          margin: "16px 16px 0",
          padding: "18px 16px",
          borderRadius: "var(--fc-radius-xl)",
          background:
            "linear-gradient(135deg, var(--fc-primary-bg) 0%, var(--fc-purple-bg) 100%)",
          border: "2px solid var(--fc-primary)",
          boxShadow: "var(--fc-shadow-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: "0 0 auto" }}>
            <RexMascot mood={overviewRexMood(p.percent)} size="md" showMessage={false} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 21,
                fontWeight: 800,
                color: "var(--fc-ink)",
                fontFamily: "var(--fc-font-display)",
                lineHeight: 1.2,
              }}
            >
              {unit.emoji} {unit.title}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "var(--fc-ink-mute)",
                fontWeight: 600,
              }}
            >
              {allDone ? "🎉 已通关!" : `进度 ${p.completed}/${p.total}`}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div
          style={{
            marginTop: 14,
            height: 8,
            borderRadius: "var(--fc-radius-pill)",
            overflow: "hidden",
            background: "rgba(42, 38, 32, 0.08)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${p.percent}%`,
              background: "linear-gradient(90deg, var(--fc-primary) 0%, var(--fc-yellow) 100%)",
              transition: "width 400ms ease-out",
            }}
          />
        </div>

        {/* 数据带 */}
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            fontSize: 12,
            color: "var(--fc-ink-soft)",
          }}
        >
          <Stat label="完成" value={`${p.completed}/${p.total}`} />
          <Stat label="总星" value={`⭐ ${stars}`} />
          <Stat label="进度" value={`${p.percent}%`} />
        </div>
      </section>

      {/* ===== 2. 焦点卡 ===== */}
      <FocusCard
        unit={unit}
        focusIdx={focusIdx}
        bossIdx={bossIdx}
        allDone={allDone}
        percent={p.percent}
        onPlay={(idx) => goToStage(idx)}
      />

      {/* ===== 3. 闯关路径 (非 boss 节点) ===== */}
      <section style={{ padding: "8px 24px 0" }}>
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--fc-ink-mute)",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          ✨ 闯关路径
        </h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          {pathStages.map(({ stage, idx }, i) => {
            const done = completedSet.has(idx);
            const isFocus = idx === focusIdx;
            const comingSoon = isReadWriteComingSoon(unitId, idx, stage);
            const offset = i % 2 === 0 ? -32 : 32; // 交错布局
            return (
              <div key={stage.id} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <PathNode
                    stage={stage}
                    done={done}
                    isFocus={isFocus}
                    comingSoon={comingSoon}
                    offset={offset}
                    onClick={() => !comingSoon && goToStage(idx)}
                  />
                </div>
                {i < pathStages.length - 1 && <Connector />}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 4. 已完成折叠区 (决策3: 默认收起) ===== */}
      {doneStages.length > 0 && (
        <section style={{ padding: "20px 16px 0" }}>
          <button
            type="button"
            onClick={() => setCompletedOpen((v) => !v)}
            className="fc-btn-press"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--fc-radius)",
              border: "1px solid var(--fc-border-soft)",
              background: "var(--fc-green-bg)",
              color: "var(--fc-green-dark)",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            aria-expanded={completedOpen}
          >
            <span>✓ 已完成 {doneStages.length} 个</span>
            <span
              style={{
                fontSize: 12,
                transition: "transform 200ms ease",
                transform: completedOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▼
            </span>
          </button>
          {completedOpen && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {doneStages.map(({ stage, idx }) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => goToStage(idx)}
                  className="fc-btn-press"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--fc-radius-sm)",
                    background: "white",
                    border: "1px solid var(--fc-green-light)",
                    fontSize: 13,
                    color: "var(--fc-ink-soft)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{stage.icon}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{stage.title}</span>
                  <span style={{ color: "var(--fc-green-dark)", fontWeight: 800 }}>✓</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== 5. Boss 终点 (RankBadge 4 档 a1) ===== */}
      {bossIdx >= 0 && (
        <section style={{ padding: "24px 16px 60px" }}>
          <div
            style={{
              padding: "20px 16px",
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
              className={bossDone ? "fc-medal-unlock" : ""}
              style={{ display: "inline-block" }}
            >
              <RankBadge tier={bossTier} size="lg" unlock={bossDone} />
            </div>
            <h2
              style={{
                marginTop: 12,
                fontSize: 18,
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
                fontSize: 12,
                opacity: 0.95,
                fontWeight: 600,
              }}
            >
              {bossDone
                ? `已通关 · 当前段位 ${bossTierLabel(bossTier)}`
                : p.percent === 0
                  ? "先做完前面几关再挑战"
                  : `进度 ${p.percent}% · 段位 ${bossTierLabel(bossTier)}`}
            </div>
            <button
              type="button"
              onClick={() => goToStage(bossIdx)}
              className="fc-btn-press fc-shadow-orange"
              style={{
                marginTop: 16,
                padding: "12px 30px",
                borderRadius: "var(--fc-radius-pill)",
                background: "white",
                color: "var(--fc-primary-dark)",
                fontWeight: 800,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--fc-font-display)",
              }}
            >
              {bossDone ? "🔁 再战 Boss" : "⚔️ 挑战 Boss"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/* ============ 子组件 ============ */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        borderRadius: "var(--fc-radius-sm)",
        padding: "6px 8px",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 800, color: "var(--fc-ink)", fontSize: 13 }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--fc-ink-mute)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

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
  // 全完成: 庆祝卡 (无点击)
  if (allDone) {
    return (
      <section style={{ padding: "20px 16px 0" }}>
        <div
          style={{
            padding: "20px 16px",
            borderRadius: "var(--fc-radius-xl)",
            background:
              "linear-gradient(135deg, var(--fc-green-bg) 0%, var(--fc-yellow) 100%)",
            border: "2px solid var(--fc-green-dark)",
            textAlign: "center",
          }}
        >
          <RexMascot mood="celebrating" size="lg" showMessage={false} />
          <div
            style={{
              marginTop: 10,
              fontSize: 18,
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
    <section style={{ padding: "20px 16px 0" }}>
      <button
        type="button"
        onClick={() => onPlay(focusIdx)}
        className="fc-btn-press fc-pulse-glow-purple"
        style={{
          width: "100%",
          padding: "18px 16px",
          borderRadius: "var(--fc-radius-xl)",
          border: "2px solid var(--fc-purple)",
          background:
            "linear-gradient(135deg, white 0%, var(--fc-purple-bg) 100%)",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "var(--fc-shadow-card)",
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <RexMascot mood={focusRexMood(percent, false)} size="md" showMessage={false} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--fc-purple-dark)",
              letterSpacing: 1.2,
              marginBottom: 2,
            }}
          >
            {isBossFocus ? "🎯 准备挑战 BOSS" : "🎯 继续学"}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
              lineHeight: 1.2,
            }}
          >
            {focusStage.icon} {focusStage.title}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "var(--fc-ink-soft)",
            }}
          >
            {focusStage.subtitle} · {focusStage.time}
          </div>
        </div>
        <div style={{ fontSize: 22, color: "var(--fc-purple)" }}>▸</div>
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
    border = "3px solid var(--fc-primary)";
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
        gap: 10,
        padding: 0,
        background: "transparent",
        border: "none",
        cursor: comingSoon ? "not-allowed" : "pointer",
        opacity,
      }}
      aria-label={stage.title}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: bg,
          border,
          display: "grid",
          placeItems: "center",
          fontSize: 24,
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
        }}
      >
        {stage.title}
      </div>
    </button>
  );
}

function Connector() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "2px 0",
      }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "var(--fc-border-medium)",
          }}
        />
      ))}
    </div>
  );
}

function bossTierLabel(t: RankTier): string {
  return t === "rainbow" ? "彩虹" : t === "gold" ? "金" : t === "silver" ? "银" : "铜";
}
