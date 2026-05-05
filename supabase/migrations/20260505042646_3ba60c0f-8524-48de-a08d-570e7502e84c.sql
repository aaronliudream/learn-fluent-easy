
CREATE TABLE public.card_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.knowledge_cards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_token text,
  total_questions int NOT NULL CHECK (total_questions > 0),
  correct_count int NOT NULL CHECK (correct_count >= 0),
  score_pct int NOT NULL CHECK (score_pct >= 0 AND score_pct <= 100),
  coins_awarded int NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'first3',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_card_attempts_card ON public.card_attempts(card_id);
CREATE INDEX idx_card_attempts_user ON public.card_attempts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_card_attempts_guest ON public.card_attempts(guest_token) WHERE guest_token IS NOT NULL;

ALTER TABLE public.card_attempts ENABLE ROW LEVEL SECURITY;

-- 任何人都可以记录一次答题（含游客）
CREATE POLICY "Anyone can insert attempt"
  ON public.card_attempts FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL AND guest_token IS NOT NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- 用户看自己
CREATE POLICY "User reads own attempts"
  ON public.card_attempts FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 卡片作者可看所有人的作答（老师/家长视角）
CREATE POLICY "Author reads attempts on own cards"
  ON public.card_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_cards kc
      WHERE kc.id = card_attempts.card_id
        AND kc.author_id = auth.uid()
    )
  );

-- 认领函数：把游客记录绑给当前登录用户
CREATE OR REPLACE FUNCTION public.claim_guest_card_attempts(_token text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _count int := 0;
BEGIN
  IF _uid IS NULL OR _token IS NULL OR length(_token) < 6 THEN
    RETURN 0;
  END IF;
  UPDATE public.card_attempts
     SET user_id = _uid
   WHERE guest_token = _token
     AND user_id IS NULL;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_guest_card_attempts(text) TO authenticated;
