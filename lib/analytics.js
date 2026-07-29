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

const META_SENT_KEY = 'meta_capi_sent_at';

async function getPurchaseRow(paymentIntentId) {
  const supabase = getSupabase();
  if (!supabase || !paymentIntentId) return null;

  const { data, error } = await supabase
    .from('analytics_events')
    .select('id, metadata, product_slug, amount_cents, currency, created_at')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (error) {
    console.error('Purchase row lookup failed:', error.message);
    return null;
  }
  return data || null;
}

function hasMetaCapiSent(row) {
  return Boolean(row?.metadata?.[META_SENT_KEY]);
}

/** Markeert dat Meta CAPI het Purchase-event geaccepteerd heeft, zodat retries niet dubbel sturen. */
async function markMetaCapiSent(row) {
  const supabase = getSupabase();
  if (!supabase || !row?.id) return { ok: false, error: 'no_row' };

  const metadata = { ...(row.metadata || {}), [META_SENT_KEY]: new Date().toISOString() };
  const { error } = await supabase.from('analytics_events').update({ metadata }).eq('id', row.id);

  if (error) {
    console.error('Meta CAPI status update failed:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Aankopen waarvoor Meta CAPI nog niet bevestigd is — input voor de backfill. */
async function listPurchasesMissingMetaCapi({ since } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'not_configured', rows: [] };

  let query = supabase
    .from('analytics_events')
    .select('id, metadata, product_slug, amount_cents, currency, payment_intent_id, created_at')
    .eq('event_type', 'purchase')
    .not('payment_intent_id', 'is', null)
    .order('created_at', { ascending: false });

  if (since) query = query.gte('created_at', since);

  const { data, error } = await query.limit(1000);
  if (error) return { ok: false, error: error.message, rows: [] };

  return { ok: true, rows: (data || []).filter((row) => !hasMetaCapiSent(row)) };
}

function resolveProductSlug(e) {
  let productSlug = e.product_slug || '1970cam';
  const landerSlug = e.lander_slug || null;
  // Historical bug: hearing advertorials were stored as 1970cam
  if (
    productSlug === '1970cam' &&
    landerSlug &&
    /^(adv-\d+|lp-\d+)$/i.test(String(landerSlug))
  ) {
    productSlug = 'hearing';
  }
  return productSlug;
}

const PRODUCT_NAMES = {
  '1970cam': '1970cam',
  hearing: 'HearDirect',
  printer: 'Printer',
};

function productName(slug) {
  return PRODUCT_NAMES[slug] || slug;
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
    const productSlug = resolveProductSlug(e);
    const row = ensure(productSlug, e.country, e.lander_slug || null);
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

/** Aggregatie per product (alle landers samengevoegd). */
function aggregateByProduct(events) {
  const byProduct = new Map();

  const ensure = (productSlug) => {
    if (!byProduct.has(productSlug)) {
      byProduct.set(productSlug, {
        product_slug: productSlug,
        product_name: productName(productSlug),
        views: 0,
        purchases: 0,
        revenue_cents: 0,
      });
    }
    return byProduct.get(productSlug);
  };

  for (const e of events) {
    const row = ensure(resolveProductSlug(e));
    if (e.event_type === 'lander_view' || e.event_type === 'checkout_view') {
      row.views += 1;
    }
    if (e.event_type === 'purchase') {
      row.purchases += 1;
      row.revenue_cents += e.amount_cents || 0;
    }
  }

  return [...byProduct.values()]
    .map((row) => {
      const cr =
        row.views > 0 ? ((row.purchases / row.views) * 100).toFixed(1) : '0.0';
      return {
        ...row,
        revenue: (row.revenue_cents / 100).toFixed(2),
        conversion_rate: `${cr}%`,
      };
    })
    .sort((a, b) => b.revenue_cents - a.revenue_cents || b.views - a.views);
}

/**
 * Supabase/PostgREST caps a single response at max_rows (default 1000), even if
 * .limit(50000) is set. With heavy redirect_assign traffic that silently dropped
 * older purchases from admin analytics. Page with .range() and skip redirects.
 */
async function fetchStatsEvents({ from, to, pageSize = 1000 } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'not_configured', events: [] };

  const events = [];
  let offset = 0;

  for (;;) {
    let query = supabase
      .from('analytics_events')
      .select('event_type, product_slug, country, lander_slug, amount_cents, created_at')
      .in('event_type', ['lander_view', 'checkout_view', 'purchase'])
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;
    if (error) return { ok: false, error: error.message, events: [] };

    if (!data?.length) break;
    events.push(...data);
    if (data.length < pageSize) break;

    offset += pageSize;
    if (offset >= 100000) break;
  }

  return { ok: true, events };
}

async function getStats({ from, to, product } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase niet geconfigureerd' };

  const fetched = await fetchStatsEvents({ from, to });
  if (!fetched.ok) return { ok: false, error: fetched.error };

  const events = fetched.events;
  let rows = aggregateByProduct(events);
  const products = rows.map((r) => ({ slug: r.product_slug, name: r.product_name }));

  const selected = product && product !== 'all' ? product : null;
  if (selected) rows = rows.filter((r) => r.product_slug === selected);

  const totals = rows.reduce(
    (acc, r) => {
      acc.views += r.views;
      acc.purchases += r.purchases;
      acc.revenue_cents += r.revenue_cents;
      return acc;
    },
    { views: 0, purchases: 0, revenue_cents: 0 }
  );

  totals.revenue = (totals.revenue_cents / 100).toFixed(2);
  totals.conversion_rate =
    totals.views > 0
      ? `${((totals.purchases / totals.views) * 100).toFixed(1)}%`
      : '0.0%';

  // Backwards-compatible aliases used by older dashboard JS
  totals.lander_views = totals.views;
  totals.checkout_views = 0;
  totals.ctr = '—';
  totals.cr = totals.conversion_rate;

  return {
    ok: true,
    rows,
    totals,
    products,
    product: selected || 'all',
  };
}

module.exports = {
  isConfigured,
  insertEvent,
  recordPurchaseOnce,
  getPurchaseRow,
  hasMetaCapiSent,
  markMetaCapiSent,
  listPurchasesMissingMetaCapi,
  getStats,
};
