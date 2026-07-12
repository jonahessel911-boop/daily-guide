const portOverride = process.env.PORT;
require('dotenv').config({ override: true });
if (portOverride) process.env.PORT = portOverride;
const crypto = require('crypto');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { insertEvent, getStats } = require('./lib/analytics');
const { fulfillPurchase, getSuccessUrl } = require('./lib/fulfill-purchase');
const { sendPurchaseEvent } = require('./lib/meta-capi');
const {
  handleRedirect,
  saveVariants,
  getAdminTrafficSplits,
  ROUTE_SLUG,
} = require('./lib/traffic-splits');

const app = express();
const PORT = process.env.PORT || 8081;

const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51TQqFYLGVqAZBTckWzCiVrZsmrJX5rkUxuYVjFkIMZVMVE6990yANMCjbn17Osp3ZVmgHrticwv7tHzoB0KTTWRO00dWpf0uMj';

const PRODUCTS = {
  sleep: {
    slug: 'sleep',
    name: 'Slaap Beter Slapen — Compleet Pakket (e-books + e-cursus)',
    description:
      '3 e-books + e-cursus Dr. Joachiem van Blievaden: Slaap Beter Slapen, De 7 Gouden Slaapregels & Snel Inslaap Methode',
    price: 17.0,
    originalPrice: 30.0,
    orderPrefix: 'SLAAP',
  },
  hearing: {
    slug: 'hearing',
    name: 'HearDirect™ — Comfortabele hoortoestellen',
    description: 'HearDirect™ digitale hoortoestellen met oplaadcase',
    price: 149.0,
    originalPrice: 300.0,
    orderPrefix: 'HEAR',
  },
  dispocam: {
    slug: 'dispocam',
    name: 'DispoCam — Retro digitale camera',
    description: 'DispoCam retro digitale camera — schiet als een wegwerpcamera, bekijk je foto\'s direct',
    price: 69.0,
    originalPrice: 139.0,
    orderPrefix: 'DCAM',
  },
};

function getProduct(slug) {
  return PRODUCTS[slug] || PRODUCTS.sleep;
}

function buildOrderMetadata({
  product,
  productSlug,
  email,
  shipping = {},
  paymentMethod,
  analytics = {},
  meta = {},
  orderBump,
  orderId,
}) {
  return {
    order_id: orderId,
    product: product.name,
    product_slug: productSlug,
    customer_email: email,
    customer_name: shipping.name || '',
    customer_phone: shipping.phone || '',
    shipping_postal_code: shipping.postalCode || '',
    shipping_house_number: shipping.houseNumber || '',
    shipping_house_addition: shipping.houseAddition || '',
    shipping_street: shipping.street || '',
    shipping_city: shipping.city || '',
    shipping_country: shipping.country || '',
    order_bump: orderBump ? 'yes' : 'no',
    payment_method: paymentMethod,
    country: (analytics.country || 'NL').toUpperCase(),
    lander_slug: analytics.landerSlug || '',
    session_id: analytics.sessionId || '',
    fbc: meta.fbc || '',
    fbp: meta.fbp || '',
  };
}

const CHECKOUT_METHOD_TYPES = {
  ideal: ['ideal'],
  bancontact: ['bancontact'],
  card: ['card'],
  klarna: ['klarna'],
};

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY niet ingesteld. Kopieer .env.example naar .env.');
}

async function ensurePaymentMethodDomains() {
  if (!stripe) return;
  const domains = ['www.the-daily-guide.com', 'the-daily-guide.com'];
  for (const domain of domains) {
    try {
      const list = await stripe.paymentMethodDomains.list({ domain_name: domain, limit: 1 });
      if (!list.data.length) {
        await stripe.paymentMethodDomains.create({ domain_name: domain });
        console.log(`✓ Payment method domain registered: ${domain}`);
      }
    } catch (err) {
      console.warn(`Payment domain ${domain}:`, err.message);
    }
  }
}

function getAdminToken() {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return null;
  return crypto.createHmac('sha256', pwd).update('slaap-admin-v1').digest('hex');
}

function requireAdmin(req, res, next) {
  const expected = getAdminToken();
  if (!expected) {
    return res.status(503).json({ ok: false, error: 'ADMIN_PASSWORD niet ingesteld in .env' });
  }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token !== expected) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || '';
}

function getEventSourceUrl(req) {
  if (req) {
    const base = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
    return `${base.replace(/\/$/, '')}/success.html`;
  }
  return getSuccessUrl();
}

