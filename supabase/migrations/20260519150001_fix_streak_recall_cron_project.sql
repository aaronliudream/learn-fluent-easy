-- Point streak-recall daily cron at the new Supabase project (degqpiiddkxcuzwombwp).
-- Requires pg_cron extension (Supabase Dashboard → Database → Extensions → pg_cron).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
    RAISE NOTICE 'pg_cron not enabled — skip streak-recall reschedule (enable in Dashboard)';
    RETURN;
  END IF;

  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'streak-recall-daily';

  PERFORM cron.schedule(
    'streak-recall-daily',
    '0 18 * * *',
    $cron$
    SELECT net.http_post(
      url := 'https://degqpiiddkxcuzwombwp.supabase.co/functions/v1/streak-recall',
      headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZ3FwaWlkZGt4Y3V6d29tYndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTQ1MDksImV4cCI6MjA5NDUzMDUwOX0.PMZhguoZVWNKBxUCTggKGoKkgf9xiKOd8dZ27r4N_qU"}'::jsonb,
      body := '{}'::jsonb
    );
    $cron$
  );
END $$;
