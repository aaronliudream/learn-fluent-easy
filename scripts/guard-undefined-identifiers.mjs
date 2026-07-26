#!/usr/bin/env node
/**
 * push 前硬卡口:一类**必然在运行时抛 ReferenceError → 页面白屏**的 TS 错误。
 * vite build(esbuild)不做作用域/时序检查 → 这些错误照常绿灯上线,「build ✓」不构成安全证据。
 *
 * 覆盖的错误码(全是同一后果:ReferenceError):
 *   TS2304  找不到名称 X            —— 标识符根本不在作用域
 *   TS2448  块级变量在声明前被使用    —— TDZ(暂时性死区)
 *   TS2454  变量在赋值前被使用        —— TDZ
 *   TS2729  属性在初始化前被使用      —— 类字段 TDZ
 *
 * ══ 背景:两次白屏 + 一次守卫空转 ══
 *  · 2026-07-26 上午 TS2304:`JuniorVocab.tsx:223` / `JuniorListening.tsx:359` 的 `pub`
 *    是兄弟组件的局部变量,子组件里不在作用域 → /junior/vocab 与 /junior/listening 白屏 5 天。
 *    本脚本因此诞生。
 *  · 2026-07-26 下午 TS2448(#242,fe55aba):`MistakeReviewGate.tsx:80` 把
 *    `useRevealScroll(revealed)` 插在 `const revealed = picked != null`(第 123 行)**之前**,
 *    提前 43 行读一个 const。该组件挂在 App 全局 → **全站白屏,首页都打不开**,线上回滚。
 *  · 同日查出:**本脚本此前从未真正运行过**。原实现用
 *    `spawnSync("npx.cmd", …, { shell: false })`,在 Windows + 新版 Node 上直接 EINVAL
 *    (不允许以 shell:false 执行 .cmd),`status=null`、stdout/stderr 全空 → 匹配到 0 行 →
 *    打印「✅ = 0」退出 0。**一道永远绿的门比没有门更危险。**
 *
 * ══ 因此本版做了三件事 ══
 *  1) 改用 `process.execPath` + `require.resolve("typescript/bin/tsc")` 直接跑 tsc 的 JS 入口,
 *     完全绕开 .cmd / shell 差异,跨平台一致。
 *  2) **自检**:tsc 没跑起来(spawn 报错 / status 为 null / 退出码不是 tsc 正常的 0|1)
 *     一律**判失败**,绝不静默放行。
 *  3) 输出扫描到的总行数,让「到底跑没跑」肉眼可见。
 *
 * ★注意★ 整库 tsc 有几百条 stale types.ts 基线噪音(见 memory: tsc-baseline-not-zero-use-build),
 * 所以这里只卡上面这几类 —— 它们不可能误报,基线必须恒为 0。
 * (2026-07-26 修复 #242 后实测:四个码全部 = 0。)
 *
 * ★注意★ 必须用 -p tsconfig.app.json。根 tsconfig.json 是 files:[] + references,
 * 不带 --build 等于空跑,永远输出 0 行(会骗人)。
 *
 * ★这道门不替代真机验证★ 它只能挡住「静态可判定」的 ReferenceError。
 * 涉及多文件/跨模块的改动,合并前仍须 `npm run build && npm run preview` 并用浏览器实际打开页面。
 *
 * 用法:npm run check:undef
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

/** 错误码 → 人话,报错时一起打出来,方便判断该怎么改。 */
const GUARDED = {
  TS2304: "找不到名称(标识符不在作用域)",
  TS2448: "块级变量在声明前被使用(TDZ)",
  TS2454: "变量在赋值前被使用(TDZ)",
  TS2729: "属性在初始化前被使用(类字段 TDZ)",
};

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
let tscBin;
try {
  tscBin = require.resolve("typescript/bin/tsc");
} catch {
  die("解析不到 typescript/bin/tsc —— 依赖没装?先 npm ci。这道门必须真的跑起来才有意义。");
}

const res = spawnSync(process.execPath, [tscBin, "--noEmit", "-p", "tsconfig.app.json"], {
  encoding: "utf8",
});

// ── 自检:确认 tsc 真的跑过 ────────────────────────────────────────────────
// tsc 的 ExitStatus:0=无诊断;1/2=有诊断(本库 stale 基线必然落这里);3=项目配置无效;4=引用成环。
// 只接受 0/1/2,其余(含 spawn 失败、被信号打断)一律判失败,绝不静默放行。
if (res.error) die(`tsc 没能启动:${res.error.code ?? ""} ${res.error.message}`);
if (res.status === null) die("tsc 被信号中断,没有退出码 —— 结果不可信,按失败处理。");
if (![0, 1, 2].includes(res.status)) die(`tsc 异常退出(code=${res.status}) —— 结果不可信,按失败处理。`);

const output = `${res.stdout ?? ""}${res.stderr ?? ""}`;
const lines = output.split(/\r?\n/).filter((l) => l.trim() !== "");
if (res.status !== 0 && lines.length === 0) {
  die(`tsc 退出码为 ${res.status}(有诊断)却没有任何输出 —— 结果不可信,按失败处理。`);
}

const hits = [];
for (const code of Object.keys(GUARDED)) {
  for (const l of lines) {
    if (l.includes(`error ${code}`)) hits.push({ code, line: l });
  }
}

if (hits.length > 0) {
  console.error(`\n❌ 发现 ${hits.length} 处必然白屏的错误,禁止 push\n`);
  for (const h of hits) console.error(`   [${h.code} ${GUARDED[h.code]}]\n   ${h.line}`);
  console.error("\n这类错误必然在运行时抛 ReferenceError → 页面白屏。修完再 push。\n");
  process.exit(1);
}

console.log(
  `✅ ${Object.keys(GUARDED).join(" / ")} 全部 = 0` +
    `(tsc 退出码 ${res.status},实际扫描 ${lines.length} 行输出)`,
);
