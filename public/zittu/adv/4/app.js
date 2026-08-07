(function () {
  var form = document.getElementById('lead-form');
  var phaseForm = document.getElementById('phase-form');
  var phaseDone = document.getElementById('phase-done');

  if (!form) return;

  function resolveLander() {
    try {
      var params = new URLSearchParams(window.location.search);
      var lander = params.get('l');
      if (!lander && window.FunnelTrack) lander = window.FunnelTrack.getAttribution().lander;
      if (!lander) lander = document.body.dataset.trackLander || 'adv-4';
      return lander;
    } catch (_) {
      return 'adv-4';
    }
  }

  form.addEventListener('submit', async function (e) {
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
    var lander = resolveLander();

    try {
      sessionStorage.setItem('zittu_lead', JSON.stringify({
        lander: lander,
        contact: data,
        createdAt: new Date().toISOString(),
      }));
    } catch (_) { /* ignore */ }

    var meta = {};
    try {
      if (typeof window.trackEvent === 'function') {
        meta = window.trackEvent('Lead', { content_name: 'zittu-demonstratie', lander: lander }) || {};
      } else if (window.MetaPixelLeads && window.MetaPixelLeads.trackLead) {
        meta = window.MetaPixelLeads.trackLead({ content_name: 'zittu-demonstratie', lander: lander }) || {};
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
          naam: data.naam,
          telefoon: data.telefoon,
          email: data.email,
          postcode: data.postcode,
          huisnr: data.huisnr,
          source: 'adv-4',
          contentName: 'zittu-demonstratie',
          eventId: meta.eventId || undefined,
          fbp: meta.fbp || undefined,
          fbc: meta.fbc || undefined,
          eventSourceUrl: meta.eventSourceUrl || window.location.href,
          externalId: meta.externalId || undefined,
          testEventCode: meta.testEventCode || undefined,
        }),
        keepalive: true,
      });
    } catch (_) { /* ignore */ }

    phaseForm.classList.add('hidden');
    phaseForm.hidden = true;
    phaseDone.classList.remove('hidden');
    phaseDone.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
