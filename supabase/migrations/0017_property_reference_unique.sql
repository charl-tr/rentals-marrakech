-- Apply only after manually reconciling duplicate references. Never rename or
-- delete imported listings automatically. This migration fails safely if any
-- duplicate remains (including case and surrounding whitespace variants).
begin;
do $$
begin
  if exists (select 1 from public.properties group by upper(btrim(reference)) having count(*) > 1) then
    raise exception 'Duplicate property references remain. Reconcile them before applying 0017.';
  end if;
end $$;
create unique index if not exists properties_reference_normalized_unique
  on public.properties (upper(btrim(reference)));
commit;
