const STRIPE_PK =
  'pk_live_51TQqFYLGVqAZBTckWzCiVrZsmrJX5rkUxuYVjFkIMZVMVE6990yANMCjbn17Osp3ZVmgHrticwv7tHzoB0KTTWRO00dWpf0uMj';

const METHOD_LABELS = {
  ideal: 'iDEAL',
  card: 'Creditcard',
  klarna: 'Klarna',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
};

const METHOD_ICONS = {
  ideal: '<span class="pm-logo ideal-logo sm">iDEAL</span>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  klarna: '<span class="pm-logo klarna-logo sm">Klarna</span>',
  apple_pay: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
  google_pay: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
};

let stripe;
let elements;
let paymentElement;
let walletButton;
let paymentRequest;
let clientSecret;
let selectedMethod = 'ideal';
let customerEmail = '';

document.addEventListener('DOMContentLoaded', () => {
  const selectForm = document.getElementById('select-form');
  const emailInput = document.getElementById('email');
  const accordionToggle = document.getElementById('pm-accordion-toggle');
  const accordionBody = document.getElementById('pm-accordion-body');
  const btnBack = document.getElementById('btn-back');
  const btnSubmit = document.getElementById('submit-payment');

  const savedEmail = sessionStorage.getItem('checkout_email');
  if (savedEmail) emailInput.value = savedEmail;

  const savedMethod = sessionStorage.getItem('checkout_method');
  if (savedMethod && METHOD_LABELS[savedMethod]) {
    selectMethod(savedMethod);
  } else {
    selectMethod('ideal');
  }

  accordionToggle.addEventListener('click', () => {
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
        accordionToggle.setAttribute('aria-expanded', 'false');
        accordionToggle.classList.remove('open');
      }
    });
  });

  btnBack.addEventListener('click', () => {
    destroyStripeElements();
    document.getElementById('step-pay').hidden = true;
    document.getElementById('step-select').hidden = false;
  });

  btnSubmit.addEventListener('click', () => handlePayment());

  selectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      showMessage('select-message', 'Vul een geldig e-mailadres in.');
      return;
    }

    customerEmail = email;
    sessionStorage.setItem('checkout_email', email);
    sessionStorage.setItem('checkout_method', selectedMethod);

    setContinueLoading(true);
    showMessage('select-message', null);

    try {
      await initPaymentStep(email, selectedMethod);
      document.getElementById('step-select').hidden = true;
      document.getElementById('step-pay').hidden = false;
      updatePayHeader(selectedMethod);
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

  document.getElementById('pm-selected-label').textContent = METHOD_LABELS[method];
  document.getElementById('pm-selected-icon').innerHTML = METHOD_ICONS[method];
}

function updatePayHeader(method) {
  document.getElementById('pm-pay-label').textContent = METHOD_LABELS[method];
  document.getElementById('pm-pay-icon').innerHTML = METHOD_ICONS[method];
}

async function initPaymentStep(email, method) {
  destroyStripeElements();

  const analytics =
    window.FunnelTrack?.getAttribution?.() != null
      ? {
          productSlug: window.FunnelTrack.getAttribution().product,
          country: window.FunnelTrack.getAttribution().country.toUpperCase(),
          landerSlug: window.FunnelTrack.getAttribution().lander,
          sessionId: window.FunnelTrack.getSessionId(),
        }
      : {};

  function getMetaCookies() {
    const read = (name) => {
      const match = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
      );
      return match ? decodeURIComponent(match[1]) : null;
    };
    return { fbc: read('_fbc'), fbp: read('_fbp') };
  }

  const { res, data } = await Api.apiFetch('/api/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, paymentMethod: method, analytics, meta: getMetaCookies() }),
  });

  if (!res.ok) throw new Error(data.error || 'Kon betaling niet starten');

  clientSecret = data.clientSecret;
  stripe = Stripe(STRIPE_PK);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      borderRadius: '10px',
      fontFamily: 'Inter, sans-serif',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': { border: '1px solid #e2e8f0', boxShadow: 'none' },
      '.Input:focus': { border: '1px solid #2563eb', boxShadow: '0 0 0 3px #dbeafe' },
      '.Label': { fontWeight: '600', fontSize: '13px' },
    },
  };

  const payArea = document.getElementById('stripe-payment-area');
  const expressArea = document.getElementById('stripe-express-area');
  const submitBtn = document.getElementById('submit-payment');
  const walletUnavailable = document.getElementById('wallet-unavailable');

  payArea.hidden = true;
  expressArea.hidden = true;
  submitBtn.hidden = true;
  submitBtn.disabled = true;
  walletUnavailable.hidden = true;

  if (method === 'apple_pay' || method === 'google_pay') {
    await initWalletButton(method);
  } else {
    elements = stripe.elements({ clientSecret, appearance, locale: 'nl' });
    payArea.hidden = false;
    submitBtn.hidden = false;

    paymentElement = elements.create('payment', {
      paymentMethodOrder: [method === 'card' ? 'card' : method],
      fields: { billingDetails: { name: 'auto', email: 'never' } },
      wallets: { applePay: 'never', googlePay: 'never', link: 'never' },
    });

    paymentElement.mount('#payment-element');
    paymentElement.on('ready', () => {
      submitBtn.disabled = false;
    });
  }
}

