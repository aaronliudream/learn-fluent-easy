-- 1) 斜杠合并词条:任一拆分部分命中小学/初中词表,即整条剔除
WITH split AS (
  SELECT id, regexp_split_to_table(lower(word), '/') AS part
  FROM public.gaokao_vocab
  WHERE freq_rank = 1000 AND gaokao_level IS NOT NULL AND word ~ '/'
),
hits AS (
  SELECT DISTINCT s.id
  FROM split s
  WHERE EXISTS (SELECT 1 FROM public.primary_vocab pv WHERE lower(pv.word) = trim(s.part))
     OR EXISTS (SELECT 1 FROM public.junior_vocab jv WHERE lower(jv.word) = trim(s.part))
)
UPDATE public.gaokao_vocab gv
SET gaokao_level = NULL
FROM hits h
WHERE gv.id = h.id;

-- 2) 硬黑名单:小学/初中词表都漏掉的最基础词
UPDATE public.gaokao_vocab
SET gaokao_level = NULL
WHERE gaokao_level IS NOT NULL
  AND lower(word) IN (
    'a','an','the',
    'i','you','he','she','it','we','they','me','him','her','us','them',
    'my','your','his','its','our','their','mine','yours','hers','ours','theirs',
    'this','that','these','those',
    'is','am','are','was','were','be','been','being',
    'do','does','did','done','doing',
    'have','has','had','having',
    'will','would','can','could','shall','should','may','might','must',
    'and','or','but','if','so','not','no','yes',
    'of','in','on','at','to','for','from','with','by','as'
  );