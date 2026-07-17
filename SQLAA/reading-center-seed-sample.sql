-- ============================================================================
-- 阅读中心 · 样板内容种子(初中 1 篇分级读物 + 4 题)
-- ⚠️ 内容审核门:此文件含教学内容(原文+题目),须先经 Aaron / 网页版 Claude 审核通过,
--    再执行落库。审稿件见 REVIEWAA/阅读中心样板/ 与 docs/reading/SAMPLE_REVIEW.md。
-- 前置:先跑 reading-center-ddl.sql 建表。
-- 内容:自编原创短文《The Lost Kitten》,零版权风险(决策 D9)。
-- 幂等:按 title 先删同名样板再插,可重复执行。
-- ============================================================================

BEGIN;

SELECT 'before' AS phase, count(*) AS n FROM public.reading_library;

DELETE FROM public.reading_library
 WHERE grade_band = 'junior' AND title = 'The Lost Kitten';

INSERT INTO public.reading_library
  (content_type, grade_band, level, title, body, word_count, difficulty, topic, questions, vocab_notes, is_published)
VALUES (
  'graded_reader',
  'junior',
  'J1(120–180词)',
  'The Lost Kitten',
  E'One rainy afternoon, Lily heard a strange sound near her front door. She opened it and found a small kitten sitting on the step. The kitten was wet and cold, and it looked very hungry.\n\nLily carried the kitten inside and dried it with a soft towel. Then she gave it some warm milk. The kitten drank all the milk quickly and began to feel better. Soon it was playing with a ball of wool on the floor.\n\nLily wanted to keep the kitten, but she knew it might belong to someone else. The next morning, she made a small poster with a picture of the kitten. She put it on the wall near the shop at the corner of her street.\n\nThree days later, an old woman came to Lily''s house. The kitten was hers, and she had been looking for it everywhere. She thanked Lily with a warm smile. Lily was a little sad to say goodbye, but she felt happy that she had helped.',
  156,
  2,
  '记叙文',
  '[
    {
      "q": "Where did Lily first find the kitten?",
      "options": [
        "On the step near her front door",
        "Near the shop at the corner",
        "In an old woman''s house",
        "On the floor of her kitchen"
      ],
      "answer": "A",
      "explanation": "开门后她在台阶上发现了小猫(found a small kitten sitting on the step)。其余选项都是文中别处出现的地点(贴海报处/小猫的主人家),但都不是最初发现处。"
    },
    {
      "q": "What did Lily do to help the kitten feel warm and better?",
      "options": [
        "She dried it and gave it warm milk",
        "She gave it some cold water",
        "She took it to the shop",
        "She made a poster for it"
      ],
      "answer": "A",
      "explanation": "她用毛巾擦干小猫并喂了温牛奶(dried it with a soft towel... gave it some warm milk)。海报是后来为找主人做的,并非为取暖。"
    },
    {
      "q": "Lily made a poster because she wanted to find the kitten''s owner.",
      "options": ["True", "False"],
      "answer": "A",
      "explanation": "文中说她知道小猫可能属于别人(might belong to someone else),于是做海报——目的正是找主人,故为 True。"
    },
    {
      "q": "How did Lily feel at the end of the story?",
      "options": [
        "A little sad to say goodbye, but happy she had helped",
        "Angry that the woman took the kitten",
        "Afraid of the old woman",
        "Sorry that she had helped the kitten"
      ],
      "answer": "A",
      "explanation": "结尾说她有点舍不得道别,但因帮到了小猫而开心(a little sad... but she felt happy that she had helped)。其余选项与\"warm smile / felt happy\"矛盾。"
    }
  ]'::jsonb,
  '[
    {"word": "kitten", "cn": "小猫"},
    {"word": "towel", "cn": "毛巾"},
    {"word": "belong", "cn": "属于"},
    {"word": "poster", "cn": "海报"},
    {"word": "corner", "cn": "角落;拐角"}
  ]'::jsonb,
  true
);

SELECT 'after' AS phase, count(*) AS n FROM public.reading_library;
SELECT id, title, grade_band, level, word_count,
       jsonb_array_length(questions) AS q_count,
       jsonb_array_length(vocab_notes) AS vocab_count,
       is_published
  FROM public.reading_library
 WHERE title = 'The Lost Kitten';

COMMIT;
