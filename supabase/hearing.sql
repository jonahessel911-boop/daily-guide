-- Run in Supabase SQL Editor (na schema.sql)

insert into products (slug, name, country, price_cents) values
  ('hearing', 'HearDirect™ — Hoortoestellen', 'NL', 14900)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  price_cents = excluded.price_cents;

insert into landers (slug, product_slug, name, path) values
  ('lp-1', 'hearing', 'Hearing NL — LP/1', '/hearing-nl/lp/1/'),
  ('adv-1', 'hearing', 'Hearing NL — Adv/1 (vergelijking)', '/hearing-nl/adv/1/'),
  ('adv-2', 'hearing', 'Hearing NL — Adv/2 (doorbraak)', '/hearing-nl/adv/2/'),
  ('adv-1-be', 'hearing', 'Hearing BE — Adv/1 (vergelijking)', '/hearing-be/adv/1/'),
  ('adv-2-be', 'hearing', 'Hearing BE — Adv/2 (doorbraak)', '/hearing-be/adv/2/')
on conflict (slug) do update set
  product_slug = excluded.product_slug,
  name = excluded.name,
  path = excluded.path;

insert into traffic_split_routes (slug, name, path) values
  ('hearing', 'Hearing split NL', '/hearing-checker'),
  ('hearing-be', 'Hearing split BE', '/hearing-checker-be')
on conflict (slug) do update set
  name = excluded.name,
  path = excluded.path;

insert into traffic_split_variants (route_slug, lander_slug, destination_path, label, weight_percent, product_slug, country, sort_order) values
  ('hearing', 'adv-1', '/hearing-nl/adv/1/', 'Adv/1 — Vergelijking', 50, 'hearing', 'NL', 1),
  ('hearing', 'adv-2', '/hearing-nl/adv/2/', 'Adv/2 — Doorbraak', 50, 'hearing', 'NL', 2)
on conflict (route_slug, lander_slug) do update set
  destination_path = excluded.destination_path,
  label = excluded.label,
  weight_percent = excluded.weight_percent,
  product_slug = excluded.product_slug,
  country = excluded.country,
  sort_order = excluded.sort_order;

insert into traffic_split_variants (route_slug, lander_slug, destination_path, label, weight_percent, product_slug, country, sort_order) values
  ('hearing-be', 'adv-1', '/hearing-be/adv/1/', 'Adv/1 — Vergelijking (BE)', 50, 'hearing', 'BE', 1),
  ('hearing-be', 'adv-2', '/hearing-be/adv/2/', 'Adv/2 — Doorbraak (BE)', 50, 'hearing', 'BE', 2)
on conflict (route_slug, lander_slug) do update set
  destination_path = excluded.destination_path,
  label = excluded.label,
  weight_percent = excluded.weight_percent,
  product_slug = excluded.product_slug,
  country = excluded.country,
  sort_order = excluded.sort_order;
