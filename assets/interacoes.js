document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initPixelClique();
});

function buildStaggerMap() {
  const grupos = [
    '.peg-list > .reveal',
    '.mech-grid > .reveal',
    '.stack-grid > .reveal',
    '.faq .faq-item.reveal'
  ];
  const mapa = new Map();
  grupos.forEach((seletor) => {
    document.querySelectorAll(seletor).forEach((el, index) => {
      mapa.set(el, index * 80);
    });
  });
  return mapa;
}

function initReveal() {
  const staggerMap = buildStaggerMap();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = staggerMap.get(el) || 0;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('in');
        io.unobserve(el);
      }
    });
  }, { threshold: .12 });

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

function initPixelClique() {
  // Evento customizado de clique nos botões de compra/CTA.
  // Não usa InitiateCheckout nem Purchase: esses são enviados pela Hotmart via API de Conversões.
  document.querySelectorAll('.btn-comprar').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof fbq === 'function') {
        fbq('trackCustom', 'CliqueBotaoComprar', { botao: btn.textContent.trim() });
      }
    });
  });
}
