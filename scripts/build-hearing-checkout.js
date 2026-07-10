#!/usr/bin/env node
/**
 * Generates hearing pre-checkout + pay pages.
 * Run: node scripts/build-hearing-checkout.js
 */
const fs = require('fs');
const path = require('path');

const HEARING_LOGO_SRC = '/hearing/assets/heardirect-logo.png';
const HEARING_BRAND_CSS = '/hearing/hearing-brand.css';

function hearingLogoHtml(className = 'hd-logo') {
  return `<a href="#" class="${className}" aria-label="HearDirect"><img src="${HEARING_LOGO_SRC}" alt="HearDirect" width="120" height="40" decoding="async"></a>`;
}

const BANCONTACT_ICON =
  '<svg viewBox="0 0 24 24" width="22" height="22"><rect width="24" height="24" rx="5" fill="#005498"/><path fill="#FFD800" d="M3 15.2c2.8-3.4 6.4-4.9 10.8-3.1 1.9.8 3.2 2.1 3.7 3.6H3z"/></svg>';

const variants = [
  {
    preOut: 'public/hearing-nl/checkout.html',
    payOut: 'public/hearing-nl/pay.html',
    lander: 'lp-1',
    country: 'nl',
    assetPrefix: '../',
    scriptPrefix: '../../',
    payHref: 'pay.html',
  },
  {
    preOut: 'public/hearing-nl/adv/1/checkout.html',
    payOut: 'public/hearing-nl/adv/1/pay.html',
    lander: 'adv-1',
    country: 'nl',
    assetPrefix: '../../',
    scriptPrefix: '../../../',
    payHref: 'pay.html',
  },
  {
    preOut: 'public/hearing-nl/adv/2/checkout.html',
    payOut: 'public/hearing-nl/adv/2/pay.html',
    lander: 'adv-2',
    country: 'nl',
    assetPrefix: '../../',
    scriptPrefix: '../../../',
    payHref: 'pay.html',
  },
  {
    preOut: 'public/hearing-be/adv/1/checkout.html',
    payOut: 'public/hearing-be/adv/1/pay.html',
    lander: 'adv-1',
    country: 'be',
    assetPrefix: '../../',
    scriptPrefix: '../../../',
    payHref: 'pay.html',
  },
  {
    preOut: 'public/hearing-be/adv/2/checkout.html',
    payOut: 'public/hearing-be/adv/2/pay.html',
    lander: 'adv-2',
    country: 'be',
    assetPrefix: '../../',
    scriptPrefix: '../../../',
    payHref: 'pay.html',
  },
];

function buildNlPaymentOptions() {
  return `
                    <label class="pm-option"><input type="radio" name="payment-method" value="ideal" checked><span class="pm-option-icon"><span class="pm-logo ideal-logo sm">iDEAL</span></span><span class="pm-option-label">iDEAL</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="bancontact"><span class="pm-option-icon">${BANCONTACT_ICON}</span><span class="pm-option-label">Bancontact</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="card"><span class="pm-option-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></span><span class="pm-option-label">Creditcard</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="apple_pay"><span class="pm-option-icon"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg></span><span class="pm-option-label">Apple Pay</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="google_pay"><span class="pm-option-icon"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg></span><span class="pm-option-label">Google Pay</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="klarna"><span class="pm-option-icon"><span class="pm-logo klarna-logo sm">Klarna</span></span><span class="pm-option-label">Klarna</span></label>`;
}

function buildBePaymentOptions() {
  return `
                    <label class="pm-option"><input type="radio" name="payment-method" value="bancontact" checked><span class="pm-option-icon">${BANCONTACT_ICON}</span><span class="pm-option-label">Bancontact</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="card"><span class="pm-option-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></span><span class="pm-option-label">Creditcard</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="apple_pay"><span class="pm-option-icon"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg></span><span class="pm-option-label">Apple Pay</span></label>
                    <label class="pm-option"><input type="radio" name="payment-method" value="google_pay"><span class="pm-option-icon"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg></span><span class="pm-option-label">Google Pay</span></label>`;
}

