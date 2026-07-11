/**
 * HearDirect DTC checkout — UI components & interactions
 */
(function () {
  const cfg = () => window.HearingDTCConfig || {};
  const brandName = () => cfg().brand?.name || 'HearDirect™';
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
    retro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M8 6V4h8v2"/></svg>',
    photos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 16l-5-5L5 18"/></svg>',
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 11v2M10 11v2"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5"/></svg>',
    moment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2"/></svg>',
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
        <button type="button" class="dtc-gallery__main" id="dtc-gallery-main-btn" aria-label="Vergroot productafbeelding">
          <img id="dtc-gallery-main" src="${images[0].src}" alt="${images[0].alt}">
        </button>
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

  function renderReviewCard(r) {
    const avatar = r.avatar || r.image;
    if (r.avatar) {
      return `
        <article class="dtc-review-card dtc-review-card--avatar">
          <div class="dtc-review-card__head">
            <img class="dtc-review-card__avatar" src="${avatar}" alt="" loading="lazy">
            <div class="dtc-review-card__head-text">
              <div class="dtc-review-card__meta">
                <span class="dtc-review-card__name">${r.name}</span>
                <span class="dtc-review-card__flag">🇳🇱</span>
                <span class="dtc-review-card__verified" title="Geverifieerd">✓</span>
              </div>
              <div class="dtc-review-card__stars">★★★★★</div>
            </div>
          </div>
          <p class="dtc-review-card__text">${r.text}</p>
        </article>`;
    }

    return `
        <article class="dtc-review-card">
          <img class="dtc-review-card__img" src="${avatar}" alt="" loading="lazy">
          <div class="dtc-review-card__body">
            <div class="dtc-review-card__meta">
              <span class="dtc-review-card__name">${r.name}</span>
              <span class="dtc-review-card__flag">🇳🇱</span>
              <span class="dtc-review-card__verified" title="Geverifieerd">✓</span>
            </div>
            <div class="dtc-review-card__stars">★★★★★</div>
            <p class="dtc-review-card__text">${r.text}</p>
          </div>
        </article>`;
  }

  function renderReviews() {
    const reviews = cfg().reviews || [];
    const p = cfg().product;
    const cards = reviews.map((r) => renderReviewCard(r)).join('');

    return `
      <section class="dtc-section dtc-reviews">
        ${cfg().reviewBanner ? `<figure class="dtc-reviews__banner"><img src="${cfg().reviewBanner}" alt="HearDirect™ hoortoestel — discreet en compact op uw vinger" width="720" height="720" loading="lazy"></figure>` : ''}
        <h2 class="dtc-section__title">Wat onze klanten zeggen</h2>
        <div class="dtc-reviews__grid">${cards}</div>
        <p class="dtc-reviews__score">Trustscore <strong>${p.rating.toFixed(1).replace('.', ',')}</strong> · <strong>${p.reviewCount.toLocaleString('nl-NL')}</strong> beoordelingen</p>
      </section>`;
  }

  function renderFilmLookSlider() {
    const slider = cfg().filmLookSlider;
    if (!slider?.slides?.length) return '';

    const slides = slider.slides
      .map(
        (s, i) => `
        <figure class="dtc-film-slider__slide" data-slide="${i}">
          <img src="${s.src}" alt="${s.alt || ''}" loading="lazy" draggable="false">
          <figcaption class="dtc-film-slider__caption">${s.caption || ''}</figcaption>
        </figure>`
      )
      .join('');

    return `
      <section class="dtc-section dtc-film-slider" id="dtc-film-slider">
        <h2 class="dtc-section__title">${slider.title}</h2>
        <p class="dtc-film-slider__intro">${slider.intro}</p>
        <div class="dtc-film-slider__track-wrap">
          <div class="dtc-film-slider__track" id="dtc-film-slider-track">${slides}</div>
        </div>
        <div class="dtc-film-slider__dots" id="dtc-film-slider-dots" aria-hidden="true"></div>
        ${slider.footer ? `<p class="dtc-film-slider__footer">${slider.footer}</p>` : ''}
      </section>`;
  }

  function renderSocialFeed() {
    const feed = cfg().socialFeed;
    if (!feed?.image) return '';

    return `
      <div class="dtc-social-feed">
        <h3 class="dtc-social-feed__title">${feed.title}</h3>
        <p class="dtc-social-feed__body">${feed.body}</p>
        <figure class="dtc-social-feed__visual">
          <img src="${feed.image}" alt="${feed.imageAlt || feed.title}" loading="lazy">
        </figure>
        ${feed.cta ? `<p class="dtc-social-feed__cta">${feed.cta}</p>` : ''}
      </div>`;
  }

  function renderBenefitCard(b) {
    return `
            <article class="dtc-benefit-card">
              <div class="dtc-benefit-card__icon">${ICONS[b.icon] || ICONS.easy}</div>
              <h3>${b.title}</h3>
              <p>${b.text}</p>
            </article>`;
  }

  function renderBenefitsList() {
    const list = cfg().benefitsList;
    if (!list?.length) return '';

    const rows = list
      .map(
        (item, i) =>
          `<li class="dtc-benefits-list__item" style="--i:${i}"><span class="dtc-benefits-list__icon" aria-hidden="true">✓</span><span class="dtc-benefits-list__text">${item}</span></li>`
      )
      .join('');

    return `
      <div class="dtc-benefits-list" data-benefits-reveal>
        <ul>${rows}</ul>
      </div>`;
  }

  function renderBenefits() {
    const list = cfg().benefitsList;
    const visual = cfg().benefitsVisual;
    const items = cfg().benefits || [];
    const social = cfg().socialFeed;
    const splitTitle = social?.insertAfterBenefit;
    const splitIdx = splitTitle ? items.findIndex((b) => b.title === splitTitle) : -1;

    let contentHtml = '';
    if (list?.length) {
      contentHtml = renderBenefitsList();
      if (social) contentHtml += renderSocialFeed();
    } else if (visual?.src) {
      contentHtml = `
        <figure class="dtc-benefits__visual">
          <img src="${visual.src}" alt="${visual.alt || ''}" loading="lazy">
        </figure>`;
      if (social) contentHtml += renderSocialFeed();
    } else if (splitIdx >= 0) {
      contentHtml =
        items.slice(0, splitIdx + 1).map((b) => renderBenefitCard(b)).join('') +
        renderSocialFeed() +
        items.slice(splitIdx + 1).map((b) => renderBenefitCard(b)).join('');
    } else {
      contentHtml = items.map((b) => renderBenefitCard(b)).join('');
    }

    if (!list?.length && !visual?.src && !items.length) return '';

    return `
      <section class="dtc-section dtc-benefits${list?.length ? ' dtc-benefits--list' : ''}">
        <h2 class="dtc-section__title">${cfg().benefitsTitle || 'Waarom klanten hiervoor kiezen'}</h2>
        <div class="dtc-benefits__grid${list?.length || visual?.src ? ' dtc-benefits__grid--visual' : ''}">
          ${contentHtml}
        </div>
      </section>`;
  }

  function renderComparisonTable() {
    const table = cfg().comparisonTable;
    if (!table?.left?.items?.length || !table?.right?.items?.length) return '';

    const payUrl = document.body.dataset.payUrl || 'pay.html';
    const renderCol = (col, variant) => {
      const icon = variant === 'highlight' ? '✓' : '✗';
      const iconClass =
        variant === 'highlight'
          ? 'dtc-compare-table__icon dtc-compare-table__icon--yes'
          : 'dtc-compare-table__icon dtc-compare-table__icon--no';
      const rows = col.items
        .map(
          (item) =>
            `<li><span class="${iconClass}" aria-hidden="true">${icon}</span><span>${item}</span></li>`
        )
        .join('');

      return `
        <div class="dtc-compare-table__col dtc-compare-table__col--${variant}">
          <h3>${col.label}</h3>
          <ul>${rows}</ul>
        </div>`;
    };

    return `
      <section class="dtc-section dtc-compare-table">
        <h2 class="dtc-section__title">${table.title || 'Waarom deze prijs?'}</h2>
        <div class="dtc-compare-table__grid">
          ${renderCol(table.left, 'muted')}
          ${renderCol(table.right, 'highlight')}
        </div>
        <a href="${payUrl}" class="dtc-compare__highlight dtc-cta-pulse">
          <span>Bestel nu — Vandaag:</span>
          <strong data-checkout-price>${fmt(cfg().product.price)}</strong>
        </a>
      </section>`;
  }

  function renderPriceComparison() {
    const tableHtml = renderComparisonTable();
    if (tableHtml) return tableHtml;

    const visual = cfg().comparisonVisual;
    if (visual?.image) {
      const payUrl = document.body.dataset.payUrl || 'pay.html';
      return `
      <section class="dtc-section dtc-compare-visual">
        <h2 class="dtc-section__title">${visual.title || 'DispoCam vs. concurrentie'}</h2>
        <figure class="dtc-compare-visual__figure">
          <img src="${visual.image}" alt="${visual.imageAlt || visual.title || ''}" loading="lazy">
        </figure>
        <a href="${payUrl}" class="dtc-compare__highlight dtc-cta-pulse">
          <span>Bestel nu — Vandaag:</span>
          <strong data-checkout-price>${fmt(cfg().product.price)}</strong>
        </a>
      </section>`;
    }

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
    if (!stats.length) return '';
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
    const visual = cfg().howItWorksVisual;
    if (visual?.image) {
      const steps = (visual.steps || [])
        .map(
          (s) => `
            <article class="dtc-hiw-step">
              <span class="dtc-hiw-step__num">${s.step}</span>
              <div class="dtc-hiw-step__body">
                <h3>${s.title}</h3>
                <p>${s.text}</p>
              </div>
            </article>`
        )
        .join('');

      return `
      <section class="dtc-section dtc-hiw">
        <h2 class="dtc-section__title">${visual.title || 'Hoe werkt het'}</h2>
        ${visual.intro ? `<p class="dtc-hiw__intro">${visual.intro}</p>` : ''}
        <div class="dtc-hiw__layout">
          <div class="dtc-hiw__steps">${steps}</div>
          <figure class="dtc-hiw__visual">
            <img src="${visual.image}" alt="${visual.imageAlt || visual.title || ''}" loading="lazy">
          </figure>
        </div>
        ${visual.tagline ? `<p class="dtc-hiw__tagline">${visual.tagline}</p>` : ''}
      </section>`;
    }

    const steps = cfg().howItWorks || [];
    if (!steps.length) return '';

    return `
      <section class="dtc-section dtc-steps">
        <h2 class="dtc-section__title">${cfg().howItWorksTitle || 'Van doos tot gebruik in minder dan 2 minuten'}</h2>
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
        <p>Probeer ${brandName()} ${cfg().guaranteeDays || 90} dagen thuis uit. Niet tevreden? Dan stuur je het terug en krijg je je volledige aankoopbedrag terug — zonder gedoe.</p>
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
        <p class="dtc-footer__copy">© ${new Date().getFullYear()} ${brandName()}. Alle rechten voorbehouden.</p>
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

  function setGalleryImage(i) {
    const images = cfg().productImages || [];
    const main = document.getElementById('dtc-gallery-main');
    if (!main || !images[i]) return;

    selectedImage = i;
    main.src = images[i].src;
    main.alt = images[i].alt;
    document.querySelectorAll('.dtc-gallery__thumb').forEach((t) => {
      t.classList.toggle('is-active', Number(t.dataset.index) === i);
    });
  }

  function renderGalleryLightbox() {
    if (document.getElementById('dtc-gallery-lightbox')) return;

    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <div class="dtc-gallery-lightbox" id="dtc-gallery-lightbox" hidden aria-hidden="true">
        <div class="dtc-gallery-lightbox__backdrop" data-lightbox-close></div>
        <button type="button" class="dtc-gallery-lightbox__close" data-lightbox-close aria-label="Sluiten">×</button>
        <button type="button" class="dtc-gallery-lightbox__nav dtc-gallery-lightbox__nav--prev" aria-label="Vorige foto">‹</button>
        <div class="dtc-gallery-lightbox__stage" id="dtc-gallery-lightbox-stage">
          <img class="dtc-gallery-lightbox__img" id="dtc-gallery-lightbox-img" src="" alt="">
        </div>
        <button type="button" class="dtc-gallery-lightbox__nav dtc-gallery-lightbox__nav--next" aria-label="Volgende foto">›</button>
        <p class="dtc-gallery-lightbox__counter" id="dtc-gallery-lightbox-counter" aria-live="polite"></p>
      </div>`
    );
  }

  function updateGalleryLightbox() {
    const images = cfg().productImages || [];
    const lightbox = document.getElementById('dtc-gallery-lightbox');
    const img = document.getElementById('dtc-gallery-lightbox-img');
    const counter = document.getElementById('dtc-gallery-lightbox-counter');
    if (!lightbox || !img || !images.length) return;

    const current = images[selectedImage];
    img.src = current.src;
    img.alt = current.alt;
    if (counter) counter.textContent = `${selectedImage + 1} / ${images.length}`;
  }

  function openGalleryLightbox() {
    const images = cfg().productImages || [];
    const lightbox = document.getElementById('dtc-gallery-lightbox');
    if (!lightbox || !images.length) return;

    updateGalleryLightbox();
    lightbox.hidden = false;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dtc-gallery-lightbox-open');
    lightbox.querySelector('.dtc-gallery-lightbox__close')?.focus();
  }

  function closeGalleryLightbox() {
    const lightbox = document.getElementById('dtc-gallery-lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('is-open');
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('dtc-gallery-lightbox-open');
    document.getElementById('dtc-gallery-main-btn')?.focus();
  }

  function stepGalleryLightbox(delta) {
    const images = cfg().productImages || [];
    if (!images.length) return;

    const next = (selectedImage + delta + images.length) % images.length;
    setGalleryImage(next);
    updateGalleryLightbox();
  }

  function initGalleryLightboxSwipe() {
    const stage = document.getElementById('dtc-gallery-lightbox-stage');
    if (!stage || stage.dataset.swipeInit) return;
    stage.dataset.swipeInit = '1';

    let startX = 0;
    let startY = 0;
    let tracking = false;

    stage.addEventListener(
      'touchstart',
      (e) => {
        if (!e.touches.length) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    stage.addEventListener(
      'touchend',
      (e) => {
        if (!tracking || !e.changedTouches.length) return;
        tracking = false;

        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;

        stepGalleryLightbox(dx < 0 ? 1 : -1);
      },
      { passive: true }
    );

    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      startX = e.clientX;
      startY = e.clientY;
      tracking = true;
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointerup', (e) => {
      if (!tracking || e.pointerType === 'touch') return;
      tracking = false;
      if (stage.hasPointerCapture(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId);
      }

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;

      stepGalleryLightbox(dx < 0 ? 1 : -1);
    });

    stage.addEventListener('pointercancel', () => {
      tracking = false;
    });
  }

  function initGallery() {
    const images = cfg().productImages || [];
    const mainBtn = document.getElementById('dtc-gallery-main-btn');
    if (!mainBtn || !images.length) return;

    renderGalleryLightbox();
    initGalleryLightboxSwipe();

    const lightbox = document.getElementById('dtc-gallery-lightbox');
    lightbox?.querySelectorAll('[data-lightbox-close]').forEach((el) => {
      el.addEventListener('click', closeGalleryLightbox);
    });
    lightbox?.querySelector('.dtc-gallery-lightbox__nav--prev')?.addEventListener('click', () => {
      stepGalleryLightbox(-1);
    });
    lightbox?.querySelector('.dtc-gallery-lightbox__nav--next')?.addEventListener('click', () => {
      stepGalleryLightbox(1);
    });

    mainBtn.addEventListener('click', openGalleryLightbox);

    document.querySelectorAll('.dtc-gallery__thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        setGalleryImage(Number(btn.dataset.index));
        if (lightbox?.classList.contains('is-open')) updateGalleryLightbox();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox?.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeGalleryLightbox();
      if (e.key === 'ArrowLeft') stepGalleryLightbox(-1);
      if (e.key === 'ArrowRight') stepGalleryLightbox(1);
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
    initFilmSlider();
    initBenefitsListReveal();
    updateOrderSummary();
  }

  function initBenefitsListReveal() {
    const lists = document.querySelectorAll('[data-benefits-reveal]');
    if (!lists.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      lists.forEach((list) => list.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    lists.forEach((list) => observer.observe(list));
  }

  function renderMainCta(payUrl) {
    return `
      <a href="${payUrl}" class="dtc-main-cta dtc-cta-pulse">
        <span class="dtc-main-cta__title">Beperkte tijd: 50% KORTING</span>
        <span class="dtc-main-cta__sub">${ICONS.shield.replace('stroke="currentColor"', 'stroke="#fff" width="16" height="16"')} 100% tevreden of uw geld terug!</span>
      </a>
      <p class="dtc-shipping-promise">Bestel voor 23:59, morgen verzonden</p>`;
  }

  function renderDeliveryBanner() {
    return `
      <div class="dtc-delivery-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
        <span>${cfg().deliveryBanner || 'Meer dan 100.000 producten geleverd. Tevreden klanten en betrouwbare klantenservice.'}</span>
      </div>`;
  }

  function renderPaySidebar() {
    const reviews = cfg().reviews || [];
    const r = reviews[0];
    if (!r) return '';
    const avatar = r.avatar || r.image;
    const headImg = r.avatar
      ? `<img class="dtc-pay-review__avatar" src="${avatar}" alt="">`
      : `<img class="dtc-pay-review__img" src="${avatar}" alt="">`;

    return `
      <div class="dtc-pay-review${r.avatar ? ' dtc-pay-review--avatar' : ''}">
        ${headImg}
        <div class="dtc-pay-review__body">
          <div class="dtc-pay-review__name">${r.name}</div>
          <div class="dtc-pay-review__stars">★★★★★</div>
          <p class="dtc-pay-review__text">${r.text}</p>
        </div>
      </div>
      <div class="dtc-pay-guarantee-seal">
        NIET TEVREDEN?<br>
        <strong>${cfg().guaranteeDays || 90} DAGEN</strong>
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

  function initPayPage() {
    const p = cfg().product;
    const img = cfg().productImages?.[0];
    if (img) {
      const offerImg = document.getElementById('dtc-offer-img');
      if (offerImg) {
        offerImg.src = img.src;
        offerImg.alt = img.alt;
      }
    }
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const offerLabel = p.offerLabel || `1× ${brandName()}`;
    const offerNameEl = document.querySelector('.dtc-offer-card__name');
    if (offerNameEl) offerNameEl.textContent = offerLabel;
    const payProductEl = document.getElementById('dtc-pay-product-label');
    if (payProductEl) payProductEl.textContent = offerLabel;

    set('dtc-offer-was', fmt(p.originalPrice));
    set('dtc-offer-now', fmt(p.price));
    set('dtc-offer-badge', `${fmt(p.price)} / stuk`);
    set('dtc-pay-was', fmt(p.originalPrice));
    set('dtc-pay-now', fmt(p.price));
    set('dtc-sum-total', fmt(p.price));

    const sidebar = document.getElementById('dtc-pay-sidebar');
    if (sidebar) sidebar.innerHTML = renderPaySidebar();

    const faces = document.getElementById('dtc-pay-faces');
    if (faces) {
      const imgs = (cfg().reviews || []).slice(0, 3);
      faces.innerHTML = imgs
        .map((r) => {
          const src = r.avatar || r.image;
          return `<img class="dtc-pay-social__face" src="${src}" alt="">`;
        })
        .join('');
    }

    initStockCount();
    updateOrderSummary();
  }

  function renderPreRightColumn(payUrl) {
    return (
      renderProductSummary() +
      renderMainCta(payUrl) +
      renderTrustIcons() +
      renderScarcityBox()
    );
  }

  function renderPreLeftColumn() {
    return renderProductGallery() + renderDeliveryBanner();
  }

  function initFilmSlider() {
    const track = document.getElementById('dtc-film-slider-track');
    const dotsWrap = document.getElementById('dtc-film-slider-dots');
    if (!track || !dotsWrap) return;

    const slides = track.querySelectorAll('.dtc-film-slider__slide');
    if (!slides.length) return;

    dotsWrap.innerHTML = Array.from(slides)
      .map((_, i) => `<button type="button" class="dtc-film-slider__dot${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`)
      .join('');

    const dots = dotsWrap.querySelectorAll('.dtc-film-slider__dot');
    const setActive = (index) => {
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const snapToNearest = (smooth = true) => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const dist = Math.abs(slideCenter - center);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      slides[closest].scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        inline: 'center',
        block: 'nearest',
      });
      setActive(closest);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const slide = slides[Number(dot.dataset.index)];
        if (slide) {
          slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          setActive(Number(dot.dataset.index));
        }
      });
    });

    let scrollEndTimer;
    track.addEventListener(
      'scroll',
      () => {
        if (track.classList.contains('is-dragging')) return;
        const center = track.scrollLeft + track.clientWidth / 2;
        let active = 0;
        slides.forEach((slide, i) => {
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          if (Math.abs(slideCenter - center) < slide.offsetWidth / 2) active = i;
        });
        setActive(active);
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => snapToNearest(true), 120);
      },
      { passive: true }
    );

    let dragActive = false;
    let dragStartX = 0;
    let dragScrollStart = 0;
    let dragMoved = false;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragActive = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragScrollStart = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
      if (!dragActive) return;
      const delta = e.clientX - dragStartX;
      if (Math.abs(delta) > 4) dragMoved = true;
      track.scrollLeft = dragScrollStart - delta;
    });

    const endDrag = (e) => {
      if (!dragActive) return;
      dragActive = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
      if (dragMoved) snapToNearest(true);
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
  }

  function renderBelowCheckout() {
    const el = document.getElementById('dtc-col-below');
    if (!el) return;

    const sections = {
      reviews: renderReviews,
      filmLook: renderFilmLookSlider,
      benefits: renderBenefits,
      priceComparison: renderPriceComparison,
      results: renderResults,
      howItWorks: renderHowItWorks,
      guarantee: renderGuarantee,
      faq: renderFAQ,
    };

    const order = cfg().sectionOrder || [
      'reviews',
      'filmLook',
      'benefits',
      'priceComparison',
      'results',
      'howItWorks',
      'guarantee',
      'faq',
    ];

    el.innerHTML = order.map((key) => sections[key]?.() || '').join('');
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
    initBenefitsListReveal();
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
