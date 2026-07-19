// Dashboard「继续上次」卡数据源(纯只读)。
// 从三学段 hub state(localStorage,与云同步同源)读 currentUnit+currentSemester+completedStages,
// 拼出"继续:X学段·单元Y·第Z关 + 跳转路由"。不写任何东西、不碰做题逻辑。
//
// 方向A(2026-07-05):指向「从当前单元起,第一个还没通关的单元」,通关自动前进到下一单元第1关。
//   · 完成判定:completedStages.length >= 该单元关数 → 该单元已通关。
//   · 最后一课收尾:currentUnit 起全部通关 → 停在最后一个可达单元的最后一关(卡片仍可点,不崩)。
//   · 老用户兼容:currentUnit 不在"可达有序表"(改名/下架)→ 退回旧的"单元内定位"逻辑。
// 说明:hub state 没有严格"最后活跃时间戳"覆盖率,排序仍以 lastActiveAt 优先、已完成关数近似兜底。
import { loadPersist as loadPrimary } from "@/lib/primaryHub/storage";
import {
  findUnit as findPrimaryUnit,
  findSemester as findPrimarySemester,
  semesterIdsForGrade as primarySemesterIds,
} from "@/lib/primaryHub/courseData";
import { loadPersist as loadJunior } from "@/lib/juniorHub/storage";
import {
  findUnit as findJuniorUnit,
  findSemester as findJuniorSemester,
  semesterIdsForGrade as juniorSemesterIds,
} from "@/lib/juniorHub/courseData";
import { loadPersist as loadGaokao } from "@/lib/gaokaoHub/storage";
import {
  findUnit as findGaokaoUnit,
  findSemester as findGaokaoSemester,
  semesterIdsForGrade as gaokaoSemesterIds,
} from "@/lib/gaokaoHub/courseData";
import type { Publisher } from "@/lib/gaokaoHub/publisher";

export type ContinueStage = "primary" | "junior" | "senior";

export interface ContinueTarget {
  stage: ContinueStage;
  stageLabel: string;
  unitTitle: string;
  stageTitle: string;
  nextStageNo: number; // 1-based, 给用户看
  completed: number;   // 活跃度近似(取当前单元已完成关数,用于无时间戳时排序)
  lastActiveAt: number; // 最后活跃时间(有则按它排,真·最近)
  to: string;          // 跳转路由
}

const STAGE_LABEL: Record<ContinueStage, string> = { primary: "小学", junior: "初中", senior: "高中" };

function gaokaoPublisher(unitId: string): Publisher {
  if (unitId.startsWith("sufe_")) return "sufe";
  if (unitId.startsWith("fltrp_")) return "fltrp";
  return "pep";
}

/** 初中出版社:外研社单元 id 前缀 wy*(全局唯一),其余 = 人教。 */
function juniorPublisher(unitId: string): "pep" | "fltrp" {
  return unitId.startsWith("wy") ? "fltrp" : "pep";
}

interface Persistish {
  currentUnit?: string;
  currentSemester?: string;
  lastActiveAt?: number;
  units?: Record<string, { completedStages?: number[] } | undefined>;
}
interface UnitLike {
  id: string;
  title?: string;
  available?: boolean;
  published?: boolean;
  stages?: Array<{ title?: string }>;
}
interface OrderedUnit {
  semId: string;
  unit: UnitLike;
}

/** 单元是否"可达"(在列表/路由里可见):available!==false 且 published!==false。 */
function isReachable(u: UnitLike): boolean {
  return u.available !== false && u.published !== false;
}

function completedCount(persist: Persistish, unitId: string): number {
  return persist.units?.[unitId]?.completedStages?.length ?? 0;
}

function makeTarget(
  stage: ContinueStage,
  base: string,
  o: OrderedUnit,
  nextIdx: number,
  rankCompleted: number,
  lastActiveAt: number,
  publisherQuery: string,
): ContinueTarget {
  const u = o.unit;
  return {
    stage,
    stageLabel: STAGE_LABEL[stage],
    unitTitle: u.title ?? "",
    stageTitle: u.stages?.[nextIdx]?.title ?? "",
    nextStageNo: nextIdx + 1,
    completed: rankCompleted,
    lastActiveAt,
    to: `${base}/semester/${o.semId}/unit/${u.id}/stage/${nextIdx}${publisherQuery}`,
  };
}

/**
 * 从 currentUnit 起在有序单元表里向后走,返回第一个"还没通关"单元的下一关目标。
 * 通关自动前进:当前单元关全绿 → 顺延下一单元第1关;全部通关 → 停最后一单元最后一关。
 */
