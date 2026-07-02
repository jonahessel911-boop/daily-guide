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
