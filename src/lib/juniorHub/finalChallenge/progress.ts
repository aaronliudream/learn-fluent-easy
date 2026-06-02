/**
 * 初中《期中/期末闯关》进度的「册别隔离」薄封装。
 *
 * ── 为什么需要它 ────────────────────────────────────────────────
 * 共享的 primaryHub 进度键是 `fc_progress_<scope>_g<grade>`,**只按年级分,不含册别**。
 * 小学每个年级实际只玩一册,所以没问题;但初中同一年级(如七年级 g7)同时有
 * 「期中」(v1,3 关)和「期末」(v2,5 关)两套**完全独立**的关卡,而且
 * **关号 1–3 在两册里题型还不一样**(v1 关2=听力理解 dialogue_response,
 * v2 关2=听音辨词 listen_and_choose_word)。若两册共用同一个 g7 进度 blob,
 * 期中关2 拿的星会错误地点亮期末关2,通关判定也会串 → 必须分册存。
 *
 * ── 编码规则(魔法数说明)────────────────────────────────────────
 * 不改 primary 的 progress.ts,只在「存/读进度、记错题」时把传给它的 grade
 * 换成一个「册别编码年级」:
 *     v1(上册/期中)→ 真实 grade            (g7→7、g8→8、g9→9)
 *     v2(下册/期末)→ 真实 grade + VOLUME_OFFSET=100 (g7→107、g8→108、g9→109)
 * 取题(questionBank)、路由(/junior/hub/:grade/...)、界面显示的「关 N」一律
 * 用**真实 grade / 真实关号**,只有 localStorage 进度键里的 grade 被偏移。
 *
 * 为什么是 +100:初中真实年级 7–9,小学 3–6,偏移 100 后 v2 落在 107–109,
 * 与小学 g3–6、初中 v1 的 7–9 三者互不重叠。将来若某年级要拆出第 3 套卷,
 * 按 `真实grade + 册序*VOLUME_OFFSET` 继续扩(v3→+200)即可,不会撞键。
 */

/** 册别偏移量。见文件头「编码规则」。改这个数会让历史进度对不上,谨慎。 */
const VOLUME_OFFSET = 100;

/** 真实年级 + 册别 → 进度存储用的「册别编码年级」。仅用于 localStorage 键,不用于取题/路由/显示。 */
export function fcProgressGrade(grade: number, volume: "v1" | "v2"): number {
  return volume === "v2" ? grade + VOLUME_OFFSET : grade;
}

/** 读当前册别(入口卡进关前写入 sessionStorage)。读不到默认 v1(期中)。 */
export function readJuniorVolume(): "v1" | "v2" {
  try {
    return sessionStorage.getItem("fc:jr:volume") === "v2" ? "v2" : "v1";
  } catch {
    return "v1";
  }
}
