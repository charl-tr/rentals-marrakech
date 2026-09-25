-- ════════════════════════════════════════════════════════════════════
-- 0012_admin_identity_and_mfa.sql
--
-- Sépare le profil public advisor de son identité Auth privée, puis exige
-- une session AAL2 (TOTP validé) dans toutes les policies CRM.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.advisor_auth (
  advisor_slug text primary key references public.advisors(slug) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  linked_at timestamptz not null default now()
);

alter table public.advisor_auth enable row level security;

-- Cette table n'est interrogée que côté serveur avec service_role. Même un
-- utilisateur authentifié ne doit pas pouvoir énumérer les liaisons Auth.
revoke all on table public.advisor_auth from anon, authenticated;

-- Migration transparente des comptes existants dont l'email Auth correspond
-- à un profil actif. Les contraintes uniques bloquent toute liaison ambiguë.
insert into public.advisor_auth (advisor_slug, auth_user_id)
select a.slug, u.id
from public.advisors a
join auth.users u on lower(u.email) = lower(a.email)
where a.active = true
  and a.email is not null
on conflict do nothing;

create or replace function public.is_active_mfa_advisor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
    and exists (
      select 1
      from public.advisor_auth aa
      join public.advisors a on a.slug = aa.advisor_slug
      where aa.auth_user_id = (select auth.uid())
        and a.active = true
    );
$$;

revoke all on function public.is_active_mfa_advisor() from public;
grant execute on function public.is_active_mfa_advisor() to authenticated;

-- Leads -------------------------------------------------------------------
drop policy if exists "authenticated admins can read/update" on public.leads;
drop policy if exists "active mfa admins full access leads" on public.leads;
create policy "active mfa admins full access leads" on public.leads
  for all to authenticated
  using ((select public.is_active_mfa_advisor()))
  with check ((select public.is_active_mfa_advisor()));

drop policy if exists "authenticated admins full access" on public.lead_events;
drop policy if exists "active mfa admins full access lead_events" on public.lead_events;
create policy "active mfa admins full access lead_events" on public.lead_events
  for all to authenticated
  using ((select public.is_active_mfa_advisor()))
  with check ((select public.is_active_mfa_advisor()));

drop policy if exists "authenticated admins full access" on public.email_templates;
drop policy if exists "active mfa admins full access email_templates" on public.email_templates;
create policy "active mfa admins full access email_templates" on public.email_templates
  for all to authenticated
  using ((select public.is_active_mfa_advisor()))
  with check ((select public.is_active_mfa_advisor()));

-- Mandats et historique biens ---------------------------------------------
drop policy if exists "authenticated admins full access mandates" on public.mandates;
drop policy if exists "active mfa admins full access mandates" on public.mandates;
create policy "active mfa admins full access mandates" on public.mandates
  for all to authenticated
  using ((select public.is_active_mfa_advisor()))
  with check ((select public.is_active_mfa_advisor()));

drop policy if exists "authenticated admins full access property_events" on public.property_events;
drop policy if exists "active mfa admins full access property_events" on public.property_events;
create policy "active mfa admins full access property_events" on public.property_events
  for all to authenticated
  using ((select public.is_active_mfa_advisor()))
  with check ((select public.is_active_mfa_advisor()));

-- Shortlists ---------------------------------------------------------------
drop policy if exists "authenticated admins full access shortlist" on public.lead_shortlist;
drop policy if exists "active mfa admins full access shortlist" on public.lead_shortlist;
create policy "active mfa admins full access shortlist" on public.lead_shortlist
  for all to authenticated
  using ((select public.is_active_mfa_advisor()))
  with check ((select public.is_active_mfa_advisor()));
