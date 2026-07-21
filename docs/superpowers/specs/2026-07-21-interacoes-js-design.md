# Design: `assets/interacoes.js` — animações e prova social

**Data:** 2026-07-21
**Página afetada:** [pagina-vendas-cnh.html](../../../pagina-vendas-cnh.html)
**Contexto do produto:** ver [CONTEXTO-PRODUTO.md](../../../CONTEXTO-PRODUTO.md)

## Objetivo

Deixar a landing page mais "viva" e fluida através de animações de entrada mais refinadas, micro-interações (contador animado, pulso no CTA) e um toast de prova social simulada ("X pessoas acabaram de comprar"), sem introduzir dependências externas nem alterar a lógica de checkout/pixel já existente.

## Escopo

Incluso:
- Extrair o script inline atual para um arquivo externo `assets/interacoes.js`.
- Refinar a animação de reveal-on-scroll já existente (`.reveal`), com stagger em listas/grids.
- Contador animado (0 → valor final) nos números da faixa amarela (`.stripe .n`).
- Pulso sutil e contínuo no botão de CTA principal da seção de oferta (`#checkout-btn`).
- Toast de prova social simulada, canto inferior esquerdo, texto genérico sem nomes/cidades.
- Suporte a `prefers-reduced-motion: reduce` para todas as animações novas.

Fora do escopo (decidido explicitamente durante o brainstorming):
- Hover/elevação nos cards de pegadinha e do stack de bônus.
- Placas do hero flutuando.
- Barra de progresso de leitura no topo.
- FAQ em acordeão.
- Barra de CTA flutuante fixa.
- Contador de urgência/tempo limitado.
- Botão de fechar no toast de prova social.
- Clique no toast levando a algum lugar.
- Integração real com vendas da Hotmart (exigiria backend recebendo webhook — está fora do escopo de uma página estática).

## Arquitetura

Novo arquivo `assets/interacoes.js`, carregado com:
```html
<script src="assets/interacoes.js" defer></script>
```
no lugar do `<script>` inline atual, logo antes de `</body>`.

O arquivo é organizado em funções pequenas e independentes, cada uma inicializada uma vez no carregamento:

```js
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initContadores();
  initPulseCTA();
  initProvaSocial();
  initPixelClique();
});
```

- `initReveal()` — mesma lógica de IntersectionObserver que já existe hoje para `.reveal`/`.in`, mas calculando `transition-delay` incremental para filhos diretos de containers de grade (`.peg-list`, `.mech-grid`, `.stack-grid`) e para `.faq-item` dentro de `.faq`.
- `initContadores()` — observa `.stripe`: ao entrar na viewport, anima cada `.stripe .n` de 0 até o valor numérico do texto atual, preservando sufixos não numéricos (ex.: `%+`).
- `initPulseCTA()` — apenas garante a classe CSS `btn-pulse` em `#checkout-btn` (a animação em si é CSS puro via `@keyframes`); existe como função para poder ser desligada de forma centralizada se `prefers-reduced-motion` estiver ativo.
- `initProvaSocial()` — cria e gerencia o ciclo do toast (ver seção dedicada abaixo).
- `initPixelClique()` — lógica já existente hoje (movida do script inline): dispara `fbq('trackCustom', 'CliqueBotaoComprar', ...)` em cada `.btn-comprar`.

CSS novo entra no `<style>` já existente no `<head>` do HTML (sem criar arquivo CSS separado, para não fragmentar mais do que o necessário nesse projeto de página única):
- `@keyframes pulse` e classe `.btn-pulse`.
- Classes do toast: `.social-toast`, `.social-toast.show`.
- Ajuste do `transition` em `.reveal` (novo easing/duração).
- Extensão do bloco `@media (prefers-reduced-motion: reduce)` já existente.

## Reveal com stagger

- Easing: `cubic-bezier(.16,.8,.3,1)`, duração `700ms` (hoje é `.6s ease`).
- Ao observar os elementos `.reveal`, `initReveal()` verifica se o elemento é filho direto de `.peg-list`, `.mech-grid`, `.stack-grid`, ou se é um `.faq-item` dentro de `.faq`. Se for, aplica `element.style.transitionDelay = \`${index * 80}ms\`` antes de adicionar a classe `.in`, onde `index` é a posição do elemento dentro do seu container pai (0-based).
- Elementos fora desses containers (headers, parágrafos, botões) mantêm delay 0, comportamento atual.

## Contador animado

- Regex extrai a parte numérica do texto atual de cada `.stripe .n` (ex.: `"70%+"` → número `70`, sufixo `"%+"`; `"30"` → número `30`, sufixo `""`).
- Anima de `0` até o valor extraído ao longo de `~700ms` usando `requestAnimationFrame` com easing de desaceleração (`easeOutQuad` ou similar), atualizando `textContent` a cada frame como `${valorAtual}${sufixo}`.
- Dispara uma única vez por elemento (usa `IntersectionObserver` com `unobserve` após a primeira interseção, mesmo padrão do reveal atual).

