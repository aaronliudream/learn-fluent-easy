/**
 * 闸门改动的**全量回归** —— 第七条:「改闸门必回归」。
 *
 * 拿**所有已通过验收的内容**(托福 / cet4 / cet6 的 generated JSON)按当前闸门重跑一遍,
 * 判据只有一条:**已通过的内容不许有任何一条变成不合格**。
 *
 * ── 为什么必须真跑,哪怕理论上安全 ──────────────────────────────
 * 这次改的是"下限只降不升",数学上不可能让已通过的变不合格
 * (已通过的 n ≥ 旧下限 > 新下限)。但仍然要跑:
 *   · 闸门文件里可能同时有别人的改动(不只是我这一处);
 *   · "我以为只改了下限"和"实际只改了下限"是两回事;
 *   · 历史上三次事故都是「指标绿、内容坏」,靠推理免跑正是那种自信。
 *
 * ⚠️ 本脚本**只读**,不改任何内容、不出 SQL。
 *
 * 用法:node scripts/vocab/regress-gates.mjs
 * 末行 GATE_VERDICT;别用管道取退出码。
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { runAllGates, LENGTH_BY_TIER, ngrams } from "./gates.mjs";

const GEN = path.join(process.cwd(), "scripts", "vocab", "data", "generated");
/* ⚠️ 新词库做完要加进来 —— 漏加不会报错,只会**悄悄少覆盖一个库**。 */
const BANKS = ["toefl", "cet4", "cet6", "zhongkao", "gaokao"];

console.log("当前各档句长范围:", JSON.stringify(LENGTH_BY_TIER), "\n");

/* g4 要跨词比对历史语料;回归时用空集合 —— 我们要判的是"这次闸门改动有没有误伤",
   不是"历史内容之间有没有互相重复"(那是另一件事,且当初生成时已按顺序判过)。
   空语料让 g4 恒过,对本次判据(下限只降不升)无影响。 */
const corpus = [];

/** g1/g7/g12/g13 都要屈折表(shake→shook)。**必须按库加载生成期用的那张**,
    否则"shook 里找不到 shake"会被报成 g1 不合格 —— 又是探针读错。
    第二版我传了 `{}`,cet4 立刻冒出 11 条假 g1。 */
function loadInflect(bank) {
  const f = path.join(GEN, "..", `${bank}-inflections.json`);
  if (!existsSync(f)) { console.log(`⊘ ${bank}: 缺 ${bank}-inflections.json,本库作废(不当作通过)`); return null; }
  return JSON.parse(readFileSync(f, "utf8"));
}

let total = 0, bad = 0, voided = 0;
const byGate = {};
const samples = [];

for (const bank of BANKS) {
  const f = path.join(GEN, `${bank}-content.json`);
  if (!existsSync(f)) { console.log(`⊘ ${bank}: 没有 ${bank}-content.json,跳过`); continue; }
  const j = JSON.parse(readFileSync(f, "utf8"));
  const rows = Array.isArray(j) ? j : Object.values(j);
  const inflect = loadInflect(bank);
  if (!inflect) { voided += rows.length; continue; }
  let bankBad = 0;
  for (const w of rows) {
    total++;
    /* ⚠️ 签名是 runAllGates(word, payload, corpusNgramSets, inflectTable, opts) ——
       第一版我写成 runAllGates(w, {useTierLength:true}),把 opts 当成了 payload,
       于是 examples 恒为 undefined,4471 个托福词全被报"例句数量 0",
       看上去像"闸门改动误伤了全部旧数据"。**是探针读错,不是闸门坏。**
       这正是刚立的规矩:报 FAIL 之前先证明自己读对了数据。 */
    const list = runAllGates(w, w, corpus, inflect, { useTierLength: true }) || [];
    if (list.length) {
      bad++; bankBad++;
      for (const e of list) {
        const g = /\b(g\d+)\b/.exec(String(e));
        const k = g ? g[1] : "其他";
        byGate[k] = (byGate[k] || 0) + 1;
      }
      if (samples.length < 15) samples.push(`${bank}/${w.headword}: ${list.slice(0, 2).join(" | ")}`);
    }
  }
  console.log(`${bank.padEnd(6)} 已验收 ${String(rows.length).padStart(5)} 词 · 本次判不合格 ${bankBad}`);
}

console.log(`\n合计:${total} 词,判不合格 ${bad}${voided ? ` · 作废 ${voided} 词(缺屈折表,未参与判定)` : ""}`);
if (bad) {
  console.log("按闸门分:", JSON.stringify(byGate));
  console.log("样例:");
  for (const s of samples) console.log("   " + s);
  console.log("\n⚠️ **有已通过的内容被判坏 —— 这次闸门改动误伤了旧数据,不能上。**");
} else {
  console.log("✓ 已通过的内容**一条都没有**变成不合格。");
}
/* ⚠️ **作废 ≠ 通过**。第三版跑出来 cet6 因为缺屈折表整库被跳过,却仍然打了
   GATE_VERDICT PASS —— 那就是"覆盖不全被读成全通过",正是第七条要防的事。
   只要有一个词没参与判定,这轮回归就不算数。 */
const green = bad === 0 && voided === 0;
console.log(`\nGATE_VERDICT ${green ? "PASS" : "FAIL"}`);
process.exit(green ? 0 : 1);
