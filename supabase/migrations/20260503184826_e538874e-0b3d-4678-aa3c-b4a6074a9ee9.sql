CREATE TABLE IF NOT EXISTS public.pet_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pet_id uuid,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  redacted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pet_chat_user_time ON public.pet_chat_messages(user_id, created_at DESC);
ALTER TABLE public.pet_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own chat" ON public.pet_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own chat" ON public.pet_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own chat" ON public.pet_chat_messages FOR DELETE USING (auth.uid() = user_id);