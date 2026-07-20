-- ============================================================================
-- 图书馆精读语块 · 枞树 第 1 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/fir-tree-chunks-ch1-review.md 一致。跨章去重:ch1..0 已建卡不重出(仅补索引)。
-- read-v1 卡 2 张(去掉已建 0 张)/ library_chunks 索引 2 行。幂等 upsert。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=1) AS ch_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
  ('become of', 'became of', 'en', 'read-v1', '{"word":"become of","pos":"词块","ipa":"/bɪˈkʌm ʌv/","gloss_cn":"(某人/某物)后来怎么样了、落得什么下场","example":{"en":"Nobody knew what became of the old sailor after the war.","cn":"谁也不知道那个老水手战后怎么样了。"},"note":"what became of sb/sth = 某人/某物后来如何、下场怎样。此 become 不是''变成'',而是''遭遇、落得''。多用于疑问。","kind":"chunk","src_seqs":[19],"literal":[{"word":"become","meaning_cn":"遭遇、落得","note_cn":"此处非''变成''"},{"word":"of","meaning_cn":"…的(承接对象)"}]}'::jsonb),
  ('be off', 'be off', 'en', 'read-v1', '{"word":"be off","pos":"词块","ipa":"/biː ɔːf/","gloss_cn":"离开、走开;动身走","example":{"en":"It''s getting late — I must be off now.","cn":"不早了——我得走了。"},"note":"be off = 离开、走掉(off 表''离去'')。如 ''I must be off'' = 我得走了。文中枞树 ''wanted to be off'' = 老想着离开。","kind":"chunk","src_seqs":[27],"literal":[{"word":"be","meaning_cn":"处于(某状态)"},{"word":"off","meaning_cn":"离开、走开","note_cn":"此 off 表''离去'',非''关闭''"}]}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

-- clean rebuild:先删本章旧索引(严格限本书本章·只碰 library_chunks 不删 phrase_explanations 卡·同事务),再插审定版。
-- 这样 DB 的下划线索引 = 审定 JSON,一一对应可复现;根治 DO NOTHING 多版叠加的旧债。
DELETE FROM public.library_chunks
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='fir-tree') AND chapter_idx=1;
INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 1, 'became of', 19, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 1, 'be off', 27, true)
-- DO UPDATE(非 DO NOTHING):即便有人漏跑 DELETE 单独重跑 INSERT,也是覆盖而非静默叠加——从机制根绝多版累积的旧债。与卡片 INSERT 的 DO UPDATE 一致。
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO UPDATE SET is_published=EXCLUDED.is_published;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=1) AS ch_index;
COMMIT;
