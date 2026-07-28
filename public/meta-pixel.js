/* Meta Pixel — PageView + gedeelde track helpers (browser + CAPI) */
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

fbq('init', '1545607877104793');
fbq('track', 'PageView');

(function () {
  const testCode = new URLSearchParams(window.location.search).get('test_event_code');
  if (testCode) sessionStorage.setItem('meta_test_event_code', testCode);

  function readCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function newEventId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function postJsonKeepalive(url, data) {
    const body = JSON.stringify(data);
    // Synchronous XHR as last resort — some privacy tools drop keepalive fetch
    const sendXhr = () => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
        xhr.send(body);
      } catch (_) {
        /* ignore */
      }
    };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'same-origin',
    })
      .then((res) => {
        if (!res.ok) sendXhr();
      })
      .catch(() => {
        try {
          if (navigator.sendBeacon) {
            const ok = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
            if (!ok) sendXhr();
          } else {
            sendXhr();
          }
        } catch (_) {
          sendXhr();
        }
      });
  }

  window.MetaPixel = Object.assign(window.MetaPixel || {}, {
    PIXEL_ID: '1545607877104793',

    getTestEventCode() {
      const fromUrl = new URLSearchParams(window.location.search).get('test_event_code');
      if (fromUrl) return fromUrl;
      return sessionStorage.getItem('meta_test_event_code') || '';
    },

    // Browser Purchase uit: alleen server-CAPI stuurt Purchase (voorkomt dubbele conversies in Meta).
    trackPurchase(_value, _eventId) {
      return false;
    },

    /**
     * AddToCart alleen via CAPI. Browser-pixel hangt altijd de gedeelde `_fbc`-cookie
     * aan het event → hearing €99 ATC werd aan een eerdere 1970cam-click gekoppeld.
     * Click-id komt uit content_ids[0] (product van de ATC), nooit uit een ander product.
     */
    trackAddToCart({ value, contentIds, contentName, contentType, numItems, eventId } = {}) {
      const id = eventId || newEventId('atc');
      const ids = (contentIds || []).map(String).filter(Boolean);
      const n = Math.max(1, parseInt(numItems, 10) || 1);
      const amount = Number(value) || 0;

      let externalId = '';
      try {
        externalId = localStorage.getItem('funnel_session_id') || '';
      } catch (_) {
        /* ignore */
      }

      // Product voor click-id = wat er in de cart gaat, niet “default 1970cam”
      const product =
        ids[0] ||
        document.body?.dataset?.trackProduct ||
        window.FunnelTrack?.getAttribution?.()?.product ||
        undefined;
      const clickIds = window.FunnelTrack?.getMetaClickIds?.(product) || {};

      postJsonKeepalive('/api/track/add-to-cart', {
        eventId: id,
        value: amount,
        contentIds: ids,
        contentName: contentName || undefined,
        contentType: contentType || 'product',
        numItems: n,
        fbp: clickIds.fbp || readCookie('_fbp') || undefined,
        fbc: clickIds.fbc || undefined,
        eventSourceUrl: window.location.href,
        testEventCode: window.MetaPixel.getTestEventCode() || undefined,
        country: (document.body?.dataset?.trackCountry || 'nl').toLowerCase(),
        externalId: externalId || undefined,
        leadSource: document.body?.dataset?.trackLander || undefined,
        productSlug: product || undefined,
      });

      return true;
    },
  });
})();
