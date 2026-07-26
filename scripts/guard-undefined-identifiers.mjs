#!/usr/bin/env node
/**
 * push 前硬卡口:TS2304「找不到名称 X」= 未定义标识符 = 100% 运行时 ReferenceError。
 *
 * 背景(2026-07-26):`JuniorVocab.tsx:223` / `JuniorListening.tsx:359` 里的 `pub` 是
 * 兄弟组件的局部变量,子组件里根本不在作用域。vite build(esbuild)不做作用域检查 → 照常绿灯上线,
 * /junior/vocab 与 /junior/listening 白屏 5 天。
 *
 * ★注意★ 整库 tsc 有几百条 stale types.ts 基线噪音(见 memory: tsc-baseline-not-zero-use-build),
 * 所以这里只卡 TS2304 这一类 —— 它不可能误报,基线必须恒为 0。
 *
 * ★注意★ 必须用 -p tsconfig.app.json。根 tsconfig.json 是 files:[] + references,
 * 不带 --build 等于空跑,永远输出 0 行(会骗人)。
 *
 * 用法:npm run check:undef
 */
import { spawnSync } from "node:child_process";

const res = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["tsc", "--noEmit", "-p", "tsconfig.app.json"],
  { encoding: "utf8", shell: false },
);

const output = `${res.stdout ?? ""}${res.stderr ?? ""}`;
const hits = output.split(/\r?\n/).filter((l) => l.includes("error TS2304"));

if (hits.length > 0) {
  console.error(`\n❌ TS2304:发现 ${hits.length} 处未定义标识符,禁止 push\n`);
  for (const h of hits) console.error(`   ${h}`);
  console.error("\n这类错误必然在运行时抛 ReferenceError → 页面白屏。修完再 push。\n");
  process.exit(1);
}

console.log("✅ TS2304 = 0(无未定义标识符)");
