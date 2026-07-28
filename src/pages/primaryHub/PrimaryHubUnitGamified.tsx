/**
 * 单元详情页 — 游戏化版 (Unit Gamified PR_3.5 视觉打磨)
 *
 * 路由白名单 unit (GAMIFIED_UNIT_IDS) 走这个组件, 其余继续走老的
 * PrimaryHubUnit.tsx (老文件 0 改动).
 *
 * 布局 (上到下):
 *   1. 顶部概览卡    — 大 emoji + 标题 + 单行 stats + 进度条
 *   2. 焦点卡        — RexMascot sm + 第一个未完成 stage
 *   3. 闯关路径      — 竖排单列, 7 个 stage 行 [圆节点 | 名 | lucide 类型图标]
 *                      节点状态: 完成绿勾 / 当前 focusIdx 橙环 / 未做灰 (二态来源)
 *                      节点间用 dashed 短虚线连接 (CSS, 无资源)
 *   4. 最终挑战卡    — Trophy 主视觉 + 三态文案 (面向四年级口语化)
 *                      奖牌段位**仅在 bossCompleted 时**显示
 *
 * PR_3.5 改动重点 (视觉打磨, 不动数据):
 *   - lucide-react 图标按 stage.type 映射 (8 类型 exhaustive)
 *   - PathNode 重写: 三列布局 [circle | name | type-icon], 无横向 offset
 *   - 节点间虚线 connector
 *   - Boss 三态文案派生自 nonBossPlayable / nonBossDone / bossCompleted
 *     不引新字段, 全用现有 completedSet + pathStages 算
 *   - "单元 Boss" → "最终挑战"
 *   - Trophy 替代 RankBadge 主视觉, 段位仅状态 C 显示
 *
 * 硬约束守住: 单文件改动; PrimaryHubUnit.tsx 0 byte; 不动 storage /
 *   UnitState schema / progress 算法 / stage 跳转链路; 不引新依赖
 *   (lucide-react 已在 package.json:64); 不引新 css 文件; stash@{0} 不碰.
 */

import { Fragment, useMemo } from "react";
import NotFoundCard from "@/components/hub/NotFoundCard";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Check,
  Ear,
  Headphones,
  MessageCircle,
  Pencil,
  Puzzle,
  Trophy,
  Type as TypeIcon,
} from "lucide-react";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findUnit, isUnitPublished } from "@/lib/primaryHub/courseData";
import { getUnitProgress } from "@/lib/primaryHub/progress";
import { isReadWriteComingSoon } from "@/lib/primaryHub/stageCompletable";
import { readUnitState } from "@/lib/primaryHub/storage";
import RexMascot, { type RexMood } from "@/components/primaryHub/finalChallenge/RexMascot";
import type { RankTier } from "@/components/primaryHub/finalChallenge/RankBadge";
import type { StageDef, UnitState, UnitDef } from "@/lib/primaryHub/types";

/* ---------- 进度 → 视觉映射 (tier 仅 Boss 完成时使用) ---------- */

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

/* ---------- stage.type → lucide 图标 (8 类型 exhaustive) ---------- */

type LucideIconComponent = typeof BookOpen;

function stageTypeToIcon(type: StageDef["type"]): LucideIconComponent {
  switch (type) {
    case "vocab":
      return BookOpen;
    case "listenWord":
      return Headphones;
    case "match":
      return Puzzle;
    case "sentence":
      return MessageCircle;
    case "write":
      return Pencil;
    case "listenSent":
      return Ear;
    case "readWrite":
      return TypeIcon;
    case "finalQuiz":
      return Trophy;
  }
}

/* ---------- 公共样式 ---------- */

const SHELL_BG: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
};

