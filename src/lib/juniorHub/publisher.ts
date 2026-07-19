/**
 * 初中专区·出版社(publisher)分叉 —— 统一解析。镜像 gaokaoHub/publisher.ts。
 *
 * 背景:初中内容 9 张表(junior_vocab/grammar_points/reading/listening_exercises/
 * writing_prompts 等)历史行 publisher = 'junior'(人教)。新增外研社 = 'junior_fltrp'。
 *
 * ★铁律★:
 * - 人教(pep)= 默认;老 URL 不带 ?publisher= → pep,零回归。
 * - 课本同步 8 关按 volume(wy*)天然隔离,不靠此模块;此模块只服务
 *   ①出版社选择页 ②5 个专项列表页 publisher 过滤 ③hub 链接透传。
 * - DB publisher 列取值走 dbPublisherFor():人教 = 历史值 'junior'(不可改)。
 */
export type JuniorPublisher = "pep" | "fltrp";
export const DEFAULT_JUNIOR_PUBLISHER: JuniorPublisher = "pep";
export const JUNIOR_PUBLISHERS: JuniorPublisher[] = ["pep", "fltrp"];

export const JUNIOR_PUBLISHER_META: Record<
  JuniorPublisher,
  { name: string; sub: string; emoji: string; tagline: string }
> = {
  pep: { name: "人教版", sub: "人民教育出版社", emoji: "📕", tagline: "课本同步 7-9 年级 · 8 关闯关 · 中考真题" },
  fltrp: { name: "外研社版", sub: "外语教学与研究出版社", emoji: "📗", tagline: "课本同步(2024 新版)· 6 大专项,内容陆续上线" },
};

/** 选择页卡片顺序。 */
export const JUNIOR_PUBLISHER_ORDER: JuniorPublisher[] = ["pep", "fltrp"];

/** DB 里 junior_* 表 publisher 列取值。人教 = 历史值 'junior'(不可改)。 */
export function dbPublisherFor(p: JuniorPublisher): string {
  return p === "fltrp" ? "junior_fltrp" : "junior";
}

/** pep(默认)→ 不加参(老书签零回归);fltrp → 追加。 */
export function withJuniorPublisher(path: string, p: JuniorPublisher): string {
  if (p === DEFAULT_JUNIOR_PUBLISHER) return path;
  return path + (path.includes("?") ? "&" : "?") + "publisher=" + p;
}

/** 从 URL ?publisher= 取;非法/缺省 → 'pep'。 */
export function readJuniorPublisherParam(sp?: URLSearchParams | null): JuniorPublisher {
  const v = sp?.get("publisher");
  return JUNIOR_PUBLISHERS.includes(v as JuniorPublisher) ? (v as JuniorPublisher) : DEFAULT_JUNIOR_PUBLISHER;
}
