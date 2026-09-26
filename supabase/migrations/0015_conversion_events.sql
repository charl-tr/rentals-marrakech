-- Public browser events contain no contact details. Only the server can read/write.
create table if not exists public.conversion_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event text not null check (event in ('property_view', 'favorite_add')),
  property_slug text not null references public.properties(slug) on delete cascade,
  version text not null default 'conversion-v1',
  unique (session_id, event, property_slug)
);
alter table public.conversion_events enable row level security;
revoke all on public.conversion_events from anon, authenticated;
grant all on public.conversion_events to service_role;
grant usage, select on sequence public.conversion_events_id_seq to service_role;
create index if not exists conversion_events_created_at_idx on public.conversion_events(created_at);

-- Run daily from the project's scheduler; same retention applies to lead attribution.
create or replace function public.purge_conversion_events() returns void
language sql security definer set search_path = public as $$
  delete from public.conversion_events where created_at < now() - interval '90 days';
  update public.leads set meta = meta - 'funnel_session_id'
    where created_at < now() - interval '90 days' and meta ? 'funnel_session_id';
$$;
revoke all on function public.purge_conversion_events() from public, anon, authenticated;
grant execute on function public.purge_conversion_events() to service_role;
