-- ============================================================================
-- 图书馆 · 汤姆·索亚历险记 翻 public 上架(preview 验收通过后·Aaron 2026-07-15)
-- private 暂存 → public:白名单外的所有登录/匿名用户都能在 /library 看到并读。
-- is_published 早已 true;这里只把 visibility 从 private 翻 public。幂等·前后计数。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, book_key, is_published, visibility
  FROM public.library_books WHERE book_key = 'tom-sawyer';

UPDATE public.library_books
   SET visibility = 'public'
 WHERE book_key = 'tom-sawyer';

SELECT 'after' AS phase, book_key, is_published, visibility
  FROM public.library_books WHERE book_key = 'tom-sawyer';

COMMIT;
