document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initContadores();
  initPixelClique();
});

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function easeOutQuad(t) {
  return t * (2 - t);
}

function animarContador(el) {
  const texto = el.textContent.trim();
  const match = texto.match(/^(\d+)(.*)$/);
  if (!match) return;

  const valorFinal = parseInt(match[1], 10);
  const sufixo = match[2];

  if (prefersReducedMotion()) {
    el.textContent = `${valorFinal}${sufixo}`;
    return;
  }

  const duracao = 700;
  const inicio = performance.now();

  function frame(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const valorAtual = Math.round(valorFinal * easeOutQuad(progresso));
    el.textContent = `${valorAtual}${sufixo}`;
    if (progresso < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function initContadores() {
  const stripe = document.querySelector('.stripe');
  if (!stripe) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        stripe.querySelectorAll('.n').forEach(animarContador);
        io.unobserve(stripe);
      }
    });
  }, { threshold: .3 });

  io.observe(stripe);
}

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
