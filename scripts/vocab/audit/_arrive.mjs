/**
 * 探针的**到达校验** —— 「报 FAIL 之前必须先证明自己到了要测的位置」。
 *
 * ── 为什么做成共用件而不是靠自觉 ────────────────────────────────
 * "报应用坏之前先怀疑探针"这句话已经栽了**五次**,每次都是同一个形状:
 *   · `text=/正则/` 里写 `\/` 静默匹配不到 → 报"没生效"
 *   · `.last()` 抓到页头固定定位的登录 `<a>` → 量错元素
 *   · `networkidle` 之后才量瞬时动效 → 早演完了
 *   · 冒烟点到了顶部分类标签而不是测验入口 → 把「词块 100 / 习语 50」当成选项报 FAIL
 *   · 冒烟的失败文案清单漏了错误边界的兜底页 → 整页崩溃却判绿
 * 靠"记得怀疑一下"是防不住的 —— 每次都以为这次没问题。
 * 所以 Aaron 2026-08-09 立为机制:**没有到达校验的 FAIL 一律不作数**。
 *
 * 用法:
 *   import { arrive } from "./_arrive.mjs";
 *   const ok = await arrive(page, { label: "错题本", marker: /开始闯关|错题本是空的/ });
 *   if (!ok) continue;          // 没到位 → 这一条作废,**不是**应用的锅
 *
 * ⚠️ marker 要挑**这一页独有**的东西。挑「首页 / 课程 / 我」这种全站壳里的字样
 *    等于没校验 —— 任何页面都能过。
 */

/**
 * 确认页面确实到了要测的位置。
 *
 * @param page      Playwright page
 * @param label     这一步在报告里的名字
 * @param marker    正则:页面正文里必须出现的、**这一页独有**的标记
 * @param selector  可选:必须存在的元素选择器(比 marker 更硬,优先用它)
 * @param timeoutMs 等多久,默认 15s
 * @returns true = 到了;false = 没到(调用方应当把这一条判成"作废"而不是"应用坏了")
 */
export async function arrive(page, { label, marker, selector, timeoutMs = 15000 }) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (selector) {
      const n = await page.locator(selector).count().catch(() => 0);
      if (n > 0) return true;
    }
    if (marker) {
      const txt = await page.evaluate(() => document.body.innerText).catch(() => "");
      if (marker.test(txt)) return true;
    }
    if (!selector && !marker) throw new Error("arrive() 必须给 marker 或 selector");
    await page.waitForTimeout(200);
  }
  const txt = (await page.evaluate(() => document.body.innerText).catch(() => "")).replace(/\s+/g, " ").slice(0, 120);
  console.log(`⊘ ${label}:**没到达要测的位置,本条作废**(不是应用的锅,是探针没走到)`);
  console.log(`   期待:${selector ? `选择器 ${selector}` : `正文匹配 ${marker}`}`);
  console.log(`   实际正文:${txt || "(空)"}`);
  return false;
}

/**
 * 汇总打印。⚠️ **作废条数要单独报**,不能混进 PASS/FAIL ——
 * "3 条通过 0 条失败"和"3 条通过 0 条失败 + 5 条作废"是完全不同的结论,
 * 混在一起就是另一种形式的假绿。
 */
export function verdict({ pass, fail, skipped }) {
  console.log(`\n通过 ${pass} · 失败 ${fail} · **作废 ${skipped}**（作废 = 探针没到位,结论不成立）`);
  if (skipped > 0) console.log(`⚠️ 有 ${skipped} 条作废 —— 先修探针再看结论,别把作废当通过。`);
  console.log(`GATE_VERDICT ${fail === 0 && skipped === 0 ? "PASS" : "FAIL"}`);
  return fail === 0 && skipped === 0;
}
