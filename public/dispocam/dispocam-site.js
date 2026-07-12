/**
 * DispoCam brand site — nav, mega menu, homepage
 */
(function () {
  const cfg = () => window.HearingDTCConfig || {};
  const site = () => cfg().site || {};
  const fmt = (n) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

  function isCheckoutPage() {
    return document.body.classList.contains('dtc-pre') || document.body.classList.contains('dc-site--checkout');
  }

  function isFeedPage() {
    return document.body.dataset.trackPage === 'feed';
  }

  function isMissionPage() {
    return document.body.dataset.trackPage === 'missie';
  }

  function renderAnnouncement() {
    const text = site().announcement || brandPage()?.topBar;
    if (!text) return '';
    return `<div class="dc-announce">${text}</div>`;
  }

  function brandPage() {
    return cfg().brandPage;
  }

  function renderMegaMenu() {
    const product = site().megaMenu?.product;
    if (!product) return '';

    return `
      <div class="dc-mega" id="dc-mega-menu">
        <div class="dc-mega__inner dc-mega__inner--single">
          <a href="${product.href}" class="dc-mega__product">
            <img src="${product.image}" alt="" loading="lazy">
            <p class="dc-mega__product-title">${product.title}</p>
          </a>
        </div>
      </div>`;
  }

  function renderHeader() {
    const s = site();
    const nav = s.nav || {};

    return `
      ${renderAnnouncement()}
      <header class="dc-header" id="dc-header">
        <div class="dc-header__inner">
          <div class="dc-nav__left">
            <button type="button" class="dc-nav__burger" id="dc-nav-burger" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
            <div class="dc-nav__item dc-nav__item--mega" id="dc-nav-shop">
              <button type="button" class="dc-nav__link dc-nav__link--shop" aria-expanded="false" aria-controls="dc-mega-menu">
                ${nav.shop || 'Shop'} <span class="dc-nav__chevron" aria-hidden="true">▾</span>
              </button>
              ${renderMegaMenu()}
            </div>
            ${nav.mission ? `<a href="${nav.mission.href}" class="dc-nav__link${isMissionPage() ? ' dc-nav__link--active' : ''}">${nav.mission.label}</a>` : ''}
            ${nav.feed ? `<a href="${nav.feed.href}" class="dc-nav__link${isFeedPage() ? ' dc-nav__link--active' : ''}">${nav.feed.label}</a>` : ''}
            ${nav.about ? `<a href="${nav.about.href}" class="dc-nav__link">${nav.about.label}</a>` : ''}
            ${nav.faq ? `<a href="${nav.faq.href}" class="dc-nav__link">${nav.faq.label}</a>` : ''}
          </div>
          <a href="/dispocam/" class="dc-nav__logo">Dispocam</a>
          <div class="dc-nav__right">
            ${nav.support ? `<a href="${nav.support.href}" class="dc-nav__link">${nav.support.label}</a>` : ''}
          </div>
        </div>
      </header>
      ${renderMobileNav()}`;
  }

  function renderMobileNav() {
    const s = site();
    const nav = s.nav || {};
    const product = s.megaMenu?.product;

    const shopBlock = product
      ? `
          <a href="${product.href}" class="dc-mobile-nav__product">
            <img src="${product.image}" alt="" loading="lazy">
            <span class="dc-mobile-nav__product-title">${product.title}</span>
          </a>`
      : '';

    return `
      <div class="dc-mobile-nav" id="dc-mobile-nav" hidden aria-hidden="true">
        <div class="dc-mobile-nav__panel">
          <button type="button" class="dc-mobile-nav__close" id="dc-mobile-nav-close" aria-label="Sluiten">×</button>
          ${shopBlock}
          ${nav.mission ? `<a href="${nav.mission.href}" class="dc-mobile-nav__link">${nav.mission.label}</a>` : ''}
          ${nav.feed ? `<a href="${nav.feed.href}" class="dc-mobile-nav__link">${nav.feed.label}</a>` : ''}
          ${nav.about ? `<a href="${nav.about.href}" class="dc-mobile-nav__link">${nav.about.label}</a>` : ''}
          ${nav.faq ? `<a href="${nav.faq.href}" class="dc-mobile-nav__link">${nav.faq.label}</a>` : ''}
          ${nav.support ? `<a href="${nav.support.href}" class="dc-mobile-nav__link">${nav.support.label}</a>` : ''}
        </div>
      </div>`;
  }

  function renderSiteFooter() {
    const f = cfg().footer || {};
    const bb = f.brandBlock;
    const links = (f.links || [])
      .map((l) => `<a href="${l.href}">${l.label}</a>`)
      .join('');

    return `
      <footer class="dc-site-footer">
        <div class="dc-site-footer__inner">
          <div class="dc-site-footer__brand">
            ${bb?.copyright ? `<p class="dc-site-footer__brand-copy">${bb.copyright}</p>` : ''}
            ${bb?.kvk ? `<p class="dc-site-footer__brand-meta">${bb.kvk}</p>` : ''}
            ${bb?.email ? `<p class="dc-site-footer__brand-meta"><a href="mailto:${bb.email}">${bb.email}</a></p>` : ''}
          </div>
          <div class="dc-site-footer__links">
            <nav>${links}</nav>
            <p class="dc-site-footer__copy">© ${new Date().getFullYear()} Dispocam. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>`;
  }

  function renderHero() {
    const hero = site().hero;
    if (!hero) return '';

    return `
      <section class="dc-hero">
        <div class="dc-hero__bg">
          <img src="${hero.image}" alt="" loading="eager">
        </div>
        <div class="dc-hero__overlay"></div>
        <div class="dc-hero__content">
          <h1 class="dc-hero__title">${hero.title}</h1>
          ${hero.subtitle ? `<p class="dc-hero__subtitle">${hero.subtitle}</p>` : ''}
          ${hero.body ? `<p class="dc-hero__body">${hero.body}</p>` : ''}
          <a href="${hero.ctaHref || '/dispocam/checkout.html'}" class="dc-hero__cta">${hero.cta || 'Shop Dispocam'}</a>
          ${hero.rating ? `<p class="dc-hero__rating">★★★★★ ${hero.rating}</p>` : ''}
        </div>
      </section>`;
  }

  function renderProducts() {
    const block = site().products;
    if (!block?.items?.length) return '';

    const cards = block.items
      .map(
        (p) => `
        <a href="${p.href}" class="dc-product-card">
          <div class="dc-product-card__img-wrap">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            ${p.badge ? `<span class="dc-product-card__badge">${p.badge}</span>` : ''}
          </div>
          <p class="dc-product-card__name">${p.name}</p>
          ${p.variant ? `<p class="dc-product-card__variant">${p.variant}</p>` : ''}
          <p class="dc-product-card__price">${fmt(p.price)}</p>
        </a>`
      )
      .join('');

    return `
      <section class="dc-section">
        <div class="dc-section__head">
          <h2 class="dc-section__title">${block.title || 'Shop'}</h2>
          <a href="${block.shopAllHref || '/dispocam/checkout.html'}" class="dc-section__link">Alles bekijken →</a>
        </div>
        <div class="dc-product-grid">${cards}</div>
      </section>`;
  }

  function renderMoments() {
    const block = site().moments;
    if (!block?.items?.length) return '';

    const cards = block.items
      .map(
        (m) => `
        <a href="${m.href}" class="dc-moment-card">
          <img src="${m.image}" alt="${m.title}" loading="lazy">
          <span class="dc-moment-card__label">${m.title}</span>
        </a>`
      )
      .join('');

    return `
      <section class="dc-section">
        <div class="dc-section__head">
          <h2 class="dc-section__title">${block.title}</h2>
        </div>
        <div class="dc-moments-grid">${cards}</div>
      </section>`;
  }

  function renderQuoteBand() {
    const bp = brandPage();
    if (!bp?.manifest) return '';

    const excerpt = bp.manifest.split('. ').slice(0, 2).join('. ') + '.';
    return `
      <section class="dc-quote-band">
        <p class="dc-quote-band__text">${excerpt}</p>
        ${bp.tagline ? `<p class="dc-quote-band__tagline">${bp.tagline}</p>` : ''}
      </section>`;
  }

  function renderAboutPage() {
    const about = site().about;
    const bp = brandPage();
    if (!about) return '';

    const sections = (about.sections || [])
      .map(
        (s) => `
        <div class="dc-about-block">
          <h2>${s.heading}</h2>
          <p>${s.body}</p>
        </div>`
      )
      .join('');

    const founder = bp?.founderNote
      ? `
      <div class="dc-founder-block">
        <div class="dc-founder-block__avatar" aria-hidden="true"></div>
        <div>
          <p class="dc-founder-block__text">${bp.founderNote.text}</p>
          ${bp.founderNote.author ? `<p class="dc-founder-block__author">${bp.founderNote.author}</p>` : ''}
        </div>
      </div>`
      : '';

    return `
      <div class="dc-about-hero">
        <h1 class="dc-about-hero__title">${about.title || 'Over Dispocam'}</h1>
        <p class="dc-about-hero__intro">${about.intro || ''}</p>
      </div>
      <div class="dc-about-sections">${sections}</div>
      ${founder}
      ${bp?.manifest ? `<section class="dc-quote-band"><p class="dc-quote-band__text">${bp.manifest}</p></section>` : ''}`;
  }

  function initMegaMenu() {
    const shopItem = document.getElementById('dc-nav-shop');
    const header = document.getElementById('dc-header');
    if (!shopItem || !header) return;

    let closeTimer;
    const open = () => {
      clearTimeout(closeTimer);
      shopItem.classList.add('is-open');
      header.classList.add('is-mega-open');
      shopItem.querySelector('.dc-nav__link--shop')?.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      closeTimer = setTimeout(() => {
        shopItem.classList.remove('is-open');
        header.classList.remove('is-mega-open');
        shopItem.querySelector('.dc-nav__link--shop')?.setAttribute('aria-expanded', 'false');
      }, 120);
    };

    shopItem.addEventListener('mouseenter', open);
    shopItem.addEventListener('mouseleave', close);
    shopItem.addEventListener('focusin', open);
    shopItem.addEventListener('focusout', (e) => {
      if (!shopItem.contains(e.relatedTarget)) close();
    });
  }

  function initMobileNav() {
    const burger = document.getElementById('dc-nav-burger');
    const panel = document.getElementById('dc-mobile-nav');
    const closeBtn = document.getElementById('dc-mobile-nav-close');
    if (!burger || !panel) return;

    const open = () => {
      panel.hidden = false;
      panel.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => panel.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        panel.hidden = true;
      }, 250);
    };

    burger.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    panel.addEventListener('click', (e) => {
      if (e.target === panel) close();
    });
  }

  function mountHeader() {
    const el = document.getElementById('dc-site-header');
    if (!el) return;
    el.innerHTML = renderHeader();
    initMegaMenu();
    initMobileNav();
  }

  function mountFooter() {
    const el = document.getElementById('dc-site-footer');
    if (el) el.innerHTML = renderSiteFooter();
  }

  function initHomePage() {
    const main = document.getElementById('dc-home-main');
    if (!main) return;
    main.innerHTML = renderHero() + renderProducts() + renderMoments() + renderQuoteBand();
  }

  function initAboutPage() {
    const main = document.getElementById('dc-about-main');
    if (main) main.innerHTML = renderAboutPage();
  }

  function renderFeedPage() {
    const feed = site().feed;
    if (!feed?.posts?.length) return '';

    const sizes = ['tall', 'short', 'square'];

    const tiles = feed.posts
      .map(
        (post, i) => {
          const size = post.size || sizes[i % sizes.length];
          return `
        <button type="button" class="dc-feed__item" data-feed-index="${i}" aria-label="Bekijk foto van ${post.author?.name || 'maker'}">
          <span class="dc-feed__frame dc-feed__frame--${size}">
            <img src="${post.image}" alt="${post.alt || ''}" loading="lazy">
          </span>
        </button>`;
        }
      )
      .join('');

    return `
      <section class="dc-feed">
        <div class="dc-feed__head">
          <h1 class="dc-feed__title">${feed.title || 'Feed'}</h1>
          ${feed.subtitle ? `<p class="dc-feed__subtitle">${feed.subtitle}</p>` : ''}
        </div>
        <div class="dc-feed__tabs" aria-hidden="true">
          <span class="dc-feed__tab dc-feed__tab--active">Recent</span>
        </div>
        <div class="dc-feed__masonry" id="dc-feed-masonry">${tiles}</div>
      </section>
      <div class="dc-feed-detail" id="dc-feed-detail" hidden aria-hidden="true">
        <div class="dc-feed-detail__backdrop" data-feed-close></div>
        <div class="dc-feed-detail__dialog" role="dialog" aria-modal="true" aria-labelledby="dc-feed-detail-name">
          <button type="button" class="dc-feed-detail__close" data-feed-close aria-label="Sluiten">×</button>
          <div class="dc-feed-detail__photo">
            <img id="dc-feed-detail-img" src="" alt="">
          </div>
          <aside class="dc-feed-detail__profile">
            <div class="dc-feed-detail__profile-head">
              <img class="dc-feed-detail__avatar" id="dc-feed-detail-avatar" src="" alt="">
              <div>
                <h2 class="dc-feed-detail__name" id="dc-feed-detail-name"></h2>
                <p class="dc-feed-detail__handle" id="dc-feed-detail-handle"></p>
              </div>
            </div>
            <p class="dc-feed-detail__bio" id="dc-feed-detail-bio"></p>
            <p class="dc-feed-detail__location" id="dc-feed-detail-location"></p>
            <p class="dc-feed-detail__caption" id="dc-feed-detail-caption"></p>
            <p class="dc-feed-detail__shot">Geschoten met Dispocam</p>
          </aside>
        </div>
      </div>`;
  }

  function initFeedPage() {
    const main = document.getElementById('dc-feed-main');
    if (!main) return;

    main.innerHTML = renderFeedPage();

    const posts = site().feed?.posts || [];
    const detail = document.getElementById('dc-feed-detail');
    if (!detail || !posts.length) return;

    const img = document.getElementById('dc-feed-detail-img');
    const avatar = document.getElementById('dc-feed-detail-avatar');
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || '';
    };

    const openPost = (index) => {
      const post = posts[index];
      if (!post) return;

      if (img) {
        img.src = post.image;
        img.alt = post.alt || '';
      }
      if (avatar && post.author?.avatar) {
        avatar.src = post.author.avatar;
        avatar.alt = post.author.name || '';
      }
      setText('dc-feed-detail-name', post.author?.name);
      setText('dc-feed-detail-handle', post.author?.handle ? `@${post.author.handle}` : '');
      setText('dc-feed-detail-bio', post.author?.bio);
      setText('dc-feed-detail-location', post.author?.location);
      setText('dc-feed-detail-caption', post.caption);

      detail.hidden = false;
      detail.classList.add('is-open');
      detail.setAttribute('aria-hidden', 'false');
      document.body.classList.add('dc-feed-detail-open');
      detail.querySelector('.dc-feed-detail__close')?.focus();
    };

    const closePost = () => {
      detail.classList.remove('is-open');
      detail.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('dc-feed-detail-open');
      detail.hidden = true;
    };

    document.querySelectorAll('.dc-feed__item').forEach((btn) => {
      btn.addEventListener('click', () => openPost(Number(btn.dataset.feedIndex)));
    });

    detail.querySelectorAll('[data-feed-close]').forEach((el) => {
      el.addEventListener('click', closePost);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && detail.classList.contains('is-open')) closePost();
    });
  }

  function renderMissionSlide(slide, index) {
    if (slide.type === 'cover') {
      const meta = slide.meta || {};
      return `
        <section class="dc-mission__slide" data-mission-index="${index}" aria-label="Pagina ${index + 1}">
          <div class="dc-mission__slide-inner dc-mission__slide-inner--cover">
            <p class="dc-mission__label">${slide.label || ''}</p>
            <h1 class="dc-mission__title">${slide.title || ''}</h1>
            <p class="dc-mission__meta">
              <time datetime="2025-07-01">${meta.date || ''}</time>
              <span class="dc-mission__meta-sep">·</span>
              <span>${meta.readTime || ''}</span>
              <span class="dc-mission__meta-sep">·</span>
              <span>${meta.author || ''}</span>
            </p>
          </div>
        </section>`;
    }

    if (slide.type === 'byline') {
      return `
        <section class="dc-mission__slide" data-mission-index="${index}" aria-label="Pagina ${index + 1}">
          <div class="dc-mission__slide-inner dc-mission__slide-inner--byline">
            <p class="dc-mission__byline">${slide.text || ''}</p>
          </div>
        </section>`;
    }

    const paragraphs = (slide.paragraphs || [])
      .map((p) => `<p>${p}</p>`)
      .join('');
    const highlight = slide.highlight
      ? `<p class="dc-mission__highlight">${slide.highlight}</p>`
      : '';

    return `
      <section class="dc-mission__slide" data-mission-index="${index}" aria-label="Pagina ${index + 1}">
        <div class="dc-mission__slide-inner">
          <div class="dc-mission__content">${paragraphs}${highlight}</div>
        </div>
      </section>`;
  }

  function renderMissionPage() {
    const mission = site().mission;
    if (!mission?.slides?.length) return '';

    const slides = mission.slides.map(renderMissionSlide).join('');
    const dots = mission.slides
      .map((_, i) => `<span class="dc-mission__dot${i === 0 ? ' is-active' : ''}" data-mission-dot="${i}"></span>`)
      .join('');

    return `
      <div class="dc-mission">
        <div class="dc-mission__hint" id="dc-mission-hint" aria-hidden="true">
          <span class="dc-mission__hint-arrow" aria-hidden="true">→</span>
          <span class="dc-mission__hint-text">${mission.hint || 'Swipe naar rechts voor de volgende pagina'}</span>
        </div>
        <div class="dc-mission__track" id="dc-mission-track">${slides}</div>
        <div class="dc-mission__progress" aria-hidden="true">${dots}</div>
      </div>`;
  }

  function initMissionPage() {
    const main = document.getElementById('dc-mission-main');
    if (!main) return;

    main.innerHTML = renderMissionPage();

    const track = document.getElementById('dc-mission-track');
    const hint = document.getElementById('dc-mission-hint');
    const dots = document.querySelectorAll('.dc-mission__dot');

    if (hint) {
      window.setTimeout(() => hint.classList.add('is-hidden'), 2800);
    }

    const updateProgress = () => {
      if (!track || !track.offsetWidth) return;
      const index = Math.round(track.scrollLeft / track.offsetWidth);
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    track?.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  function initCheckoutIntegration() {
    if (!isCheckoutPage()) return;
    document.body.classList.add('dc-site--checkout');
  }

  function init() {
    mountHeader();
    mountFooter();
    initHomePage();
    initAboutPage();
    initFeedPage();
    initMissionPage();
    initCheckoutIntegration();
  }

  window.DispoCamSite = { init, renderHeader, renderSiteFooter };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
