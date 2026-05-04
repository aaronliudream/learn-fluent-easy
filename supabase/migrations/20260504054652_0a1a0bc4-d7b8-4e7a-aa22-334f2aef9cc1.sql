CREATE TABLE public.pro_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  feature text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pro_waitlist_feature ON public.pro_waitlist(feature);
CREATE INDEX idx_pro_waitlist_user ON public.pro_waitlist(user_id);

ALTER TABLE public.pro_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon visitors) can insert their interest
CREATE POLICY "Anyone can join waitlist"
ON public.pro_waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- when authenticated, user_id must match auth.uid (or be null for guests)
  user_id IS NULL OR user_id = auth.uid()
);

-- Users can see only their own waitlist entries
CREATE POLICY "Users can view their own waitlist entries"
ON public.pro_waitlist
FOR SELECT
TO authenticated
USING (user_id = auth.uid());