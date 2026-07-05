/**
 * AM2 全量九项校验(防静默失效②:对 seed 内全部课跑,不只当轮新课)。
 * 用法: node scripts/american/validate-am2-all.mjs        # 扫 docs/american/book2 下全部 am2_l*.json
 *        node scripts/american/validate-am2-all.mjs 02     # 只跑某单元(01/02/…)的课
 * 任一课红灯 → 整体 exit 1。避免"只验当轮新课、老课解释被悄悄抹掉不自知"的事故。
 */
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const only = process.argv[2]; // 可选:单元号,如 "02"
const ids = readdirSync("docs/american/book2")
  .filter((f) => /^am2_l\d+\.json$/.test(f))
  .map((f) => f.replace(".json", ""))
  .filter((id) => !only || String(Math.ceil(Number(id.match(/l(\d+)/)[1]) / 8)).padStart(2, "0") === only)
  .sort();

let red = 0;
for (const id of ids) {
  try {
    execFileSync("node", ["scripts/american/validate-am2-lesson.mjs", id], { stdio: "pipe" });
    console.log(`🟢 ${id}`);
  } catch (e) {
    red++;
    console.log(`🔴 ${id}\n${(e.stdout || "").toString().split("\n").filter((l) => l.includes("❌")).join("\n")}`);
  }
}
console.log(`\n${red === 0 ? `🟢 全部 ${ids.length} 课九项全绿` : `🔴 ${red}/${ids.length} 课有红灯`}`);
process.exit(red === 0 ? 0 : 1);
