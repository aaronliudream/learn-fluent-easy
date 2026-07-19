/**
 * 图书馆插图 · AI 章图后处理 + 定位 + seed SQL(接 illustrations-in/<Book>/ 里 AI 出的图)。
 * 处理:sharp resize ≤1000宽(章图)/≤800宽(封面) + JPEG q82(mozjpeg)+ 去元数据 → processed/。
 * 定位:读 illus-data/<key>/_manifest.json 里每图锚点 seq → 换算成【章内段号 1-based】= library_illustrations.position。
 *   同章防撞:按 seq 排,position 严格递增。封面写进 library_books.cover.image(保留 c1/c2 降级底)。
 * 用法:node scripts/library/process-book-illus.mjs <book_key> "<输入文件夹>" [coverC1 coverC2]
 * ⚠️ 只处理 + 出 SQL,不写库;传桶用 upload-illustrations.mjs(需 .env.local 的 service key)。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import sharp from "sharp";

const KEY = process.argv[2];
const IN = process.argv[3];
const C1 = process.argv[4] || "#0e7490";
const C2 = process.argv[5] || "#0c4a6e";
if (!KEY || !IN) { console.error('用法: node scripts/library/process-book-illus.mjs <book_key> "<输入文件夹>" [c1 c2]'); process.exit(1); }
const OUT = `scripts/library/illustrations-out/${KEY}/processed`;
mkdirSync(OUT, { recursive: true });
const book = JSON.parse(readFileSync(`scripts/library/books/${KEY}.json`, "utf8"));
const manifest = JSON.parse(readFileSync(`scripts/library/books/illus-data/${KEY}/_manifest.json`, "utf8"));

// 每章:段落(1-based ordinal)→ 起止 global seq
const chapParas = new Map();
let seq = 0;
book.chapters.forEach((ch, ci) => {
  const arr = [];
  ch.paragraphs.forEach((p, pi) => { const start = seq + 1; for (const _ of p) seq++; arr.push({ ord: pi + 1, start, end: seq }); });
  chapParas.set(ci + 1, { paras: arr, count: ch.paragraphs.length });
});
const seqToOrdinal = (chapterNo, s) => {
  const c = chapParas.get(chapterNo); if (!c) return 1;
  const hit = c.paras.find((p) => s >= p.start && s <= p.end);
  return hit ? hit.ord : (s < c.paras[0].start ? 1 : c.count);
};
const mByKey = new Map(manifest.images.map((im) => [`${im.chapter}-${im.k}`, im]));
const mByFile = new Map(manifest.images.filter((im) => im.file).map((im) => [im.file, im]));

// 封面文件识别:必须是词边界的 "cover"(cover.jpg / book-cover),不误伤 under-covers/discover/recover
const COVER_RE = /(^|[-_/])cover([-_.]|$)/i;
const files = readdirSync(IN).filter((f) => /\.jpe?g$/i.test(f) && !COVER_RE.test(f));
const rows = [];
for (const f of files) {
  const m = f.match(/^ch(\d+)-(\d+)-/);
  if (!m) { console.log("跳过(名字不符):", f); continue; }
  // manifest 有 file 字段时,只处理 manifest 里精确列出的文件(排除杂图/旧图/撞k号)
  if (mByFile.size && !mByFile.has(f)) { console.log("跳过(不在manifest):", f); continue; }
  const ch = +m[1], k = +m[2];
  const meta = mByKey.get(`${ch}-${k}`);
  const info = await sharp(`${IN}/${f}`).resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${f}`);
  rows.push({ ch, k, position: seqToOrdinal(ch, meta?.seq ?? 0), anchorSeq: meta?.seq ?? 0, image_path: `${KEY}/${f}`, alt: (meta?.alt || "").replace(/'/g, "''"), width: info.width, height: info.height });
}
// 章内防撞:同章按 seq 排,position 严格递增
const byCh = {};
for (const r of rows) (byCh[r.ch] ??= []).push(r);
for (const ch of Object.keys(byCh)) { let prev = 0; for (const r of byCh[ch].sort((a, b) => a.anchorSeq - b.anchorSeq)) { if (r.position <= prev) r.position = prev + 1; prev = r.position; } }

// 封面
const coverIn = readdirSync(IN).find((f) => /\.jpe?g$/i.test(f) && COVER_RE.test(f));
let coverLine = "";
if (coverIn) {
  const ci = await sharp(`${IN}/${coverIn}`).resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${KEY}-cover.jpg`);
  coverLine = `UPDATE public.library_books
   SET cover = jsonb_build_object('c1','${C1}','c2','${C2}','image','${KEY}/${KEY}-cover.jpg')
 WHERE book_key='${KEY}';\n\n`;
  console.log(`封面 ${coverIn} → ${KEY}-cover.jpg  ${ci.width}x${ci.height}`);
}

const all = rows.sort((a, b) => a.ch - b.ch || a.position - b.position);
const vals = all.map((r) => `  ((SELECT id FROM public.library_books WHERE book_key='${KEY}'), ${r.ch}, ${r.position}, '${r.image_path}', '', '${r.alt}', 'AI illustration (watercolor)', ${r.width}, ${r.height}, true)`).join(",\n");
const chSpan = [...new Set(all.map((r) => r.ch))].sort((a, b) => a - b);
const sql = `-- ============================================================================
-- 图书馆插图 · ${book.zh_title || KEY}(封面 + 第 ${chSpan[0]}-${chSpan[chSpan.length-1]} 章·CC 压缩+已传桶·待 Aaron 跑)
-- 幂等:先删本书旧插图行再插;封面写进 library_books.cover.image。position=章内段号(1-based)。
-- ============================================================================
BEGIN;
${coverLine}DELETE FROM public.library_illustrations
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='${KEY}');

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
${vals};

SELECT 'after' AS phase, chapter_idx, count(*)
  FROM public.library_illustrations
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='${KEY}')
 GROUP BY chapter_idx ORDER BY chapter_idx;
COMMIT;
`;
writeFileSync(`SQLAA/library-illustrations-${KEY}.sql`, sql);
console.log(`\n处理 ${rows.length} 章图 + 封面。position 分配(章内段号):`);
for (const ch of Object.keys(byCh).sort((a, b) => a - b)) console.log(`  ch${ch}: ${byCh[ch].map((r) => r.position).join(",")}(共${chapParas.get(+ch).count}段)`);
console.log(`→ SQLAA/library-illustrations-${KEY}.sql · processed → ${OUT}`);
