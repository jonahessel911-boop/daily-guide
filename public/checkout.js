const STRIPE_PK =
  'pk_live_51TQqFYLGVqAZBTckWzCiVrZsmrJX5rkUxuYVjFkIMZVMVE6990yANMCjbn17Osp3ZVmgHrticwv7tHzoB0KTTWRO00dWpf0uMj';

const BANCONTACT_ICON =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#005498"/><path fill="#FFD800" d="M3 15.2c2.8-3.4 6.4-4.9 10.8-3.1 1.9.8 3.2 2.1 3.7 3.6H3z"/><path fill="#fff" d="M8.8 8.8h1.3c1.6 0 2.6.9 2.6 2.3 0 1.4-1.1 2.3-2.8 2.3H8.8V8.8zm1.2 3.6h.5c.8 0 1.3-.4 1.3-1 0-.6-.5-1-1.3-1h-.5v2z"/></svg>';

const METHOD_LABELS = {
  ideal: 'iDEAL',
  bancontact: 'Bancontact',
  card: 'Creditcard',
  klarna: 'Klarna',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
};

const METHOD_ICONS = {
  ideal: '<span class="pm-logo ideal-logo sm">iDEAL</span>',
  bancontact: BANCONTACT_ICON,
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  klarna: '<span class="pm-logo klarna-logo sm">Klarna</span>',
  apple_pay: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
  google_pay: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
};

let stripe;
let elements;
let paymentElement;
let expressCheckout;
let paymentRequest;
let paymentRequestButton;
let clientSecret;
let selectedMethod = 'ideal';

function getCheckoutCountry() {
  const attr = document.body.dataset.trackCountry;
  const urlC = new URLSearchParams(window.location.search).get('c');
  return (attr || urlC || 'nl').toLowerCase();
}

function isBelgiumCheckout() {
  return getCheckoutCountry() === 'be';
}

function defaultPaymentMethod() {
  return isBelgiumCheckout() ? 'bancontact' : 'ideal';
}

function stripeCountryCode() {
  return isBelgiumCheckout() ? 'BE' : 'NL';
}
let customerEmail = '';
let customerName = '';
let shippingInfo = null;
let postcodeLookupTimer = null;
let postcodeLookupRequest = 0;

function isDtcCheckout() {
  return document.body.classList.contains('dtc-checkout');
}

function isDtcPayPage() {
  return document.body.classList.contains('dtc-pay');
}

function dtcConfirmLabel() {
  return isDtcPayPage() ? 'Bevestig uw bestelling!' : 'Bestelling afronden';
}

function getOrderBumpSelected() {
  return document.getElementById('order-bump')?.checked || false;
}

function getProductSlug() {
  const domSlug = document.body.dataset.trackProduct;
  const urlSlug = new URLSearchParams(window.location.search).get('p');
  const attr = window.FunnelTrack?.getAttribution?.() || {};
  return domSlug || urlSlug || attr.product || '1970cam';
}

function hasShippingForm() {
  return Boolean(document.getElementById('full-name'));
}

function loadShippingFromStorage() {
  if (!hasShippingForm()) return;
  const raw = sessionStorage.getItem('checkout_shipping');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const fields = {
      'full-name': data.name,
      email: data.email,
      'postal-code': data.postalCode,
      'house-number': data.houseNumber,
      'house-addition': data.houseAddition,
      street: data.street,
      city: data.city,
    };
    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && value) {
        el.value = id === 'postal-code' ? normalizePostcode(value) : value;
      }
    });
  } catch (_) {
    /* ignore */
  }
}

function collectShippingData() {
  if (!hasShippingForm()) return null;

  return {
    name: document.getElementById('full-name')?.value.trim() || '',
    email: document.getElementById('email')?.value.trim() || '',
    postalCode: normalizePostcode(document.getElementById('postal-code')?.value),
    houseNumber: document.getElementById('house-number')?.value.trim() || '',
    houseAddition: document.getElementById('house-addition')?.value.trim() || '',
    street: document.getElementById('street')?.value.trim() || '',
    city: document.getElementById('city')?.value.trim() || '',
    country: isBelgiumCheckout() ? 'België' : 'Nederland',
  };
}

