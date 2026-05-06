-- ════════════════════════════════════════════════════════════════════
-- 0004_leads_extended.sql — enrichissement CRM pour matcher l'UI admin
-- ════════════════════════════════════════════════════════════════════
-- L'UI admin (/admin/*) attend un modèle plus riche que le slice minimum :
--   - 8 statuts (au lieu de 5)            : +visit_scheduled/visit_done/offer/signed
--   - profil buyer étendu                 : city, country, languages
--   - biens consultés avant contact       : pour montrer le contexte au conseiller
--   - visite planifiée                    : at/property/confirmed (queryable)
--   - offre en cours                      : amount/submittedAt/status (queryable)
--
-- Cette migration AJOUTE les colonnes — aucune colonne existante n'est
-- renommée ni supprimée. Rejouer à volonté (IF NOT EXISTS partout).
-- ════════════════════════════════════════════════════════════════════

-- ── Profil buyer étendu ──────────────────────────────────────────────
alter table leads add column if not exists buyer_city text;
alter table leads add column if not exists buyer_country text;
alter table leads add column if not exists buyer_languages jsonb default '[]'::jsonb;
alter table leads add column if not exists properties_viewed jsonb default '[]'::jsonb;

-- ── Visite planifiée (queryable → index pour dashboard "visites") ────
alter table leads add column if not exists next_visit_at timestamptz;
alter table leads add column if not exists next_visit_property_slug text references properties(slug);
alter table leads add column if not exists next_visit_confirmed boolean default false;

create index if not exists leads_next_visit_idx on leads(next_visit_at)
  where next_visit_at is not null and closed_at is null;

-- ── Offre en cours (queryable → index pour dashboard "offres") ───────
alter table leads add column if not exists offer_amount numeric;
alter table leads add column if not exists offer_submitted_at timestamptz;
alter table leads add column if not exists offer_status text;
--   offer_status : pending | accepted | rejected

create index if not exists leads_offer_idx on leads(offer_submitted_at)
  where offer_status = 'pending';

-- ── Vocabulaires documentés (check constraints soft — on reste en text) ──
-- status :   new | contacted | qualified | visit_scheduled | visit_done |
--            offer | signed | lost
-- channel :  contact_form | property_form | whatsapp | email | phone | matching
-- intent :   acheter | louer | vendre | autre
-- sla_tier : urgent | standard

-- Pas de CHECK pour garder la souplesse en itération — validation applicative
-- côté Zod dans src/lib/leads.ts.
