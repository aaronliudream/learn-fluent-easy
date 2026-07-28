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
 * ★tagline 只写教材版本年份,不写任何统计数字★(Aaron 2026-07-27 定稿)
 * 年份出处:**Aaron 提供的三本课本封面照片上的审定徽章年份** —— 人教 2019 / 上外 2020 / 外研社 2019。
 * 这个出处在仓库里没有对应数据,`qa:cards` 闸门**核不了年份真伪,只核格式与风格一致**;
 * 要改年份必须回到封面照片核实,不许凭印象改。
 *
 * 上一版写的是「7 册 · N 单元 · 6 大专项」,那些数字有 DB 兜底(census 脚本仍在,
 * `scripts/qa/gaokao-content-census{,2}.mjs`),但按定稿整串删除 —— 卡片只留版本年份一句。
 * 仍然生效的铁律:**卡片文案里禁止出现只活在 DB 里的数字**(改库不触发闸门,写了必然长歪),
 * 也禁止凭记忆写「内容陆续上线」这类进度话术(实测 21 册全满,那句话是假的)。
 */
export const PUBLISHER_META: Record<Publisher, { name: string; sub: string; emoji: string; tagline: string }> = {
  pep: { name: "人教版", sub: "人民教育出版社", emoji: "📕", tagline: "课本同步（2019版）" },
  sufe: { name: "上外版", sub: "上海外语教育出版社", emoji: "📘", tagline: "课本同步（2020版）" },
  fltrp: { name: "外研社版", sub: "外语教学与研究出版社", emoji: "📗", tagline: "课本同步（2019版）" },
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
