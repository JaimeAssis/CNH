# Seção de Depoimentos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma seção de depoimentos com as 4 fotos reais de `assets/Depoimento.01.jpg`–`04.jpg` logo após o hero de `index.html`, com legendas amarradas aos tipos de pegadinha já apresentados na página, responsiva no mobile e com o mesmo reveal-com-stagger já usado no resto do site.

**Architecture:** Uma nova `<section class="block depoimentos">` inserida entre `</header>` e `<div class="stripe">` em `index.html`, com CSS novo reaproveitando os tokens de design existentes (`--branco`, `--linha`, `--verde`, `--verde-luz`, `--cinza`), e uma única linha adicionada à lista de seletores do `buildStaggerMap()` já existente em `assets/interacoes.js` para o reveal funcionar nos novos cards sem nenhuma lógica JS nova.

**Tech Stack:** HTML/CSS/JS vanilla (mesmo stack do resto do projeto), sem dependências novas.

## Global Constraints

- Não introduzir dependências externas — projeto é HTML/CSS/JS puro servido como arquivo estático.
- Não inventar nomes, cidades ou citações em primeira pessoa para as pessoas nas fotos — apenas o texto definido na spec (sem dados reais disponíveis).
- Alt text fixo e idêntico nas 4 imagens: `Pessoa aprovada mostrando a CNH recém-tirada.`
- A seção deve ficar responsiva no mobile: cards em 1 coluna abaixo de 860px, reaproveitando o breakpoint `@media (max-width:860px)` já existente (não criar um novo breakpoint).
- Reveal-on-scroll dos novos cards deve reaproveitar `buildStaggerMap()` já existente em `assets/interacoes.js` — não duplicar a lógica do `IntersectionObserver`.
- Projeto não tem framework de testes automatizados. Verificação é manual via Browser pane.
- Referência completa: [CONTEXTO-PRODUTO.md](../../../CONTEXTO-PRODUTO.md). Spec completa: [2026-07-21-secao-depoimentos-design.md](../specs/2026-07-21-secao-depoimentos-design.md).

---

### Task 1: Seção de depoimentos (HTML + CSS + integração com o stagger)

**Files:**
- Modify: `index.html` (novo `<section class="block depoimentos">` entre `</header>` e `<div class="stripe">`; novo bloco CSS `.depo-grid`/`.depo-item`/`.depo-selo`; adicionar `.depo-grid` à regra existente dentro de `@media (max-width:860px)`)
- Modify: `assets/interacoes.js` (adicionar `'.depo-grid > .reveal'` à lista `grupos` dentro de `buildStaggerMap()`)

**Interfaces:**
- Consumes: classes CSS já existentes (`block`, `eyebrow sec-eyebrow`, `h2.big`, `.y`, `lead`, `reveal`) e a função `buildStaggerMap()`/`initReveal()` já existente em `assets/interacoes.js` — não precisa entender a implementação interna delas, só adicionar um seletor à lista `grupos`.
- Produces: nenhuma interface nova para outras tarefas (esta é a única tarefa do plano).

- [ ] **Step 1: Inserir a seção de depoimentos em `index.html`, logo após o fechamento do `<header class="hero">`**

Localize o final do bloco do hero em `index.html`:

```html
      <div class="signs" aria-hidden="true">
        <div class="sign sign-reg">
          <div class="bar"></div>
        </div>
        <div class="sign sign-adv"><span>!</span></div>
        <div class="sign-tag">Você sabe qual proíbe e qual avisa?</div>
      </div>
    </div>
  </header>
```

Insira imediatamente depois de `</header>` (e antes do comentário `<!-- FAIXA DE NÚMEROS -->` / `<div class="stripe">`):

```html

  <!-- DEPOIMENTOS -->
  <section class="block depoimentos">
    <div class="wrap">
      <div class="eyebrow sec-eyebrow reveal">Prova real</div>
      <h2 class="big reveal">Quem passou sem cair na <span class="y">pegadinha</span> esse mês.</h2>
      <p class="lead reveal">Fotos de quem estudou as armadilhas certas — e não caiu nelas na hora da prova.</p>
      <div class="depo-grid">
        <div class="depo-item reveal">
          <img src="assets/Depoimento.01.jpg" alt="Pessoa aprovada mostrando a CNH recém-tirada." loading="lazy">
          <span class="depo-selo">✓ Aprovado(a)</span>
          <p>Não caiu na pegadinha do "sempre" e "nunca".</p>
        </div>
        <div class="depo-item reveal">
          <img src="assets/Depoimento.02.jpg" alt="Pessoa aprovada mostrando a CNH recém-tirada." loading="lazy">
          <span class="depo-selo">✓ Aprovado(a)</span>
          <p>Não trocou o sentido da pergunta no "exceto".</p>
        </div>
        <div class="depo-item reveal">
          <img src="assets/Depoimento.03.jpg" alt="Pessoa aprovada mostrando a CNH recém-tirada." loading="lazy">
          <span class="depo-selo">✓ Aprovado(a)</span>
          <p>Não confundiu a placa de proibição com a de advertência.</p>
        </div>
        <div class="depo-item reveal">
          <img src="assets/Depoimento.04.jpg" alt="Pessoa aprovada mostrando a CNH recém-tirada." loading="lazy">
          <span class="depo-selo">✓ Aprovado(a)</span>
          <p>Não marcou a alternativa quase certa.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FAIXA DE NÚMEROS -->
```