// 路径行内边距 + 节点大小 — connector 对齐用 (圆心 = padding-left + radius)
const PATH_ROW_PADDING_LEFT = 14;
const PATH_NODE_DIAMETER = 36;

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
    return <NotFoundCard title="未找到这个单元" homePath={"/primary"} />;
  }

  if (!isUnitPublished(unit)) {
    return <Navigate to={`${base}/semester/${semId}`} replace />;
  }

  const allDone = focusIdx === null;
  const stars = us?.stars ?? 0;
  const completedSet = new Set(us?.completedStages ?? []);
  // bossCompleted: 单一可信源 (只看 boss idx 是否在 completedSet)
  const bossCompleted: boolean = bossIdx >= 0 && completedSet.has(bossIdx);
  const bossTier: RankTier = unitBossTier(p.percent);

  // 非 boss 的可玩 stages → 路径节点
  const pathStages = unit.stages
    .map((stage, idx) => ({ stage, idx }))
    .filter(({ idx }) => idx !== bossIdx);

  // Boss 三态派生 (只用 completedSet + 可玩 prereqs, 不引新字段)
  const playablePathStages = pathStages.filter(
    ({ stage, idx }) => !isReadWriteComingSoon(unitId, idx, stage),
  );
  const nonBossPlayable = playablePathStages.length;
  const nonBossDone = playablePathStages.filter(({ idx }) =>
    completedSet.has(idx),
  ).length;
  const prereqsAllDone = nonBossPlayable === 0 || nonBossDone >= nonBossPlayable;
  const bossState: "A" | "B" | "C" = bossCompleted
    ? "C"
    : prereqsAllDone
      ? "B"
      : "A";
  const prereqsRemaining = Math.max(0, nonBossPlayable - nonBossDone);

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
        <div
          style={{ fontSize: 13, fontWeight: 700, color: "var(--fc-ink-soft)" }}
        >
          Unit {unit.num} · {unit.cn}
        </div>
      </div>

      {/* ===== 1. 概览卡 ===== */}
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
          {/* PR_3.6: 概览卡左侧 3D 学校图 (透明 PNG, 替代 unit.emoji) */}
          <img
            src="/primary/images/primary/g4v1_u1/school.png"
            alt=""
            width={84}
            height={84}
            style={{
              width: 84,
              height: 84,
              objectFit: "contain",
              flex: "0 0 auto",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
            }}
          />
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

      {/* ===== 2. 焦点卡 ===== */}
      <FocusCard
        unit={unit}
        focusIdx={focusIdx}
        bossIdx={bossIdx}
        allDone={allDone}
        percent={p.percent}
        onPlay={(idx) => goToStage(idx)}
      />

      {/* ===== 3. 闯关路径 (单列 + 虚线连接) ===== */}
      <section style={{ padding: "12px 16px 0" }}>
        <h3
          style={{
            margin: "0 0 8px",
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
            background: "rgba(255, 255, 255, 0.55)",
            borderRadius: "var(--fc-radius-xl)",
            border: "1px solid var(--fc-border-soft)",
            padding: "8px 0",
          }}
        >
          {pathStages.map(({ stage, idx }, i) => {
            const done = completedSet.has(idx);
            const isFocus = idx === focusIdx;
            const comingSoon = isReadWriteComingSoon(unitId, idx, stage);
            return (
              <Fragment key={stage.id}>
                <PathRow
                  stage={stage}
                  done={done}
                  isFocus={isFocus}
                  comingSoon={comingSoon}
                  onClick={() => !comingSoon && goToStage(idx)}
                />
                {i < pathStages.length - 1 && <PathConnector />}
              </Fragment>
            );
          })}
        </div>
      </section>

      {/* ===== 4. 最终挑战卡 (Trophy 主视觉 + 三态文案) ===== */}
      {bossIdx >= 0 && (
        <section style={{ padding: "18px 16px 60px" }}>
          <FinalChallengeCard
            bossState={bossState}
            bossTier={bossTier}
            prereqsRemaining={prereqsRemaining}
            onPlay={() => goToStage(bossIdx)}
          />
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
          <RexMascot
            mood={focusRexMood(percent, false)}
            size="sm"
            showMessage={false}
          />
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
            {isBossFocus ? "🎯 准备最终挑战" : "🎯 继续学"}
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

function PathRow({
  stage,
  done,
  isFocus,
  comingSoon,
  onClick,
}: {
  stage: StageDef;
  done: boolean;
  isFocus: boolean;
  comingSoon: boolean;
  onClick: () => void;
}) {
  const TypeIconComp = stageTypeToIcon(stage.type);

  // 三态视觉 (二态数据来源 + focusIdx 派生第三态)
  let circleBg: string;
  let circleBorder: string;
  let nameColor: string;
  let typeIconColor: string;
  if (comingSoon) {
    circleBg = "var(--fc-paper)";
    circleBorder = "2px dashed var(--fc-border-medium)";
    nameColor = "var(--fc-ink-mute)";
    typeIconColor = "var(--fc-ink-mute)";
  } else if (done) {
    circleBg = "var(--fc-green)";
    circleBorder = "2px solid var(--fc-green-dark)";
    nameColor = "var(--fc-green-dark)";
    typeIconColor = "var(--fc-green-dark)";
  } else if (isFocus) {
    circleBg = "white";
    circleBorder = "2.5px solid var(--fc-primary)";
    nameColor = "var(--fc-primary-dark)";
    typeIconColor = "var(--fc-primary)";
  } else {
    circleBg = "white";
    circleBorder = "2px solid var(--fc-border-medium)";
    nameColor = "var(--fc-ink-soft)";
    typeIconColor = "var(--fc-ink-mute)";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={comingSoon}
      className={comingSoon ? "" : "fc-btn-press"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: `8px ${PATH_ROW_PADDING_LEFT}px`,
        width: "100%",
        background: "transparent",
        border: "none",
        cursor: comingSoon ? "not-allowed" : "pointer",
        opacity: comingSoon ? 0.7 : 1,
        textAlign: "left",
      }}
      aria-label={stage.title}
      data-stage-type={stage.type}
      data-state={
        comingSoon ? "comingSoon" : done ? "done" : isFocus ? "focus" : "todo"
      }
    >
      {/* 左 — 圆节点 (done=绿勾 / focus=橙环空心 / todo=灰空心) */}
      <div
        style={{
          width: PATH_NODE_DIAMETER,
          height: PATH_NODE_DIAMETER,
          borderRadius: "50%",
          background: circleBg,
          border: circleBorder,
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
          boxShadow: done || isFocus ? "var(--fc-shadow-card)" : "none",
        }}
      >
        {done ? (
          <Check size={20} color="white" strokeWidth={3} aria-hidden />
        ) : comingSoon ? (
          <span style={{ fontSize: 14 }} aria-hidden>
            🚧
          </span>
        ) : null}
      </div>

      {/* 中 — 关卡名 (PR_3.6: 字号 14→18, weight 700→800) */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 18,
          fontWeight: 800,
          color: nameColor,
          fontFamily: "var(--fc-font-display)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {stage.title}
      </div>

      {/* 右 — 类型 lucide 图标 */}
      <TypeIconComp
        size={20}
        color={typeIconColor}
        strokeWidth={done || isFocus ? 2.5 : 2}
        aria-hidden
      />
    </button>
  );
}

/**
 * 节点间虚线连接器 — 全 CSS, 无资源.
 * marginLeft 让虚线对齐圆心: PATH_ROW_PADDING_LEFT + PATH_NODE_DIAMETER/2 - 1
 */
function PathConnector() {
  return (
    <div
      aria-hidden
      style={{
        marginLeft: PATH_ROW_PADDING_LEFT + PATH_NODE_DIAMETER / 2 - 1,
        height: 8,
        width: 0,
        borderLeft: "2px dashed var(--fc-border-medium)",
      }}
    />
  );
}

/* ---------- 最终挑战卡 (Trophy + 三态) ---------- */

const TIER_LABELS: Record<RankTier, string> = {
  bronze: "🥉 铜牌",
  silver: "🥈 银牌",
  gold: "🥇 金牌",
  rainbow: "🌈 彩虹奖",
};

function FinalChallengeCard({
  bossState,
  bossTier,
  prereqsRemaining,
  onPlay,
}: {
  bossState: "A" | "B" | "C";
  bossTier: RankTier;
  prereqsRemaining: number;
  onPlay: () => void;
}) {
  // 三态文案 (面向四年级口语化, Aaron 待 review)
  let metaText: string;
  let buttonText: string;
  if (bossState === "A") {
    // State A 不锁 (尊重可跳关) — 按钮和 B/C 共用 onPlay 直接进 boss stage
    metaText = `还有 ${prereqsRemaining} 关没闯过 — 也可以直接来挑战哦!`;
    buttonText = "直接挑战 ▸";
  } else if (bossState === "B") {
    metaText = "前面都做完啦 — 准备好挑战了吗?";
    buttonText = "开始挑战 ⚔️";
  } else {
    metaText = "全部通关,太厉害了!🎉";
    buttonText = "再玩一次 🔁";
  }

  // PR_3.6 v2: 左右两栏布局 (左 文字竖排 + 右 trophy 视觉),
  // 文案 / 状态逻辑 / 段位条件渲染 完全不动.
  return (
    <div
      data-final-card="1"
      style={{
        padding: "16px",
        borderRadius: "var(--fc-radius-xl)",
        background:
          "linear-gradient(135deg, var(--fc-yellow) 0%, var(--fc-primary) 100%)",
        border: "2px solid var(--fc-primary-dark)",
        boxShadow: "var(--fc-shadow-game-yellow)",
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* 左栏 — 文字, 左对齐, 竖排 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 4,
        }}
      >
        {/* FINAL 小标签 */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 2.4,
            color: "rgba(255, 255, 255, 0.85)",
            textShadow: "0 1px 1px rgba(0,0,0,0.15)",
          }}
        >
          FINAL
        </div>

        {/* 标题 */}
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "var(--fc-font-display)",
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
            lineHeight: 1.1,
          }}
        >
          最终挑战
        </h2>

        {/* meta */}
        <div
          style={{
            marginTop: 2,
            fontSize: 12,
            opacity: 0.95,
            fontWeight: 600,
            lineHeight: 1.4,
            textAlign: "left",
          }}
        >
          {metaText}
        </div>

        {/* 段位标 — 仅状态 C 显示 */}
        {bossState === "C" && (
          <div
            style={{
              marginTop: 4,
              padding: "3px 10px",
              borderRadius: "var(--fc-radius-pill)",
              background: "rgba(255, 255, 255, 0.25)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {TIER_LABELS[bossTier]}
          </div>
        )}

        {/* button — 左对齐, 不再 margin auto */}
        <button
          type="button"
          onClick={onPlay}
          className="fc-btn-press fc-shadow-orange"
          style={{
            marginTop: 8,
            padding: "8px 22px",
            borderRadius: "var(--fc-radius-pill)",
            background: "white",
            color: "var(--fc-primary-dark)",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--fc-font-display)",
          }}
          data-boss-state={bossState}
        >
          {buttonText}
        </button>
      </div>

      {/* 右栏 — Trophy 视觉, 占右侧 ~38% 宽, 垂直居中 */}
      <div
        style={{
          flex: "0 0 38%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src="/primary/images/primary/g4v1_u1/trophy.png"
          alt="奖杯"
          width={132}
          height={132}
          className={bossState === "C" ? "fc-medal-unlock" : ""}
          style={{
            width: "100%",
            maxWidth: 132,
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
            opacity: bossState === "A" ? 0.92 : 1,
          }}
        />
      </div>
    </div>
  );
}
