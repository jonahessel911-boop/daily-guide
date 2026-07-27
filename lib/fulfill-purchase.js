const {
  recordPurchaseOnce,
  getPurchaseRow,
  hasMetaCapiSent,
  markMetaCapiSent,
} = require('./analytics');
const { sendPurchaseEvent } = require('./meta-capi');
const { sendPurchaseNotification } = require('./postmark');

const DEFAULT_SITE_URL = 'https://www.the-daily-guide.com';

function getSiteUrl() {
  return (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function getSuccessUrl() {
  return `${getSiteUrl()}/success.html`;
}

async function sendPurchaseNotificationOnce(intent, stripe) {
  const meta = intent.metadata || {};
  if (meta.notify_sent === 'yes') {
    return { ok: true, skipped: true, reason: 'already_sent' };
  }

  const emailResult = await sendPurchaseNotification(intent);
  if (!emailResult.ok) return emailResult;

  if (stripe?.paymentIntents?.update && intent.id) {
    try {
      await stripe.paymentIntents.update(intent.id, {
        metadata: { ...meta, notify_sent: 'yes' },
      });
    } catch (err) {
      console.error('notify_sent metadata update failed:', err.message);
    }
  }

  return emailResult;
}

function buildPurchaseEvent(intent) {
  const meta = intent.metadata || {};
  return {
    eventType: 'purchase',
    productSlug: meta.product_slug || '1970cam',
    country: meta.country || 'NL',
    landerSlug: meta.lander_slug || null,
    sessionId: meta.session_id || `pi_${intent.id}`,
    amountCents: intent.amount,
    currency: (intent.currency || 'eur').toUpperCase(),
    paymentIntentId: intent.id,
    metadata: {
      order_id: meta.order_id || null,
      customer_email: meta.customer_email || null,
      payment_method: meta.payment_method || null,
    },
  };
}

/**
 * Stuurt het Purchase-event naar Meta CAPI tenzij dat voor deze intent al gelukt is.
 * De verzending hangt bewust niet aan "net ingevoegd": een mislukte call moet door een
 * volgende webhook of de backfill opnieuw geprobeerd kunnen worden. Meta dedupliceert
 * op event_id, dus een dubbele poging kost geen extra conversie.
 */
async function sendPurchaseCapiOnce(intent, context = {}) {
  const meta = intent.metadata || {};
  const row = await getPurchaseRow(intent.id);

  if (hasMetaCapiSent(row)) {
    return { ok: true, skipped: true, reason: 'already_sent' };
  }

  const result = await sendPurchaseEvent({
    eventId: intent.id,
    eventSourceUrl: context.eventSourceUrl || getSuccessUrl(),
    eventTime: context.eventTime,
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

  if (result.ok) {
    if (row) await markMetaCapiSent(row);
  } else if (result.skipped) {
    console.warn('Meta CAPI purchase skipped:', intent.id, result.reason);
  } else {
    console.error('Meta CAPI purchase failed:', intent.id, JSON.stringify(result.error));
  }

  return result;
}

/**
 * Registreert purchase (Supabase) + Meta CAPI + eigenaar-notificatie — idempotent per payment_intent.
 */
async function fulfillPurchase(intent, context = {}) {
  if (!intent || intent.status !== 'succeeded') {
    return { ok: false, skipped: true, reason: 'not_succeeded' };
  }

  let purchaseResult = await recordPurchaseOnce(buildPurchaseEvent(intent));

  if (!purchaseResult.ok && !purchaseResult.duplicate) {
    console.error('Purchase record failed, retrying:', intent.id, purchaseResult.error);
    await new Promise((resolve) => setTimeout(resolve, 400));
    purchaseResult = await recordPurchaseOnce(buildPurchaseEvent(intent));
  }

  if (!purchaseResult.ok && !purchaseResult.duplicate) {
    console.error('Purchase record failed after retry:', intent.id, purchaseResult.error);
  }

  const metaResult = await sendPurchaseCapiOnce(intent, context);

  const emailResult = await sendPurchaseNotificationOnce(intent, context.stripe);
  if (!emailResult.ok && !emailResult.skipped) {
    console.error('Purchase notification email failed:', intent.id, emailResult.error || emailResult.reason);
  }

  return {
    ok: purchaseResult.ok !== false,
    purchaseResult,
    duplicate: purchaseResult.duplicate,
    meta: metaResult,
    email: emailResult,
  };
}

module.exports = {
  fulfillPurchase,
  sendPurchaseCapiOnce,
  getSiteUrl,
  getSuccessUrl,
};
