-- Zittu traffic split + leads table
-- Run in Supabase SQL Editor

insert into traffic_split_routes (slug, name, path) values
  ('zittu', 'Zittu split', '/zittu-checker')
on conflict (slug) do update set name = excluded.name, path = excluded.path;

insert into traffic_split_variants (
  route_slug, lander_slug, destination_path, label, weight_percent, product_slug, country, active, sort_order
) values
  ('zittu', 'adv-1', '/zittu/adv/1/', 'Adv/1 — Advertorial', 25, 'zittu', 'NL', true, 1),
  ('zittu', 'adv-2', '/zittu/adv/2/', 'Adv/2 — Quiz funnel', 25, 'zittu', 'NL', true, 2),
  ('zittu', 'adv-3', '/zittu/adv/3/', 'Adv/3 — Stoelen test', 25, 'zittu', 'NL', true, 3),
  ('zittu', 'adv-4', '/zittu/adv/4/', 'Adv/4 — 1-staps form', 25, 'zittu', 'NL', true, 4)
on conflict (route_slug, lander_slug) do update set
  destination_path = excluded.destination_path,
  label = excluded.label,
  weight_percent = excluded.weight_percent,
  product_slug = excluded.product_slug,
  country = excluded.country,
  active = excluded.active,
  sort_order = excluded.sort_order;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  country text not null default 'NL',
  lander_slug text,
  naam text,
  telefoon text,
  email text,
  postcode text,
  huisnr text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_created on leads (created_at desc);
create index if not exists idx_leads_product_lander on leads (product_slug, lander_slug);

alter table leads enable row level security;

-- Allow lead + redirect_assign in analytics if needed
alter table analytics_events drop constraint if exists analytics_events_event_type_check;
alter table analytics_events add constraint analytics_events_event_type_check
  check (event_type in ('lander_view', 'checkout_view', 'purchase', 'redirect_assign', 'lead'));
