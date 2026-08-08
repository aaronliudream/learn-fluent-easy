/**
 * 生成发音基础送审件(音标 48 + 自然拼读 42)。
 *
 * ⚠️ **从代码里的数据文件直接生成**,不是手抄 —— 送审件与线上内容永远同源,
 *    审完改数据文件重跑一次即可出新版,不会出现"审的是一套、跑的是另一套"。
 *
 * 用法(数据是 .ts,node 不能直接 import,先用 esbuild 转一份到临时目录):
 *   npx esbuild src/data/vocab/phonics48.ts src/data/vocab/phonicsRules.ts --format=esm --outdir=tmpph
 *   node scripts/vocab/gen-phonics-review.mjs tmpph
 */
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2] || "tmpph";
const { PHONICS_48 } = await import(path.resolve(dir, "phonics48.js").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:"));
const { PHONICS_RULES } = await import(path.resolve(dir, "phonicsRules.js").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:"));

const esc = s => String(s).replace(/\|/g, "\\|");

function section(title, rows, noteLabel) {
  const byGroup = {};
  for (const c of rows) (byGroup[c.group] ||= []).push(c);
  let out = `\n## ${title}\n`;
  for (const [g, list] of Object.entries(byGroup)) {
    out += `\n### ${g}(${list.length})\n\n`;
    out += `| # | 符号 | 要点 | ${noteLabel} | 示例词(**加粗**=发该音的字母) | 最小对立对 | 进阶(托福) |\n`;
    out += `|---|---|---|---|---|---|---|\n`;
    list.forEach((c, i) => {
      const words = c.words.map((w, k) => {
        const f = c.focus[k];
        const at = w.toLowerCase().indexOf(f.toLowerCase());
        return at < 0 ? w : w.slice(0, at) + "**" + w.slice(at, at + f.length) + "**" + w.slice(at + f.length);
      }).join(" / ");
      out += `| ${i + 1} | \`${esc(c.symbol)}\` | ${esc(c.tip)} | ${esc(c.cnError)} | ${esc(words)} | `
        + `${c.minimalPair ? esc(c.minimalPair.join(" vs ")) : "—"} | ${c.advanced ? esc(c.advanced.join(" / ")) : "—"} |\n`;
    });
  }
  return out;
}

const vowels = PHONICS_48.filter(c => c.kind === "vowel").length;
const consonants = PHONICS_48.filter(c => c.kind === "consonant").length;

const md = `# 发音基础送审件 v1(音标 ${PHONICS_48.length} + 自然拼读 ${PHONICS_RULES.length})

> **本件由代码里的数据文件直接生成**,不是手抄 —— 审完改数据文件重跑即可出新版,不会漂移。
> 生成源:\`src/data/vocab/phonics48.ts\`、\`src/data/vocab/phonicsRules.ts\`
> 生成器:\`scripts/vocab/gen-phonics-review.mjs\`

## 请重点审这五件事

1. **要点**是否说清了嘴型/舌位,有没有说错的
2. **中国学生常见错误 / 例外提示**是否属实、是否真是高频错误
3. **示例词是否都在最高频 1000 内** —— 这是硬约束:学音标的人多数还没有词汇量,
   拿托福词举例等于用没学过的词教发音。进阶示例(托福词)已单独放在最后一列、页面上默认折叠。
4. 加粗的字母是否确实是**发该音的那几个字母**
5. 最小对立对是否真的**只差这一个音**

## 两个体系性说明

- 音标采用**国内教材传统的 48 音标**(元音 ${vowels} + 辅音 ${consonants},含 tr/dr/ts/dz)。
  现代音系学不把那四个算独立音位(是辅音连缀),但国内教材普遍单列、学生也按 48 个学。跟教材走。
- 拼读规则原起草 46 条,其中 **-ed 三读 / th 清浊 / oo 长短**各自**合并成一张卡**
  (它们是同一条规则的分支或对立对,分开讲反而记不住"什么时候用哪个"),合并后恰为 ${PHONICS_RULES.length} 条。

## 音频现状(待你定)

目前**全部是 TTS 兜底**:点示例词读词。音标符号本身 TTS 念不出(孤立音位没法合成),
所以点卡片大字读的是该卡第一个示例词。真人音频建议列入下次攒批,
**中文释义配音**(磨耳朵那一档缺的)可以同批一起烧。
${section("一、音标 " + PHONICS_48.length, PHONICS_48.map(c => ({ ...c, symbol: c.ipa })), "中国学生常见错误")}
${section("二、自然拼读 " + PHONICS_RULES.length, PHONICS_RULES, "例外提示")}
`;

const out = "REVIEWAA/vocab-phonics-48/发音基础-送审-v1.md";
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md, "utf8");
console.log(`OK ${out} (${md.length} bytes, ${PHONICS_48.length} ipa + ${PHONICS_RULES.length} rules)`);
