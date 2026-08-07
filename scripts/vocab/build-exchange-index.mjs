/**
 * 从完整 ECDICT 建**不限词表**的屈折索引,专供闸门用。
 *
 * ⚠️ 为什么不用 toefl-inflections.json:那份表只覆盖托福词表的 4471 个词,
 *    而 come / get / take 这类**太常用的词根本不在托福词表里** ——
 *    查表落空后退回后缀规则,`came` 永远匹配不上,整批 phrasal_verb 因此三次重试全废。
 *    「接上权威数据源」和「该源覆盖这批数据」是两回事(第八条规矩的案例)。
 *
 * ECDICT 的 exchange 列格式:`p:came/d:come/i:coming/3:comes`
 *   p=过去式 d=过去分词 i=现在分词 3=第三人称单数 r=比较级 t=最高级 s=复数 0=原型 1=原型变换
 *
 * 产物 data/ecdict-exchange.json(构建缓存,gitignore),形如 { come: ['came','coming','comes'] }
 * ⚠️ 只收**动词/名词屈折**,不收 0/1(那是指回原型的,收了会把 came→come 也当成 came 的屈折)。
 *
 *   node scripts/vocab/build-exchange-index.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'data', 'ecdict-exchange.json');
const SRC = path.join(tmpdir(), 'ecdict-source', 'ecdict.csv');

if (!existsSync(SRC)) {
  process.stderr.write(`找不到 ${SRC}\n先下载:curl -sL -o "${SRC}" https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv\n`);
  process.exit(1);
}

/** 极简 CSV 前缀解析(与 gen-antonyms 同一套)。exchange 在第 11 列(0-based 10)。 */
function parseCsvPrefix(line, n) {
  const out = [];
  let i = 0;
  while (out.length < n && i <= line.length) {
    if (line[i] === '"') {
      let s = ''; i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { s += '"'; i += 2; continue; }
        if (line[i] === '"') { i++; break; }
        s += line[i++];
      }
      out.push(s); if (line[i] === ',') i++;
    } else {
      const j = line.indexOf(',', i);
      if (j === -1) { out.push(line.slice(i)); break; }
      out.push(line.slice(i, j)); i = j + 1;
    }
  }
  return out;
}

/* ⚠️ 只取真正的屈折码。0/1 指回原型 —— 收了它,came 的"屈折形"里会出现 come,
 *    而 come 的屈折形里又有 came,匹配关系变成双向,闸门会放行本不该放的东西。 */
const WANTED = new Set(['p', 'd', 'i', '3', 'r', 't', 's']);

process.stdout.write('· 解析 ECDICT exchange 列…\n');
const idx = {};
let head = true, rows = 0, withEx = 0;
for (const line of readFileSync(SRC, 'utf8').split('\n')) {
  if (head) { head = false; continue; }
  if (!line) continue;
  const c = parseCsvPrefix(line, 11);
  const w = (c[0] || '').trim().toLowerCase();
  if (!w || !/^[a-z][a-z' -]*$/.test(w)) continue;
  rows++;
  const ex = (c[10] || '').trim();
  if (!ex) continue;
  const forms = [];
  for (const part of ex.split('/')) {
    const [k, v] = part.split(':');
    if (!WANTED.has(k) || !v) continue;
    const f = v.trim().toLowerCase();
    if (f && f !== w && /^[a-z' -]+$/.test(f)) forms.push(f);
  }
  if (forms.length) { idx[w] = [...new Set(forms)]; withEx++; }
}

writeFileSync(OUT, JSON.stringify(idx), 'utf8');
process.stdout.write(`· 扫描 ${rows} 词,其中有屈折的 ${withEx}\n`);
process.stdout.write(`→ ${path.relative(process.cwd(), OUT)}\n`);

// 抽验:这几个正是把 phrasal_verb 整批卡住的词
for (const w of ['come', 'get', 'take', 'bring', 'set', 'go', 'run']) {
  process.stdout.write(`  ${w.padEnd(8)} → ${(idx[w] || []).join(', ') || '(无)'}\n`);
}
