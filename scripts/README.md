# Pipeline données MR → Supabase

Flux en trois étapes, à exécuter dans l'ordre.

```
marrakechrealty.com
      │
      │  (1) scrape-mr.sh
      ▼
fixtures/fiches/*.html
      │
      │  (2) parse-mr.py
      ▼
fixtures/properties.json
      │
      │  (3) seed-supabase.ts  (à écrire quand Supabase prêt)
      ▼
Supabase Postgres + Storage
      │
      │  (Next.js lit via @supabase/supabase-js)
      ▼
rentals-marrakech (site live)
```

## 1. Scrape — HTML brut

```sh
bash scripts/scrape-mr.sh
```

Lit `scripts/urls.txt`, télécharge chaque fiche dans `scripts/fixtures/fiches/`. Idempotent.

**⚠️ IP ban** : MR rate-limit agressivement. Si toutes les requêtes timeout, lancer depuis une IP fraîche (VPN, hotspot, GitHub Action, serveur cloud).

## 2. Parse — HTML → JSON structuré

```sh
python3 scripts/parse-mr.py
```

Produit `scripts/fixtures/properties.json`. Champs extraits : `ref`, `title`, `slug`, `listing`, `typeBien`, `ville`, `bedrooms`, `surfaceTerrain`, `surfaceHabitable`, `priceEur`, `priceMad`, `description`, `equipements`, `images`.

## 3. Seed Supabase — **à faire**

Étapes à venir quand projet Supabase créé :

1. `npx supabase init`
2. Migration SQL (tables `properties`, `advisors`, `neighborhoods`, `property_images`)
3. `scripts/seed-supabase.ts` qui lit `properties.json` et push via `@supabase/supabase-js`
4. Download des images distantes → Supabase Storage bucket `properties/`
5. Refactor `src/data/properties.ts` → client server-side qui query Supabase

## Mapping JSON → schema Supabase (projection)

```sql
properties (
  id uuid primary key,
  slug text unique not null,      -- réutilise le slug MR intact
  reference text not null,
  title text not null,
  tagline text,
  type text not null,             -- riad-renove | villa | ...
  listing text not null,          -- vente | location | location-saisonniere
  exclusivity boolean default false,
  city text not null,
  neighborhood_slug text references neighborhoods(slug),
  price_eur integer not null,
  price_mad integer,
  price_unit text,
  bedrooms integer,
  bathrooms integer,
  surface integer,
  land_surface integer,
  year_built integer,
  pool boolean default false,
  featured boolean default false,
  short_description text,
  description text,
  story jsonb,                    -- { eyebrow, title, paragraphs[] }
  features text[],
  walking_distances jsonb,        -- [{ label, minutes }]
  coordinates point,
  advisor_slug text references advisors(slug),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published boolean default true
);
```

RLS : lecture publique sur `published = true`, écriture réservée aux rôles authenticated avec policy par advisor.
