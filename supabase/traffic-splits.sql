-- Run in Supabase SQL Editor (na schema.sql)

create table if not exists traffic_split_routes (
  slug text primary key,
  name text not null,
  path text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists traffic_split_variants (
  id uuid primary key default gen_random_uuid(),
  route_slug text not null references traffic_split_routes(slug) on delete cascade,
  lander_slug text not null,
  destination_path text not null,
  label text not null,
  weight_percent integer not null check (weight_percent >= 0 and weight_percent <= 100),
  product_slug text not null default 'sleep',
  country text not null default 'NL',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (route_slug, lander_slug)
);

insert into traffic_split_routes (slug, name, path) values
  ('main', 'Hoofd split', '/redirect')
on conflict (slug) do update set name = excluded.name, path = excluded.path;

insert into traffic_split_variants (route_slug, lander_slug, destination_path, label, weight_percent, sort_order) values
  ('main', 'index', '/index.html', 'Index — Sandra verhaal', 50, 1),
  ('main', 'lp-2', '/lp/2/', 'LP/2 — Expert vergelijking', 50, 2)
on conflict (route_slug, lander_slug) do update set
  destination_path = excluded.destination_path,
  label = excluded.label,
  weight_percent = excluded.weight_percent,
  sort_order = excluded.sort_order;

alter table traffic_split_routes enable row level security;
alter table traffic_split_variants enable row level security;

-- Optioneel: redirect-toewijzingen loggen
alter table analytics_events drop constraint if exists analytics_events_event_type_check;
alter table analytics_events add constraint analytics_events_event_type_check
  check (event_type in ('lander_view', 'checkout_view', 'purchase', 'redirect_assign'));
