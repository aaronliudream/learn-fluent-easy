-- 初三阅读去旧:删 grade=9 的无归属历史孤儿(30篇)。绝不碰 g8、不碰带 g9/U1 归属的 6 篇。幂等。

-- 前置:确认要删的行数(应=30)+ 要留的(应=6)
SELECT '待删(grade=9 且 volume/unit 为空)' AS chk, count(*) AS n
FROM public.junior_reading WHERE grade=9 AND (volume IS NULL OR unit IS NULL)
UNION ALL
SELECT '保留(grade=9 且 g9/U1 归属)', count(*)
FROM public.junior_reading WHERE grade=9 AND volume='g9' AND unit='U1';

-- 删除(精确限定:仅 grade=9 且无归属;g8/g9带归属均不匹配)
DELETE FROM public.junior_reading
WHERE grade=9 AND (volume IS NULL OR unit IS NULL);

-- 后置校验:grade=9 应只剩 6 篇,且全部 volume='g9'+unit='U1'
SELECT 'grade9剩余' AS chk, count(*) AS total,
       count(*) FILTER (WHERE volume='g9' AND unit='U1') AS g9u1,
       count(*) FILTER (WHERE volume IS NULL OR unit IS NULL) AS still_orphan
FROM public.junior_reading WHERE grade=9;
-- 期望: total=6, g9u1=6, still_orphan=0

-- 旁证:g8 阅读不受影响(应仍 110:80带归属+30无归属)
SELECT 'grade8不受影响' AS chk, count(*) AS total,
       count(*) FILTER (WHERE volume IS NULL OR unit IS NULL) AS orphan
FROM public.junior_reading WHERE grade=8;
-- 期望: total=110, orphan=30(保持不变)
