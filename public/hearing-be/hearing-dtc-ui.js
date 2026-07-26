/**
 * HearDirect DTC checkout — UI components & interactions
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
        <div class="dtc-gallery__stage">
          <div class="dtc-gallery__badges">
            <span class="dtc-gallery__pill dtc-gallery__pill--dark">Probeer 90 dagen gratis</span>
            <span class="dtc-gallery__pill dtc-gallery__pill--accent">Meest verkocht</span>
          </div>
          <div class="dtc-gallery__main">
            <img id="dtc-gallery-main" src="${images[0].src}" alt="${images[0].alt}">
          </div>
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
          <a href="#written-reviews" class="dtc-summary__rating-link">${p.rating.toFixed(1).replace('.', ',')} (${p.reviewCount.toLocaleString('nl-NL')} reviews)</a>
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
    const pct = cfg().product?.discountPercent || 45;
    return `
      <section class="dtc-discount-box">
        <div class="dtc-discount-box__icon">${ICONS.shield}</div>
        <div>
          <h2 class="dtc-discount-box__title">Beperkte tijd: ${pct}% KORTING</h2>
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

  const REVIEW_PAGE = 3;
  let reviewVisible = REVIEW_PAGE;
  let reviewSort = 'recent';

  function getSortedReviews() {
    const list = [...(cfg().reviews || [])];
    if (reviewSort === 'helpful') {
      list.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    }
    return list;
  }

  function reviewCardHtml(r) {
    const long = (r.text || '').length > 140;
    const productImg =
      cfg().productImages?.[0]?.src || '/hearing-nl/assets/product/heardirect-open-case.webp';
    return `
      <article class="hd-rcard">
        <div class="hd-rcard__top">
          <span class="hd-rcard__name">${r.name}</span>
          <span class="hd-rcard__verified">Geverifieerde koper</span>
        </div>
        <div class="hd-rcard__product">
          <img src="${productImg}" alt="HearDirect™">
          <div>
            <div class="hd-rcard__product-label">Review over</div>
            <div class="hd-rcard__product-name">HearDirect™</div>
            <div class="hd-rcard__product-meta">Comfortabele hoortoestellen</div>
          </div>
        </div>
        <div class="hd-rcard__rating">
          <span class="hd-rcard__stars" aria-hidden="true">★★★★★</span>
          <span class="hd-rcard__when">${r.when || ''}</span>
        </div>
        <h3 class="hd-rcard__title">${r.title || 'Review'}</h3>
        <p class="hd-rcard__text${long ? ' is-clamp' : ''}">${r.text}</p>
        ${long ? `<button type="button" class="hd-rcard__more" data-expand>Lees meer</button>` : ''}
        <div class="hd-rcard__foot">
          <span>Was dit behulpzaam?</span>
          <button type="button" class="hd-rcard__vote" data-up aria-label="Behulpzaam">👍 <span>${r.helpful || 0}</span></button>
          <button type="button" class="hd-rcard__vote" data-down aria-label="Niet behulpzaam">👎 <span>0</span></button>
        </div>
      </article>`;
  }

  function renderReviewListCards() {
    const box = document.getElementById('hd-review-cards');
    const moreBtn = document.getElementById('hd-review-more');
    const countEl = document.getElementById('hd-review-count');
    if (!box) return;
    const all = getSortedReviews();
    const total = cfg().product?.reviewCount || all.length;
    if (countEl) countEl.textContent = String(total);
    box.innerHTML = all.slice(0, reviewVisible).map(reviewCardHtml).join('');
    if (moreBtn) moreBtn.hidden = reviewVisible >= all.length;
  }

  function bindReviewList() {
    renderReviewListCards();

    document.getElementById('hd-review-more')?.addEventListener('click', () => {
      reviewVisible += REVIEW_PAGE;
      renderReviewListCards();
    });

    document.getElementById('hd-review-sort')?.addEventListener('change', (e) => {
      reviewSort = e.target.value;
      reviewVisible = REVIEW_PAGE;
      renderReviewListCards();
    });

    document.getElementById('hd-review-cards')?.addEventListener('click', (e) => {
      const expand = e.target.closest('[data-expand]');
      if (expand) {
        const card = expand.closest('.hd-rcard');
        const text = card?.querySelector('.hd-rcard__text');
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

  function renderReviews() {
    const reviews = cfg().reviews || [];
    if (!reviews.length) {
      return `<section class="dtc-section dtc-reviews dtc-reviews--empty" hidden aria-hidden="true"></section>`;
    }

    return `
      <section class="dtc-section hd-reviewlist" id="written-reviews">
        <div class="hd-reviewlist__toolbar">
          <p class="hd-reviewlist__count"><strong id="hd-review-count">${cfg().product?.reviewCount || reviews.length}</strong> reviews</p>
          <label class="hd-reviewlist__sort">
            Sorteren
            <select id="hd-review-sort" aria-label="Sorteer reviews">
              <option value="recent">Meest recent</option>
              <option value="helpful">Meest behulpzaam</option>
            </select>
          </label>
        </div>
        <div class="hd-reviewlist__cards" id="hd-review-cards"></div>
        <button type="button" class="hd-reviewlist__more" id="hd-review-more">Meer laden</button>
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
    const payUrl = document.body.dataset.payUrl || 'pay.html';
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
        <a href="${payUrl}" class="dtc-compare__highlight dtc-cta-pulse">
          <span>Bestel nu — Vandaag:</span>
          <strong data-checkout-price>${fmt(cfg().product.price)}</strong>
        </a>
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
        <p>Probeer HearDirect™ 90 dagen thuis uit. Niet tevreden? Dan stuur je het terug en krijg je je volledige aankoopbedrag terug — zonder gedoe.</p>
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
        <a href="#" class="dtc-footer__logo hd-logo" aria-label="HearDirect">
          <img src="${cfg().brand?.logo || '/hearing/assets/heardirect-logo.png'}" alt="HearDirect" width="140" height="56" decoding="async">
        </a>
        <h3>${f.supportTitle || 'Klantenservice'}</h3>
        <p><a href="mailto:${f.email}">${f.email}</a></p>
        <p>${f.location || 'België'}</p>
        <nav class="dtc-footer__links">${links}</nav>
        <p class="dtc-footer__copy">© ${new Date().getFullYear()} HearDirect™. Alle rechten voorbehouden.</p>
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
    if (!bump?.enabled || !wrap) {
      if (wrap) wrap.innerHTML = '';
      return;
    }

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
    /* pre-checkout: links navigate to pay.html directly */
  }

  function initPrePage() {
    const payUrl = document.body.dataset.payUrl || 'pay.html';
    const left = document.getElementById('dtc-col-left');
    const right = document.getElementById('dtc-col-right');
    if (left) left.innerHTML = renderPreLeftColumn();
    if (right) right.innerHTML = renderPreRightColumn(payUrl);
    renderBelowCheckout();
    renderFooterEl();
    initGallery();
    updateOrderSummary();
  }

  function renderOfferSets() {
    return `
      <div class="hd-offers" role="group" aria-label="Kies je set">
        <button type="button" class="hd-offer is-selected" data-hd-offer="single" aria-pressed="true">
          <div class="hd-offer__info">
            <div class="hd-offer__title">1 Set</div>
            <div class="hd-offer__meta">HearDirect™ — oplaadcase inclusief</div>
          </div>
          <div class="hd-offer__price">
            <span class="hd-offer__was">${fmt(179)}</span>
            <span class="hd-offer__now">${fmt(99)}</span>
          </div>
        </button>
        <button type="button" class="hd-offer" data-hd-offer="duo" aria-pressed="false">
          <span class="hd-offer__badge">Beste deal</span>
          <div class="hd-offer__info">
            <div class="hd-offer__title">2 Sets</div>
            <div class="hd-offer__meta">${fmt(89.99)} / set · totaal ${fmt(179.98)}</div>
          </div>
          <div class="hd-offer__price">
            <span class="hd-offer__was">${fmt(358)}</span>
            <span class="hd-offer__now">${fmt(179.98)}</span>
          </div>
        </button>
      </div>`;
  }

  function renderMainCta(payUrl) {
    return `
      <button type="button" class="dtc-main-cta" data-hd-atc>
        <span class="dtc-main-cta__title">Voeg toe aan winkelwagen</span>
      </button>
      <p class="dtc-guarantee-line"><span aria-hidden="true">🛡</span> 90 dagen niet goed, geld terug</p>
      <p class="dtc-shipping-promise">Bestel vandaag, ontvang binnen 2–5 werkdagen</p>`;
  }

  function renderDeliveryBanner() {
    return `
      <div class="dtc-delivery-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
        <span>Meer dan 10.000 producten geleverd · Tevreden klanten en betrouwbare klantenservice</span>
      </div>`;
  }

  function renderPaySidebar() {
    return `
      <div class="dtc-pay-guarantee-seal">
        NIET TEVREDEN?<br>
        <strong>90 DAGEN</strong>
        GELD TERUG GARANTIE
      </div>`;
  }

  function initStockCount() {
    const el = document.getElementById('dtc-stock-count');
    if (!el) return;
    const key = 'dtc_stock_count';
    let n = sessionStorage.getItem(key);
    if (!n) {
      n = String(30 + Math.floor(Math.random() * 12));
      sessionStorage.setItem(key, n);
    }
    el.textContent = n;
  }

  function syncPayTotals() {
    const p = cfg().product;
    let qty = 1;
    try {
      const cart = JSON.parse(sessionStorage.getItem('hearing_checkout_cart') || '{}');
      if (cart.qty) qty = Math.max(1, parseInt(cart.qty, 10) || 1);
      if (Array.isArray(cart.items) && cart.items.length) {
        qty = cart.items.reduce((s, i) => s + (i.qty || 0), 0) || qty;
      }
    } catch (_) {
      /* ignore */
    }
    const qtyParam = new URLSearchParams(window.location.search).get('qty');
    if (qtyParam) qty = Math.max(1, parseInt(qtyParam, 10) || qty);

    const total =
      typeof window.HearingCart?.priceForQty === 'function'
        ? window.HearingCart.priceForQty(qty)
        : (() => {
            const duos = Math.floor(qty / 2);
            const singles = qty % 2;
            return duos * 89.99 * 2 + singles * (p.price || 99);
          })();
    const was = (p.originalPrice || p.price) * qty;
    const per = total / qty;
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const offerLabel = `${qty}× HearDirect™`;
    const offerNameEl = document.querySelector('.dtc-offer-card__name');
    if (offerNameEl) offerNameEl.textContent = offerLabel;
    const payProductEl = document.getElementById('dtc-pay-product-label');
    if (payProductEl) payProductEl.textContent = offerLabel;

    set('dtc-offer-was', fmt(was));
    set('dtc-offer-now', fmt(total));
    set('dtc-offer-badge', `${fmt(per)} / stuk`);
    set('dtc-pay-was', fmt(was));
    set('dtc-pay-now', fmt(total));
    set('dtc-sum-total', fmt(total));
    document.querySelectorAll('[data-checkout-price]').forEach((el) => {
      el.textContent = fmt(total);
    });
  }

  function initPayPage() {
    const img = cfg().productImages?.[0];
    if (img) {
      const offerImg = document.getElementById('dtc-offer-img');
      if (offerImg) {
        offerImg.src = img.src;
        offerImg.alt = img.alt;
      }
    }

    syncPayTotals();

    const sidebar = document.getElementById('dtc-pay-sidebar');
    if (sidebar) sidebar.innerHTML = renderPaySidebar();

    initStockCount();
  }

  function renderBuyCopy() {
    return `
      <div class="dtc-buy-copy">
        <h2>Hoor weer duidelijk — zonder gedoe</h2>
        <p>
          Discreet, lichtgewicht en klaar in een paar minuten. HearDirect™ versterkt spraak,
          dempt storend achtergrondgeluid en zit comfortabel genoeg voor de hele dag.
        </p>
        <p>
          90 dagen thuis proberen. Niet tevreden? Geld terug. Geen audicien-afspraak, geen verrassingen.
        </p>
      </div>`;
  }

  function renderBuyAccordion() {
    return `
      <div class="dtc-buy-acc" id="dtc-buy-acc">
        <details class="dtc-buy-acc__item">
          <summary>
            <span class="dtc-buy-acc__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 4h8a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2z"/><path d="M10 9h4M10 13h4"/></svg>
            </span>
            <span class="dtc-buy-acc__label">Details &amp; inhoud</span>
            <span class="dtc-buy-acc__chev" aria-hidden="true"></span>
          </summary>
          <div class="dtc-buy-acc__body">
            <p class="dtc-buy-acc__lead"><strong>Comfortabele digitale hoortoestellen voor thuisgebruik.</strong></p>
            <ul class="dtc-buy-acc__specs">
              <li><strong>Inhoud:</strong> HearDirect™ hoortoestellen, oplaadcase, USB-kabel, reinigingsborstel, 3 paar oordopjes, handleiding</li>
              <li><strong>Setup:</strong> Klaar in ±2 minuten — geen app of afspraak nodig</li>
              <li><strong>Draagcomfort:</strong> Discreet &amp; lichtgewicht, hele dag te dragen</li>
              <li><strong>Geluid:</strong> Spraakversterking met demping van achtergrondgeluid</li>
              <li><strong>Garantie:</strong> 1 jaar + 90 dagen geld-terug</li>
              <li><strong>Oplaadbaar:</strong> Geen wegwerpbatterijen</li>
            </ul>
          </div>
        </details>

        <details class="dtc-buy-acc__item">
          <summary>
            <span class="dtc-buy-acc__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h18l-1.5 11H4.5L3 8z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>
            </span>
            <span class="dtc-buy-acc__label">Verzending &amp; retour</span>
            <span class="dtc-buy-acc__chev" aria-hidden="true"></span>
          </summary>
          <div class="dtc-buy-acc__body">
            <p><strong>Gratis verzending in BE.</strong></p>
            <p>Reken op de volgende levertijden:</p>
            <ul class="dtc-buy-acc__specs">
              <li><strong>Standaard:</strong> 2–5 werkdagen · gratis</li>
              <li><strong>Track &amp; trace:</strong> altijd inbegrepen</li>
            </ul>
            <p><strong>Retourneren</strong></p>
            <p>90 dagen proberen — ook na gebruik. Niet tevreden? Geld terug.</p>
            <p>Start een retour via <a href="mailto:support@heardirect.nl">support@heardirect.nl</a>.</p>
          </div>
        </details>

        <details class="dtc-buy-acc__item">
          <summary>
            <span class="dtc-buy-acc__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </span>
            <span class="dtc-buy-acc__label">Betaalmethoden</span>
            <span class="dtc-buy-acc__chev" aria-hidden="true"></span>
          </summary>
          <div class="dtc-buy-acc__body dtc-buy-acc__body--payments">
            <div class="dtc-buy-pay-logos" aria-label="Beschikbare betaalmethoden">
              <span class="dtc-buy-pay-logos__bancontact">Bancontact</span>
              <img src="/assets/payment/klarna.png" alt="Klarna" width="160" height="80" loading="lazy">
            </div>
          </div>
        </details>
      </div>`;
  }

  function renderPreRightColumn(payUrl) {
    return (
      renderProductSummary() +
      renderOfferSets() +
      renderMainCta(payUrl) +
      renderBuyCopy() +
      renderBuyAccordion() +
      renderTrustIcons() +
      renderScarcityBox()
    );
  }

  function renderPreLeftColumn() {
    return renderProductGallery() + renderDeliveryBanner();
  }

  function renderBelowCheckout() {
    const el = document.getElementById('dtc-col-below');
    if (!el) return;
    el.innerHTML =
      renderBenefits() +
      renderPriceComparison() +
      renderResults() +
      renderHowItWorks() +
      renderGuarantee() +
      renderFAQ() +
      renderReviews();
    bindReviewList();
  }

  function renderFooterEl() {
    const el = document.getElementById('dtc-footer');
    if (el) el.innerHTML = renderFooter();
  }

  function init() {
    if (document.body.classList.contains('dtc-pre')) {
      initPrePage();
      return;
    }
    if (document.body.classList.contains('dtc-pay')) {
      initPayPage();
      return;
    }
    const left = document.getElementById('dtc-col-left');
    if (left) {
      left.innerHTML =
        renderProductGallery() +
        renderProductSummary() +
        renderDiscountBox() +
        renderTrustIcons() +
        renderScarcityBox();
    }
    renderBelowCheckout();
    renderFooterEl();
    initGallery();
    initOrderBump();
    updateOrderSummary();
  }

  window.HearingDTC = {
    getTotal,
    getOrderBumpSelected: () => orderBumpSelected,
    updateOrderSummary,
    syncPayTotals,
    formatPrice: fmt,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
