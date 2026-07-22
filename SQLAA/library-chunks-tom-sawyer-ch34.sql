-- ============================================================================
-- 图书馆精读语块 · 汤姆·索亚历险记 第 34 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/tom-sawyer-chunks-ch34-review.md 一致。跨章去重:ch1..33 已建卡不重出(仅补索引)。
-- read-v1 卡 12 张(去掉已建 5 张)/ library_chunks 索引 14 行。幂等 upsert。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='tom-sawyer' AND lc.chapter_idx=34) AS ch_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
  ('be used to', 'used to', 'en', 'read-v1', '{"word":"be used to","pos":"词块","ipa":"/biː juːst tə/","gloss_cn":"习惯于","example":{"en":"I''m not used to getting up so early.","cn":"我还不习惯这么早起床。"},"note":"be used to sth / doing sth = 习惯于某事；注意区别于 used to do(过去常常做)。本章 Huck 说自己不习惯那种人多的场合。","kind":"chunk","src_seqs":[4886],"literal":[{"word":"used","meaning_cn":"习惯的","note_cn":"此处非“用过”，指“对…习以为常”"},{"word":"to","meaning_cn":"对于","note_cn":"后接名词或动名词"}]}'::jsonb),
  ('on account of', 'on account of', 'en', 'read-v1', '{"word":"on account of","pos":"词块","ipa":"/ɑːn əˈkaʊnt əv/","gloss_cn":"因为；由于","example":{"en":"The game was cancelled on account of the rain.","cn":"比赛因为下雨取消了。"},"note":"后接名词或动名词，表示原因，比 because of 略正式。","kind":"chunk","src_seqs":[4900],"literal":[{"word":"on","meaning_cn":"基于"},{"word":"account","meaning_cn":"缘由","note_cn":"此处非“账户”，指“原因”"},{"word":"of","meaning_cn":"…的"}]}'::jsonb),
  ('get along with', 'get along with', 'en', 'read-v1', '{"word":"get along with","pos":"词块","ipa":"/ɡet əˈlɔːŋ wɪð/","gloss_cn":"应付、把事办成；(与人)相处","example":{"en":"How are you getting along with your new job?","cn":"你的新工作进展得怎么样？"},"note":"本章指“应付、把(秘密)弄成”；日常最常见义是“与某人相处融洽”。","kind":"chunk","src_seqs":[4905],"literal":[{"word":"get","meaning_cn":"进展"},{"word":"along","meaning_cn":"向前","note_cn":"此处指“进行、进展下去”"},{"word":"with","meaning_cn":"凭借、和"}]}'::jsonb),
  ('spring something on someone', 'spring something on', 'en', 'read-v1', '{"word":"spring something on someone","pos":"词块","ipa":"/sprɪŋ ˈsʌmθɪŋ ɑːn/","gloss_cn":"冷不防向某人抛出(消息/要求)","example":{"en":"He sprang the news on us right at dinner.","cn":"他就在晚饭时冷不防向我们抛出这消息。"},"note":"spring 此处指“突然拿出、猛然抛出”，让人措手不及。本章指 Jones 想当众突然公布秘密。","kind":"chunk","src_seqs":[4903],"literal":[{"word":"spring","meaning_cn":"突然抛出","note_cn":"此处非“春天/弹跳”"},{"word":"something","meaning_cn":"某事物"},{"word":"on","meaning_cn":"冲着(某人)"}]}'::jsonb),
  ('catch it', 'catch it', 'en', 'read-v1', '{"word":"catch it","pos":"词块","ipa":"/kætʃ ɪt/","gloss_cn":"挨骂；受罚","example":{"en":"If you break that vase, you''ll really catch it.","cn":"你要是打碎那花瓶，可有得挨骂了。"},"note":"口语，指将招来责骂或惩罚。本章 Tom 警告 Sid 明天要挨收拾。","kind":"chunk","src_seqs":[4917],"literal":[{"word":"catch","meaning_cn":"招来","note_cn":"此处非“抓住”，指“惹来(责罚)”"},{"word":"it","meaning_cn":"(指责骂/惩罚)"}]}'::jsonb),
  ('and so forth', 'and so forth', 'en', 'read-v1', '{"word":"and so forth","pos":"词块","ipa":"/ənd soʊ fɔːrθ/","gloss_cn":"等等；诸如此类","example":{"en":"Bring pens, paper, rulers, and so forth.","cn":"把笔、纸、尺子等等都带上。"},"note":"列举一部分后表示后面还有同类，与 and so on 同义。","kind":"chunk","src_seqs":[4920],"literal":[{"word":"and","meaning_cn":"和"},{"word":"so","meaning_cn":"如此"},{"word":"forth","meaning_cn":"向前","note_cn":"此处为习语固定用词"}]}'::jsonb),
  ('out of doors', 'out of doors', 'en', 'read-v1', '{"word":"out of doors","pos":"词块","ipa":"/aʊt əv dɔːrz/","gloss_cn":"在户外；到室外","example":{"en":"The children love playing out of doors all day.","cn":"孩子们喜欢一整天都在户外玩。"},"note":"等于 outdoors，指在露天、屋外。本章 Tom 跑到屋外去取金币。","kind":"chunk","src_seqs":[4935],"literal":[{"word":"out","meaning_cn":"在外"},{"word":"of","meaning_cn":"…的"},{"word":"doors","meaning_cn":"门(户)","note_cn":"此处借指“室内”，out of doors 即“屋外”"}]}'::jsonb),
  ('amount to', 'amount to', 'en', 'read-v1', '{"word":"amount to","pos":"词块","ipa":"/əˈmaʊnt tə/","gloss_cn":"总计达；相当于；等于","example":{"en":"His savings amount to a thousand dollars.","cn":"他的积蓄总共有一千美元。"},"note":"既可指数目累计达到某数，也可指“相当于、意味着”。本章两处：Jones 的惊喜“算不上什么”，以及金币“总共达到”一万二千多。","kind":"chunk","src_seqs":[4951],"literal":[{"word":"amount","meaning_cn":"达到(某数量)"},{"word":"to","meaning_cn":"至、到"}]}'::jsonb),
  ('amount to', 'amounted to', 'en', 'read-v1', '{"word":"amount to","pos":"词块","ipa":"/əˈmaʊnt tə/","gloss_cn":"总计达；相当于；等于","example":{"en":"His savings amount to a thousand dollars.","cn":"他的积蓄总共有一千美元。"},"note":"既可指数目累计达到某数，也可指“相当于、意味着”。本章两处：Jones 的惊喜“算不上什么”，以及金币“总共达到”一万二千多。","kind":"chunk","src_seqs":[4954],"literal":[{"word":"amount","meaning_cn":"达到(某数量)"},{"word":"to","meaning_cn":"至、到"}]}'::jsonb),
  ('keep back', 'kept back', 'en', 'read-v1', '{"word":"keep back","pos":"词块","ipa":"/kiːp bæk/","gloss_cn":"忍住；抑制；阻止","example":{"en":"She could hardly keep back her tears.","cn":"她几乎忍不住眼泪。"},"note":"本章指“忍住(不笑出来)”；也可指扣下、隐瞒某事物。","kind":"chunk","src_seqs":[4928],"literal":[{"word":"keep","meaning_cn":"使保持"},{"word":"back","meaning_cn":"往回","note_cn":"此处指“压住不放出”"}]}'::jsonb),
  ('take one''s breath away', 'take one''s breath away', 'en', 'read-v1', '{"word":"take one''s breath away","pos":"词块","ipa":"/teɪk wʌnz breθ əˈweɪ/","gloss_cn":"令人惊叹；使大吃一惊","example":{"en":"The view from the mountain top took my breath away.","cn":"山顶的景色让我惊叹得说不出话。"},"note":"本章出处为分离式(took the general breath away)，故 card-only。指景象或消息美得/惊人得让人一时喘不过气。","kind":"chunk","src_seqs":[4944],"literal":[{"word":"take","meaning_cn":"夺走"},{"word":"the","meaning_cn":"(众人的)"},{"word":"breath","meaning_cn":"呼吸、气息"},{"word":"away","meaning_cn":"离开"}]}'::jsonb),
  ('willing to allow', 'willing to allow', 'en', 'read-v1', '{"word":"willing to allow","pos":"词块","ipa":"/ˈwɪlɪŋ tə əˈlaʊ/","gloss_cn":"(老式)愿意承认、认错","example":{"en":"After thinking it over, she was willing to allow that he had been right.","cn":"想过之后,她愿意承认他一直是对的。"},"note":"willing to allow = 愿意承认(认错)。此 allow = admit/declare(老式/方言),非现代''允许''义。整个搭配才读作''承认'';单个 allow 已改回主流义''允许''。","kind":"chunk","src_seqs":[4952],"literal":[{"word":"willing","meaning_cn":"愿意的"},{"word":"to allow","meaning_cn":"(此处)承认、认定","note_cn":"此 allow=admit,非''允许''"}]}'::jsonb)
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

