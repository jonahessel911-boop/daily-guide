-- Run in Supabase SQL Editor (na schema.sql)

insert into products (slug, name, country, price_cents) values
  ('hearing', 'HearFlex™ — Hoortoestel', 'NL', 14900)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  price_cents = excluded.price_cents;

insert into landers (slug, product_slug, name, path) values
  ('lp-1', 'hearing', 'Hearing NL — LP/1', '/hearing-nl/lp/1/')
on conflict (slug) do update set
  product_slug = excluded.product_slug,
  name = excluded.name,
  path = excluded.path;
