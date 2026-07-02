document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('bundle-includes-toggle');
  const card = toggle?.closest('.bundle-includes-card');
  if (!toggle || !card) return;

  const moreLabel = '+5 meer';

  toggle.addEventListener('click', () => {
    const expanded = card.classList.contains('is-expanded');
    card.classList.toggle('is-expanded', !expanded);
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.textContent = expanded ? moreLabel : 'Minder tonen';
  });
});
