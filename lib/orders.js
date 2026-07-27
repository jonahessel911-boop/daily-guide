const { getSupabase, isConfigured } = require('./supabase');

const PRODUCT_CATALOG = {
  '1970cam': {
    name: '1970cam',
    image: '/assets/product/1970cam-front.png',
  },
  printer: {
    name: '1970cam Portable Printer',
    image: '/assets/product/printer/printer-front-new.jpg',
  },
  hearing: {
    name: 'HearDirect',
    image: '/hearing-nl/assets/product/heardirect-open-case.webp',
  },
};

const DELIVERY_STATUSES = [
  'nieuw',
  'in_behandeling',
  'verzonden',
  'geleverd',
  'geannuleerd',
];

function resolveProductSlug(row) {
  let slug = row.product_slug || '1970cam';
  const lander = row.lander_slug || '';
  if (slug === '1970cam' && /^(adv-\d+|lp-\d+)$/i.test(String(lander))) {
    slug = 'hearing';
  }
  return slug;
}

function productInfo(slug) {
  return PRODUCT_CATALOG[slug] || {
    name: slug,
    image: '/assets/product/1970cam-front.png',
  };
}

function fmtAddress(parts) {
  const line1 = [parts.street, parts.houseNumber, parts.houseAddition]
    .filter(Boolean)
    .join(' ')
    .trim();
  const line2 = [parts.postalCode, parts.city].filter(Boolean).join(' ').trim();
  return { line1, line2, country: parts.country || '' };
}

async function listPurchaseRows({ from, limit = 150 } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'not_configured', rows: [] };

  let query = supabase
    .from('analytics_events')
    .select(
      'id, product_slug, country, lander_slug, amount_cents, currency, payment_intent_id, metadata, created_at'
    )
    .eq('event_type', 'purchase')
    .order('created_at', { ascending: false })
    .limit(Math.min(Number(limit) || 150, 300));

  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message, rows: [] };
  return { ok: true, rows: data || [] };
}

