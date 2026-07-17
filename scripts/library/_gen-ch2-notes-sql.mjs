/** 从审定 md 直接生成 ch2 文化笔记 SQL(不手抄,杜绝转录错)。用法:node scripts/library/_gen-ch2-notes-sql.mjs */
import { readFileSync, writeFileSync } from "node:fs";

const md = readFileSync("REVIEWAA/图书馆文化笔记/wizard-of-oz-ch2.md", "utf8").split(/\r?\n/);

// 概念锚点 → 该概念对应的 tap 键(单复数各一行,同内容)
const CONCEPTS = [
  { anchor: "`silver`", terms: ["silver"] },
  { anchor: "`munchkin`", terms: ["munchkin", "munchkins"] },
  { anchor: "`witch`", terms: ["witch", "witches"] },
  { anchor: "`sorceress`", terms: ["sorceress", "sorceresses"] },
];

function extract(anchor) {
  const i = md.findIndex((l) => l.startsWith("## ") && l.includes(anchor));
  if (i < 0) throw new Error("section not found: " + anchor);
  let title = "", zh = "", en = "";
  for (let j = i; j < md.length && !(j > i && md[j].startsWith("## ")); j++) {
    if (md[j].startsWith("**title:**")) title = md[j].replace("**title:**", "").trim();
    if (md[j].trim() === "**body_zh:**") zh = md[j + 1].trim();
    if (md[j].trim() === "**body_en:**") en = md[j + 1].trim();
  }
  if (!title || !zh || !en) throw new Error("empty field in " + anchor + ` (t=${!!title} z=${!!zh} e=${!!en})`);
  // 剥掉审校文档里的 markdown 加粗标记 **…**(卡片纯文本渲染,不解析 md,否则孩子看到字面星号)
  const strip = (s) => s.replace(/\*\*/g, "");
  return { title: strip(title), zh: strip(zh), en: strip(en) };
}

const rows = [];
for (const c of CONCEPTS) {
  const { title, zh, en } = extract(c.anchor);
  for (const term of c.terms) rows.push({ term, title, zh, en });
}

const valueLines = rows
  .map((r) => `  ('${r.term}', 2, $t$${r.title}$t$, $z$${r.zh}$z$, $e$${r.en}$e$)`)
  .join(",\n");

const sql = `-- ===========================================================================
-- 图书馆「文化笔记」② 读中词卡 · 绿野仙踪 第 2 章内容(4 词 7 行)。
--   Aaron 终审定版 2026-07-14:silver / munchkin / witch / sorceress 全部保留可落库。
--   已按雷区去绝对化(第一个/立刻/一定 → 较早/后来/传统上);silver 只挂 silver(shoes 基础词不挂);
--   munchkin/witch/sorceress 单复数各 1 行同内容(tap 键精确匹配)。
--   ⚠️ 表实际 UNIQUE 是 (book_id, term)(非 term+chapter_idx),故 ON CONFLICT (book_id, term),与 ch1 一致。
--   前置:表已建(library-culture-notes-ddl.sql)。ON CONFLICT DO UPDATE 幂等,可重复跑。
--   由 scripts/library/_gen-ch2-notes-sql.mjs 从审定 md 直接生成,未手抄。
-- ===========================================================================
BEGIN;

SELECT 'before' AS phase, count(*) AS ch2_notes
  FROM public.library_culture_notes lcn
  JOIN public.library_books b ON b.id=lcn.book_id
 WHERE b.book_key='wizard-of-oz' AND lcn.chapter_idx=2;

INSERT INTO public.library_culture_notes
  (book_id, term, chapter_idx, title, body_zh, body_en, is_published)
SELECT b.id, v.term, v.chapter_idx, v.title, v.body_zh, v.body_en, true
FROM (SELECT id FROM public.library_books WHERE book_key='wizard-of-oz') b
CROSS JOIN (VALUES
${valueLines}
) AS v(term, chapter_idx, title, body_zh, body_en)
ON CONFLICT (book_id, term) DO UPDATE SET
  chapter_idx=EXCLUDED.chapter_idx, title=EXCLUDED.title,
  body_zh=EXCLUDED.body_zh, body_en=EXCLUDED.body_en, is_published=EXCLUDED.is_published;

SELECT 'after' AS phase, lcn.term, lcn.chapter_idx, lcn.title
  FROM public.library_culture_notes lcn
  JOIN public.library_books b ON b.id=lcn.book_id
 WHERE b.book_key='wizard-of-oz' AND lcn.chapter_idx=2
 ORDER BY lcn.term;

COMMIT;
`;

writeFileSync("SQLAA/library-culture-notes-wizard-of-oz-ch2.sql", sql);
console.log(`✓ SQLAA/library-culture-notes-wizard-of-oz-ch2.sql (${rows.length} rows: ${rows.map((r) => r.term).join(", ")})`);
