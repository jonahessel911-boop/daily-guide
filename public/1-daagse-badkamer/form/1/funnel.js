const QUESTIONS = [
  {
    question: 'Is de badkamerrenovatie voor uzelf of voor een naaste?',
    buttons: [
      { label: 'Voor mijzelf', value: 'zelf' },
      { label: 'Voor iemand anders', value: 'ander' },
    ],
    hint: 'Meedoen duurt maar 1 minuut',
    showHero: true,
    showContent: true,
    header: 'Beantwoord 4 korte vragen om te zien of u in aanmerking komt.',
  },
  {
    question: 'Waar heeft u momenteel de meeste moeite mee bij het douchen?',
    buttons: [
      { label: 'Over een hoge doucherand stappen', value: 'rand' },
      { label: 'Gladde tegels / uitglijden', value: 'glad' },
      { label: 'Geen steun om me vast te houden', value: 'steun' },
      { label: 'Een combinatie hiervan', value: 'combinatie' },
    ],
    hint: 'Kies wat het meest herkenbaar is.',
    showHero: false,
    showContent: false,
    header: null,
  },
  {
    question: 'Hoe vaak voelt u zich onveilig of gespannen in de douche?',
    buttons: [
      { label: 'Soms — ik wil erger voorkomen', value: 'soms' },
      { label: 'Regelmatig bij in- of uitstappen', value: 'regelmatig' },
      { label: 'Vaak — ik douche korter of minder', value: 'vaak' },
      { label: 'Bijna altijd — ik heb soms hulp nodig', value: 'altijd' },
    ],
    hint: 'Er is geen goed of fout antwoord.',
    showHero: false,
    showContent: false,
    header: null,
  },
  {
    question: 'Wat vindt u het belangrijkst aan een veilige douche?',
    buttons: [
      { label: 'Geen hoge rand — veilig in- en uitstappen', value: 'geen_rand' },
      { label: 'Antislipvloer tegen uitglijden', value: 'antislip' },
      { label: 'Steunpunten waar ik me kan vasthouden', value: 'steunpunten' },
      { label: 'Snel klaar — renovatie in 1 dag', value: 'snel' },
    ],
    hint: 'Bijna klaar — daarna controleren we of u in aanmerking komt.',
    showHero: false,
    showContent: false,
    header: null,
  },
];

const TESTIMONIALS = [
  {
    name: 'Annie K.',
    text: '“Ik was altijd bang om uit te glijden. Nu douche ik weer rustig, zonder spanning.”',
  },
  {
    name: 'Henk B.',
    text: '“Die hoge rand was het probleem. Nu stap ik er zo in — dat geeft zoveel zekerheid.”',
  },
  {
    name: 'Maria V.',
    text: '“In één dag klaar. ’s Avonds kon ik al veilig douchen. Had ik eerder moeten doen.”',
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
  hint: document.getElementById('survey-hint'),
  hero: document.getElementById('survey-hero'),
  header: document.getElementById('survey-header'),
  content: document.getElementById('survey-content'),
  footer: document.getElementById('survey-footer'),
  progressSteps: document.getElementById('progress-steps'),
  loadingStatus: document.getElementById('loading-status'),
  contactFormSlot: document.getElementById('contact-form-slot'),
  testimonialName: document.getElementById('testimonial-name'),
  testimonialText: document.getElementById('testimonial-text'),
  testimonialCounter: document.getElementById('testimonial-counter'),
};

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

function renderStep() {
  const q = QUESTIONS[currentStep];
  if (!q) return;

  el.question.textContent = q.question;
  el.hint.textContent = q.hint;
  el.hero.classList.toggle('hidden', !q.showHero);
  el.content.classList.toggle('hidden', !q.showContent);
  if (el.footer) el.footer.classList.toggle('hidden', !q.showContent);

  if (q.header) {
    el.header.textContent = q.header;
    el.header.classList.remove('hidden');
  } else {
    el.header.classList.add('hidden');
  }

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

function updateProgress() {
  const steps = el.progressSteps.querySelectorAll('.progress-step');
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
  const key = ['voor_wie', 'moeite_douche', 'onveilig_gevoel', 'belangrijkst'][currentStep];
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
          <input id="lead-huisnr" name="huisnr" type="text" autocomplete="address-line2" required placeholder="12">
        </div>
      </div>
      <p class="lead-error" id="lead-error" role="alert"></p>
      <button type="submit" class="lead-submit">Claim mijn plek</button>
      <p class="lead-privacy">Wij gebruiken uw gegevens alleen om contact op te nemen over de badkamerrenovatie.</p>
    </form>
  `;
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

    const missing = Object.keys(data).filter((k) => !data[k]);
    if (missing.length) {
      missing.forEach((key) => {
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

    try {
      sessionStorage.setItem('badkamer_lead', JSON.stringify(answers));
    } catch (_) { /* ignore */ }

    let provincie = null;
    try {
      provincie = new URLSearchParams(window.location.search).get('provincie');
    } catch (_) { /* ignore */ }

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: 'badkamer',
          country: 'NL',
          landerSlug: 'form-1',
          ...data,
          provincie,
          source: 'badkamer-form-1',
          metadata: {
            voor_wie: answers.voor_wie || null,
            moeite_douche: answers.moeite_douche || null,
            onveilig_gevoel: answers.onveilig_gevoel || null,
            belangrijkst: answers.belangrijkst || null,
          },
        }),
        keepalive: true,
      });
    } catch (_) { /* ignore */ }

    if (typeof window.trackEvent === 'function') {
      try {
        window.trackEvent('Lead', { content_name: '1-daagse-badkamer', lander: 'form-1' });
      } catch (_) { /* ignore */ }
    }

    showDone();
  });
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
    if (provincie) {
      answers.provincie = provincie;
      answers.voor_wie = answers.voor_wie || 'zelf';
      currentStep = 1;
    }
  } catch (_) { /* ignore */ }
})();

renderStep();
showTestimonial(0);