function validateShipping(data) {
  if (!data) return null;

  if (!data.name) return 'Vul je naam in.';
  if (!data.email || !data.email.includes('@')) return 'Vul een geldig e-mailadres in.';
  if (!data.postalCode) return 'Vul je postcode in.';
  const normalizedPostcode = normalizePostcode(data.postalCode);
  if (isBelgiumCheckout()) {
    if (!/^\d{4}$/.test(normalizedPostcode)) {
      return 'Vul een geldige Belgische postcode in (bijv. 1000).';
    }
  } else if (!/^\d{4}[A-Za-z]{2}$/i.test(normalizedPostcode)) {
    return 'Vul een geldige Nederlandse postcode in (bijv. 1234AB).';
  }
  if (!data.houseNumber) return 'Vul je huisnummer in.';
  if (!data.street) return 'Vul je straat in of controleer postcode en huisnummer.';
  if (!data.city) return 'Vul je woonplaats in of controleer postcode en huisnummer.';

  return null;
}

function normalizePostcode(value) {
  const raw = String(value || '').replace(/\s+/g, '').toUpperCase();
  if (isBelgiumCheckout()) return raw.replace(/\D/g, '').slice(0, 4);
  return raw.slice(0, 6);
}

function formatPostcodeInput(value) {
  return normalizePostcode(value);
}

function setPostcodeStatus(text, type) {
  const statusEl = document.getElementById('postcode-lookup-status');
  if (!statusEl) return;

  if (!text) {
    statusEl.hidden = true;
    statusEl.textContent = '';
    statusEl.className = 'postcode-status';
    return;
  }

  statusEl.hidden = false;
  statusEl.textContent = text;
  statusEl.className = `postcode-status postcode-status--${type}`;
}

