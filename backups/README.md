# Automated nightly Supabase snapshots

These files are written by `.github/workflows/backup.yml` and can be used to restore the `todos`, `subscribers`, and `god_status` tables after accidental data loss.
Last 30 days are retained automatically.
