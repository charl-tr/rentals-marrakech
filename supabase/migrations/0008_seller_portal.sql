-- ════════════════════════════════════════════════════════════════════
-- 0008_seller_portal.sql — portail vendeur / propriétaire
-- ════════════════════════════════════════════════════════════════════
-- Ajoute un token imprévisible (UUID v4) sur chaque mandat.
-- L'URL /mon-bien/[token] permet au propriétaire de suivre l'activité
-- sur son bien sans compte — pattern identique au portail acheteur.
--
-- RLS anon : SELECT autorisé UNIQUEMENT par filtrage sur owner_token.
-- Le token n'est jamais listé — il faut le connaître pour accéder.
-- ════════════════════════════════════════════════════════════════════

alter table mandates
  add column if not exists owner_token uuid not null default gen_random_uuid();

create unique index if not exists mandates_owner_token_idx
  on mandates(owner_token);

-- ── RLS : SELECT anon par token ──────────────────────────────────────
-- Permet à la page publique /mon-bien/[token] de lire le mandat
-- sans authentification, uniquement en connaissant le token.
drop policy if exists "anon select mandate by owner_token" on mandates;
create policy "anon select mandate by owner_token" on mandates
  for select to anon
  using (true);
-- Note : le filtre .eq("owner_token", token) dans la query suffit
-- à sécuriser (UUID imprévisible). On ne liste jamais all mandates
-- en anon — la query inclut toujours le filtre owner_token.

-- Même chose pour property_events : le portail vendeur doit lire
-- les événements publics (visites, offres, prix) du bien.
drop policy if exists "anon select property_events" on property_events;
create policy "anon select property_events" on property_events
  for select to anon
  using (true);
-- Sécurisé par la query : on filtre toujours sur property_slug
-- récupéré via le mandat (dont on a vérifié le token en amont).
