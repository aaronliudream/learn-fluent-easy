/**
 * SQLAA 里那批"交给 Aaron 跑"的 SQL 的机械检查。
 *
 * ── 为什么要有它 ────────────────────────────────────────────────
 * 我跑不了写库 SQL(只有 anon key),所以每份 SQL 的**第一次执行发生在生产库上**、
 * 由 Aaron 手动跑。一个语法错就是他一次白跑加一轮往返。
 * 2026-08-09 一天内栽了两次:
 *   ① `AS vocab_words 行数` —— 别名带空格没加引号 → 42601 syntax error;
 *   ② `def_en = 'a claim...'` —— 拿**小写归一化后的展示值**当精确匹配条件,
 *      库里却是句首大写 → 16 条 UPDATE 一条没匹配上。
 * 这个脚本卡的是**能机械判定的第一类**,不假装能卡第二类(那类靠 SQL 自带的 RAISE 断言)。
 *
 * ── ⚠️ 必须先把字符串和注释剥干净,否则这道门会自己废掉 ──────────
 * 第一版用一行正则 `replace(/'[^']*'/g, "")` 剥字符串,结果在 24 份存量 SQL 上
 * **误报了 25 条** —— 全是**内容里的英文**:`as long as` / `as soon as` / `as clean as`…
 * 那些 SQL 是灌课文内容的,正文里到处是 as…as 句式,而且用 `''` 转义单引号、
 * 字符串还跨行,一行正则根本剥不动。
 * 一道天天误报的门等于没有门(人会直接绕过去),所以改成**跨行状态机**:
 * 逐字符走,跟踪 `'...'`(含 `''` 转义)与 `$$...$$` 美元引用块,只在**代码区**做判断。
 *
 * ⚠️ 它**不是** SQL 解析器,只做几条高确定度的检查。判不了的一律放过 ——
 *    宁可漏报,也不要误报到让人绕过它(第九条:分不清就别硬判)。
 *
 * 用法:node scripts/vocab/audit/sql-lint.mjs [目录,默认 SQLAA]
 * 末行输出 GATE_VERDICT,退出码 0/1(别用管道取退出码)。
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * 把整份 SQL 里**字符串字面量、行注释、块注释、$$…$$ 块**统统换成等长空格,
 * 保留换行 —— 这样行号不变,后面的正则只会看到真正的代码。
 */
function blankOutNonCode(src) {
  const out = src.split("");
  let i = 0;
  const n = src.length;
  const blank = (from, to) => { for (let k = from; k < to && k < n; k++) if (out[k] !== "\n") out[k] = " "; };

  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    if (ch === "-" && nx === "-") {                       // 行注释
      let j = src.indexOf("\n", i); if (j < 0) j = n;
      blank(i, j); i = j; continue;
    }
    if (ch === "/" && nx === "*") {                       // 块注释
      let j = src.indexOf("*/", i + 2); j = j < 0 ? n : j + 2;
      blank(i, j); i = j; continue;
    }
    /* 美元引用块。⚠️ **带标签的也要认**:`$gz$ … $gz$`。
       第一版只认裸 `$$`,于是 SQLAA/library-guide-…oz.sql 里 `$gz$` 包着的整篇中文导读
       被当成代码,报出 5 条"全角括号 / 别名带空格"的假问题。 */
    if (ch === "$") {
      const dq = src.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/);
      if (dq) {
        const tag = dq[0];
        let j = src.indexOf(tag, i + tag.length);
        j = j < 0 ? n : j + tag.length;
        blank(i, j); i = j; continue;
      }
    }
    if (ch === "'") {                                     // 字符串,含 '' 转义
      let j = i + 1;
      while (j < n) {
        if (src[j] === "'") {
          if (src[j + 1] === "'") { j += 2; continue; }    // '' = 一个单引号,不结束
          j += 1; break;
        }
        j += 1;
      }
      blank(i, j); i = j; continue;
    }
    i += 1;
  }
  return out.join("");
}

/* ── 两种模式 ────────────────────────────────────────────────
 * · 显式给文件名     → **阻塞**(PR 里就这么用:只卡这次要交出去的那几份)
 * · 不给,扫整个目录 → **只报不卡**(退出码恒 0)
 *
 * ⚠️ 为什么整目录不卡:SQLAA 里躺着几十份**早就跑完**的历史 SQL,其中 5 份
 *    没包 BEGIN/COMMIT。让它们把门永远染红,结果只会是这道门被绕过去 ——
 *    门要拦的是**新交出去的**那几份,不是给历史记账。 */
