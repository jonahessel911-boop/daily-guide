const QUESTIONS = [
  {
    type: 'choice',
    question: 'Is de stoel voor uzelf of voor een naaste?',
    buttons: [
      { label: 'Voor mijzelf', value: 'zelf' },
      { label: 'Voor iemand anders', value: 'ander' },
    ],
    layout: 'stack',
    hint: 'Meedoen duurt maar 1 minuut',
    showHero: true,
    showContent: true,
    header: 'Beantwoord 4 korte vragen om te zien of u of een naaste in aanmerking komt.',
  },
  {
    type: 'choice',
    question: 'Waar heeft u momenteel de meeste moeite mee?',
    buttons: [
      { label: 'Zelfstandig opstaan uit een stoel', value: 'opstaan' },
      { label: 'Comfortabel zitten zonder pijn', value: 'pijn' },
      { label: 'Lang zitten met voldoende ondersteuning', value: 'ondersteuning' },
      { label: 'Een combinatie hiervan', value: 'combinatie' },
    ],
    layout: 'stack',
    hint: 'Kies wat het meest herkenbaar is.',
    showHero: false,
    showContent: false,
    header: null,
  },
  {
    type: 'choice',
    question: 'In hoeverre beperkt uw huidige stoel u in het dagelijks leven?',
    buttons: [
      { label: 'Een beetje, maar ik wil erger voorkomen', value: 'beetje' },
      { label: 'Regelmatig bij het opstaan en gaan zitten', value: 'regelmatig' },
      { label: 'Veel, ik vermijd soms om op te staan', value: 'veel' },
      { label: 'Zeer veel, ik heb vaak hulp nodig', value: 'zeer_veel' },
    ],
    layout: 'stack',
    hint: 'Er is geen goed of fout antwoord.',
    showHero: false,
    showContent: false,
    header: null,
  },
  {
    type: 'choice',
    question: 'Wat vindt u het belangrijkst aan een nieuwe stoel?',
    buttons: [
      { label: 'Makkelijk en zelfstandig kunnen opstaan', value: 'opstaan' },
      { label: 'Minder druk op rug, knieën en heupen', value: 'minder_druk' },
      { label: 'Extra comfort en goede ondersteuning', value: 'comfort' },
      { label: 'Een stoel die ook mooi in de woonkamer staat', value: 'uiterlijk' },
    ],
    layout: 'stack',
    hint: 'Bijna klaar — daarna controleren we of u in aanmerking komt.',
    showHero: false,
    showContent: false,
    header: null,
  },
];

const TESTIMONIALS = [
  {
    name: 'Maria V.',
    text: '“Ik kan eindelijk weer zelfstandig opstaan zonder hulp. Dat geeft zoveel rust.”',
  },
  {
    name: 'Henk B.',
    text: '“De adviseur stelde alles af op mijn lengte. Het verschil met mijn oude stoel is enorm.”',
  },
  {
    name: 'Annie de K.',
    text: '“Gratis thuis uitproberen gaf me alle tijd. Geen druk, gewoon zelf ervaren of het past.”',
  },
];

const answers = {};
let currentStep = 0;
let testimonialIndex = 0;

const el = {
  phaseSurvey: document.getElementById('phase-survey'),
  phaseLoading: document.getElementById('phase-loading'),
  phaseContact: document.getElementById('phase-contact'),
  phaseDone: document.getElementById('phase-done'),
  question: document.getElementById('survey-question'),
  buttons: document.getElementById('survey-buttons'),
  formSlot: document.getElementById('survey-form-slot'),
  contactFormSlot: document.getElementById('contact-form-slot'),
  hint: document.getElementById('survey-hint'),
  hero: document.getElementById('survey-hero'),
  header: document.getElementById('survey-header'),
  content: document.getElementById('survey-content'),
  footer: document.getElementById('survey-footer'),
  progressSteps: document.getElementById('progress-steps'),
  loadingStatus: document.getElementById('loading-status'),
  testimonialName: document.getElementById('testimonial-name'),
  testimonialText: document.getElementById('testimonial-text'),
  testimonialCounter: document.getElementById('testimonial-counter'),
};

