-- ════════════════════════════════════════════════════════════════════
-- 0014_wordpress_catalog_fidelity.sql
--
-- Rend l'import du catalogue WordPress fidèle et traçable :
--   • les villes et familles de biens non prévues en 0001 ne sont plus rejetées ;
--   • chaque ligne garde son identifiant, URL, libellés et date source ;
--   • l'import reste idempotent grâce à (source_platform, source_id) ;
--   • les champs propriétaires restent exclus des droits publics.
-- ════════════════════════════════════════════════════════════════════

alter table public.properties
  drop constraint if exists properties_type_check,
  drop constraint if exists properties_city_check;

alter table public.neighborhoods
  drop constraint if exists neighborhoods_city_check;

alter table public.properties
  add column if not exists source_platform text,
  add column if not exists source_id bigint,
  add column if not exists source_slug text,
  add column if not exists source_post_type text,
  add column if not exists source_url text,
  add column if not exists source_modified_at timestamptz,
  add column if not exists source_type_label text,
  add column if not exists source_location_label text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists description_html text,
  add column if not exists source_payload jsonb default '{}'::jsonb,
  add column if not exists imported_at timestamptz;

create unique index if not exists properties_source_identity_idx
  on public.properties(source_platform, source_id)
  where source_platform is not null and source_id is not null;

create index if not exists properties_source_modified_idx
  on public.properties(source_modified_at desc);

-- 0013 a volontairement remplacé le grant global par une liste blanche.
-- On étend uniquement cette liste aux nouvelles données éditoriales publiques.
grant select (
  source_platform, source_id, source_slug, source_post_type, source_url,
  source_modified_at, source_type_label, source_location_label,
  seo_title, seo_description, description_html, imported_at
) on table public.properties to anon, authenticated;

comment on column public.properties.source_payload is
  'Snapshot technique privé du contenu public source, réservé au service_role.';
