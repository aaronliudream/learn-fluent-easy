/**
 * Sight Words 年级渐进网关
 * ----------------------------------------
 * 教学法依据(Fry's 渐进表 EFL 调整):
 *   一年级:Fry's 1-50  → 只显示组 1+组 2,后两组锁住
 *   二年级:Fry's 1-100 → 全部 4 组
 *   三年级:Fry's 1-100 已学过,转为"复习模块"
 *   四年级:同三年级,主路径淡出
 *   五-六年级:孩子应能流畅阅读,主路径不显示 Sight Words
 *
 * 单一数据源:`localStorage["primary:lastGrade"]`(由 Primary.tsx 写入)
 */

export type SightWordsGradePolicy = {
  /** 在 /primary/sight-words 内可见的 Fry 组数(按 sortOrder,不含预习组) */
  visibleGroupCount: number;
  /** G1:显示「三年级预习」组,与 Fry 1–2 并行,不卡游戏门槛 */
  showPrepGroup: boolean;
  /** 是否标注为"复习模块"(3-4 年级) */
  reviewMode: boolean;
  /** 是否在主路径(Primary 主页累计卡 / Phonics 底部入口)显示入口 */
  showInMain: boolean;
};

/** 读取当前年级,默认 2(与 Primary.tsx 选择前的安全值一致) */
export function getCurrentGrade(): number {
  if (typeof window === "undefined") return 2;
  const raw = window.localStorage.getItem("primary:lastGrade");
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 6 ? n : 2;
}

export function getSightWordsPolicy(grade: number): SightWordsGradePolicy {
  if (grade <= 1) return { visibleGroupCount: 2, showPrepGroup: true, reviewMode: false, showInMain: true };
  if (grade <= 2) return { visibleGroupCount: 4, showPrepGroup: false, reviewMode: false, showInMain: true };
  if (grade <= 4) return { visibleGroupCount: 4, showPrepGroup: false, reviewMode: true, showInMain: false };
  // 5-6 年级:主路径完全淡化,页面也清空(应已掌握)
  return { visibleGroupCount: 0, showPrepGroup: false, reviewMode: true, showInMain: false };
}

/** 单词游戏冷启动门控只计 Fry 组(不含预习组) */
export const FRY_GROUP_IDS_FOR_GAMES = ["sg1", "sg2"] as const;

/** Phonics 底部 / Primary 主页是否显示 Sight Words 入口(grade<=4) */
export function shouldShowSightWordsEntry(grade: number): boolean {
  return grade <= 4;
}