function applyAddressResult(data, streetEl, cityEl) {
  const street = data.street || data.straat || '';
  const city = data.city || data.woonplaats || data.municipality || '';
  if (!street || !city) return false;
  streetEl.value = street;
  cityEl.value = city;
  streetEl.dispatchEvent(new Event('input', { bubbles: true }));
  cityEl.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

async function fetchPostcodeLookup(postalCode, houseNumber, houseAddition) {
  const postcode = normalizePostcode(postalCode);
  const params = new URLSearchParams({
    postcode,
    number: String(houseNumber),
  });
  if (houseAddition) params.set('toevoeging', houseAddition);

  const url = `/api/postcode-lookup?${params}`;
  const { res, data } = await Api.apiFetch(url, { headers: { Accept: 'application/json' } });
  return { res, data };
}

async function lookupAddress() {
  if (isBelgiumCheckout()) return false;

  const postalEl = document.getElementById('postal-code');
  const houseEl = document.getElementById('house-number');
  const additionEl = document.getElementById('house-addition');
  const streetEl = document.getElementById('street');
  const cityEl = document.getElementById('city');

  if (!postalEl || !houseEl || !streetEl || !cityEl) return false;

  postalEl.value = normalizePostcode(postalEl.value);
  const postalCode = postalEl.value;
  const houseNumber = houseEl.value.trim();
  const houseAddition = additionEl?.value.trim() || '';

  if (!postalCode || !houseNumber) {
    setPostcodeStatus(null);
    return false;
  }

  if (!/^\d{4}[A-Z]{2}$/.test(postalCode)) {
    setPostcodeStatus(null);
    return false;
  }

  const requestId = ++postcodeLookupRequest;
  setPostcodeStatus('Adres opzoeken...', 'loading');

  try {
    if (requestId !== postcodeLookupRequest) return false;

    const { res, data } = await fetchPostcodeLookup(postalCode, houseNumber, houseAddition);

    if (requestId !== postcodeLookupRequest) return false;

    if (res.ok && applyAddressResult(data, streetEl, cityEl)) {
      setPostcodeStatus(null);
      return true;
    }

    streetEl.value = '';
    cityEl.value = '';
    setPostcodeStatus(data.error || 'Adres niet gevonden. Controleer postcode en huisnummer.', 'error');
    return false;
  } catch (err) {
    if (requestId !== postcodeLookupRequest) return false;
    setPostcodeStatus(err.message || 'Kon adres niet opzoeken. Probeer het opnieuw.', 'error');
    return false;
  }
}

async function ensureAddressFromPostcode() {
  const streetEl = document.getElementById('street');
  const cityEl = document.getElementById('city');
  if (streetEl?.value.trim() && cityEl?.value.trim()) return true;
  return lookupAddress();
}

function scheduleAddressLookup() {
  clearTimeout(postcodeLookupTimer);
  postcodeLookupTimer = setTimeout(lookupAddress, 600);
}

function initPostcodeLookup() {
  if (isBelgiumCheckout()) return;

  const postalEl = document.getElementById('postal-code');
  const houseEl = document.getElementById('house-number');
  const additionEl = document.getElementById('house-addition');

  if (!postalEl || !houseEl) return;

  const triggerLookup = () => {
    clearTimeout(postcodeLookupTimer);
    lookupAddress();
  };

  postalEl.addEventListener('input', (e) => {
    e.target.value = formatPostcodeInput(e.target.value);
    scheduleAddressLookup();
  });

  houseEl.addEventListener('input', scheduleAddressLookup);
  additionEl?.addEventListener('input', scheduleAddressLookup);

  postalEl.addEventListener('blur', () => {
    postalEl.value = normalizePostcode(postalEl.value);
    triggerLookup();
  });
  houseEl.addEventListener('blur', triggerLookup);
  additionEl?.addEventListener('blur', triggerLookup);
}

let productConfig = {
  slug: '1970cam',
  name: '1970cam',
  price: 69.99,
  originalPrice: 99.99,
  amountCents: 6999,
};

function formatEuroPrice(amount) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}

async function loadProductConfig() {
  const slug = getProductSlug();

  try {
    const { res, data } = await Api.apiFetch(`/api/config?p=${encodeURIComponent(slug)}`);
    if (res.ok && data.product) {
      productConfig = {
        ...data.product,
        slug: data.product.slug || slug,
        amountCents: Math.round(data.product.price * 100),
      };
    }
  } catch (_) {
    /* keep defaults */
  }

  document.querySelectorAll('[data-checkout-price]').forEach((el) => {
    el.textContent = formatEuroPrice(productConfig.price);
  });

  if (window.HearingDTC?.updateOrderSummary) {
    if (window.HearingDTCConfig?.product) {
      window.HearingDTCConfig.product.price = productConfig.price;
      window.HearingDTCConfig.product.originalPrice = productConfig.originalPrice || productConfig.price * 2;
      window.HearingDTCConfig.product.name = productConfig.name;
      if (productConfig.slug === '1970cam') {
        window.HearingDTCConfig.product.offerLabel = `1× ${window.HearingDTCConfig.brand?.name || '1970cam'}`;
      }
    }
    window.HearingDTC.updateOrderSummary();
  }

  const nameEl = document.getElementById('checkout-product-name');
  if (nameEl && productConfig.name) nameEl.textContent = productConfig.name;

  if (productConfig.slug === '1970cam') {
    document.title = 'Afrekenen | 1970cam';
  }
}

function getCheckoutAmountCents() {
  const bump = getOrderBumpSelected() && getProductSlug() === 'hearing' ? 995 : 0;
  return productConfig.amountCents + bump;
}

function usesCheckoutSession(method) {
  return method === 'ideal' || method === 'bancontact' || method === 'card' || method === 'klarna';
}

