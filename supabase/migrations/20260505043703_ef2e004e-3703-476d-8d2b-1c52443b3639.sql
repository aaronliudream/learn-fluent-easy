
CREATE TABLE public.card_answer_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.knowledge_cards(id) ON DELETE CASCADE,
  question_idx integer NOT NULL,
  picked_idx integer NOT NULL,
  is_correct boolean NOT NULL,
  user_id uuid,
  guest_token text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_card_answer_events_card ON public.card_answer_events(card_id, question_idx);

ALTER TABLE public.card_answer_events ENABLE ROW LEVEL SECURITY;

-- Anyone (auth or anon) can insert their own answer events
CREATE POLICY "anyone can insert answer events"
ON public.card_answer_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND user_id IS NULL AND guest_token IS NOT NULL)
);

-- Card author can read all events on their cards
CREATE POLICY "author can read events on own cards"
ON public.card_answer_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_cards kc
    WHERE kc.id = card_answer_events.card_id AND kc.author_id = auth.uid()
  )
);

-- User can read their own events
CREATE POLICY "user can read own events"
ON public.card_answer_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
