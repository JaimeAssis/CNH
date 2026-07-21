# Interações JS (reveal com stagger, contador, pulso, prova social) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extrair o script inline de `pagina-vendas-cnh.html` para `assets/interacoes.js` e adicionar: reveal-on-scroll com stagger, contador animado na faixa de números, pulso no CTA principal, e um toast de prova social simulada ("X pessoas acabaram de comprar").

**Architecture:** Um único arquivo JS (`assets/interacoes.js`) com funções pequenas e independentes, cada uma inicializada em `DOMContentLoaded`. CSS novo (keyframes, toast, ajuste de easing) entra no bloco `<style>` já existente em `pagina-vendas-cnh.html`. Sem dependências externas, sem build step.

**Tech Stack:** HTML/CSS/JS vanilla, `IntersectionObserver`, `requestAnimationFrame`, `window.matchMedia`.

## Global Constraints

- Não introduzir dependências externas (sem npm, sem bibliotecas de animação) — projeto é HTML/CSS/JS puro servido como arquivo estático.
- Não alterar a lógica existente de checkout (hrefs para `https://pay.hotmart.com/B106812764F?checkoutMode=10`) nem do Meta Pixel (`fbq('init', '2068011111260569')`, `fbq('track', 'PageView')` no `<head>`).
- O evento de clique continua sendo `fbq('trackCustom', 'CliqueBotaoComprar', {...})` — nunca `InitiateCheckout` nem `Purchase` (esses vêm da Hotmart via API).
- Todas as animações novas devem respeitar `prefers-reduced-motion: reduce` (bloco já existe em `pagina-vendas-cnh.html`, deve ser estendido, não duplicado).
- Prova social: texto em português, presente, sem nomes/cidades — `"1 pessoa acabou de comprar"` (singular) / `"{N} pessoas acabaram de comprar"` (plural), N sorteado entre 1 e 5. Sem botão de fechar. Sem ação de clique.
- Constantes de timing da prova social ficam no topo do arquivo JS, nomeadas exatamente: `PROVA_SOCIAL_MIN`, `PROVA_SOCIAL_MAX`, `DELAY_INICIAL_MS`, `DURACAO_VISIVEL_MS`, `INTERVALO_MIN_MS`, `INTERVALO_MAX_MS`.
- Projeto não tem framework de testes automatizados. Verificação é manual via Browser pane (`mcp__Claude_Browser__*`), conforme roteiro de cada tarefa.
- Referência completa de produto/proposta: [CONTEXTO-PRODUTO.md](../../../CONTEXTO-PRODUTO.md). Spec completa: [2026-07-21-interacoes-js-design.md](../specs/2026-07-21-interacoes-js-design.md).

---

### Task 1: Extrair script inline para `assets/interacoes.js` (paridade, sem features novas)

**Files:**
- Create: `assets/interacoes.js`
- Modify: `pagina-vendas-cnh.html` (remove `<script>` inline no final do `<body>`, adiciona `<script src="assets/interacoes.js" defer></script>`)

**Interfaces:**
- Consumes: nada (primeira tarefa).
- Produces: `initReveal()`, `initPixelClique()` — funções globais no arquivo, chamadas em `DOMContentLoaded`. Tarefas seguintes vão editar `initReveal()` e adicionar novas funções ao mesmo `DOMContentLoaded` listener.

- [ ] **Step 1: Criar `assets/interacoes.js` com a lógica atual movida (sem mudar comportamento)**

```js
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
```

- [ ] **Step 2: Atualizar `pagina-vendas-cnh.html` — remover o `<script>` inline e apontar para o arquivo externo**

Localize o bloco no final do `<body>` (logo antes de `</body>`):

```html
  <script>
    // reveal no scroll
    const io = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }) }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Meta Pixel — evento customizado de clique nos botões de compra/CTA.
    // Não usa InitiateCheckout nem Purchase: esses são enviados pela Hotmart via API de Conversões.
    document.querySelectorAll('.btn-comprar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof fbq === 'function') {
          fbq('trackCustom', 'CliqueBotaoComprar', { botao: btn.textContent.trim() });
        }
      });
    });
  </script>
```

Substitua por:

```html
  <script src="assets/interacoes.js" defer></script>
```

- [ ] **Step 3: Verificar manualmente no Browser pane**

Abra `pagina-vendas-cnh.html` no Browser pane (`mcp__Claude_Browser__preview_start` com a URL `file:///D:/PEGADINHAS%20CNH/pagina-vendas-cnh.html`, ou recarregue a aba já aberta com `mcp__Claude_Browser__navigate`).