function isWalletPaymentMethod(method) {
  return method === 'apple_pay' || method === 'google_pay';
}

function redirectPaymentLabel(method) {
  const labels = {
    ideal: 'Doorverwijzen naar iDEAL...',
    bancontact: 'Doorverwijzen naar Bancontact...',
    card: 'Doorverwijzen naar creditcard betaling...',
    klarna: 'Doorverwijzen naar Klarna...',
  };
  return labels[method] || 'Doorverwijzen naar beveiligde betaling...';
}

let pendingAutoConfirm = false;

function getCheckoutAnalytics() {
  return window.FunnelTrack?.getAttribution?.() != null
    ? {
        productSlug: getProductSlug(),
        country: window.FunnelTrack.getAttribution().country.toUpperCase(),
        landerSlug: window.FunnelTrack.getAttribution().lander,
        sessionId: window.FunnelTrack.getSessionId(),
      }
    : { productSlug: getProductSlug() };
}

function getMetaCookies() {
  const read = (name) => {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : null;
  };
  return { fbc: read('_fbc'), fbp: read('_fbp') };
}

async function createCheckoutSession(email, method) {
  const continueText = document.getElementById('continue-text');
  if (continueText) continueText.textContent = redirectPaymentLabel(method);

  const { res, data } = await Api.apiFetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      paymentMethod: method,
      cancelUrl: window.location.href,
      successUrl: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      analytics: getCheckoutAnalytics(),
      meta: getMetaCookies(),
      shipping: shippingInfo,
      orderBump: getOrderBumpSelected(),
    }),
  });

  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Kon niet doorverwijzen naar Stripe');
  }

  window.location.assign(data.url);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadProductConfig();
  loadShippingFromStorage();
  initPostcodeLookup();
  await ensureAddressFromPostcode();

  const selectForm = document.getElementById('select-form');
  const emailInput = document.getElementById('email');
  const accordionToggle = document.getElementById('pm-accordion-toggle');
  const accordionBody = document.getElementById('pm-accordion-body');
  const btnBack = document.getElementById('btn-back');
  const btnSubmit = document.getElementById('submit-payment');

  if (!selectForm) return;

  const savedEmail = sessionStorage.getItem('checkout_email');
  if (savedEmail && emailInput) emailInput.value = savedEmail;

  const availableMethods = [...document.querySelectorAll('input[name="payment-method"]')].map(
    (radio) => radio.value
  );
  const savedMethod = sessionStorage.getItem('checkout_method');
  if (savedMethod && availableMethods.includes(savedMethod)) {
    selectMethod(savedMethod);
  } else {
    selectMethod(defaultPaymentMethod());
  }

  accordionToggle?.addEventListener('click', () => {
    const open = accordionBody.hidden;
    accordionBody.hidden = !open;
    accordionToggle.setAttribute('aria-expanded', String(open));
    accordionToggle.classList.toggle('open', open);
  });

  document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        selectMethod(radio.value);
        accordionBody.hidden = true;
        accordionToggle?.setAttribute('aria-expanded', 'false');
        accordionToggle?.classList.remove('open');
      }
    });
  });

  btnBack?.addEventListener('click', () => {
    destroyStripeElements();
    pendingAutoConfirm = false;
    const stepPay = document.getElementById('step-pay');
    stepPay.hidden = true;
    stepPay.classList.remove('wallet-step');
    document.getElementById('step-select').hidden = false;
    setContinueLoading(false);
  });

  btnSubmit?.addEventListener('click', () => handlePayment());

  selectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const addressOk = await ensureAddressFromPostcode();
    const shipping = collectShippingData();
    const shippingError = validateShipping(shipping);
    if (shippingError) {
      showMessage('select-message', shippingError);
      return;
    }
    if (!isBelgiumCheckout() && !addressOk && (!shipping.street || !shipping.city)) {
      showMessage('select-message', 'Kon straat en woonplaats niet ophalen. Controleer postcode en huisnummer.');
      return;
    }

    const email = shipping?.email || emailInput?.value.trim();
    if (!email || !email.includes('@')) {
      showMessage('select-message', 'Vul een geldig e-mailadres in.');
      return;
    }

    customerEmail = email;
    customerName = shipping?.name || '';
    shippingInfo = shipping;
    sessionStorage.setItem('checkout_email', email);
    sessionStorage.setItem('checkout_method', selectedMethod);
    if (shipping) sessionStorage.setItem('checkout_shipping', JSON.stringify(shipping));

    setContinueLoading(true);
    showMessage('select-message', null);

    try {
      if (usesCheckoutSession(selectedMethod)) {
        await createCheckoutSession(email, selectedMethod);
        return;
      }

      if (isWalletPaymentMethod(selectedMethod)) {
        if (!stripe) stripe = Stripe(STRIPE_PK);
        clientSecret = null;
        document.getElementById('step-select').hidden = true;
        const stepPay = document.getElementById('step-pay');
        stepPay.hidden = false;
        stepPay.classList.add('wallet-step');
        updatePayHeader(selectedMethod);
        stepPay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await mountWalletCheckout(selectedMethod);
        return;
      }

      throw new Error('Onbekende betaalmethode. Kies een andere optie.');
    } catch (err) {
      showMessage('select-message', err.message);
    } finally {
      setContinueLoading(false);
    }
  });
});