// Stripe webhook — raw body vóór express.json()
app.post(
  '/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe niet geconfigureerd' });
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'STRIPE_WEBHOOK_SECRET niet ingesteld' });
    }

    const signature = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature invalid:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        const result = await fulfillPurchase(intent, { eventSourceUrl: getSuccessUrl(), stripe });
        console.log(
          'Stripe webhook purchase:',
          intent.id,
          result.duplicate ? 'duplicate' : 'fulfilled',
          result.purchaseResult?.ok ? 'recorded' : 'record_failed'
        );
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (session.payment_intent) {
          const intent = await stripe.paymentIntents.retrieve(
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent.id
          );
          const result = await fulfillPurchase(intent, { eventSourceUrl: getSuccessUrl(), stripe });
          console.log(
            'Stripe webhook checkout session:',
            session.id,
            intent.id,
            result.purchaseResult?.ok ? 'recorded' : 'record_failed'
          );
        }
      }
    } catch (err) {
      console.error('Stripe webhook handler error:', err.message);
      return res.status(500).json({ error: 'Webhook handler failed' });
    }

    res.json({ received: true });
  }
);

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/config', (req, res) => {
  const slug = req.query.p || req.query.product || 'sleep';
  const product = getProduct(slug);
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY, product });
});

app.get('/api/postcode-lookup', async (req, res) => {
  const token = process.env.POSTCODE_API_TOKEN;
  if (!token) {
    return res.status(503).json({ error: 'Postcode API niet geconfigureerd' });
  }

  const postcode = String(req.query.postcode || '')
    .replace(/\s+/g, '')
    .toUpperCase();
  const number = String(req.query.number || '').trim();
  const toevoeging = String(req.query.toevoeging || req.query.addition || '').trim();

  if (!/^\d{4}[A-Z]{2}$/.test(postcode)) {
    return res.status(400).json({ error: 'Ongeldige postcode' });
  }
  if (!number) {
    return res.status(400).json({ error: 'Huisnummer is verplicht' });
  }

  const numbersToTry = toevoeging
    ? [`${number}-${toevoeging}`, number]
    : [number];

  try {
    let lastError = 'Adres niet gevonden';

    for (const houseNumber of numbersToTry) {
      const url = new URL('https://json.api-postcode.nl');
      url.searchParams.set('postcode', postcode);
      url.searchParams.set('number', houseNumber);
      if (toevoeging) url.searchParams.set('toevoeging', toevoeging);

      const response = await fetch(url, {
        headers: { token, Accept: 'application/json' },
      });
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        console.error('Postcode API non-JSON response:', text.slice(0, 200));
        return res.status(502).json({ error: 'Ongeldig antwoord van postcode-service' });
      }

      if (!response.ok) {
        lastError = data.error || data.message || lastError;
        if (response.status === 404 || response.status === 400) continue;
        return res.status(response.status).json({ error: lastError });
      }

      const street = data.street || data.straat || '';
      const city = data.city || data.woonplaats || data.municipality || '';

      if (!street || !city) {
        lastError = 'Adres niet gevonden';
        continue;
      }

      return res.json({
        street,
        city,
        province: data.province || '',
        postcode: data.postcode || data.zip_code || postcode,
        house_number: data.house_number || houseNumber,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    }

    return res.status(404).json({ error: lastError });
  } catch (err) {
    console.error('Postcode lookup error:', err.message);
    res.status(500).json({ error: 'Kon adres niet opzoeken' });
  }
});

app.post('/api/track', async (req, res) => {
  const { eventType, productSlug, country, landerSlug, sessionId } = req.body || {};
  const allowed = ['lander_view', 'checkout_view'];
  if (!allowed.includes(eventType)) {
    return res.status(400).json({ ok: false, error: 'Ongeldig event type' });
  }
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: 'sessionId ontbreekt' });
  }

  const result = await insertEvent({
    eventType,
    productSlug: productSlug || 'sleep',
    country: country || 'NL',
    landerSlug: landerSlug || null,
    sessionId,
  });

  res.json(result);
});

app.post('/api/admin/login', (req, res) => {
  const token = getAdminToken();
  if (!token) {
    return res.status(503).json({
      ok: false,
      error: 'ADMIN_PASSWORD niet ingesteld op de server (Vercel env vars)',
    });
  }
  if (req.body?.password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Onjuist wachtwoord' });
  }
  res.json({ ok: true, token });
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const { from, to } = req.query;
  const stats = await getStats({ from, to });
  res.json(stats);
});

