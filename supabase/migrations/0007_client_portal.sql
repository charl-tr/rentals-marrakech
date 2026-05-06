-- ════════════════════════════════════════════════════════════════════
-- 0007_client_portal.sql — portail acheteur personnalisé
-- ════════════════════════════════════════════════════════════════════
-- Un lead reçoit un token imprévisible (UUID v4) dès sa création.
-- L'URL /mon-espace/[token] permet au client d'accéder à son espace
-- sans mot de passe, juste la connaissance du token.
--
-- Sécurité : le token est dans l'email envoyé au client (canal sécurisé)
-- et sur le serveur uniquement — jamais exposé au DOM public.
--
-- Ajout table `lead_shortlist` : les biens curés par le conseiller pour
-- ce lead spécifique, avec note contextuelle.
-- ════════════════════════════════════════════════════════════════════

-- Token portail sur leads
alter table leads
  add column if not exists portal_token uuid not null default gen_random_uuid();

create unique index if not exists leads_portal_token_idx on leads(portal_token);

-- Table shortlist
create table if not exists lead_shortlist (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  property_slug text not null references properties(slug) on delete cascade,
  advisor_note text,
  added_at timestamptz not null default now(),
  added_by text references advisors(slug),
  unique(lead_id, property_slug)
);

create index if not exists lead_shortlist_lead_idx
  on lead_shortlist(lead_id, added_at desc);

alter table lead_shortlist enable row level security;
drop policy if exists "authenticated admins full access shortlist" on lead_shortlist;
create policy "authenticated admins full access shortlist" on lead_shortlist
  for all to authenticated
  using (auth.email() in (select email from advisors where active = true));
