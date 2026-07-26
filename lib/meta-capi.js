const crypto = require('crypto');

const API_VERSION = process.env.META_API_VERSION || 'v19.0';

function isConfigured() {
  return Boolean(process.env.META_PIXEL_ID && process.env.META_ACCESS_TOKEN);
}

function hashMeta(value) {
  if (value == null || value === '') return null;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function hashMetaArray(value) {
  const hashed = hashMeta(value);
  return hashed ? [hashed] : undefined;
}

function buildUserData(payload = {}) {
  const userData = {};

  const em = hashMetaArray(payload.email);
  if (em) userData.em = em;

  // Meta: `country` = land, `ct` = stad — niet omdraaien
  const country = hashMetaArray(payload.country || 'nl');
  if (country) userData.country = country;

  if (payload.externalId) {
    const externalId = hashMetaArray(payload.externalId);
    if (externalId) userData.external_id = externalId;
  }

  if (payload.fbc) userData.fbc = payload.fbc;
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.clientIp) userData.client_ip_address = payload.clientIp;
  if (payload.userAgent) userData.client_user_agent = payload.userAgent;

  return userData;
}

/**
 * Meta Conversions API — any standard event (Purchase, AddToCart, …).
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */
async function sendMetaEvent(payload = {}) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  const eventName = payload.eventName || 'Purchase';
  const customData = {
    currency: payload.currency || 'EUR',
    value: Number(payload.value) || 0,
  };

  if (payload.contentIds?.length) {
    customData.content_ids = payload.contentIds.map(String);
  }
  if (payload.contentType) customData.content_type = payload.contentType;
  if (payload.contentName) customData.content_name = payload.contentName;
  if (payload.numItems != null) customData.num_items = Number(payload.numItems) || 1;
  if (payload.leadSource) customData.lead_source = payload.leadSource;

  const event = {
    event_name: eventName,
    event_time: payload.eventTime || Math.floor(Date.now() / 1000),
    event_source_url: payload.eventSourceUrl,
    action_source: 'website',
    event_id: payload.eventId,
    user_data: buildUserData(payload),
    custom_data: customData,
  };

  const body = { data: [event] };
  const testCode = payload.testEventCode || process.env.META_TEST_EVENT_CODE;
  if (testCode) {
    body.test_event_code = testCode;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Meta CAPI error:', JSON.stringify(data));
      return { ok: false, error: data };
    }

    return { ok: true, data };
  } catch (err) {
    console.error('Meta CAPI request failed:', err.message);
    return { ok: false, error: err.message };
  }
}

async function sendPurchaseEvent(payload) {
  return sendMetaEvent({ ...payload, eventName: 'Purchase' });
}

async function sendAddToCartEvent(payload) {
  return sendMetaEvent({
    ...payload,
    eventName: 'AddToCart',
    contentType: payload.contentType || 'product',
  });
}

module.exports = {
  isConfigured,
  hashMeta,
  sendMetaEvent,
  sendPurchaseEvent,
  sendAddToCartEvent,
};
