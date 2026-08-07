-- ✅ 已执行(2026-08-06,Aaron 在 Supabase SQL Editor 跑完并 commit)
--    验收计数一致:tts-audio 53787 · library-illustrations 1470(968 + 501 + 1 全部收敛)
--    文件保留存档,不要重跑(重跑无害,是幂等的,但没有必要)。
--
-- Storage 缓存头修正(2026-08-06)
--
-- 背景:国内实测往返 200-305ms,每一次跨境重取都很贵。现查 storage.objects 发现两处头没配对:
--   ① tts-audio 53,787 条 = 'max-age=public, max-age=31536000, immutable'  ← 格式非法
--      成因:supabase/functions/tts/index.ts 把整串 header 传给了 cacheControl,
--      而 Supabase 只接受秒数、自己拼 'max-age='。源头已改成 '31536000'(仅对新上传生效),
--      存量 5.4 万条只能靠本文件刷。
--      注:走 audio.bigmooneducation.com 时 Cloudflare 规则覆盖了它,所以没暴雷;
--      但 speak.ts 回退到裸 Supabase URL 的路径会因为这个非法值失去缓存。
--   ② library-illustrations 501 条 = 'max-age=3600'(只缓存 1 小时)+ 1 条 'no-cache'
--      同桶已有 968 条是正确的 'public, max-age=31536000'。
--
-- 实测前置(2026-08-06 现查 DB,即本文件所依据的分布):
--   tts-audio            : 53787 条,全部 'max-age=public, max-age=31536000, immutable'
--   library-illustrations: 968 'public, max-age=31536000' / 501 'max-age=3600' / 1 'no-cache'
--   textbooks 等         : 6 条 'max-age=3600'(PDF,影响小,本文件不动)
--
-- 影响面:只改 storage.objects.metadata 里的 cacheControl 一个键,不碰文件本体、不碰路径、不碰权限。
-- 图片/音频都是内容寻址(hash 或固定路径 + 内容不变),长缓存安全。
--
-- 跑法:整段贴进 Supabase SQL Editor 执行。

begin;

-- 前:当前分布
select bucket_id, metadata->>'cacheControl' as cache_control, count(*)
from storage.objects
where bucket_id in ('tts-audio', 'library-illustrations')
group by 1, 2
order by 1, 3 desc;

-- ① tts-audio:非法值 → 合法长缓存
update storage.objects
set metadata = jsonb_set(metadata, '{cacheControl}', '"public, max-age=31536000, immutable"')
where bucket_id = 'tts-audio'
  and metadata->>'cacheControl' is distinct from 'public, max-age=31536000, immutable';

-- ② library-illustrations:1 小时 / no-cache → 长缓存(与同桶已正确的 968 条对齐)
update storage.objects
set metadata = jsonb_set(metadata, '{cacheControl}', '"public, max-age=31536000"')
where bucket_id = 'library-illustrations'
  and metadata->>'cacheControl' is distinct from 'public, max-age=31536000';

-- 后:应各自收敛成一行
select bucket_id, metadata->>'cacheControl' as cache_control, count(*)
from storage.objects
where bucket_id in ('tts-audio', 'library-illustrations')
group by 1, 2
order by 1, 3 desc;

commit;

-- 跑完怎么验(注意必须用 GET,不能用 HEAD):
--   Supabase Storage 对 HEAD 请求会返回 no-cache,那是它 HEAD 实现的问题,不是真实策略。
--   curl -r 0-0 -D - -o /dev/null \
--     "https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/<任一路径>"
--   期望看到:Cache-Control: public, max-age=31536000
--
-- 若 Cloudflare 已缓存旧头,边缘生效可能滞后到旧 TTL 过期;源站头以本次 update 为准。
