-- 短义项修正 —— 只改 B 类 19 条
--
-- ⚠️ A 类 32 条**不动**:钙/氦/锌/酶/膜/腺/猿/龟 这些词的单字形
--    就是汉语里的规范词,硬凑两字只会造出「钙元素」这种注水词。
--    Aaron 裁决:**放宽规格**(义项字数下限 2 → 1),而不是改内容去迁就规格。
--    spec.mjs 已同步,体裁闸也补上了下限判据(与上限同源引用 SPEC)。
--
-- 本文件只处理 B 类:动词类的「拉；拖」「砍；划」这种单字读起来像半个词的。
-- 每条新值都过了 defZhShapeProblem(含新的下限判据),人裁不免检。
-- 幂等:按 lower(headword) UPDATE。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh IS NOT NULL) AS words_with_def
  FROM vocab_words;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
  ('tug', '拉拽；拖曳'),
  ('slash', '砍劈；划破'),
  ('gnaw', '啃咬'),
  ('prod', '戳刺'),
  ('wring', '拧绞；扭转'),
  ('batter', '打击；揉捏'),
  ('peck', '啄食；轻吻'),
  ('squat', '蹲下；蹲坐'),
  ('cavity', '空腔；洞穴'),
  ('jug', '水壶；瓦罐'),
  ('shaft', '轴杆；杆柄'),
  ('stalk', '茎秆；叶柄'),
  ('strand', '细线；一缕'),
  ('strings', '细线；琴弦'),
  ('hem', '边缘；褶边'),
  ('arc', '弧线；弧形'),
  ('ply', '层数；层次'),
  ('deity', '神祇；神灵'),
  ('trough', '水槽；食槽')
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh IS NOT NULL) AS words_with_def
  FROM vocab_words;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
/* ⚠️ 判据用**逐词比对**,不用计数 —— 上一轮 sense_fix 就栽在计数式判据上
 *    (批内有例外时计数必然对不上)。 */
SELECT '本批 19 词逐词与裁决一致' AS expect,
       NOT EXISTS (
         SELECT 1 FROM (VALUES
           ('tug', '拉拽；拖曳'),
           ('slash', '砍劈；划破'),
           ('gnaw', '啃咬'),
           ('prod', '戳刺'),
           ('wring', '拧绞；扭转'),
           ('batter', '打击；揉捏'),
           ('peck', '啄食；轻吻'),
           ('squat', '蹲下；蹲坐'),
           ('cavity', '空腔；洞穴'),
           ('jug', '水壶；瓦罐'),
           ('shaft', '轴杆；杆柄'),
           ('stalk', '茎秆；叶柄'),
           ('strand', '细线；一缕'),
           ('strings', '细线；琴弦'),
           ('hem', '边缘；褶边'),
           ('arc', '弧线；弧形'),
           ('ply', '层数；层次'),
           ('deity', '神祇；神灵'),
           ('trough', '水槽；食槽')
         ) AS v(headword, def_zh)
         JOIN vocab_words w ON lower(w.headword) = v.headword
         WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
SELECT '本批没把任何词的 def_zh 弄丢',
       NOT EXISTS (SELECT 1 FROM vocab_words
                    WHERE lower(headword) IN ('tug', 'slash', 'gnaw', 'prod', 'wring', 'batter', 'peck', 'squat', 'cavity', 'jug', 'shaft', 'stalk', 'strand', 'strings', 'hem', 'arc', 'ply', 'deity', 'trough')
                      AND def_zh IS NULL)
UNION ALL
SELECT '没有义项超 8 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '；')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) > 8
       );

COMMIT;
