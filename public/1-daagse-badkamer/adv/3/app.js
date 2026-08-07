(function () {
  var REVIEWS = [
    {
      name: 'K. van Beijnen',
      initial: 'K',
      text: '“Geweldig, vandaag is onze inloopdouche geplaatst door twee bijzonder fijne medewerkers. De klus was voor twee dagen ingepland. Alles is keurig op tijd gegaan, en bijzonder netjes.”',
    },
    {
      name: 'D. van de Voorde',
      initial: 'D',
      text: '“Vanaf het eerste moment geweldig geholpen en geadviseerd. De plaatsing was ook perfect en fijne medewerkers. Vakkundig en vriendelijk. Nu gaan we ervan genieten.”',
    },
    {
      name: 'Annie K.',
      initial: 'A',
      text: '“Ik was altijd bang om uit te glijden. Nu douche ik weer rustig, zonder spanning. In één dag klaar — had ik eerder moeten doen.”',
    },
  ];

  var reviewIndex = 0;
  var nameEl = document.getElementById('review-name');
  var textEl = document.getElementById('review-text');
  var counterEl = document.getElementById('review-counter');

  function showReview(i) {
    reviewIndex = (i + REVIEWS.length) % REVIEWS.length;
    var r = REVIEWS[reviewIndex];
    if (nameEl) nameEl.textContent = r.name;
    if (textEl) textEl.textContent = r.text;
    if (counterEl) counterEl.textContent = reviewIndex + 1 + '/' + REVIEWS.length;
  }

  var prev = document.getElementById('review-prev');
  var next = document.getElementById('review-next');
  if (prev) prev.addEventListener('click', function () { showReview(reviewIndex - 1); });
  if (next) next.addEventListener('click', function () { showReview(reviewIndex + 1); });
  showReview(0);

  var form = document.getElementById('lead-form');
  var phaseMain = document.getElementById('phase-main');
  var phaseDone = document.getElementById('phase-done');
  if (!form) return;

  function resolveLander() {
    try {
      var params = new URLSearchParams(window.location.search);
      var lander = params.get('l');
      if (!lander && window.FunnelTrack) lander = window.FunnelTrack.getAttribution().lander;
      if (!lander) lander = document.body.dataset.trackLander || 'adv-3';
      return lander;
    } catch (_) {
      return 'adv-3';
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var errorEl = document.getElementById('lead-error');
    var voornaam = form.voornaam.value.trim();
    var achternaam = form.achternaam.value.trim();
    var toevoeging = form.toevoeging.value.trim();
    var huisnr = form.huisnr.value.trim();
    if (toevoeging) huisnr = huisnr + ' ' + toevoeging;

    var data = {
      naam: (voornaam + ' ' + achternaam).trim(),
      telefoon: form.telefoon.value.trim(),
      email: form.email.value.trim(),
      postcode: form.postcode.value.trim(),
      huisnr: huisnr,
    };

    form.querySelectorAll('input').forEach(function (input) {
      input.classList.remove('is-invalid');
    });

    var required = ['voornaam', 'achternaam', 'telefoon', 'email', 'postcode', 'huisnr'];
    var missing = required.filter(function (key) {
      return !form[key].value.trim();
    });

    if (missing.length) {
      missing.forEach(function (key) {
        if (form[key]) form[key].classList.add('is-invalid');
      });
      errorEl.textContent = 'Vul alle verplichte velden in om verder te gaan.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.email.classList.add('is-invalid');
      errorEl.textContent = 'Vul een geldig e-mailadres in.';
      return;
    }

    errorEl.textContent = '';
    var lander = resolveLander();

    try {
      sessionStorage.setItem('badkamer_lead', JSON.stringify({
        lander: lander,
        contact: data,
        createdAt: new Date().toISOString(),
      }));
    } catch (_) { /* ignore */ }

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: 'badkamer',
          country: 'NL',
          landerSlug: lander,
          naam: data.naam,
          telefoon: data.telefoon,
          email: data.email,
          postcode: data.postcode,
          huisnr: data.huisnr,
          source: 'badkamer-adv-3',
        }),
        keepalive: true,
      });
    } catch (_) { /* ignore */ }

    if (typeof window.trackEvent === 'function') {
      try {
        window.trackEvent('Lead', { content_name: '1-daagse-badkamer', lander: lander });
      } catch (_) { /* ignore */ }
    }

    phaseMain.classList.add('hidden');
    phaseDone.classList.remove('hidden');
    phaseDone.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
