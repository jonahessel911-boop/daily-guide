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

/**
 * Meta Conversions API — Purchase event (server-side).
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */
async function sendPurchaseEvent(payload) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  const userData = {};

  const em = hashMetaArray(payload.email);
  if (em) userData.em = em;

  const ct = hashMetaArray(payload.country || 'nl');
  if (ct) userData.ct = ct;

  if (payload.externalId) {
    const externalId = hashMetaArray(payload.externalId);
    if (externalId) userData.external_id = externalId;
  }

  if (payload.fbc) userData.fbc = payload.fbc;
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.clientIp) userData.client_ip_address = payload.clientIp;
  if (payload.userAgent) userData.client_user_agent = payload.userAgent;

  const event = {
    event_name: 'Purchase',
    event_time: payload.eventTime || Math.floor(Date.now() / 1000),
    event_source_url: payload.eventSourceUrl,
    action_source: 'website',
    event_id: payload.eventId,
    user_data: userData,
    custom_data: {
      currency: payload.currency || 'EUR',
      value: payload.value,
      ...(payload.leadSource ? { lead_source: payload.leadSource } : {}),
    },
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

module.exports = {
  isConfigured,
  hashMeta,
  sendPurchaseEvent,
};
