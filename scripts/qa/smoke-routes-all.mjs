/**
 * ② 全量册页 URL 枚举 —— 给 `npm run smoke:all` 用。
 *
 * 从各学段的课程 JSON 里枚举**真实存在的 semId**,拼成册页 URL。
 * 日常 PR 不跑这个(40 条约 3 分钟);改 hub / 路由 / 共享组件时手动跑一次。
 *
 * 冒烟门的价值在于「快到每次都愿意跑」——一旦每次要等 3 分钟,迟早会被跳过,
 * 那就退回到「门形同虚设」的老局面。所以全量单独成命令,不塞进默认清单。
 *
 * 用法:node scripts/qa/smoke-routes-all.mjs        # 打印逗号分隔的 URL 清单
 */
import { readdirSync, readFileSync } from 'node:fs';

const LINES = [
  ['src/data/juniorHub', '/junior/hub'],
  ['src/data/gaokaoHub', '/gaokao/hub'],
  ['src/data/primaryHub', '/primary/hub'],
];

const urls = new Set();
for (const [dir, base] of LINES) {
  let files = [];
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.json'));
  } catch {
    continue;
  }
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
    } catch {
      continue;
    }
    for (const [gradeKey, g] of Object.entries(data)) {
      if (!g || typeof g !== 'object' || !g.semesters) continue;
      const num = (gradeKey.match(/(\d+)/) || [, '1'])[1];
      urls.add(`${base}/${num}`);
      for (const semId of Object.keys(g.semesters)) {
        urls.add(`${base}/${num}/semester/${semId}`);
      }
    }
  }
}
// 三条线各一个故意的坏 id(与默认清单里的常驻项一致,全量跑时也带上)
for (const b of ['/junior/hub/7', '/gaokao/hub/1', '/primary/hub/3']) {
  urls.add(`${b}/semester/__BOGUS__`);
}
console.log([...urls].join(','));
