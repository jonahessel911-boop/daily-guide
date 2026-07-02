require('dotenv').config();
const crypto = require('crypto');
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

const PRODUCT = {
  name: 'Slaap Beter Slapen — Compleet Pakket (e-books + e-cursus)',
  description: '3 e-books + e-cursus Dr. Joachiem van Blievaden: Slaap Beter Slapen, De 7 Gouden Slaapregels & Snel Inslaap Methode',
  price: 17.0,
  originalPrice: 30.0,
};

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY niet ingesteld. Kopieer .env.example naar .env.');
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
        const result = await fulfillPurchase(intent, { eventSourceUrl: getSuccessUrl() });
        console.log('Stripe webhook purchase:', intent.id, result.duplicate ? 'duplicate' : 'fulfilled');
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

app.get('/api/config', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY, product: PRODUCT });
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
  const eventId = `test-admin-${Date.now()}`;
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
  });

  res.json({
    ok: Boolean(result.ok),
    eventId,
    capi: result,
    message: result.ok
      ? 'Test Purchase verstuurd naar Meta Conversions API'
      : result.skipped
        ? 'Meta niet geconfigureerd — zet META_PIXEL_ID en META_ACCESS_TOKEN in Vercel'
        : 'Meta CAPI fout — controleer access token in Events Manager',
  });
});

app.get('/api/admin/traffic-splits', requireAdmin, async (req, res) => {
  const { from, to } = req.query;
  const stats = await getStats({ from, to });
  const splits = await getAdminTrafficSplits(stats.ok ? stats.rows : []);
  res.json(splits);
});

app.put('/api/admin/traffic-splits', requireAdmin, async (req, res) => {
  const { variants } = req.body || {};
  if (!Array.isArray(variants) || !variants.length) {
    return res.status(400).json({ ok: false, error: 'variants array vereist' });
  }
  const result = await saveVariants(ROUTE_SLUG, variants);
  res.json(result);
});

app.get(['/redirect', '/re-direct'], (req, res) => {
  handleRedirect(req, res).catch((err) => {
    console.error('Redirect error:', err.message);
    res.status(500).send('Redirect mislukt');
  });
});

app.post('/api/create-payment', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is niet geconfigureerd. Stel STRIPE_SECRET_KEY in via .env' });
  }

  try {
    const { email, paymentMethod = 'ideal', analytics = {}, meta = {} } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mailadres is verplicht' });
    }

    const amountCents = Math.round(PRODUCT.price * 100);

    const methodTypes = {
      ideal: ['ideal'],
      card: ['card'],
      klarna: ['klarna'],
    };

    const intentParams = {
      amount: amountCents,
      currency: 'eur',
      receipt_email: email,
      metadata: {
        order_id: `SLAAP-${Date.now()}`,
        product: PRODUCT.name,
        customer_email: email,
        payment_method: paymentMethod,
        product_slug: analytics.productSlug || 'sleep',
        country: (analytics.country || 'NL').toUpperCase(),
        lander_slug: analytics.landerSlug || '',
        session_id: analytics.sessionId || '',
        fbc: meta.fbc || '',
        fbp: meta.fbp || '',
      },
    };

    if (methodTypes[paymentMethod]) {
      intentParams.payment_method_types = methodTypes[paymentMethod];
    } else {
      intentParams.automatic_payment_methods = { enabled: true };
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: paymentIntent.metadata.order_id,
      total: PRODUCT.price,
      product: PRODUCT,
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
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

    if (intent.status === 'succeeded') {
      await fulfillPurchase(intent, {
        eventSourceUrl: getEventSourceUrl(req),
        clientIp: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });
    }

    res.json({
      status: intent.status,
      orderId: intent.metadata.order_id,
      amount: intent.amount / 100,
      email: intent.metadata.customer_email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (_req, res) => {
  res.redirect('/admin/');
});

app.get('/admin/dashboard', (_req, res) => {
  res.redirect('/admin/dashboard.html');
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌙 Slaap Beter Slapen: http://localhost:${PORT}`);
  });
}
