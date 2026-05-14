-- B 短期: 把 freq_rank=1000(placeholder)且命中 primary_vocab 的词从高考词表软剔除
UPDATE public.gaokao_vocab gv
SET gaokao_level = NULL
WHERE gv.freq_rank = 1000
  AND gv.gaokao_level IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.primary_vocab pv
    WHERE lower(pv.word) = lower(gv.word)
  );