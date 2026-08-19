/**
 * g14(IPA 里不许出现占位符)的**已知答案样本**。
 *
 * ⚠️ 这道门只管读不出来的缩写 sb/sth/sw,不管 one's —— 后者是真实词形。
 *    判据一开始把两类一起卡,连挂 6 个词才发现是判据错、不是模型错。
 *
 * ⚠️ subject / substance 那两条是硬判据:真词里的 sʌb 一旦被误伤,
 *    受害面是整个库的单词条目,不是这 50 个短语。
 *
 * 用法:node scripts/vocab/test-ipa-gate.mjs   末行 GATE_VERDICT
 */
import { g14_ipaNoPlaceholder as g14 } from './gates.mjs';
const CASES = [
  ['/pʊl wʌnz weɪt/',        "pull one's weight",     false, "one's 是真实词形,读 /wʌnz/ 对"],
  ['/ɡɛt tuː wʌnz fiːt/',    "get to one's feet",     false, '同上'],
  ["/teɪk sb's brɛθ əˈweɪ/", "take sb's breath away", true,  'IPA 里直接抄了 sb'],
  ['/ˈɑːrɡjuː wɪð ˈsʌb/',    'argue with sb',         true,  'sb 被读成 /sʌb/'],
  ['/ˈɑːrɡjuː wɪð/',         'argue with sb',         false, '只注实词,对'],
  ['/ˈsʌb.dʒɪkt/',           'subject',               false, '★ 真词里的 sʌb 不能误伤'],
  ['/ˈsʌb.stəns/',           'substance',             false, '★ 同上'],
  ['/teɪk keər əv sʌmθɪŋ/',  'take care of sth',      true,  'sth 被读成 /sʌmθɪŋ/'],
];
let f = 0;
for (const [ipa, hw, want, why] of CASES) {
  const got = !!g14(ipa, hw); const ok = got === want; if (!ok) f++;
  console.log(`  ${ok ? '✓' : '✗'} ${want ? '应拦下' : '应放行'}  ${hw.padEnd(23)} ${ipa.padEnd(26)} ${why}`);
}
console.log(`\n通过 ${CASES.length - f} · 失败 ${f}`);
console.log(`GATE_VERDICT ${f === 0 ? 'PASS' : 'FAIL'}`);
process.exit(f ? 1 : 0);
