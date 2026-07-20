// 枞树按书覆盖 library_word_senses:全局卡对本书误读的词 → 书中义(按 book_key 隔离)。
// 来源:Layer④pairs扫 + FF扫。want/prime/swallows=全局卡义对本书是错义;gaily=古今异义(鲜艳 vs 欢乐)。
import { writeFileSync } from "node:fs";
// [normalized, word, ipa(美音), pos, sense_key, 书中义gloss_cn, gloss_en, archaic, modern_cn|null, modern_en|null, ex_en, ex_cn]
const E = [
  ["want", "want", "/wɑːnt/", "v.", "desire", "想要、希望", "to wish for or desire", false, null, null, "The children want a bigger tree this year.", "孩子们今年想要一棵更大的树。"],
  ["wanted", "want", "/ˈwɑːntɪd/", "v.", "desire", "想要、希望(过去式)", "wished for or desired (past)", false, null, null, "He wanted to leave before the snow came.", "他想在下雪之前离开。"],
  ["prime", "prime", "/praɪm/", "n.", "peak-of-life", "(人生的)壮年、盛年", "the best and strongest years of one's life", false, "首要的、最主要的", "most important, chief", "The athlete was in his prime that season.", "那个赛季,这名运动员正当盛年。"],
  ["swallows", "swallow", "/ˈswɑːloʊz/", "n.", "bird", "燕子", "small, fast-flying birds", false, "吞、咽下", "to make food go down the throat", "In spring the swallows return to the old barn.", "春天,燕子飞回那座旧谷仓。"],
  ["gaily", "gaily", "/ˈɡeɪli/", "adv.", "brightly", "鲜艳地、色彩明丽地", "brightly, in vivid colors", true, "欢乐地、愉快地", "merrily, cheerfully", "The hall was hung with gaily colored ribbons.", "大厅里挂满了色彩鲜艳的丝带。"],
];
const q = (s) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
let sql = "-- 枞树按书覆盖 library_word_senses(book_key=fir-tree·美音·点词/复习优先书中义,按book隔离)。\n";
sql += "-- want/wanted/prime/swallows=全局卡义对本书误读(缺乏/首要/吞没)→ 覆盖为书中义;gaily=古今异义(鲜艳vs欢乐)。\n";
sql += "-- 幂等 DO UPDATE。想改书内某词回全局义,删该 (book_key,normalized) 行即可。\nBEGIN;\n";
sql += "INSERT INTO public.library_word_senses (book_key, normalized, word, ipa, pos, sense_key, gloss_cn, gloss_en, archaic, modern_cn, modern_en, example_en, example_cn, proper) VALUES\n";
sql += E.map((e) =>
  `  ('fir-tree',${q(e[0])},${q(e[1])},${q(e[2])},${q(e[3])},${q(e[4])},${q(e[5])},${q(e[6])},${e[7]},${q(e[8])},${q(e[9])},${q(e[10])},${q(e[11])},false)`
).join(",\n");
sql += `\nON CONFLICT (book_key, normalized) DO UPDATE SET
  word=EXCLUDED.word, ipa=EXCLUDED.ipa, pos=EXCLUDED.pos, sense_key=EXCLUDED.sense_key,
  gloss_cn=EXCLUDED.gloss_cn, gloss_en=EXCLUDED.gloss_en, archaic=EXCLUDED.archaic,
  modern_cn=EXCLUDED.modern_cn, modern_en=EXCLUDED.modern_en,
  example_en=EXCLUDED.example_en, example_cn=EXCLUDED.example_cn;
COMMIT;\n`;
writeFileSync("SQLAA/library-fir-tree-word-senses.sql", sql);
console.log(`✓ SQLAA/library-fir-tree-word-senses.sql (${E.length} 条:want/wanted/prime/swallows/gaily)`);
