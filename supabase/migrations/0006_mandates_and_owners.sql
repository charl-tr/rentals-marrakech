-- ════════════════════════════════════════════════════════════════════
-- 0006_mandates_and_owners.sql — mandat commercial + propriétaire bien
-- ════════════════════════════════════════════════════════════════════
-- Ajoute 3 éléments :
--   1. Colonnes propriétaire sur `properties` (denormalisé, simple)
--      — dette assumée : un vrai refactor table `owners` viendra en Phase D
--   2. Table `mandates` — contrat commercial propriétaire × bien
--   3. Table `property_events` — timeline des événements sur un bien
--      (prix changé, statut changé, mandat créé, visite, etc.)
--
-- Vocabulaires (non enforcés au DB, validation app via Zod) :
--   mandates.type         : exclusif | simple | apport_affaires
--   mandates.status       : active | paused | expired | terminated
--   property_events.type  : status_change | price_change | publish_change |
--                           featured_change | mandate_created | mandate_updated |
--                           mandate_closed | owner_updated | note |
--                           visit_scheduled | visit_completed | offer_submitted
--
-- RLS : anon read sur mandates.status='active' (pour contrôles publics si
-- nécessaire), sinon authenticated-only.
-- ════════════════════════════════════════════════════════════════════

-- ── Colonnes propriétaire sur properties ─────────────────────────────
alter table properties add column if not exists owner_name text;
alter table properties add column if not exists owner_phone text;
alter table properties add column if not exists owner_email text;
alter table properties add column if not exists owner_notes text;

-- ── Table mandates ────────────────────────────────────────────────────
create table if not exists mandates (
  id uuid primary key default gen_random_uuid(),
  property_slug text not null references properties(slug) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Type + conditions
  type text not null default 'simple',  -- exclusif | simple | apport_affaires
  exclusivity boolean not null default false,
  commission_pct numeric(4,2),          -- ex : 3.50 (%)
  commission_fixed numeric,             -- OU montant fixe en EUR

  -- Dates
  signed_at date,
  start_date date,
  expiry_date date,
  closed_at date,

  -- Status + disposition
  status text not null default 'active', -- active | paused | expired | terminated
  disposition text,                       -- raison de fin si applicable

  -- Références
  assigned_advisor_slug text references advisors(slug),

  -- Notes internes
  notes text,

  meta jsonb default '{}'::jsonb
);

create index if not exists mandates_property_idx on mandates(property_slug);
create index if not exists mandates_status_idx on mandates(status);
create index if not exists mandates_expiry_idx on mandates(expiry_date)
  where status = 'active' and expiry_date is not null;

-- ── Table property_events ────────────────────────────────────────────
create table if not exists property_events (
  id uuid primary key default gen_random_uuid(),
  property_slug text not null references properties(slug) on delete cascade,
  mandate_id uuid references mandates(id) on delete set null,
  created_at timestamptz not null default now(),

  type text not null,
  author_slug text references advisors(slug),
  body text,
  payload jsonb default '{}'::jsonb
);

create index if not exists property_events_property_idx
  on property_events(property_slug, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────
alter table mandates enable row level security;
drop policy if exists "authenticated admins full access mandates" on mandates;
create policy "authenticated admins full access mandates" on mandates
  for all to authenticated
  using (auth.email() in (select email from advisors where active = true));

alter table property_events enable row level security;
drop policy if exists "authenticated admins full access property_events" on property_events;
create policy "authenticated admins full access property_events" on property_events
  for all to authenticated
  using (auth.email() in (select email from advisors where active = true));
