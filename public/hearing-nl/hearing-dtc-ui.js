/**
 * HearDirect DTC checkout — UI components & interactions
 */
(function () {
  const cfg = () => window.HearingDTCConfig || {};
  const brandPage = () => cfg().brandPage || null;
  const isBrandPage = () => Boolean(brandPage());
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
        <div class="dtc-gallery__stage">
          <div class="dtc-gallery__badges">
            <span class="dtc-gallery__pill dtc-gallery__pill--dark">Probeer 90 dagen gratis</span>
            <span class="dtc-gallery__pill dtc-gallery__pill--accent">Meest verkocht</span>
          </div>
          <button type="button" class="dtc-gallery__main" id="dtc-gallery-main-btn" aria-label="Vergroot productafbeelding">
            <img id="dtc-gallery-main" src="${images[0].src}" alt="${images[0].alt}">
          </button>
        </div>
        <div class="dtc-gallery__thumbs">${thumbs}</div>
      </section>`;
  }

  function renderProductSummary() {
    const p = cfg().product;
    const bp = brandPage();
    const priceRow = bp
      ? `<div class="dtc-summary__price-row dtc-summary__price-row--brand">
          <span class="dtc-summary__price" data-checkout-price>${fmt(p.price)}</span>
        </div>`
      : `<div class="dtc-summary__price-row">
          <span class="dtc-summary__price" data-checkout-price>${fmt(p.price)}</span>
          <span class="dtc-summary__was">${fmt(p.originalPrice)}</span>
          <span class="dtc-summary__badge">Bespaar ${p.discountPercent}%</span>
        </div>`;

    const titleHtml =
      bp && p.eyebrow
        ? `<h1 class="dtc-summary__title dtc-summary__title--brand" id="checkout-product-name">
            <span class="dtc-summary__eyebrow">${p.eyebrow}</span>
            <span class="dtc-summary__headline">${p.headline || p.name}</span>
          </h1>`
        : `<h1 class="dtc-summary__title" id="checkout-product-name">${p.name}</h1>`;

    const ratingHtml =
      bp || !p.rating
        ? ''
        : `<div class="dtc-summary__rating">
          <span class="dtc-stars" aria-hidden="true">★★★★★</span>
          <a href="#written-reviews" class="dtc-summary__rating-link">${p.rating.toFixed(1).replace('.', ',')} (${p.reviewCount.toLocaleString('nl-NL')} reviews)</a>
        </div>`;

    return `
      <section class="dtc-summary">
        ${titleHtml}
        ${ratingHtml}
        ${priceRow}
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
    if (isBrandPage()) return '';
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
      <section class="dtc-section dtc-film-slider" id="film-look">
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

  function renderSocialFeedSection() {
    const feed = cfg().socialFeed;
    if (!feed?.image) return '';

    return `
      <section class="dtc-section dtc-social-section" id="social-feed">
        ${renderSocialFeed()}
      </section>`;
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
      if (social && cfg().embedSocialInBenefits !== false) contentHtml += renderSocialFeed();
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
      <section class="dtc-section dtc-benefits${list?.length ? ' dtc-benefits--list' : ''}" id="waarom">
        <h2 class="dtc-section__title">${cfg().benefitsTitle || 'Waarom klanten hiervoor kiezen'}</h2>
        <div class="dtc-benefits__grid${list?.length || visual?.src ? ' dtc-benefits__grid--visual' : ''}">
          ${contentHtml}
        </div>
      </section>`;
  }

  function renderCompareCta(payUrl) {
    const pulse = isBrandPage() ? '' : ' dtc-cta-pulse';
    const label = isBrandPage() ? 'Bestel nu' : 'Bestel nu — Vandaag:';
    return `
        <a href="${payUrl}" class="dtc-compare__highlight${pulse}">
          <span>${label}</span>
          <strong data-checkout-price>${fmt(cfg().product.price)}</strong>
        </a>`;
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
        ${renderCompareCta(payUrl)}
      </section>`;
  }

  function renderManifest() {
    const text = brandPage()?.manifest;
    if (!text) return '';

    const tagline = brandPage()?.tagline;
    return `
      <section class="dtc-section dtc-manifest" aria-label="Het manifest">
        <blockquote class="dtc-manifest__quote"><p>${text}</p></blockquote>
        ${tagline ? `<p class="dtc-brand-tagline dtc-brand-tagline--manifest">${tagline}</p>` : ''}
      </section>`;
  }

  function renderFounderStory() {
    const story = brandPage()?.founderStory;
    if (!story?.paragraphs?.length) return '';

    const expandAfter = story.expandAfter || 3;
    const paragraphs = story.paragraphs
      .map(
        (text, i) =>
          `<p class="dtc-founder-story__p${i >= expandAfter ? ' dtc-founder-story__p--more' : ''}">${text}</p>`
      )
      .join('');

    const promises = (story.promises || [])
      .map(
        (line) =>
          `<li><span class="dtc-founder-story__check" aria-hidden="true">✓</span><span>${line}</span></li>`
      )
      .join('');

    return `
      <section class="dtc-section dtc-founder-story" id="founder-story">
        <h2 class="dtc-section__title">${story.title || 'Hoe Dispocam ontstond'}</h2>
        <div class="dtc-founder-story__inner">
          <div class="dtc-founder-story__photo" aria-hidden="true"></div>
          <div class="dtc-founder-story__content" id="dtc-founder-story-content">
            ${paragraphs}
          </div>
          <div class="dtc-founder-story__expand-wrap" id="dtc-founder-expand-wrap">
            <button type="button" class="dtc-founder-story__expand" id="dtc-founder-expand">Lees verder</button>
          </div>
          ${story.author ? `<p class="dtc-founder-story__author">${story.author}</p>` : ''}
          ${promises ? `<ul class="dtc-founder-story__promises">${promises}</ul>` : ''}
        </div>
      </section>`;
  }

  function renderFounderNote() {
    const note = brandPage()?.founderNote;
    if (!note?.text) return '';

    return `
      <section class="dtc-section dtc-founder" aria-label="Founder note">
        <div class="dtc-founder__inner">
          <div class="dtc-founder__avatar" aria-hidden="true"></div>
          <div class="dtc-founder__body">
            <p>${note.text}</p>
            ${note.author ? `<p class="dtc-founder__author">${note.author}</p>` : ''}
          </div>
        </div>
      </section>`;
  }

  function renderVisionTeaser() {
    const teaser = brandPage()?.visionTeaser;
    if (!teaser?.title) return '';

    const payUrl = document.body.dataset.payUrl || 'pay.html';
    const note = teaser.note ? `<p class="dtc-vision__note">${teaser.note}</p>` : '';
    const cta = teaser.cta
      ? `<a href="${payUrl}" class="dtc-vision__cta">${teaser.cta} — <strong data-checkout-price>${fmt(cfg().product.price)}</strong></a>`
      : '';

    return `
      <section class="dtc-section dtc-vision" aria-label="Visie">
        <div class="dtc-vision__card">
          <h2 class="dtc-vision__title">${teaser.title}</h2>
          ${teaser.body ? `<p class="dtc-vision__body">${teaser.body}</p>` : ''}
          ${note}
          ${cta}
        </div>
      </section>`;
  }

  function renderBrandTagline() {
    const tagline = brandPage()?.tagline;
    if (!tagline) return '';
    return `<p class="dtc-brand-tagline dtc-brand-tagline--footer">${tagline}</p>`;
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
        ${renderCompareCta(payUrl)}
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
        ${renderCompareCta(payUrl)}
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
      <section class="dtc-section dtc-hiw" id="hoe-werkt-het">
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
    const productLabel = isBrandPage() ? 'je Dispocam' : brandName();
    return `
      <section class="dtc-section dtc-guarantee">
        <div class="dtc-guarantee__badge">${ICONS.shield}</div>
        <h2 class="dtc-section__title">Een zorgeloze keuze met tevredenheidsgarantie</h2>
        <p>Probeer ${productLabel} ${cfg().guaranteeDays || 90} dagen thuis uit. Niet tevreden? Dan stuur je het terug en krijg je je volledige aankoopbedrag terug — zonder gedoe.</p>
        <p>Daarnaast ontvang je 1 jaar garantie op fabricagefouten, zodat je met een gerust hart kunt bestellen.</p>
      </section>`;
  }

  function renderFAQ() {
    const items = cfg().faqItems || [];
    return `
      <section class="dtc-section dtc-faq" id="faq">
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
    const bb = f.brandBlock;

    if (isBrandPage() && bb) {
      return `
      <footer class="dtc-footer dtc-footer--brand">
        <div class="dtc-footer__brand">
          <p class="dtc-footer__brand-copy">${bb.copyright || ''}</p>
          ${bb.kvk ? `<p class="dtc-footer__brand-meta">${bb.kvk}</p>` : ''}
          ${bb.email ? `<p class="dtc-footer__brand-meta"><a href="mailto:${bb.email}">${bb.email}</a></p>` : ''}
        </div>
        <nav class="dtc-footer__links">${links}</nav>
      </footer>`;
    }

    const brandBlock = bb
      ? `<div class="dtc-footer__brand">
          <p class="dtc-footer__brand-copy">${bb.copyright || ''}</p>
          ${bb.kvk ? `<p class="dtc-footer__brand-meta">${bb.kvk}</p>` : ''}
          ${bb.email ? `<p class="dtc-footer__brand-meta"><a href="mailto:${bb.email}">${bb.email}</a></p>` : ''}
        </div>`
      : '';

    return `
      <footer class="dtc-footer">
        <a href="#" class="dtc-footer__logo hd-logo" aria-label="HearDirect">
          <img src="${cfg().brand?.logo || '/hearing/assets/heardirect-logo.png'}" alt="HearDirect" width="140" height="56" decoding="async">
        </a>
        ${brandBlock}
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
    const mainBtn = document.getElementById('dtc-gallery-main-btn');
    if (!main || !images[i]) return;

    selectedImage = i;
    main.src = images[i].src;
    main.alt = images[i].alt;
    if (mainBtn) {
      mainBtn.classList.toggle('dtc-gallery__main--contain', images[i].fit === 'contain');
    }
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
    initFounderStoryExpand();
    initBrandChrome();
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

  function initFounderStoryExpand() {
    const wrap = document.getElementById('dtc-founder-expand-wrap');
    const btn = document.getElementById('dtc-founder-expand');
    const content = document.getElementById('dtc-founder-story-content');
    if (!wrap || !btn || !content) return;

    const more = content.querySelectorAll('.dtc-founder-story__p--more');
    if (!more.length) {
      wrap.remove();
      return;
    }

    btn.addEventListener('click', () => {
      content.classList.add('is-expanded');
      wrap.remove();
    });
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
    const country = document.body.dataset.trackCountry || 'nl';
    const isBe = country === 'be';
    const payments = isBe
      ? `<div class="dtc-buy-pay-logos" aria-label="Beschikbare betaalmethoden">
           <span class="dtc-buy-pay-logos__bancontact">Bancontact</span>
           <img src="/assets/payment/klarna.png" alt="Klarna" width="160" height="80" loading="lazy">
         </div>`
      : `<div class="dtc-buy-pay-logos" aria-label="Beschikbare betaalmethoden">
           <img src="/assets/payment/ideal-wero.png" alt="iDEAL" width="120" height="120" loading="lazy">
           <img src="/assets/payment/klarna.png" alt="Klarna" width="160" height="80" loading="lazy">
         </div>`;
    const shipWhere = isBe ? 'BE' : 'NL';
    const supportMail = isBe ? 'support@heardirect.be' : 'support@heardirect.nl';

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
            <p><strong>Gratis verzending in ${shipWhere}.</strong></p>
            <p>Reken op de volgende levertijden:</p>
            <ul class="dtc-buy-acc__specs">
              <li><strong>Standaard:</strong> 2–5 werkdagen · gratis</li>
              <li><strong>Track &amp; trace:</strong> altijd inbegrepen</li>
            </ul>
            <p><strong>Retourneren</strong></p>
            <p>90 dagen proberen — ook na gebruik. Niet tevreden? Geld terug.</p>
            <p>Start een retour via <a href="mailto:${supportMail}">${supportMail}</a>.</p>
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
            ${payments}
          </div>
        </details>
      </div>`;
  }

  function renderOfferSets() {
    const fmtLocal = fmt;
    return `
      <div class="hd-offers" role="group" aria-label="Kies je set">
        <button type="button" class="hd-offer is-selected" data-hd-offer="single" aria-pressed="true">
          <div class="hd-offer__info">
            <div class="hd-offer__title">1 Set</div>
            <div class="hd-offer__meta">HearDirect™ — oplaadcase inclusief</div>
          </div>
          <div class="hd-offer__price">
            <span class="hd-offer__was">${fmtLocal(199.95)}</span>
            <span class="hd-offer__now">${fmtLocal(129.99)}</span>
          </div>
        </button>
        <button type="button" class="hd-offer" data-hd-offer="duo" aria-pressed="false">
          <span class="hd-offer__badge">Beste deal</span>
          <div class="hd-offer__info">
            <div class="hd-offer__title">2 Sets</div>
            <div class="hd-offer__meta">${fmtLocal(119.99)} / set · totaal ${fmtLocal(239.98)}</div>
          </div>
          <div class="hd-offer__price">
            <span class="hd-offer__was">${fmtLocal(399.9)}</span>
            <span class="hd-offer__now">${fmtLocal(239.98)}</span>
          </div>
        </button>
      </div>`;
  }

  function renderMainCta(payUrl) {
    const bp = brandPage();
    const title = bp?.mainCta?.title || 'Voeg toe aan winkelwagen';
    const sub = bp?.mainCta?.sub || '90 dagen niet goed, geld terug';

    return `
      <button type="button" class="dtc-main-cta" data-hd-atc>
        <span class="dtc-main-cta__title">${title}</span>
      </button>
      <p class="dtc-guarantee-line"><span aria-hidden="true">🛡</span> ${sub}</p>
      <p class="dtc-shipping-promise">${bp?.shippingPromise || 'Bestel vandaag, ontvang binnen 2–5 werkdagen'}</p>`;
  }

  function initBrandChrome() {
    const bp = brandPage();
    if (!bp) return;

    const payUrl = document.body.dataset.payUrl || 'pay.html';
    const topBar = document.querySelector('.dtc-discount-bar__left');
    if (topBar && bp.topBar) {
      topBar.innerHTML = `<span class="dtc-top-bar__text">${bp.topBar}</span>`;
      topBar.closest('.dtc-discount-bar')?.classList.add('dtc-top-bar--brand');
    }

    const mobileCta = document.getElementById('dtc-mobile-cta');
    if (mobileCta && bp.mobileCta) {
      mobileCta.classList.add('dtc-mobile-cta--brand');
      mobileCta.innerHTML = `
        <span class="dtc-mobile-cta__label">${bp.mobileCta.label} — <strong data-checkout-price>${fmt(cfg().product.price)}</strong></span>
        <a href="${payUrl}" class="dtc-mobile-cta__btn" data-hd-atc>${bp.mobileCta.button || 'Voeg toe aan winkelwagen'}</a>`;
    }

    document.body.classList.add('dtc-page--brand');
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
            return duos * 119.99 * 2 + singles * (p.price || 129.99);
          })();
    const was = (p.originalPrice || p.price) * qty;
    const per = total / qty;
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const offerLabel = `${qty}× ${brandName()}`;
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
      manifest: renderManifest,
      socialFeed: renderSocialFeedSection,
      priceComparison: renderPriceComparison,
      results: renderResults,
      howItWorks: renderHowItWorks,
      guarantee: renderGuarantee,
      founderNote: renderFounderNote,
      founderStory: renderFounderStory,
      faq: renderFAQ,
      visionTeaser: renderVisionTeaser,
      brandTagline: renderBrandTagline,
    };

    const order = cfg().sectionOrder || [
      'filmLook',
      'benefits',
      'priceComparison',
      'results',
      'howItWorks',
      'guarantee',
      'faq',
      'reviews',
    ];

    el.innerHTML = order.map((key) => sections[key]?.() || '').join('');
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
    initBenefitsListReveal();
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
