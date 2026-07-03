const QUESTIONS = [
  {
    question: 'Heeft u moeite om gesprekken in rumoerige omgevingen te verstaan?',
    buttons: [
      { label: 'Ja', value: 'ja' },
      { label: 'Soms', value: 'soms' },
      { label: 'Nee', value: 'nee' },
    ],
    hint: 'Meedoen duurt maar 1 minuut',
    showHero: true,
    showContent: true,
    header: 'Beantwoord 3 vragen om erachter te komen of u in aanmerking komt.',
  },
  {
    question: 'Bent u 55 jaar of ouder?',
    buttons: [
      { label: 'Ja', value: 'ja' },
      { label: 'Nee', value: 'nee' },
    ],
    hint: 'Alleen mensen van 55 jaar en ouder hebben de mogelijkheid om dit innovatieve hoortoestel te ervaren.',
    showHero: false,
    showContent: false,
    header: null,
  },
  {
    question: 'Wilt u een gratis hoortest?',
    buttons: [
      { label: 'Ja', value: 'ja' },
      { label: 'Nee', value: 'nee' },
    ],
    hint: 'In slechts 30 minuten weet u hoe uw gehoor ervoor staat.',
    showHero: false,
    showContent: false,
    header: null,
  },
];

const TESTIMONIALS = [
  {
    name: 'Dhr Meerbeek',
    text: 'Het is mooi dat ze zo klein zijn. Je ziet er niks van. Toch moest ik wel wennen. Ze zitten er helemaal in hè. En je hoort in één keer alles. Wat schreeuwen die mensen toch, denk je dan. Toen hebben we het beter afgesteld. Nou is het helemaal goed. Ik ben er heel blij mee. Zou niet anders meer willen.',
  },
  {
    name: 'Mvr Verweij',
    text: 'Toen mijn eerste werkdag aanbrak mét hoortoestellen, had ik hoge verwachtingen. Al na een dag was ik minder moe en ik kon gesprekken aan de andere kant van de zaal weer horen. Het viel me ook gelijk op dat ik de ruimte in keek in plaats van naar de monden van mensen. Ik dacht direct: waarom heb je dit niet eerder gedaan?',
  },
  {
    name: 'Dhr Janssen',
    text: 'Mijn vrouw zei al maanden dat ik te zacht praat. Met HearFlex hoor ik zelf ook wat beter en praat ik weer normaal. Geen grote apparaatjes, niemand die het ziet. Echt een aanrader voor iedereen die twijfelt.',
  },
];

let currentStep = 0;
let testimonialIndex = 0;

const el = {
  phaseSurvey: document.getElementById('phase-survey'),
  phaseLoading: document.getElementById('phase-loading'),
  phaseOffer: document.getElementById('phase-offer'),
  question: document.getElementById('survey-question'),
  buttons: document.getElementById('survey-buttons'),
  hint: document.getElementById('survey-hint'),
  hero: document.getElementById('survey-hero'),
  header: document.getElementById('survey-header'),
  content: document.getElementById('survey-content'),
  progressSteps: document.getElementById('progress-steps'),
  loadingBar: document.getElementById('loading-bar'),
  loadingStatus: document.getElementById('loading-status'),
  testimonialName: document.getElementById('testimonial-name'),
  testimonialText: document.getElementById('testimonial-text'),
  testimonialCounter: document.getElementById('testimonial-counter'),
};

function renderStep() {
  const q = QUESTIONS[currentStep];

  el.question.textContent = q.question;
  el.hint.textContent = q.hint;
  el.hero.classList.toggle('hidden', !q.showHero);
  el.content.classList.toggle('hidden', !q.showContent);

  if (q.header) {
    el.header.textContent = q.header;
    el.header.classList.remove('hidden');
  } else {
    el.header.classList.add('hidden');
  }

  el.buttons.innerHTML = q.buttons
    .map(
      (b) =>
        `<button type="button" class="survey-btn" data-value="${b.value}">${b.label}</button>`
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

function handleAnswer() {
  currentStep += 1;

  if (currentStep >= QUESTIONS.length) {
    startLoading();
    return;
  }

  renderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startLoading() {
  el.phaseSurvey.classList.add('hidden');
  el.phaseLoading.classList.remove('hidden');

  const statuses = [
    'Uw antwoorden worden geanalyseerd…',
    'Beschikbaarheid wordt gecontroleerd…',
    'Uw persoonlijke aanbieding wordt samengesteld…',
  ];

  let progress = 0;
  const duration = 3200;
  const start = Date.now();

  const tick = () => {
    const elapsed = Date.now() - start;
    progress = Math.min(100, (elapsed / duration) * 100);
    el.loadingBar.style.width = `${progress}%`;

    const statusIdx = Math.min(statuses.length - 1, Math.floor((progress / 100) * statuses.length));
    el.loadingStatus.textContent = statuses[statusIdx];

    if (progress < 100) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(showOffer, 400);
    }
  };

  requestAnimationFrame(tick);
}

function showOffer() {
  el.phaseLoading.classList.add('hidden');
  el.phaseOffer.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

renderStep();
showTestimonial(0);
