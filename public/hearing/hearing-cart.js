/**
 * HearDirect — side cart + ATC (same pattern as 1970cam shop)
 */
(function () {
  const STORAGE_KEY = 'hearing_cart_v1';
  const CHECKOUT_KEY = 'hearing_checkout_cart';
  const IMAGE = '/hearing-nl/assets/product/heardirect-open-case.webp';
  const TITLE = 'HearDirect™';
  const WAS_PRICE = 199.95;

  const OFFERS = {
    single: { id: 'single', qty: 1, unitCents: 12999, was: 199.95, label: '1 Set' },
    duo: { id: 'duo', qty: 2, unitCents: 11999, was: 199.95, label: '2 Sets' },
  };

  let selectedOffer = 'single';

  function fmt(n) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
  }

  /** Pair pricing: every 2 sets @ €119,99; leftover singles @ €129,99 */
  function priceForQty(qty) {
    const n = Math.max(0, parseInt(qty, 10) || 0);
    const duos = Math.floor(n / 2);
    const singles = n % 2;
    return (duos * OFFERS.duo.unitCents * 2 + singles * OFFERS.single.unitCents) / 100;
  }

  function unitPriceForQty(qty) {
    const n = Math.max(1, parseInt(qty, 10) || 1);
    return priceForQty(n) / n;
  }

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    renderCart();
  }

  function cartCount(items = readCart()) {
    return items.reduce((s, i) => s + (i.qty || 0), 0);
  }

  function cartTotal(items = readCart()) {
    return priceForQty(cartCount(items));
  }

  function ensureDrawer() {
    if (document.getElementById('hd-drawer')) return;
    const backdrop = document.createElement('div');
    backdrop.className = 'hd-drawer-backdrop';
    backdrop.id = 'hd-drawer-backdrop';
    const drawer = document.createElement('aside');
    drawer.className = 'hd-drawer';
    drawer.id = 'hd-drawer';
    drawer.setAttribute('aria-label', 'Winkelwagen');
    drawer.innerHTML = `
      <div class="hd-drawer__head">
        <h2>Jouw winkelwagen</h2>
        <button type="button" class="hd-drawer__close" id="hd-drawer-close" aria-label="Sluiten">×</button>
      </div>
      <div class="hd-drawer__body" id="hd-drawer-body"></div>
      <div class="hd-drawer__foot">
        <div class="hd-drawer__total"><span>Totaal</span><span id="hd-drawer-total">€ 0,00</span></div>
        <button type="button" class="hd-drawer__checkout" id="hd-drawer-checkout" disabled>Afrekenen</button>
        <p class="hd-drawer__note">Gratis verzending · 90 dagen testperiode</p>
      </div>`;
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    document.getElementById('hd-drawer-close')?.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    document.getElementById('hd-drawer-checkout')?.addEventListener('click', goCheckout);
    document.getElementById('hd-drawer-body')?.addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      if (inc) {
        const row = readCart().find((i) => i.sku === 'hearing');
        if (row) setQty(row.qty + 1);
      }
      if (dec) {
        const row = readCart().find((i) => i.sku === 'hearing');
        if (row) setQty(row.qty - 1);
      }
    });
  }

  function openDrawer() {
    ensureDrawer();
    renderCart();
    document.getElementById('hd-drawer')?.classList.add('is-open');
    document.getElementById('hd-drawer-backdrop')?.classList.add('is-open');
    document.body.classList.add('hd-cart-open');
  }

  function closeDrawer() {
    document.getElementById('hd-drawer')?.classList.remove('is-open');
    document.getElementById('hd-drawer-backdrop')?.classList.remove('is-open');
    document.body.classList.remove('hd-cart-open');
  }

  function setQty(qty) {
    if (qty <= 0) writeCart([]);
    else {
      writeCart([
        {
          sku: 'hearing',
          title: TITLE,
          qty,
          image: IMAGE,
          unitPrice: unitPriceForQty(qty),
        },
      ]);
    }
  }

  function addOfferToCart(offerId) {
    const offer = OFFERS[offerId] || OFFERS.single;
    addToCart(offer.qty);
  }

  function addToCart(qty = 1) {
    ensureDrawer();
    const items = readCart();
    const existing = items.find((i) => i.sku === 'hearing');
    const n = Math.max(1, parseInt(qty, 10) || 1);
    const nextQty = (existing?.qty || 0) + n;
    if (existing) existing.qty = nextQty;
    else {
      items.push({
        sku: 'hearing',
        title: TITLE,
        qty: n,
        image: IMAGE,
        unitPrice: unitPriceForQty(n),
      });
    }
    if (existing) existing.unitPrice = unitPriceForQty(existing.qty);
    writeCart(items);
    window.MetaPixel?.trackAddToCart?.({
      value: priceForQty(n),
      contentIds: ['hearing'],
      contentName: TITLE,
      numItems: n,
    });
    openDrawer();
  }

  function addSelectedToCart() {
    addOfferToCart(selectedOffer);
  }

  function selectOffer(id) {
    selectedOffer = id === 'duo' ? 'duo' : 'single';
    document.querySelectorAll('[data-hd-offer]').forEach((el) => {
      el.classList.toggle('is-selected', el.dataset.hdOffer === selectedOffer);
      el.setAttribute('aria-pressed', el.dataset.hdOffer === selectedOffer ? 'true' : 'false');
    });
    updateStickyPrice();
  }

  function updateStickyPrice() {
    const offer = OFFERS[selectedOffer] || OFFERS.single;
    const unit = offer.unitCents / 100;
    const total = (offer.unitCents * offer.qty) / 100;
    const summaryPrice = document.querySelector('.dtc-summary__price');
    if (summaryPrice) summaryPrice.textContent = fmt(unit);
    const stickyStrong = document.querySelector('.dtc-sticky-atc__price strong');
    if (stickyStrong) stickyStrong.textContent = fmt(total);
  }

  function renderCart() {
    ensureDrawer();
    const body = document.getElementById('hd-drawer-body');
    const totalEl = document.getElementById('hd-drawer-total');
    const checkoutBtn = document.getElementById('hd-drawer-checkout');
    const items = readCart();
    if (!body) return;

    if (!items.length) {
      body.innerHTML = `<p class="hd-drawer__empty">Je winkelwagen is leeg</p>`;
      if (totalEl) totalEl.textContent = fmt(0);
      if (checkoutBtn) checkoutBtn.disabled = true;
      updateHeaderBadge();
      return;
    }

    body.innerHTML = items
      .map((i) => {
        const unit = unitPriceForQty(i.qty);
        return `
      <div class="hd-cart-item">
        <img src="${i.image}" alt="">
        <div>
          <div class="hd-cart-item__title">${i.qty}× ${i.title}</div>
          <div class="hd-cart-item__meta">${fmt(unit)} / stuk${i.qty >= 2 ? ' (bundel)' : ''}</div>
          <div class="hd-cart-item__row">
            <div class="hd-qty">
              <button type="button" data-dec aria-label="Minder">−</button>
              <span>${i.qty}</span>
              <button type="button" data-inc aria-label="Meer">+</button>
            </div>
            <strong>${fmt(priceForQty(i.qty))}</strong>
          </div>
        </div>
      </div>`;
      })
      .join('');

    if (totalEl) totalEl.textContent = fmt(cartTotal(items));
    if (checkoutBtn) checkoutBtn.disabled = false;
    updateHeaderBadge();
  }

  function updateHeaderBadge() {
    const n = cartCount();
    document.querySelectorAll('[data-hd-cart-count]').forEach((el) => {
      el.textContent = String(n);
      el.hidden = n <= 0;
    });
  }

  function wireHeaderCart() {
    document.getElementById('hd-cart-open')?.addEventListener('click', openDrawer);
  }

  function goCheckout() {
    const items = readCart();
    if (!items.length) return;
    const qty = cartCount(items);
    const total = cartTotal(items);
    sessionStorage.setItem(
      CHECKOUT_KEY,
      JSON.stringify({
        items: items.map((i) => ({
          sku: 'hearing',
          qty: i.qty,
          title: i.title,
          unitPrice: unitPriceForQty(i.qty),
        })),
        qty,
        total,
        productSlug: 'hearing',
        was: WAS_PRICE * qty,
      })
    );
    const payUrl = document.body.dataset.payUrl || 'pay.html';
    const url = new URL(payUrl, window.location.href);
    url.searchParams.set('p', 'hearing');
    url.searchParams.set('qty', String(qty));
    window.location.href = url.pathname + url.search;
  }

  function wireOffers() {
    document.addEventListener('click', (e) => {
      const offerBtn = e.target.closest('[data-hd-offer]');
      if (offerBtn) {
        e.preventDefault();
        selectOffer(offerBtn.dataset.hdOffer);
      }
    });
  }

  function wireAtcButtons() {
    document.addEventListener('click', (e) => {
      const atc = e.target.closest('[data-hd-atc]');
      if (atc) {
        e.preventDefault();
        addSelectedToCart();
        return;
      }
      const payLink = e.target.closest('a[href$="pay.html"], a[href*="pay.html"]');
      if (!payLink || payLink.dataset.hdSkip) return;
      if (payLink.closest('.legal-footer')) return;
      e.preventDefault();
      addSelectedToCart();
    });
  }

  function init() {
    ensureDrawer();
    renderCart();
    wireAtcButtons();
    wireOffers();
    wireHeaderCart();
    selectOffer(selectedOffer);
  }

  window.HearingCart = {
    addToCart,
    addOfferToCart,
    addSelectedToCart,
    selectOffer,
    openDrawer,
    closeDrawer,
    goCheckout,
    priceForQty,
    unitPriceForQty,
    OFFERS,
    getSelectedOffer: () => selectedOffer,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
