-- ============================================================================
-- 图书馆精读语块 · 枞树 第 5 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/fir-tree-chunks-ch5-review.md 一致。跨章去重:ch1..4 已建卡不重出(仅补索引)。
-- read-v1 卡 1 张(去掉已建 0 张)/ library_chunks 索引 1 行。幂等 upsert。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=5) AS ch_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
  ('look to oneself', 'look to himself', 'en', 'read-v1', '{"word":"look to oneself","pos":"词块","ipa":"/lʊk tə wʌnˈsɛlf/","gloss_cn":"照看自己、顾自己、留意自身","example":{"en":"With so many guests to serve, she had no time to look to herself.","cn":"要招呼这么多客人,她根本没工夫顾自己。"},"note":"look to oneself = 照看/顾好自己。此 look to 不是''看向'',而是''留心、照料''。文中 ''forgot to look to himself'' = 顾不上打量、照看自己。","kind":"chunk","src_seqs":[142],"literal":[{"word":"look to","meaning_cn":"照料、留意","note_cn":"固定搭配,非''看向''"},{"word":"oneself","meaning_cn":"自己(文中作 himself)"}]}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

-- clean rebuild:先删本章旧索引(严格限本书本章·只碰 library_chunks 不删 phrase_explanations 卡·同事务),再插审定版。
-- 这样 DB 的下划线索引 = 审定 JSON,一一对应可复现;根治 DO NOTHING 多版叠加的旧债。
DELETE FROM public.library_chunks
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='fir-tree') AND chapter_idx=5;
INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 5, 'look to himself', 142, true)
-- DO UPDATE(非 DO NOTHING):即便有人漏跑 DELETE 单独重跑 INSERT,也是覆盖而非静默叠加——从机制根绝多版累积的旧债。与卡片 INSERT 的 DO UPDATE 一致。
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO UPDATE SET is_published=EXCLUDED.is_published;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=5) AS ch_index;
COMMIT;
