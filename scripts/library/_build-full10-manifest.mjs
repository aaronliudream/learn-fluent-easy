// 从 full10 JSON 建 _manifest.json:只收「输入文件夹里真实存在的期望文件」,自动排除杂图/旧图。
// 用法: node scripts/library/_build-full10-manifest.mjs <key> "<输入文件夹>" [from] [to]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const KEY = process.argv[2];
const IN = process.argv[3];
const FROM = +(process.argv[4] || 1), TO = +(process.argv[5] || 35);
if (!KEY || !IN) { console.error('用法: node _build-full10-manifest.mjs <key> "<输入文件夹>" [from] [to]'); process.exit(1); }
const images = [];
let chaptersWithImages = 0;
for (let ch = FROM; ch <= TO; ch++) {
  const f = `scripts/library/books/illus-data/${KEY}/ch${ch}-full10.json`;
  if (!existsSync(f)) continue;
  const data = JSON.parse(readFileSync(f, "utf8"));
  let n = 0;
  for (const im of (data.images || []).sort((a, b) => a.k - b.k)) {
    const file = `ch${ch}-${im.k}-${im.slug}.jpg`;
    if (!existsSync(`${IN}/${file}`)) continue; // 只收真实存在的
    images.push({ file, chapter: ch, k: im.k, seq: im.seq, slug: im.slug, alt: im.alt });
    n++;
  }
  if (n) { chaptersWithImages++; console.log(`  ch${ch}: ${n} 张`); }
}
writeFileSync(`scripts/library/books/illus-data/${KEY}/_manifest.json`, JSON.stringify({ images, cover: null }, null, 1));
console.log(`✓ manifest: ${images.length} 张 · ${chaptersWithImages} 章 → illus-data/${KEY}/_manifest.json`);
