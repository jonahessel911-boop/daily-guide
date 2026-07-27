/**
 * 1970cam shop — Hears-style gallery, offers, side cart
 * PDP product via body[data-shop-sku] (default: 1970cam)
 */
(function () {
  const STORAGE_KEY = 'cam1970_cart_v1';
  const PAGE_SKU = document.body?.dataset?.shopSku || '1970cam';
  const PRICE = {
    single: { qty: 1, price: 69.99, was: 99.99, label: '1× 1970cam' },
    duo: { qty: 2, price: 119.99, was: 139.98, label: '2× 1970cam' },
  };
  const CATALOG = {
    '1970cam': {
      sku: '1970cam',
      title: '1970cam',
      unitPrice: 69.99,
      was: 99.99,
      image: '/assets/product/1970cam-front.png',
    },
    printer: {
      sku: 'printer',
      title: '1970cam Portable Printer',
      unitPrice: 89.99,
      was: 119.99,
      image: '/assets/product/printer/printer-front-new.jpg',
    },
  };

  const GALLERIES = {
    '1970cam': [
      { src: '/assets/product/1970cam-front.png', alt: '1970cam vooraanzicht' },
      { src: '/assets/product/1970cam-contents.png', alt: '1970cam complete set' },
      { src: '/assets/product/1970cam-benefits.png', alt: '1970cam voordelen' },
      { src: '/assets/product/1970cam-setup.png', alt: '1970cam koppelen' },
      { src: '/assets/product/1970cam-phone-gallery.png', alt: '1970cam in de app' },
      { src: '/assets/product/1970cam-vs-concurrentie.png', alt: '1970cam vs concurrentie' },
      { src: '/assets/product/1970cam-lifestyle.png', alt: '1970cam lifestyle' },
    ],
    printer: [
      { src: '/assets/product/printer/printer-front-new.jpg', alt: 'Portable Printer vooraanzicht' },
      { src: '/assets/product/printer/printer-kit-new.jpg', alt: 'Portable Printer complete set' },
      { src: '/assets/product/printer/printer-phone-new.jpg', alt: 'Print vanaf je telefoon' },
      { src: '/assets/product/printer/printer-print-new.jpg', alt: 'Foto komt uit de printer' },
      { src: '/assets/product/printer/printer-wall.jpg', alt: 'Prints aan de muur' },
    ],
  };

  /* Product gallery: square 1:1 assets only (Hears-style PDP) */
  const IMAGES = GALLERIES[PAGE_SKU] || GALLERIES['1970cam'];

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

  function lineTotal(item) {
    if (item.sku === '1970cam') return priceForCameras(item.qty);
    const cat = CATALOG[item.sku];
    return (cat?.unitPrice || item.unitPrice || 0) * item.qty;
  }

  function cartCount(items = readCart()) {
    return items.reduce((sum, i) => sum + (i.qty || 0), 0);
  }

  function cartTotal(items = readCart()) {
    return items.reduce((sum, i) => sum + lineTotal(i), 0);
  }

  function cameraQty(items = readCart()) {
    return items.find((i) => i.sku === '1970cam')?.qty || 0;
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
    badge.classList.remove('is-word');
    badge.textContent = String(n);
  }

  function updateStickyPrice() {
    const el = document.getElementById('shop-sticky-price');
    const product = CATALOG[PAGE_SKU] || CATALOG['1970cam'];
    if (el) el.textContent = fmt(product.unitPrice);
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

  /* ---- Written review list + Load more ---- */
  const REVIEW_PAGE = 3;
  let reviewVisible = REVIEW_PAGE;
  let reviewSort = 'recent';

  function getSortedReviews() {
    const source =
      PAGE_SKU === 'printer'
        ? window.PrinterReviews || []
        : window.Cam1970Reviews || [];
    const list = [...source];
    if (reviewSort === 'helpful') {
      list.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    }
    return list;
  }

  function reviewCardHtml(r, idx) {
    const long = (r.text || '').length > 140;
    const product =
      PAGE_SKU === 'printer'
        ? {
            image: '/assets/product/printer/printer-front-new.jpg',
            name: 'Portable Printer',
            meta: 'Draadloos · Incl. printpapier',
          }
        : {
            image: '/assets/product/1970cam-front.png',
            name: '1970cam',
            meta: 'Klassiek zwart · Digitale wegwerpvibe',
          };
    return `
      <article class="shop-rcard" data-idx="${idx}">
        <div class="shop-rcard__top">
          <span class="shop-rcard__name">${r.name}</span>
          <span class="shop-rcard__verified">Geverifieerde koper</span>
        </div>
        <div class="shop-rcard__product">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <div class="shop-rcard__product-label">Review over</div>
            <div class="shop-rcard__product-name">${product.name}</div>
            <div class="shop-rcard__product-meta">${product.meta}</div>
          </div>
        </div>
        <div class="shop-rcard__rating">
          <span class="shop-rcard__stars" aria-hidden="true">★★★★★</span>
          <span class="shop-rcard__when">${r.when || ''}</span>
        </div>
        <h3 class="shop-rcard__title">${r.title || 'Review'}</h3>
        <p class="shop-rcard__text${long ? ' is-clamp' : ''}">${r.text}</p>
        ${long ? `<button type="button" class="shop-rcard__more" data-expand>Lees meer</button>` : ''}
        <div class="shop-rcard__foot">
          <span>Was dit behulpzaam?</span>
          <button type="button" class="shop-rcard__vote" data-up aria-label="Behulpzaam">👍 <span>${r.helpful || 0}</span></button>
          <button type="button" class="shop-rcard__vote" data-down aria-label="Niet behulpzaam">👎 <span>0</span></button>
        </div>
      </article>`;
  }

  function renderReviewList() {
    const box = document.getElementById('shop-review-cards');
    const moreBtn = document.getElementById('shop-review-more');
    const countEl = document.getElementById('shop-review-count');
    if (!box) return;
    const all = getSortedReviews();
    if (countEl) {
      countEl.textContent = PAGE_SKU === 'printer' ? '382' : '683';
    }
    box.innerHTML = all.slice(0, reviewVisible).map(reviewCardHtml).join('');
    if (moreBtn) moreBtn.hidden = reviewVisible >= all.length;
  }

  function bindReviewList() {
    renderReviewList();

    document.getElementById('shop-review-more')?.addEventListener('click', () => {
      reviewVisible += REVIEW_PAGE;
      renderReviewList();
    });

    document.getElementById('shop-review-sort')?.addEventListener('change', (e) => {
      reviewSort = e.target.value;
      reviewVisible = REVIEW_PAGE;
      renderReviewList();
    });

    document.getElementById('shop-review-cards')?.addEventListener('click', (e) => {
      const expand = e.target.closest('[data-expand]');
      if (expand) {
        const card = expand.closest('.shop-rcard');
        const text = card?.querySelector('.shop-rcard__text');
        if (text) {
          text.classList.remove('is-clamp');
          expand.remove();
        }
        return;
      }
      const up = e.target.closest('[data-up]');
      if (up) {
        const span = up.querySelector('span');
        if (span) span.textContent = String((parseInt(span.textContent, 10) || 0) + 1);
      }
    });
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
    selectedOffer = id === 'duo' ? 'duo' : 'single';
    updateStickyPrice();
  }

  function trackMetaAddToCart(sku, qty) {
    const cat = CATALOG[sku];
    const unit = cat?.unitPrice || 0;
    const n = Math.max(1, parseInt(qty, 10) || 1);
    window.MetaPixel?.trackAddToCart?.({
      value: unit * n,
      contentIds: [sku],
      contentName: cat?.title || sku,
      numItems: n,
    });
  }

  function addOfferToCart(offerId) {
    const offer = PRICE[offerId] || PRICE.single;
    const items = readCart();
    const existing = items.find((i) => i.sku === '1970cam');
    if (existing) existing.qty += offer.qty;
    else {
      items.push({
        sku: '1970cam',
        title: CATALOG['1970cam'].title,
        qty: offer.qty,
        image: CATALOG['1970cam'].image,
        unitPrice: CATALOG['1970cam'].unitPrice,
      });
    }
    writeCart(items);
    trackMetaAddToCart('1970cam', offer.qty);
    openDrawer();
  }

  function addSkuToCart(sku, qty = 1) {
    const cat = CATALOG[sku];
    if (!cat) return;
    const items = readCart();
    const existing = items.find((i) => i.sku === sku);
    if (existing) existing.qty += qty;
    else {
      items.push({
        sku: cat.sku,
        title: cat.title,
        qty,
        image: cat.image,
        unitPrice: cat.unitPrice,
      });
    }
    writeCart(items);
    trackMetaAddToCart(sku, qty);
    openDrawer();
  }

  function addSelectedToCart() {
    if (PAGE_SKU === 'printer') {
      addSkuToCart('printer', 1);
      return;
    }
    addOfferToCart('single');
  }

  function setQty(sku, qty) {
    let items = readCart();
    if (qty <= 0) items = items.filter((i) => i.sku !== sku);
    else {
      const row = items.find((i) => i.sku === sku);
      if (row) row.qty = qty;
      else if (CATALOG[sku]) {
        items.push({
          sku,
          title: CATALOG[sku].title,
          qty,
          image: CATALOG[sku].image,
          unitPrice: CATALOG[sku].unitPrice,
        });
      }
    }
    writeCart(items);
  }

  function renderCart() {
    updateBadge();
    const body = document.getElementById('shop-drawer-body');
    const totalEl = document.getElementById('shop-drawer-total');
    const checkoutBtn = document.getElementById('shop-drawer-checkout');
    const items = readCart();

    if (!body) return;

    if (!items.length) {
      body.innerHTML = `<p class="shop-drawer__empty">Je winkelwagen is leeg</p>`;
      if (totalEl) totalEl.textContent = fmt(0);
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    const crossSell = '';

    body.innerHTML =
      items
        .map((i) => {
          const total = lineTotal(i);
          const per = i.sku === '1970cam' ? total / i.qty : i.unitPrice || CATALOG[i.sku]?.unitPrice || 0;
          const note =
            i.sku === 'printer'
              ? `<div class="shop-cart-item__note">Incl. 10 rollen — ongeveer 100 foto’s om te printen</div>`
              : '';
          return `
      <div class="shop-cart-item" data-sku="${i.sku}">
        <img src="${i.image}" alt="">
        <div>
          <div class="shop-cart-item__title">${i.qty}× ${i.title}</div>
          ${note}
          <div class="shop-cart-item__meta">${fmt(per)} / stuk</div>
          <div class="shop-cart-item__row">
            <div class="shop-qty">
              <button type="button" data-dec="${i.sku}" aria-label="Minder">−</button>
              <span>${i.qty}</span>
              <button type="button" data-inc="${i.sku}" aria-label="Meer">+</button>
            </div>
            <strong>${fmt(total)}</strong>
          </div>
        </div>
      </div>`;
        })
        .join('') + crossSell;

    if (totalEl) totalEl.textContent = fmt(cartTotal(items));
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  function goCheckout() {
    const items = readCart();
    if (!items.length) return;
    const total = cartTotal(items);
    const cams = cameraQty(items);
    const primarySlug = cams > 0 ? '1970cam' : items[0]?.sku || PAGE_SKU || '1970cam';
    const lander = PAGE_SKU === 'printer' ? 'portable-printer' : 'checkout';
    sessionStorage.setItem(
      'cam1970_checkout_cart',
      JSON.stringify({
        items: items.map((i) => ({
          sku: i.sku,
          qty: i.qty,
          title: i.title,
          unitPrice: i.sku === '1970cam' ? null : i.unitPrice || CATALOG[i.sku]?.unitPrice,
        })),
        qty: cams,
        cameras: cams,
        total,
        productSlug: primarySlug,
      })
    );
    const url = new URL('/pay', window.location.origin);
    url.searchParams.set('p', primarySlug);
    url.searchParams.set('c', 'nl');
    url.searchParams.set('l', lander);
    if (cams > 0) url.searchParams.set('qty', String(cams));
    window.location.href = url.pathname + url.search;
  }

  function bind() {
    renderThumbs();
    setMainImage(0);
    renderCart();
    updateStickyPrice();
    bindReviewList();

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

    document.getElementById('shop-atc')?.addEventListener('click', addSelectedToCart);
    document.getElementById('shop-atc-sticky')?.addEventListener('click', addSelectedToCart);

    document.getElementById('shop-cart-open')?.addEventListener('click', openDrawer);
    document.getElementById('shop-drawer-close')?.addEventListener('click', closeDrawer);
    document.getElementById('shop-drawer-backdrop')?.addEventListener('click', closeDrawer);
    document.getElementById('shop-drawer-checkout')?.addEventListener('click', goCheckout);

    document.getElementById('shop-drawer-body')?.addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      if (inc) {
        const sku = inc.dataset.inc;
        const row = readCart().find((i) => i.sku === sku);
        if (row) setQty(sku, row.qty + 1);
      }
      if (dec) {
        const sku = dec.dataset.dec;
        const row = readCart().find((i) => i.sku === sku);
        if (row) setQty(sku, row.qty - 1);
      }
    });

    document.getElementById('shop-burger')?.addEventListener('click', () => {
      document.getElementById('shop-mobile-nav')?.classList.add('is-open');
    });
    document.getElementById('shop-mobile-nav-close')?.addEventListener('click', () => {
      document.getElementById('shop-mobile-nav')?.classList.remove('is-open');
    });

    // Accordion: only one open at a time (Hears-style)
    document.getElementById('shop-acc')?.addEventListener('toggle', (e) => {
      const item = e.target;
      if (!(item instanceof HTMLDetailsElement) || !item.open) return;
      document.querySelectorAll('#shop-acc .shop-acc__item').forEach((el) => {
        if (el !== item) el.open = false;
      });
    }, true);

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