function renderStep() {
  const q = QUESTIONS[currentStep];
  if (!q) return;

  el.question.textContent = q.question;
  el.hint.textContent = q.hint;
  el.hint.classList.remove('hidden');
  el.hero.classList.toggle('hidden', !q.showHero);
  el.content.classList.toggle('hidden', !q.showContent);
  if (el.footer) el.footer.classList.toggle('hidden', !q.showContent);

  if (q.header) {
    el.header.textContent = q.header;
    el.header.classList.remove('hidden');
  } else {
    el.header.classList.add('hidden');
  }

  el.buttons.innerHTML = '';
  if (el.formSlot) {
    el.formSlot.innerHTML = '';
    el.formSlot.classList.add('hidden');
  }
  el.buttons.classList.remove('hidden', 'is-row', 'is-grid');
  el.buttons.classList.toggle('is-row', q.layout === 'row');
  el.buttons.classList.toggle('is-grid', q.layout === 'grid');

  el.buttons.innerHTML = q.buttons
    .map(
      (b) =>
        `<button type="button" class="survey-btn" data-value="${escapeAttr(b.value)}">` +
        `<span>${escapeHtml(b.label)}</span>` +
        `<span class="arrow" aria-hidden="true">→</span>` +
        `</button>`
    )
    .join('');

  el.buttons.querySelectorAll('.survey-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleAnswer(btn.dataset.value));
  });

  updateProgress();
}

function buildLeadForm() {
  return `
    <form class="lead-form" id="lead-form" novalidate>
      <div class="lead-field">
        <label for="lead-naam">Voor- en achternaam</label>
        <input id="lead-naam" name="naam" type="text" autocomplete="name" required placeholder="Bijv. Jan de Vries">
      </div>
      <div class="lead-field">
        <label for="lead-telefoon">Telefoonnummer</label>
        <input id="lead-telefoon" name="telefoon" type="tel" autocomplete="tel" required inputmode="tel" placeholder="06 12345678">
      </div>
      <div class="lead-field">
        <label for="lead-email">E-mailadres</label>
        <input id="lead-email" name="email" type="email" autocomplete="email" required placeholder="naam@email.nl">
      </div>
      <div class="lead-row">
        <div class="lead-field">
          <label for="lead-postcode">Postcode</label>
          <input id="lead-postcode" name="postcode" type="text" autocomplete="postal-code" required placeholder="1234 AB">
        </div>
        <div class="lead-field">
          <label for="lead-huisnr">Huisnr</label>
          <input id="lead-huisnr" name="huisnr" type="text" autocomplete="address-line2" required inputmode="text" placeholder="12">
        </div>
      </div>
      <p class="lead-error" id="lead-error" role="alert"></p>
      <button type="submit" class="lead-submit">Plan gratis proefzit →</button>
      <p class="lead-privacy">Wij gebruiken uw gegevens alleen om contact op te nemen over de proefzit.</p>
    </form>
  `;
}

function resolveZittuLander() {
  try {
    const params = new URLSearchParams(window.location.search);
    let lander = params.get('l');
    if (!lander && window.FunnelTrack) {
      lander = window.FunnelTrack.getAttribution().lander;
    }
    if (!lander) {
      const from = params.get('from');
      if (from === 'adv1') lander = 'adv-1';
      else if (from === 'adv3') lander = 'adv-3';
    }
    if (!lander) lander = document.body?.dataset?.trackLander || 'adv-2';
    return lander;
  } catch (_) {
    return document.body?.dataset?.trackLander || 'adv-2';
  }
}

function bindLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('lead-error');
    const data = {
      naam: form.naam.value.trim(),
      telefoon: form.telefoon.value.trim(),
      email: form.email.value.trim(),
      postcode: form.postcode.value.trim(),
      huisnr: form.huisnr.value.trim(),
    };

    form.querySelectorAll('input').forEach((input) => input.classList.remove('is-invalid'));

    const missing = Object.entries(data).filter(([, v]) => !v);
    if (missing.length) {
      missing.forEach(([key]) => {
        const input = form.elements[key];
        if (input) input.classList.add('is-invalid');
      });
      errorEl.textContent = 'Vul alle velden in om verder te gaan.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.email.classList.add('is-invalid');
      errorEl.textContent = 'Vul een geldig e-mailadres in.';
      return;
    }

    errorEl.textContent = '';
    answers.contact = data;
    const lander = resolveZittuLander();

    try {
      sessionStorage.setItem('zittu_lead', JSON.stringify(answers));
    } catch (_) { /* ignore */ }

    let meta = {};
    try {
      if (typeof window.trackEvent === 'function') {
        meta = window.trackEvent('Lead', { content_name: 'zittu-proefzit', lander }) || {};
      } else if (window.MetaPixelLeads?.trackLead) {
        meta = window.MetaPixelLeads.trackLead({ content_name: 'zittu-proefzit', lander }) || {};
      }
    } catch (_) { /* ignore */ }

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: 'zittu',
          country: 'NL',
          landerSlug: lander,
          ...data,
          provincie: answers.provincie || null,
          stoel: answers.stoel || null,
          source: 'adv-2-funnel',
          contentName: 'zittu-proefzit',
          eventId: meta.eventId || undefined,
          fbp: meta.fbp || undefined,
          fbc: meta.fbc || undefined,
          eventSourceUrl: meta.eventSourceUrl || window.location.href,
          externalId: meta.externalId || undefined,
          testEventCode: meta.testEventCode || undefined,
        }),
        keepalive: true,
      });
    } catch (_) { /* ignore network */ }

    showDone();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function updateProgress() {
  const steps = el.progressSteps.querySelectorAll('.progress-step');
  el.progressSteps.classList.remove('hidden');

  steps.forEach((step, i) => {
    step.classList.remove('active', 'done');
    if (i < currentStep) {
      step.classList.add('done');
      step.innerHTML = '✓';
    } else if (i === currentStep) {
      step.classList.add('active');
      step.textContent = String(i + 1);
    } else {
      step.textContent = String(i + 1);
    }
  });
}

function handleAnswer(value) {
  const key = ['voor_wie', 'moeite_mee', 'beperking', 'belangrijkst'][currentStep];
  if (key) answers[key] = value;

  currentStep += 1;

  if (currentStep >= QUESTIONS.length) {
    startQualifyLoading();
    return;
  }

  renderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startQualifyLoading() {
  el.phaseSurvey.classList.add('hidden');
  el.phaseContact.classList.add('hidden');
  el.phaseDone.classList.add('hidden');
  el.phaseLoading.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (el.loadingStatus) {
    el.loadingStatus.textContent = 'Controleren of u in aanmerking komt....';
  }

  setTimeout(showContactForm, 2800);
}

function showContactForm() {
  el.phaseLoading.classList.add('hidden');
  el.phaseSurvey.classList.add('hidden');
  el.phaseDone.classList.add('hidden');
  el.phaseContact.classList.remove('hidden');

  if (el.contactFormSlot) {
    el.contactFormSlot.innerHTML = buildLeadForm();
    bindLeadForm();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDone() {
  el.phaseLoading.classList.add('hidden');
  el.phaseSurvey.classList.add('hidden');
  el.phaseContact.classList.add('hidden');
  el.phaseDone.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  try {
    sessionStorage.setItem('zittu_lead', JSON.stringify(answers));
  } catch (_) { /* ignore */ }
}

function showTestimonial(idx) {
  testimonialIndex = (idx + TESTIMONIALS.length) % TESTIMONIALS.length;
  const t = TESTIMONIALS[testimonialIndex];
  el.testimonialName.textContent = t.name;
  el.testimonialText.textContent = t.text;
  el.testimonialCounter.textContent = `${testimonialIndex + 1}/${TESTIMONIALS.length}`;
}

document.getElementById('testimonial-prev').addEventListener('click', () => {
  showTestimonial(testimonialIndex - 1);
});

document.getElementById('testimonial-next').addEventListener('click', () => {
  showTestimonial(testimonialIndex + 1);
});

(function prefillFromQuery() {
  try {
    const params = new URLSearchParams(window.location.search);
    const provincie = params.get('provincie');
    const stoel = params.get('stoel');
    const from = params.get('from');

    if (provincie) answers.provincie = provincie;
    if (stoel) answers.stoel = stoel;

    // adv/1 & adv/3: gebruiker heeft al geklikt (stoel/CTA/provincie) → sla eerste vraag over
    // adv/2: start bij vraag 1 ("voor mijzelf / iemand anders")
    if (from === 'adv1' || from === 'adv3' || stoel || provincie) {
      answers.voor_wie = answers.voor_wie || 'zelf';
      currentStep = 1;
    }
  } catch (_) { /* ignore */ }
})();

renderStep();
showTestimonial(0);
