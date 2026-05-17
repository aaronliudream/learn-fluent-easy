/**
 * Sight Words / PEP 词汇年级网关
 * ----------------------------------------
 * 一年级–二年级:三年级上册 PEP 预习
 * 三年级–六年级:对应上下册全部单元
 */

export type SightWordsGradePolicy = {
  /** 可见单元组数；999 表示当前年级全部 PEP 单元 */
  visibleGroupCount: number;
  /** 是否标注为复习模块(3–4 年级) */
  reviewMode: boolean;
  /** 是否在 Primary 主页累计卡显示入口 */
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
  if (grade <= 2) return { visibleGroupCount: 999, reviewMode: false, showInMain: true };
  if (grade <= 4) return { visibleGroupCount: 999, reviewMode: true, showInMain: false };
  return { visibleGroupCount: 999, reviewMode: false, showInMain: true };
}

/** Primary 主页 / Phonics 底部是否显示 PEP 词汇入口 */
export function shouldShowSightWordsEntry(grade: number): boolean {
  return grade <= 6;
}
