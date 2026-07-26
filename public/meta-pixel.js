/* Meta Pixel — PageView op elke funnelpagina */
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

    trackAddToCart({ value, contentIds, contentName, contentType, numItems } = {}) {
      if (typeof fbq !== 'function') return false;
      const payload = {
        currency: 'EUR',
        value: Number(value) || 0,
        content_type: contentType || 'product',
        num_items: Math.max(1, parseInt(numItems, 10) || 1),
      };
      if (contentIds?.length) payload.content_ids = contentIds;
      if (contentName) payload.content_name = contentName;
      fbq('track', 'AddToCart', payload);
      return true;
    },
  });
})();