-- clean rebuild:先删本章旧索引(严格限本书本章·只碰 library_chunks 不删 phrase_explanations 卡·同事务),再插审定版。
-- 这样 DB 的下划线索引 = 审定 JSON,一一对应可复现;根治 DO NOTHING 多版叠加的旧债。
DELETE FROM public.library_chunks
 WHERE book_id=(SELECT id FROM public.library_books WHERE book_key='tom-sawyer') AND chapter_idx=34;
INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'used to', 4886, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'take care of', 4892, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'on account of', 4900, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'get along with', 4905, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'let on', 4904, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'spring something on', 4903, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'never mind', 4911, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'catch it', 4917, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'and so forth', 4920, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'out of doors', 4935, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'amount to', 4951, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'amounted to', 4954, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'kept back', 4928, true),
  ((SELECT id FROM public.library_books WHERE book_key='tom-sawyer'), 34, 'willing to allow', 4952, true)
-- DO UPDATE(非 DO NOTHING):即便有人漏跑 DELETE 单独重跑 INSERT,也是覆盖而非静默叠加——从机制根绝多版累积的旧债。与卡片 INSERT 的 DO UPDATE 一致。
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO UPDATE SET is_published=EXCLUDED.is_published;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='tom-sawyer' AND lc.chapter_idx=34) AS ch_index;
COMMIT;
