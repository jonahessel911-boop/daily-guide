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
            ${product.badge ? `<p class="dc-mega__product-badge">${product.badge}</p>` : ''}
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
            ${product.badge ? `<span class="dc-mobile-nav__product-badge">${product.badge}</span>` : ''}
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
          <a href="${hero.ctaHref || '/dispocam/checkout'}" class="dc-hero__cta">${hero.cta || 'Shop Dispocam'}</a>
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
          <a href="${block.shopAllHref || '/dispocam/checkout'}" class="dc-section__link">Alles bekijken →</a>
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
    const activeClass = index === 0 ? ' is-active' : '';

    if (slide.type === 'cover') {
      const meta = slide.meta || {};
      return `
        <article class="dc-mission__page${activeClass}" data-mission-page="${index}" aria-label="Pagina ${index + 1}" aria-hidden="${index === 0 ? 'false' : 'true'}">
          <div class="dc-mission__paper dc-mission__paper--cover">
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
        </article>`;
    }

    if (slide.type === 'byline') {
      return `
        <article class="dc-mission__page${activeClass}" data-mission-page="${index}" aria-label="Pagina ${index + 1}" aria-hidden="${index === 0 ? 'false' : 'true'}">
          <div class="dc-mission__paper dc-mission__paper--byline">
            <p class="dc-mission__byline">${slide.text || ''}</p>
          </div>
        </article>`;
    }

    const paragraphs = (slide.paragraphs || [])
      .map((p) => `<p>${p}</p>`)
      .join('');
    const highlight = slide.highlight
      ? `<p class="dc-mission__highlight">${slide.highlight}</p>`
      : '';

    return `
      <article class="dc-mission__page${activeClass}" data-mission-page="${index}" aria-label="Pagina ${index + 1}" aria-hidden="${index === 0 ? 'false' : 'true'}">
        <div class="dc-mission__paper">
          <div class="dc-mission__content">${paragraphs}${highlight}</div>
        </div>
      </article>`;
  }

  function createMissionPageSound() {
    let audioCtx = null;

    const ensure = () => {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    };

    return (direction = 'forward') => {
      const ctx = ensure();
      if (!ctx) return;

      const t = ctx.currentTime;
      const duration = 0.32;
      const length = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const envelope = Math.pow(1 - i / length, 1.75);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = direction === 'forward' ? 940 : 720;
      filter.Q.value = 0.6;

      const rustleGain = ctx.createGain();
      rustleGain.gain.setValueAtTime(0.0001, t);
      rustleGain.gain.exponentialRampToValueAtTime(0.1, t + 0.018);
      rustleGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      noise.connect(filter);
      filter.connect(rustleGain);
      rustleGain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + duration + 0.02);

      const thump = ctx.createOscillator();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(direction === 'forward' ? 190 : 150, t);
      thump.frequency.exponentialRampToValueAtTime(85, t + 0.1);

      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(0.0001, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thump.start(t);
      thump.stop(t + 0.16);
    };
  }

  function initMissionPageTurn(book, pages, dots, playSound, reducedMotion) {
    let currentIndex = 0;
    let animating = false;
    const total = pages.length;

    const updateUi = () => {
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentIndex));
      book.querySelector('.dc-mission__nav--prev')?.toggleAttribute('disabled', currentIndex === 0);
      book.querySelector('.dc-mission__nav--next')?.toggleAttribute('disabled', currentIndex >= total - 1);
      pages.forEach((page, i) => {
        page.setAttribute('aria-hidden', i === currentIndex ? 'false' : 'true');
      });
    };

    const resetPage = (page) => {
      page.classList.remove('is-flip-out', 'is-flip-in', 'is-under');
      page.style.visibility = '';
      page.style.transform = '';
    };

    const showPage = (index) => {
      pages.forEach((page, i) => {
        resetPage(page);
        page.classList.toggle('is-active', i === index);
        if (i !== index) page.style.visibility = 'hidden';
      });
      currentIndex = index;
      updateUi();
    };

    const goTo = (index, direction) => {
      if (animating || index < 0 || index >= total || index === currentIndex) return;

      if (reducedMotion) {
        showPage(index);
        return;
      }

      animating = true;
      playSound(direction);

      const current = pages[currentIndex];
      const target = pages[index];

      if (direction === 'forward') {
        resetPage(target);
        target.style.visibility = 'visible';
        target.classList.add('is-under');
        current.classList.remove('is-active');
        current.classList.add('is-flip-out');

        current.addEventListener(
          'animationend',
          () => {
            current.style.visibility = 'hidden';
            resetPage(current);
            resetPage(target);
            target.classList.add('is-active');
            currentIndex = index;
            animating = false;
            updateUi();
          },
          { once: true }
        );
        return;
      }

      resetPage(target);
      target.style.visibility = 'visible';
      target.classList.add('is-flip-in');
      current.classList.remove('is-active');
      current.classList.add('is-under');

      target.addEventListener(
        'animationend',
        () => {
          current.style.visibility = 'hidden';
          resetPage(current);
          resetPage(target);
          target.classList.add('is-active');
          currentIndex = index;
          animating = false;
          updateUi();
        },
        { once: true }
      );
    };

    book.querySelector('.dc-mission__nav--prev')?.addEventListener('click', () => {
      goTo(currentIndex - 1, 'backward');
    });

    book.querySelector('.dc-mission__nav--next')?.addEventListener('click', () => {
      goTo(currentIndex + 1, 'forward');
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.dataset.missionDot);
        if (Number.isNaN(index)) return;
        goTo(index, index > currentIndex ? 'forward' : 'backward');
      });
    });

    let touchStartX = 0;
    let touchStartY = 0;

    book.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      },
      { passive: true }
    );

    book.addEventListener(
      'touchend',
      (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) goTo(currentIndex + 1, 'forward');
        else goTo(currentIndex - 1, 'backward');
      },
      { passive: true }
    );

    document.addEventListener('keydown', (e) => {
      if (!book.isConnected) return;
      if (e.key === 'ArrowRight') goTo(currentIndex + 1, 'forward');
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1, 'backward');
    });

    updateUi();
  }

  function renderMissionPage() {
    const mission = site().mission;
    if (!mission?.slides?.length) return '';

    const slides = mission.slides.map(renderMissionSlide).join('');
    const dots = mission.slides
      .map(
        (_, i) =>
          `<button type="button" class="dc-mission__dot${i === 0 ? ' is-active' : ''}" data-mission-dot="${i}" aria-label="Pagina ${i + 1}"></button>`
      )
      .join('');

    return `
      <div class="dc-mission">
        <div class="dc-mission__hint" id="dc-mission-hint" aria-hidden="true">
          <span class="dc-mission__hint-arrow" aria-hidden="true">→</span>
          <span class="dc-mission__hint-text">${mission.hint || 'Swipe naar rechts voor de volgende pagina'}</span>
        </div>
        <div class="dc-mission__book" id="dc-mission-book">
          <button type="button" class="dc-mission__nav dc-mission__nav--prev" aria-label="Vorige pagina" disabled>‹</button>
          <div class="dc-mission__pages" id="dc-mission-pages">${slides}</div>
          <button type="button" class="dc-mission__nav dc-mission__nav--next" aria-label="Volgende pagina">›</button>
        </div>
        <div class="dc-mission__progress" aria-hidden="true">${dots}</div>
      </div>`;
  }

  function initMissionPage() {
    const main = document.getElementById('dc-mission-main');
    if (!main) return;

    main.innerHTML = renderMissionPage();

    const book = document.getElementById('dc-mission-book');
    const hint = document.getElementById('dc-mission-hint');
    const pages = book ? Array.from(book.querySelectorAll('.dc-mission__page')) : [];
    const dots = document.querySelectorAll('.dc-mission__dot');
    const playSound = createMissionPageSound();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hint) {
      window.setTimeout(() => hint.classList.add('is-hidden'), 2800);
    }

    if (book && pages.length) {
      initMissionPageTurn(book, pages, dots, playSound, reducedMotion);
    }
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
