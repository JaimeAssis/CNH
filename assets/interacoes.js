document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initContadores();
  initPulseCTA();
  initProvaSocial();
  initPixelClique();
});

const PROVA_SOCIAL_MIN = 1;
const PROVA_SOCIAL_MAX = 5;
const DELAY_INICIAL_MS = 6000;
const DURACAO_VISIVEL_MS = 8000;
const INTERVALO_MIN_MS = 15000;
const INTERVALO_MAX_MS = 25000;

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

function initPulseCTA() {
  const cta = document.getElementById('checkout-btn');
  if (cta) {
    cta.classList.add('btn-pulse');
  }
}

function textoProvaSocial(n) {
  return n === 1
    ? '1 pessoa acabou de comprar'
    : `${n} pessoas acabaram de comprar`;
}

function sortearIntervalo() {
  return INTERVALO_MIN_MS + Math.random() * (INTERVALO_MAX_MS - INTERVALO_MIN_MS);
}

function criarToastProvaSocial() {
  const toast = document.createElement('div');
  toast.className = 'social-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const texto = document.createElement('span');
  texto.className = 'social-toast-text';
  toast.appendChild(texto);

  document.body.appendChild(toast);
  return toast;
}

function initProvaSocial() {
  const toast = criarToastProvaSocial();
  const textoEl = toast.querySelector('.social-toast-text');

  function ciclo() {
    const n = Math.floor(Math.random() * (PROVA_SOCIAL_MAX - PROVA_SOCIAL_MIN + 1)) + PROVA_SOCIAL_MIN;
    textoEl.textContent = textoProvaSocial(n);
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(ciclo, sortearIntervalo());
    }, DURACAO_VISIVEL_MS);
  }

  setTimeout(ciclo, DELAY_INICIAL_MS);
}
