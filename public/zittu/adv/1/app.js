(function () {
  function goToFunnel(params) {
    var parts = ['from=adv1'];
    if (params) parts.push(params);
    window.location.href = '../2/?' + parts.join('&');
  }

  function selectProvincie(name) {
    if (!name) return;

    document.querySelectorAll('.zt-map .zt-prov, .zt-map path[data-provincie]').forEach(function (path) {
      var match = path.getAttribute('data-provincie') === name;
      path.classList.toggle('is-active', match);
      path.classList.toggle('is-dim', !match);
    });

    document.querySelectorAll('.zt-region-btn').forEach(function (btn) {
      btn.classList.toggle('is-selected', btn.getAttribute('data-provincie') === name);
    });

    setTimeout(function () {
      goToFunnel('provincie=' + encodeURIComponent(name));
    }, 250);
  }

  function bindMapClicks(root) {
    (root || document).querySelectorAll('[data-provincie]').forEach(function (path) {
      path.addEventListener('click', function () {
        selectProvincie(path.getAttribute('data-provincie'));
      });
    });
  }

  function loadMap() {
    var wrap = document.getElementById('zt-map-wrap');
    if (!wrap) return Promise.resolve();

    return fetch('assets/nl-map.svg')
      .then(function (r) { return r.text(); })
      .then(function (svg) {
        wrap.innerHTML = svg;
        bindMapClicks(wrap);
      })
      .catch(function () {
        wrap.innerHTML = '<p style="color:#666;font-size:14px">Kaart kon niet geladen worden. Gebruik de knoppen hieronder.</p>';
      });
  }

  document.querySelectorAll('.zt-region-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectProvincie(btn.getAttribute('data-provincie'));
    });
  });

  document.querySelectorAll('.zt-chair').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.zt-chair').forEach(function (el) {
        el.classList.remove('is-selected');
      });
      btn.classList.add('is-selected');
      var id = btn.getAttribute('data-stoel') || '';
      setTimeout(function () {
        goToFunnel('stoel=' + encodeURIComponent(id));
      }, 250);
    });
  });

  var reviews = [
    {
      name: 'Maria V.',
      text: '“Ik kan eindelijk weer zelfstandig opstaan zonder hulp. Dat geeft zoveel rust.”'
    },
    {
      name: 'Henk B.',
      text: '“De adviseur stelde alles af op mijn lengte. Het verschil met mijn oude stoel is enorm.”'
    },
    {
      name: 'Annie de K.',
      text: '“Gratis thuis uitproberen gaf me alle tijd. Geen druk, gewoon zelf ervaren of het past.”'
    }
  ];

  var reviewIndex = 0;
  var nameEl = document.getElementById('review-name');
  var textEl = document.getElementById('review-text');
  var counterEl = document.getElementById('review-counter');

  function renderReview() {
    var item = reviews[reviewIndex];
    if (!item || !nameEl || !textEl || !counterEl) return;
    nameEl.textContent = item.name;
    textEl.textContent = item.text;
    counterEl.textContent = reviewIndex + 1 + '/' + reviews.length;
  }

  var prevBtn = document.getElementById('review-prev');
  var nextBtn = document.getElementById('review-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
      renderReview();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      reviewIndex = (reviewIndex + 1) % reviews.length;
      renderReview();
    });
  }

  loadMap();
  renderReview();
})();