app.post('/api/admin/test-purchase', requireAdmin, async (req, res) => {
  const eventId = req.body?.eventId || `test-admin-${Date.now()}`;
  const testEventCode = req.body?.testEventCode || process.env.META_TEST_EVENT_CODE || null;

  const result = await sendPurchaseEvent({
    eventId,
    eventSourceUrl: getSuccessUrl(),
    email: 'test@the-daily-guide.com',
    value: 17,
    currency: 'EUR',
    country: 'nl',
    externalId: eventId,
    clientIp: getClientIp(req),
    userAgent: req.headers['user-agent'],
    leadSource: 'admin_test',
    testEventCode,
  });

  res.json({
    ok: Boolean(result.ok),
    eventId,
    browserFired: Boolean(req.body?.browserFired),
    capi: result,
    message: result.ok
      ? 'Purchase verstuurd (browser + server CAPI)'
      : result.skipped
        ? 'Meta CAPI niet geconfigureerd — browser Purchase wel verstuurd als pixel geladen is'
        : 'Meta CAPI fout — browser Purchase kan wel zijn aangekomen',
  });
});

app.get('/api/admin/traffic-splits', requireAdmin, async (req, res) => {
  const { from, to, route } = req.query;
  const routeSlug = route || ROUTE_SLUG;
  const stats = await getStats({ from, to });
  const splits = await getAdminTrafficSplits(routeSlug, stats.ok ? stats.rows : []);
  res.json(splits);
});

app.put('/api/admin/traffic-splits', requireAdmin, async (req, res) => {
  const { variants, route } = req.body || {};
  const routeSlug = route || ROUTE_SLUG;
  if (!Array.isArray(variants) || !variants.length) {
    return res.status(400).json({ ok: false, error: 'variants array vereist' });
  }
  const result = await saveVariants(routeSlug, variants);
  res.json(result);
});

app.get('/checker', (req, res) => {
  handleRedirect(req, res, 'main').catch((err) => {
    console.error('Checker error:', err.message);
    res.status(500).send('Checker mislukt');
  });
});

app.get('/hearing-checker', (req, res) => {
  handleRedirect(req, res, 'hearing').catch((err) => {
    console.error('Hearing checker error:', err.message);
    res.status(500).send('Hearing checker mislukt');
  });
});

app.get('/hearing-checker-be', (req, res) => {
  handleRedirect(req, res, 'hearing-be').catch((err) => {
    console.error('Hearing BE checker error:', err.message);
    res.status(500).send('Hearing BE checker mislukt');
  });
});

