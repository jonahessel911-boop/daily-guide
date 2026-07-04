const { getSupabase } = require('./supabase');
const { insertEvent } = require('./analytics');

const ROUTES = {
  main: {
    slug: 'main',
    checker_url: '/checker',
    cookie_name: 'ts_main',
    product_slug: 'sleep',
    default_variants: [
      {
        route_slug: 'main',
        lander_slug: 'index',
        destination_path: '/index.html',
        label: 'Index — Sandra verhaal',
        weight_percent: 50,
        product_slug: 'sleep',
        country: 'NL',
        active: true,
        sort_order: 1,
      },
      {
        route_slug: 'main',
        lander_slug: 'lp-2',
        destination_path: '/lp/2/',
        label: 'LP/2 — Expert vergelijking',
        weight_percent: 50,
        product_slug: 'sleep',
        country: 'NL',
        active: true,
        sort_order: 2,
      },
    ],
  },
  hearing: {
    slug: 'hearing',
    checker_url: '/hearing-checker',
    cookie_name: 'ts_hearing',
    product_slug: 'hearing',
    default_variants: [
      {
        route_slug: 'hearing',
        lander_slug: 'adv-1',
        destination_path: '/hearing-nl/adv/1/',
        label: 'Adv/1 — Vergelijking',
        weight_percent: 50,
        product_slug: 'hearing',
        country: 'NL',
        active: true,
        sort_order: 1,
      },
      {
        route_slug: 'hearing',
        lander_slug: 'adv-2',
        destination_path: '/hearing-nl/adv/2/',
        label: 'Adv/2 — Doorbraak',
        weight_percent: 50,
        product_slug: 'hearing',
        country: 'NL',
        active: true,
        sort_order: 2,
      },
    ],
  },
  'hearing-be': {
    slug: 'hearing-be',
    checker_url: '/hearing-checker-be',
    cookie_name: 'ts_hearing_be',
    product_slug: 'hearing',
    default_variants: [
      {
        route_slug: 'hearing-be',
        lander_slug: 'adv-1',
        destination_path: '/hearing-be/adv/1/',
        label: 'Adv/1 — Vergelijking (BE)',
        weight_percent: 50,
        product_slug: 'hearing',
        country: 'BE',
        active: true,
        sort_order: 1,
      },
      {
        route_slug: 'hearing-be',
        lander_slug: 'adv-2',
        destination_path: '/hearing-be/adv/2/',
        label: 'Adv/2 — Doorbraak (BE)',
        weight_percent: 50,
        product_slug: 'hearing',
        country: 'BE',
        active: true,
        sort_order: 2,
      },
    ],
  },
};

const ROUTE_SLUG = 'main';

function getRouteConfig(routeSlug = ROUTE_SLUG) {
  return ROUTES[routeSlug] || ROUTES.main;
}

function pickWeightedVariant(variants, stickyLander) {
  const active = variants.filter((v) => v.active && v.weight_percent > 0);
  if (!active.length) return null;

  if (stickyLander) {
    const sticky = active.find((v) => v.lander_slug === stickyLander);
    if (sticky) return sticky;
  }

  const total = active.reduce((sum, v) => sum + v.weight_percent, 0);
  if (total <= 0) return active[0];

  let roll = Math.random() * total;
  for (const variant of active) {
    roll -= variant.weight_percent;
    if (roll <= 0) return variant;
  }

  return active[active.length - 1];
}

function buildDestinationUrl(variant, query) {
  const path = variant.destination_path;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query || {})) {
    if (value != null && value !== '') params.set(key, value);
  }

  params.set('p', variant.product_slug);
  params.set('c', (variant.country || 'NL').toLowerCase());
  params.set('l', variant.lander_slug);
  params.set('src', 'checker');

  const qs = params.toString();
  if (!qs) return path;
  return path.includes('?') ? `${path}&${qs}` : `${path}?${qs}`;
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [k, ...rest] = part.trim().split('=');
      return [k, decodeURIComponent(rest.join('=') || '')];
    })
  );
}

