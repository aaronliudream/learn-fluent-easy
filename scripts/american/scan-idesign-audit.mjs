/**
 * 三维闸门全库回扫 → REVIEWAA/american-instructional-design-audit.md
 * am2 = 本地 JSON(L1-27,含未落库);am1 = 线上 DB。
 * 每题打 类型标签 + 三维粗估(★) + 建议处置,供 Aaron 复核降级判断。
 * 用法: node scripts/american/scan-idesign-audit.mjs
 */
import fs from "node:fs";
import path from "node:path";

const BASE = "https://degqpiiddkxcuzwombwp.supabase.co";
const KEY = "sb_publishable_0lZoKG2xKcwgDkpLUAZVFQ_mGEdCqHE";
const DIR = "docs/american/book2";

const hasBlank = (s) => /_{2,}|＿/.test(s);
const enWords = (s) => (String(s).match(/[A-Za-z][A-Za-z'’.-]*/g) || []).length;
const META_TOKEN = /动词-?ing|过去分词|过去式|动词原形|不定式|复数|单数|名词|时态|句型|从句|系动词|情态|助动词|词尾|构成|否定式|疑问句|加\s*-|表示|经历|承受者|习惯|义务|推测|转述/;
const isVocab = (stem, opts) => /意思是|什么意思|的意思/.test(stem) && opts.every((o) => !/[A-Za-z]{2,}/.test(o)) && !opts.some((o) => META_TOKEN.test(o));
const isEnSentence = (o) => enWords(o) >= 3;
function isApplication(stem, opts) {
  const stemEnBlank = hasBlank(stem) && enWords(stem) >= 2;
  const optsEnSent = opts.filter(isEnSentence).length >= 2;
  const scenario = /你想说|的说法|改成|改写|换成|同样意思|意思相同|意思不变|哪一?句|口语缩略/.test(stem) && opts.some((o) => enWords(o) >= 2);
  return stemEnBlank || optsEnSent || scenario;
}
const META_STEM = /用来(说|表示|讲|做)什么|表示什么|属于哪[种类]|由什么构成|的构成是|的否定式?是|疑问句用|一般在词尾|哪[类种](动词|词|时态|句型)|是哪类(词|动词)/;

// 分类 + 三维粗估 + 处置
function assess(stem, opts) {
  const correct = opts[0] || "";
  const blob = [stem, ...opts].join(" ");
  // 陷阱结构
  const trapInsert = /as well as|together with|along with/i.test(blob) && /^(is|was)$/i.test(correct.trim());
  const trapColl = /\b(family|team|government|committee|audience|staff|crowd|company)\b/i.test(blob) && /^(are|were)$/i.test(correct.trim());
  if (trapInsert || trapColl)
    return { tag: "陷阱🟡", freq: 2, transfer: 2, errcost: 1, fix: trapInsert ? "低频正式书面陷阱 → 删或改 and 连接自然题;确需保留标(正式/书面语)" : "英式复数 → 改自然题(and are / 单数 is)或标(正式)" };
  // 元语法定义题
  if (META_STEM.test(stem))
    return { tag: "元语法🔴", freq: 3, transfer: 1, errcost: 2, fix: "红灯:改真实例句运用题;每课至多留1道带卡且收窄到本课具体句型" };
  // form/collocation:答案是具体英文形式/搭配(比较级/介词搭配/词形)→ 近运用,多保留
  if (/[A-Za-z]/.test(correct) && enWords(correct) <= 2 && !META_TOKEN.test(correct))
    return { tag: "词形/搭配🟢", freq: 4, transfer: 4, errcost: 3, fix: "近运用,保留(可选:优化成整句填空更佳)" };
  // 其余:概念/用法辨认(中文答案)
  return { tag: "概念辨认🟡", freq: 3, transfer: 2, errcost: 2, fix: "视三维:能改整句运用则改;确有高频用法价值可留1道带卡" };
}

async function fetchAm1() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${BASE}/rest/v1/american_questions?lesson_id=like.am1_l*&stage=in.(5,10)&select=lesson_id,stage,seq,payload&order=lesson_id,stage,seq`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` } });
    const b = await r.json(); rows.push(...b); if (b.length < 1000) break;
  }
  return rows;
}

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
const out = [];
out.push("# 美语课程 · 三维闸门全库回扫清单(降级候选,供 Aaron 复核)\n");
out.push("> 生成:scripts/american/scan-idesign-audit.mjs · 标准:instructional_design_spec.md");
out.push("> 三维 = 真实频率 / 可迁移性 / 错误成本(★1–5)。**元语法🔴 必改;陷阱🟡 多数降级;概念辨认🟡 逐题看;词形搭配🟢 多保留**。");
out.push("> 处置由 Aaron 复核后 CC 逐题执行,机器校验第11/12项复跑,幂等 UPDATE 镜像 SQLAA。\n");

