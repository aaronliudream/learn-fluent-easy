/**
 * g14(音标占位符规则)的**已知答案样本**。
 *
 * 规则(Aaron 2026-08-18 定,写在 gates.mjs 的 g14 注释里)——**一条原则**:
 *     真实词形念,词典缩写不念。
 *   sb / sth / sw / sb's / sth's → 不念(读不出来)
 *   one's → /wʌnz/ · oneself → /wʌnˈsɛlf/ · do / doing → 念
 *   括号内不念且不出现括号 · 斜杠只念第一个
 *
 * ⚠️ SAMPLES 里全部是**库里真实存在过的坏值**,而且**上一版 g14 全部放行**。
 *    上一版判据对、实现错:正则写 `sʌmθ`,模型输出 `ˈsʌm.θɪŋ`,音节点把它切开。
 *    **判据对不等于实现对** —— 这些值要一直留着当真阳性。
 * ⚠️ 最后两条是**第一轮修正改出来的中间值**:当时 oneself 被归进"不念",
 *    与 one's 自相矛盾,Aaron 点出后统一。改规则时旧的"正确值"会变成新的坏值,
 *    这两条留在这里就是那次自相矛盾的凭据。
 * ⚠️ GOOD 一组不能省。只验坏值被拦、不验好值放行,等于允许换一种错法;
 *    subject / substance 更是硬判据 —— 真词里的 sʌb 一旦被误伤,
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

/** 必须被拦下:库里真实出现过的坏值 [词条, 坏值, 病因] */
export const SAMPLES = [
  ['help sb with',              '/hɛlp sɪb wɪð/',              'sb 念成 sɪb'],
  ["to sb's surprise",          '/tə sbz səˈpraɪz/',           "sb's 念成 sbz"],
  ['fight against sb/sth',      '/faɪt əˈɡeɪnst ˈsʌm.bɒ.di/',  'sb 念成 somebody'],
  ['keep on doing sth',         '/kiːp ɒn ˈduː.ɪŋ ˈsʌm.θɪŋ/',  'sth 念成 something'],
  ['ready to do sth',           '/ˈrɛd.i tə duː ˈsʌm.θɪŋ/',    'sth 念成 something'],
  ['show interest in sth',      '/ʃoʊ ˈɪn.trəst ɪn ˈsʌm.θɪŋ/', 'sth 念成 something'],
  ["try one's best",            '/traɪ bɛst/',                 "one's 该念却省了"],
  ["make one's own decision",   '/meɪk oʊn dɪˈsɪʒ.ən/',        "one's 该念却省了"],
  ['move on (to sth)',          '/muːv ɑn (tuː)/',             '括号原样抄进音标'],
  ['run low (on sth)',          '/rʌn loʊ ɑn/',                '括号没了但 on 念了'],
  ['cut sth in/into sth',       '/kʌt ɪn ˈɪntu/',              '斜杠两边都念了'],
  ['throw oneself into',        '/θroʊ jʊrˈsɛlf ˈɪntuː/',      'oneself 念成 yourself'],
  ['stop sth from doing',       '/stɑp frʌm/',                 'doing 漏念'],
  /* ↓ 第一轮修正改出来的中间值 —— 规则统一后它们也是错的 */
  ["put oneself in sb's shoes", '/pʊt ɪn ʃuːz/',               'oneself 被当成不念的占位符吞掉了'],
  ['throw oneself into',        '/θroʊ ˈɪntuː/',               '同上'],
];

