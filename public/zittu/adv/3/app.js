(function () {
  var toastEl = document.getElementById('zt-toast');
  var toastTimer;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2600);
  }

  function goToFunnel(stoel) {
    var parts = ['from=adv3'];
    if (stoel) parts.push('stoel=' + encodeURIComponent(stoel));
    window.location.href = '../2/?' + parts.join('&');
  }

  document.querySelectorAll('.zt-chair').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.zt-chair').forEach(function (el) {
        el.classList.remove('is-selected');
      });
      btn.classList.add('is-selected');
      var id = btn.getAttribute('data-stoel') || '';
      showToast('Stoel geselecteerd — test starten…');
      setTimeout(function () {
        goToFunnel(id);
      }, 450);
    });
  });
})();
