/* Meta Pixel — gedeelde helpers */
window.MetaPixel = {
  PIXEL_ID: '4564404523788178',

  getTestEventCode() {
    const fromUrl = new URLSearchParams(window.location.search).get('test_event_code');
    if (fromUrl) return fromUrl;
    return sessionStorage.getItem('meta_test_event_code') || '';
  },

  trackPurchase(value, eventId) {
    if (typeof fbq !== 'function') return false;
    fbq('track', 'Purchase', {
      currency: 'EUR',
      value: Number(value) || 17,
    }, { eventID: eventId });
    return true;
  },
};
