
ALTER TABLE public.gaokao_vocab DROP CONSTRAINT IF EXISTS gaokao_vocab_word_key;
ALTER TABLE public.gaokao_vocab ADD CONSTRAINT gaokao_vocab_word_stage_key UNIQUE (word, stage);
