-- Migration 0002 — ajout colonne status sur properties
-- Mapping MR : bg-loue→rented, bg-vendu→sold, bg-new→new, bg-compromis→reserved
-- Default = 'available' (bien disponible à la transaction)

alter table properties
  add column if not exists status text not null default 'available'
    check (status in ('available', 'new', 'sold', 'rented', 'reserved'));

create index if not exists properties_status_idx on properties(status);
