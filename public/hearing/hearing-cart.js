/**
 * HearDirect — side cart + ATC (same pattern as 1970cam shop)
 */
(function () {
  const STORAGE_KEY = 'hearing_cart_v1';
  const CHECKOUT_KEY = 'hearing_checkout_cart';
  const UNIT_PRICE = 99;
  const WAS_PRICE = 179;
  const IMAGE = '/hearing-nl/assets/product/heardirect-open-case.webp';
  const TITLE = 'HearDirect™';

  function fmt(n) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
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
    return items.reduce((s, i) => s + UNIT_PRICE * (i.qty || 0), 0);
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
        <p class="hd-drawer__note">Gratis verzending · 90 dagen proberen</p>
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
          unitPrice: UNIT_PRICE,
        },
      ]);
    }
  }

  function addToCart(qty = 1) {
    ensureDrawer();
    const items = readCart();
    const existing = items.find((i) => i.sku === 'hearing');
    const n = Math.max(1, parseInt(qty, 10) || 1);
    if (existing) existing.qty += n;
    else {
      items.push({
        sku: 'hearing',
        title: TITLE,
        qty: n,
        image: IMAGE,
        unitPrice: UNIT_PRICE,
      });
    }
    writeCart(items);
    window.MetaPixel?.trackAddToCart?.({
      value: UNIT_PRICE * n,
      contentIds: ['hearing'],
      contentName: TITLE,
      numItems: n,
    });
    openDrawer();
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
      return;
    }

    body.innerHTML = items
      .map(
        (i) => `
      <div class="hd-cart-item">
        <img src="${i.image}" alt="">
        <div>
          <div class="hd-cart-item__title">${i.qty}× ${i.title}</div>
          <div class="hd-cart-item__meta">${fmt(UNIT_PRICE)} / stuk</div>
          <div class="hd-cart-item__row">
            <div class="hd-qty">
              <button type="button" data-dec aria-label="Minder">−</button>
              <span>${i.qty}</span>
              <button type="button" data-inc aria-label="Meer">+</button>
            </div>
            <strong>${fmt(UNIT_PRICE * i.qty)}</strong>
          </div>
        </div>
      </div>`
      )
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
    sessionStorage.setItem(
      CHECKOUT_KEY,
      JSON.stringify({
        items: items.map((i) => ({
          sku: 'hearing',
          qty: i.qty,
          title: i.title,
          unitPrice: UNIT_PRICE,
        })),
        qty,
        total: cartTotal(items),
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

  function wireAtcButtons() {
    document.addEventListener('click', (e) => {
      const atc = e.target.closest('[data-hd-atc]');
      if (atc) {
        e.preventDefault();
        addToCart(1);
        return;
      }
      const payLink = e.target.closest('a[href$="pay.html"], a[href*="pay.html"]');
      if (!payLink || payLink.dataset.hdSkip) return;
      if (payLink.closest('.legal-footer')) return;
      e.preventDefault();
      addToCart(1);
    });
  }

  function init() {
    ensureDrawer();
    renderCart();
    wireAtcButtons();
    wireHeaderCart();
  }

  window.HearingCart = { addToCart, openDrawer, closeDrawer, goCheckout };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