function selectMethod(method) {
  selectedMethod = method;

  document.querySelectorAll('input[name="payment-method"]').forEach((r) => {
    r.checked = r.value === method;
    r.closest('.pm-option')?.classList.toggle('selected', r.checked);
  });

  const labelEl = document.getElementById('pm-selected-label');
  const iconEl = document.getElementById('pm-selected-icon');
  if (labelEl) labelEl.textContent = METHOD_LABELS[method];
  if (iconEl) iconEl.innerHTML = METHOD_ICONS[method];

  const continueText = document.getElementById('continue-text');
  if (continueText) {
    continueText.textContent = isDtcCheckout() || isDtcPayPage() ? dtcConfirmLabel() : 'Doorgaan naar betalen';
  }
}

function buildStripeBillingDetails() {
  const shipping = shippingInfo || {};
  const house = [shipping.houseNumber, shipping.houseAddition].filter(Boolean).join(' ');
  const line1 = [shipping.street, house].filter(Boolean).join(' ').trim();
  const country =
    shipping.country === 'België' || isBelgiumCheckout() ? 'BE' : 'NL';

  return {
    email: customerEmail || shipping.email || undefined,
    name: customerName || shipping.name || undefined,
    address: line1
      ? {
          line1,
          city: shipping.city || undefined,
          postal_code: shipping.postalCode || undefined,
          country,
        }
      : undefined,
  };
}

function buildStripeShippingDetails() {
  const shipping = shippingInfo || {};
  if (!shipping.name && !shipping.street) return undefined;
  const house = [shipping.houseNumber, shipping.houseAddition].filter(Boolean).join(' ');
  const line1 = [shipping.street, house].filter(Boolean).join(' ').trim();
  const country =
    shipping.country === 'België' || isBelgiumCheckout() ? 'BE' : 'NL';

  return {
    name: shipping.name || customerName || 'Klant',
    address: {
      line1: line1 || 'Onbekend',
      city: shipping.city || '',
      postal_code: shipping.postalCode || '',
      country,
    },
  };
}

function updatePayHeader(method) {
  document.getElementById('pm-pay-label').textContent = METHOD_LABELS[method];
  document.getElementById('pm-pay-icon').innerHTML = METHOD_ICONS[method];
}

