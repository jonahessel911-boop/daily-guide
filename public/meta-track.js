/* Meta Pixel — gedeelde helpers (alias; canonical in meta-pixel.js) */
(function () {
  if (window.MetaPixel?.trackAddToCart && window.MetaPixel?.trackPurchase) return;

  function readCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function newEventId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function postJsonKeepalive(url, data) {
    const body = JSON.stringify(data);
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

    trackPurchase(value, eventId) {
      if (typeof fbq !== 'function') return false;
      fbq(
        'track',
        'Purchase',
        {
          currency: 'EUR',
          value: Number(value) || 17,
        },
        { eventID: eventId }
      );
      return true;
    },

    trackAddToCart({ value, contentIds, contentName, contentType, numItems, eventId } = {}) {
      if (typeof fbq !== 'function') return false;

      const id = eventId || newEventId('atc');
      const ids = (contentIds || []).map(String).filter(Boolean);
      const n = Math.max(1, parseInt(numItems, 10) || 1);
      const amount = Number(value) || 0;

      const custom = {
        currency: 'EUR',
        value: amount,
        content_type: contentType || 'product',
        num_items: n,
      };
      if (ids.length) custom.content_ids = ids;
      if (contentName) custom.content_name = contentName;

      fbq('track', 'AddToCart', custom, { eventID: id });

      let externalId = '';
      try {
        externalId = localStorage.getItem('funnel_session_id') || '';
      } catch (_) {
        /* ignore */
      }

      const product =
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
      });

      return true;
    },
  });
})();
