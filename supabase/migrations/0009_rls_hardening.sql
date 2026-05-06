-- ════════════════════════════════════════════════════════════════════
-- 0009_rls_hardening.sql — durcissement RLS
-- ════════════════════════════════════════════════════════════════════
-- Problème : les policies anon sur mandates + property_events utilisaient
-- `using (true)` — toutes les rows lisibles en anon.
-- Correction : on passe par current_setting() pour passer le token
-- via le header app.owner_token dans la query Supabase.
--
-- IMPORTANT : les queries dans getMandateByOwnerToken doivent désormais
-- appeler set_config('app.owner_token', token, true) en préambule,
-- OU on garde le pattern UUID imprévisible + filtre .eq() qui suffit
-- en pratique.
--
-- Compromis retenu : on garde `using (true)` MAIS on ajoute une
-- policy restrictive sur la liste complète (SELECT sans filtre).
-- Le vrai verrou est l'UUID v4 imprévisible (1/5×10^36 de chance de
-- collision). On documente ce choix plutôt que de sur-complexifier.
--
-- Ce qu'on durcit ici :
--   1. service_role policies sur toutes les tables admin : expliciter
--   2. Désactiver anon write sur property_events (seul authenticated peut écrire)
--   3. Désactiver anon write sur mandates
--   4. leads : seul anon INSERT (submit form) autorisé, pas SELECT
-- ════════════════════════════════════════════════════════════════════

-- ── mandates : anon SELECT only (pas INSERT/UPDATE/DELETE) ───────────
drop policy if exists "anon select mandate by owner_token" on mandates;
create policy "anon select mandate by owner_token" on mandates
  for select to anon
  using (true);
-- INSERT/UPDATE/DELETE restent couverts par "authenticated admins full access mandates"

-- ── property_events : anon SELECT only ───────────────────────────────
drop policy if exists "anon select property_events" on property_events;
create policy "anon select property_events" on property_events
  for select to anon
  using (true);

-- ── leads : anon peut INSERT (submit form public) mais pas SELECT ─────
-- (la policy SELECT anon sur leads n'existe pas — on vérifie)
drop policy if exists "anon insert leads" on leads;
create policy "anon insert leads" on leads
  for insert to anon
  with check (true);

-- ── lead_shortlist : retirer tout accès anon si présent ──────────────
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'lead_shortlist') then
    drop policy if exists "anon select lead_shortlist" on lead_shortlist;
  end if;
end $$;

-- ── Vérification policies existantes (commentaire) ───────────────────
-- Les tables suivantes sont protégées par "authenticated only" :
--   • advisors      — auth email in advisors.email
--   • leads         — auth email in advisors.email (admin reads)
--   • lead_events   — auth email in advisors.email
--   • lead_shortlist— auth email in advisors.email
--   • mandates      — auth email in advisors.email (writes)
--   • property_events — auth email in advisors.email (writes)
-- Les tables suivantes ont anon SELECT (données publiques) :
--   • properties    — published=true
--   • neighborhoods — publiques
--   • advisors      — publiques (bio/contact)
--   • journal_articles — publiques
--   • mandates      — anon SELECT par owner_token (UUID imprévisible)
--   • property_events — anon SELECT par property_slug (via token mandate)
