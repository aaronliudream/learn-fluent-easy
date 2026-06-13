-- 7A 听力精简(砍重复):U7 砍 3 个理解版(捏造人名/与音频不符)+ U5 砍 6 条(雷同编号/推荐系列)
-- 共删 9 条。attempts 全表 0 行,无引用,安全删除。删 content 行,无外键级联。
-- ⚠️ 删前计数 / DELETE / 删后校验 三段分开跑。

-- ========== 第1步:删前计数(确认 U5=12 / U7=12)==========
SELECT unit, count(*) AS before_cnt
FROM junior_listening_exercises
WHERE volume = '7A' AND unit IN ('U5','U7')
GROUP BY unit ORDER BY unit;
-- 期望:U5=12 / U7=12

-- ========== 第2步:DELETE(单独跑)==========
DELETE FROM junior_listening_exercises
WHERE id IN (
  -- U7 砍 3 个理解版(保留准确的填空版)
  '7e4c6691-2404-42a8-95a3-24867f55a899',  -- 爷爷的生日(理解)  捏造 "Tim"
  'f7fbd5e3-8316-4724-b13f-39e37cdd2039',  -- 英语日(理解)      捏造 "Peter"
  '5991ecf9-68d5-459d-845e-2d0eed2dbbb8',  -- Sam的生日(理解)   与填空版重复,统一保留填空版
  -- U5 砍 6 条(去雷同)
  '222b5016-f3d2-409e-a4d3-0f90d4fe8cf2',  -- 社团选择②  仅4题
  'e7d2ab2f-ce91-4430-a6c3-90b668a3c2cc',  -- 社团选择④  160词偏长
  'df72b151-df8f-418f-b169-4d3b6119eeaf',  -- 烘焙社      短文填空多余
  '261a73cc-b1e8-4a8f-b0e3-2217e3d79329',  -- 社团节摆摊  短文填空多余
  'fabc250d-4f86-4cde-a7e5-f1b2681ecbcf',  -- 推荐桌游社  仅4题
  '28dd6a4e-b1cc-4a48-b784-59a3d9657e13'   -- 推荐摄影社  推荐系列多余
);
-- 期望:DELETE 9

-- ========== 第3步:删后校验(确认 U5=6 / U7=9)==========
SELECT unit, count(*) AS after_cnt
FROM junior_listening_exercises
WHERE volume = '7A' AND unit IN ('U5','U7')
GROUP BY unit ORDER BY unit;
-- 期望:U5=6 / U7=9

-- 删后题型构成抽查(确认题型仍多样、无误删):
SELECT unit, topic, title
FROM junior_listening_exercises
WHERE volume = '7A' AND unit IN ('U5','U7')
ORDER BY unit, topic, title;
-- 期望 U5(6条):短对话×2(社团选择①③)+ 短文填空×2(报名须知/园艺社)+ 长对话×2(环保社/辩论社)
-- 期望 U7(9条):短对话×3 + 听写填空×3(保留的准确填空版)+ 长对话×3(已砍3个"理解版"重复,短文理解=0)
-- END
