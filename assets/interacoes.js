document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initPixelClique();
});

function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
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