async function getVariants(routeSlug = ROUTE_SLUG) {
  const route = getRouteConfig(routeSlug);
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: true, variants: route.default_variants, fromDefaults: true };
  }

  const { data, error } = await supabase
    .from('traffic_split_variants')
    .select('*')
    .eq('route_slug', route.slug)
    .order('sort_order', { ascending: true });

  if (error || !data?.length) {
    return { ok: true, variants: route.default_variants, fromDefaults: true };
  }

  return { ok: true, variants: data, fromDefaults: false };
}

async function saveVariants(routeSlug, variants) {
  const total = variants.reduce((sum, v) => sum + (v.weight_percent || 0), 0);
  if (total !== 100) {
    return { ok: false, error: `Totaal moet 100% zijn (nu ${total}%)` };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: 'Supabase niet geconfigureerd' };
  }

  for (const v of variants) {
    const { error } = await supabase
      .from('traffic_split_variants')
      .update({ weight_percent: v.weight_percent, active: v.active !== false })
      .eq('route_slug', routeSlug)
      .eq('lander_slug', v.lander_slug);

    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

async function getAdminTrafficSplits(routeSlug = ROUTE_SLUG, statsRows = []) {
  const route = getRouteConfig(routeSlug);
  const { variants, fromDefaults } = await getVariants(route.slug);
  const statsByLander = new Map(
    (statsRows || [])
      .filter((r) => r.product_slug === route.product_slug)
      .map((r) => [`${r.lander_slug}|${(r.country || 'NL').toUpperCase()}`, r])
  );

  const merged = variants.map((v) => {
    const country = (v.country || 'NL').toUpperCase();
    const s = statsByLander.get(`${v.lander_slug}|${country}`) || {};
    return {
      ...v,
      stats: {
        lander_views: s.lander_views || 0,
        checkout_views: s.checkout_views || 0,
        purchases: s.purchases || 0,
        revenue: s.revenue || '0.00',
        ctr_lander_to_checkout: s.ctr_lander_to_checkout || '0.0%',
        cr_lander_to_sale: s.cr_lander_to_sale || '0.0%',
      },
    };
  });

  const totalWeight = merged.reduce((sum, v) => sum + (v.active ? v.weight_percent : 0), 0);

  return {
    ok: true,
    route: route.slug,
    checker_url: route.checker_url,
    variants: merged,
    total_weight: totalWeight,
    from_defaults: fromDefaults,
  };
}

async function handleRedirect(req, res, routeSlug = ROUTE_SLUG) {
  const route = getRouteConfig(routeSlug);
  const { variants } = await getVariants(route.slug);
  const cookies = parseCookies(req);
  const variant = pickWeightedVariant(variants, cookies[route.cookie_name]);

  if (!variant) {
    return res.status(503).send('Geen actieve split-varianten geconfigureerd.');
  }

  const sessionId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  insertEvent({
    eventType: 'redirect_assign',
    productSlug: variant.product_slug,
    country: variant.country,
    landerSlug: variant.lander_slug,
    sessionId,
    metadata: { route: route.slug, referer: req.get('referer') || '' },
  }).catch(() => {});

  const destination = buildDestinationUrl(variant, req.query);
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const cookieParts = [
    `${route.cookie_name}=${encodeURIComponent(variant.lander_slug)}`,
    'Path=/',
    'Max-Age=86400',
    'SameSite=Lax',
  ];
  if (secure) cookieParts.push('Secure');

  res.setHeader('Set-Cookie', cookieParts.join('; '));
  res.redirect(302, destination);
}

module.exports = {
  ROUTE_SLUG,
  ROUTES,
  getRouteConfig,
  getVariants,
  saveVariants,
  getAdminTrafficSplits,
  handleRedirect,
  pickWeightedVariant,
  buildDestinationUrl,
};
