# Design: Seção de Depoimentos (prova social com fotos reais)

**Data:** 2026-07-21
**Página afetada:** [index.html](../../../index.html)
**Contexto do produto:** ver [CONTEXTO-PRODUTO.md](../../../CONTEXTO-PRODUTO.md)

## Objetivo

Adicionar uma seção de depoimentos logo após o hero, mostrando as 4 fotos reais em `assets/Depoimento.01.jpg` a `assets/Depoimento.04.jpg` (pessoas segurando a própria CNH aprovada), com legendas que conectam a aprovação de cada uma aos tipos de pegadinha já apresentados na seção "O verdadeiro motivo das reprovações" da própria página.

## Escopo

Incluso:
- Nova seção `<section class="block depoimentos">` inserida entre o fechamento de `</header>` (hero) e a `<div class="stripe">` (faixa de números).
- Grid 2x2 com as 4 fotos existentes em `assets/`, responsivo (1 coluna no mobile).
- Copy: eyebrow, headline, subheadline e uma legenda por foto (ver seção Copy abaixo).
- Reveal-on-scroll com stagger, reaproveitando a infraestrutura já existente em `assets/interacoes.js` (Task 2 do plano anterior).

Fora do escopo (decidido durante o brainstorming):
- Nomes ou cidades das pessoas nas fotos — não existem dados reais disponíveis, e inventar seria desonesto. Sem nome, só legenda genérica.
- Citações em primeira pessoa atribuídas às pessoas fotografadas (não temos o texto real do que elas disseram) — usamos legendas em terceira pessoa/impessoais, no estilo de legenda/selo, não como fala entre aspas atribuída a alguém.
- Carrossel ou slider — grid fixo 2x2, sem JS de navegação.
- Qualquer novo componente JS — a única mudança em `assets/interacoes.js` é adicionar um seletor à lista já existente do `buildStaggerMap()`.

## Copy da seção

- **Eyebrow:** `Prova real`
- **Headline:** `Quem passou sem cair na <span class="y">pegadinha</span> esse mês.` (usa a classe `h2.big` e o padrão `<span class="y">` já existentes na página para destacar a palavra "pegadinha")
- **Subheadline:** `Fotos de quem estudou as armadilhas certas — e não caiu nelas na hora da prova.`
- **Selo por card:** `✓ Aprovado(a)`
- **Legendas** (uma por foto, na ordem dos arquivos, cada uma amarrada a um dos 4 tipos de pegadinha já citados em `.peg-list`):
  1. `Depoimento.01.jpg` → `Não caiu na pegadinha do "sempre" e "nunca".`
  2. `Depoimento.02.jpg` → `Não trocou o sentido da pergunta no "exceto".`
  3. `Depoimento.03.jpg` → `Não confundiu a placa de proibição com a de advertência.`
  4. `Depoimento.04.jpg` → `Não marcou a alternativa quase certa.`
- **Alt text das imagens** (mesmo texto para as 4, descritivo e honesto, sem inventar nome): `Pessoa aprovada mostrando a CNH recém-tirada.`

## Arquitetura / Markup

Estrutura HTML por card:

```html
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
```

Posição exata: logo após a tag de fechamento `</header>` do hero, imediatamente antes de `<!-- FAIXA DE NÚMEROS -->` / `<div class="stripe">`.

Reutiliza classes já existentes na página (`block`, `eyebrow sec-eyebrow`, `h2.big`, `.y`, `lead`, `reveal`) — nenhuma dessas precisa de CSS novo.

## CSS novo

Adicionar após o bloco de regras `.peg-list` / `.peg-item` (mesma vizinhança visual/temática):

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

## Responsividade (mobile)

**Requisito explícito do usuário: os cards de depoimento devem ficar responsivos no mobile.**

Adicionar `.depo-grid` à lista de seletores já existente dentro do bloco `@media (max-width:860px)` que hoje colapsa `.peg-list` e `.mech-grid` para uma coluna:

```css
.peg-list,
.mech-grid,
.depo-grid {
  grid-template-columns: 1fr
}
```

Isso garante que, abaixo de 860px de largura, os 4 cards empilham em uma única coluna (mesmo comportamento já validado para as outras grades da página), com a foto ocupando a largura total do card e mantendo a proporção quadrada via `aspect-ratio: 1/1` (não depende de media query — funciona em qualquer largura).

## Reveal com stagger

Em `assets/interacoes.js`, a função `buildStaggerMap()` (já existente) mantém uma lista de seletores de grupos. Adicionar `'.depo-grid > .reveal'` a essa lista, na mesma posição/formato dos seletores já existentes:

```js
const grupos = [
  '.depo-grid > .reveal',
  '.peg-list > .reveal',
  '.mech-grid > .reveal',
  '.stack-grid > .reveal',
  '.faq .faq-item.reveal'
];
```

Nenhuma outra mudança em JS é necessária — o `IntersectionObserver` já existente em `initReveal()` passa a observar também os 4 novos `.depo-item.reveal` automaticamente, porque a função já faz `document.querySelectorAll('.reveal').forEach(...)`.

## Acessibilidade

- `alt` descritivo em todas as 4 imagens (texto fixo, sem inventar nome/identidade).
- `loading="lazy"` nas imagens, já que a seção fica abaixo da dobra em telas menores e as imagens são relativamente grandes (fotos de celular).
- Contraste do selo "✓ Aprovado(a)" (`--verde` sobre `--verde-luz`) já é o mesmo par de cores usado em `.flag` na seção de stack, portanto já validado na página.

## Testes / verificação manual

Sem framework de testes automatizado neste projeto. Verificação manual via Browser pane:
1. Confirmar que a seção aparece imediatamente após o hero e antes da faixa de números amarela.
2. Confirmar que as 4 fotos carregam (sem 404) e mantêm proporção quadrada sem distorcer.
3. Rolar até a seção e confirmar que os 4 cards aparecem em sequência (stagger 0/80/160/240ms), igual às outras grades da página.
4. Redimensionar para viewport mobile (Browser pane) e confirmar que os cards empilham em 1 coluna, sem overflow horizontal e sem cortar texto da legenda.
5. Verificar que nenhum nome, cidade ou citação em primeira pessoa foi introduzido nas legendas — apenas o texto definido nesta spec.
