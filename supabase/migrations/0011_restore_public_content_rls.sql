-- ════════════════════════════════════════════════════════════════════
-- 0011_restore_public_content_rls.sql
--
-- Les trois tables ont été trouvées avec RLS désactivé en production,
-- malgré les protections prévues dans 0001_initial_schema.sql. Les grants
-- Supabase par défaut donnaient alors à anon SELECT/INSERT/UPDATE/DELETE.
--
-- Cette migration restaure la lecture publique attendue tout en bloquant
-- les écritures anonymes. Le service_role continue de bypasser RLS.
-- ════════════════════════════════════════════════════════════════════

alter table public.advisors enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.journal_articles enable row level security;

drop policy if exists "public read advisors" on public.advisors;
create policy "public read advisors" on public.advisors
  for select to anon, authenticated
  using (true);

drop policy if exists "public read neighborhoods" on public.neighborhoods;
create policy "public read neighborhoods" on public.neighborhoods
  for select to anon, authenticated
  using (true);

drop policy if exists "public read journal" on public.journal_articles;
create policy "public read journal" on public.journal_articles
  for select to anon, authenticated
  using (true);

-- Empêche deux profils équipe de partager la même identité de connexion,
-- sans bloquer les advisors qui n'ont pas encore d'email.
create unique index if not exists advisors_email_lower_unique_idx
  on public.advisors (lower(email))
  where email is not null;
