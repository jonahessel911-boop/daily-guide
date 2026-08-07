(function () {
  function goToForm(params) {
    var parts = [];
    if (params) parts.push(params);
    var qs = parts.length ? '?' + parts.join('&') : '';
    window.location.href = 'form/1/' + qs;
  }

  /* Before / after slider */
  var slider = document.getElementById('bb-slider');
  var before = document.getElementById('bb-slider-before');
  var beforeImg = before ? before.querySelector('img') : null;
  var handle = document.getElementById('bb-slider-handle');
  var range = document.getElementById('bb-slider-range');

  function syncBeforeWidth() {
    if (!slider || !beforeImg) return;
    beforeImg.style.width = slider.offsetWidth + 'px';
  }

  function setSlider(pct) {
    var value = Math.max(0, Math.min(100, Number(pct)));
    if (before) before.style.width = value + '%';
    if (handle) handle.style.left = value + '%';
    if (range && Number(range.value) !== value) range.value = String(value);
  }

  if (range) {
    range.addEventListener('input', function () {
      setSlider(range.value);
    });
  }

  if (slider) {
    var dragging = false;

    function posToPct(clientX) {
      var rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    slider.addEventListener('pointerdown', function (e) {
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      setSlider(posToPct(e.clientX));
    });

    slider.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      setSlider(posToPct(e.clientX));
    });

    slider.addEventListener('pointerup', function () {
      dragging = false;
    });
    slider.addEventListener('pointercancel', function () {
      dragging = false;
    });

    window.addEventListener('resize', syncBeforeWidth);
    if (beforeImg.complete) syncBeforeWidth();
    else beforeImg.addEventListener('load', syncBeforeWidth);
  }

  setSlider(50);
  syncBeforeWidth();

  /* Province buttons */
  document.querySelectorAll('.bb-region-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-provincie');
      goToForm('provincie=' + encodeURIComponent(name));
    });
  });

  /* Map */
  function bindMapClicks(root) {
    (root || document).querySelectorAll('[data-provincie]').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.getAttribute('data-provincie');
        goToForm('provincie=' + encodeURIComponent(name));
      });
    });
  }

  var wrap = document.getElementById('bb-map-wrap');
  if (wrap) {
    fetch('assets/nl-map.svg')
      .then(function (r) { return r.text(); })
      .then(function (svg) {
        wrap.innerHTML = svg.replace(/class="zt-map"/, 'class="bb-map"');
        bindMapClicks(wrap);
      })
      .catch(function () {
        wrap.innerHTML = '<p style="color:#666;font-size:14px;text-align:center">Kaart kon niet laden. Gebruik de knoppen hierboven.</p>';
      });
  }
})();
