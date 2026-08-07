(function () {
  function goToFunnel(params) {
    var parts = ['from=adv1'];
    if (params) parts.push(params);
    try {
      var lander = new URLSearchParams(window.location.search).get('l');
      if (!lander && window.FunnelTrack) lander = window.FunnelTrack.getAttribution().lander;
      if (!lander) lander = 'adv-1';
      parts.push('l=' + encodeURIComponent(lander));
      parts.push('p=zittu');
      parts.push('c=nl');
    } catch (_) { /* ignore */ }
    window.location.href = '../2/?' + parts.join('&');
  }

  function selectProvincie(name) {
    if (!name) return;

    document.querySelectorAll('.zt-map .zt-prov, .zt-map path[data-provincie], .zt-map-wrap [data-provincie]').forEach(function (path) {
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
    if (!wrap) return;

    fetch('assets/nl-map.svg')
      .then(function (r) { return r.text(); })
      .then(function (svg) {
        wrap.innerHTML = svg;
        bindMapClicks(wrap);
      })
      .catch(function () {
        wrap.innerHTML = '<p style="color:#666;font-size:14px;text-align:center">Kaart kon niet laden. Gebruik de knoppen hierboven.</p>';
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

  loadMap();
})();