Expected:
- `mcp__Claude_Browser__read_console_messages` não mostra erros tipo `interacoes.js not found` ou `io is not defined`.
- Rolar a página até `.peg-list` continua revelando os cards (fade + subida), igual ao comportamento anterior.
- Clicar em qualquer botão `.btn-comprar` continua navegando para `https://pay.hotmart.com/B106812764F?checkoutMode=10`.

- [ ] **Step 4: Commit**

```bash
git add assets/interacoes.js pagina-vendas-cnh.html
git commit -m "Extrai script inline para assets/interacoes.js"
```

---

### Task 2: Reveal com stagger + easing refinado

**Files:**
- Modify: `assets/interacoes.js` (substitui `initReveal()`)
- Modify: `pagina-vendas-cnh.html` (regra CSS `.reveal`)

**Interfaces:**
- Consumes: nenhuma função nova de outras tarefas.
- Produces: `initReveal()` atualizada (mesma assinatura, sem parâmetros, chamada em `DOMContentLoaded` já existente desde a Task 1).

- [ ] **Step 1: Atualizar a transição CSS de `.reveal` em `pagina-vendas-cnh.html`**

Encontre a regra atual:

```css
    .reveal {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity .6s ease, transform .6s ease
    }
```

Substitua por:

```css
    .reveal {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity .7s cubic-bezier(.16,.8,.3,1), transform .7s cubic-bezier(.16,.8,.3,1)
    }
```

- [ ] **Step 2: Substituir `initReveal()` em `assets/interacoes.js` para incluir stagger**

```js
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
```

- [ ] **Step 3: Verificar manualmente no Browser pane**

Recarregue a página e role até a seção "O verdadeiro motivo das reprovações" (`.peg-list`).

Expected:
- Os 4 cards (`"Sempre e nunca"`, `"Não, exceto, incorreta"`, `"Placa trocada"`, `"Alternativa quase certa"`) aparecem em sequência rápida (um após o outro, não todos simultâneos).
- O mesmo vale ao rolar até `.mech-grid` (4 cards do método), `.stack-grid` (3 itens do que você recebe) e a seção de FAQ (5 perguntas).
- Elementos fora dessas listas (títulos, parágrafos) continuam aparecendo sem atraso perceptível.

- [ ] **Step 4: Commit**

```bash
git add assets/interacoes.js pagina-vendas-cnh.html
git commit -m "Adiciona stagger e easing refinado ao reveal-on-scroll"
```

---

### Task 3: Contador animado na faixa de números

**Files:**
- Modify: `assets/interacoes.js` (adiciona `initContadores()` e chamada no `DOMContentLoaded`)

**Interfaces:**
- Consumes: `prefersReducedMotion()` (nova função utilitária definida neste mesmo passo, reutilizada pela Task 5).
- Produces: `initContadores()`, `prefersReducedMotion()`, `easeOutQuad(t)`, `animarContador(el)` — funções globais no arquivo.

- [ ] **Step 1: Adicionar função utilitária `prefersReducedMotion()` no topo de `assets/interacoes.js`, logo abaixo do listener `DOMContentLoaded`**

```js
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 2: Adicionar `initContadores()`, `animarContador()` e `easeOutQuad()` em `assets/interacoes.js`**

```js
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
```

- [ ] **Step 3: Registrar `initContadores()` no `DOMContentLoaded` no topo do arquivo**

```js
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initContadores();
  initPixelClique();
});
```

- [ ] **Step 4: Verificar manualmente no Browser pane**

Recarregue a página e role até a faixa amarela com os números (30, 21, 10, 70%+).

Expected:
- Cada número conta rapidamente de 0 até o valor final (ex.: `30` sobe de `0` até `30` em menos de 1 segundo).
- O sufixo de `70%+` é preservado durante e depois da contagem (não vira `70` sem o `%+`).
- Rolar pra cima e pra baixo de novo não reinicia a contagem (só anima uma vez).

- [ ] **Step 5: Commit**

```bash
git add assets/interacoes.js
git commit -m "Adiciona contador animado na faixa de números"
```

---

### Task 4: Pulso sutil no CTA principal

**Files:**
- Modify: `assets/interacoes.js` (adiciona `initPulseCTA()` e chamada no `DOMContentLoaded`)
- Modify: `pagina-vendas-cnh.html` (CSS: `@keyframes pulse`, classe `.btn-pulse`, extensão do bloco `prefers-reduced-motion`)

**Interfaces:**
- Consumes: nenhuma função nova de outras tarefas.
- Produces: `initPulseCTA()` — função global, chamada em `DOMContentLoaded`.

- [ ] **Step 1: Adicionar CSS do pulso em `pagina-vendas-cnh.html`, logo após a regra `.offer-body .btn`**

Localize:

```css
    .offer-body .btn {
      width: 100%;
      justify-content: center;
      margin-top: 14px
    }
