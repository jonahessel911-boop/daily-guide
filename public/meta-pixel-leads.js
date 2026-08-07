/* Meta Pixel — Zittu lead-gen only (aparte pixel + Lead tracking) */
!function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
}(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '27912623691762895');
fbq('track', 'PageView');

(function () {
  const LEADS_PIXEL_ID = '27912623691762895';
  const testCode = new URLSearchParams(window.location.search).get('test_event_code');
  if (testCode) sessionStorage.setItem('meta_test_event_code', testCode);

  function readCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function newEventId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function getTestEventCode() {
    const fromUrl = new URLSearchParams(window.location.search).get('test_event_code');
    if (fromUrl) return fromUrl;
    return sessionStorage.getItem('meta_test_event_code') || '';
  }

  function getClickIds() {
    const product =
      document.body?.dataset?.trackProduct ||
      window.FunnelTrack?.getAttribution?.()?.product ||
      'zittu';
    const fromStore = window.FunnelTrack?.getMetaClickIds?.(product) || {};
    return {
      fbp: fromStore.fbp || readCookie('_fbp') || '',
      fbc: fromStore.fbc || readCookie('_fbc') || '',
    };
  }

  /**
   * Browser Lead + payload voor server-CAPI (zelfde event_id = geen dubbele telling).
   */
  function trackLead(params = {}) {
    const eventId = params.eventId || newEventId('lead');
    const custom = {};
    if (params.content_name) custom.content_name = params.content_name;
    if (params.lander) custom.lead_source = params.lander;

    if (typeof fbq === 'function') {
      try {
        fbq('track', 'Lead', custom, { eventID: eventId });
      } catch (_) {
        /* ignore */
      }
    }

    let externalId = '';
    try {
      externalId = localStorage.getItem('funnel_session_id') || '';
    } catch (_) {
      /* ignore */
    }

    const clicks = getClickIds();
    return {
      eventId,
      fbp: clicks.fbp || undefined,
      fbc: clicks.fbc || undefined,
      eventSourceUrl: window.location.href,
      externalId: externalId || undefined,
      testEventCode: getTestEventCode() || undefined,
      contentName: params.content_name || undefined,
    };
  }

  window.trackEvent = function (name, params) {
    if (name === 'Lead') {
      return trackLead(params || {});
    }
    if (typeof fbq === 'function') {
      try {
        fbq('track', name, params || {});
      } catch (_) {
        /* ignore */
      }
    }
    return null;
  };

  window.MetaPixelLeads = {
    PIXEL_ID: LEADS_PIXEL_ID,
    getTestEventCode,
    trackLead,
    getClickIds,
  };
})();