function buildFormBlock(country) {
  const isBe = country === 'be';
  const emailPlaceholder = isBe ? 'naam@voorbeeld.be' : 'naam@voorbeeld.nl';
  const postcodePlaceholder = isBe ? '1000' : '1234AB';
  const postcodeMaxLength = isBe ? '4' : '6';
  const streetPlaceholder = isBe ? 'Straatnaam' : 'Wordt automatisch ingevuld';
  const cityPlaceholder = isBe ? 'Gemeente' : 'Wordt automatisch ingevuld';
  const countryValue = isBe ? 'België' : 'Nederland';
  const defaultPmIcon = isBe
    ? `<span class="pm-accordion-icon" id="pm-selected-icon">${BANCONTACT_ICON}</span>`
    : '<span class="pm-accordion-icon" id="pm-selected-icon"><span class="pm-logo ideal-logo sm">iDEAL</span></span>';
  const defaultPmLabel = isBe ? 'Bancontact' : 'iDEAL';
  const paymentOptions = isBe ? buildBePaymentOptions() : buildNlPaymentOptions();
  const postcodeStatus = isBe ? '' : '\n                <p id="postcode-lookup-status" class="postcode-status" hidden></p>';

  return `            <div id="step-select">
              <form id="select-form">
                <div class="form-group">
                  <label for="full-name">Naam *</label>
                  <input type="text" id="full-name" name="full-name" required autocomplete="name" placeholder="Voor- en achternaam">
                </div>
                <div class="form-group">
                  <label for="email">E-mailadres *</label>
                  <input type="email" id="email" name="email" required autocomplete="email" placeholder="${emailPlaceholder}">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="postal-code">Postcode *</label>
                    <input type="text" id="postal-code" name="postal-code" required autocomplete="postal-code" placeholder="${postcodePlaceholder}" maxlength="${postcodeMaxLength}">
                  </div>
                  <div class="form-group">
                    <label for="house-number">Huisnr. *</label>
                    <input type="text" id="house-number" name="house-number" required placeholder="12" inputmode="numeric">
                  </div>
                  <div class="form-group">
                    <label for="house-addition">Toev.</label>
                    <input type="text" id="house-addition" name="house-addition" placeholder="A">
                  </div>
                </div>${postcodeStatus}
                <div class="form-group">
                  <label for="street">Straat *</label>
                  <input type="text" id="street" name="street" required autocomplete="street-address" placeholder="${streetPlaceholder}">
                </div>
                <div class="form-group">
                  <label for="city">Woonplaats *</label>
                  <input type="text" id="city" name="city" required autocomplete="address-level2" placeholder="${cityPlaceholder}">
                </div>
                <div class="form-group">
                  <label for="country">Land</label>
                  <input type="text" id="country" name="country" value="${countryValue}" readonly class="input-readonly">
                </div>
                <div class="pm-accordion" id="pm-accordion">
                  <button type="button" class="pm-accordion-header" id="pm-accordion-toggle" aria-expanded="false">
                    <span class="pm-accordion-left">
                      ${defaultPmIcon}
                      <span id="pm-selected-label">${defaultPmLabel}</span>
                    </span>
                    <svg class="pm-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="pm-accordion-body" id="pm-accordion-body" hidden>${paymentOptions}
                  </div>
                </div>
                <div class="dtc-pay-summary">
                  <div class="dtc-pay-summary__row"><span>Product</span><span>1× HearDirect™</span></div>
                  <div class="dtc-pay-summary__row"><span>Prijs</span><span><s id="dtc-pay-was">€ 300,00</s> <strong id="dtc-pay-now" data-checkout-price>€ 149,00</strong></span></div>
                  <div class="dtc-pay-summary__row dtc-pay-summary__row--total"><span>Totaal</span><span id="dtc-sum-total" data-checkout-price>€ 149,00</span></div>
                </div>
                <div id="select-message" class="payment-message" hidden></div>
                <button type="submit" id="btn-continue" class="btn-checkout dtc-cta-pulse">
                  <span>🔒</span>
                  <span id="continue-text">Bevestig uw bestelling!</span>
                  <span id="continue-spinner" class="spinner" hidden></span>
                </button>
                <div class="dtc-pay-trustbar">
                  <span class="dtc-pay-trustbar__item"><span class="dtc-pay-trustbar__dot"></span> Direct verwerkt!</span>
                  <span class="dtc-pay-trustbar__item">🔒 Veilige betaling gegarandeerd</span>
                </div>
              </form>
            </div>
            <div id="step-pay" hidden>
              <button type="button" id="btn-back" class="btn-back">← Andere betaalmethode</button>
              <div class="pm-selected-header" id="pm-pay-header"><span id="pm-pay-icon"></span> <span id="pm-pay-label">${defaultPmLabel}</span></div>
              <div id="payment-message" class="payment-message" hidden></div>
              <div id="stripe-payment-area" hidden><div id="payment-element"></div></div>
              <div id="stripe-express-area" hidden>
                <div id="wallet-button-container"></div>
                <p id="wallet-unavailable" class="wallet-unavailable" hidden></p>
              </div>
              <button type="button" id="submit-payment" class="btn-checkout dtc-cta-pulse" hidden disabled>
                <span>🔒</span>
                <span id="button-text">Bevestig uw bestelling!</span>
                <span id="spinner" class="spinner" hidden></span>
              </button>
            </div>`;
}

