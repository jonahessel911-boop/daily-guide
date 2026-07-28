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
  const META_CLICK_KEY = 'meta_click_by_product_v2';
  const DEFAULT_PRODUCT = '1970cam';
  const META_CLICK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function readCookie(name) {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : '';
  }

  function writeCookie(name, value, maxAgeSec) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax${secure}`;
  }

  function readMetaClickStore() {
    try {
      return JSON.parse(localStorage.getItem(META_CLICK_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function writeMetaClickStore(store) {
    localStorage.setItem(META_CLICK_KEY, JSON.stringify(store));
  }

  function buildFbc(fbclid, ts = Date.now()) {
    return `fb.1.${ts}.${fbclid}`;
  }

  function saveProductClick(product, fbc, fbclid) {
    if (!product || !fbc) return;
    const store = readMetaClickStore();
    store[product] = {
      fbc,
      fbclid: fbclid || (fbc.split('.').slice(3).join('.') || null),
      capturedAt: Date.now(),
    };
    writeMetaClickStore(store);
  }

  /**
   * Leg de Meta click-id vast per product. Zelfde pixel/domein mag: een hearing-click
   * mag nooit mee met een 1970cam-event (en andersom).
   */
  function captureMetaClickId(product) {
    const slug = product || DEFAULT_PRODUCT;
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');

    if (fbclid) {
      const fbc = buildFbc(fbclid);
      saveProductClick(slug, fbc, fbclid);
      writeCookie('_fbc', fbc, 90 * 24 * 60 * 60);
      return { fbc, fbp: readCookie('_fbp') || null, fbclid };
    }

    return getMetaClickIds(slug);
  }

  /**
   * Op landers zonder fbclid in de URL: claim Meta’s `_fbc` cookie alleen als die
   * click-id nog van géén ander product is. Nooit een 1970cam-click “overnemen”
   * voor hearing (dat stuurde €99 ATC naar de cam-campagne).
   */
  function adoptCookieClickForProduct(product, page) {
    const isLander = page === 'lander' || page === 'checkout-lander';
    if (!isLander || !product) return;

    const store = readMetaClickStore();
    const existing = store[product];
    if (existing?.fbc && Date.now() - (existing.capturedAt || 0) < META_CLICK_TTL_MS) return;

    const cookieFbc = readCookie('_fbc');
    if (!cookieFbc || !cookieFbc.startsWith('fb.')) return;

    const fbclid = cookieFbc.split('.').slice(3).join('.') || null;

    for (const [other, entry] of Object.entries(store)) {
      if (other === product || !entry) continue;
      if (entry.fbc && entry.fbc === cookieFbc) return;
      if (fbclid && entry.fbclid && entry.fbclid === fbclid) return;
    }

    saveProductClick(product, cookieFbc, fbclid);
  }

  function getMetaClickIds(product) {
    const slug = product || getAttribution().product || DEFAULT_PRODUCT;
    const store = readMetaClickStore();
    const entry = store[slug];
    const fbp = readCookie('_fbp') || null;

    if (entry?.fbc && Date.now() - (entry.capturedAt || 0) < META_CLICK_TTL_MS) {
      return { fbc: entry.fbc, fbp, fbclid: entry.fbclid || null };
    }

    // Alleen URL-fbclid voor DIT product — nooit de globale _fbc-cookie
    // (die is van de laatste ad-click, vaak een ander product).
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');
    if (fbclid) {
      const fbc = buildFbc(fbclid);
      saveProductClick(slug, fbc, fbclid);
      writeCookie('_fbc', fbc, 90 * 24 * 60 * 60);
      return { fbc, fbp, fbclid };
    }

    return { fbc: null, fbp, fbclid: null };
  }

  function readFromDom() {
    const el = document.body;
    return {
      // null when unset — don't force 1970cam over a stored hearing attribution
      product: el.dataset.trackProduct || null,
      country: (el.dataset.trackCountry || '').toLowerCase() || null,
      lander: el.dataset.trackLander || null,
    };
  }

  function readFromUrl() {
    const p = new URLSearchParams(window.location.search);
    const lander = p.get('l');
    return {
      product: p.get('p'),
      country: p.get('c'),
      // Ignore malformed l= values (e.g. accidental query leftovers)
      lander: lander && !lander.includes('?') && !lander.includes('test_event') ? lander : null,
    };
  }

  function getAttribution() {
    const url = readFromUrl();
    const dom = readFromDom();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    // Prefer current page (DOM) over stale localStorage from another product funnel
    const merged = {
      product: url.product || dom.product || stored.product || DEFAULT_PRODUCT,
      country: (url.country || dom.country || stored.country || 'nl').toLowerCase(),
      lander: url.lander || dom.lander || stored.lander || null,
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
    const attr = getAttribution();
    captureMetaClickId(attr.product);
    adoptCookieClickForProduct(attr.product, page);
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
    captureMetaClickId,
    getMetaClickIds,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTracking);
  } else {
    initPageTracking();
  }
})();
