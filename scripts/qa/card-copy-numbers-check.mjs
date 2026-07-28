/**
 * 选版页卡片文案的数字对账闸门。
 *
 * 起因(2026-07-27):高中三张卡的副标题是凭记忆写的 ——
 * 上外/外研社挂着「内容陆续上线」,实际两家都已灌满(外研社还是三家里内容最多的);
 * 「5 大专项」少报了自己一项;人教「高考真题」四个字对 100% 的真实用户不可见(email 白名单)。
 * 定的规约:**卡片文案里的每个数字必须有数据兜底,禁止凭记忆写副标题。**
 *
 * 本闸门把那条规约变成可执行的:tagline 里出现的「N 册」「N 单元」
 * 必须与课程 JSON 里 available 的册/单元数一致。以后有人改文案或加册,数字对不上就红。
 *
 * ⚠️ 只核**结构数字**(册/单元)——它们的真值在仓库里。
 *   词汇量/题数那类只在 DB 里的数字,不要写进卡片文案(改库不会触发本闸门,必然长歪)。
 */
import { readFileSync } from 'node:fs';

const SRC = 'src/lib/gaokaoHub/publisher.ts';
const COURSE_FILES = {
  pep: ['src/data/gaokaoHub/year1.json', 'src/data/gaokaoHub/year2.json', 'src/data/gaokaoHub/year3.json'],
  sufe: ['src/data/gaokaoHub/sufe-courses.json'],
  fltrp: ['src/data/gaokaoHub/fltrp-courses.json'],
};

/** 递归找出所有带 units 数组的册,数 available 的册数与单元数 —— 与选版页之后学生真能点到的一致。 */
function census(files) {
  let books = 0, units = 0;
  const walk = (obj) => {
    for (const v of Object.values(obj ?? {})) {
      if (v && typeof v === 'object' && Array.isArray(v.units)) {
        if (v.available === false) continue;
        books++;
        units += v.units.filter((u) => u.available).length;
      } else if (v && typeof v === 'object') walk(v);
    }
  };
  for (const f of files) walk(JSON.parse(readFileSync(f, 'utf8')));
  return { books, units };
}

const src = readFileSync(SRC, 'utf8');
const cards = [...src.matchAll(/(\w+): \{ name: "([^"]+)"[^}]*?tagline: "([^"]+)"/g)];
if (cards.length !== Object.keys(COURSE_FILES).length) {
  console.log(`✗ 从 ${SRC} 只解析出 ${cards.length} 张卡,期望 ${Object.keys(COURSE_FILES).length} 张 —— 解析器与文件结构脱节,先修解析器`);
  console.log('CARD_COPY_VERDICT: FAIL(解析失败)');
  process.exit(1);
}

let bad = 0;
for (const [, key, name, tagline] of cards) {
  const files = COURSE_FILES[key];
  if (!files) { bad++; console.log(`  ✗ ${name}: publisher '${key}' 没有对应课程 JSON`); continue; }
  const real = census(files);
  const problems = [];
  const books = tagline.match(/(\d+)\s*册/);
  const units = tagline.match(/(\d+)\s*单元/);
  if (books && Number(books[1]) !== real.books) problems.push(`文案写「${books[1]} 册」,实际 available 册数 ${real.books}`);
  if (units && Number(units[1]) !== real.units) problems.push(`文案写「${units[1]} 单元」,实际 available 单元数 ${real.units}`);
  // 「陆续上线」这类进度话术:只有真有册/单元没开放时才允许出现
  if (/陆续上线|即将|敬请期待|整理中/.test(tagline)) {
    const totals = files.map((f) => JSON.parse(readFileSync(f, 'utf8')));
    let closed = 0;
    const walk = (o) => { for (const v of Object.values(o ?? {})) { if (v && typeof v === 'object' && Array.isArray(v.units)) { if (v.available === false) closed++; closed += v.units.filter((u) => !u.available).length; } else if (v && typeof v === 'object') walk(v); } };
    totals.forEach(walk);
    if (closed === 0) problems.push('文案说内容还在上线,但册/单元全部 available —— 属实为劝退式虚假谦虚');
  }
  if (problems.length) { bad++; console.log(`  ✗ ${name} 「${tagline}」\n      ${problems.join('\n      ')}`); }
  else console.log(`  ✓ ${name} 「${tagline}」 ← 实测 ${real.books} 册 / ${real.units} 单元`);
}
console.log(`CARD_COPY_VERDICT: ${bad ? 'FAIL' : 'PASS'}(${cards.length} 张卡,问题 ${bad})`);
process.exit(bad ? 1 : 0);
