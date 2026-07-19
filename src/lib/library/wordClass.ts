/**
 * 图书馆词类判定(单一真相):
 *  · 复习干扰项过滤 —— 实词题不收虚词干扰(reviewQuestions.ts)。
 *  · 虚词不给收藏 —— 精读点开虚词能看释义,但不渲染收藏按钮(TappableLine.tsx);复习也跳过已收藏的虚词。
 * read-v1 卡 pos 形如 "v." "n." "adj." "conj." "prep." "art."。
 * 两道防线:① pos 属虚词大类;② 词形在 GRAMMAR_TERMS 表 —— 因为 pos 可能标错(have/is 作助动词却标 v.)。
 */

// 虚词类 pos(连词/介词/冠词/代词/助动/限定/数/感叹/情态)。
export const FUNC_POS = new Set([
  "conj", "prep", "art", "pron", "aux", "det", "num", "interj", "int", "particle", "modal",
]);

// 兜底词形表:少数虚词卡被标成 v.(have/is 作助动词)或本就是常见功能词。
export const GRAMMAR_TERMS = new Set(
  ("the a an of to in on at and or but nor for so yet with as by from because although though while since unless " +
    "if then than that this these those is are was were be been being am do does did have has had will would shall " +
    "should can could may might must not no").split(" "),
);

const norm = (s: string) => s.trim().toLowerCase();
export const normPos = (pos: string) => String(pos || "").toLowerCase().replace(/[^a-z]/g, "");

export type Fine = "noun" | "verb" | "adj" | "adv" | "func" | "phrase" | "other";
export type Coarse = "content" | "func" | "phrase" | "other";

export function posFine(pos: string, term: string): Fine {
  if (GRAMMAR_TERMS.has(norm(term))) return "func"; // 词形防线优先(pos 可能标错)
  const p = normPos(pos);
  if (p === "n" || p === "noun") return "noun";
  if (p === "v" || p === "verb" || p === "vt" || p === "vi") return "verb";
  if (p === "adj" || p === "a") return "adj";
  if (p === "adv" || p === "ad") return "adv";
  if (FUNC_POS.has(p)) return "func";
  if (p === "phrase" || p === "phr" || p === "idiom") return "phrase";
  return "other"; // 词性未知 → 不参与过滤(宁松勿误杀)
}

export function posCoarse(f: Fine): Coarse {
  if (f === "func") return "func";
  if (f === "phrase") return "phrase";
  if (f === "other") return "other";
  return "content"; // noun/verb/adj/adv
}

/** 虚词判定:词类是虚词大类,或词形在语法表(双防线)。用于"不给收藏 / 复习跳过"。 */
export function isFunctionWord(term: string, pos: string | null | undefined): boolean {
  return posFine(pos ?? "", term) === "func";
}
