/**
 * ④ 给关5/关10 填空句型题注入 stem_cn(填入正确答案后整句的中文翻译)。
 * 按行注入,保留原 JSON 一行一题的排版;key=题干原文(未转义),已存在 stem_cn 的行跳过。
 * 数据源:本文件 CN 映射(CC 生成,双角色自审:译文必须对应"填答案后的完整句")。
 * 用法: node scripts/american/apply-stem-cn.mjs   → 改 docs/american/book2/am2_l*.json,后续重跑 seed 生效。
 */
import { readFileSync, writeFileSync } from "node:fs";

// { lesson_id: { "题干原文(与 JSON 中 stem 完全一致,未转义)": "中文翻译" } }
const CN = {
  am2_l09: {
    '"The clock stopped ___ five to twelve."(具体钟点)': "大钟在差五分十二点时停了。",
    '"___ that moment, everybody laughed."': "就在那一刻,所有人都笑了。",
    '"The war ended ___ 1945."(年份)': "战争在1945年结束。",
    '"It is very cold ___ winter."(季节)': "冬天非常冷。",
    '"I get up early ___ the morning."': "我早上起得很早。",
    '"We went to the Town Hall ___ Wednesday."(星期)': "我们星期三去了市政厅。",
    '"My birthday is ___ November 7th."(具体日期)': "我的生日在11月7号。",
    '"The train is leaving ___ ten minutes."(十分钟后)': "火车十分钟后出发。",
    '"The clock would strike twelve ___ twenty minutes\' time."(20分钟后)': "再过二十分钟,大钟就会敲响十二点。",
    '"He got married ___ twenty."(在20岁时)': "他在二十岁时结了婚。",
    '"The shops are open ___ 9 ___ 5."(从9点到5点)': "商店从九点开到五点。",
    '"The movie starts ___ 8 o\'clock."(钟点)': "电影八点开始。",
    '"It often snows ___ January."(只说月份)': "一月常常下雪。",
  },
};

let total = 0, patched = 0;
for (const [lid, map] of Object.entries(CN)) {
  const file = `docs/american/book2/${lid}.json`;
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/"stem":\s*"((?:[^"\\]|\\.)*)"/);
    if (!m) continue;
    let stem;
    try { stem = JSON.parse('"' + m[1] + '"'); } catch { continue; }
    if (!(stem in map)) continue;
    total++;
    if (/"stem_cn":/.test(lines[i])) continue; // 已有则跳过(幂等)
    const cnEsc = JSON.stringify(map[stem]); // 带引号且转义
    // 在 "stem": "...", 之后插入 "stem_cn": "...",
    lines[i] = lines[i].replace(/("stem":\s*"(?:[^"\\]|\\.)*",)/, `$1 "stem_cn": ${cnEsc},`);
    patched++;
  }
  writeFileSync(file, lines.join("\n"), "utf8");
  console.log(`${lid}: 命中 ${Object.keys(map).length} 条`);
}
console.log(`\n匹配题干 ${total} 条,注入 ${patched} 条(其余已存在跳过)。`);