async function enrichOrderFromStripe(row, stripe) {
  const slug = resolveProductSlug(row);
  const catalog = productInfo(slug);
  const meta = row.metadata || {};

  const base = {
    id: row.id,
    payment_intent_id: row.payment_intent_id,
    order_number: meta.order_id || row.payment_intent_id || '—',
    created_at: row.created_at,
    product_slug: slug,
    product_name: catalog.name,
    product_image: catalog.image,
    amount_cents: row.amount_cents || 0,
    amount: ((row.amount_cents || 0) / 100).toFixed(2),
    currency: row.currency || 'EUR',
    payment_status: 'betaald',
    payment_method: meta.payment_method || '—',
    delivery_status: meta.delivery_status || 'nieuw',
    quantity: Number(meta.quantity || 0) || null,
    cameras: Number(meta.cameras || 0) || null,
    printers: Number(meta.printers || 0) || null,
    hearings: Number(meta.hearings || 0) || null,
    customer: {
      name: meta.customer_name || '',
      email: meta.customer_email || '',
      phone: meta.customer_phone || '',
    },
    shipping: fmtAddress({
      street: meta.shipping_street || '',
      houseNumber: meta.shipping_house_number || '',
      houseAddition: meta.shipping_house_addition || '',
      postalCode: meta.shipping_postal_code || '',
      city: meta.shipping_city || '',
      country: meta.shipping_country || row.country || '',
    }),
    lander_slug: row.lander_slug || meta.lander_slug || '',
    country: row.country || meta.country || '',
  };

  if (!stripe || !row.payment_intent_id) return base;

  try {
    const intent = await stripe.paymentIntents.retrieve(row.payment_intent_id);
    const im = intent.metadata || {};
    const ship = intent.shipping || {};
    const addr = ship.address || {};

    const street =
      im.shipping_street ||
      (addr.line1 || '').replace(/\s+\d+.*$/, '').trim() ||
      base.shipping.line1;
    const houseNumber = im.shipping_house_number || '';
    const houseAddition = im.shipping_house_addition || '';
    const postalCode = im.shipping_postal_code || addr.postal_code || '';
    const city = im.shipping_city || addr.city || '';
    const country = im.shipping_country || addr.country || base.shipping.country;

    const lineFromMeta = [im.shipping_street, im.shipping_house_number, im.shipping_house_addition]
      .filter(Boolean)
      .join(' ')
      .trim();
    const lineFromStripe = addr.line1 || '';

    base.order_number = im.order_id || base.order_number;
    base.payment_status =
      intent.status === 'succeeded'
        ? 'betaald'
        : intent.status === 'canceled'
          ? 'geannuleerd'
          : intent.status || base.payment_status;
    base.payment_method = im.payment_method || base.payment_method;
    base.amount_cents = intent.amount || base.amount_cents;
    base.amount = ((intent.amount || base.amount_cents) / 100).toFixed(2);
    base.currency = (intent.currency || base.currency || 'eur').toUpperCase();
    base.quantity = Number(im.quantity || base.quantity) || base.quantity;
    base.cameras = Number(im.cameras || base.cameras) || base.cameras;
    base.printers = Number(im.printers || base.printers) || base.printers;
    base.hearings = Number(im.hearings || base.hearings) || base.hearings;
    base.customer = {
      name: im.customer_name || ship.name || base.customer.name,
      email: im.customer_email || intent.receipt_email || base.customer.email,
      phone: im.customer_phone || base.customer.phone,
    };
    base.shipping = fmtAddress({
      street: im.shipping_street || '',
      houseNumber,
      houseAddition,
      postalCode,
      city,
      country,
    });
    if (!base.shipping.line1) {
      base.shipping.line1 = lineFromMeta || lineFromStripe;
    }
    if (!base.shipping.line2) {
      base.shipping.line2 = [postalCode, city].filter(Boolean).join(' ');
    }
    if (im.product) base.product_name = im.product;
    const enrichedSlug = im.product_slug || slug;
    if (PRODUCT_CATALOG[enrichedSlug]) {
      base.product_slug = enrichedSlug;
      base.product_image = PRODUCT_CATALOG[enrichedSlug].image;
      if (!im.product) base.product_name = PRODUCT_CATALOG[enrichedSlug].name;
    }
  } catch (err) {
    console.warn('Order Stripe enrich failed:', row.payment_intent_id, err.message);
  }

  return base;
}

async function listOrders({ from, limit = 100, stripe } = {}) {
  if (!isConfigured()) {
    return { ok: false, error: 'Supabase niet geconfigureerd', orders: [] };
  }

  const listed = await listPurchaseRows({ from, limit });
  if (!listed.ok) return { ok: false, error: listed.error, orders: [] };

  const orders = [];
  // sequential-ish batches to avoid Stripe rate limits
  const batchSize = 8;
  for (let i = 0; i < listed.rows.length; i += batchSize) {
    const chunk = listed.rows.slice(i, i + batchSize);
    const enriched = await Promise.all(chunk.map((row) => enrichOrderFromStripe(row, stripe)));
    orders.push(...enriched);
  }

  return {
    ok: true,
    orders,
    delivery_statuses: DELIVERY_STATUSES,
  };
}

async function updateOrderDeliveryStatus(paymentIntentId, deliveryStatus) {
  if (!DELIVERY_STATUSES.includes(deliveryStatus)) {
    return { ok: false, error: 'Ongeldige delivery status' };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'not_configured' };
  if (!paymentIntentId) return { ok: false, error: 'payment_intent_id vereist' };

  const { data: row, error: lookupError } = await supabase
    .from('analytics_events')
    .select('id, metadata')
    .eq('payment_intent_id', paymentIntentId)
    .eq('event_type', 'purchase')
    .maybeSingle();

  if (lookupError) return { ok: false, error: lookupError.message };
  if (!row) return { ok: false, error: 'Order niet gevonden' };

  const metadata = {
    ...(row.metadata || {}),
    delivery_status: deliveryStatus,
    delivery_status_updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('analytics_events').update({ metadata }).eq('id', row.id);
  if (error) return { ok: false, error: error.message };

  return { ok: true, delivery_status: deliveryStatus };
}

module.exports = {
  PRODUCT_CATALOG,
  DELIVERY_STATUSES,
  listOrders,
  updateOrderDeliveryStatus,
};
