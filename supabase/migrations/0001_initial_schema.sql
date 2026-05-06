-- Migration 0001 — schéma initial Marrakech Realty
-- À exécuter dans Supabase SQL Editor (ou via `supabase db push` si la CLI est configurée).

-- ========================================================================
-- NEIGHBORHOODS — quartiers éditorialisés
-- ========================================================================
create table if not exists neighborhoods (
  slug text primary key,
  name text not null,
  city text not null check (city in ('Marrakech', 'Essaouira')),
  tagline text,
  paragraphs jsonb default '[]'::jsonb,    -- array of editorial paragraphs
  highlights jsonb default '[]'::jsonb,    -- array of {label, description}
  image_hero text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================================================
-- ADVISORS — conseillers nommés
-- ========================================================================
create table if not exists advisors (
  slug text primary key,
  name text not null,
  role text not null,
  photo text,
  phone text,
  whatsapp text,
  email text,
  speciality text,
  languages text[] default '{}',
  years_experience int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================================================
-- PROPERTIES — biens immobiliers (vente + location + programmes neufs)
-- Le slug est préservé depuis marrakechrealty.com pour le SEO.
-- ========================================================================
create table if not exists properties (
  slug text primary key,
  reference text not null,
  title text not null,
  tagline text,
  type text not null check (type in (
    'riad-renove', 'riad-a-renover', 'villa', 'appartement',
    'maison-hotes', 'programme-neuf', 'terrain'
  )),
  listing text not null check (listing in ('vente', 'location', 'location-saisonniere')),
  exclusivity boolean default false,
  city text not null check (city in ('Marrakech', 'Essaouira')),
  neighborhood_slug text references neighborhoods(slug) on delete set null,
  price_eur integer not null,
  price_mad integer,
  price_unit text check (price_unit in ('semaine', 'mois') or price_unit is null),
  bedrooms int,
  bathrooms int,
  surface int,
  land_surface int,
  year_built int,
  pool boolean default false,
  featured boolean default false,
  short_description text,
  description text,
  story jsonb,                    -- {eyebrow, title, paragraphs: string[]}
  features text[] default '{}',
  images text[] default '{}',     -- URLs Supabase Storage (ou externes en fallback)
  walking_distances jsonb default '[]'::jsonb,  -- [{label, minutes}]
  coordinates point,              -- postgis point (lat, lng)
  advisor_slug text references advisors(slug) on delete set null,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists properties_type_idx on properties(type);
create index if not exists properties_listing_idx on properties(listing);
create index if not exists properties_city_idx on properties(city);
create index if not exists properties_neighborhood_idx on properties(neighborhood_slug);
create index if not exists properties_featured_idx on properties(featured) where featured = true;
create index if not exists properties_published_idx on properties(published) where published = true;

-- ========================================================================
-- JOURNAL ARTICLES
-- ========================================================================
create table if not exists journal_articles (
  slug text primary key,
  title text not null,
  lead text,
  category text,
  author text,
  published_at timestamptz,
  reading_time int,
  image_hero text,
  paragraphs jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================================================
-- Triggers — updated_at automatique
-- ========================================================================
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on properties;
create trigger set_updated_at before update on properties
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at on advisors;
create trigger set_updated_at before update on advisors
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at on neighborhoods;
create trigger set_updated_at before update on neighborhoods
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at on journal_articles;
create trigger set_updated_at before update on journal_articles
  for each row execute function trigger_set_updated_at();

-- ========================================================================
-- ROW LEVEL SECURITY — lecture publique sur published=true seulement
-- ========================================================================
alter table properties enable row level security;
alter table advisors enable row level security;
alter table neighborhoods enable row level security;
alter table journal_articles enable row level security;

drop policy if exists "public read published properties" on properties;
create policy "public read published properties" on properties
  for select using (published = true);

drop policy if exists "public read advisors" on advisors;
create policy "public read advisors" on advisors
  for select using (true);

drop policy if exists "public read neighborhoods" on neighborhoods;
create policy "public read neighborhoods" on neighborhoods
  for select using (true);

drop policy if exists "public read journal" on journal_articles;
create policy "public read journal" on journal_articles
  for select using (true);

-- Note : les INSERT/UPDATE/DELETE ne sont pas autorisés par défaut aux
-- utilisateurs anonymes. Seul le service_role key peut écrire. Parfait
-- pour les scripts de seed. Plus tard, on ouvrira l'écriture aux rôles
-- authenticated avec des policies par conseiller.