/** 必须放行 [词条, 值] */
export const GOOD = [
  // 修正后的终值
  ['help sb with',              '/hɛlp wɪð/'],
  ["to sb's surprise",          '/tə səˈpraɪz/'],
  ['fight against sb/sth',      '/faɪt əˈɡeɪnst/'],
  ['keep on doing sth',         '/kiːp ɒn ˈduː.ɪŋ/'],
  ['ready to do sth',           '/ˈrɛd.i tə duː/'],
  ['show interest in sth',      '/ʃoʊ ˈɪn.trəst ɪn/'],
  ["try one's best",            '/traɪ wʌnz bɛst/'],
  ["make one's own decision",   '/meɪk wʌnz oʊn dɪˈsɪʒ.ən/'],
  ['move on (to sth)',          '/muːv ɑn/'],
  ['run low (on sth)',          '/rʌn loʊ/'],
  ['cut sth in/into sth',       '/kʌt ɪn/'],
  ['stop sth from doing',       '/stɑp frʌm ˈduːɪŋ/'],
  ["put oneself in sb's shoes", '/pʊt wʌnˈsɛlf ɪn ʃuːz/'],
  ['throw oneself into',        '/θroʊ wʌnˈsɛlf ˈɪntuː/'],
  // 库里已确认正确的值
  ["pull one's weight",         '/pʊl wʌnz weɪt/'],
  ["keep one's cool",           '/kip wʌnz kul/'],
  ['drive sb. crazy',           '/draɪv ˈkreɪzi/'],
  ["take sb's temperature",     '/teɪk ˈtɛmpərətʃər/'],
  ['feel free (to do sth)',     '/fiːl friː/'],
  ['be home to sb/sth',         '/bi hoʊm tu/'],
  ['succeed in doing sth',      '/səkˈsiːd ɪn ˈduːɪŋ/'],
  ['unlock the secrets of sth', '/ʌnˈlɒk ðə ˈsiː.krɪts ʌv/'],
  ['put sth. to good use',      '/pʊt tə ɡʊd juːs/'],
  ['oneself',                   '/wʌnˈsɛlf/'],   // 词条本身就是 oneself,这么读是对的
  ['subject',                   '/ˈsʌb.dʒɪkt/'], // ★ 真词里的 sʌb 不许误伤
  ['substance',                 '/ˈsʌb.stəns/'], // ★ 同上
  ['do chores',                 '/duː tʃɔːz/'],  // 实义动词 do,不是占位符
  ['have to do with',           '/hæv tə du wɪð/'],
];

/**
 * 库里还没改成终值的行 [词条, 库里现值, 目标值, 原因]。
 * fix-ipa-placeholders.mjs 拿这个出 SQL;跑完并核实后清空。
 */
export const PENDING = [
  ["put oneself in sb's shoes", '/pʊt ɪn ʃuːz/',  '/pʊt wʌnˈsɛlf ɪn ʃuːz/',  'oneself 统一为念 /wʌnˈsɛlf/'],
  ['throw oneself into',        '/θroʊ ˈɪntuː/',  '/θroʊ wʌnˈsɛlf ˈɪntuː/',  'oneself 统一为念 /wʌnˈsɛlf/'],
];

/**
 * ⚠️ **这道门判不了的**,记录在此,不写成断言:
 *   put oneself in sb's shoes  /pʊt wʌnˈsɛlf ɪn ˈsʊz/
 *   —— 占位符处理全对,错的是 shoes 转成了 ˈsʊz。那是真实音标错,只能人读。
 *   为它硬造一道"音标对不对"的闸门,只会拦错一堆好数据。
 *   见 dont-fake-a-gate-for-unjudgeable。
 */

if (RUN_DIRECT) main();

function main() {
  let fail = 0;
  const chk = (want, hw, ipa, why) => {
    const got = !!g14(ipa, hw);
    const ok = got === want; if (!ok) fail++;
    console.log(`  ${ok ? '✓' : '✗'} ${want ? '应拦下' : '应放行'}  ${hw.padEnd(27)} ${String(ipa).padEnd(30)} ${why || ''}`);
  };

  console.log('══ 库里真实出现过的坏值(上一版 g14 全部放行)══');
  for (const [hw, bad, why] of SAMPLES) chk(true, hw, bad, why);
  console.log('\n══ 必须放行 ══');
  for (const [hw, ipa] of GOOD) chk(false, hw, ipa);

  console.log('\n══ 待改行的目标值也要过闸 ══');
  for (const [hw, from, to] of PENDING) { chk(true, hw, from, '库里现值'); chk(false, hw, to, '目标值'); }

  const n = SAMPLES.length + GOOD.length + PENDING.length * 2;
  console.log(`\n通过 ${n - fail} · 失败 ${fail}`);
  console.log(`GATE_VERDICT ${fail === 0 ? 'PASS' : 'FAIL'}`);
  process.exit(fail ? 1 : 0);
}
