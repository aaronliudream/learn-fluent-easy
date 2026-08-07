-- J 段补丁 —— 仅动场景「租房搬家」的冠词错配(Aaron 2026-08-07 复审)
--
-- 事故:批量把英式 flat 换成美式 apartment 时**只换了词、没动冠词**,
--       全篇留下 "a apartment"(词链 1 处 + 完整版 4 处 + 速览版 2 处)。
-- 规矩:**批量文本替换必须同时处理随之变化的语法形式**(冠词/单复数/介词搭配)。
-- 已新增机器闸 j11 按**读音**扫冠词(a university / an hour 不误伤),
-- 并回扫 A/D/H/I/J 五段:除本条外全零。
--
-- ⚠️ 只动这一个场景,其余 29 个一字未改(第二条:作用面最小化)。
-- ⚠️ 由 Aaron 执行。跑完可翻 is_published 开灯。

BEGIN;

UPDATE vocab_scene_packs SET
  essay_full_en  = 'Renting an apartment and moving can be both exciting and challenging. Initially, you need to view an apartment to find one that suits your needs. Once satisfied, you sign a lease, a crucial step that legally binds you to the property. You then pay a deposit, which is usually refundable if no damage is done. Next, you set up utilities like water, gas, and electricity. After arranging your furniture, you finally move in, marking a new chapter in your life. Meeting the neighbors can help you integrate into the community. 

Living in an urban area often offers better access to amenities compared to a suburban area, which might be more peaceful. The benefits of renting an apartment include having more living space, living independently, and experiencing a new environment. However, there are drawbacks, such as high moving costs, the challenge of adapting to a new environment, and potential noise issues. Weighing these factors, renting an apartment is generally a positive experience if one is prepared for the initial challenges.',
  essay_short_en = 'Renting an apartment involves several steps. First, you view an apartment to find a suitable one. After that, you sign a lease and pay a deposit. Setting up utilities is next, followed by arranging furniture and moving in. Meeting the neighbors is important for community integration. 

Renting offers benefits like more living space, independence, and a new environment. However, it also presents drawbacks such as high moving costs, adapting challenges, and potential noise. Overall, with proper preparation, renting can be a rewarding experience.',
  updated_at = now()
 WHERE title_zh = '租房搬家';

UPDATE vocab_scene_items i SET text_en = 'view an apartment', updated_at = now()
  FROM vocab_scene_packs p
 WHERE i.pack_id = p.id AND p.title_zh = '租房搬家' AND i.sort_order = 1;

-- ── validate:三行都必须是 t ──
SELECT '全库无 a + 元音开头(排除 a university 型)' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs
                    WHERE (essay_full_en || ' ' || essay_short_en) ~* 'ma (a|e|i|o)[a-z]'
                      AND (essay_full_en || ' ' || essay_short_en) !~* 'ma (an?y|eu|one|once)') AS ok
UNION ALL
SELECT '节点无 a + 元音开头',
       NOT EXISTS (SELECT 1 FROM vocab_scene_items WHERE text_en ~* 'ma (a|e|i|o)[a-z]')
UNION ALL
SELECT '租房搬家场景已无 a apartment',
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs p
                    LEFT JOIN vocab_scene_items i ON i.pack_id = p.id
                    WHERE p.title_zh = '租房搬家'
                      AND (p.essay_full_en ~* 'ma apartment' OR p.essay_short_en ~* 'ma apartment'
                           OR i.text_en ~* 'ma apartment'));

COMMIT;
