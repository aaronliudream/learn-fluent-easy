/**
 * Phonics 智能干扰项映射 — 同一题型下,干扰项必须在发音/字形上"容易混淆",
 * 这样才真正能测出孩子是否区分得了 /p/ 与 /b/、/m/ 与 /n/ 等近似音。
 *
 * key   = phonics_id (与 src/data/primaryPhonics.ts 中的 id 对齐)
 * value = 同样以 phonics_id 列出的"易混淆"组(按混淆程度从高到低)
 *
 * 说明:
 *  - 主要按"塞音清浊对"(p/b、t/d、k/g)、"鼻音"(m/n)、"擦音"(f/v、s/z、sh/ch)、
 *    "近似元音"(a/e/i、o/u)分组。
 *  - 当孩子还没学到的音不在数据中时,buildDistractorPool 会回退到同组其他音。
 */
export const PHONICS_CONFUSION: Record<string, string[]> = {
  // 塞音 stops
  p_p: ["p_b", "p_d", "p_t"],
  p_b: ["p_p", "p_d", "p_v"],
  p_t: ["p_d", "p_k", "p_p"],
  p_d: ["p_t", "p_b", "p_g"],
  p_k: ["p_t", "p_g", "p_c"],
  p_g: ["p_k", "p_d", "p_b"],
  p_c: ["p_k", "p_s", "p_g"],
  p_q: ["p_k", "p_c", "p_g"],
  p_x: ["p_s", "p_z", "p_k"],

  // 鼻音 / 流音 nasals & liquids
  p_m: ["p_n", "p_b", "p_p"],
  p_n: ["p_m", "p_l", "p_r"],
  p_l: ["p_r", "p_n", "p_w"],
  p_r: ["p_l", "p_w", "p_n"],
  p_w: ["p_v", "p_r", "p_l"],
  p_y: ["p_w", "p_l", "p_r"],

  // 擦音 fricatives
  p_f: ["p_v", "p_th", "p_s"],
  p_v: ["p_f", "p_b", "p_w"],
  p_s: ["p_z", "p_c", "p_x"],
  p_z: ["p_s", "p_x", "p_v"],
  p_h: ["p_f", "p_th", "p_s"],
  p_j: ["p_y", "p_ch", "p_g"],

  // 双字符辅音 digraphs
  p_sh: ["p_ch", "p_th", "p_s"],
  p_ch: ["p_sh", "p_j", "p_t"],
  p_th: ["p_f", "p_s", "p_sh"],
  p_ng: ["p_n", "p_m", "p_g"],
  p_ck: ["p_k", "p_c", "p_g"],

  // 短元音 short vowels
  p_a: ["p_e", "p_i", "p_u"],
  p_e: ["p_a", "p_i", "p_o"],
  p_i: ["p_e", "p_a", "p_y"],
  p_o: ["p_u", "p_a", "p_e"],
  p_u: ["p_o", "p_a", "p_i"],

  // 长元音 / 元音组合 (容错: 没列到的会回退)
  p_ai: ["p_ay", "p_a", "p_e"],
  p_ay: ["p_ai", "p_a", "p_e"],
  p_ee: ["p_ea", "p_i", "p_e"],
  p_ea: ["p_ee", "p_i", "p_e"],
  p_oa: ["p_o", "p_ow", "p_u"],
  p_ow: ["p_ou", "p_oa", "p_o"],
  p_ou: ["p_ow", "p_o", "p_u"],
  p_oo: ["p_u", "p_o", "p_ow"],
  p_oi: ["p_oy", "p_o", "p_i"],
  p_oy: ["p_oi", "p_o", "p_y"],
  p_ar: ["p_or", "p_a", "p_ir"],
  p_or: ["p_ar", "p_o", "p_ur"],
  p_ir: ["p_er", "p_ur", "p_ar"],
  p_er: ["p_ir", "p_ur", "p_ar"],
  p_ur: ["p_er", "p_ir", "p_ar"],
};

/**
 * 构造一组 N 个干扰项 ID.
 *  1) 先取 PHONICS_CONFUSION 中预设的近似音
 *  2) 不足时,从 fallbackPool(通常是同组其他音)随机补齐
 *  3) 始终排除 targetId 自己
 */
export function buildDistractorPool(
  targetId: string,
  fallbackPool: string[],
  n = 3
): string[] {
  const out: string[] = [];
  const seen = new Set<string>([targetId]);

  for (const id of PHONICS_CONFUSION[targetId] ?? []) {
    if (seen.has(id)) continue;
    if (!fallbackPool.includes(id)) continue; // 干扰项必须真实存在
    out.push(id);
    seen.add(id);
    if (out.length >= n) return out;
  }
  // 不够则随机补齐
  const rest = fallbackPool.filter((id) => !seen.has(id));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  for (const id of rest) {
    out.push(id);
    if (out.length >= n) break;
  }
  return out;
}