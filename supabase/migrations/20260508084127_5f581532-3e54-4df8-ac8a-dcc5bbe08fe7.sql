
-- 1) 一般现在时: 24842563 -> b9cd9a42
UPDATE junior_grammar_questions q
SET point_id = 'b9cd9a42-3f90-4722-ad55-810e23abfb87'
WHERE q.point_id = '24842563-affe-4b77-a2bf-b26c044a79d3'
  AND NOT EXISTS (
    SELECT 1 FROM junior_grammar_questions q2
    WHERE q2.point_id = 'b9cd9a42-3f90-4722-ad55-810e23abfb87' AND q2.stem = q.stem
  );
DELETE FROM junior_grammar_questions WHERE point_id = '24842563-affe-4b77-a2bf-b26c044a79d3';
DELETE FROM junior_grammar_points WHERE id = '24842563-affe-4b77-a2bf-b26c044a79d3';

-- 2) 现在进行时: 7a585b25 -> 55ba4787
UPDATE junior_grammar_questions q
SET point_id = '55ba4787-0f06-4fb7-8af4-375cc635d437'
WHERE q.point_id = '7a585b25-5a80-40d4-a777-75f34c34a920'
  AND NOT EXISTS (
    SELECT 1 FROM junior_grammar_questions q2
    WHERE q2.point_id = '55ba4787-0f06-4fb7-8af4-375cc635d437' AND q2.stem = q.stem
  );
DELETE FROM junior_grammar_questions WHERE point_id = '7a585b25-5a80-40d4-a777-75f34c34a920';
DELETE FROM junior_grammar_points WHERE id = '7a585b25-5a80-40d4-a777-75f34c34a920';

-- 3) 一般过去时: addf6590 -> 1830853e (重点)
UPDATE junior_grammar_questions q
SET point_id = '1830853e-2f7e-4b3d-995a-95aa4e6766cb'
WHERE q.point_id = 'addf6590-c31f-41e7-bc3b-caff2bdbfc55'
  AND NOT EXISTS (
    SELECT 1 FROM junior_grammar_questions q2
    WHERE q2.point_id = '1830853e-2f7e-4b3d-995a-95aa4e6766cb' AND q2.stem = q.stem
  );
DELETE FROM junior_grammar_questions WHERE point_id = 'addf6590-c31f-41e7-bc3b-caff2bdbfc55';
DELETE FROM junior_grammar_points WHERE id = 'addf6590-c31f-41e7-bc3b-caff2bdbfc55';

-- 4) 现在完成时: 08997ddc -> 650ef701
UPDATE junior_grammar_questions q
SET point_id = '650ef701-a1b1-4a49-88d2-6d60ec471b96'
WHERE q.point_id = '08997ddc-eb73-4585-b0c7-a3477adf9f02'
  AND NOT EXISTS (
    SELECT 1 FROM junior_grammar_questions q2
    WHERE q2.point_id = '650ef701-a1b1-4a49-88d2-6d60ec471b96' AND q2.stem = q.stem
  );
DELETE FROM junior_grammar_questions WHERE point_id = '08997ddc-eb73-4585-b0c7-a3477adf9f02';
DELETE FROM junior_grammar_points WHERE id = '08997ddc-eb73-4585-b0c7-a3477adf9f02';
