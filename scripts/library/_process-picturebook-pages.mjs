/**
 * 绘本模式页图 · 后处理(接 illustrations-in/<夹>/ 里 AI 出的整页图)。
 * 处理:sharp resize ≤1200 宽 + JPEG q82(mozjpeg)+ 去元数据 → 输出 p1.jpg / p2.jpg / …(按文件名里的页号)。
 * 与 process-book-illus.mjs 的区别:那条流水线是"章内插图 + manifest 锚点 → position",
 * 这里是"一页一图"(page_index),不需要 manifest,只按 P<N> 命名取页号。
 * ⚠️ 只处理图,不写库、不传桶。传桶:upload-illustrations.mjs <out目录> <桶内前缀>;库仍走 SQLAA 的 SQL(Aaron 跑)。
 *
 * 用法:node scripts/library/_process-picturebook-pages.mjs "<输入夹>" "<输出夹>" [宽度]
 * 例:  node scripts/library/_process-picturebook-pages.mjs scripts/library/illustrations-in/aesop scripts/library/illustrations-out/aesop-easy-readers/ch1
 */
import { readdirSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const IN = process.argv[2];
const OUT = process.argv[3];
const WIDTH = Number(process.argv[4] || 1200);
if (!IN || !OUT) {
  console.error('用法: node scripts/library/_process-picturebook-pages.mjs "<输入夹>" "<输出夹>" [宽度]');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const files = readdirSync(IN).filter((f) => /\.(jpe?g|png)$/i.test(f));
const rows = [];
for (const f of files) {
  const m = f.match(/p(\d+)/i); // P1.jpg / page2.png / p3-final.jpeg → 页号
  if (!m) {
    console.log("跳过(文件名里没有页号 p<N>):", f);
    continue;
  }
  const page = Number(m[1]);
  const dest = `${OUT}/p${page}.jpg`;
  const info = await sharp(`${IN}/${f}`)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  rows.push({ page, file: `p${page}.jpg`, w: info.width, h: info.height, kb: Math.round(info.size / 1024) });
}
rows.sort((a, b) => a.page - b.page);
for (const r of rows) console.log(`  ✓ ${r.file}  ${r.w}x${r.h}  ${r.kb}KB  ratio=${(r.w / r.h).toFixed(3)}`);
// 绘本容器写死 4:3(object-cover);比例偏离过大会裁掉画面,这里直说清楚。
for (const r of rows) {
  const ratio = r.w / r.h;
  if (Math.abs(ratio - 4 / 3) > 0.05) console.log(`  ⚠️ p${r.page} 比例 ${ratio.toFixed(3)} 偏离 4:3,渲染时会被裁切`);
}
console.log(`\n共 ${rows.length} 张 → ${OUT}\n下一步:node scripts/library/upload-illustrations.mjs "${OUT}" <桶内前缀>`);
