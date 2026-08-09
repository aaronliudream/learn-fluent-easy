-- ═══════════════════════════════════════════════════════════════════
-- 场景串记「租房搬家」冠词修正:a apartment → an apartment
--
-- 由 Aaron 执行。
--
-- 成因:flat → apartment 的批量替换只换了名词、没跟着改冠词。
-- 实测残留 **7 处**(2026-08-09 全表扫描,按读音判 a/an,不是按拼写):
--   vocab_scene_packs.essay_short_en  2 处
--   vocab_scene_packs.essay_full_en   4 处
--   vocab_scene_items.text_en         1 处("view a apartment")
-- 全部集中在「租房搬家」一个场景,其余 29 个场景零错配。
--
-- ⚠️ **改英文会作废该行的音频**(内容寻址,按旧文本烧的)。
--    短文音频 essay_short_audio_url / essay_full_audio_url 和节点 audio_url
--    一并置 NULL,否则会"显示新句、播放旧音"。待重烧清单见 validate ③。
--
-- ⚠️ 用 replace() 全量替换而不是整句覆写:同一字段里出现多次(完整版 4 处),
--    整句覆写要把长文原样贴进 SQL,极易抄漏一个字。
-- ⚠️ 只替换 'a apartment' 这个精确串(带词边界由前后空格保证),
--    不会误伤 'a apartment-style'(库里没有,但判据本身要收得住)。
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- 改之前先看清有多少
SELECT 'packs_short' AS field, COUNT(*) AS rows FROM public.vocab_scene_packs WHERE essay_short_en LIKE '%a apartment%'
UNION ALL SELECT 'packs_full', COUNT(*) FROM public.vocab_scene_packs WHERE essay_full_en LIKE '%a apartment%'
UNION ALL SELECT 'items', COUNT(*) FROM public.vocab_scene_items WHERE text_en LIKE '%a apartment%';

UPDATE public.vocab_scene_packs
SET essay_short_en = replace(essay_short_en, 'a apartment', 'an apartment'),
    essay_full_en  = replace(essay_full_en,  'a apartment', 'an apartment'),
    -- ⚠️ 英文变了,两篇短文的音频作废
    essay_short_audio_url = CASE WHEN essay_short_en LIKE '%a apartment%' THEN NULL ELSE essay_short_audio_url END,
    essay_full_audio_url  = CASE WHEN essay_full_en  LIKE '%a apartment%' THEN NULL ELSE essay_full_audio_url END,
    updated_at = now()
WHERE essay_short_en LIKE '%a apartment%' OR essay_full_en LIKE '%a apartment%';

UPDATE public.vocab_scene_items
SET text_en = replace(text_en, 'a apartment', 'an apartment'),
    audio_url = NULL,          -- ⚠️ 同上
    updated_at = now()
WHERE text_en LIKE '%a apartment%';

COMMIT;

-- ── validate:跑完贴回给我 ──────────────────────────────────────────

-- ① 残留应为 0(三个字段全查)
SELECT 'packs_short' AS field, COUNT(*) AS stale FROM public.vocab_scene_packs WHERE essay_short_en LIKE '%a apartment%'
UNION ALL SELECT 'packs_full', COUNT(*) FROM public.vocab_scene_packs WHERE essay_full_en LIKE '%a apartment%'
UNION ALL SELECT 'items', COUNT(*) FROM public.vocab_scene_items WHERE text_en LIKE '%a apartment%';

-- ② 新值确实是 an apartment(应看到 7 处分布在 3 个字段里)
SELECT title_zh,
       (length(essay_short_en) - length(replace(essay_short_en,'an apartment',''))) / length('an apartment') AS short_hits,
       (length(essay_full_en)  - length(replace(essay_full_en, 'an apartment',''))) / length('an apartment') AS full_hits
FROM public.vocab_scene_packs WHERE essay_full_en LIKE '%an apartment%';

SELECT text_en FROM public.vocab_scene_items WHERE text_en LIKE '%an apartment%';

-- ③ **待重烧音频清单**(英文改过、音频已作废)
SELECT title_zh,
       essay_short_audio_url IS NULL AS 短文待烧,
       essay_full_audio_url  IS NULL AS 完整版待烧
FROM public.vocab_scene_packs WHERE essay_short_audio_url IS NULL OR essay_full_audio_url IS NULL;

SELECT text_en FROM public.vocab_scene_items WHERE audio_url IS NULL;

-- ④ 总行数没变(只改不增删):packs 应仍 30,items 应仍 262
SELECT (SELECT COUNT(*) FROM public.vocab_scene_packs) AS packs,
       (SELECT COUNT(*) FROM public.vocab_scene_items) AS items;
