document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('bundle-includes-toggle');
  const card = toggle?.closest('.bundle-includes-card');
  const extras = document.querySelectorAll('.bundle-includes-extra');
  if (!toggle || !card || !extras.length) return;

  const moreLabel = '+5 meer';

  const setExpanded = (expanded) => {
    card.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    extras.forEach((item) => {
      item.hidden = !expanded;
    });
    toggle.textContent = expanded ? 'Minder tonen' : moreLabel;
  };

  setExpanded(false);

  toggle.addEventListener('click', () => {
    setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
  });
});