async function createPaymentIntent(email, method, options = {}) {
  if (!options.preserveElements) {
    destroyStripeElements();
  }

  const { res, data } = await Api.apiFetch('/api/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      paymentMethod: method,
      analytics: getCheckoutAnalytics(),
      meta: getMetaCookies(),
      shipping: shippingInfo,
      orderBump: getOrderBumpSelected(),
    }),
  });

  if (!res.ok) throw new Error(data.error || 'Kon betaling niet starten');

  clientSecret = data.clientSecret;
  if (!stripe) stripe = Stripe(STRIPE_PK);
}

async function handleWalletConfirm(method) {
  const messageEl = document.getElementById('payment-message');
  messageEl.hidden = true;

  const { error: submitError } = await elements.submit();
  if (submitError) {
    messageEl.textContent = submitError.message;
    messageEl.hidden = false;
    return;
  }

  if (!clientSecret) {
    try {
      await createPaymentIntent(customerEmail, method, { preserveElements: true });
    } catch (err) {
      messageEl.textContent = err.message;
      messageEl.hidden = false;
      return;
    }
  }

  const { error } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/success.html`,
      receipt_email: customerEmail,
      shipping: buildStripeShippingDetails(),
      payment_method_data: {
        billing_details: buildStripeBillingDetails(),
      },
    },
  });

  if (error) {
    messageEl.textContent = error.message;
    messageEl.hidden = false;
  }
}

async function tryMountPaymentRequestButton(method, amount) {
  const container = document.getElementById('wallet-button-container');
  const walletUnavailable = document.getElementById('wallet-unavailable');

  paymentRequest = stripe.paymentRequest({
    country: stripeCountryCode(),
    currency: 'eur',
    total: { label: productConfig.name || '1970cam', amount },
    requestPayerEmail: true,
    requestPayerName: true,
  });

  const canPay = await paymentRequest.canMakePayment();
  if (!canPay) return false;
  if (method === 'apple_pay' && !canPay.applePay) return false;
  if (method === 'google_pay' && !canPay.googlePay) return false;

  const prElements = stripe.elements();
  paymentRequestButton = prElements.create('paymentRequestButton', {
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: 'buy',
        theme: 'dark',
        height: '50px',
      },
    },
  });

  paymentRequest.on('paymentmethod', async (ev) => {
    const messageEl = document.getElementById('payment-message');
    messageEl.hidden = true;
    try {
      if (!clientSecret) {
        await createPaymentIntent(customerEmail, method, { preserveElements: true });
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: ev.paymentMethod.id,
          shipping: buildStripeShippingDetails(),
        },
        { handleActions: true }
      );

      if (error) {
        ev.complete('fail');
        messageEl.textContent = error.message;
        messageEl.hidden = false;
        return;
      }

      ev.complete('success');
      if (paymentIntent?.status === 'succeeded') {
        window.location.href = `${window.location.origin}/success.html?payment_intent=${paymentIntent.id}`;
      }
    } catch (err) {
      ev.complete('fail');
      messageEl.textContent = err.message || 'Betaling mislukt';
      messageEl.hidden = false;
    }
  });

  container.innerHTML = '';
  paymentRequestButton.mount('#wallet-button-container');
  walletUnavailable.hidden = true;
  return true;
}

async function mountWalletCheckout(method) {
  const payArea = document.getElementById('stripe-payment-area');
  const expressArea = document.getElementById('stripe-express-area');
  const submitBtn = document.getElementById('submit-payment');
  const walletUnavailable = document.getElementById('wallet-unavailable');
  const container = document.getElementById('wallet-button-container');

  if (payArea) payArea.hidden = true;
  if (submitBtn) {
    submitBtn.hidden = true;
    submitBtn.disabled = true;
  }
  expressArea.hidden = false;
  container.innerHTML = '';
  walletUnavailable.hidden = true;

  const amount = getCheckoutAmountCents();
  const productLabel = productConfig.name || '1970cam';

  const prMounted = await tryMountPaymentRequestButton(method, amount);
  if (prMounted) return;

  elements = stripe.elements({
    mode: 'payment',
    amount,
    currency: 'eur',
    appearance: getStripeAppearance(),
    locale: 'nl',
  });

  expressCheckout = elements.create('expressCheckout', {
    paymentMethods: {
      applePay: method === 'apple_pay' ? 'always' : 'never',
      googlePay: method === 'google_pay' ? 'always' : 'never',
      link: 'never',
      paypal: 'never',
      amazonPay: 'never',
      klarna: 'never',
    },
    business: { name: productLabel },
    lineItems: [{ name: productLabel, amount }],
    emailRequired: false,
    buttonType: {
      applePay: 'buy',
      googlePay: 'buy',
    },
    buttonTheme: {
      applePay: 'black',
      googlePay: 'black',
    },
    buttonHeight: 50,
    layout: {
      maxColumns: 1,
      maxRows: 1,
    },
  });

  let walletReady = false;

  expressCheckout.on('availablepaymentmethodschange', ({ availablePaymentMethods }) => {
    const available =
      method === 'apple_pay'
        ? availablePaymentMethods?.applePay
        : availablePaymentMethods?.googlePay;
    if (available) {
      walletReady = true;
      walletUnavailable.hidden = true;
    }
  });

  expressCheckout.on('confirm', () => handleWalletConfirm(method));

  expressCheckout.mount('#wallet-button-container');

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const hasWalletUi =
    walletReady ||
    container.querySelector('button') ||
    container.querySelector('iframe') ||
    container.offsetHeight > 44;

  if (!hasWalletUi) {
    walletUnavailable.textContent =
      method === 'apple_pay'
        ? 'Apple Pay kon niet worden geladen. Gebruik Safari op een iPhone, iPad of Mac met Apple Pay ingesteld, of kies een andere betaalmethode.'
        : 'Google Pay kon niet worden geladen. Gebruik Chrome met Google Pay ingesteld, of kies een andere betaalmethode.';
    walletUnavailable.hidden = false;
  }
}

function is1970camCheckout() {
  return (
    document.body.dataset.trackProduct === '1970cam' ||
    productConfig.slug === '1970cam'
  );
}

function dtcPrimaryColor() {
  return is1970camCheckout() ? '#2A2622' : '#172b4d';
}

function getStripeAppearance() {
  const primary = isDtcCheckout() ? dtcPrimaryColor() : '#2563eb';
  const focusRing = is1970camCheckout()
    ? '0 0 0 3px rgba(42,38,34,0.12)'
    : isDtcCheckout()
      ? '0 0 0 3px rgba(23,43,77,0.1)'
      : '0 0 0 3px #dbeafe';

  return {
    theme: 'stripe',
    variables: {
      colorPrimary: primary,
      colorBackground: is1970camCheckout() ? '#FAF7F2' : '#ffffff',
      colorText: is1970camCheckout() ? '#1C1A17' : '#0f172a',
      borderRadius: '10px',
      fontFamily: isDtcCheckout() ? 'Plus Jakarta Sans, Inter, sans-serif' : 'Inter, sans-serif',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': {
        border: `1px solid ${is1970camCheckout() ? '#E3DCCE' : '#e2e8f0'}`,
        boxShadow: 'none',
        backgroundColor: is1970camCheckout() ? '#FAF7F2' : undefined,
      },
      '.Input:focus': {
        border: `1px solid ${primary}`,
        boxShadow: focusRing,
      },
      '.Label': { fontWeight: '600', fontSize: '13px' },
    },
  };
}

async function mountPaymentUI(method) {
  const appearance = getStripeAppearance();
  const payArea = document.getElementById('stripe-payment-area');
  const expressArea = document.getElementById('stripe-express-area');
  const submitBtn = document.getElementById('submit-payment');
  const walletUnavailable = document.getElementById('wallet-unavailable');

  if (!payArea || !expressArea || !submitBtn) {
    throw new Error('Betaalformulier kon niet worden geladen. Vernieuw de pagina.');
  }

  payArea.hidden = true;
  expressArea.hidden = true;
  submitBtn.hidden = true;
  submitBtn.disabled = true;
  walletUnavailable.hidden = true;

  if (method === 'apple_pay' || method === 'google_pay') {
    await mountWalletCheckout(method);
  } else {
    elements = stripe.elements({ clientSecret, appearance, locale: 'nl' });
    payArea.hidden = false;
    submitBtn.hidden = false;

    paymentElement = elements.create('payment', {
      paymentMethodOrder: [method === 'card' ? 'card' : method],
      fields: {
        billingDetails: {
          name: 'never',
          email: 'never',
          phone: 'never',
          address: 'never',
        },
      },
      defaultValues: {
        billingDetails: buildStripeBillingDetails(),
      },
      wallets: { applePay: 'never', googlePay: 'never', link: 'never' },
    });

    paymentElement.mount('#payment-element');
    paymentElement.on('ready', () => {
      submitBtn.disabled = false;
    });
  }
}

async function handlePayment() {
  const messageEl = document.getElementById('payment-message');

  setPayLoading(true);
  messageEl.hidden = true;

  const { error: submitError } = await elements.submit();
  if (submitError) {
    messageEl.textContent = submitError.message;
    messageEl.hidden = false;
    setPayLoading(false);
    return;
  }

  const { error } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/success.html`,
      receipt_email: customerEmail,
      shipping: buildStripeShippingDetails(),
      payment_method_data: {
        billing_details: buildStripeBillingDetails(),
      },
    },
  });

  if (error) {
    messageEl.textContent = error.message;
    messageEl.hidden = false;
    setPayLoading(false);
    const payText = document.getElementById('button-text');
    if (payText && (isDtcPayPage() || isDtcCheckout())) {
      payText.textContent = dtcConfirmLabel();
    }
  }
}

