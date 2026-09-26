-- Approved retention: delete only measurements older than 90 days and their
-- attribution ID, never the contact record or CRM activity history.
create extension if not exists pg_cron;
select cron.schedule(
  'purge-conversion-events-daily',
  '15 3 * * *',
  'select public.purge_conversion_events();'
);
