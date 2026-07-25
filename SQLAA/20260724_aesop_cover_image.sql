-- 图书馆《伊索寓言》封面补图(书架/详情页封面一直是渐变底,因为 cover 里**没有 image 键**)
--
-- 现状实测(2026-07-24 直连 DB):
--   aesop-easy-readers  cover = {"c1":"#2f7d6e","c2":"#14532d"}      ← 缺 image → 前端 coverImageUrl() 返回 null → 渐变兜底
--   fir-tree / robinson-crusoe / tom-sawyer / wizard-of-oz 四本都有 image,且桶内文件实测 200。
--
-- 图已传好(Aaron 出的 aesop-fables-cover.png → 800 宽 q82 → 桶 library-illustrations),公开地址实测 200(229KB):
--   https://degqpiiddkxcuzwombwp.supabase.co/storage/v1/object/public/library-illustrations/aesop-easy-readers/aesop-fables-cover.jpg
--
-- 本单只做一件事:把 image 键并进 cover jsonb,**保留原 c1/c2 渐变兜底**(与其它四本同款)。

begin;

-- 前:应为 {"c1":"#2f7d6e","c2":"#14532d"},image 键不存在
select book_key, cover, cover ? 'image' as has_image
from public.library_books
where book_key = 'aesop-easy-readers';

update public.library_books
   set cover = cover || jsonb_build_object('image', 'aesop-easy-readers/aesop-fables-cover.jpg')
 where book_key = 'aesop-easy-readers';

-- 断言:恰好 1 本书有这张封面,且 c1/c2 没被抹掉
do $$
declare v_ok int;
begin
  select count(*) into v_ok
  from public.library_books
  where book_key = 'aesop-easy-readers'
    and cover->>'image' = 'aesop-easy-readers/aesop-fables-cover.jpg'
    and cover ? 'c1' and cover ? 'c2';
  if v_ok <> 1 then
    raise exception '封面写入断言失败:命中 % 行(期望 1)', v_ok;
  end if;
end $$;

-- 后:五本书应全部有 image
select book_key, cover->>'image' as cover_image
from public.library_books
order by book_key;

commit;
