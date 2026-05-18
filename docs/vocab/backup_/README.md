# Pre-ingest database backups (read-only)

Export **before** running `20260517120000_junior_vocab_pep_ingest.sql`.

## Quick export (local CSV + JSON)

```bash
# From repo root — junior_vocab works with anon key
python scripts/export_junior_db_backup.py

# Full junior_word_mastery (all users) needs service role:
# Add SUPABASE_SERVICE_ROLE_KEY to .env (Dashboard → Settings → API), then:
python scripts/export_junior_db_backup.py
```

Outputs timestamped files here, e.g.:

- `junior_vocab_20260517T120000Z.csv` / `.json`
- `junior_word_mastery_20260517T120000Z.csv` / `.json`
- `export_meta_20260517T120000Z.json`

## SQL-only (Supabase console)

See `export_junior_backup.sql` — count check and optional snapshot tables. No deletes.

## Not in scope

- `.tmp_primary_insert.sql` — primary school; untouched by junior ingest.
