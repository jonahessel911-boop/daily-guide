(function () {
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
      setTimeout(function () {
        goToFunnel(id);
      }, 250);
    });
  });
})();
