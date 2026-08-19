/**
 * g14(音标占位符规则)的**已知答案样本**。
 *
 * 规则(Aaron 2026-08-18 定死,写在 gates.mjs 的 g14 注释里):
 *   sb/sth/sw/sb's/sth's/oneself 不念 · one's 念 /wʌnz/ · 括号内不念且不出现括号 ·
 *   斜杠只念第一个 · do/doing 念(真实词形,同 one's)。
 *
 * ⚠️ 下面 14 条**全部是库里真实存在过的坏值**,而且**上一版 g14 全部放行**。
 *    上一版的判据是对的,实现错了:正则写 `sʌmθ`,模型输出 `ˈsʌm.θɪŋ`,音节点把它切开。
 *    **判据对不等于实现对** —— 所以这些坏值要一直留在这里当真阳性。
 *
 * ⚠️ 修正值同样要过闸。只验"坏值被拦"不验"好值放行",等于允许换一种错法。
 *
 * ⚠️ subject / substance 那两条是硬判据:真词里的 sʌb 一旦被误伤,
 *    受害面是整个库的单词条目,不是这几十个短语。
 *
 * 用法:node scripts/vocab/test-ipa-gate.mjs   末行 GATE_VERDICT
 */
import { g14_ipaNoPlaceholder as g14 } from './gates.mjs';
import { fileURLToPath } from 'node:url';
/* ⚠️ 这个文件同时被 fix-ipa-placeholders.mjs 当**名单**import。
   不加这道守卫的话,import 会连带跑完测试并 process.exit(0),
   调用方的后续代码一行都不执行 —— 而且它"成功退出",看不出任何异常。 */
const RUN_DIRECT = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

/* [词条, 坏值(必须拦), 修正值(必须放行), 病因] */
export const FIXES = [
  ['help sb with',              '/hɛlp sɪb wɪð/',              '/hɛlp wɪð/',                  'sb 念成 sɪb'],
  ["to sb's surprise",          '/tə sbz səˈpraɪz/',           '/tə səˈpraɪz/',               "sb's 念成 sbz"],
  ['fight against sb/sth',      '/faɪt əˈɡeɪnst ˈsʌm.bɒ.di/',  '/faɪt əˈɡeɪnst/',             'sb 念成 somebody'],
  ['keep on doing sth',         '/kiːp ɒn ˈduː.ɪŋ ˈsʌm.θɪŋ/',  '/kiːp ɒn ˈduː.ɪŋ/',           'sth 念成 something'],
  ['ready to do sth',           '/ˈrɛd.i tə duː ˈsʌm.θɪŋ/',    '/ˈrɛd.i tə duː/',             'sth 念成 something'],
  ['show interest in sth',      '/ʃoʊ ˈɪn.trəst ɪn ˈsʌm.θɪŋ/', '/ʃoʊ ˈɪn.trəst ɪn/',          'sth 念成 something'],
  ["try one's best",            '/traɪ bɛst/',                 '/traɪ wʌnz bɛst/',            "one's 该念却省了"],
  ["make one's own decision",   '/meɪk oʊn dɪˈsɪʒ.ən/',        '/meɪk wʌnz oʊn dɪˈsɪʒ.ən/',   "one's 该念却省了"],
  ["put oneself in sb's shoes", '/pʊt wʌnˈsɛlf ɪn ˈsʊz/',      '/pʊt ɪn ʃuːz/',               'oneself 被念 + shoes 转错成 ˈsʊz'],
  ['move on (to sth)',          '/muːv ɑn (tuː)/',             '/muːv ɑn/',                   '括号原样抄进音标'],
  ['run low (on sth)',          '/rʌn loʊ ɑn/',                '/rʌn loʊ/',                   '括号没了但 on 念了'],
  ['cut sth in/into sth',       '/kʌt ɪn ˈɪntu/',              '/kʌt ɪn/',                    '斜杠两边都念了'],
  /* ↓ 这两条不在 Aaron 的 12 条名单里,是拿新闸门扫全库 49 条时另外查出来的 */
  ['throw oneself into',        '/θroʊ jʊrˈsɛlf ˈɪntuː/',      '/θroʊ ˈɪntuː/',               'oneself 念成 yourself(同样违反已定规则)'],
  ['stop sth from doing',       '/stɑp frʌm/',                 '/stɑp frʌm ˈduːɪŋ/',          'doing 漏念(规则未覆盖 do/doing,按真实词形处理)'],
];

/* 库里已确认**正确**的值:必须放行。少了这一组,把闸门收得过紧也看不出来。 */
const GOOD = [
  ["pull one's weight",      '/pʊl wʌnz weɪt/'],
  ["keep one's cool",        '/kip wʌnz kul/'],
  ['drive sb. crazy',        '/draɪv ˈkreɪzi/'],
  ["take sb's temperature",  '/teɪk ˈtɛmpərətʃər/'],
  ['feel free (to do sth)',  '/fiːl friː/'],
  ['be home to sb/sth',      '/bi hoʊm tu/'],
  ['succeed in doing sth',   '/səkˈsiːd ɪn ˈduːɪŋ/'],
  ['unlock the secrets of sth', '/ʌnˈlɒk ðə ˈsiː.krɪts ʌv/'],
  ['put sth. to good use',   '/pʊt tə ɡʊd juːs/'],
  ['subject',                '/ˈsʌb.dʒɪkt/'],          // ★ 真词里的 sʌb 不许误伤
  ['substance',              '/ˈsʌb.stəns/'],          // ★ 同上
  ['do chores',              '/duː tʃɔːz/'],           // 实义动词 do,不是占位符
  ['have to do with',        '/hæv tə du wɪð/'],
];

if (RUN_DIRECT) main();

function main() {
let fail = 0;
const chk = (want, hw, ipa, why) => {
  const got = !!g14(ipa, hw);
  const ok = got === want; if (!ok) fail++;
  console.log(`  ${ok ? '✓' : '✗'} ${want ? '应拦下' : '应放行'}  ${hw.padEnd(27)} ${String(ipa).padEnd(30)} ${why}`);
};

console.log('══ 库里的坏值(上一版 g14 全部放行)══');
for (const [hw, bad, , why] of FIXES) chk(true, hw, bad, why);
console.log('\n══ 修正值(换一种错法也不行)══');
for (const [hw, , good] of FIXES) chk(false, hw, good, '');
console.log('\n══ 库里已确认正确的值 ══');
for (const [hw, ipa] of GOOD) chk(false, hw, ipa, '');

const n = FIXES.length * 2 + GOOD.length;
console.log(`\n通过 ${n - fail} · 失败 ${fail}`);
console.log(`GATE_VERDICT ${fail === 0 ? 'PASS' : 'FAIL'}`);
process.exit(fail ? 1 : 0);
}
