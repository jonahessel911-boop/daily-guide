const { recordPurchaseOnce } = require('./analytics');
const { sendPurchaseEvent } = require('./meta-capi');

const DEFAULT_SITE_URL = 'https://www.the-daily-guide.com';

function getSiteUrl() {
  return (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function getSuccessUrl() {
  return `${getSiteUrl()}/success.html`;
}

/**
 * Registreert purchase (Supabase) + Meta CAPI — idempotent per payment_intent.
 */
async function fulfillPurchase(intent, context = {}) {
  if (!intent || intent.status !== 'succeeded') {
    return { ok: false, skipped: true, reason: 'not_succeeded' };
  }

  const meta = intent.metadata || {};

  const purchaseResult = await recordPurchaseOnce({
    eventType: 'purchase',
    productSlug: meta.product_slug || 'sleep',
    country: meta.country || 'NL',
    landerSlug: meta.lander_slug || null,
    sessionId: meta.session_id || `pi_${intent.id}`,
    amountCents: intent.amount,
    currency: (intent.currency || 'eur').toUpperCase(),
    paymentIntentId: intent.id,
  });

  if (!purchaseResult.ok || purchaseResult.duplicate) {
    return { ok: purchaseResult.ok, duplicate: purchaseResult.duplicate, meta: { skipped: true } };
  }

  const metaResult = await sendPurchaseEvent({
    eventId: intent.id,
    eventSourceUrl: context.eventSourceUrl || getSuccessUrl(),
    email: meta.customer_email,
    value: intent.amount / 100,
    currency: (intent.currency || 'eur').toUpperCase(),
    country: (meta.country || 'nl').toLowerCase(),
    externalId: meta.session_id || intent.id,
    fbc: meta.fbc || undefined,
    fbp: meta.fbp || undefined,
    clientIp: context.clientIp,
    userAgent: context.userAgent,
    leadSource: meta.lander_slug || 'direct',
  });

  return { ok: true, purchaseResult, meta: metaResult };
}

module.exports = {
  fulfillPurchase,
  getSiteUrl,
  getSuccessUrl,
};
