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

  const ph = hashMetaArray(normalizePhone(payload.phone || payload.telefoon));
  if (ph) userData.ph = ph;

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

/** NL/BE phone → digits for Meta hashing (06… → 316…) */
function normalizePhone(value) {
  if (value == null || value === '') return '';
  let digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length >= 9) digits = `31${digits.slice(1)}`;
  return digits;
}

/**
 * Meta Conversions API — any standard event (Purchase, AddToCart, Lead, …).
 * @param {object} payload
 * @param {{ pixelId?: string, accessToken?: string } | null} credentials
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */
async function sendMetaEvent(payload = {}, credentials = null) {
  const pixelId = credentials?.pixelId || process.env.META_PIXEL_ID;
  const accessToken = credentials?.accessToken || process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return { ok: false, skipped: true, reason: 'not_configured' };
  }

  const eventName = payload.eventName || 'Purchase';
  const customData = {};

  if (payload.value != null || eventName === 'Purchase' || eventName === 'AddToCart') {
    customData.currency = payload.currency || 'EUR';
    customData.value = Number(payload.value) || 0;
  }

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
  };

  if (Object.keys(customData).length) {
    event.custom_data = customData;
  }

  const body = { data: [event] };
  // Alleen per call: een globale env-testcode zou élke echte verkoop als test event
  // wegschrijven, en test events tellen niet mee in Ads Manager.
  if (payload.testEventCode) {
    body.test_event_code = payload.testEventCode;
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

function getLeadsCredentials() {
  const pixelId = process.env.META_LEADS_PIXEL_ID;
  const accessToken = process.env.META_LEADS_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return null;
  return { pixelId, accessToken };
}

function isLeadsConfigured() {
  return Boolean(getLeadsCredentials());
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

/** Lead-gen CAPI — alleen META_LEADS_* pixel/token (Zittu e.d.) */
async function sendLeadEvent(payload = {}) {
  const credentials = getLeadsCredentials();
  if (!credentials) {
    return { ok: false, skipped: true, reason: 'leads_not_configured' };
  }
  return sendMetaEvent(
    {
      ...payload,
      eventName: 'Lead',
      contentType: payload.contentType || 'lead',
    },
    credentials
  );
}

module.exports = {
  isConfigured,
  isLeadsConfigured,
  hashMeta,
  sendMetaEvent,
  sendPurchaseEvent,
  sendAddToCartEvent,
  sendLeadEvent,
};
