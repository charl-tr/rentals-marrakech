-- ════════════════════════════════════════════════════════════════════
-- 0003_leads.sql — CRM core : leads + timeline + templates
-- ════════════════════════════════════════════════════════════════════
-- Première brique du CRM. Schéma minimal mais extensible :
--   - leads          : un dossier prospect, tous canaux confondus
--   - lead_events    : timeline chronologique (tout est event)
--   - email_templates: templates éditables par l'admin sans dev
--   - advisors       : +active +specialties pour autonomie directeur
--
-- RLS :
--   - anon peut INSERT sur leads (formulaires publics)
--   - authenticated (= session magic-link whitelisted dans advisors.email)
--     peut lire/écrire tout le reste
--
-- Appliqué en direct via SQL Editor le 2026-04-17 — ce fichier versionne
-- cet état.
-- ════════════════════════════════════════════════════════════════════

-- ── Table leads ─────────────────────────────────────────────────────
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Identité prospect
  name text not null,
  email text,
  phone text,
  country_code text,
  preferred_language text,

  -- Source + contexte
  channel text not null,
  source_page text,
  property_slug text references properties(slug),
  intent text not null,
  message text,

  -- Critères détectés au submit
  criteria_type text,
  criteria_neighborhood_slug text references neighborhoods(slug),
  criteria_budget_max numeric,
  criteria_bedrooms_min int,

  -- Workflow
  status text not null default 'new',
  assigned_advisor_slug text references advisors(slug),
  assigned_at timestamptz,
  first_action_at timestamptz,
  sla_tier text not null default 'standard',
  sla_due_at timestamptz,
  closed_at timestamptz,
  disposition text,

  -- Méta
  published boolean not null default true,
  meta jsonb default '{}'::jsonb
);

create index if not exists leads_status_idx on leads(status);
create index if not exists leads_advisor_idx on leads(assigned_advisor_slug);
create index if not exists leads_sla_idx on leads(sla_due_at) where closed_at is null;
create index if not exists leads_created_idx on leads(created_at desc);

-- ── Table lead_events ───────────────────────────────────────────────
create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),

  type text not null,
  -- status_change | note | call_logged | email_sent | email_received |
  -- whatsapp_sent | whatsapp_received | visit_scheduled | visit_completed |
  -- assignment_change | sla_breach | document_sent | created

  author_slug text references advisors(slug),
  body text,
  payload jsonb default '{}'::jsonb
);

create index if not exists lead_events_lead_idx on lead_events(lead_id, created_at desc);

-- ── Advisors : autonomie directeur ─────────────────────────────────
alter table advisors add column if not exists active boolean not null default true;
alter table advisors add column if not exists specialties jsonb default '[]'::jsonb;

-- ── Table email_templates ──────────────────────────────────────────
create table if not exists email_templates (
  slug text primary key,
  subject text not null,
  body_mjml text not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- ── Row Level Security ─────────────────────────────────────────────
alter table leads enable row level security;
drop policy if exists "anon can insert leads" on leads;
create policy "anon can insert leads" on leads
  for insert to anon with check (true);

drop policy if exists "authenticated admins can read/update" on leads;
create policy "authenticated admins can read/update" on leads
  for all to authenticated
  using (auth.email() in (select email from advisors where active = true));

alter table lead_events enable row level security;
drop policy if exists "authenticated admins full access" on lead_events;
create policy "authenticated admins full access" on lead_events
  for all to authenticated
  using (auth.email() in (select email from advisors where active = true));

alter table email_templates enable row level security;
drop policy if exists "authenticated admins full access" on email_templates;
create policy "authenticated admins full access" on email_templates
  for all to authenticated
  using (auth.email() in (select email from advisors where active = true));
