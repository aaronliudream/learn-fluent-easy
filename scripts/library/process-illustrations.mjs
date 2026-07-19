/**
 * 图书馆插图 · sharp 后处理 + seed SQL 生成(接 fetch-illustrations.mjs 下载的原图)。
 * 处理:resize ≤1000px 宽(不放大)+ JPEG q80(mozjpeg)+ 去元数据 → 统一 .jpg、体积大降。
 * 产物:illustrations-out/<key>/processed/ch<n>-<slug>.jpg(传桶用)+ SQLAA seed(带 width/height/caption/credit)。
 * ⚠️ 只处理 + 出 SQL,不写库。ch10 留空(无对应图)。ch12/ch21 已肉眼核过。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const BOOK_KEY = "wizard-of-oz";
const IN = `scripts/library/illustrations-out/${BOOK_KEY}`;
const PROC = `${IN}/processed`;
mkdirSync(PROC, { recursive: true });
const CREDIT = "W. W. Denslow (1900) · Wikimedia Commons";

const FINAL = [
  { ch: 1,  src: "ch1-dorothy-toto.png",       slug: "dorothy-toto",     cap: "She caught Toto by the ear." },
  { ch: 2,  src: "ch2-good-witch-north.png",   slug: "good-witch-north", cap: "\"I am the Witch of the North.\"" },
  { ch: 3,  src: "ch3-scarecrow.jpg",          slug: "scarecrow",        cap: "Dorothy gazed thoughtfully at the Scarecrow." },
  { ch: 4,  src: "ch4-scarecrow-made.jpg",     slug: "scarecrow-made",   cap: "\"I was only made yesterday,\" said the Scarecrow." },
  { ch: 5,  src: "ch5-tin-woodman.jpg",        slug: "tin-woodman",      cap: "\"This is a great comfort,\" said the Tin Woodman." },
  { ch: 6,  src: "ch6-cowardly-lion.jpg",      slug: "cowardly-lion",    cap: "\"You ought to be ashamed of yourself!\"" },
  { ch: 7,  src: "ch7-kalidahs.jpg",           slug: "kalidahs",         cap: "The tree fell with a crash into the gulf (the Kalidahs)." },
  { ch: 8,  src: "ch8-poppy-field.jpg",        slug: "poppy-field",      cap: "The deadly poppy field." },
  { ch: 9,  src: "ch9-field-mice-queen.jpg",   slug: "field-mice-queen", cap: "Her Majesty, the Queen of the Field Mice." },
  { ch: 11, src: "ch11-oz-the-head.jpg",       slug: "oz-the-head",      cap: "The Eyes looked at her thoughtfully (Oz the Great Head)." },
  { ch: 12, src: "cand-ch12-p177.jpg",         slug: "witch-monkey",     cap: "The Wicked Witch of the West commands a Winged Monkey." },
  { ch: 13, src: "ch13-tinsmiths.jpg",         slug: "tinsmiths",        cap: "The tinsmiths worked for three days and four nights." },
  { ch: 14, src: "ch14-winged-monkeys.jpg",    slug: "winged-monkeys",   cap: "The Monkeys caught Dorothy and flew away with her." },
  { ch: 15, src: "ch15-humbug.jpg",            slug: "humbug",           cap: "\"Exactly so! I am a humbug.\"" },
  { ch: 16, src: "ch16-brains.jpg",            slug: "brains",           cap: "\"I feel wise, indeed,\" said the Scarecrow." },
  { ch: 17, src: "ch17-balloon.jpg",           slug: "balloon",          cap: "The balloon rose into the air; the Wizard departs." },
  { ch: 18, src: "ch18-scarecrow-throne.jpg",  slug: "scarecrow-throne", cap: "The Scarecrow sat on the big throne." },
  { ch: 19, src: "ch19-fighting-trees.jpg",    slug: "fighting-trees",   cap: "The branches bent down and twined around him." },
  { ch: 20, src: "ch20-china-country.jpg",     slug: "china-country",    cap: "These people were all made of china." },
  { ch: 21, src: "cand-ch21-p283.jpg",         slug: "lion-king",        cap: "The Lion becomes the King of Beasts." },
  { ch: 22, src: "ch22-hammer-heads.jpg",      slug: "hammer-heads",     cap: "The Head shot forward and struck the Scarecrow (Hammer-Heads)." },
  { ch: 23, src: "ch23-glinda.jpg",            slug: "glinda",           cap: "Glinda the Good Witch grants Dorothy's wish." },
  { ch: 24, src: "ch24-home-again.jpg",        slug: "home-again",       cap: "Dorothy home again with Aunt Em." },
];

const sqlEsc = (s) => String(s).replace(/'/g, "''");

(async () => {
  const rows = [];
  for (const f of FINAL) {
    const out = `${PROC}/ch${f.ch}-${f.slug}.jpg`;
    const { data, info } = await sharp(`${IN}/${f.src}`)
      .resize({ width: 1000, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    writeFileSync(out, data);
    console.log(`✓ ch${f.ch}\t${info.width}x${info.height}\t${(data.length / 1024).toFixed(0)}KB`);
    rows.push({ ...f, w: info.width, h: info.height, path: `${BOOK_KEY}/ch${f.ch}-${f.slug}.jpg`, bytes: data.length });
  }

  const values = rows
    .map(
      (r) =>
        `  ((SELECT id FROM public.library_books WHERE book_key='${BOOK_KEY}'), ${r.ch}, 0, ` +
        `'${sqlEsc(r.path)}', '${sqlEsc(r.cap)}', '${sqlEsc(r.cap)}', '${sqlEsc(CREDIT)}', ${r.w}, ${r.h}, true)`,
    )
    .join(",\n");

  const sql = `-- ============================================================================
-- 图书馆插图 seed:${BOOK_KEY} · 每章章首图(position=0)· 共 ${rows.length} 章(ch10 无对应图,留空)
-- 图已降采样(≤1000px, JPEG q80)传入桶 library-illustrations/${BOOK_KEY}/。
-- 公有领域 W. W. Denslow (1900) via Wikimedia Commons。幂等 upsert;前后计数。
-- ⚠️ 先确认图已传桶再跑本 SQL。
-- ============================================================================

BEGIN;

SELECT 'before' AS phase, count(*) AS rows
  FROM public.library_illustrations li
  JOIN public.library_books b ON b.id = li.book_id
 WHERE b.book_key = '${BOOK_KEY}';

INSERT INTO public.library_illustrations
  (book_id, chapter_idx, position, image_path, caption, alt_text, credit, width, height, is_published)
VALUES
${values}
ON CONFLICT (book_id, chapter_idx, position) DO UPDATE SET
  image_path = EXCLUDED.image_path, caption = EXCLUDED.caption, alt_text = EXCLUDED.alt_text,
  credit = EXCLUDED.credit, width = EXCLUDED.width, height = EXCLUDED.height, is_published = EXCLUDED.is_published;

SELECT 'after' AS phase, count(*) AS rows
  FROM public.library_illustrations li
  JOIN public.library_books b ON b.id = li.book_id
 WHERE b.book_key = '${BOOK_KEY}';

COMMIT;
`;
  writeFileSync(`SQLAA/library-illustrations-seed-${BOOK_KEY}.sql`, sql);
  const total = rows.reduce((a, r) => a + r.bytes, 0);
  const max = Math.max(...rows.map((r) => r.bytes));
  console.log(`\n✓ processed ${rows.length} 张 → ${PROC}/`);
  console.log(`✓ SQLAA/library-illustrations-seed-${BOOK_KEY}.sql`);
  console.log(`总体积 ${(total / 1024 / 1024).toFixed(1)}MB;最大单图 ${(max / 1024).toFixed(0)}KB;均 ${(total / rows.length / 1024).toFixed(0)}KB`);
})();
