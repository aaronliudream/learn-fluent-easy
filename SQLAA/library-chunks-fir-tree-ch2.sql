-- ============================================================================
-- 图书馆精读语块 · 枞树 第 2 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/fir-tree-chunks-ch2-review.md 一致。跨章去重:ch1..1 已建卡不重出(仅补索引)。
-- read-v1 卡 2 张(去掉已建 0 张)/ library_chunks 索引 2 行。幂等 upsert。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=2) AS ch_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
  ('come to oneself', 'came to himself', 'en', 'read-v1', '{"word":"come to oneself","pos":"词块","ipa":"/kʌm tə wʌnˈsɛlf/","gloss_cn":"苏醒过来、回过神来、恢复知觉","example":{"en":"He fainted for a moment, but soon came to himself again.","cn":"他昏了一会儿,但很快又醒了过来。"},"note":"come to oneself = 苏醒、回过神。此 come to 不是''来到某处'',而是''恢复知觉/清醒''。文中作 ''came to himself''。","kind":"chunk","src_seqs":[49],"literal":[{"word":"come to","meaning_cn":"苏醒、恢复知觉","note_cn":"固定搭配,非''来到''"},{"word":"oneself","meaning_cn":"自己(文中作 himself)"}]}'::jsonb),
  ('take root', 'take root', 'en', 'read-v1', '{"word":"take root","pos":"词块","ipa":"/teɪk ruːt/","gloss_cn":"生根、扎根;(念头等)扎下根来","example":{"en":"The young apple tree soon took root in the warm soil.","cn":"那棵小苹果树很快在温暖的泥土里生了根。"},"note":"take root = (植物)扎根,也比喻(念头、习惯)扎下根。此 take 不是''拿取''。","kind":"chunk","src_seqs":[61],"literal":[{"word":"take","meaning_cn":"扎下、生出","note_cn":"与 root 合成,非''拿''"},{"word":"root","meaning_cn":"根"}]}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

-- clean rebuild:先删本章旧索引(严格限本书本章·只碰 library_chunks 不删 phrase_explanations 卡·同事务),再插审定版。
-- 这样 DB 的下划线索引 = 审定 JSON,一一对应可复现;根治 DO NOTHING 多版叠加的旧债。
DELETE FROM public.library_chunks
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='fir-tree') AND chapter_idx=2;
INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 2, 'came to himself', 49, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 2, 'take root', 61, true)
-- DO UPDATE(非 DO NOTHING):即便有人漏跑 DELETE 单独重跑 INSERT,也是覆盖而非静默叠加——从机制根绝多版累积的旧债。与卡片 INSERT 的 DO UPDATE 一致。
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO UPDATE SET is_published=EXCLUDED.is_published;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=2) AS ch_index;
COMMIT;
