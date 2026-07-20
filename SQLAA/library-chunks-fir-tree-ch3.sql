-- ============================================================================
-- 图书馆精读语块 · 枞树 第 3 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/fir-tree-chunks-ch3-review.md 一致。跨章去重:ch1..2 已建卡不重出(仅补索引)。
-- read-v1 卡 3 张(去掉已建 0 张)/ library_chunks 索引 3 行。幂等 upsert。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=3) AS ch_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
  ('set fire to', 'set fire to', 'en', 'read-v1', '{"word":"set fire to","pos":"词块","ipa":"/sɛt ˈfaɪər tə/","gloss_cn":"点着、放火烧、使…着火","example":{"en":"A stray spark set fire to the dry grass by the road.","cn":"一颗飞溅的火星点着了路边的干草。"},"note":"set fire to sth = 点燃某物、使其着火(整体比单词更固定)。此 set 不是''放置''。","kind":"chunk","src_seqs":[64],"literal":[{"word":"set","meaning_cn":"使…(着火)","note_cn":"非''放置''"},{"word":"fire","meaning_cn":"火"},{"word":"to","meaning_cn":"对…、给…"}]}'::jsonb),
  ('fall upon', 'fell upon', 'en', 'read-v1', '{"word":"fall upon","pos":"词块","ipa":"/fɔːl əˈpɑːn/","gloss_cn":"扑向、一拥而上(去抢或攻击)","example":{"en":"The hungry children fell upon the food the moment it appeared.","cn":"食物一端上来,饿坏了的孩子们就一拥而上。"},"note":"fall upon sb/sth = 猛扑向、一拥而上(去抢或攻击)。此 fall 不是''跌倒''。文中作 ''fell upon''。","kind":"chunk","src_seqs":[74],"literal":[{"word":"fall","meaning_cn":"猛扑","note_cn":"此处非''跌倒''"},{"word":"upon","meaning_cn":"向…、朝…"}]}'::jsonb),
  ('the way of the world', 'the way of the world', 'en', 'read-v1', '{"word":"the way of the world","pos":"词块","ipa":"/ðə weɪ əv ðə wɜːrld/","gloss_cn":"世道就是这样、世间常情","example":{"en":"The strong win and the weak lose — that''s just the way of the world.","cn":"强者赢、弱者输——世道就是这样。"},"note":"the way of the world = 世事本来如此、人间常态,常带看透或无奈的口吻。","kind":"chunk","src_seqs":[86],"literal":[{"word":"the way","meaning_cn":"样子、常态"},{"word":"of the world","meaning_cn":"世间的、人世的","note_cn":"合起来=世道人情"}]}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

-- clean rebuild:先删本章旧索引(严格限本书本章·只碰 library_chunks 不删 phrase_explanations 卡·同事务),再插审定版。
-- 这样 DB 的下划线索引 = 审定 JSON,一一对应可复现;根治 DO NOTHING 多版叠加的旧债。
DELETE FROM public.library_chunks
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='fir-tree') AND chapter_idx=3;
INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 3, 'set fire to', 64, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 3, 'fell upon', 74, true),
  ((SELECT id FROM public.library_books WHERE book_key='fir-tree'), 3, 'the way of the world', 86, true)
-- DO UPDATE(非 DO NOTHING):即便有人漏跑 DELETE 单独重跑 INSERT,也是覆盖而非静默叠加——从机制根绝多版累积的旧债。与卡片 INSERT 的 DO UPDATE 一致。
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO UPDATE SET is_published=EXCLUDED.is_published;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='fir-tree' AND lc.chapter_idx=3) AS ch_index;
COMMIT;
