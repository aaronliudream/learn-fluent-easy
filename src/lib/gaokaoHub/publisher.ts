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
