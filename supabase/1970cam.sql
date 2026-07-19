-- 1970cam-only product + landers (run in Supabase SQL editor if needed)

insert into products (slug, name, country, price_cents) values
  ('1970cam', '1970cam', 'NL', 6999)
on conflict (slug) do update set name = excluded.name, price_cents = excluded.price_cents;

insert into landers (slug, product_slug, name, path) values
  ('checkout', '1970cam', 'Checkout — ads lander', '/checkout'),
  ('pay', '1970cam', 'Pay — betaalpagina', '/pay')
on conflict (slug) do update
  set product_slug = excluded.product_slug,
      name = excluded.name,
      path = excluded.path;
