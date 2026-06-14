/**
 * 拼写规范化:把英式↔美式变体归一,判分时两侧都规范化后比较 → 变体都算对。
 * -our/-re 用对照表(避免 four→for / are→aer 误伤);-ise/-ize 用安全后缀规则。
 * 词汇游戏判分共用(听写 / guided 拼写 + 填空)。
 */
const SPELLING_CANON: Record<string, string> = {
  colour: "color", colours: "colors", coloured: "colored", colourful: "colorful",
  favour: "favor", favourite: "favorite", favourites: "favorites",
  neighbour: "neighbor", neighbours: "neighbors", neighbourhood: "neighborhood",
  flavour: "flavor", honour: "honor", humour: "humor", labour: "labor",
  behaviour: "behavior", harbour: "harbor", rumour: "rumor",
  centre: "center", theatre: "theater", metre: "meter", litre: "liter",
  fibre: "fiber", kilometre: "kilometer",
  grey: "gray", practise: "practice", programme: "program", defence: "defense",
  travelling: "traveling", traveller: "traveler", cancelled: "canceled",
  jewellery: "jewelry", pyjamas: "pajamas", catalogue: "catalog", dialogue: "dialog",
  tyre: "tire", plough: "plow", mum: "mom", maths: "math",
};

export function canonSpelling(s: string): string {
  const w = (s || "").trim().toLowerCase();
  if (SPELLING_CANON[w]) return SPELLING_CANON[w];
  // 英式 -ise/-isation → 美式 -ize/-ization(两侧同样处理,变体即可互通)
  return w
    .replace(/isation$/, "ization")
    .replace(/ising$/, "izing")
    .replace(/ised$/, "ized")
    .replace(/ise$/, "ize");
}
