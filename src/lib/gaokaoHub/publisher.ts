/**
 * 高中专区·出版社(publisher)分叉 —— 统一解析。
 *
 * 背景:9 张内容表(junior_vocab/grammar_points/reading/cloze/listening_exercises/
 * writing_prompts/grammar_tips/context_questions 等)已加 publisher 列(Phase 1)。
 * 高中人教 = 'pep',将来加 'fltrp'(外研社)/'sufe'(上外)。初中行 = 'junior'。
 *
 * ★铁律★:
 * - 只服务高中 /gaokao 侧。初中 /junior 路径**绝不传 publisher**(返回 null → 查询不加过滤,字节级不变)。
 * - 取不到 = 默认 'pep'(老 URL 不带 publisher → 人教,零回归)。
 * - 进度表/word_id 与本模块无关,不碰。
 */
export type Publisher = "pep" | "fltrp" | "sufe";

export const DEFAULT_PUBLISHER: Publisher = "pep";
export const SENIOR_PUBLISHERS: Publisher[] = ["pep", "fltrp", "sufe"];

/**
 * 出版社选择页元数据(封面/文案各异,渲染逻辑同一套)。顺序 = 选择页卡片顺序。
 *
 * ★tagline 里的每个数字都必须有 DB 兜底,禁止凭记忆写★
 * 现值来自 2026-07-27 实测(`scripts/qa/gaokao-content-census.mjs`,改文案前重跑一遍):
 *   人教  7 册 36 单元 · 词 1706 · 语法 108 点/2160 题 · 阅读 216 篇 · 完形 216 · 听力 216(缺音频 0)
 *   上外  7 册 28 单元 · 词 1331 · 语法  87 点/1740 题 · 阅读 168 篇 · 完形 168 · 听力 168(缺音频 0)
 *   外研社 7 册 42 单元 · 词 2011 · 语法 126 点/2520 题 · 阅读 252 篇 · 完形 252 · 听力 252(缺音频 0)
 * 归一到单元后三家完全一致(每单元 6 阅读/6 完形/6 听力/3 语法点),
 * 总量差异 100% 来自教材本身的单元数 —— **不是灌库进度差**,所以谁的卡上都不该再写「内容陆续上线」。
 * 「6 大专项」= 词汇/语法/阅读/完形/听力/写作,三家齐备(上外/外研社原先写 5 是少报了自己)。
 */
export const PUBLISHER_META: Record<Publisher, { name: string; sub: string; emoji: string; tagline: string }> = {
  pep: { name: "人教版", sub: "人民教育出版社", emoji: "📕", tagline: "课本同步 7 册 · 36 单元 · 6 大专项" },
  sufe: { name: "上外版", sub: "上海外语教育出版社", emoji: "📘", tagline: "课本同步 7 册 · 28 单元 · 6 大专项" },
  fltrp: { name: "外研社版", sub: "外语教学与研究出版社", emoji: "📗", tagline: "课本同步 7 册 · 42 单元 · 6 大专项" },
};
export const PUBLISHER_ORDER: Publisher[] = ["pep", "sufe", "fltrp"];

/** 给路径带上 publisher 参数。pep(默认)→ 不加(保持干净 URL + 老书签零回归);其它 → 追加。 */
export function withPublisher(path: string, publisher: Publisher): string {
  if (publisher === DEFAULT_PUBLISHER) return path;
  return path + (path.includes("?") ? "&" : "?") + "publisher=" + publisher;
}

/** 从 URL ?publisher= 取(Phase 3 选择页用);非法/缺省 → 'pep'。 */
export function readPublisherParam(sp?: URLSearchParams | null): Publisher {
  const v = sp?.get("publisher");
  return SENIOR_PUBLISHERS.includes(v as Publisher) ? (v as Publisher) : DEFAULT_PUBLISHER;
}

/**
 * 共用组件按"入口"分流:
 * - basePath 以 /gaokao 开头(高中壳)→ 返回高中 publisher(默认 pep,可被 ?publisher= 覆盖)。
 * - 其它(/junior 等)→ null：查询**不加 publisher 过滤**,初中路径保持现状。
 */
export function publisherForBasePath(basePath?: string, sp?: URLSearchParams | null): Publisher | null {
  if (basePath && basePath.startsWith("/gaokao")) return readPublisherParam(sp);
  return null;
}
