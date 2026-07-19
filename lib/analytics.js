const { getSupabase, isConfigured } = require('./supabase');

async function insertEvent(event) {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Analytics: Supabase niet geconfigureerd');
    return { ok: false, error: 'not_configured' };
  }

  const row = {
    event_type: event.eventType,
    product_slug: event.productSlug,
    country: (event.country || 'NL').toUpperCase(),
    lander_slug: event.landerSlug || null,
    session_id: event.sessionId,
    amount_cents: event.amountCents || 0,
    currency: event.currency || 'EUR',
    payment_intent_id: event.paymentIntentId || null,
    metadata: event.metadata || {},
  };

  const { error } = await supabase.from('analytics_events').insert(row);
  if (error) {
    if (error.code === '23505' && event.paymentIntentId) {
      return { ok: true, duplicate: true };
    }
    console.error('Analytics insert error:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

async function recordPurchaseOnce(payload) {
  if (!payload.paymentIntentId) {
    return insertEvent(payload);
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'not_configured' };

  const { data: existing } = await supabase
    .from('analytics_events')
    .select('id')
    .eq('payment_intent_id', payload.paymentIntentId)
    .maybeSingle();

  if (existing) return { ok: true, duplicate: true };

  return insertEvent(payload);
}

function aggregateRows(events) {
  const byKey = new Map();

  const ensure = (productSlug, country, landerSlug) => {
    const key = `${productSlug}|${country}|${landerSlug || '__direct__'}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        product_slug: productSlug,
        country,
        lander_slug: landerSlug || '—',
        lander_views: 0,
        checkout_views: 0,
        purchases: 0,
        revenue_cents: 0,
      });
    }
    return byKey.get(key);
  };

  for (const e of events) {
    const row = ensure(e.product_slug, e.country, e.lander_slug);
    if (e.event_type === 'lander_view') row.lander_views += 1;
    if (e.event_type === 'checkout_view') row.checkout_views += 1;
    if (e.event_type === 'purchase') {
      row.purchases += 1;
      row.revenue_cents += e.amount_cents || 0;
    }
  }

  return [...byKey.values()].map((row) => {
    const ctr =
      row.lander_views > 0
        ? ((row.checkout_views / row.lander_views) * 100).toFixed(1)
        : '0.0';
    const cr =
      row.lander_views > 0
        ? ((row.purchases / row.lander_views) * 100).toFixed(1)
        : '0.0';
    const checkoutCr =
      row.checkout_views > 0
        ? ((row.purchases / row.checkout_views) * 100).toFixed(1)
        : '0.0';

    return {
      ...row,
      revenue: (row.revenue_cents / 100).toFixed(2),
      ctr_lander_to_checkout: `${ctr}%`,
      cr_lander_to_sale: `${cr}%`,
      cr_checkout_to_sale: `${checkoutCr}%`,
    };
  });
}

const TRACKED_PRODUCT = '1970cam';

async function getStats({ from, to } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase niet geconfigureerd' };

  let query = supabase
    .from('analytics_events')
    .select('event_type, product_slug, country, lander_slug, amount_cents, created_at')
    .eq('product_slug', TRACKED_PRODUCT)
    .order('created_at', { ascending: false });

  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data, error } = await query.limit(50000);
  if (error) return { ok: false, error: error.message };

  const rows = aggregateRows(data || []);

  const totals = rows.reduce(
    (acc, r) => {
      acc.lander_views += r.lander_views;
      acc.checkout_views += r.checkout_views;
      acc.purchases += r.purchases;
      acc.revenue_cents += r.revenue_cents;
      return acc;
    },
    { lander_views: 0, checkout_views: 0, purchases: 0, revenue_cents: 0 }
  );

  totals.revenue = (totals.revenue_cents / 100).toFixed(2);
  totals.ctr =
    totals.lander_views > 0
      ? `${((totals.checkout_views / totals.lander_views) * 100).toFixed(1)}%`
      : '0.0%';
  totals.cr =
    totals.lander_views > 0
      ? `${((totals.purchases / totals.lander_views) * 100).toFixed(1)}%`
      : '0.0%';

  return {
    ok: true,
    rows: rows.sort((a, b) => b.lander_views - a.lander_views || b.checkout_views - a.checkout_views),
    totals,
    products: [{ slug: TRACKED_PRODUCT, name: '1970cam' }],
    landers: [
      { slug: 'checkout', name: 'Checkout (ads lander)', product_slug: TRACKED_PRODUCT, path: '/checkout' },
      { slug: 'pay', name: 'Pay', product_slug: TRACKED_PRODUCT, path: '/pay' },
    ],
  };
}

module.exports = {
  isConfigured,
  insertEvent,
  recordPurchaseOnce,
  getStats,
};