function resolveForward(
  stage: ContinueStage,
  base: string,
  persist: Persistish,
  ordered: OrderedUnit[],
  publisherQueryFor: (unitId: string) => string,
): ContinueTarget | null {
  const cur = persist.currentUnit;
  if (!cur) return null;
  const list = ordered.filter((o) => isReachable(o.unit) && (o.unit.stages?.length ?? 0) > 0);
  const startIdx = list.findIndex((o) => o.unit.id === cur);
  if (startIdx < 0) return null; // 交给 legacy 兜底
  const startCompleted = completedCount(persist, cur);
  if (startCompleted <= 0) return null; // 起点都没开始 → 不显示「继续」

  for (let i = startIdx; i < list.length; i++) {
    const o = list[i];
    const total = o.unit.stages?.length ?? 0;
    const done = completedCount(persist, o.unit.id);
    if (done < total) {
      const nextIdx = Math.min(done, total - 1); // 下一个未完成关(新单元 done=0 → 第1关)
      return makeTarget(stage, base, o, nextIdx, startCompleted, persist.lastActiveAt ?? 0, publisherQueryFor(o.unit.id));
    }
    // 该单元已通关 → 继续看下一单元
  }
  // 边界:最后一课收尾——currentUnit 起全部通关。停在最后一个可达单元最后一关。
  const last = list[list.length - 1];
  const lastTotal = last.unit.stages?.length ?? 0;
  return makeTarget(stage, base, last, Math.max(0, lastTotal - 1), startCompleted, persist.lastActiveAt ?? 0, publisherQueryFor(last.unit.id));
}

/** 老用户兜底:currentUnit 不在可达有序表 → 就地在该单元内定位下一关(旧逻辑)。 */
function resolveLegacy(
  stage: ContinueStage,
  base: string,
  persist: Persistish,
  unit: UnitLike | null,
  publisherQuery: string,
): ContinueTarget | null {
  const unitId = persist.currentUnit;
  const semId = persist.currentSemester;
  if (!unitId || !semId || !unit) return null;
  const total = unit.stages?.length ?? 0;
  if (total === 0) return null;
  const completed = completedCount(persist, unitId);
  if (completed <= 0) return null;
  const nextIdx = Math.min(completed, total - 1);
  return makeTarget(stage, base, { semId, unit }, nextIdx, completed, persist.lastActiveAt ?? 0, publisherQuery);
}

function orderedUnitsPrimary(grade: number): OrderedUnit[] {
  const out: OrderedUnit[] = [];
  for (const semId of primarySemesterIds(grade as never)) {
    const s = findPrimarySemester(semId);
    for (const u of s?.units ?? []) out.push({ semId, unit: u as UnitLike });
  }
  return out;
}

function orderedUnitsJunior(grade: number): OrderedUnit[] {
  const out: OrderedUnit[] = [];
  for (const semId of juniorSemesterIds(grade as never)) {
    const s = findJuniorSemester(semId);
    for (const u of s?.units ?? []) out.push({ semId, unit: u as UnitLike });
  }
  return out;
}

function orderedUnitsGaokao(grade: number, publisher: Publisher): OrderedUnit[] {
  const out: OrderedUnit[] = [];
  for (const semId of gaokaoSemesterIds(grade as never, publisher)) {
    const s = findGaokaoSemester(semId, publisher);
    for (const u of s?.units ?? []) out.push({ semId, unit: u as UnitLike });
  }
  return out;
}

function candidatesFor(stage: ContinueStage): ContinueTarget[] {
  const out: ContinueTarget[] = [];
  try {
    if (stage === "primary") {
      for (const g of [3, 4, 5, 6]) {
        const p = loadPrimary(g as never) as Persistish;
        const base = `/primary/hub/${g}`;
        const t =
          resolveForward("primary", base, p, orderedUnitsPrimary(g), () => "") ??
          resolveLegacy("primary", base, p, findPrimaryUnit(p.currentUnit ?? "") as UnitLike | null, "");
        if (t) out.push(t);
      }
    } else if (stage === "junior") {
      for (const g of [7, 8, 9]) {
        const p = loadJunior(g as never) as Persistish;
        const base = `/junior/hub/${g}`;
        // 人教单元不加参(零回归);外研社单元(wy* 前缀)补 ?publisher=fltrp。
        const qFor = (uid: string) => (juniorPublisher(uid) === "pep" ? "" : `?publisher=${juniorPublisher(uid)}`);
        const t =
          resolveForward("junior", base, p, orderedUnitsJunior(g), qFor) ??
          resolveLegacy("junior", base, p, findJuniorUnit(p.currentUnit ?? "") as UnitLike | null, qFor(p.currentUnit ?? ""));
        if (t) out.push(t);
      }
    } else {
      for (const g of [1, 2, 3]) {
        const p = loadGaokao(g as never) as Persistish;
        const base = `/gaokao/hub/${g}`;
        const pub = gaokaoPublisher(p.currentUnit ?? "");
        const qFor = (uid: string) => (gaokaoPublisher(uid) === "pep" ? "" : `?publisher=${gaokaoPublisher(uid)}`);
        const t =
          resolveForward("senior", base, p, orderedUnitsGaokao(g, pub), qFor) ??
          resolveLegacy("senior", base, p, findGaokaoUnit(p.currentUnit ?? "", pub) as UnitLike | null, qFor(p.currentUnit ?? ""));
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