```

Adicione logo abaixo:

```css
    .btn-pulse {
      animation: pulse 2.5s ease-in-out infinite
    }

    .btn-pulse:hover {
      animation-play-state: paused
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1) }
      50% { transform: scale(1.03) }
    }
```

- [ ] **Step 2: Estender o bloco `@media (prefers-reduced-motion:reduce)` existente**

Localize:

```css
    @media (prefers-reduced-motion:reduce) {
      html {
        scroll-behavior: auto
      }

      .reveal {
        opacity: 1;
        transform: none;
        transition: none
      }

      .btn {
        transition: none
      }
    }
```

Substitua por (adiciona `.btn-pulse`):

```css
    @media (prefers-reduced-motion:reduce) {
      html {
        scroll-behavior: auto
      }

      .reveal {
        opacity: 1;
        transform: none;
        transition: none
      }

      .btn {
        transition: none
      }

      .btn-pulse {
        animation: none
      }
    }
```

- [ ] **Step 3: Adicionar `initPulseCTA()` em `assets/interacoes.js`**

```js
function initPulseCTA() {
  const cta = document.getElementById('checkout-btn');
  if (cta) {
    cta.classList.add('btn-pulse');
  }
}
```

- [ ] **Step 4: Registrar no `DOMContentLoaded`**

```js
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initContadores();
  initPulseCTA();
  initPixelClique();
});
```

- [ ] **Step 5: Verificar manualmente no Browser pane**

Role até a seção de oferta (`#comprar`) e observe o botão `"Quero garantir meu acesso agora"`.

Expected:
- O botão pulsa continuamente (escala sutil, ~2.5s por ciclo) sem parar sozinho.
- Ao passar o mouse em cima (`mcp__Claude_Browser__computer` com `action: hover`), o pulso pausa.
- Os outros 3 botões (`topbar`, `hero`, CTA final) **não** pulsam — só o `#checkout-btn`.

- [ ] **Step 6: Commit**

```bash
git add assets/interacoes.js pagina-vendas-cnh.html
git commit -m "Adiciona pulso sutil ao CTA principal da oferta"
```

---

### Task 5: Toast de prova social simulada

**Files:**
- Modify: `assets/interacoes.js` (adiciona constantes, `textoProvaSocial()`, `sortearIntervalo()`, `criarToastProvaSocial()`, `initProvaSocial()`, chamada no `DOMContentLoaded`)
- Modify: `pagina-vendas-cnh.html` (CSS: `.social-toast`, `.social-toast.show`, media query mobile, extensão do bloco `prefers-reduced-motion`)

**Interfaces:**
- Consumes: `prefersReducedMotion()` (definida na Task 3).
- Produces: `initProvaSocial()` — função global, chamada em `DOMContentLoaded`. Nenhuma tarefa futura depende dela (última tarefa de feature).

- [ ] **Step 1: Adicionar CSS do toast em `pagina-vendas-cnh.html`, logo após o bloco `footer strong { color: #cfe0d6 }`**

Localize:

```css
    footer strong {
      color: #cfe0d6
    }
```

Adicione logo abaixo:

```css
    /* prova social */
    .social-toast {
      position: fixed;
      left: 18px;
      bottom: 18px;
      z-index: 70;
      max-width: 320px;
      background: var(--branco);
      color: var(--tinta);
      border: 1px solid var(--linha);
      border-left: 4px solid var(--verde);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0, 0, 0, .18);
      opacity: 0;
      transform: translateY(12px);
      transition: opacity .4s ease, transform .4s ease;
      pointer-events: none
    }

    .social-toast.show {
      opacity: 1;
      transform: none
    }
```

- [ ] **Step 2: Adicionar ajuste mobile do toast dentro do bloco `@media (max-width:860px)` já existente**