// am2 本地
let am2Total = 0, redT = 0, trapT = 0;
const files = fs.readdirSync(DIR).filter((f) => /^am2_l\d+\.json$/.test(f)).sort((a, b) => a.match(/l(\d+)/)[1] - b.match(/l(\d+)/)[1]);
out.push("## 第二册 am2(本地 JSON,L1–L27)\n");
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const rows = [];
  const scan = (arr, st, guard) => (arr || []).forEach((q, i) => {
    if (guard && q.kind && q.kind !== "grammar") return;
    const opts = q.options || [];
    if (isVocab(q.stem, opts) || isApplication(q.stem, opts)) return;
    const a = assess(q.stem, opts);
    rows.push({ loc: `s${st}#${i + 1}`, stem: q.stem, correct: opts[0], ...a });
  });
  scan(j.stage5, 5, false); scan(j.stage10, 10, true);
  if (!rows.length) continue;
  am2Total += rows.length;
  const reds = rows.filter((r) => r.tag.includes("🔴")).length; redT += reds;
  trapT += rows.filter((r) => r.tag.includes("陷阱")).length;
  out.push(`### ${j.id} ${j.title_cn} — ${rows.length} 项(元语法🔴 ${reds})`);
  out.push("| 位置 | 类型 | 频率 | 迁移 | 错误成本 | 题干 | ✓答案 | 建议处置 |");
  out.push("|---|---|---|---|---|---|---|---|");
  for (const r of rows)
    out.push(`| ${r.loc} | ${r.tag} | ${stars(r.freq)} | ${stars(r.transfer)} | ${stars(r.errcost)} | ${r.stem.replace(/\|/g, "\\|").slice(0, 60)} | ${String(r.correct).replace(/\|/g, "\\|").slice(0, 24)} | ${r.fix} |`);
  out.push("");
}

// am1 DB
out.push("## 第一册 am1(线上 DB)\n");
const am1 = await fetchAm1();
const am1rows = [];
for (const q of am1) {
  const p = q.payload || {}; const opts = p.options || [];
  if (q.stage === 10 && p.kind && p.kind !== "grammar") continue;
  const a = assess(p.stem || "", opts);
  // am1 只列机器闸精确命中(元语法🔴 / 陷阱🟡);宽口径概念桶对 am1 题型噪声大,不列
  if (!(a.tag.includes("🔴") && META_STEM.test(p.stem || "")) && !a.tag.includes("陷阱")) continue;
  am1rows.push({ lid: q.lesson_id, loc: `s${q.stage}#${q.seq}`, stem: p.stem, correct: opts[p.answer_index] ?? opts[0], ...a });
}
if (!am1rows.length) out.push("**am1 关5/关10 零元语法🔴/陷阱🟡降级候选**(1989 题精确回扫:早期即按运用型编写,无抽象定义题、无集合名词英式复数陷阱)。\n");
else { out.push("| 课 | 位置 | 类型 | 题干 | ✓答案 | 建议 |"); out.push("|---|---|---|---|---|---|"); for (const r of am1rows) out.push(`| ${r.lid} | ${r.loc} | ${r.tag} | ${r.stem.replace(/\|/g, "\\|").slice(0, 55)} | ${String(r.correct).slice(0, 20)} | ${r.fix} |`); }

out.push(`\n---\n**合计**:am2 降级候选 ${am2Total} 项(其中元语法🔴 ${redT} · 陷阱🟡 ${trapT});am1 ${am1rows.length} 项。`);
out.push("**优先级**:🔴 元语法定义题必改(机器第11项已红灯拦);🟡 陷阱/概念辨认按三维逐题复核;🟢 词形搭配多保留。");

fs.writeFileSync("REVIEWAA/american-instructional-design-audit.md", out.join("\n"), "utf8");
console.log(`写出 REVIEWAA/american-instructional-design-audit.md`);
console.log(`am2 ${am2Total} 项(🔴${redT} 陷阱${trapT}) · am1 ${am1rows.length} 项`);
