/**
 * Sight Word 干扰项映射 — 同一题型下,干扰项必须在拼写/视觉/词性上"容易混淆".
 * 原则:
 *  - 同首字母 + 长度相近优先(the / this / that / them)
 *  - 同词性次之(冠词配冠词,介词配介词)
 *  - 不足时回退到同组其他词
 */
export const SIGHT_WORD_CONFUSION: Record<string, string[]> = {
  // th- 系列
  sw_the: ["sw_this", "sw_that", "sw_they"],
  sw_this: ["sw_the", "sw_that", "sw_these"],
  sw_that: ["sw_this", "sw_the", "sw_what"],
  sw_they: ["sw_the", "sw_them", "sw_their"],
  sw_them: ["sw_they", "sw_then", "sw_their"],
  sw_then: ["sw_them", "sw_when", "sw_their"],
  sw_their: ["sw_there", "sw_they", "sw_them"],
  sw_there: ["sw_their", "sw_then", "sw_were"],
  sw_these: ["sw_those", "sw_this", "sw_the"],
  sw_those: ["sw_these", "sw_this", "sw_them"],

  // a / an / and / at
  sw_a: ["sw_an", "sw_at", "sw_and"],
  sw_an: ["sw_a", "sw_at", "sw_and"],
  sw_and: ["sw_an", "sw_a", "sw_at"],
  sw_at: ["sw_a", "sw_an", "sw_as"],
  sw_as: ["sw_at", "sw_a", "sw_is"],

  // is / it / in / if
  sw_is: ["sw_it", "sw_in", "sw_if"],
  sw_it: ["sw_is", "sw_in", "sw_if"],
  sw_in: ["sw_it", "sw_is", "sw_on"],
  sw_if: ["sw_is", "sw_it", "sw_of"],
  sw_of: ["sw_or", "sw_on", "sw_if"],
  sw_on: ["sw_or", "sw_in", "sw_of"],
  sw_or: ["sw_of", "sw_on", "sw_for"],

  // wh- 系列
  sw_what: ["sw_when", "sw_where", "sw_who"],
  sw_when: ["sw_what", "sw_where", "sw_then"],
  sw_where: ["sw_were", "sw_what", "sw_when"],
  sw_who: ["sw_how", "sw_what", "sw_why"],
  sw_why: ["sw_who", "sw_how", "sw_what"],
  sw_how: ["sw_who", "sw_now", "sw_why"],

  // 代词
  sw_he: ["sw_she", "sw_we", "sw_be"],
  sw_she: ["sw_he", "sw_we", "sw_the"],
  sw_we: ["sw_he", "sw_she", "sw_me"],
  sw_me: ["sw_we", "sw_he", "sw_my"],
  sw_my: ["sw_me", "sw_by", "sw_we"],
  sw_you: ["sw_your", "sw_yes", "sw_use"],
  sw_your: ["sw_you", "sw_yes", "sw_our"],
  sw_I: ["sw_a", "sw_in", "sw_is"],

  // 动词
  sw_was: ["sw_were", "sw_has", "sw_is"],
  sw_were: ["sw_was", "sw_where", "sw_here"],
  sw_have: ["sw_has", "sw_had", "sw_give"],
  sw_has: ["sw_have", "sw_had", "sw_was"],
  sw_had: ["sw_has", "sw_have", "sw_and"],
  sw_can: ["sw_man", "sw_ran", "sw_an"],
  sw_will: ["sw_with", "sw_well", "sw_all"],
  sw_do: ["sw_to", "sw_so", "sw_no"],
  sw_does: ["sw_do", "sw_done", "sw_goes"],
  sw_done: ["sw_does", "sw_do", "sw_gone"],

  // for / from / by
  sw_for: ["sw_from", "sw_or", "sw_four"],
  sw_from: ["sw_for", "sw_form", "sw_some"],
  sw_by: ["sw_my", "sw_be", "sw_buy"],
  sw_be: ["sw_by", "sw_he", "sw_we"],

  // here / there / where
  sw_here: ["sw_there", "sw_were", "sw_her"],
  sw_her: ["sw_here", "sw_he", "sw_hers"],

  // some / come / one
  sw_some: ["sw_come", "sw_same", "sw_home"],
  sw_come: ["sw_some", "sw_came", "sw_home"],
  sw_one: ["sw_once", "sw_on", "sw_only"],
  sw_two: ["sw_to", "sw_too", "sw_who"],

  // up / us / use / our / out
  sw_up: ["sw_us", "sw_use", "sw_out"],
  sw_us: ["sw_up", "sw_use", "sw_our"],
  sw_use: ["sw_us", "sw_up", "sw_our"],
  sw_our: ["sw_out", "sw_us", "sw_your"],
  sw_out: ["sw_our", "sw_about", "sw_up"],

  // 其它
  sw_said: ["sw_says", "sw_make", "sw_made"],
  sw_says: ["sw_said", "sw_save", "sw_makes"],
  sw_make: ["sw_made", "sw_take", "sw_came"],
  sw_made: ["sw_make", "sw_take", "sw_came"],
  sw_first: ["sw_find", "sw_for", "sw_from"],
  sw_find: ["sw_first", "sw_kind", "sw_mind"],
  sw_long: ["sw_among", "sw_along", "sw_strong"],
  sw_down: ["sw_now", "sw_own", "sw_how"],
  sw_now: ["sw_how", "sw_down", "sw_new"],
  sw_new: ["sw_now", "sw_few", "sw_nine"],
  sw_only: ["sw_one", "sw_old", "sw_open"],
  sw_about: ["sw_above", "sw_around", "sw_after"],
  sw_after: ["sw_about", "sw_again", "sw_other"],
  sw_again: ["sw_against", "sw_after", "sw_about"],
  sw_other: ["sw_over", "sw_under", "sw_after"],
  sw_over: ["sw_other", "sw_ever", "sw_under"],
  sw_into: ["sw_in", "sw_unto", "sw_to"],
};

/** 构造 N 个干扰项词形(返回 word 字符串). */
export function buildSightWordDistractors(
  targetId: string,
  fallbackPool: { id: string; word: string }[],
  n = 3
): string[] {
  const out: string[] = [];
  const seen = new Set<string>([targetId]);
  const targetWord = fallbackPool.find((w) => w.id === targetId)?.word;
  if (targetWord) seen.add(targetWord);

  const idToWord = new Map(fallbackPool.map((w) => [w.id, w.word]));
  for (const id of SIGHT_WORD_CONFUSION[targetId] ?? []) {
    const w = idToWord.get(id);
    if (!w || seen.has(w)) continue;
    out.push(w);
    seen.add(w);
    if (out.length >= n) return out;
  }
  // 不足回退到 fallbackPool 随机
  const rest = fallbackPool.filter((p) => !seen.has(p.word));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  for (const p of rest) {
    out.push(p.word);
    seen.add(p.word);
    if (out.length >= n) break;
  }
  return out;
}
