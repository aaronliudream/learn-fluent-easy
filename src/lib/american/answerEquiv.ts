/**
 * 美语课程 · 句型转换(transform)答案等价判定。
 *
 * 现状:关5/10 的 transform 走"显示参考答案 → 学生自评"(QuizRunner reveal),运行时不自动判分。
 * 本模块提供**规范化 + 等价比较**,供:①题库机审 transform 桶复扫(缩写/that 等价不再误报风险);
 * ②将来若改为键入自动判分,直接复用(答对口径 = 忽略大小写/首尾标点/空白 + 缩写≡全写 + that 可省)。
 *
 * 判定放宽三条(Aaron 拍板):
 *  1. 缩写 ≡ 全写:don't≡do not / isn't≡is not / it's≡it is / I'll≡I will …(双向,以"折叠成缩写"为规范形)。
 *  2. that 可省:said (that) X / the book (that) I bought —— 含/省 that 均判对。
 *  3. 首尾句末标点 + 首字母大小写 + 多余空白 已忽略。
 */

/** 全写 → 缩写 折叠对(规范形取缩写,消除全写/缩写差异)。顺序:先长(cannot/can not)后短。 */
const FOLD: [RegExp, string][] = [
  [/\bcan not\b/g, "can't"], [/\bcannot\b/g, "can't"], [/\bcan not\b/g, "can't"],
  [/\bdo not\b/g, "don't"], [/\bdoes not\b/g, "doesn't"], [/\bdid not\b/g, "didn't"],
  [/\bis not\b/g, "isn't"], [/\bare not\b/g, "aren't"], [/\bam not\b/g, "am not"],
  [/\bwas not\b/g, "wasn't"], [/\bwere not\b/g, "weren't"],
  [/\bwill not\b/g, "won't"], [/\bwould not\b/g, "wouldn't"], [/\bshould not\b/g, "shouldn't"],
  [/\bcould not\b/g, "couldn't"], [/\bmust not\b/g, "mustn't"], [/\bneed not\b/g, "needn't"],
  [/\bhave not\b/g, "haven't"], [/\bhas not\b/g, "hasn't"], [/\bhad not\b/g, "hadn't"],
  [/\blet us\b/g, "let's"],
  [/\bi am\b/g, "i'm"],
  [/\byou are\b/g, "you're"], [/\bwe are\b/g, "we're"], [/\bthey are\b/g, "they're"],
  [/\bit is\b/g, "it's"], [/\bhe is\b/g, "he's"], [/\bshe is\b/g, "she's"],
  [/\bthat is\b/g, "that's"], [/\bthere is\b/g, "there's"], [/\bhere is\b/g, "here's"],
  [/\bwhat is\b/g, "what's"], [/\bwho is\b/g, "who's"], [/\bwhere is\b/g, "where's"], [/\bhow is\b/g, "how's"],
  [/\bi will\b/g, "i'll"], [/\byou will\b/g, "you'll"], [/\bhe will\b/g, "he'll"],
  [/\bshe will\b/g, "she'll"], [/\bwe will\b/g, "we'll"], [/\bthey will\b/g, "they'll"],
  [/\bi have\b/g, "i've"], [/\byou have\b/g, "you've"], [/\bwe have\b/g, "we've"], [/\bthey have\b/g, "they've"],
  [/\bi would\b/g, "i'd"], [/\byou would\b/g, "you'd"],
];

/** 规范化:小写 + 归一撇号 + 去首尾句末标点 + 折叠缩写 + 压缩空白。 */
export function normalizeAnswer(s: string): string {
  let x = (s || "").toLowerCase().replace(/[’‘`]/g, "'");
  x = x.replace(/\s+/g, " ").trim();
  x = x.replace(/[.?!,;:]+$/g, "").trim();      // 去结尾标点(仅句末,句中逗号保留)
  for (const [re, to] of FOLD) x = x.replace(re, to);
  return x.replace(/\s+/g, " ").trim();
}

/** 去可省 that(仅去句中"可省"的关系代词/连接词 that;保护句首指示代词 That 与缩写 that's)。 */
function dropThat(s: string): string {
  return s.replace(/(?<= )that\b(?!')/g, " ").replace(/\s+/g, " ").trim();
}

/** 两答案是否等价(缩写≡全写 + that 可省 + 大小写/标点/空白无关)。 */
export function answersEquivalent(a: string, b: string): boolean {
  const ca = normalizeAnswer(a), cb = normalizeAnswer(b);
  if (ca === cb) return true;
  return dropThat(ca) === dropThat(cb);
}