app.post('/api/create-payment', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is niet geconfigureerd. Stel STRIPE_SECRET_KEY in via .env' });
  }

  try {
    const { email, paymentMethod = 'ideal', analytics = {}, meta = {}, shipping = {} } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mailadres is verplicht' });
    }

    const productSlug = analytics.productSlug || req.body.productSlug || 'sleep';
    const product = getProduct(productSlug);
    const orderBump = Boolean(req.body.orderBump);
    const bumpCents = orderBump && productSlug === 'hearing' ? 995 : 0;
    const amountCents = Math.round(product.price * 100) + bumpCents;

    const methodTypes = CHECKOUT_METHOD_TYPES;

    const orderId = `${product.orderPrefix}-${Date.now()}`;
    const metadata = buildOrderMetadata({
      product,
      productSlug,
      email,
      shipping,
      paymentMethod,
      analytics,
      meta,
      orderBump,
      orderId,
    });

    const intentParams = {
      amount: amountCents,
      currency: 'eur',
      receipt_email: email,
      description: `${product.name} (${orderId})`,
      metadata,
    };

    if (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') {
      intentParams.payment_method_types = ['card'];
    } else if (methodTypes[paymentMethod]) {
      intentParams.payment_method_types = methodTypes[paymentMethod];
    } else {
      intentParams.automatic_payment_methods = { enabled: true };
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: paymentIntent.metadata.order_id,
      total: product.price,
      product,
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is niet geconfigureerd. Stel STRIPE_SECRET_KEY in via .env' });
  }

  try {
    const { email, paymentMethod = 'ideal', analytics = {}, meta = {}, shipping = {}, cancelUrl, successUrl } =
      req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mailadres is verplicht' });
    }
    if (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') {
      return res.status(400).json({ error: 'Apple Pay en Google Pay worden op de pagina afgehandeld.' });
    }
    if (!cancelUrl || !successUrl) {
      return res.status(400).json({ error: 'cancelUrl en successUrl zijn verplicht' });
    }

    const productSlug = analytics.productSlug || req.body.productSlug || 'sleep';
    const product = getProduct(productSlug);
    const orderBump = Boolean(req.body.orderBump);
    const bumpCents = orderBump && productSlug === 'hearing' ? 995 : 0;
    const amountCents = Math.round(product.price * 100) + bumpCents;
    const paymentTypes = CHECKOUT_METHOD_TYPES[paymentMethod] || ['ideal'];
    const orderId = `${product.orderPrefix}-${Date.now()}`;
    const metadata = buildOrderMetadata({
      product,
      productSlug,
      email,
      shipping,
      paymentMethod,
      analytics,
      meta,
      orderBump,
      orderId,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      payment_method_types: paymentTypes,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: product.name,
              description: product.description || product.name,
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      payment_intent_data: {
        metadata,
        receipt_email: email,
        description: `${product.name} (${orderId})`,
      },
      locale: 'nl',
    });

    res.json({
      url: session.url,
      sessionId: session.id,
      orderId,
      total: product.price,
      product,
    });
  } catch (err) {
    console.error('Stripe checkout session error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/checkout-status', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe niet geconfigureerd' });
  }

  try {
    const { session_id: sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id ontbreekt' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    let fulfillResult = null;
    let intent = null;

    if (session.payment_status === 'paid' && session.payment_intent) {
      intent = await stripe.paymentIntents.retrieve(
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id
      );
      fulfillResult = await fulfillPurchase(intent, {
        eventSourceUrl: getEventSourceUrl(req),
        clientIp: getClientIp(req),
        userAgent: req.headers['user-agent'],
        stripe,
      });
    }

    res.json({
      status: session.payment_status,
      orderId: session.metadata?.order_id || intent?.metadata?.order_id,
      amount: (session.amount_total || 0) / 100,
      email: session.customer_details?.email || session.metadata?.customer_email,
      product: session.metadata?.product,
      productSlug: session.metadata?.product_slug,
      recorded: Boolean(fulfillResult?.purchaseResult?.ok),
      duplicate: Boolean(fulfillResult?.duplicate),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payment-status', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe niet geconfigureerd' });
  }

  try {
    const { payment_intent } = req.query;
    if (!payment_intent) {
      return res.status(400).json({ error: 'payment_intent ontbreekt' });
    }

    const intent = await stripe.paymentIntents.retrieve(payment_intent);

    let fulfillResult = null;
    if (intent.status === 'succeeded') {
      fulfillResult = await fulfillPurchase(intent, {
        eventSourceUrl: getEventSourceUrl(req),
        clientIp: getClientIp(req),
        userAgent: req.headers['user-agent'],
        stripe,
      });
    }

    res.json({
      status: intent.status,
      orderId: intent.metadata.order_id,
      amount: intent.amount / 100,
      email: intent.metadata.customer_email,
      product: intent.metadata.product,
      productSlug: intent.metadata.product_slug,
      recorded: Boolean(fulfillResult?.purchaseResult?.ok),
      duplicate: Boolean(fulfillResult?.duplicate),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const DISPOCAM_PAGES = new Set(['checkout', 'pay', 'missie', 'feed', 'about']);

app.get('/dispocam/:page.html', (req, res) => {
  const qs = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
  res.redirect(301, `/dispocam/${req.params.page}${qs}`);
});

app.get('/dispocam', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/dispocam/index.html'));
});

app.get('/dispocam/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/dispocam/index.html'));
});

app.get('/dispocam/:page', (req, res, next) => {
  const { page } = req.params;
  if (!DISPOCAM_PAGES.has(page)) return next();
  const filePath = path.join(__dirname, 'public/dispocam', `${page}.html`);
  if (!fs.existsSync(filePath)) return next();
  res.sendFile(filePath);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (_req, res) => {
  res.redirect('/admin/');
});

app.get('/admin/dashboard', (_req, res) => {
  res.redirect('/admin/dashboard.html');
});

module.exports = app;

if (stripe) {
  ensurePaymentMethodDomains().catch(() => {});
}

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🌙 Slaap Beter Slapen: http://localhost:${PORT}`);
    ensurePaymentMethodDomains().catch(() => {});
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Poort ${PORT} is al in gebruik. Stop de oude server met: npm run stop\n   Of herstart met: npm run restart\n`);
      process.exit(1);
    }
    throw err;
  });
}
