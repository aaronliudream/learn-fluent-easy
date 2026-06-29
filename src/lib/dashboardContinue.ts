// Dashboard「继续上次」卡数据源(纯只读)。
// 从三学段 hub state(localStorage,与云同步同源)读 currentUnit+currentSemester+completedStages,
// 拼出"继续:X学段·单元Y·第Z关 + 跳转路由"。不写任何东西、不碰做题逻辑。
// 说明:hub state 没有"最后活跃时间戳",所以无法严格判定"最近";这里以「已完成关数最多」为活跃度近似,
// 并优先用户当前选中的学段 tab。
import { loadPersist as loadPrimary } from "@/lib/primaryHub/storage";
import { findUnit as findPrimaryUnit } from "@/lib/primaryHub/courseData";
import { loadPersist as loadJunior } from "@/lib/juniorHub/storage";
import { findUnit as findJuniorUnit } from "@/lib/juniorHub/courseData";
import { loadPersist as loadGaokao } from "@/lib/gaokaoHub/storage";
import { findUnit as findGaokaoUnit } from "@/lib/gaokaoHub/courseData";
import type { Publisher } from "@/lib/gaokaoHub/publisher";

export type ContinueStage = "primary" | "junior" | "senior";

export interface ContinueTarget {
  stage: ContinueStage;
  stageLabel: string;
  unitTitle: string;
  stageTitle: string;
  nextStageNo: number; // 1-based, 给用户看
  completed: number;   // 已完成关数(无时间戳时的活跃度近似)
  lastActiveAt: number; // 最后活跃时间(有则按它排,真·最近)
  to: string;          // 跳转路由
}

const STAGE_LABEL: Record<ContinueStage, string> = { primary: "小学", junior: "初中", senior: "高中" };

function gaokaoPublisher(unitId: string): Publisher {
  if (unitId.startsWith("sufe_")) return "sufe";
  if (unitId.startsWith("fltrp_")) return "fltrp";
  return "pep";
}

interface Persistish {
  currentUnit?: string;
  currentSemester?: string;
  lastActiveAt?: number;
  units?: Record<string, { completedStages?: number[] } | undefined>;
}
interface Unitish {
  title?: string;
  stages?: Array<{ title?: string }>;
}

function build(
  stage: ContinueStage,
  base: string,
  persist: Persistish,
  unit: Unitish | null,
  publisherQuery = "",
): ContinueTarget | null {
  const unitId = persist.currentUnit;
  const semId = persist.currentSemester;
  if (!unitId || !semId || !unit) return null;
  const total = unit.stages?.length ?? 0;
  if (total === 0) return null;
  const completed = persist.units?.[unitId]?.completedStages?.length ?? 0;
  if (completed <= 0) return null; // 没开始过的不显示「继续」
  const nextIdx = Math.min(completed, total - 1);
  return {
    stage,
    stageLabel: STAGE_LABEL[stage],
    unitTitle: unit.title ?? "",
    stageTitle: unit.stages?.[nextIdx]?.title ?? "",
    nextStageNo: nextIdx + 1,
    completed,
    lastActiveAt: persist.lastActiveAt ?? 0,
    to: `${base}/semester/${semId}/unit/${unitId}/stage/${nextIdx}${publisherQuery}`,
  };
}

function candidatesFor(stage: ContinueStage): ContinueTarget[] {
  const out: ContinueTarget[] = [];
  try {
    if (stage === "primary") {
      for (const g of [3, 4, 5, 6]) {
        const p = loadPrimary(g as never) as Persistish;
        const t = build("primary", `/primary/hub/${g}`, p, findPrimaryUnit(p.currentUnit ?? "") as Unitish | null);
        if (t) out.push(t);
      }
    } else if (stage === "junior") {
      for (const g of [7, 8, 9]) {
        const p = loadJunior(g as never) as Persistish;
        const t = build("junior", `/junior/hub/${g}`, p, findJuniorUnit(p.currentUnit ?? "") as Unitish | null);
        if (t) out.push(t);
      }
    } else {
      for (const g of [1, 2, 3]) {
        const p = loadGaokao(g as never) as Persistish;
        const uid = p.currentUnit ?? "";
        const pub = gaokaoPublisher(uid);
        const unit = findGaokaoUnit(uid, pub) as Unitish | null;
        const q = pub === "pep" ? "" : `?publisher=${pub}`;
        const t = build("senior", `/gaokao/hub/${g}`, p, unit, q);
        if (t) out.push(t);
      }
    }
  } catch {
    /* localStorage/parse 失败 → 无卡 */
  }
  return out;
}

/** 返回单张「继续上次」目标:优先选中学段,其次按已完成关数最多。无进度则 null。 */
export function getContinueTarget(prefer: ContinueStage | null): ContinueTarget | null {
  const all: ContinueTarget[] = [
    ...candidatesFor("primary"),
    ...candidatesFor("junior"),
    ...candidatesFor("senior"),
  ];
  if (all.length === 0) return null;
  // 有 lastActiveAt 就按它(真·最近);都没有则退回已完成关数近似。
  const anyTimestamp = all.some((t) => t.lastActiveAt > 0);
  const rank = anyTimestamp
    ? (a: ContinueTarget, b: ContinueTarget) => b.lastActiveAt - a.lastActiveAt
    : (a: ContinueTarget, b: ContinueTarget) => b.completed - a.completed;
  if (prefer) {
    const inPrefer = all.filter((t) => t.stage === prefer).sort(rank);
    if (inPrefer.length) return inPrefer[0];
  }
  return [...all].sort(rank)[0];
}