function buildPre(v) {
  const a = v.assetPrefix;
  const s = v.scriptPrefix;
  const pay = v.payHref;
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="/meta-pixel.js"></script>
  <title>HearDirect™ | Comfortabele hoortoestellen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${HEARING_BRAND_CSS}">
  <link rel="stylesheet" href="${a}hearing-dtc-checkout.css">
</head>
<body class="dtc-pre" data-track-page="lander" data-track-product="hearing" data-track-country="${v.country}" data-track-lander="${v.lander}" data-pay-url="${pay}">
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1545607877104793&amp;ev=PageView&amp;noscript=1" alt="" /></noscript>

  <header class="dtc-discount-bar">
    <div class="dtc-discount-bar__left">
      <strong>⚡ Exclusieve korting</strong>
      <span>Alleen beschikbaar op deze pagina</span>
    </div>
  </header>

  <div class="dtc-pre-header">
    ${hearingLogoHtml('dtc-pre-header__logo hd-logo')}
    <a href="${pay}" class="dtc-pre-header__cta">Bestel nu</a>
  </div>

  <div class="dtc-page">
    <div class="dtc-layout">
      <div class="dtc-col-left" id="dtc-col-left"></div>
      <div class="dtc-col-right" id="dtc-col-right"></div>
    </div>
    <div class="dtc-col-below" id="dtc-col-below"></div>
    <div id="dtc-footer"></div>
  </div>

  <div class="dtc-mobile-cta" id="dtc-mobile-cta">
    <a href="${pay}" class="dtc-cta-pulse">Vandaag 50% korting — Bestel nu</a>
  </div>

  <script src="${s}track.js"></script>
  <script src="${a}hearing-dtc-config.js"></script>
  <script src="${a}hearing-dtc-ui.js"></script>
</body>
</html>`;
}

function buildPay(v) {
  const a = v.assetPrefix;
  const s = v.scriptPrefix;
  const isBe = v.country === 'be';
  const headerPayments = isBe
    ? `<span class="dtc-pay-header__pm">Bancontact</span>
        <span class="dtc-pay-header__pm">VISA</span>
        <span class="dtc-pay-header__pm">MC</span>
        <span class="dtc-pay-header__pm">Apple Pay</span>`
    : `<span class="dtc-pay-header__pm">iDEAL</span>
        <span class="dtc-pay-header__pm">Bancontact</span>
        <span class="dtc-pay-header__pm">VISA</span>
        <span class="dtc-pay-header__pm">MC</span>`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="/meta-pixel.js"></script>
  <title>Afrekenen | HearDirect™</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${HEARING_BRAND_CSS}">
  <link rel="stylesheet" href="${s}checkout.css">
  <link rel="stylesheet" href="${a}hearing-dtc-checkout.css">
  <link rel="stylesheet" href="${a}hearing-dtc-pay.css">
  <script src="https://js.stripe.com/v3/"></script>
</head>
<body class="dtc-checkout dtc-pay" data-track-page="checkout" data-track-product="hearing" data-track-country="${v.country}" data-track-lander="${v.lander}">
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1545607877104793&amp;ev=PageView&amp;noscript=1" alt="" /></noscript>

  <header class="dtc-pay-header">
    ${hearingLogoHtml('dtc-pay-header__logo hd-logo')}
    <div class="dtc-pay-header__trust">
      <div class="dtc-pay-header__payments">
        ${headerPayments}
      </div>
      <span>★ Trustpilot 4,8</span>
    </div>
  </header>

  <div class="dtc-pay-page">
    <div class="dtc-pay-layout">
      <div class="dtc-pay-main">
        <div class="dtc-pay-section">
          <div class="dtc-pay-section__head">☰ Kies uw aanbieding</div>
          <div class="dtc-pay-section__body">
            <label class="dtc-offer-card" id="dtc-offer-card">
              <input type="radio" name="offer" checked disabled>
              <img class="dtc-offer-card__img" id="dtc-offer-img" src="" alt="">
              <div class="dtc-offer-card__info">
                <div class="dtc-offer-card__name">1× HearDirect™</div>
              </div>
              <div class="dtc-offer-card__prices">
                <span class="dtc-offer-card__was" id="dtc-offer-was">€ 300,00</span>
                <span class="dtc-offer-card__now" id="dtc-offer-now">€ 149,00</span>
              </div>
              <span class="dtc-offer-card__badge" id="dtc-offer-badge">€ 149 / stuk</span>
            </label>
            <div class="dtc-stock-alert">
              <span class="dtc-stock-alert__dot"></span>
              <span>Nog slechts <strong id="dtc-stock-count">37</strong> stuks op voorraad — meer onderweg</span>
            </div>
          </div>
        </div>

        <div class="dtc-pay-section">
          <div class="dtc-pay-section__head">🪪 Afleveradres</div>
          <div class="dtc-pay-section__body">
${buildFormBlock(v.country)}
          </div>
        </div>

        <div class="dtc-pay-social">
          <div class="dtc-pay-social__faces" id="dtc-pay-faces"></div>
          <strong>Meer dan 13.500 klanten</strong>
          <span>Tevreden met hun bestelling</span>
        </div>
      </div>

      <aside class="dtc-pay-sidebar" id="dtc-pay-sidebar"></aside>
    </div>
  </div>

  <script src="${s}api.js"></script>
  <script src="${s}track.js"></script>
  <script src="${a}hearing-dtc-config.js"></script>
  <script src="${a}hearing-dtc-ui.js"></script>
  <script src="${s}checkout.js"></script>
</body>
</html>`;
}

const root = path.join(__dirname, '..');
variants.forEach((v) => {
  fs.mkdirSync(path.dirname(path.join(root, v.preOut)), { recursive: true });
  fs.writeFileSync(path.join(root, v.preOut), buildPre(v));
  fs.writeFileSync(path.join(root, v.payOut), buildPay(v));
  console.log('Wrote', v.preOut, '+', v.payOut);
});
