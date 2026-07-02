-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text not null default 'NL',
  price_cents integer not null default 1700,
  currency text not null default 'EUR',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists landers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  product_slug text not null references products(slug) on update cascade,
  name text not null,
  path text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('lander_view', 'checkout_view', 'purchase')),
  product_slug text not null,
  country text not null,
  lander_slug text,
  session_id text not null,
  amount_cents integer not null default 0,
  currency text not null default 'EUR',
  payment_intent_id text unique,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_created on analytics_events (created_at desc);
create index if not exists idx_analytics_events_dims on analytics_events (product_slug, country, lander_slug, event_type);

-- Seed: Sleep product + NL landers
insert into products (slug, name, country, price_cents) values
  ('sleep', 'Sleep', 'NL', 1700)
on conflict (slug) do update set name = excluded.name, country = excluded.country;

insert into landers (slug, product_slug, name, path) values
  ('index', 'sleep', 'Sleep — NL — Main advertorial', '/index.html'),
  ('lp-2', 'sleep', 'Sleep — NL — LP/2 long-form', '/lp/2/')
on conflict (slug) do update set name = excluded.name, path = excluded.path;

-- RLS: service role only (server uses service key). Disable public access.
alter table products enable row level security;
alter table landers enable row level security;
alter table analytics_events enable row level security;

-- Traffic split (/checker) — zie ook supabase/traffic-splits.sql voor bestaande DB's
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
  ('main', 'Hoofd split', '/checker')
on conflict (slug) do nothing;

insert into traffic_split_variants (route_slug, lander_slug, destination_path, label, weight_percent, sort_order) values
  ('main', 'index', '/index.html', 'Index — Sandra verhaal', 50, 1),
  ('main', 'lp-2', '/lp/2/', 'LP/2 — Expert vergelijking', 50, 2)
on conflict (route_slug, lander_slug) do nothing;

alter table traffic_split_routes enable row level security;
alter table traffic_split_variants enable row level security;
