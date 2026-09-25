-- ════════════════════════════════════════════════════════════════════
-- 0013_sensitive_data_hardening.sql
--
-- Ferme deux expositions héritées :
--   1. mandates/property_events étaient entièrement lisibles par anon ;
--   2. les colonnes propriétaire de properties étaient sélectionnables via API.
-- Les portails tokenisés passent désormais exclusivement par le serveur.
-- ════════════════════════════════════════════════════════════════════

drop policy if exists "anon select mandate by owner_token" on public.mandates;
drop policy if exists "anon select property_events" on public.property_events;

-- Un filtre client n'est jamais une frontière d'autorisation. Sans policy
-- anon, aucune requête directe PostgREST ne peut lister ces données.

revoke select on table public.properties from anon, authenticated;

grant select (
  slug, reference, title, tagline, type, listing, status, exclusivity,
  city, neighborhood_slug, price_eur, price_mad, price_unit, bedrooms,
  bathrooms, surface, land_surface, year_built, pool, featured, published,
  short_description, description, story, features, images, walking_distances,
  coordinates, advisor_slug, created_at, updated_at
) on table public.properties to anon, authenticated;

-- owner_name, owner_phone, owner_email et owner_notes restent accessibles
-- uniquement au service_role utilisé dans les Server Components admin.
