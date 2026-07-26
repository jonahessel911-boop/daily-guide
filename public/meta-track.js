/* Meta Pixel — gedeelde helpers */
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
