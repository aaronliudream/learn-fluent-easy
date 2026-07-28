/**
 * 写作四屏的数据面实测 —— 冒烟门够不到写作关(要登录 + 深链),所以按数据判渲染条件。
 *
 * 逐单元核:
 *   ① hasScaffold = cards 非空 && templates 存在 → 决定走不走四屏
 *   ② templates 三档 l1/l2/l3 都在
 *   ③ 模板里出现的 {key} 必须都能在 cards 里找到(否则草稿里会留下永远填不上的 ____)
 *   ④ cards 里定义的 key 都被模板用到(没用到 = 白让学生填)
 *   ⑤ 拿"每张卡片填示例值"跑一遍 fillTemplate,断言草稿里不再有 ____
 */
import { readFileSync } from 'node:fs';

const FILES = [
  ['src/data/juniorHub/fltrp-grade7.json', 'wy7A/wy7B'],
  ['src/data/juniorHub/fltrp-grade8.json', 'wy8A/wy8B'],
  ['src/data/juniorHub/fltrp-grade9.json', 'wy9A'],
];

const fill = (line, values) => line.replace(/\{(\w+)\}/g, (_m, k) => (values[k] ?? '').trim() || '____');

let bad = 0, checked = 0, scaffoldable = 0;
for (const [file, label] of FILES) {
  const grade = Object.values(JSON.parse(readFileSync(file, 'utf8')))[0];
  for (const [semId, sem] of Object.entries(grade.semesters ?? {})) {
    for (const u of sem.units ?? []) {
      const w = u.writing;
      if (!w) continue;
      checked++;
      const cards = w.cards ?? [];
      const t = w.templates;
      const has = cards.length > 0 && !!t;
      if (!has) {
        console.log(`  · ${label} ${u.id} 无 cards/templates → 走纯文本框(不算失败)`);
        continue;
      }
      scaffoldable++;
      const problems = [];
      for (const lv of ['l1', 'l2', 'l3']) if (!t[lv]?.length) problems.push(`缺 ${lv}`);
      const keys = new Set(cards.map((c) => c.key));
      const used = new Set();
      for (const lv of ['l1', 'l2', 'l3']) {
        for (const line of t[lv] ?? []) {
          for (const m of line.matchAll(/\{(\w+)\}/g)) {
            used.add(m[1]);
            if (!keys.has(m[1])) problems.push(`模板用了未定义占位符 {${m[1]}}`);
          }
        }
      }
      for (const k of keys) if (!used.has(k)) problems.push(`cards 定义了 {${k}} 但模板没用`);
      // ⑤ 全填示例值 → 草稿不应再有 ____
      const values = Object.fromEntries(cards.map((c) => [c.key, 'X']));
      for (const lv of ['l1', 'l2', 'l3']) {
        const draft = (t[lv] ?? []).map((l) => fill(l, values)).join(' ');
        if (draft.includes('____')) problems.push(`${lv} 全填后仍有 ____`);
      }
      if (problems.length) {
        bad++;
        console.log(`  ✗ ${label} ${u.id}: ${[...new Set(problems)].join(' · ')}`);
      }
    }
  }
}
console.log(`\n检查 ${checked} 个带 writing 的单元,其中可走四屏 ${scaffoldable} 个`);
console.log(`SCAFFOLD_VERDICT: ${bad ? 'FAIL' : 'PASS'}(问题单元 ${bad} 个)`);
process.exit(bad ? 1 : 0);
