-- ============================================================================
-- ⑧ 伊索(aesop-easy-readers)软发布:翻 is_published=true → 对用户可见。
-- ⚠️⚠️ 铁律:真机验过再跑!(fir-tree 教训:单卡都对、组装上线才暴雷)
--   验:点几个词看卡对不对(尤其 flag 修正的 frog/ax/bill + 三兄弟 plane/crane/stall)、
--      读几则看正文/中译顺不顺、点 dove 看回退(需先部署 explain-phrase)。
-- 前置已全绿:① seed 89章/443句 · ③ 词典(79纠错+118生词+5专名·read-v1=11580) · ⑤跳过 · ⑥⑦=0。
-- 幂等:再跑无害。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, book_key, is_published, sentence_count, age_band
  FROM public.library_books WHERE book_key = 'aesop-easy-readers';

UPDATE public.library_books
   SET is_published = true
 WHERE book_key = 'aesop-easy-readers';

SELECT 'after' AS phase, book_key, is_published
  FROM public.library_books WHERE book_key = 'aesop-easy-readers';

COMMIT;