## Pulso no CTA principal

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
.btn-pulse {
  animation: pulse 2.5s ease-in-out infinite;
}
.btn-pulse:hover {
  animation-play-state: paused;
}
```
Aplicado apenas em `#checkout-btn` (o CTA dentro do card de oferta/preço), não nos demais `.btn-comprar`.

## Toast de prova social

**Texto e números:**
- N sorteado aleatoriamente entre `PROVA_SOCIAL_MIN = 1` e `PROVA_SOCIAL_MAX = 5` a cada exibição.
- Concordância gramatical correta:
  - N = 1 → `"1 pessoa acabou de comprar"`
  - N ≥ 2 → `"{N} pessoas acabaram de comprar"`
- Sem nomes, sem cidades, sem timestamp relativo — mensagem genérica conforme decidido.

**Ciclo de exibição** (constantes no topo do arquivo, fáceis de ajustar):
```js
const PROVA_SOCIAL_MIN = 1;
const PROVA_SOCIAL_MAX = 5;
const DELAY_INICIAL_MS = 6000;   // antes da primeira exibição
const DURACAO_VISIVEL_MS = 8000; // quanto tempo fica visível
const INTERVALO_MIN_MS = 15000;  // pausa mínima entre exibições
const INTERVALO_MAX_MS = 25000;  // pausa máxima entre exibições
```
Fluxo: `setTimeout(mostrar, DELAY_INICIAL_MS)` → mostra por `DURACAO_VISIVEL_MS` → esconde → agenda próxima exibição após intervalo aleatório entre `INTERVALO_MIN_MS` e `INTERVALO_MAX_MS` → repete indefinidamente enquanto a aba estiver aberta. Não há persistência entre sessões/reloads (reinicia do zero a cada carregamento de página) e não há botão de fechar.

**Markup gerado dinamicamente via JS** (não fica hardcoded no HTML, pra não poluir o markup estático):
```html
<div class="social-toast" role="status" aria-live="polite">
  <span class="social-toast-text"></span>
</div>
```
Inserido uma vez no `<body>` (via `appendChild`) na inicialização; o texto interno é atualizado a cada ciclo. Visibilidade controlada por classe `.show` (opacity + transform), não por criar/destruir o elemento repetidamente.

**Estilo:**
- Canto inferior esquerdo, `position: fixed`, `z-index` alto (abaixo de eventuais modais futuros, acima do conteúdo normal).
- Fundo branco, sombra, borda arredondada, consistente com a paleta do site (`--verde`, `--linha`).
- Mobile: mesma posição, largura ajustada (`max-width` menor, fonte reduzida) via media query já existente (`@media (max-width:860px)`).
- Transição de entrada/saída: fade + leve translateY, mesma linguagem visual do `.reveal`.

## Acessibilidade (`prefers-reduced-motion: reduce`)

Dentro do bloco `@media (prefers-reduced-motion: reduce)` já existente no CSS:
- `.btn-pulse` → `animation: none`.
- `.social-toast` → transições de opacity/transform removidas (aparece/some instantaneamente, mas continua funcionando).
- `initContadores()` checa `window.matchMedia('(prefers-reduced-motion: reduce)').matches` em JS: se verdadeiro, define o `textContent` direto pro valor final, sem loop de animação.
- `initReveal()` já é coberto pela regra existente (`.reveal { opacity:1; transform:none; transition:none }`).

O toast usa `role="status" aria-live="polite"` para ser anunciado por leitores de tela sem interromper o que está sendo lido.

## Testes / verificação manual

Como é uma página estática sem framework de testes automatizados, a verificação será manual no navegador (Browser pane):
1. Recarregar a página e observar o reveal em sequência (stagger) ao rolar até `.peg-list`, `.mech-grid`, `.stack-grid`, `.faq`.
2. Rolar até a `.stripe` e confirmar que os 4 números contam de 0 até o valor final uma única vez (não repete ao rolar de novo).
3. Observar o pulso contínuo no botão `#checkout-btn` e confirmar que pausa no hover.
4. Aguardar ~6s no carregamento e confirmar que o toast aparece no canto inferior esquerdo com texto no formato correto (singular/plural), some após ~8s, e reaparece após um intervalo entre 15-25s com um novo número sorteado.
5. Testar em viewport mobile (Browser pane resize) para conferir o toast estreito e o reveal/stagger continuando a funcionar.
6. Simular `prefers-reduced-motion: reduce` (DevTools ou `resize_window` com emulação, se disponível) e confirmar que pulso/contador/toast não animam mas continuam funcionalmente presentes.
7. Confirmar que o clique nos botões `.btn-comprar` continua dispatando `fbq('trackCustom', 'CliqueBotaoComprar', ...)` (checar via `read_network_requests` ou console) e que a navegação para o link de checkout da Hotmart não foi afetada pela extração do script.
