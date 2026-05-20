-- ROLLBACK for 20260518140000_senior_pep_gaokao_vocab_ingest.sql
-- Removes rows tagged 'pep_compulsory' from gaokao_vocab (append ingest only).

BEGIN;

DELETE FROM public.gaokao_user_mastery
 WHERE item_type = 'vocab'
   AND item_id IN (
     SELECT id::text FROM public.gaokao_vocab WHERE tags @> '["pep_compulsory"]'::jsonb
   );

DELETE FROM public.gaokao_vocab
 WHERE tags @> '["pep_compulsory"]'::jsonb;

DELETE FROM public._senior_pep_gaokao_ingest_meta WHERE id = 1;

COMMIT;
