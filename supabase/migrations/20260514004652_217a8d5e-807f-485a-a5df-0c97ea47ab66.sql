UPDATE public.gaokao_vocab gv
SET gaokao_level = NULL
WHERE gv.freq_rank = 1000
  AND gv.gaokao_level IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.junior_vocab jv
    WHERE lower(jv.word) = lower(gv.word)
  );