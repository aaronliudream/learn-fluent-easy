/**
 * 图书馆样书 seed 生成器:书 JSON → 幂等 seed SQL(进 SQLAA/)。
 * 纯 JSON→SQL 转换,无网络、无 AI(照 american gen-*-seed 的确定性转换模式)。
 *
 * 输入:scripts/library/books/<key>.json —— 书元数据 + chapters[].paragraphs[][]{en,cn}
 * 输出:SQLAA/library-seed-<key>.sql —— upsert library_books + 重灌 library_sentences(幂等)
 *      · chapter_idx = 章真实序号(D12,不塌成 0)
 *      · para_idx    = 全书段落递增序号(渲染段落分隔用)
 *      · seq         = 全书句子递增序号(断点续读/连续朗读)
 *      · sentence_count = 句子总数(进度分母)
 *      · is_published = JSON 里的值(样书审前应为 false)
 *
 * 用法:node scripts/library/build-seed.mjs aesop-easy-readers
 */
import { readFileSync, writeFileSync } from "node:fs";

const key = process.argv[2];
if (!key) {
  console.error("用法: node scripts/library/build-seed.mjs <book_key>");
  process.exit(1);
}

const book = JSON.parse(readFileSync(`scripts/library/books/${key}.json`, "utf8"));
const q = (s) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const jsonLit = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

// 展平:全书 seq / para 递增,chapter_idx 取章真实 idx。
const rows = [];
let seq = 0;
let para = 0;
for (const ch of book.chapters) {
  for (const paragraph of ch.paragraphs) {
    para += 1;
    for (const s of paragraph) {
      seq += 1;
      rows.push({ chapter_idx: ch.idx, para_idx: para, seq, en: s.en, cn: s.cn ?? null });
    }
  }
}
const sentenceCount = rows.length;

// 章标题元数据(方案 A:library_books.chapters jsonb — 随 getBookByKey 一起取,零额外查询)。
const chapterMeta = book.chapters.map((ch) => ({
  idx: ch.idx,
  title_en: ch.title_en ?? "",
  title_zh: ch.title_zh ?? "",
}));

const valuesSql = rows
  .map((r) => `    (${r.chapter_idx}, ${r.para_idx}, ${r.seq}, ${q(r.en)}, ${q(r.cn)})`)
  .join(",\n");

let sql = `-- ============================================================================
-- 图书馆样书 seed:${book.title} (${key})
-- 生成自 scripts/library/books/${key}.json —— node scripts/library/build-seed.mjs ${key}
-- ⚠️ 内容(英文改写 + 中文)须先过审(Aaron/网页版 Claude)再落库(content-review-gate + D9)。
-- 幂等:upsert 书 + 删该书旧句重灌。BEGIN/COMMIT + 前后计数。
-- 章号真实(D12);共 ${book.chapters.length} 章 / ${sentenceCount} 句。
-- ============================================================================

BEGIN;

-- 0) 章标题列(方案 A:jsonb,幂等加列)。[{idx,title_en,title_zh}] + visibility(私享层已建,防御性再保一次)。
ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS chapters jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';

SELECT 'before' AS phase,
       (SELECT count(*) FROM public.library_books WHERE book_key = ${q(book.book_key)}) AS book_exists,
       (SELECT count(*) FROM public.library_sentences s
          JOIN public.library_books b ON b.id = s.book_id
         WHERE b.book_key = ${q(book.book_key)}) AS sentence_rows;

-- 1) 书目(upsert)
INSERT INTO public.library_books
  (book_key, title, zh_title, author, age_band, age_range, cover,
   intro_en, intro_zh, sentence_count, copyright_note, chapters, is_published, visibility)
VALUES
  (${q(book.book_key)}, ${q(book.title)}, ${q(book.zh_title)}, ${q(book.author)},
   ${q(book.age_band)}, ${q(book.age_range)}, ${jsonLit(book.cover ?? {})},
   ${q(book.intro_en)}, ${q(book.intro_zh)}, ${sentenceCount}, ${q(book.copyright_note)},
   ${jsonLit(chapterMeta)}, ${book.is_published === true}, ${q(book.visibility ?? "public")})
ON CONFLICT (book_key) DO UPDATE SET
  title          = EXCLUDED.title,
  zh_title       = EXCLUDED.zh_title,
  author         = EXCLUDED.author,
  age_band       = EXCLUDED.age_band,
  age_range      = EXCLUDED.age_range,
  cover          = EXCLUDED.cover,
  intro_en       = EXCLUDED.intro_en,
  intro_zh       = EXCLUDED.intro_zh,
  sentence_count = EXCLUDED.sentence_count,
  copyright_note = EXCLUDED.copyright_note,
  chapters       = EXCLUDED.chapters;
  -- 注:不覆盖 is_published / visibility —— 审后手动置 true / 由 private 翻 public,重灌 seed 不会把它们打回。

-- 2) 句子(删旧重灌,幂等)。audio_url 留 NULL:默认前端实时合成,预生成脚本审后另回填。
DELETE FROM public.library_sentences
 WHERE book_id = (SELECT id FROM public.library_books WHERE book_key = ${q(book.book_key)});

INSERT INTO public.library_sentences (book_id, chapter_idx, para_idx, seq, text_en, text_cn)
SELECT b.id, v.chapter_idx, v.para_idx, v.seq, v.text_en, v.text_cn
FROM public.library_books b
CROSS JOIN (VALUES
${valuesSql}
) AS v(chapter_idx, para_idx, seq, text_en, text_cn)
WHERE b.book_key = ${q(book.book_key)};

SELECT 'after' AS phase,
       (SELECT sentence_count FROM public.library_books WHERE book_key = ${q(book.book_key)}) AS book_sentence_count,
       (SELECT count(*) FROM public.library_sentences s
          JOIN public.library_books b ON b.id = s.book_id
         WHERE b.book_key = ${q(book.book_key)}) AS sentence_rows;

COMMIT;

-- 审核通过后,单独跑这一行让样书对用户可见(软上线):
-- UPDATE public.library_books SET is_published = true WHERE book_key = ${q(book.book_key)};
`;

const out = `SQLAA/library-seed-${key}.sql`;
writeFileSync(out, sql);
console.log(`✓ ${out} — ${book.chapters.length} 章 / ${sentenceCount} 句`);