Localize o fim do bloco `@media (max-width:860px) { ... }` (a regra `.topbar .brand small { display: none }` é a última antes do `}` de fechamento). Adicione logo antes do `}` que fecha a media query:

```css
      .social-toast {
        left: 12px;
        right: 12px;
        max-width: none;
        bottom: 12px;
        font-size: 13px
      }
```

- [ ] **Step 3: Estender o bloco `@media (prefers-reduced-motion:reduce)` (já modificado na Task 4) com a regra do toast**

Adicione, junto de `.btn-pulse { animation: none }`:

```css
      .social-toast {
        transition: none
      }
```

- [ ] **Step 4: Adicionar constantes e lógica da prova social em `assets/interacoes.js`, no topo do arquivo (abaixo do listener `DOMContentLoaded`)**

```js
const PROVA_SOCIAL_MIN = 1;
const PROVA_SOCIAL_MAX = 5;
const DELAY_INICIAL_MS = 6000;
const DURACAO_VISIVEL_MS = 8000;
const INTERVALO_MIN_MS = 15000;
const INTERVALO_MAX_MS = 25000;
```

- [ ] **Step 5: Adicionar as funções da prova social em `assets/interacoes.js`**

```js
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
```

- [ ] **Step 6: Registrar `initProvaSocial()` no `DOMContentLoaded`**

```js
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initContadores();
  initPulseCTA();
  initProvaSocial();
  initPixelClique();
});
```

- [ ] **Step 7: Verificar manualmente no Browser pane**

Recarregue a página e aguarde (use `mcp__Claude_Browser__computer` com `action: wait, duration: 7`).

Expected:
- Por volta de 6s após o carregamento, um toast aparece no canto inferior esquerdo com texto no formato `"N pessoa(s) acabou/acabaram de comprar"` (verifique concordância: se N=1, deve ler `"1 pessoa acabou de comprar"`, nunca `"1 pessoas"`).
- O toast some sozinho depois de ~8s (sem botão de fechar visível).
- Esperando mais um pouco (`mcp__Claude_Browser__computer` com `action: wait, duration: 20`), um novo toast aparece com um número possivelmente diferente.
- Clicar no toast não navega nem dispara nenhuma ação.
- Redimensione para mobile (`mcp__Claude_Browser__resize_window` com `preset: mobile`) e confirme que o toast ocupa a largura ajustada, sem cobrir o botão de compra do topbar.

- [ ] **Step 8: Commit**

```bash
git add assets/interacoes.js pagina-vendas-cnh.html
git commit -m "Adiciona toast de prova social simulada"
```

---

### Task 6: Verificação final integrada e push

**Files:**
- Nenhum arquivo novo — apenas verificação e push do que já foi commitado nas Tasks 1-5.

**Interfaces:**
- Consumes: todas as funções das Tasks 1-5 (`initReveal`, `initContadores`, `initPulseCTA`, `initProvaSocial`, `initPixelClique`).
- Produces: nada (tarefa final).

- [ ] **Step 1: Revisão de console e rede no Browser pane**

Recarregue `pagina-vendas-cnh.html` do zero e rode `mcp__Claude_Browser__read_console_messages` com `onlyErrors: true`.

Expected: nenhum erro de JS (nenhum `ReferenceError`, `TypeError`, arquivo `interacoes.js` 404).

- [ ] **Step 2: Passagem completa pelo funil visual**

Role a página inteira do topo até o rodapé (`mcp__Claude_Browser__computer` com `action: scroll` repetido, ou `scroll_to` em cada seção) e confirme, na ordem:
1. Reveal com stagger nos 4 blocos (`.peg-list`, `.mech-grid`, `.stack-grid`, `.faq-item`).
2. Contador animado na faixa de números, uma única vez.
3. Pulso contínuo apenas em `#checkout-btn`.
4. Toast de prova social aparecendo no ciclo esperado em algum momento da navegação.

- [ ] **Step 3: Confirmar que o pixel e o checkout não regrediram**

Clique em um botão `.btn-comprar` (ex.: `"Garantir agora"` da topbar) e confirme via `mcp__Claude_Browser__read_network_requests` (filtro `urlPattern: "hotmart"` ou verificando a navegação) que o destino continua `https://pay.hotmart.com/B106812764F?checkoutMode=10`.

- [ ] **Step 4: Push para o GitHub**

```bash
git push origin main
```

Expected: push aceito sem erro (mesmo remote `https://github.com/JaimeAssis/CNH.git` já configurado e autenticado em conversas anteriores).
