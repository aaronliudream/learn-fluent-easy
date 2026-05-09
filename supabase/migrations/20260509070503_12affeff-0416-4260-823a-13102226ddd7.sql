-- Create the public bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-cache', 'tts-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Clean up any stale policies with the same names
DROP POLICY IF EXISTS "Public read access for tts-cache" ON storage.objects;
DROP POLICY IF EXISTS "Service role write access for tts-cache" ON storage.objects;
DROP POLICY IF EXISTS "Service role update access for tts-cache" ON storage.objects;
DROP POLICY IF EXISTS "Service role delete access for tts-cache" ON storage.objects;

-- Public read: anyone (anon or authenticated) can read
CREATE POLICY "Public read access for tts-cache"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'tts-cache');

-- Service role insert
CREATE POLICY "Service role write access for tts-cache"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'tts-cache');

-- Service role update
CREATE POLICY "Service role update access for tts-cache"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'tts-cache')
WITH CHECK (bucket_id = 'tts-cache');

-- Service role delete
CREATE POLICY "Service role delete access for tts-cache"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'tts-cache');