const argFiles = process.argv.slice(2).filter(a => a.endsWith(".sql"));
const blocking = argFiles.length > 0;
const baseDir = blocking ? path.dirname(argFiles[0]) : (process.argv[2] || "SQLAA");
const files = blocking
  ? argFiles.map(f => path.basename(f))
  : readdirSync(baseDir).filter(f => f.endsWith(".sql")).sort();
const problems = [];

/* AS 后面跟两个 token = 别名带空格。第二个 token 是这些关键字时属于正常语法,放过。 */
const AFTER_AS_OK = /^(SELECT|FROM|WHERE|ON|NOT|NULL|INT|INTEGER|BIGINT|TEXT|BOOLEAN|UUID|JSONB?|NUMERIC|TIMESTAMPTZ|TIMESTAMP|DATE|MATERIALIZED|WITH|VALUES|TABLE|PERMISSIVE|RESTRICTIVE)$/i;

for (const f of files) {
  const full = path.join(baseDir, f);
  const src = readFileSync(full, "utf8");
  const code = blankOutNonCode(src);
  const codeLines = code.split(/\r?\n/);
  const rawLines = src.split(/\r?\n/);

  codeLines.forEach((line, i) => {
    const at = `${f}:${i + 1}`;

    /* ① 别名带空格却没加双引号 —— 2026-08-09 踩的那个 42601。
     *
     * ⚠️ 规则**只认含中日韩字符的别名**,不去管纯英文的 `AS xxx yyy`。
     *    由来:第一版按"AS 后跟两个 token"判,把一堆**合法语法**判成了错:
     *      · `CREATE TABLE … AS SELECT *`(CTAS)
     *      · `GENERATED ALWAYS AS identity primary key`
     *    要靠白名单把 SQL 所有关键字组合枚举全,是做半个解析器 —— 做不干净。
     *    而真正踩过的那一类**必然含中文**(`AS vocab_words 行数`),
     *    收窄到这一类:漏报英文别名,但零误报(第九条:分不清就别硬判)。 */
    const m = line.match(/\bAS\s+(?!")([^\s,;()"]+)\s+([^\s,;()"]+)/i);
    if (m && /[㐀-鿿぀-ヿ가-힯]/.test(m[1] + m[2]) && !AFTER_AS_OK.test(m[2])) {
      problems.push(`${at}  别名带空格未加双引号:AS ${m[1]} ${m[2]}  → 写成 AS "${m[1]} ${m[2]}"`);
    }

    // ② 代码区出现全角括号 —— 不是合法语法字符,通常是从文档粘过来的
    if (/[（）]/.test(line)) {
      problems.push(`${at}  代码里有全角括号:${line.trim().slice(0, 60)}`);
    }
  });

  // ③ 占位符:交出去的 SQL 不许留 <填这里>(整份找,注释里也不行 —— 那正是要人填的地方)
  rawLines.forEach((raw, i) => {
    if (/<[^>\n]*(填|TODO|xxx|XXX)[^>\n]*>/.test(raw)) {
      problems.push(`${f}:${i + 1}  留了占位符:${raw.trim().slice(0, 60)}`);
    }
  });

  // ④ 改库必须包在事务里(铁律 1)
  const hasWrite = /^\s*(INSERT|UPDATE|DELETE|ALTER|DROP)\b/im.test(code);
  const began = /^\s*BEGIN\s*;/im.test(code);
  const committed = /^\s*COMMIT\s*;/im.test(code);
  if (hasWrite && !(began && committed)) {
    problems.push(`${f}  有写操作但没有完整的 BEGIN;…COMMIT;(改库一律事务)`);
  }
}

console.log(`扫了 ${files.length} 份 SQL\n`);
if (problems.length) for (const p of problems) console.log("  ✗ " + p);
else console.log("  ✓ 未发现可机械判定的问题");
console.log(`\n⚠️ 这道门卡不住"谓词值写错"那一类(大小写/空白/内容不符)——`);
console.log(`   那要靠每份 SQL 自带的 RAISE 断言在生产库上兜住,别以为这里绿了就一定跑得通。`);
if (!blocking) {
  console.log(`\n(整目录扫描模式:**只报不卡**。要当门用请显式传文件名,例如`);
  console.log(`   node scripts/vocab/audit/sql-lint.mjs SQLAA/a.sql SQLAA/b.sql)`);
}
const fail = blocking && problems.length > 0;
console.log(`\nGATE_VERDICT ${fail ? "FAIL" : "PASS"}`);
process.exit(fail ? 1 : 0);
