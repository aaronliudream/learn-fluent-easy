// reading 超纲词审:known = 初中 junior_vocab(全 volume) ∪ U1 senior词 ∪ 基础功能/常见词。
// 6 篇课文里出现、不在 known 的内容词 → 列出人工核(衍生篇尤其要 0 超纲生词)。
// 词形归一:小写 + 去常见后缀(s/es/ed/ing/ly/er/est/'s)再比对。
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const ROOT = 'C:\\Projects\\learn-fluent-easy\\';
const env = Object.fromEntries(readFileSync(ROOT + '.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

const DIR = ROOT + 'scripts\\senior-rebuild\\required1-u1\\';
const reading = JSON.parse(readFileSync(DIR + 'required1-u1-reading.json', 'utf8'));
const vocab = JSON.parse(readFileSync(DIR + 'required1-u1-vocab.json', 'utf8'));

// 1) 初中词
const known = new Set();
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from('junior_vocab').select('word').range(from, from + 999);
  if (error) { console.log('junior_vocab 读失败:', error.message); break; }
  if (!data || !data.length) break;
  data.forEach(r => known.add(String(r.word).toLowerCase().trim()));
  if (data.length < 1000) break;
}
// 2) U1 senior 词 + 短语词
vocab.words.forEach(w => known.add(w.word.toLowerCase()));
(vocab.phrases || []).forEach(p => p.phrase.toLowerCase().split(/[^a-z]+/).forEach(t => t && known.add(t)));
// 3) 基础功能/常见词(高一默认会)
const BASIC = `a an the this that these those i you he she it we they me him her us them my your his its our their mine yours
and or but so because if when while as than then also too not no yes do does did done be am is are was were been being have has had
will would can could may might must shall should to of in on at for with from by about into over under after before during between
out up down off here there now today tomorrow yesterday day week year time first second third next last more most many much some any all
each every both other another such very quite really just only even still well good better best new old big small long short hard easy
who what which whom whose where why how get got go goes went come came make made take took give gave find found know knew think thought
say said tell told ask asked want wanted need needed try tried use used help work works working school class student students teacher
teachers friend friends people person home life day year school study studies learn learning read reading write writing speak spoken
play played game games team food parents mother father family city country world thing things way ways idea问 own kind feel felt
morning afternoon evening night week weekend wednesday lab science maths english chinese history football music dance dancing
problem problems question questions answer answers part right wrong fun nice kind sure online internet computer hobby hobbies
member members club clubs activity activities course courses homework exam test mistake mistakes future
anxious awkward concentrate experiment frightened confident confidence difficult happy homeless junior senior little lot
whatever like dear discuss listen often cannot talk unhealthy worried worry animals love parks keep manage management one
sports subjects freedom free always great story whole kept difficult lonely shy adult adults wild`
  .split(/\s+/).map(s => s.toLowerCase()).filter(s => /^[a-z]+$/.test(s));
BASIC.forEach(w => known.add(w));
// 缩写(整词放行)
`i'm i'll i've won't don't didn't can't cannot couldn't wouldn't isn't wasn't weren't it's that's you'll he'll she'll we'll they'll`
  .split(/\s+/).forEach(w => known.add(w));
// 专有名词(人名/地名,课文角色)放行
const PROPER = new Set(`adam chen lei susan luo han jing joyce max amy tim mike eric ann thando worried`.split(/\s+/));
PROPER.forEach(w => known.add(w));

const strip = (w) => {
  w = w.toLowerCase();
  const cands = [w];
  if (w.endsWith("'s")) cands.push(w.slice(0, -2));
  if (w.endsWith('ies')) cands.push(w.slice(0, -3) + 'y');
  if (w.endsWith('es')) cands.push(w.slice(0, -2));
  if (w.endsWith('s')) cands.push(w.slice(0, -1));
  if (w.endsWith('ing')) { cands.push(w.slice(0, -3)); cands.push(w.slice(0, -3) + 'e'); }
  if (w.endsWith('ed')) { cands.push(w.slice(0, -2)); cands.push(w.slice(0, -1)); }
  if (w.endsWith('ly')) cands.push(w.slice(0, -2));
  if (w.endsWith('er')) cands.push(w.slice(0, -2));
  if (w.endsWith('est')) cands.push(w.slice(0, -3));
  return cands;
};
const isKnown = (w) => strip(w).some(c => known.has(c));

console.log('known 词库:', known.size, '(初中 + U1 + 基础词)');
let totalFlag = 0;
for (const p of reading.passages) {
  const toks = (p.body.toLowerCase().match(/[a-z][a-z'-]*/g) || []);
  const flagged = [...new Set(toks)].filter(t => t.length >= 3 && !isKnown(t)).sort();
  if (flagged.length) { totalFlag += flagged.length; console.log(`\n[${p.code}] ${p.title} — 待核 ${flagged.length}:`); console.log('  ', flagged.join(', ')); }
  else console.log(`\n[${p.code}] ${p.title} — ✅ 0 超纲(全部已知)`);
}
console.log('\n合计待核词:', totalFlag, '(人工判:这些是否真超纲;真超纲→改写/换词;常见词→可加进 BASIC 白名单)');
process.exit(0);
