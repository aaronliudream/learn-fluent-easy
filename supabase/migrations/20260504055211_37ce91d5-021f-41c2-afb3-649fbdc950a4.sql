-- Reset streak_recall_sent_at when the user becomes active again
CREATE OR REPLACE FUNCTION public.reset_streak_recall_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
     SET streak_recall_sent_at = NULL
   WHERE user_id = NEW.user_id
     AND streak_recall_sent_at IS NOT NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reset_streak_recall ON public.learning_events;
CREATE TRIGGER trg_reset_streak_recall
AFTER INSERT ON public.learning_events
FOR EACH ROW
EXECUTE FUNCTION public.reset_streak_recall_on_activity();

-- Schedule the recall to run daily at 18:00 UTC
SELECT cron.schedule(
  'streak-recall-daily',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://fottntyhwolbsdvkwriq.supabase.co/functions/v1/streak-recall',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdHRudHlod29sYnNkdmt3cmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzg2NzUsImV4cCI6MjA5MjkxNDY3NX0.s7YXfJzG_DRIGWwrYmX4gehxwmPEXbWLOqrLEzAueM4"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);