-- ============================================================================
-- 图书馆精读语块 · 枞树 第 4 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/fir-tree-chunks-ch4-review.md 一致。跨章去重:ch1..3 已建卡不重出(仅补索引)。
-- read-v1 卡 1 张(去掉已建 0 张)/ library_chunks 索引 2 行。幂等 upsert。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=4) AS ch_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
  ('by no means', 'by no means', 'en', 'read-v1', '{"word":"by no means","pos":"词块","ipa":"/baɪ noʊ miːnz/","gloss_cn":"绝不、一点也不、根本不","example":{"en":"The homework tonight is by no means easy.","cn":"今晚的作业绝不轻松。"},"note":"by no means = 绝不、一点也不(强调否定)。此 means 不是''方法''。文中枞树两次说 ''by no means old'' = 一点也不老。","kind":"chunk","src_seqs":[109,121],"literal":[{"word":"by","meaning_cn":"(固定搭配)"},{"word":"no","meaning_cn":"毫无、没有"},{"word":"means","meaning_cn":"程度、地步","note_cn":"此处非''方法''"}]}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

-- clean rebuild:先删本章旧索引(严格限本书本章·只碰 library_chunks 不删 phrase_explanations 卡·同事务),再插审定版。
-- 这样 DB 的下划线索引 = 审定 JSON,一一对应可复现;根治 DO NOTHING 多版叠加的旧债。
DELETE FROM public.library_chunks
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='fir-tree') AND chapter_idx=4;
INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 4, 'by no means', 109, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 4, 'by no means', 121, true)
-- DO UPDATE(非 DO NOTHING):即便有人漏跑 DELETE 单独重跑 INSERT,也是覆盖而非静默叠加——从机制根绝多版累积的旧债。与卡片 INSERT 的 DO UPDATE 一致。
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO UPDATE SET is_published=EXCLUDED.is_published;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=4) AS ch_index;
COMMIT;
