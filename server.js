require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { insertEvent, recordPurchaseOnce, getStats } = require('./lib/analytics');

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
    return res.status(503).json({ ok: false, error: 'ADMIN_PASSWORD niet ingesteld' });
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

app.post('/api/create-payment', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is niet geconfigureerd. Stel STRIPE_SECRET_KEY in via .env' });
  }

  try {
    const { email, paymentMethod = 'ideal', analytics = {} } = req.body;
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
      await recordPurchaseOnce({
        eventType: 'purchase',
        productSlug: intent.metadata.product_slug || 'sleep',
        country: intent.metadata.country || 'NL',
        landerSlug: intent.metadata.lander_slug || null,
        sessionId: intent.metadata.session_id || `pi_${intent.id}`,
        amountCents: intent.amount,
        currency: (intent.currency || 'eur').toUpperCase(),
        paymentIntentId: intent.id,
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

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌙 Slaap Beter Slapen: http://localhost:${PORT}`);
  });
}
