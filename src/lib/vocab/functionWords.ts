/**
 * 虚词判定 + 学习顺序比较器。
 *
 * ── 为什么需要 ──────────────────────────────────────────────────
 * 词库按 freq_rank 排,而**英语里最高频的词几乎全是虚词**。
 * 实测(2026-08-10):
 *   中考 1554 词里虚词 124 个(8.0%),但**前 20 个词里占 11 个**;
 *   高考 3583 词里虚词 181 个(5.1%),前 20 个里同样占 11 个。
 * 于是用户点开「中考词汇」,今日学习第一张卡是 **the**,接着是 of / a / to / it。
 *
 * Aaron 2026-08-10 定的处理方式:**虚词照收进词库,但排到学习序列末尾**。
 * 改的是顺序不是词表 —— 覆盖率数字不缩水,随时可逆,不动任何数据。
 *
 * ── 判据 ────────────────────────────────────────────────────────
 * 要求**每一个词性段都是虚词类**才算虚词。
 * 这条"保守"是有意的(方向见下):
 *   to    (prep./adv.)              → 虚词 ✓
 *   that  (adj./conj./pron./adv.)   → **不算**,因为 adj. 不是虚词类
 *   well  (n./v./adj./adv./int.)    → **不算**
 *   be / have / do (v.)             → **不算**,它们是实义动词也是助动词,值得学
 *
 * ⚠️ 方向:这道判据判成"是"就是**降权**。所以宁可漏判(虚词留在前面,顶多没优化),
 *    也不能误判(把实词踩到末尾 = 用户学不到该学的词)。
 *    这与 gates.mjs 里 matchesForm 的 strict 是同一条道理:
 *    **同一个判据,判成"是"会放行还是会拒绝,决定了它该松还是该紧**。
 *
 * ⚠️ 词性表与 `scripts/vocab/prompt-rules.mjs` 的 FUNCTION_POS **必须一致**,
 *    有 `functionWords.test.ts` 读那个文件做同步校验,改一边漏改另一边会红。
 */
export const FUNCTION_POS: ReadonlySet<string> = new Set([
  "conj.", "prep.", "adv.", "int.", "pron.", "aux.", "art.",
]);

export function isFunctionWord(pos: string | null | undefined): boolean {
  const parts = String(pos || "").split("/").map(s => s.trim()).filter(Boolean);
  return parts.length > 0 && parts.every(p => FUNCTION_POS.has(p));
}

/**
 * 学习顺序:实词在前(按词频),虚词整体沉到末尾(内部仍按词频)。
 * freq_rank 为空的排在同类的最后 —— 别让 null 被当成 0 顶到最前。
 */
export function byLearnOrder(
  a: { pos?: string | null; freq_rank?: number | null; headword?: string },
  b: { pos?: string | null; freq_rank?: number | null; headword?: string },
): number {
  const fa = isFunctionWord(a.pos) ? 1 : 0;
  const fb = isFunctionWord(b.pos) ? 1 : 0;
  if (fa !== fb) return fa - fb;
  const ra = a.freq_rank ?? Number.MAX_SAFE_INTEGER;
  const rb = b.freq_rank ?? Number.MAX_SAFE_INTEGER;
  if (ra !== rb) return ra - rb;
  return (a.headword || "").localeCompare(b.headword || "");
}
