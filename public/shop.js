/**
 * 1970cam shop — Hears-style gallery, offers, side cart, UGC
 */
(function () {
  const STORAGE_KEY = 'cam1970_cart_v1';
  const PRICE = {
    single: { qty: 1, price: 69.99, was: 99.99, label: '1× 1970cam' },
    duo: { qty: 2, price: 119.99, was: 139.98, label: '2× 1970cam' },
  };

  const IMAGES = [
    { src: '/assets/product/1970cam-front.png', alt: '1970cam vooraanzicht' },
    { src: '/assets/product/1970cam-contents.png', alt: '1970cam complete set' },
    { src: '/assets/product/1970cam-benefits.png', alt: '1970cam voordelen' },
    { src: '/assets/product/1970cam-setup.png', alt: '1970cam koppelen' },
    { src: '/assets/product/1970cam-lifestyle.png', alt: '1970cam lifestyle' },
    { src: '/assets/product/1970cam-phone-gallery.png', alt: '1970cam in de app' },
    { src: '/assets/product/1970cam-how-it-works.png', alt: 'Hoe 1970cam werkt' },
    { src: '/assets/gallery/huisfeest.png', alt: 'Huisfeest foto' },
    { src: '/assets/gallery/festival.png', alt: 'Festival foto' },
    { src: '/assets/gallery/terras.png', alt: 'Terras foto' },
    { src: '/assets/gallery/zomer.png', alt: 'Zomer foto' },
    { src: '/assets/gallery/roadtrip.png', alt: 'Roadtrip foto' },
  ];

  const LOVED = [
    '/assets/reviews/emma-photo.png',
    '/assets/reviews/lisa-photo.png',
    '/assets/reviews/daan-photo.png',
    '/assets/gallery/huisfeest.png',
    '/assets/gallery/festival.png',
    '/assets/gallery/terras.png',
    '/assets/product/1970cam-lifestyle.png',
    '/assets/gallery/zomer.png',
  ];

  const UGC = [
    {
      name: 'Fleur',
      title: 'Nooit meer kabel-gedoe',
      text: window.Cam1970Reviews?.[0]?.text || 'Foto\'s stonden direct op m\'n telefoon.',
      photo: '/assets/reviews/emma-photo.png',
      avatar: '/assets/reviews/emma-avatar.png',
    },
    {
      name: 'Daan',
      title: 'Kwaliteit is bizar',
      text: window.Cam1970Reviews?.[1]?.text || 'De kwaliteit is echt bizar.',
      photo: '/assets/reviews/daan-photo.png',
      avatar: '/assets/reviews/daan-avatar.png',
    },
    {
      name: 'Lisa',
      title: 'Elke vrijdag een droom',
      text: window.Cam1970Reviews?.[2]?.text || 'Eindelijk avondjes weg zonder scherm.',
      photo: '/assets/reviews/lisa-photo.png',
      avatar: '/assets/reviews/lisa-avatar.png',
    },
  ];

  let imageIndex = 0;
  let selectedOffer = 'single';

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

  function priceForCameras(n) {
    const duos = Math.floor(n / 2);
    const singles = n % 2;
    return duos * PRICE.duo.price + singles * PRICE.single.price;
  }

  function cartCount(items = readCart()) {
    const row = items.find((i) => i.sku === '1970cam');
    return row ? row.qty : 0;
  }

  function updateBadge() {
    const badge = document.getElementById('shop-cart-badge');
    if (!badge) return;
    const n = cartCount();
    if (n <= 0) {
      badge.classList.remove('is-visible', 'is-word');
      badge.textContent = '';
      badge.hidden = true;
      return;
    }
    badge.hidden = false;
    badge.classList.add('is-visible');
    if (n === 1) {
      badge.textContent = 'Eentje';
      badge.classList.add('is-word');
    } else {
      badge.textContent = String(n);
      badge.classList.remove('is-word');
    }
  }

  function updateStickyPrice() {
    const el = document.getElementById('shop-sticky-price');
    const offer = PRICE[selectedOffer] || PRICE.single;
    if (el) el.textContent = fmt(offer.price);
  }

  function setMainImage(i) {
    imageIndex = (i + IMAGES.length) % IMAGES.length;
    const img = document.getElementById('shop-main-image');
    const item = IMAGES[imageIndex];
    if (img && item) {
      img.src = item.src;
      img.alt = item.alt;
    }
    document.querySelectorAll('.shop-thumbs button').forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx === imageIndex);
    });
  }

  function renderThumbs() {
    const row = document.getElementById('shop-thumbs');
    if (!row) return;
    row.innerHTML = IMAGES.map(
      (img, i) => `
      <button type="button" data-index="${i}" class="${i === 0 ? 'is-active' : ''}" aria-label="Foto ${i + 1}">
        <img src="${img.src}" alt="">
      </button>`
    ).join('');
  }

  function renderLoved() {
    const row = document.getElementById('shop-loved-row');
    if (!row) return;
    row.innerHTML = LOVED.map(
      (src) => `
      <div class="shop-loved__card">
        <img src="${src}" alt="" loading="lazy">
        <span class="shop-loved__play" aria-hidden="true">▶</span>
      </div>`
    ).join('');
  }

  function renderUgc() {
    const box = document.getElementById('shop-ugc');
    if (!box) return;
    const reviews = window.Cam1970Reviews || [];
    const cards = UGC.map((u, i) => {
      const r = reviews[i] || {};
      return {
        ...u,
        text: r.text || u.text,
        name: r.name || u.name,
        avatar: r.avatar || u.avatar,
      };
    });
    box.innerHTML = cards
      .map(
        (c) => `
      <article class="shop-ugc-card">
        <img src="${c.photo}" alt="">
        <div class="shop-ugc-card__body">
          <div class="shop-ugc-card__meta">
            <img src="${c.avatar}" alt="">
            <span><strong>${c.name}</strong> · Verified Buyer</span>
          </div>
          <h4>${c.title}</h4>
          <p>${c.text}</p>
          <div class="shop-ugc-card__stars">★★★★★</div>
        </div>
      </article>`
      )
      .join('');
  }

  function openDrawer() {
    document.getElementById('shop-drawer')?.classList.add('is-open');
    document.getElementById('shop-drawer-backdrop')?.classList.add('is-open');
    document.body.classList.add('shop-cart-open');
  }

  function closeDrawer() {
    document.getElementById('shop-drawer')?.classList.remove('is-open');
    document.getElementById('shop-drawer-backdrop')?.classList.remove('is-open');
    document.body.classList.remove('shop-cart-open');
  }

  function selectOffer(id) {
    selectedOffer = id;
    document.querySelectorAll('.shop-offer').forEach((o) => {
      o.classList.toggle('is-selected', o.dataset.offer === id);
    });
    updateStickyPrice();
  }

  function addOfferToCart(offerId) {
    const offer = PRICE[offerId] || PRICE.single;
    const items = readCart();
    const existing = items.find((i) => i.sku === '1970cam');
    if (existing) existing.qty += offer.qty;
    else {
      items.push({
        sku: '1970cam',
        title: '1970cam',
        qty: offer.qty,
        image: IMAGES[0].src,
      });
    }
    writeCart(items);
    openDrawer();
  }

  function addSelectedToCart() {
    addOfferToCart(selectedOffer);
  }

  function setQty(qty) {
    let items = readCart();
    if (qty <= 0) items = [];
    else {
      const row = items.find((i) => i.sku === '1970cam');
      if (row) row.qty = qty;
      else items = [{ sku: '1970cam', title: '1970cam', qty, image: IMAGES[0].src }];
    }
    writeCart(items);
  }

  function renderCart() {
    updateBadge();
    const body = document.getElementById('shop-drawer-body');
    const totalEl = document.getElementById('shop-drawer-total');
    const checkoutBtn = document.getElementById('shop-drawer-checkout');
    const qty = cartCount();

    if (!body) return;

    if (qty <= 0) {
      body.innerHTML = `<p class="shop-drawer__empty">Your cart is empty</p>`;
      if (totalEl) totalEl.textContent = fmt(0);
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    const total = priceForCameras(qty);
    const per = total / qty;
    body.innerHTML = `
      <div class="shop-cart-item">
        <img src="${IMAGES[0].src}" alt="">
        <div>
          <div class="shop-cart-item__title">${qty}× 1970cam</div>
          <div class="shop-cart-item__meta">${fmt(per)} gem. / stuk</div>
          <div class="shop-cart-item__row">
            <div class="shop-qty">
              <button type="button" data-dec aria-label="Minder">−</button>
              <span>${qty}</span>
              <button type="button" data-inc aria-label="Meer">+</button>
            </div>
            <strong>${fmt(total)}</strong>
          </div>
        </div>
      </div>`;

    if (totalEl) totalEl.textContent = fmt(total);
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  function goCheckout() {
    const qty = cartCount();
    if (qty <= 0) return;
    const total = priceForCameras(qty);
    sessionStorage.setItem(
      'cam1970_checkout_cart',
      JSON.stringify({ qty, total, productSlug: '1970cam' })
    );
    const url = new URL('/pay', window.location.origin);
    url.searchParams.set('p', '1970cam');
    url.searchParams.set('c', 'nl');
    url.searchParams.set('l', 'checkout');
    url.searchParams.set('qty', String(qty));
    window.location.href = url.pathname + url.search;
  }

  function bind() {
    renderThumbs();
    setMainImage(0);
    renderLoved();
    renderUgc();
    renderCart();
    updateStickyPrice();

    document.getElementById('shop-thumbs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-index]');
      if (!btn) return;
      setMainImage(Number(btn.dataset.index));
    });

    document.getElementById('shop-gallery-prev')?.addEventListener('click', () => setMainImage(imageIndex - 1));
    document.getElementById('shop-gallery-next')?.addEventListener('click', () => setMainImage(imageIndex + 1));
    document.getElementById('shop-gallery-zoom')?.addEventListener('click', () => {
      const img = document.getElementById('shop-main-image');
      if (img) window.open(img.src, '_blank');
    });

    document.querySelectorAll('.shop-offer').forEach((el) => {
      el.addEventListener('click', () => selectOffer(el.dataset.offer));
    });

    document.querySelectorAll('.shop-swatch').forEach((sw) => {
      sw.addEventListener('click', () => {
        document.querySelectorAll('.shop-swatch').forEach((s) => s.classList.remove('is-selected'));
        sw.classList.add('is-selected');
        const label = document.getElementById('shop-finish-label');
        if (label) label.textContent = sw.dataset.finish || 'Classic Black';
      });
    });

    document.getElementById('shop-atc')?.addEventListener('click', addSelectedToCart);
    document.getElementById('shop-atc-sticky')?.addEventListener('click', addSelectedToCart);

    document.querySelectorAll('.shop-bundle-card__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.offer || 'single';
        selectOffer(id);
        addOfferToCart(id);
      });
    });

    document.getElementById('shop-cart-open')?.addEventListener('click', openDrawer);
    document.getElementById('shop-drawer-close')?.addEventListener('click', closeDrawer);
    document.getElementById('shop-drawer-backdrop')?.addEventListener('click', closeDrawer);
    document.getElementById('shop-drawer-checkout')?.addEventListener('click', goCheckout);

    document.getElementById('shop-drawer-body')?.addEventListener('click', (e) => {
      if (e.target.closest('[data-inc]')) setQty(cartCount() + 1);
      if (e.target.closest('[data-dec]')) setQty(cartCount() - 1);
    });

    document.getElementById('shop-burger')?.addEventListener('click', () => {
      document.getElementById('shop-mobile-nav')?.classList.add('is-open');
    });
    document.getElementById('shop-mobile-nav-close')?.addEventListener('click', () => {
      document.getElementById('shop-mobile-nav')?.classList.remove('is-open');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  window.Cam1970Shop = { openDrawer, cartCount };
})();
