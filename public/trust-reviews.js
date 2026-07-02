document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('trust-carousel');
  const dotsContainer = document.getElementById('trust-dots');
  if (!carousel || !dotsContainer) return;

  const cards = carousel.querySelectorAll('.trust-card');
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'trust-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Review ${i + 1}`);
    dot.addEventListener('click', () => {
      const card = cards[i];
      carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
    });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.trust-dot');

  carousel.addEventListener('scroll', () => {
    const scrollLeft = carousel.scrollLeft;
    let active = 0;
    cards.forEach((card, i) => {
      if (card.offsetLeft - carousel.offsetLeft <= scrollLeft + 40) active = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  });
});
