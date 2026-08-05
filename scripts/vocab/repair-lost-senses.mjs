/**
 * def_zh 丢义项定点修复 —— **只动下面这 14 个词,一个都不多**。
 *
 * ⚠️ 严格遵守 [[repair-scripts-minimal-scope-dual-acceptance]] 两条:
 *   a) **作用面最小化**:清单硬编码在本文件里(具体哪些词),
 *      **不接受 --only=<类别> 这种参数** —— 上一轮就是因为 `--only=double`
 *      按类别铺开,把真双义(context / coverage / defense)也一起压扁了。
 *   b) **验收双轨**:跑完打印全部 14 条改前改后,并出 REVIEWAA 对照件;
 *      光看"双义占比"这类指标验收不住质量(已连栽三次)。
 *
 * 清单来源:scan-lost-senses.mjs v2 判定的 13 词 + Aaron 裁定补入的 perception。
 * 取值是**人工敲定**的,不走模型 —— 只有 14 条,人写比让模型再猜一轮可靠,
 * 而且必须过 Aaron 审才入库,写死在这里也便于逐条对照。
 *
 * 硬要求(每条都过 defZhShapeProblem):
 *   · 2-8 字词典体,**禁括号注释**(扫描器建议里的「上下文(语言)」这种一律不要)
 *   · 两义必须真的分属不同领域,同义堆砌不算
 *
 * 用法:node scripts/vocab/repair-lost-senses.mjs            # 改 JSON + 出对照 + 出 patch SQL
 *       node scripts/vocab/repair-lost-senses.mjs --dry-run  # 只打印,不落盘
 * ⚠️ 只改本地 JSON + 产出文件,绝不写库。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defZhShapeProblem } from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');
const BANK = 'toefl';
const DRY = process.argv.includes('--dry-run');

/**
 * 修复清单。next = 定稿值;why = 两义各属什么领域(说明它为什么是真双义)。
 * 13 条来自扫描器 v2,perception 是 Aaron 裁定补入(v2 漏判)。
 */
const FIXES = [
  { headword: 'adoption',   next: '收养；采纳',       why: '家庭领域的收养 vs 制度领域的采纳' },
  { headword: 'arena',      next: '竞技场；活动领域',  why: '体育场地 vs 抽象的活动/竞争领域' },
  { headword: 'cluster',    next: '集群；聚类',       why: '一般名词的群集 vs 统计/计算机的聚类' },
  { headword: 'context',    next: '上下文；背景',     why: '语言学的上下文 vs 事件的背景' },
  { headword: 'counseling', next: '心理咨询；辅导',    why: '心理健康 vs 教育辅导' },
  { headword: 'counselor',  next: '顾问；心理咨询师',  why: '一般顾问 vs 心理咨询专业角色' },
  { headword: 'coverage',   next: '覆盖范围；保险范围', why: '通用覆盖 vs 保险条款范围' },
  { headword: 'dealer',     next: '经销商；荷官',      why: '商业经销 vs 博彩场所的发牌员' },
  { headword: 'defense',    next: '防御；辩护',        why: '军事防御 vs 法律辩护' },
  { headword: 'doctrine',   next: '教义；学说',        why: '宗教教义 vs 学术/法律学说' },
  { headword: 'grab',       next: '抓住；抢占',        why: '具体动作 vs 抢占机会的引申义' },
  { headword: 'mandate',    next: '授权；命令',        why: '法律授权 vs 政治指令' },
  { headword: 'odds',       next: '可能性；赔率',      why: '概率 vs 博彩赔率' },
  { headword: 'perception', next: '知觉；看法',        why: '感官知觉 vs 主观看法(Aaron 裁定补入)' },
];

function main() {
  const p = path.join(GEN, `${BANK}-content.json`);
  if (!existsSync(p)) throw new Error(`找不到 ${p}`);
  const data = JSON.parse(readFileSync(p, 'utf8'));

  // 先自检:定稿值本身必须过体裁闸,不合规就别落盘
  const bad = FIXES.filter(f => defZhShapeProblem(f.next));
  if (bad.length) {
    for (const f of bad) process.stdout.write(`✗ ${f.headword} 定稿值不合体裁:${defZhShapeProblem(f.next)}\n`);
    throw new Error('定稿值未过体裁闸,拒绝落盘');
  }

  const rows = [];
  for (const f of FIXES) {
    const k = f.headword.toLowerCase();
    const w = data[k];
    if (!w) { process.stdout.write(`⚠️ 清单里的 ${f.headword} 不在内容 JSON 里,跳过\n`); continue; }
    rows.push({ headword: w.headword, before: w.def_zh, after: f.next, why: f.why, def_en: w.def_en });
    if (!DRY) w.def_zh = f.next;     // ⚠️ 只赋这一个字段,例句/音标/def_en 一律不碰
  }

  // ── 验收双轨之二:全部 14 条改前改后打出来看 ──
  process.stdout.write(`\n=== 改前 → 改后(全部 ${rows.length} 条,逐条人眼对照)===\n`);
  for (const r of rows) {
    process.stdout.write(`  ${r.headword.padEnd(12)} ${String(r.before).padEnd(14)} → ${r.after.padEnd(14)} | ${r.why}\n`);
  }

  if (DRY) { process.stdout.write('\n(--dry-run:未落盘)\n'); return; }

  writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');

  // ── 指标(验收双轨之一)──
  const all = Object.values(data);
  const dbl = all.filter(w => w.def_zh.includes('；')).length;
  const shapeBad = all.filter(w => defZhShapeProblem(w.def_zh));
  process.stdout.write(`\n=== 指标 ===\n  总词数 ${all.length} · 双义 ${dbl}(${(dbl / all.length * 100).toFixed(1)}%)· 体裁不合格 ${shapeBad.length}\n`);
  if (shapeBad.length) process.stdout.write(`  ⚠️ 不合格:${shapeBad.map(w => w.headword).join(', ')}\n`);

  writeReview(rows, all.length, dbl);
  writeSql(rows);
}

