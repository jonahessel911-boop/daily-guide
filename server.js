require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/config', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY, product: PRODUCT });
});

app.post('/api/create-payment', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is niet geconfigureerd. Stel STRIPE_SECRET_KEY in via .env' });
  }

  try {
    const { email, paymentMethod = 'ideal' } = req.body;
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

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`🌙 Slaap Beter Slapen: http://localhost:${PORT}`);
});
