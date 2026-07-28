/**
 * 选版页卡片文案闸门(初中 2 张 + 高中 3 张)。
 *
 * ── 沿革 ────────────────────────────────────────────────────────────
 * 2026-07-27 起因:高中三张卡的副标题是凭记忆写的,三处全错 ——
 *   上外/外研社挂「内容陆续上线」而实测两家一册不缺;「5 大专项」少报了自己一项;
 *   人教「高考真题」对 100% 真实用户不可见(email 白名单)。
 *   定的规约:**卡片文案里的每个数字必须有数据兜底,禁止凭记忆写副标题。**
 * 2026-07-27 定稿改版:整串「7 册 · N 单元 · 6 大专项」删除,五张卡统一只留
 *   「课本同步（YYYY版）」/「课本同步（YYYY新版）」。核对口径随之从"册/单元数"改为"年份格式"。
 *
 * ── 本闸门能核什么、不能核什么(说清楚,别让它假装权威)────────────────
 * ✅ 能核:句式统一、全角括号、年份四位且落在合理区间、五张卡风格一致、
 *         没有回潮的统计数字与进度话术。
 * ❌ 核不了:**年份本身的真伪**。年份出处是 Aaron 提供的课本封面审定徽章照片,
 *         仓库里没有对应数据。要改年份必须回到封面照片核实,闸门救不了你。
 *
 * ── 仍然生效的铁律 ────────────────────────────────────────────────
 * 卡片文案里禁止出现只活在 DB 里的数字(词汇量/题数/篇数)——
 * 改库不会触发本闸门,写进去必然长歪。要看那些数跑 gaokao-content-census{,2}.mjs。
 */
import { readFileSync } from 'node:fs';

const SOURCES = [
  { file: 'src/lib/gaokaoHub/publisher.ts', label: '高中', expect: 3 },
  { file: 'src/lib/juniorHub/publisher.ts', label: '初中', expect: 2 },
];

/** 定稿句式:课本同步（YYYY版）或 课本同步（YYYY新版）。括号必须全角。 */
const SHAPE = /^课本同步（(\d{4})(新?)版）$/;
const YEAR_MIN = 2000;
const YEAR_MAX = 2030;
/** 回潮黑名单:凭记忆写的进度话术,以及只活在 DB 里的统计数字 */
const PROGRESS_TALK = /陆续上线|即将|敬请期待|整理中|筹备中/;
const STAT_NUMBERS = /\d+\s*(册|单元|专项|词|题|篇|关)/;

let bad = 0;
for (const { file, label, expect } of SOURCES) {
  const src = readFileSync(file, 'utf8');
  const cards = [...src.matchAll(/(\w+): \{ name: "([^"]+)"[^}]*?tagline: "([^"]+)"/g)];
  if (cards.length !== expect) {
    bad++;
    console.log(`  ✗ ${label} 从 ${file} 解析出 ${cards.length} 张卡,期望 ${expect} —— 解析器与文件结构脱节,先修解析器`);
    continue;
  }
  for (const [, , name, tagline] of cards) {
    const problems = [];
    const m = SHAPE.exec(tagline);
    if (!m) {
      problems.push('不符合定稿句式「课本同步（YYYY版）」(注意括号必须全角（）)');
      // 半角括号是最容易犯的,单独点名,省得只看到一句笼统报错
      if (/[()]/.test(tagline)) problems.push('用了半角括号 ()');
    } else {
      const year = Number(m[1]);
      if (year < YEAR_MIN || year > YEAR_MAX) problems.push(`年份 ${year} 不在 ${YEAR_MIN}–${YEAR_MAX},疑似手滑`);
      // 「2024新版」(初中)与「2019版」(高中)后缀本就不同,SHAPE 已保证共同框架,不再强求后缀一致
    }
    if (PROGRESS_TALK.test(tagline)) problems.push('出现进度话术 —— 2026-07-27 实测册/单元全部 available,这类话是假的');
    if (STAT_NUMBERS.test(tagline)) problems.push('出现统计数字 —— 卡片文案禁写只活在 DB 里的数(改库不触发本闸门,必然长歪)');
    if (problems.length) { bad++; console.log(`  ✗ ${label} ${name} 「${tagline}」\n      ${problems.join('\n      ')}`); }
    else console.log(`  ✓ ${label} ${name} 「${tagline}」`);
  }
}

console.log(`CARD_COPY_VERDICT: ${bad ? 'FAIL' : 'PASS'}(问题 ${bad})`);
process.exit(bad ? 1 : 0);