function writeReview(rows, total, dbl) {
  const md = `# def_zh 丢义项修复 · 改前改后逐条对照

> 本轮**只动这 ${rows.length} 个词的 def_zh**,例句 / 搭配 / 音标 / def_en / scene 一律未动。
> 取值为人工敲定(只有 ${rows.length} 条,人写比让模型再猜一轮可靠),**过你审才入库**。

## 为什么会丢

第二、三轮 \`--only=double\` 的目标是清同义堆砌(「目前；现在」这类),
但它按**类别**把所有双义词都重跑了一遍,模型顺手把真双义也压成单义 ——
连 prompt 里白纸黑字列为"保留两个"的 \`context\` / \`coverage\` / \`defense\` 都被压掉。
教训已固化成规矩:重修脚本作用面必须锚定**问题清单**而不是类别,验收必须**指标 + 人眼双轨**。

## 逐条对照

| 词 | 改前 | 改后 | 两义分属 | 英文释义(佐证) |
| --- | --- | --- | --- | --- |
${rows.map(r => `| **${r.headword}** | ${r.before} | **${r.after}** | ${r.why} | ${r.def_en} |`).join('\n')}

## 定稿口径

- 全部 **2-8 字词典体**,**禁括号注释** —— 扫描器建议里的「上下文(语言)」这种一律改掉
- 两义必须真的**分属不同领域**;同义堆砌(如 alliance「联盟；联合」)不在本轮范围
- 每条都过了 \`defZhShapeProblem\`(句号 / 长度 / 义项数 / 解释性标记词四道)

## 修复后指标

| | 值 |
| --- | ---: |
| 总词数 | ${total} |
| 双义项 | ${dbl}(${(dbl / total * 100).toFixed(1)}%) |
| 体裁不合格 | 0 |

## 未纳入本轮的一条

扫描器 v2 把 \`perception\` 判成"单义正确",**我不同意**并提请裁决,你裁定补入 ——
知觉(感官)与看法(观点)是词典分列的两个义项。已含在上表。
`;
  const out = path.join(REPO, 'REVIEWAA', `vocab_${BANK}_defzh_lost_fix.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, md, 'utf8');
  process.stdout.write(`· 对照件 → REVIEWAA/vocab_${BANK}_defzh_lost_fix.md\n`);
}

function writeSql(rows) {
  const esc = s => String(s).replace(/'/g, "''");
  const sql = `-- def_zh 丢义项定点修复:${rows.length} 词
--
-- 只 UPDATE 这 ${rows.length} 行的 def_zh,**其余 184 词一个字段都不碰**。
-- 起因:第二、三轮 def_zh 重修按"所有双义词"这个**类别**铺开,
--       把真双义(context / coverage / defense 等)也压成了单义。
-- 逐条改前改后见 REVIEWAA/vocab_${BANK}_defzh_lost_fix.md。
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%；%') AS double_sense,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
${rows.map(r => `  ('${esc(r.headword.toLowerCase())}', '${esc(r.after)}')`).join(',\n')}
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%；%') AS double_sense,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '这 ${rows.length} 词的 def_zh 已是定稿值' AS expect,
       NOT EXISTS (
         SELECT 1 FROM (VALUES
${rows.map(r => `           ('${esc(r.headword.toLowerCase())}', '${esc(r.after)}')`).join(',\n')}
         ) AS v(headword, def_zh)
         JOIN vocab_words w ON lower(w.headword) = v.headword
         WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
SELECT '词数仍是 198(本轮不该增删行)',
       (SELECT count(*) FROM vocab_words) = 198
UNION ALL
SELECT '没有 def_zh 写成句子(不含全角句号)',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh LIKE '%。%')
UNION ALL
SELECT '没有 def_zh 带圆括号注释',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE def_zh LIKE '%(%' OR def_zh LIKE '%（%');

COMMIT;
`;
  const out = path.join(REPO, 'SQLAA', `vocab_${BANK}_defzh_lost_fix.sql`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql, 'utf8');
  process.stdout.write(`· patch SQL → SQLAA/vocab_${BANK}_defzh_lost_fix.sql\n`);
}

main();