Note: the `<!-- FAIXA DE NÚMEROS -->` comment line above already exists right after `</header>` in the current file — do not duplicate it. The new section goes between `</header>` and that existing comment; the snippet above shows the boundary for orientation only.

- [ ] **Step 2: Adicionar o CSS novo em `index.html`, logo após o bloco de regras `.peg-item.red`**

Localize:

```css
    .peg-item.red {
      border-left-color: var(--pare)
    }
```

Adicione logo abaixo:

```css
    .depo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 34px
    }

    .depo-item {
      background: var(--branco);
      border: 1px solid var(--linha);
      border-radius: 12px;
      overflow: hidden;
      text-align: center
    }

    .depo-item img {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      display: block
    }

    .depo-selo {
      display: inline-block;
      margin-top: 14px;
      font-family: var(--eyebrow);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      font-size: 11px;
      color: var(--verde);
      background: var(--verde-luz);
      padding: 4px 10px;
      border-radius: 20px
    }

    .depo-item p {
      padding: 10px 16px 20px;
      font-size: 14.5px;
      color: var(--cinza)
    }
```

- [ ] **Step 3: Tornar a grade responsiva no mobile — adicionar `.depo-grid` à regra existente dentro de `@media (max-width:860px)`**

Localize, dentro do bloco `@media (max-width:860px) { ... }` já existente em `index.html`:

```css
      .peg-list,
      .mech-grid {
        grid-template-columns: 1fr
      }
```

Substitua por (adiciona `.depo-grid` à mesma regra, sem criar um novo bloco de media query):

```css
      .peg-list,
      .mech-grid,
      .depo-grid {
        grid-template-columns: 1fr
      }
```

- [ ] **Step 4: Integrar com o reveal-com-stagger em `assets/interacoes.js`**

Localize a função `buildStaggerMap()`:

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
```

Substitua a lista `grupos` para incluir o novo seletor no início:

```js
function buildStaggerMap() {
  const grupos = [
    '.depo-grid > .reveal',
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
```

Nenhuma outra função em `assets/interacoes.js` precisa mudar — `initReveal()` já observa todo elemento `.reveal` da página, incluindo os 4 novos `.depo-item.reveal`.

- [ ] **Step 5: Verificar manualmente no Browser pane**

Este projeto não tem servidor de dev configurado por padrão para abrir `index.html` com JS funcional — arquivos `file://` fora de um servidor renderizam como snapshot estático no Browser pane. Use o `.claude/launch.json` já existente no projeto (configuração `static-server`, roda `node .claude/static-server.js` na porta 8934) via `preview_start` com `{ name: "static-server" }`, depois `navigate` para `http://localhost:8934/`.

Expected, na ordem:
1. A seção "Quem passou sem cair na pegadinha esse mês." aparece imediatamente após o hero (fundo escuro) e antes da faixa amarela de números — confirme com `read_page` ou uma screenshot que a ordem visual é: hero → depoimentos → faixa de números.
2. As 4 imagens carregam sem erro 404 (`read_network_requests` mostrando `assets/Depoimento.0N.jpg` com status 200) e aparecem quadradas, sem distorcer.
3. Rolando até a seção, os 4 cards `.depo-item` recebem `transition-delay` de `0ms`, `80ms`, `160ms` e `240ms` nessa ordem (pode confirmar via `javascript_tool`: `Array.from(document.querySelectorAll('.depo-grid > .reveal')).map(el => el.style.transitionDelay)` deve retornar `["0ms","80ms","160ms","240ms"]` depois que a seção entrar na viewport).
4. Redimensionar para mobile (`resize_window` com `preset: mobile`) e confirmar visualmente (screenshot) que os 4 cards empilham em 1 coluna, sem overflow horizontal, com a legenda legível abaixo de cada foto.
5. Confirmar que nenhuma outra seção da página (faixa de números, stack, oferta, FAQ) foi afetada — a página deve rolar normalmente do topo ao rodapé sem quebras de layout.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/interacoes.js
git commit -m "Adiciona seção de depoimentos com fotos reais após o hero"
```
