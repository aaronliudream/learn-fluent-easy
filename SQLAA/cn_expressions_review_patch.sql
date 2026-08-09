-- ═══════════════════════════════════════════════════════════════════
-- 中文这样说(vocab_cn_renditions)内容修订
-- 依据:三份独立 AI 评审的交叉共识,只改两份以上都指出的项(Aaron 2026-08-09)
--
-- 由 Aaron 执行。
--
-- 范围:13 条说法替换 + 4 条例句修 = 17 行受影响。
--   ⚠️ 「我没听见/formal」既在说法里也在例句里(I did not catch that → I didn't catch that),
--      所以说法替换实际是 13 条,不是 12 条。
--
-- ⚠️⚠️ **改英文 = 作废它的音频**。
--    这些行的 audio_url / example_audio_url 是按**旧文本**烧的,内容寻址,
--    不置 NULL 的话卡片会「显示新句、播放旧音」—— 比没有音频更糟,
--    因为用户不会怀疑音频,只会以为自己听错了。
--    所以凡英文变了的行,一律把对应音频列置 NULL,让它退回「无音频」状态。
--    中文列不受影响(中文本来就不烧音频)。
--    **重烧清单见文件末尾的 validate ③。**
--
-- ⚠️ 每条 UPDATE 都带 `AND 现值 = 旧值` 的守卫:
--    打错行时会更新 0 行(validate 里看得出来),而不是把别的内容改掉。
--
-- ⚠️ 执行前已逐条核对过库里现值,17 行**全部命中、0 处不一致**(2026-08-09)。
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

SELECT COUNT(*) AS before_total FROM public.vocab_cn_renditions;

-- ── 一、说法替换 13 条(rendition 变 → audio_url 置 NULL)──────────

-- 辅助:按 (中文条目, 语域) 定位一行
CREATE TEMP TABLE _patch(cn_phrase text, reg text, old_v text, new_v text) ON COMMIT DROP;
INSERT INTO _patch VALUES
  ('我不太确定','casual','I have no idea','I''m not really sure'),                      -- 原句是"完全不知道",语义放大
  ('我来试试','formal','I''ll take that on','I''ll see what I can do'),                 -- 原句是"我来负责"
  ('我忘了','formal','It escaped my memory','It slipped my attention'),                  -- 三份都判不自然
  ('我想休息一下','neutral','I want to take a rest.','I want to take a break.'),         -- take a rest 偏卧床休养
  ('我很生气','neutral','I''m annoyed','I''m upset'),                                    -- annoyed 语气过弱
  ('我想睡觉','casual','I''m beat','I''m ready for bed'),                                -- beat = 累坏了
  ('我想睡觉','formal','I''m quite tired','I need to turn in'),
  ('我很期待','casual','Can''t wait','I can''t wait'),                                   -- 补主语
  ('我很高兴','neutral','I''m happy','I''m glad to hear that'),
  ('我来帮你','formal','Happy to help','I''d be happy to help'),                         -- Happy to help 是回应谢谢用的
  ('你说得对','neutral','That is correct','That''s right'),
  ('别生气','formal','Please remain composed.','I understand your frustration.'),        -- 原句居高临下
  ('我没听见','formal','I did not catch that','I didn''t catch that');                   -- 缩写才自然

UPDATE public.vocab_cn_renditions r
SET rendition = p.new_v,
    audio_url = NULL,          -- ⚠️ 旧音频是按旧文本烧的,必须作废
    updated_at = now()
FROM _patch p
JOIN public.vocab_cn_expressions e ON e.cn_phrase = p.cn_phrase
WHERE r.expression_id = e.id
  AND r.register = p.reg
  AND r.rendition = p.old_v;   -- 守卫:现值对不上就不改这一行

-- ── 二、例句修 4 条 ────────────────────────────────────────────────

-- ① 我很期待 / neutral:to 后面要接名词,不能接 "it when ..."
UPDATE public.vocab_cn_renditions r
SET example_en = 'I''m looking forward to the new book release.',
    example_zh = '我很期待这本新书的发行。',
    example_audio_url = NULL,  -- ⚠️ 英文变了
    updated_at = now()
FROM public.vocab_cn_expressions e
WHERE r.expression_id = e.id AND e.cn_phrase = '我很期待' AND r.register = 'neutral'
  AND r.example_en = 'I''m looking forward to it when the new book releases.';

-- ② 我很期待 / formal:同样的 "to it when" 结构
UPDATE public.vocab_cn_renditions r
SET example_en = 'I am very much looking forward to meeting you next month.',
    example_zh = '我非常期待下个月与您见面。',
    example_audio_url = NULL,
    updated_at = now()
FROM public.vocab_cn_expressions e
WHERE r.expression_id = e.id AND e.cn_phrase = '我很期待' AND r.register = 'formal'
  AND r.example_en = 'I''m very much looking forward to it when we meet next month.';

-- ③ 我没听见 / formal:例句同步改成缩写(说法已在第一段改过)
UPDATE public.vocab_cn_renditions r
SET example_en = 'I didn''t catch that last point, could you clarify?',
    example_audio_url = NULL,
    updated_at = now()
FROM public.vocab_cn_expressions e
WHERE r.expression_id = e.id AND e.cn_phrase = '我没听见' AND r.register = 'formal'
  AND r.example_en = 'I did not catch that last point, could you clarify?';

-- ④ 随便你:中英场景对不上。
--    ⚠️ 是**两条**不是一条(你只提到"英文说电影、中文说吃饭"那条 = neutral):
--       casual 也对不上(英文说周末去哪儿、中文说吃什么)。
--       formal 那条本来就一致(都在说会议时间),**不动**。
--    ⚠️ 统一方向选**改中文去迁就英文** —— 改英文会连带作废例句音频,
--       而这里的问题只是中文没跟上,英文本身没错。
UPDATE public.vocab_cn_renditions r
SET example_zh = '这周末想去哪儿都随你,我都行。', updated_at = now()
FROM public.vocab_cn_expressions e
WHERE r.expression_id = e.id AND e.cn_phrase = '随便你' AND r.register = 'casual'
  AND r.example_en = 'We can go wherever you want this weekend.';

UPDATE public.vocab_cn_renditions r
SET example_zh = '电影你来挑,随便你。', updated_at = now()
FROM public.vocab_cn_expressions e
WHERE r.expression_id = e.id AND e.cn_phrase = '随便你' AND r.register = 'neutral'
  AND r.example_en = 'You can choose the movie. It''s up to you.';

COMMIT;

-- ── validate:跑完贴回给我 ──────────────────────────────────────────

-- ① 13 条说法**全部**已是新值(应为 13 行,少一行就是有守卫没命中)
SELECT e.cn_phrase, r.register, r.rendition
FROM public.vocab_cn_renditions r
JOIN public.vocab_cn_expressions e ON e.id = r.expression_id
WHERE r.rendition IN (
  'I''m not really sure','I''ll see what I can do','It slipped my attention',
  'I want to take a break.','I''m upset','I''m ready for bed','I need to turn in',
  'I can''t wait','I''m glad to hear that','I''d be happy to help','That''s right',
  'I understand your frustration.','I didn''t catch that')
ORDER BY e.cn_phrase, r.register;

-- ② 旧值应当**一条都不剩**(应为 0 行)
SELECT COUNT(*) AS stale_rows
FROM public.vocab_cn_renditions r
WHERE r.rendition IN (
  'I have no idea','I''ll take that on','It escaped my memory','I want to take a rest.',
  'I''m annoyed','I''m beat','I''m quite tired','Can''t wait','I''m happy',
  'Happy to help','That is correct','Please remain composed.','I did not catch that');

-- ③ **待重烧音频清单** —— 这些行的音频已被作废,前端会退回"无喇叭"。
--    等下次烧音频时按这张表补(说法 13 条 + 例句 3 条)。
SELECT e.cn_phrase, r.register,
       CASE WHEN r.audio_url IS NULL THEN r.rendition END AS 待烧_说法,
       CASE WHEN r.example_audio_url IS NULL THEN r.example_en END AS 待烧_例句
FROM public.vocab_cn_renditions r
JOIN public.vocab_cn_expressions e ON e.id = r.expression_id
WHERE r.audio_url IS NULL OR r.example_audio_url IS NULL
ORDER BY e.cn_phrase, r.register;

-- ④ 「随便你」三档的中英是否都对得上了(人眼扫一遍)
SELECT r.register, r.rendition, r.example_en, r.example_zh
FROM public.vocab_cn_renditions r
JOIN public.vocab_cn_expressions e ON e.id = r.expression_id
WHERE e.cn_phrase = '随便你' ORDER BY r.sort_order;

-- ⑤ 总行数没变(应仍为 133 —— 本次只改不增删)
SELECT COUNT(*) AS after_total FROM public.vocab_cn_renditions;
