/**
 * Funnel attribution & analytics tracking for 1970cam.
 * URL params: ?p=1970cam&c=nl&l=checkout
 * Or body data attributes: data-track-product, data-track-country, data-track-lander
 *
 * Pages:
 * - /checkout (ads lander) → lander_view
 * - /pay → checkout_view (pay page views)
 */
(function () {
  const STORAGE_KEY = 'funnel_attribution';
  const SESSION_KEY = 'funnel_session_id';
  const DEFAULT_PRODUCT = '1970cam';

  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function readFromDom() {
    const el = document.body;
    return {
      product: el.dataset.trackProduct || DEFAULT_PRODUCT,
      country: (el.dataset.trackCountry || 'nl').toLowerCase(),
      lander: el.dataset.trackLander || null,
    };
  }

  function readFromUrl() {
    const p = new URLSearchParams(window.location.search);
    return {
      product: p.get('p'),
      country: p.get('c'),
      lander: p.get('l'),
    };
  }

  function getAttribution() {
    const url = readFromUrl();
    const dom = readFromDom();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    const merged = {
      product: url.product || stored.product || dom.product || DEFAULT_PRODUCT,
      country: (url.country || stored.country || dom.country || 'nl').toLowerCase(),
      lander: url.lander || stored.lander || dom.lander || null,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  function buildCheckoutUrl(base) {
    const a = getAttribution();
    const url = new URL(base, window.location.origin);
    url.searchParams.set('p', a.product);
    url.searchParams.set('c', a.country);
    if (a.lander) url.searchParams.set('l', a.lander);
    return url.pathname + url.search;
  }

  function patchCheckoutLinks() {
    document.querySelectorAll('a[href*="checkout.html"], a[href*="/checkout"], a[href*="/pay"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      try {
        const resolved = new URL(href, window.location.href);
        const a = getAttribution();
        resolved.searchParams.set('p', a.product);
        resolved.searchParams.set('c', a.country);
        if (a.lander) resolved.searchParams.set('l', a.lander);
        link.setAttribute('href', resolved.pathname + resolved.search);
      } catch (_) {
        /* ignore */
      }
    });
  }

  async function track(eventType, extra = {}) {
    const attr = getAttribution();
    const payload = {
      eventType,
      productSlug: attr.product || DEFAULT_PRODUCT,
      country: attr.country.toUpperCase(),
      landerSlug: attr.lander,
      sessionId: getSessionId(),
      ...extra,
    };

    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (err) {
      console.warn('Track failed', err);
    }
  }

  function initPageTracking() {
    const page = document.body.dataset.trackPage;
    patchCheckoutLinks();

    // Ads lander = /checkout
    if (page === 'lander' || page === 'checkout-lander') {
      track('lander_view');
    // Pay page = /pay
    } else if (page === 'checkout' || page === 'pay') {
      track('checkout_view');
    }
  }

  window.FunnelTrack = {
    getAttribution,
    getSessionId,
    buildCheckoutUrl,
    track,
    initPageTracking,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTracking);
  } else {
    initPageTracking();
  }
})();
