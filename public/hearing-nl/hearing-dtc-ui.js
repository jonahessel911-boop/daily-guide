/**
 * HearFlex DTC checkout — UI components & interactions
 */
(function () {
  const cfg = () => window.HearingDTCConfig || {};
  const fmt = (n) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

  const ICONS = {
    trial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    warranty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M8 21h8"/></svg>',
    setup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    speed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    comfort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    easy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>',
    support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  };

  let selectedImage = 0;
  let orderBumpSelected = false;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function getTimerEnd() {
    const key = 'dtc_timer_end';
    let end = sessionStorage.getItem(key);
    if (!end) {
      end = String(Date.now() + 45 * 60 * 1000);
      sessionStorage.setItem(key, end);
    }
    return Number(end);
  }

  function startCountdown() {
    const hEl = document.getElementById('dtc-timer-h');
    const mEl = document.getElementById('dtc-timer-m');
    const sEl = document.getElementById('dtc-timer-s');
    if (!hEl || !mEl || !sEl) return;

    const tick = () => {
      const diff = Math.max(0, getTimerEnd() - Date.now());
      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      hEl.textContent = pad(h);
      mEl.textContent = pad(m);
      sEl.textContent = pad(s);
    };

    tick();
    setInterval(tick, 1000);
  }

  function renderProductGallery() {
    const images = cfg().productImages || [];
    if (!images.length) return '';

    const thumbs = images
      .map(
        (img, i) =>
          `<button type="button" class="dtc-gallery__thumb${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="Afbeelding ${i + 1}">
            <img src="${img.src}" alt="">
          </button>`
      )
      .join('');

    return `
      <section class="dtc-gallery" aria-label="Productafbeeldingen">
        <div class="dtc-gallery__main">
          <img id="dtc-gallery-main" src="${images[0].src}" alt="${images[0].alt}">
        </div>
        <div class="dtc-gallery__thumbs">${thumbs}</div>
      </section>`;
  }

  function renderProductSummary() {
    const p = cfg().product;
    return `
      <section class="dtc-summary">
        <h1 class="dtc-summary__title" id="checkout-product-name">${p.name}</h1>
        <div class="dtc-summary__rating">
          <span class="dtc-stars" aria-hidden="true">★★★★★</span>
          <span>${p.rating.toFixed(1).replace('.', ',')} (${p.reviewCount.toLocaleString('nl-NL')} beoordelingen)</span>
        </div>
        <div class="dtc-summary__price-row">
          <span class="dtc-summary__price" data-checkout-price>${fmt(p.price)}</span>
          <span class="dtc-summary__was">${fmt(p.originalPrice)}</span>
          <span class="dtc-summary__badge">Bespaar ${p.discountPercent}%</span>
        </div>
        <p class="dtc-summary__desc">${p.shortDescription}</p>
      </section>`;
  }

  function renderDiscountBox() {
    return `
      <section class="dtc-discount-box">
        <div class="dtc-discount-box__icon">${ICONS.shield}</div>
        <div>
          <h2 class="dtc-discount-box__title">Beperkte tijd: 50% KORTING</h2>
          <p class="dtc-discount-box__sub">100% tevredenheid of je geld terug</p>
        </div>
      </section>`;
  }

  function renderTrustIcons() {
    const items = cfg().trustIcons || [];
    return `
      <section class="dtc-trust-icons">
        ${items
          .map(
            (t) => `
          <div class="dtc-trust-icons__item">
            <div class="dtc-trust-icons__icon">${ICONS[t.icon] || ICONS.trial}</div>
            <span>${t.label}</span>
          </div>`
          )
          .join('')}
      </section>`;
  }

  function renderScarcityBox() {
    return `
      <section class="dtc-scarcity">
        <strong>LET OP:</strong> Door de tijdelijke korting is de vraag momenteel hoog. Kun je het product nog aan je winkelwagen toevoegen? Dan is er nog voorraad beschikbaar met korting.
      </section>`;
  }

  function renderReviews() {
    const reviews = cfg().reviews || [];
    const p = cfg().product;
    const cards = reviews
      .map(
        (r) => `
        <article class="dtc-review-card">
          <img class="dtc-review-card__img" src="${r.image}" alt="" loading="lazy">
          <div class="dtc-review-card__body">
            <div class="dtc-review-card__meta">
              <span class="dtc-review-card__name">${r.name}</span>
              <span class="dtc-review-card__flag">🇳🇱</span>
              <span class="dtc-review-card__verified" title="Geverifieerd">✓</span>
            </div>
            <div class="dtc-review-card__stars">★★★★★</div>
            <p class="dtc-review-card__text">${r.text}</p>
          </div>
        </article>`
      )
      .join('');

    return `
      <section class="dtc-section dtc-reviews">
        <h2 class="dtc-section__title">Wat onze klanten zeggen</h2>
        <div class="dtc-reviews__grid">${cards}</div>
        <p class="dtc-reviews__score">Trustscore <strong>${p.rating.toFixed(1).replace('.', ',')}</strong> · <strong>${p.reviewCount.toLocaleString('nl-NL')}</strong> beoordelingen</p>
      </section>`;
  }

  function renderBenefits() {
    const items = cfg().benefits || [];
    return `
      <section class="dtc-section dtc-benefits">
        <h2 class="dtc-section__title">Waarom klanten hiervoor kiezen</h2>
        <div class="dtc-benefits__grid">
          ${items
            .map(
              (b) => `
            <article class="dtc-benefit-card">
              <div class="dtc-benefit-card__icon">${ICONS[b.icon] || ICONS.easy}</div>
              <h3>${b.title}</h3>
              <p>${b.text}</p>
            </article>`
            )
            .join('')}
        </div>
      </section>`;
  }

  function renderPriceComparison() {
    const pc = cfg().priceComparison;
    if (!pc) return '';
    const extras = pc.traditional.extras
      .map((e) => `<li><span class="dtc-compare__strike">${e}</span></li>`)
      .join('');
    const highlights = pc.ours.highlights.map((h) => `<li>✓ ${h}</li>`).join('');

    return `
      <section class="dtc-section dtc-compare">
        <h2 class="dtc-section__title">Waarom deze prijs?</h2>
        <div class="dtc-compare__card dtc-compare__card--old">
          <h3>${pc.traditional.label}</h3>
          <p class="dtc-compare__price dtc-compare__price--high">${fmt(pc.traditional.price)}+</p>
          <ul>${extras}</ul>
        </div>
        <div class="dtc-compare__card dtc-compare__card--new">
          <h3>${pc.ours.label}</h3>
          <ul>${highlights}</ul>
        </div>
        <div class="dtc-compare__highlight">
          <span>Vandaag:</span>
          <strong data-checkout-price>${fmt(cfg().product.price)}</strong>
        </div>
      </section>`;
  }

  function renderResults() {
    const stats = cfg().resultStats || [];
    return `
      <section class="dtc-section dtc-results">
        <h2 class="dtc-section__title">Resultaten die voor zich spreken</h2>
        <div class="dtc-results__grid">
          ${stats
            .map(
              (s) => `
            <div class="dtc-result-card">
              <div class="dtc-result-card__ring" style="--pct:${s.value}">
                <span>${s.value}%</span>
              </div>
              <p>${s.label}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>`;
  }

  function renderHowItWorks() {
    const steps = cfg().howItWorks || [];
    return `
      <section class="dtc-section dtc-steps">
        <h2 class="dtc-section__title">Van doos tot gebruik in minder dan 2 minuten</h2>
        <div class="dtc-steps__list">
          ${steps
            .map(
              (s) => `
            <article class="dtc-step">
              <div class="dtc-step__num">${s.step}</div>
              <div>
                <h3>${s.title}</h3>
                <p>${s.text}</p>
              </div>
            </article>`
            )
            .join('')}
        </div>
      </section>`;
  }

  function renderGuarantee() {
    return `
      <section class="dtc-section dtc-guarantee">
        <div class="dtc-guarantee__badge">${ICONS.shield}</div>
        <h2 class="dtc-section__title">Een zorgeloze keuze met tevredenheidsgarantie</h2>
        <p>Probeer HearFlex™ 90 dagen thuis uit. Niet tevreden? Dan stuur je het terug en krijg je je volledige aankoopbedrag terug — zonder gedoe.</p>
        <p>Daarnaast ontvang je 1 jaar garantie op fabricagefouten, zodat je met een gerust hart kunt bestellen.</p>
      </section>`;
  }

  function renderFAQ() {
    const items = cfg().faqItems || [];
    return `
      <section class="dtc-section dtc-faq">
        <h2 class="dtc-section__title">Veelgestelde vragen</h2>
        <div class="dtc-faq__list">
          ${items
            .map(
              (item, i) => `
            <details class="dtc-faq__item">
              <summary class="dtc-faq__q">
                <span>${item.q}</span>
                <span class="dtc-faq__icon" aria-hidden="true"></span>
              </summary>
              <div class="dtc-faq__a"><p>${item.a}</p></div>
            </details>`
            )
            .join('')}
        </div>
      </section>`;
  }

  function renderFooter() {
    const f = cfg().footer || {};
    const links = (f.links || [])
      .map((l) => `<a href="${l.href}">${l.label}</a>`)
      .join(' · ');

    return `
      <footer class="dtc-footer">
        <h3>${f.supportTitle || 'Klantenservice'}</h3>
        <p><a href="mailto:${f.email}">${f.email}</a></p>
        <p>${f.location || 'Nederland'}</p>
        <nav class="dtc-footer__links">${links}</nav>
        <p class="dtc-footer__copy">© ${new Date().getFullYear()} HearFlex™. Alle rechten voorbehouden.</p>
      </footer>`;
  }

  function getTotal() {
    const p = cfg().product;
    let total = p.price;
    if (orderBumpSelected && cfg().orderBump?.enabled) {
      total += cfg().orderBump.price;
    }
    return total;
  }

  function updateOrderSummary() {
    const p = cfg().product;
    const discount = p.originalPrice - p.price;
    const total = getTotal();

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    set('dtc-sum-product', p.name);
    set('dtc-sum-subtotal', fmt(p.originalPrice));
    set('dtc-sum-discount', `-${fmt(discount)}`);
    set('dtc-sum-shipping', p.shippingLabel || 'Gratis');
    set('dtc-sum-total', fmt(total));

    document.querySelectorAll('[data-checkout-price]').forEach((el) => {
      el.textContent = fmt(total);
    });

    const bumpRow = document.getElementById('dtc-sum-bump-row');
    if (bumpRow) {
      bumpRow.hidden = !orderBumpSelected;
      if (orderBumpSelected) {
        set('dtc-sum-bump', fmt(cfg().orderBump.price));
      }
    }
  }

  function initGallery() {
    const main = document.getElementById('dtc-gallery-main');
    const images = cfg().productImages || [];
    if (!main) return;

    document.querySelectorAll('.dtc-gallery__thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index);
        selectedImage = i;
        main.src = images[i].src;
        main.alt = images[i].alt;
        document.querySelectorAll('.dtc-gallery__thumb').forEach((t) => {
          t.classList.toggle('is-active', Number(t.dataset.index) === i);
        });
      });
    });
  }

  function initOrderBump() {
    const bump = cfg().orderBump;
    const wrap = document.getElementById('dtc-order-bump');
    if (!bump?.enabled || !wrap) return;

    wrap.innerHTML = `
      <label class="dtc-order-bump">
        <input type="checkbox" id="order-bump" name="order-bump">
        <div class="dtc-order-bump__content">
          <span class="dtc-order-bump__badge">${bump.badge}</span>
          <strong class="dtc-order-bump__title">${bump.title}</strong>
          <span class="dtc-order-bump__price">+ ${fmt(bump.price)}</span>
          <p class="dtc-order-bump__desc">${bump.description}</p>
        </div>
      </label>`;

    document.getElementById('order-bump')?.addEventListener('change', (e) => {
      orderBumpSelected = e.target.checked;
      updateOrderSummary();
    });
  }

  function initMobileCta() {
    const cta = document.getElementById('dtc-mobile-cta');
    if (!cta) return;
    cta.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        e.preventDefault();
        document.getElementById('dtc-checkout-card')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function renderLeftColumn() {
    const el = document.getElementById('dtc-col-left');
    if (!el) return;
    el.innerHTML =
      renderProductGallery() +
      renderProductSummary() +
      renderDiscountBox() +
      renderTrustIcons() +
      renderScarcityBox();
  }

  function renderBelowCheckout() {
    const el = document.getElementById('dtc-col-below');
    if (!el) return;
    el.innerHTML =
      renderReviews() +
      renderBenefits() +
      renderPriceComparison() +
      renderResults() +
      renderHowItWorks() +
      renderGuarantee() +
      renderFAQ();
  }

  function renderFooterEl() {
    const el = document.getElementById('dtc-footer');
    if (el) el.innerHTML = renderFooter();
  }

  function init() {
    renderLeftColumn();
    renderBelowCheckout();
    renderFooterEl();
    initGallery();
    initOrderBump();
    initMobileCta();
    startCountdown();
    updateOrderSummary();
  }

  window.HearingDTC = {
    getTotal,
    getOrderBumpSelected: () => orderBumpSelected,
    updateOrderSummary,
    formatPrice: fmt,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
