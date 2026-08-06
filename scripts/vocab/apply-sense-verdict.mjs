/**
 * 把 Aaron 的义项对账终版裁决(232 词逐条)写进人工清单。
 *
 * ⚠️ 这个脚本只**生成** sense-fix-manual.json,不直接改内容缓存 ——
 *    人工裁决走 emit 阶段合并(写进缓存会被下次闸门重验当模型产出淘汰)。
 *
 * ⚠️ 末尾做**闭合核对**:裁决完之后仍是双义态的词,必须恰好等于
 *    KEEP ∪ FIX ∪ SET。多一个少一个都报出来 —— 清单是人逐条裁的,
 *    如果我这边算出来的集合和它对不上,那一定是有词漏裁或我理解错了,
 *    这种时候不能默默按我的理解出 SQL。
 *
 *   node scripts/vocab/apply-sense-verdict.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');

const KEEP = `founder sue shrimp secular specialty exile merge posture valve
wholesale tariff nickel mint disarm inflate jelly assimilate
magnify permeate dissipate clam avalanche beacon axe skyrocket
ornamental venom hoax varnish relapse audit reptile repel raven
mason surcharge sapphire sicken facsimile incubate ferret defrost
thresh fossilize tributary indent prosecute merchandise mortar
terrace`.split(/\s+/).filter(Boolean);

/** FIX:第二义改成给定值(第一义仍取基线,s1 照旧硬闸)。 */
const FIX = {
  ally: '结盟', dodge: '花招', default: '违约', subsidiary: '辅助的',
  volcanic: '猛烈的', dent: '削弱', commute: '减刑', magnetize: '吸引',
  squall: '尖叫', consonant: '一致的', baroque: '绮靡的', sap: '削弱',
  fossil: '老古董',
  // 前一轮已裁、本轮维持
  starch: '上浆', subterranean: '隐秘的',
  // 调用失败误杀,恢复
  reservoir: '贮藏处',
};

const REVERT = `chronic hover crab armor census pasture reef erode mimic conform
inhibit plight lust maze cardiac glamour vapor overlap frail
soothe opaque ascend willow scarlet daisy refund defective troupe
meditate flaunt embroider diverge maize effluent gradient
accordion barbarian luster silt nurture asteroid seam confiscate
subversive digestive mistrust domesticated corrosive sunburn
reversible perishable ultrasonic erudite ragtime sublimate
spanking defecate rawhide canter overbalance intestine fowl
crevasse crustacean lithograph overcharge gait infiltrate pollen
manure zinc sulfur lathe fresco`.split(/\s+/).filter(Boolean);

/** SET:整条 def_zh 直接覆盖(**绕过 s1**,因为改的就是第一义)。
 *  monochrome 现值「单色，单色图像」用逗号当分隔符,是 43 条逗号问题之一,
 *  Aaron 单独裁了清成「单色」。 */
const SET = { monochrome: '单色' };

const REASON_REVERT = '同概念换词性(与 skip 栏一把尺)/ 幽灵义,Aaron 2026-08-05 终版裁决';

/* ⚠️ 上一轮已裁退回、本轮清单未重复列出的 6 条 —— 继续有效,不能因为
 *    新清单没提就默默复活。闭合核对就是靠它们暴露出来的。 */
const REVERT_PRIOR = ['dagger', 'resin', 'moss', 'fluorescent', 'consequent', 'swelling'];
/* ⚠️ fagot 整词移除(A 段幻觉 + 歧视性词异拼形),不能出现在 sense_fix 里 ——
 *    它的处理在 vocab_toefl_remove_fagot.sql。这里排除掉,免得两份 SQL 打架。 */
const EXCLUDE = ['fagot'];

const out = {
  _note: 'def_zh 义项对账 · Aaron 终版逐条裁决(232 词)。优先级高于模型产出与同义筛。',
  _rule: 'revert=退回基线单义;fix=第二义换成给定值(第一义仍取基线);set=整条覆盖(仅用于改第一义的特例)。合并在 emit 阶段做,不进生成缓存。',
  _gate_policy: 's1(第一义不变)与 s3(体裁)对 revert/fix 仍是硬闸;s2(ECDICT 有依据)对人工条目是告警不拦截 —— 义项该不该收人是权威。set 连 s1 也绕过,因为它改的就是第一义。',
  _verdict_criteria: '打回主判据:①同概念换词性(pasture 牧场/放牧 型)必须与 skip 栏用同一把尺;②幽灵义(sunburn 晒黑=suntan、ultrasonic 超音速=supersonic)属教错级,一律退。',
  revert: [
    ...REVERT.map(h => ({ headword: h, why: REASON_REVERT })),
    ...REVERT_PRIOR.map(h => ({ headword: h, why: '上一轮已裁退回,本轮清单未重复列出但继续有效' })),
    ...EXCLUDE.map(h => ({ headword: h, why: '整词移除(见 vocab_toefl_remove_fagot.sql),不进 sense_fix' })),
  ],
  fix: Object.entries(FIX).map(([headword, second]) => ({
    headword, second,
    why: headword === 'reservoir' ? '同义筛调用失败误杀,恢复'
      : (headword === 'starch' || headword === 'subterranean') ? '前一轮已裁,本轮维持'
        : 'Aaron 终版裁决新值',
  })),
  set: Object.entries(SET).map(([headword, def_zh]) => ({
    headword, def_zh, why: '首义用逗号当分隔符,清为单义(43 条逗号问题之一,单独裁决)',
  })),
  keep: KEEP,
};

writeFileSync(path.join(DATA, 'sense-fix-manual.json'), JSON.stringify(out, null, 2), 'utf8');

/* ── 闭合核对 ── */
const cache = JSON.parse(readFileSync(path.join(DATA, 'generated', 'toefl-sense-fix.json'), 'utf8'));
const baseline = JSON.parse(readFileSync(path.join(DATA, 'toefl-sense-fix-baseline.json'), 'utf8'));

const expectDouble = new Set([...KEEP, ...Object.keys(FIX)]);
const revertSet = new Set([...REVERT, ...REVERT_PRIOR, ...EXCLUDE]);
// 裁决后仍是双义的 = 现在非 skip 且没被 revert,再并上 FIX
const afterDouble = new Set([
  ...Object.entries(cache).filter(([h, v]) => !v.skip && !revertSet.has(h)).map(([h]) => h),
  ...Object.keys(FIX),
]);

const extra = [...afterDouble].filter(h => !expectDouble.has(h));
const missing = [...expectDouble].filter(h => !afterDouble.has(h));

process.stdout.write(`\nKEEP ${KEEP.length} · FIX ${Object.keys(FIX).length} · REVERT ${REVERT.length} · SET ${Object.keys(SET).length}\n`);
process.stdout.write(`裁决后应为双义:${expectDouble.size} 词\n`);
if (extra.length) {
  process.stdout.write(`\n⚠️ 清单外仍是双义的 ${extra.length} 词(未被裁到,需要你补裁):\n`);
  extra.forEach(h => process.stdout.write(`   ${h}:${baseline[h]} → ${cache[h]?.def_zh ?? '?'}\n`));
}
if (missing.length) {
  process.stdout.write(`\n⚠️ 清单里要保留、但当前不是双义态的 ${missing.length} 词:\n   ${missing.join(' ')}\n`);
}
process.stdout.write(`\nVERDICT_CLOSURE: ${extra.length === 0 && missing.length === 0 ? 'PASS' : 'FAIL'}\n`);
process.exit(extra.length === 0 && missing.length === 0 ? 0 : 1);
