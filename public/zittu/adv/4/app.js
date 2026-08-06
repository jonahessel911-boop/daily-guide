(function () {
  var form = document.getElementById('lead-form');
  var phaseForm = document.getElementById('phase-form');
  var phaseDone = document.getElementById('phase-done');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errorEl = document.getElementById('lead-error');
    var data = {
      naam: form.naam.value.trim(),
      telefoon: form.telefoon.value.trim(),
      email: form.email.value.trim(),
      postcode: form.postcode.value.trim(),
      huisnr: form.huisnr.value.trim(),
    };

    form.querySelectorAll('input').forEach(function (input) {
      input.classList.remove('is-invalid');
    });

    var missing = Object.keys(data).filter(function (key) {
      return !data[key];
    });

    if (missing.length) {
      missing.forEach(function (key) {
        var input = form.elements[key];
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

    try {
      sessionStorage.setItem('zittu_lead', JSON.stringify({
        lander: 'adv-4',
        contact: data,
        createdAt: new Date().toISOString(),
      }));
    } catch (_) { /* ignore */ }

    if (typeof window.trackEvent === 'function') {
      try {
        window.trackEvent('Lead', { content_name: 'zittu-demonstratie', lander: 'adv-4' });
      } catch (_) { /* ignore */ }
    }

    phaseForm.classList.add('hidden');
    phaseForm.hidden = true;
    phaseDone.classList.remove('hidden');
    phaseDone.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
