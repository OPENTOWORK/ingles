-- Reload PostgREST schema cache after creating or altering public."Levels_stars".
-- Apply via Supabase SQL editor or migration tooling.

NOTIFY pgrst, 'reload schema';
