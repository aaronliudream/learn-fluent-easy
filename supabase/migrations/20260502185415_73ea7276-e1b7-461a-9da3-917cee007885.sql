-- Public bucket for cached TTS MP3s. Files are content-addressed by SHA-256
-- of (provider|voice|speed|accent|text), so the same utterance is generated
-- at most once across the whole user base, and subsequent playbacks come
-- straight from Supabase's CDN — no edge function round-trip needed.
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-audio', 'tts-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Anyone can read the cached audio (same as a CDN).
DROP POLICY IF EXISTS "tts audio public read" ON storage.objects;
CREATE POLICY "tts audio public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tts-audio');

-- Only the service role (edge function) writes; no anon/auth policy needed.
