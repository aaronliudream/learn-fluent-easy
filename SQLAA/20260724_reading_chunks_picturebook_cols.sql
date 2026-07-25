-- 图书馆「绘本模式」样张 · 第 1 步:内容原子表加两列(只加列,不建表、不动 RLS、不建桶)
--
-- ⚠️ 表名与指令书不同,请先看这段:
--   指令书写的 reading_book_chunks 在本库**不存在**(PostgREST 实测 PGRST205:
--   "Could not find the table 'public.reading_book_chunks' in the schema cache")。
--   /library 阅读器的"内容原子(chunk)"表是 **public.library_sentences**(一行 = 一句;
--   同一页的多句共用同一个 page_index)。故两列加在 library_sentences 上。
--   见 DECISIONS.md「绘本模式:chunk 表 = library_sentences(reading_book_chunks 不存在)」。
--
-- 语义:
--   page_index  绘本页号(1-based;同页多句同号)。为空 → 前端按原有段落顺序回退分页,不报错。
--   image_url   该页配图。存**桶内相对路径**(如 aesop-easy-readers/ch1/p1.png),
--               沿用现有插图桶 library-illustrations 的公开读取方式(与章节封面图同一条路径),
--               前端 illustrationUrl() 解析;若填绝对 http(s) URL 也支持。
--
-- RLS:沿用 library_sentences 现有策略,**不新增、不修改**。
-- 影响面:两列可空,现有查询不带这两列 → 其余 88 章与所有其它书零行为变化。

begin;

-- 前置计数:两列此时应为 0
select count(*) as cols_before
from information_schema.columns
where table_schema = 'public'
  and table_name = 'library_sentences'
  and column_name in ('image_url', 'page_index');

alter table public.library_sentences add column if not exists image_url text;
alter table public.library_sentences add column if not exists page_index int;

-- 后置断言:两列必须都在,否则整单回滚
do $$
declare v_cols int;
begin
  select count(*) into v_cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'library_sentences'
    and column_name in ('image_url', 'page_index');
  if v_cols <> 2 then
    raise exception '加列失败:library_sentences 上找到 % 列(期望 2)', v_cols;
  end if;
end $$;

-- 后置计数:应为 2
select count(*) as cols_after
from information_schema.columns
where table_schema = 'public'
  and table_name = 'library_sentences'
  and column_name in ('image_url', 'page_index');

commit;