function destroyStripeElements() {
  if (paymentElement) {
    paymentElement.unmount();
    paymentElement = null;
  }
  if (expressCheckout) {
    expressCheckout.unmount();
    expressCheckout = null;
  }
  if (paymentRequestButton) {
    paymentRequestButton.unmount();
    paymentRequestButton = null;
  }
  paymentRequest = null;
  elements = null;
  clientSecret = null;
  const container = document.getElementById('wallet-button-container');
  if (container) container.innerHTML = '';
  const walletUnavailable = document.getElementById('wallet-unavailable');
  if (walletUnavailable) walletUnavailable.hidden = true;
}

function showMessage(id, text) {
  const el = document.getElementById(id);
  if (!text) {
    el.hidden = true;
    return;
  }
  el.textContent = text;
  el.hidden = false;
}

function setContinueLoading(loading) {
  const btn = document.getElementById('btn-continue');
  const spinner = document.getElementById('continue-spinner');
  const text = document.getElementById('continue-text');
  if (!btn || !spinner || !text) return;
  btn.disabled = loading;
  spinner.hidden = !loading;
  text.textContent = loading
    ? 'Even geduld...'
    : isDtcCheckout()
      ? dtcConfirmLabel()
      : 'Doorgaan naar betalen';
}

function setPayLoading(loading) {
  const submitBtn = document.getElementById('submit-payment');
  const spinner = document.getElementById('spinner');
  const buttonText = document.getElementById('button-text');
  if (!submitBtn || !spinner || !buttonText || submitBtn.hidden) return;
  submitBtn.disabled = loading;
  spinner.hidden = !loading;
  buttonText.textContent = loading
    ? 'Bezig met verwerken...'
    : isDtcPayPage() || (isDtcCheckout() && ['hearing', '1970cam'].includes(productConfig.slug))
      ? 'Bevestig uw bestelling!'
      : isDtcCheckout()
        ? 'Bestelling afronden'
        : productConfig.slug === 'hearing'
          ? 'Bevestig uw bestelling!'
          : 'Begin vandaag met beter slapen';
}
