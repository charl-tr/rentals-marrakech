-- ════════════════════════════════════════════════════════════════════
-- 0010_db_hardening.sql — hardening complet basé sur l'état réel de la DB
-- Idempotent : toutes les opérations utilisent IF NOT EXISTS / IF EXISTS.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Fonction updated_at (CREATE OR REPLACE = toujours safe) ────────
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── 2. updated_at sur leads ───────────────────────────────────────────
alter table leads
  add column if not exists updated_at timestamptz default now();

drop trigger if exists set_updated_at on leads;
create trigger set_updated_at
  before update on leads
  for each row execute function trigger_set_updated_at();

-- ── 3. updated_at sur lead_events ─────────────────────────────────────
alter table lead_events
  add column if not exists updated_at timestamptz default now();

drop trigger if exists set_updated_at on lead_events;
create trigger set_updated_at
  before update on lead_events
  for each row execute function trigger_set_updated_at();

-- ── 4. updated_at sur mandates (colonne existe déjà, trigger manque) ──
drop trigger if exists set_updated_at on mandates;
create trigger set_updated_at
  before update on mandates
  for each row execute function trigger_set_updated_at();

-- ── 5. portal_token sur leads (manquant = 0007 non appliquée) ─────────
alter table leads
  add column if not exists portal_token uuid not null default gen_random_uuid();

-- ── 6. last_activity_at sur leads ─────────────────────────────────────
alter table leads
  add column if not exists last_activity_at timestamptz;

update leads set last_activity_at = created_at where last_activity_at is null;

create or replace function trigger_update_lead_last_activity()
returns trigger as $$
begin
  update leads set last_activity_at = new.created_at
  where id = new.lead_id
    and (last_activity_at is null or new.created_at > last_activity_at);
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_lead_last_activity on lead_events;
create trigger update_lead_last_activity
  after insert on lead_events
  for each row execute function trigger_update_lead_last_activity();

-- ── 7. Table lead_shortlist (créée normalement en 0007) ───────────────
create table if not exists lead_shortlist (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  property_slug text not null,
  advisor_note  text,
  added_at    timestamptz not null default now(),
  added_by    text
);

alter table lead_shortlist enable row level security;

drop policy if exists "authenticated admins full access shortlist" on lead_shortlist;
create policy "authenticated admins full access shortlist" on lead_shortlist
  for all to authenticated
  using (true)
  with check (true);

-- ── 8. Index sur leads ────────────────────────────────────────────────
create index if not exists leads_property_slug_idx
  on leads(property_slug)
  where property_slug is not null;

create index if not exists leads_advisor_slug_idx
  on leads(assigned_advisor_slug)
  where assigned_advisor_slug is not null;

-- ── 9. Index sur lead_shortlist ───────────────────────────────────────
create index if not exists lead_shortlist_lead_idx
  on lead_shortlist(lead_id, added_at desc);

create index if not exists lead_shortlist_property_slug_idx
  on lead_shortlist(property_slug);

-- ── 10. Index sur property_events ─────────────────────────────────────
create index if not exists property_events_slug_created_idx
  on property_events(property_slug, created_at desc);

-- ── 11. Index sur mandates.owner_token ────────────────────────────────
create unique index if not exists mandates_owner_token_idx
  on mandates(owner_token);