async function initWalletButton(method) {
  const expressArea = document.getElementById('stripe-express-area');
  const walletUnavailable = document.getElementById('wallet-unavailable');
  const container = document.getElementById('wallet-button-container');

  expressArea.hidden = false;
  container.innerHTML = '';

  elements = stripe.elements();

  paymentRequest = stripe.paymentRequest({
    country: 'NL',
    currency: 'eur',
    total: {
      label: 'Slaap Beter Slapen — E-book Bundel',
      amount: 1700,
    },
    requestPayerEmail: true,
  });

  const canPay = await paymentRequest.canMakePayment();

  if (!canPay) {
    walletUnavailable.textContent =
      method === 'apple_pay'
        ? 'Apple Pay is niet beschikbaar op dit apparaat of browser. Gebruik Safari op een Apple-apparaat, of kies een andere betaalmethode.'
        : 'Google Pay is niet beschikbaar op dit apparaat of browser. Kies een andere betaalmethode.';
    walletUnavailable.hidden = false;
    return;
  }

  if (method === 'apple_pay' && !canPay.applePay) {
    walletUnavailable.textContent =
      'Apple Pay is niet beschikbaar. Gebruik Safari op een iPhone, iPad of Mac, of kies een andere betaalmethode.';
    walletUnavailable.hidden = false;
    return;
  }

  if (method === 'google_pay' && !canPay.googlePay) {
    walletUnavailable.textContent =
      'Google Pay is niet beschikbaar op dit apparaat. Kies een andere betaalmethode.';
    walletUnavailable.hidden = false;
    return;
  }

  paymentRequest.on('paymentmethod', async (ev) => {
    const messageEl = document.getElementById('payment-message');
    messageEl.hidden = true;

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id, receipt_email: customerEmail },
        { handleActions: false }
      );

      if (error) {
        ev.complete('fail');
        messageEl.textContent = error.message;
        messageEl.hidden = false;
        return;
      }

      ev.complete('success');

      if (paymentIntent.status === 'requires_action') {
        const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
        if (actionError) {
          messageEl.textContent = actionError.message;
          messageEl.hidden = false;
          return;
        }
      }

      window.location.href = `${window.location.origin}/success.html?payment_intent=${paymentIntent.id}`;
    } catch (err) {
      ev.complete('fail');
      messageEl.textContent = err.message;
      messageEl.hidden = false;
    }
  });

  walletButton = elements.create('paymentRequestButton', {
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: 'buy',
        theme: method === 'apple_pay' ? 'black' : 'default',
        height: '52px',
      },
    },
  });

  walletButton.mount('#wallet-button-container');
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
      payment_method_data: {
        billing_details: { email: customerEmail },
      },
    },
  });

  if (error) {
    messageEl.textContent = error.message;
    messageEl.hidden = false;
    setPayLoading(false);
  }
}

function destroyStripeElements() {
  if (paymentElement) {
    paymentElement.unmount();
    paymentElement = null;
  }
  if (walletButton) {
    walletButton.unmount();
    walletButton = null;
  }
  paymentRequest = null;
  elements = null;
  clientSecret = null;
  const container = document.getElementById('wallet-button-container');
  if (container) container.innerHTML = '';
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
  btn.disabled = loading;
  spinner.hidden = !loading;
  text.textContent = loading ? 'Even geduld...' : 'Doorgaan naar betalen';
}

function setPayLoading(loading) {
  const submitBtn = document.getElementById('submit-payment');
  const spinner = document.getElementById('spinner');
  const buttonText = document.getElementById('button-text');
  if (submitBtn.hidden) return;
  submitBtn.disabled = loading;
  spinner.hidden = !loading;
  buttonText.textContent = loading ? 'Bezig met verwerken...' : 'Begin vandaag met beter slapen';
}
