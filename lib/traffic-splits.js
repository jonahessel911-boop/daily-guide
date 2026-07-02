const { getSupabase } = require('./supabase');
const { insertEvent } = require('./analytics');

const ROUTE_SLUG = 'main';
const COOKIE_NAME = 'ts_main';

const DEFAULT_VARIANTS = [
  {
    id: 'default-index',
    route_slug: ROUTE_SLUG,
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
    id: 'default-lp-2',
    route_slug: ROUTE_SLUG,
    lander_slug: 'lp-2',
    destination_path: '/lp/2/',
    label: 'LP/2 — Expert vergelijking',
    weight_percent: 50,
    product_slug: 'sleep',
    country: 'NL',
    active: true,
    sort_order: 2,
  },
];

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
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: true, variants: DEFAULT_VARIANTS, fromDefaults: true };
  }

  const { data, error } = await supabase
    .from('traffic_split_variants')
    .select('*')
    .eq('route_slug', routeSlug)
    .order('sort_order', { ascending: true });

  if (error || !data?.length) {
    return { ok: true, variants: DEFAULT_VARIANTS, fromDefaults: true };
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

async function getAdminTrafficSplits(statsRows = []) {
  const { variants, fromDefaults } = await getVariants(ROUTE_SLUG);
  const statsByLander = new Map((statsRows || []).map((r) => [r.lander_slug, r]));

  const merged = variants.map((v) => {
    const s = statsByLander.get(v.lander_slug) || {};
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
    checker_url: '/checker',
    variants: merged,
    total_weight: totalWeight,
    from_defaults: fromDefaults,
  };
}

async function handleRedirect(req, res) {
  const { variants } = await getVariants(ROUTE_SLUG);
  const cookies = parseCookies(req);
  const variant = pickWeightedVariant(variants, cookies[COOKIE_NAME]);

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
    metadata: { route: ROUTE_SLUG, referer: req.get('referer') || '' },
  }).catch(() => {});

  const destination = buildDestinationUrl(variant, req.query);
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const cookieParts = [
    `${COOKIE_NAME}=${encodeURIComponent(variant.lander_slug)}`,
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
  COOKIE_NAME,
  getVariants,
  saveVariants,
  getAdminTrafficSplits,
  handleRedirect,
  pickWeightedVariant,
  buildDestinationUrl,
};
