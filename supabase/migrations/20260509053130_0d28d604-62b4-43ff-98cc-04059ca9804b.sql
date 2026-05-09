
CREATE TABLE public.guest_ai_usage (
  client_id TEXT NOT NULL,
  day DATE NOT NULL,
  message_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, day)
);
ALTER TABLE public.guest_ai_usage ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) may read/write their own row keyed by client_id.
-- The edge function uses service role and enforces real limits server-side;
-- these policies are just to allow direct inspection if ever needed.
CREATE POLICY "guest_usage anon read" ON public.guest_ai_usage
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "guest_usage anon write" ON public.guest_ai_usage
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "guest_usage anon update" ON public.guest_ai_usage
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
